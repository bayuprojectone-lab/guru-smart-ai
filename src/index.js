/**
 * GURU SMART AI - Cloudflare Worker
 * Supabase is the live source of truth. D1 is an independent, append-preserving
 * replica/backup. Scheduled sync runs in Cloudflare, not on the user's PC.
 */
const TABLES = [
  'users', 'avatars', 'piket', 'attendance', 'activity_records',
  'students', 'school_profile', 'activity_attendance', 'kuis_kelas', 'kuis_buzzer'
];
const PAGE_SIZE = 500;
const MAX_PAGES_PER_TABLE = 200;
const now = () => new Date().toISOString();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rowKey(row) {
  // All configured GURU SMART tables are expected to have a stable `id`.
  // Hash fallback prevents a hard failure, but rows without IDs should be reviewed.
  if (row && row.id !== undefined && row.id !== null) return String(row.id);
  return null;
}

async function writeRun(db, values) {
  return db.prepare(`INSERT INTO sync_runs
    (started_at, finished_at, status, tables_total, rows_copied, message)
    VALUES (?, ?, ?, ?, ?, ?) RETURNING id`)
    .bind(values.started_at, values.finished_at || null, values.status,
      values.tables_total || TABLES.length, values.rows_copied || 0,
      String(values.message || '').slice(0, 2000)).first();
}

async function updateRun(db, id, values) {
  await db.prepare(`UPDATE sync_runs SET finished_at=?, status=?, rows_copied=?, message=? WHERE id=?`)
    .bind(values.finished_at || now(), values.status, values.rows_copied || 0,
      String(values.message || '').slice(0, 2000), id).run();
}

async function syncTable(env, table) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Secret SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum dipasang.');
  let offset = 0;
  let copied = 0;
  let page = 0;
  while (page < MAX_PAGES_PER_TABLE) {
    const url = `${base}/rest/v1/${encodeURIComponent(table)}?select=*&order=id.asc`;
    const response = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        'Range-Unit': 'items',
        Range: `${offset}-${offset + PAGE_SIZE - 1}`
      },
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Supabase ${table}: HTTP ${response.status} ${detail}`);
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error(`Respons tabel ${table} bukan array.`);
    if (rows.length === 0) break;

    const statements = [];
    for (const row of rows) {
      const keyValue = rowKey(row);
      if (keyValue === null) {
        // Do not silently lose rows without a stable primary key.
        throw new Error(`Tabel ${table} memiliki baris tanpa kolom id. Atur primary key sebelum sinkronisasi.`);
      }
      const payload = JSON.stringify(row);
      const hash = await sha256(payload);
      statements.push(env.DB.prepare(`INSERT INTO replica_rows
        (table_name, row_key, payload, payload_hash, source_updated_at, first_seen_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(table_name, row_key) DO UPDATE SET
          payload=excluded.payload,
          payload_hash=excluded.payload_hash,
          source_updated_at=excluded.source_updated_at,
          last_seen_at=excluded.last_seen_at`)
        .bind(table, keyValue, payload, hash,
          row.updated_at || row.modified_at || null, now(), now()));
    }
    // Chunk writes to keep each D1 batch comfortably below platform limits.
    for (let i = 0; i < statements.length; i += 50) {
      await env.DB.batch(statements.slice(i, i + 50));
    }
    copied += rows.length;
    offset += rows.length;
    page += 1;
    if (rows.length < PAGE_SIZE) return copied;
  }
  if (page >= MAX_PAGES_PER_TABLE) {
    throw new Error(`Tabel ${table} melewati batas ${MAX_PAGES_PER_TABLE * PAGE_SIZE} baris per proses; tingkatkan batas dengan hati-hati.`);
  }
  return copied;
}

async function runSync(env) {
  if (!env.DB) throw new Error('Binding D1 DB belum dikonfigurasi.');
  const started = now();
  const run = await writeRun(env.DB, { started_at: started, status: 'running', tables_total: TABLES.length });
  let total = 0;
  const results = [];
  try {
    for (const table of TABLES) {
      const count = await syncTable(env, table);
      total += count;
      results.push(`${table}: ${count}`);
    }
    await updateRun(env.DB, run.id, {
      status: 'success', rows_copied: total,
      message: `Selesai; ${results.join(', ')}`
    });
    return { ok: true, rows_copied: total, tables: results, finished_at: now() };
  } catch (error) {
    await updateRun(env.DB, run.id, {
      status: 'failed', rows_copied: total,
      message: `${error.message}; sudah tersalin sebagian: ${results.join(', ')}`
    });
    throw error;
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runSync(env).catch(error => console.error('[GURU SMART sync failed]', error)));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
      if (url.pathname === '/api/health' && request.method === 'GET') {
        try {
          await env.DB.prepare('SELECT 1 AS ok').first();
          return json({ ok: true, service: 'guru-smart-api', database: 'connected', timestamp: now() });
        } catch {
          return json({ ok: false, service: 'guru-smart-api', database: 'error' }, 503);
        }
      }
      if (url.pathname === '/api/sync/status' && request.method === 'GET') {
        try {
          const latest = await env.DB.prepare(`SELECT started_at, finished_at, status,
            tables_total, rows_copied, message FROM sync_runs ORDER BY id DESC LIMIT 1`).first();
          return json({ ok: true, latest: latest || null, schedule: 'every 15 minutes', source: 'Supabase', replica: 'Cloudflare D1' });
        } catch {
          return json({ ok: false, error: 'Status sinkronisasi belum tersedia. Jalankan schema D1.' }, 503);
        }
      }
      if (url.pathname === '/api/audit' && request.method === 'POST') {
        if (!env.DB) return json({ ok: false, error: 'D1 binding DB belum dikonfigurasi' }, 503);
        let body;
        try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON tidak valid' }, 400); }
        const action = String(body.action || '').slice(0, 100);
        const actor = String(body.actor || 'unknown').slice(0, 120);
        if (!action) return json({ ok: false, error: 'action wajib diisi' }, 400);
        await env.DB.prepare('INSERT INTO audit_logs (actor, action, detail, created_at) VALUES (?, ?, ?, ?)')
          .bind(actor, action, JSON.stringify(body.detail ?? {}), now()).run();
        return json({ ok: true });
      }
      return json({ ok: false, error: 'API route tidak ditemukan' }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};

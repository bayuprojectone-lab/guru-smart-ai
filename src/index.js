const VERSION = "2.0.0-d1";
const LEGACY_TABLES = new Set(["users", "avatars", "kuis_buzzer"]);
const TABLE_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

function response(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8", "cache-control": "no-store",
    "x-content-type-options": "nosniff", "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization, apikey",
    "vary": "Origin"
  }});
}
function safeOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin) || /^https:\/\/[a-z0-9.-]+\.pages\.dev$/i.test(origin) || /^https:\/\/.*\.workers\.dev$/i.test(origin)) return origin;
  return "*";
}
async function verifyUser(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: "Sesi login tidak ditemukan. Silakan login ulang.", status: 401 };
  const base = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = String(env.SUPABASE_ANON_KEY || "").trim();
  if (!base || !key) return { error: "Worker belum dikonfigurasi: SUPABASE_URL dan SUPABASE_ANON_KEY diperlukan untuk memverifikasi sesi login.", status: 503 };
  try {
    const r = await fetch(base + "/auth/v1/user", { headers: { Authorization: "Bearer " + token, apikey: key }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return { error: "Sesi login tidak valid atau kedaluwarsa. Silakan login ulang.", status: 401 };
    const u = await r.json();
    if (!u || !u.id) return { error: "Identitas pengguna tidak dapat diverifikasi.", status: 401 };
    return { user: u };
  } catch (_) { return { error: "Layanan autentikasi tidak dapat dihubungi. Coba lagi sebentar.", status: 503 }; }
}
function parseFilterValue(v) { return v; }
function matches(row, filters) {
  return filters.every(f => {
    const a = row?.[f.column], b = f.value;
    switch (f.op) {
      case "eq": return String(a ?? "") === String(b ?? "");
      case "neq": return String(a ?? "") !== String(b ?? "");
      case "gt": return a > b; case "gte": return a >= b; case "lt": return a < b; case "lte": return a <= b;
      case "is": return b === null ? a == null : a === b;
      case "in": return Array.isArray(b) && b.some(x => String(x) === String(a));
      case "contains":
        if (Array.isArray(a)) return Array.isArray(b) ? b.every(x => a.includes(x)) : a.includes(b);
        if (a && b && typeof a === "object" && typeof b === "object") return Object.keys(b).every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]));
        return String(a ?? "").includes(String(b ?? ""));
      case "match": return b && typeof b === "object" && Object.keys(b).every(k => String(row?.[k] ?? "") === String(b[k] ?? ""));
      case "like": case "ilike": {
        const esc = String(b ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
        try { return new RegExp("^" + esc + "$", f.op === "ilike" ? "i" : "").test(String(a ?? "")); } catch (_) { return false; }
      }
      default: return true;
    }
  });
}
function project(row, columns) {
  if (!columns || columns === "*" || columns.includes("(")) return row;
  const keys = columns.split(",").map(x => x.trim()).filter(x => /^[a-zA-Z0-9_]+$/.test(x));
  if (!keys.length) return row;
  const out = {}; for (const k of keys) if (Object.prototype.hasOwnProperty.call(row, k)) out[k] = row[k];
  return out;
}
async function queryD1(request, env, user) {
  if (!env.DB) return response({ error: "Binding D1 belum aktif. Buat database D1, isi database_id di wrangler.toml, lalu deploy ulang." }, 503, safeOrigin(request));
  let body;
  try { body = await request.json(); } catch (_) { return response({ error: "Body JSON tidak valid." }, 400, safeOrigin(request)); }
  const table = String(body.table || "");
  if (!TABLE_RE.test(table) || LEGACY_TABLES.has(table)) return response({ error: "Nama tabel tidak diizinkan untuk D1." }, 400, safeOrigin(request));
  const op = String(body.op || "select");
  const uid = user.id;
  const origin = safeOrigin(request);
  try {
    const all = await env.DB.prepare("SELECT record_id, data_json, created_at, updated_at FROM app_records WHERE table_name = ? AND user_id = ?").bind(table, uid).all();
    let rows = (all.results || []).map(r => { try { return JSON.parse(r.data_json); } catch (_) { return {}; } });
    const filters = Array.isArray(body.filters) ? body.filters : [];
    if (op === "select") {
      rows = rows.filter(r => matches(r, filters));
      for (const o of (body.order || []).slice().reverse()) rows.sort((a,b) => { const av=a?.[o.column], bv=b?.[o.column]; const cmp=av==null?(bv==null?0:-1):bv==null?1:(typeof av === "number" && typeof bv === "number" ? av-bv : String(av).localeCompare(String(bv), "id")); return o.ascending === false ? -cmp : cmp; });
      if (Number.isInteger(body.limit) && body.limit >= 0) rows = rows.slice(0, body.limit);
      rows = rows.map(r => project(r, String(body.columns || "*")));
      if (body.single === "maybeSingle") return response({ data: rows[0] || null, error: null }, 200, origin);
      if (body.single === "single") return rows.length === 1 ? response({ data: rows[0], error: null }, 200, origin) : response({ data: null, error: { message: "Expected exactly one row", code: "PGRST116" } }, 200, origin);
      return response({ data: rows, error: null }, 200, origin);
    }
    if (op === "insert" || op === "upsert") {
      const incoming = Array.isArray(body.values) ? body.values : [body.values || {}];
      const returned = [];
      for (const raw of incoming) {
        const value = { ...(raw || {}) };
        value.user_id = uid;
        if (!value.id) value.id = crypto.randomUUID();
        const id = String(value.id);
        let existing = await env.DB.prepare("SELECT record_id FROM app_records WHERE table_name = ? AND user_id = ? AND record_id = ?").bind(table, uid, id).first();
        if (op === "upsert" && !existing && body.onConflict) {
          const keys = String(body.onConflict).split(",").map(x => x.trim()).filter(Boolean);
          if (keys.length) {
            const found = rows.find(r => keys.every(k => String(r[k] ?? "") === String(value[k] ?? "")));
            if (found) existing = { record_id: String(found.id) };
          }
        }
        const targetId = existing ? String(existing.record_id) : id;
        await env.DB.prepare("INSERT INTO app_records (table_name,user_id,record_id,data_json,created_at,updated_at) VALUES (?,?,?,?,datetime('now'),datetime('now')) ON CONFLICT(table_name,user_id,record_id) DO UPDATE SET data_json=excluded.data_json, updated_at=datetime('now')").bind(table, uid, targetId, JSON.stringify({ ...value, id: targetId })).run();
        returned.push({ ...value, id: targetId });
      }
      return response({ data: body.returning === false ? null : returned, error: null }, 200, origin);
    }
    if (op === "update") {
      const values = body.values && typeof body.values === "object" ? body.values : {};
      const matched = rows.filter(r => matches(r, filters)); const returned = [];
      for (const row of matched) {
        const next = { ...row, ...values, id: row.id, user_id: uid };
        await env.DB.prepare("UPDATE app_records SET data_json=?, updated_at=datetime('now') WHERE table_name=? AND user_id=? AND record_id=?").bind(JSON.stringify(next), table, uid, String(row.id)).run();
        returned.push(next);
      }
      return response({ data: body.returning === false ? null : returned, error: null }, 200, origin);
    }
    if (op === "delete") {
      const matched = rows.filter(r => matches(r, filters));
      for (const row of matched) await env.DB.prepare("DELETE FROM app_records WHERE table_name=? AND user_id=? AND record_id=?").bind(table, uid, String(row.id)).run();
      return response({ data: null, error: null }, 200, origin);
    }
    return response({ error: "Operasi database tidak didukung." }, 400, origin);
  } catch (e) {
    console.error("D1 query error", e);
    return response({ error: "Operasi D1 gagal. Pastikan migrasi database sudah dijalankan.", detail: String(e?.message || e) }, 500, origin);
  }
}
export default {
  async fetch(request, env) {
    const origin = safeOrigin(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": origin, "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization, apikey", "access-control-max-age": "86400", "vary": "Origin"
    }});
    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/api")) return response({ ok:true, service:"GURU SMART SIBI D1 API", version:VERSION, endpoints:["/api/health","/api/d1-health","/api/db/query"] }, 200, origin);
    if (request.method === "GET" && url.pathname === "/api/health") return response({ ok:true, worker:"online", version:VERSION, timestamp:new Date().toISOString(), d1_bound:!!env.DB }, 200, origin);
    if (request.method === "GET" && url.pathname === "/api/d1-health") {
      if (!env.DB) return response({ ok:false, d1:"not_configured", message:"Binding D1 belum dikonfigurasi." }, 503, origin);
      try { const r=await env.DB.prepare("SELECT COUNT(*) AS count FROM app_records").first(); return response({ ok:true, d1:"connected", records:r?.count||0, version:VERSION }, 200, origin); }
      catch (_) { return response({ ok:false, d1:"migration_required", message:"Database terhubung, tetapi migrasi belum dijalankan." }, 503, origin); }
    }
    if (request.method === "POST" && url.pathname === "/api/db/query") {
      const verified = await verifyUser(request, env);
      if (verified.error) return response({ error:verified.error }, verified.status, origin);
      return queryD1(request, env, verified.user);
    }
    if (url.pathname.startsWith("/api/")) return response({ error:"API route tidak ditemukan" }, 404, origin);
    return response({ ok:false, error:"Not found" }, 404, origin);
  }
};

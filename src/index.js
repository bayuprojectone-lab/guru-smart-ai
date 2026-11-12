const VERSION = "3.0.0-drive";
const LEGACY_TABLES = new Set(["users", "avatars", "kuis_buzzer"]);
const TABLE_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

const PRIVACY_HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow">
<meta name="description" content="Kebijakan Privasi GURU SMART AI PRO.">
<title>Kebijakan Privasi — GURU SMART AI PRO</title>
<style>
:root{color-scheme:light;--ink:#172033;--muted:#586579;--line:#e3e8f0;--brand:#2457d6;--bg:#f5f7fb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.7 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
header{background:linear-gradient(125deg,#101c3b,#2457d6);color:#fff;padding:42px 20px}
header .inner,main{max-width:900px;margin:auto}header p{margin:8px 0 0;color:#dce6ff}
main{padding:28px 18px 56px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:clamp(20px,4vw,36px);box-shadow:0 10px 30px #18294a0b}
h1{font-size:clamp(27px,4vw,38px);line-height:1.2;margin:0}h2{font-size:21px;margin:30px 0 8px}p,li{color:#354258}ul{padding-left:24px}a{color:var(--brand);overflow-wrap:anywhere}.updated{font-size:14px;color:#e0e9ff}
.notice{background:#f0f5ff;border-left:4px solid var(--brand);padding:14px 16px;border-radius:8px;margin:18px 0}
footer{color:var(--muted);font-size:13px;text-align:center;padding:22px}
</style>
</head>
<body>
<header><div class="inner"><h1>Kebijakan Privasi</h1><p><strong>GURU SMART AI PRO</strong></p><p class="updated">Terakhir diperbarui: 8 November 2026</p></div></header>
<main><article class="card">
<p>Kebijakan Privasi ini menjelaskan bagaimana GURU SMART AI PRO (“Aplikasi”) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi ketika guru, tenaga kependidikan, siswa, atau administrator menggunakan Aplikasi.</p>
<div class="notice"><strong>Ringkasan:</strong> Aplikasi digunakan untuk mendukung kegiatan pendidikan dan administrasi sekolah. Data digunakan untuk menyediakan fitur aplikasi, tidak dijual kepada pihak lain, dan akses Google Drive hanya dilakukan setelah pengguna menghubungkan akun Google miliknya.</div>

<h2>1. Informasi yang dapat diproses</h2>
<p>Bergantung pada fitur yang digunakan dan data yang dimasukkan oleh sekolah/pengguna, Aplikasi dapat memproses:</p>
<ul>
<li>Informasi akun dan autentikasi, seperti ID pengguna, alamat email, serta informasi sesi login.</li>
<li>Data pendidikan dan administrasi yang dimasukkan ke Aplikasi, seperti profil sekolah, data guru, data siswa, kelas, mata pelajaran, kehadiran, nilai, rapor, sertifikat, dan dokumen terkait.</li>
<li>Foto, tanda tangan, logo, stempel, berkas, serta konten lain yang diunggah pengguna.</li>
<li>Informasi teknis minimum untuk menjalankan, mengamankan, memelihara, dan mendiagnosis layanan, seperti waktu permintaan, status layanan, serta catatan kesalahan.</li>
<li>Data yang diperlukan untuk fitur AI apabila pengguna secara aktif mengirimkan pertanyaan, instruksi, atau materi ke fitur tersebut.</li>
</ul>

<h2>2. Cara informasi digunakan</h2>
<p>Informasi digunakan untuk menyediakan dan mengoperasikan fitur pendidikan dan administrasi, mengelola akun dan hak akses, menampilkan atau menghasilkan dokumen, menjalankan pencadangan dan pemulihan data, menjaga keamanan, memperbaiki gangguan, serta menanggapi permintaan dukungan.</p>

<h2>3. Penyimpanan dan penyedia layanan</h2>
<p>Aplikasi dapat menggunakan layanan pihak ketiga berikut untuk menjalankan fungsinya:</p>
<ul>
<li><strong>Supabase:</strong> autentikasi, database, dan penyimpanan berkas sesuai konfigurasi proyek.</li>
<li><strong>Cloudflare:</strong> menjalankan layanan backend/Worker dan, jika dikonfigurasi, database D1 sebagai penyimpanan tambahan.</li>
<li><strong>Google OAuth dan Google Drive:</strong> menghubungkan akun Google milik pengguna dan menyimpan atau memulihkan berkas backup yang diminta pengguna.</li>
<li><strong>Penyedia layanan AI:</strong> jika fitur AI digunakan, teks atau materi yang dipilih/dikirim pengguna dapat diproses oleh penyedia AI yang dikonfigurasi untuk menghasilkan jawaban.</li>
</ul>
<p>Penyedia tersebut memproses data sesuai fungsi layanan dan ketentuan privasi masing-masing. Aplikasi tidak mengklaim bahwa seluruh data selalu disimpan hanya pada satu layanan atau satu negara.</p>

<h2>4. Penggunaan Google Drive</h2>
<p>Pengguna dapat memilih untuk menghubungkan akun Google pribadi atau akun Google Workspace miliknya. Setelah pengguna memberikan izin melalui halaman persetujuan Google:</p>
<ul>
<li>Aplikasi menggunakan izin Google Drive yang diminta pada layar persetujuan, termasuk cakupan <code>drive.file</code> jika cakupan tersebut yang dikonfigurasi.</li>
<li>Aplikasi menggunakan akses tersebut untuk membuat, mengelola, menampilkan, mengunduh, atau memulihkan file backup yang dibuat atau dibuka melalui Aplikasi.</li>
<li>File backup disimpan pada Google Drive akun yang dihubungkan oleh pengguna. Kuota penyimpanan Google Drive tetap mengikuti kapasitas akun Google pengguna.</li>
<li>Token penyegaran Google yang diperlukan untuk menjaga koneksi disimpan oleh backend dalam bentuk terenkripsi. Token tidak dimaksudkan untuk ditampilkan kepada pengguna lain.</li>
<li>Pengguna dapat memutuskan koneksi Google melalui pengaturan integrasi di Aplikasi atau mencabut izin Aplikasi melalui pengaturan keamanan akun Google.</li>
</ul>
<p>Aplikasi tidak menggunakan data Google untuk iklan, tidak menjual data Google, dan tidak mengizinkan manusia membaca data Google kecuali diperlukan untuk dukungan yang diminta pengguna, keamanan, pemenuhan kewajiban hukum, atau penanganan penyalahgunaan.</p>

<h2>5. Pembagian informasi</h2>
<p>Aplikasi tidak menjual atau menyewakan informasi pribadi. Informasi dapat diproses oleh penyedia infrastruktur yang disebutkan di atas, dibagikan sesuai tindakan pengguna (misalnya membuat tautan rapor atau dokumen yang dapat diakses penerima), atau diungkapkan jika diwajibkan oleh hukum maupun diperlukan untuk melindungi keamanan dan hak pengguna.</p>

<h2>6. Keamanan</h2>
<p>Langkah perlindungan yang diterapkan dapat mencakup autentikasi pengguna, pembatasan akses berdasarkan akun, komunikasi terenkripsi melalui HTTPS, dan enkripsi token integrasi di sisi server. Tidak ada metode transmisi atau penyimpanan elektronik yang dapat dijamin 100% aman. Pengguna harus menjaga kerahasiaan kata sandi dan perangkatnya.</p>

<h2>7. Masa penyimpanan dan penghapusan</h2>
<p>Data disimpan selama diperlukan untuk menyediakan layanan, memenuhi kebutuhan operasional sekolah, atau memenuhi kewajiban hukum. Pengguna atau administrator sekolah dapat meminta koreksi atau penghapusan data melalui pengelola Aplikasi/sekolah. Menghapus data dari Aplikasi tidak selalu otomatis menghapus salinan backup yang sudah tersimpan di Google Drive; file backup tersebut perlu dihapus secara terpisah oleh pemilik Drive. Salinan pada sistem penyedia layanan dapat mengikuti kebijakan retensi dan backup penyedia tersebut.</p>

<h2>8. Data siswa dan tanggung jawab sekolah</h2>
<p>Aplikasi dapat memproses data siswa yang dimasukkan oleh sekolah atau guru yang berwenang. Sekolah dan pengguna bertanggung jawab memastikan bahwa pengumpulan dan penggunaan data siswa memiliki dasar yang sah, memperoleh persetujuan atau pemberitahuan yang diwajibkan, membatasi data yang dimasukkan, serta memberikan akses hanya kepada pihak yang berwenang. Jangan memasukkan informasi yang tidak diperlukan untuk tujuan pendidikan.</p>

<h2>9. Privasi anak</h2>
<p>Aplikasi merupakan alat pendukung pendidikan yang dapat memuat data siswa. Aplikasi tidak ditujukan agar anak membuat akun Google Drive sendiri untuk keperluan backup sekolah. Pengelolaan akun, izin, dan data siswa dilakukan oleh sekolah atau orang dewasa yang berwenang sesuai hukum yang berlaku.</p>

<h2>10. Pilihan dan hak pengguna</h2>
<p>Pengguna dapat memeriksa dan memperbarui data melalui fitur yang tersedia sesuai hak aksesnya, memilih apakah akan menghubungkan Google Drive, memutuskan koneksi Google, serta mengajukan permintaan akses, koreksi, atau penghapusan kepada administrator sekolah/pengelola Aplikasi.</p>

<h2>11. Perubahan kebijakan</h2>
<p>Kebijakan ini dapat diperbarui apabila fitur, penyedia layanan, atau ketentuan hukum berubah. Versi terbaru akan dipublikasikan pada halaman ini beserta tanggal pembaruannya.</p>

<h2>12. Kontak</h2>
<p>Untuk pertanyaan, permintaan, atau keluhan terkait privasi, hubungi administrator sekolah atau pengelola GURU SMART AI PRO melalui kanal dukungan resmi yang diberikan kepada pengguna Aplikasi.</p>

<hr style="border:0;border-top:1px solid var(--line);margin:28px 0">
<h2>English summary</h2>
<p>GURU SMART AI PRO processes account details and education/administrative content submitted by authorized users to provide its school-management features. Depending on enabled features, data may be handled by Supabase, Cloudflare, Google OAuth/Drive, and the configured AI service. Google Drive is connected only after the user grants consent; Drive files are stored in that user's Google account and are subject to that account's storage quota. Google refresh tokens are encrypted by the backend. The Application does not sell personal data or Google user data. Users may disconnect Google access and request data corrections or deletion through their school administrator or the Application operator. Existing Drive backup copies may need to be deleted separately by the Drive owner.</p>
</article></main>
<footer>© 2026 GURU SMART AI PRO · Kebijakan Privasi</footer>
</body></html>`;

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
function decodeJwtBase64Url(segment) {
  let value = String(segment || "").replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error("Segmen JWT bukan Base64URL yang valid.");
  value = value.replace(/=+$/, "");
  if (value.length % 4 === 1) throw new Error("Panjang segmen JWT Base64URL tidak valid.");
  while (value.length % 4) value += "=";
  const binary = atob(value);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function verifySupabaseJwt(token, env) {
  const secret = String(env.SUPABASE_JWT_SECRET || ""); if (!secret) return null;
  const parts = String(token).split("."); if (parts.length !== 3) return null;
  let header, payload, sig;
  try {
    header = JSON.parse(new TextDecoder().decode(decodeJwtBase64Url(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(decodeJwtBase64Url(parts[1])));
    sig = decodeJwtBase64Url(parts[2]);
  } catch (_) { return null; }
  if (header.alg !== "HS256" || !payload.sub || Number(payload.exp || 0) <= Date.now()/1000) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(parts[0]+"."+parts[1]));
  return ok ? {id:payload.sub,email:payload.email||"",role:payload.role||"authenticated"} : null;
}
async function verifyUser(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: "Sesi login tidak ditemukan. Silakan login ulang.", status: 401 };
  const base = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = String(env.SUPABASE_ANON_KEY || "").trim();
  if (!base || !key) return { error: "Worker belum dikonfigurasi: SUPABASE_URL dan SUPABASE_ANON_KEY diperlukan untuk memverifikasi sesi login.", status: 503 };
  try {
    const r = await fetch(base + "/auth/v1/user", { headers: { Authorization: "Bearer " + token, apikey: key }, signal: AbortSignal.timeout(5000) });
    if (r.ok) { const u = await r.json(); if (u && u.id) return { user: u }; }
    if (r.status === 401 || r.status === 403) return { error: "Sesi login tidak valid atau kedaluwarsa. Silakan login ulang.", status: 401 };
    // Ketika Supabase Auth sedang down, verifikasi JWT lokal agar Drive tetap bisa dipakai.
    const local = await verifySupabaseJwt(token, env);
    if (local) return { user: local };
    return { error: "Sesi login tidak dapat diverifikasi. Pastikan SUPABASE_JWT_SECRET sudah dipasang di Worker.", status: 503 };
  } catch (_) { const local = await verifySupabaseJwt(token, env).catch(() => null); return local ? { user: local } : { error: "Layanan autentikasi tidak dapat dihubungi dan verifikasi lokal belum tersedia. Pasang SUPABASE_JWT_SECRET di Worker.", status: 503 }; }
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

// ---- Google Drive OAuth + backup per pengguna (refresh token terenkripsi) ----
function b64u(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64u(value){
  let s=String(value??'').trim().replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');
  if(!s || !/^[A-Za-z0-9+/]*={0,2}$/.test(s) || /=/.test(s.slice(0,-2)) || s.length%4===1){
    throw new Error('Format Base64URL token Google di D1 tidak valid. Hubungkan ulang Google Drive untuk membuat token baru.');
  }
  s=s.replace(/=+$/,'');
  while(s.length%4)s+='=';
  try{return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
  catch(_){throw new Error('Token Google di D1 rusak atau bukan Base64URL yang valid. Hubungkan ulang Google Drive untuk memperbarui token.');}
}
/* decodeKeySecret: terima Base64 / Base64URL / Hex (64 char) 32-byte. Spasi, newline,
   dan tanda '=' akhir diabaikan. Melempar pesan yang jelas agar callback OAuth
   tidak lagi menampilkan "atob() called with invalid base64-encoded data". */
function decodeKeySecret(secret){
  const raw=String(secret||'').trim();
  if(!raw) throw new Error('DRIVE_TOKEN_ENCRYPTION_KEY belum diisi. Jalankan `openssl rand -base64 32` dan pasang sebagai Secret di Cloudflare Worker.');
  const hex=raw.replace(/[^0-9a-fA-F]/g,'');
  if(hex.length===64 && /^[0-9a-fA-F]{64}$/.test(raw.replace(/\s+/g,''))){
    const out=new Uint8Array(32);
    for(let i=0;i<32;i++)out[i]=parseInt(hex.substr(i*2,2),16);
    return out;
  }
  let s=raw.replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/').replace(/=+$/,'');
  if(!/^[A-Za-z0-9+/]*$/.test(s)) throw new Error('DRIVE_TOKEN_ENCRYPTION_KEY bukan Base64/Base64URL/Hex yang valid. Buat ulang dengan `openssl rand -base64 32` (32 byte acak).');
  while(s.length%4)s+='=';
  let bytes;
  try { bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0)); }
  catch(e){ throw new Error('DRIVE_TOKEN_ENCRYPTION_KEY tidak dapat didekode sebagai Base64. Buat ulang dengan `openssl rand -base64 32` (32 byte acak).'); }
  if(bytes.length!==32) throw new Error('DRIVE_TOKEN_ENCRYPTION_KEY harus 32 byte acak (diperoleh '+bytes.length+' byte setelah didekode). Buat dengan `openssl rand -base64 32`.');
  return bytes;
}
async function hmac(value,secret){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64u(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(value)));}
async function sealToken(token,secret){const raw=decodeKeySecret(secret);const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(token));return b64u(iv)+'.'+b64u(data);}
async function openToken(value,secret){
  const raw=decodeKeySecret(secret);
  const parts=String(value||'').split('.');
  if(parts.length!==2 || !parts[0] || !parts[1]) throw new Error('Format refresh token terenkripsi di D1 tidak lengkap. Hubungkan ulang Google Drive untuk membuat token baru.');
  const iv=unb64u(parts[0]), cipher=unb64u(parts[1]);
  if(iv.length!==12 || cipher.length<17) throw new Error('Refresh Token Google di D1 tidak utuh. Hubungkan ulang Google Drive untuk membuat token baru.');
  const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  try { const data=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher); return new TextDecoder().decode(data); }
  catch(_) { throw new Error('Refresh Token Google tidak dapat dibuka. DRIVE_TOKEN_ENCRYPTION_KEY mungkin berbeda dari kunci saat token disimpan. Periksa Secret lama; jangan menggantinya sembarangan.'); }
},key,unb64u(p[1]));return new TextDecoder().decode(data);}
function driveRedirect(request,query){const u=new URL(request.url);u.pathname='/';u.search='';u.hash='';for(const k in query)u.searchParams.set(k,query[k]);return Response.redirect(u.toString(),302);}
async function driveToken(userId,env){const row=await env.DB.prepare('SELECT * FROM drive_connections WHERE user_id=?').bind(userId).first();if(!row)return {error:'Google Drive belum terhubung.'};const refresh=await openToken(row.refresh_token_enc,env.DRIVE_TOKEN_ENCRYPTION_KEY);const form=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'});const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:form});const j=await r.json();if(!r.ok||!j.access_token)throw new Error('Token Google tidak dapat diperbarui: '+(j.error_description||j.error||r.status));return {access:j.access_token,row};}
async function driveApi(access,path,options){const r=await fetch('https://www.googleapis.com/drive/v3/'+path,{...options,headers:{Authorization:'Bearer '+access,...(options&&options.headers||{})}});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error('Google Drive API '+r.status+': '+(j.error&&j.error.message||'permintaan gagal'));return j;}
async function ensureDriveFolder(access,name,parent){const q="name='"+name.replace(/'/g,"\\'")+"' and mimeType='application/vnd.google-apps.folder' and trashed=false"+(parent?" and '"+parent+"' in parents":'');const found=await driveApi(access,'files?q='+encodeURIComponent(q)+'&fields=files(id,name)&pageSize=10');if(found.files&&found.files.length)return found.files[0].id;const f=await driveApi(access,'files?fields=id',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',...(parent?{parents:[parent]}:{})})});return f.id;}
async function backupDriveEvent(request,env,user){if(!env.DB)return response({error:'D1 belum dikonfigurasi.'},503,safeOrigin(request));let body;try{body=await request.json();}catch(_){return response({error:'JSON tidak valid.'},400,safeOrigin(request));}const table=String(body.table||'').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64)||'data';const op=String(body.op||'change');const event={app:'GURU SMART AI PRO',user_id:user.id,table,operation:op,record_data:body.data??null,filters:body.filters||[],occurred_at:body.timestamp||new Date().toISOString(),schema_version:1};try{const auth=await driveToken(user.id,env);let root=auth.row.root_folder_id;if(!root)root=await ensureDriveFolder(auth.access,'GURU SMART AI',null);let folders={};try{folders=JSON.parse(auth.row.folders_json||'{}')}catch(_){}let folder=folders[table];if(!folder){const t=table.toLowerCase();let cat='Backup Database';if(/teacher|guru/.test(t))cat='Data Guru';else if(/student|siswa|attendance|absen/.test(t))cat='Data Siswa';else if(/rapor|report/.test(t))cat='Raport Digital';else if(/grade|nilai/.test(t))cat='Nilai Siswa';else if(/question|soal|quiz|kuis/.test(t))cat='Bank Soal';else if(/sibi|book|buku/.test(t))cat='Buku Pelajaran SIBI';else if(/document|file|material|perangkat/.test(t))cat='Dokumen Pembelajaran';folder=await ensureDriveFolder(auth.access,table,folders['category__'+cat]||root);}folders[table]=folder;await env.DB.prepare('UPDATE drive_connections SET root_folder_id=?,folders_json=?,updated_at=datetime(\'now\') WHERE user_id=?').bind(root,JSON.stringify(folders),user.id).run();const boundary='----gsdrive'+crypto.randomUUID().replace(/-/g,'');const metadata={name:table+'_'+Date.now()+'_'+crypto.randomUUID().slice(0,8)+'.json',mimeType:'application/json',parents:[folder]};const multipart='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(event)+'\r\n--'+boundary+'--';const up=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',{method:'POST',headers:{Authorization:'Bearer '+auth.access,'Content-Type':'multipart/related; boundary='+boundary},body:multipart});const uj=await up.json();if(!up.ok)throw new Error(uj.error&&uj.error.message||'Upload Drive gagal');await env.DB.prepare('INSERT INTO drive_backup_log(id,user_id,table_name,file_id,status) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.id,table,uj.id,'ok').run();return response({ok:true,file_id:uj.id,folder_id:folder},200,safeOrigin(request));}catch(e){await env.DB.prepare('INSERT INTO drive_backup_log(id,user_id,table_name,status,detail) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.id,table,'error',String(e.message||e)).run().catch(()=>{});return response({error:String(e.message||e)},502,safeOrigin(request));}}
async function driveStart(request,env,user){if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_REDIRECT_URI||!env.OAUTH_STATE_SECRET)return response({error:'Konfigurasi Google OAuth belum lengkap di Cloudflare.'},503,safeOrigin(request));const nonce=crypto.randomUUID();const payload=b64u(new TextEncoder().encode(JSON.stringify({uid:user.id,n:nonce,exp:Date.now()+600000})));const sig=await hmac(payload,env.OAUTH_STATE_SECRET);await env.DB.prepare('INSERT INTO drive_oauth_states(nonce,user_id,expires_at) VALUES(?,?,?)').bind(nonce,user.id,Math.floor(Date.now()/1000)+600).run();const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');u.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:env.GOOGLE_REDIRECT_URI,response_type:'code',scope:'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',access_type:'offline',prompt:'consent',include_granted_scopes:'true',state:payload+'.'+sig}).toString();return response({url:u.toString()},200,safeOrigin(request));}
async function driveCallback(request,env){const u=new URL(request.url);const state=u.searchParams.get('state')||'';const [payload,sig]=state.split('.');try{if(!payload||!sig||sig!==await hmac(payload,env.OAUTH_STATE_SECRET))throw new Error('State OAuth tidak valid.');const p=JSON.parse(new TextDecoder().decode(unb64u(payload)));if(p.exp<Date.now())throw new Error('Sesi penghubung Google kedaluwarsa.');const used=await env.DB.prepare('SELECT nonce FROM drive_oauth_states WHERE nonce=? AND user_id=? AND expires_at>?').bind(p.n,p.uid,Math.floor(Date.now()/1000)).first();if(!used)throw new Error('Permintaan OAuth sudah digunakan atau kedaluwarsa.');await env.DB.prepare('DELETE FROM drive_oauth_states WHERE nonce=?').bind(p.n).run();if(u.searchParams.get('error'))throw new Error('Google menolak izin: '+u.searchParams.get('error'));const form=new URLSearchParams({code:u.searchParams.get('code')||'',client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:env.GOOGLE_REDIRECT_URI,grant_type:'authorization_code'});const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:form});const tj=await tr.json();if(!tr.ok||!tj.refresh_token)throw new Error('Google tidak mengirim refresh token. Cabut akses aplikasi di akun Google lalu coba hubungkan ulang.');const enc=await sealToken(tj.refresh_token,env.DRIVE_TOKEN_ENCRYPTION_KEY);let email='';try{const me=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+tj.access_token}});const mj=await me.json();email=mj.email||'';}catch(_){}const root=await ensureDriveFolder(tj.access_token,'GURU SMART AI',null);const cats=['Data Guru','Data Siswa','Raport Digital','Bank Soal','Buku Pelajaran SIBI','Dokumen Pembelajaran','Nilai Siswa','Backup Database'];const folders={};for(const cat of cats)folders['category__'+cat]=await ensureDriveFolder(tj.access_token,cat,root);await env.DB.prepare('INSERT INTO drive_connections(user_id,refresh_token_enc,connected_email,root_folder_id,folders_json) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET refresh_token_enc=excluded.refresh_token_enc,connected_email=excluded.connected_email,root_folder_id=excluded.root_folder_id,folders_json=excluded.folders_json,updated_at=datetime(\'now\')').bind(p.uid,enc,email,root,JSON.stringify(folders)).run();return new Response('<!doctype html><meta charset="utf-8"><title>Google Drive terhubung</title><body style="font:16px Arial;text-align:center;padding:40px"><h2>Google Drive berhasil dihubungkan</h2><p>Anda dapat menutup jendela ini dan kembali ke GURU SMART AI PRO.</p><script>if(window.opener){window.opener.postMessage({type:"GURU_SMART_DRIVE_CONNECTED"},"*");}setTimeout(()=>window.close(),900)</script></body>',{headers:{'content-type':'text/html; charset=utf-8'}});}catch(e){let msg=String(e&&e.message||e);if(/atob|base64|DRIVE_TOKEN_ENCRYPTION_KEY|encryption key|invalid/i.test(msg))msg='Konfigurasi Secret DRIVE_TOKEN_ENCRYPTION_KEY bermasalah: '+msg+' Buat ulang dengan `openssl rand -base64 32` (32 byte acak) dan pasang sebagai Secret di Cloudflare Worker, lalu deploy ulang.';return new Response('<!doctype html><meta charset="utf-8"><title>Google Drive</title><body style="font:16px Arial;text-align:center;padding:40px"><h2>Gagal menghubungkan Google Drive</h2><p>'+String(msg||e).replace(/[<>&]/g,'')+'</p><p>Tutup jendela ini dan periksa konfigurasi.</p></body>',{status:400,headers:{'content-type':'text/html; charset=utf-8'}});}}
async function backupDriveFile(request,env,user){try{const form=await request.formData();const file=form.get('file');const bucket=String(form.get('bucket')||'Dokumen Pembelajaran').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64);const original=String(form.get('path')||file&&file.name||'file').slice(0,500);if(!file||typeof file.arrayBuffer!=='function')return response({error:'File tidak ditemukan.'},400,safeOrigin(request));if(file.size>15000000)return response({error:'File lebih dari 15 MB; tidak dikirim ke backup otomatis.'},413,safeOrigin(request));const auth=await driveToken(user.id,env);let root=auth.row.root_folder_id;if(!root)root=await ensureDriveFolder(auth.access,'GURU SMART AI',null);let fm={};try{fm=JSON.parse(auth.row.folders_json||'{}')}catch(_){}let folder=await ensureDriveFolder(auth.access,bucket,fm['category__Dokumen Pembelajaran']||root);try{fm=JSON.parse(auth.row.folders_json||'{}')}catch(_){}fm['storage__'+bucket]=folder;await env.DB.prepare('UPDATE drive_connections SET root_folder_id=?,folders_json=?,updated_at=datetime(\'now\') WHERE user_id=?').bind(root,JSON.stringify(fm),user.id).run();const boundary='----gsfile'+crypto.randomUUID().replace(/-/g,'');const name=original.split('/').pop().replace(/[^a-zA-Z0-9._-]/g,'_').slice(-160)||'file';const metadata={name,mimeType:file.type||'application/octet-stream',parents:[folder],description:'GURU SMART AI backup | user='+user.id+' | bucket='+bucket+' | path='+original,appProperties:{gsBucket:bucket,gsPath:original,gsOwner:user.id}};const bytes=new Uint8Array(await file.arrayBuffer());const head='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: '+(file.type||'application/octet-stream')+'\r\n\r\n';const tail='\r\n--'+boundary+'--';const enc=new TextEncoder();const body=new Uint8Array(enc.encode(head).length+bytes.length+enc.encode(tail).length);let off=0;body.set(enc.encode(head),off);off+=enc.encode(head).length;body.set(bytes,off);off+=bytes.length;body.set(enc.encode(tail),off);const up=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',{method:'POST',headers:{Authorization:'Bearer '+auth.access,'Content-Type':'multipart/related; boundary='+boundary},body});const j=await up.json();if(!up.ok)throw new Error(j.error&&j.error.message||'Upload file ke Drive gagal');await env.DB.prepare('INSERT INTO drive_backup_log(id,user_id,table_name,file_id,status) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.id,'storage:'+bucket,j.id,'ok').run();return response({ok:true,file_id:j.id},200,safeOrigin(request));}catch(e){return response({error:String(e.message||e)},502,safeOrigin(request));}}
/* ---- v4 KILAT-RESTORE ------------------------------------------------------
   Pemulihan Drive dulu mengunduh SETIAP file backup satu per satu (1 subrequest
   per file). Backup dibuat per perubahan data, sehingga jumlah file cepat ratusan
   dan Cloudflare menolak dengan "Too many subrequests by single Worker invocation"
   (batas 50 subrequest per invokasi Worker).
   Solusi:
   1) Unduhan DIBATCH lewat multipart batch Google (maks. 50 file/batch) —
      satu batch hanya dihitung SATU subrequest oleh Cloudflare.
   2) Anggaran subrequest (listing + batch) dijaga di bawah batas; bila terpotong,
      hasil yang sudah terkumpul tetap dikembalikan dengan flag "truncated".
   Semantik pemutaran peristiwa (urutan createdTime, operasi snapshot/insert/
   upsert/update/delete) tidak berubah sama sekali. */
const DRIVE_BATCH_SIZE = 50;   /* file per batch request Google (aman utk Drive API) */
const DRIVE_SR_LIMIT = 30;     /* anggaran batch/unduh per invokasi (total < 50 dgn listing) */
const DRIVE_LIST_PAGES_MAX = 10;
async function driveBatchDownload(access, ids) {
  const B = 'batch_gs_' + crypto.randomUUID().replace(/-/g, '');
  let body = '';
  ids.forEach(function (id, i) {
    body += '--' + B + '\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\nContent-ID: <item' + (i + 1) + '>\r\n\r\nGET https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?alt=media\r\n\r\n';
  });
  body += '--' + B + '--\r\n';
  const r = await fetch('https://www.googleapis.com/batch/drive/v3', { method: 'POST', headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'multipart/mixed; boundary="' + B + '"' }, body: body });
  const text = await r.text();
  if (!r.ok) { let msg = 'Google Drive API ' + r.status; try { const j = JSON.parse(text); msg += ': ' + (j.error && j.error.message || 'permintaan gagal'); } catch (_) {} throw new Error(msg); }
  const out = [];
  for (const p of text.split('--' + B)) {
    if (!p || p.trim() === '' || p.trim() === '--') continue;
    const s = p.indexOf('{'), e = p.lastIndexOf('}');
    if (s < 0 || e <= s) { out.push(null); continue; }
    try { out.push(JSON.parse(p.slice(s, e + 1))); } catch (_) { out.push(null); }
  }
  return out;
}
async function driveRestore(request,env,user){try{const auth=await driveToken(user.id,env);const folders=JSON.parse(auth.row.folders_json||'{}');const tblParam=new URL(request.url).searchParams.get('table');const out={tables:{},restored_at:new Date().toISOString(),truncated:false};const tableKeys=Object.keys(folders).filter(t=>t.indexOf('storage__')!==0&&t.indexOf('category__')!==0&&(!tblParam||tblParam===t));let sr=0;const perTable=[];for(const table of tableKeys){const folder=folders[table];let pageToken='',files=[];for(let page=0;page<10;page++){if(sr>=DRIVE_LIST_PAGES_MAX){out.truncated=true;break;}sr++;const q="'"+folder+"' in parents and trashed=false";const u='files?q='+encodeURIComponent(q)+'&orderBy=createdTime&pageSize=1000&fields=nextPageToken,files(id,name,createdTime)'+(pageToken?'&pageToken='+encodeURIComponent(pageToken):'');const list=await driveApi(auth.access,u);files=files.concat(list.files||[]);pageToken=list.nextPageToken||'';if(!pageToken)break;}files.sort((a,b)=>String(a.createdTime||'').localeCompare(String(b.createdTime||'')));perTable.push({table:table,files:files});}
const replayEvent=(ev,rows)=>{const op=ev.operation;const d=ev.record_data;const arr=Array.isArray(d)?d:(d?[d]:[]);if(op==='snapshot'){return Array.isArray(d)?d:[];}if(op==='insert'||op==='upsert'){for(const row of arr){const id=String(row&&row.id!=null?row.id:'');const ix=rows.findIndex(x=>String(x&&x.id)!=null&&String(x.id)===id);if(ix>=0)rows[ix]=row;else rows.push(row);}return rows;}if(op==='update'){return rows.map(row=>{const ok=(ev.filters||[]).every(fl=>{const v=row&&row[fl.column];return fl.op==='eq'?String(v??'')===String(fl.value??''):fl.op==='in'&&Array.isArray(fl.value)?fl.value.some(x=>String(x)===String(v)):true;});if(!ok)return row;const merged={...row,...(d||{})};if(Object.prototype.hasOwnProperty.call(row,'updated_at')||Object.prototype.hasOwnProperty.call(d||{},'updated_at'))merged.updated_at=ev.occurred_at||merged.updated_at;return merged;});}if(op==='delete'){return rows.filter(row=>!(ev.filters||[]).every(fl=>fl.op==='eq'?String((row&&row[fl.column])??'')===String(fl.value??''):fl.op==='in'&&Array.isArray(fl.value)?fl.value.some(x=>String(x)===String(row&&row[fl.column])):false));}return rows;};
for(const tf of perTable){const files=tf.files;let rows=[];for(let i=0;i<files.length;i+=DRIVE_BATCH_SIZE){if(sr>=DRIVE_SR_LIMIT){out.truncated=true;break;}const group=files.slice(i,i+DRIVE_BATCH_SIZE);sr++;let events=null;try{events=await driveBatchDownload(auth.access,group.map(f=>f.id));}catch(eB){console.warn('Batch Drive gagal, fallback per file:',eB);events=[];for(const f of group){if(sr>=DRIVE_SR_LIMIT){out.truncated=true;events.push(null);continue;}sr++;try{events.push(await driveApi(auth.access,'files/'+f.id+'?alt=media'));}catch(eF){console.warn('Skip backup file',f.id,eF);events.push(null);}}}for(let g=0;g<group.length;g++){const ev=events&&events[g];if(!ev||ev.error){console.warn('Skip backup file',group[g].id,ev&&ev.error?ev.error.message:'bagian batch kosong');continue;}try{rows=replayEvent(ev,rows)||rows;}catch(e){console.warn('Skip backup file',group[g].id,e);}}}out.tables[tf.table]=rows;}return response(out,200,safeOrigin(request));}catch(e){return response({error:String(e.message||e)},502,safeOrigin(request));}}
async function driveStorageList(request,env,user){try{const auth=await driveToken(user.id,env);const folders=JSON.parse(auth.row.folders_json||'{}');const items=[];for(const key of Object.keys(folders)){if(key.indexOf('storage__')!==0)continue;const bucket=key.slice(9),folder=folders[key];const q="'"+folder+"' in parents and trashed=false";const list=await driveApi(auth.access,'files?q='+encodeURIComponent(q)+'&pageSize=1000&fields=files(id,name,mimeType,appProperties)');(list.files||[]).forEach(f=>{if(f.appProperties&&f.appProperties.gsOwner===user.id)items.push({id:f.id,name:f.name,mimeType:f.mimeType,bucket:f.appProperties.gsBucket||bucket,path:f.appProperties.gsPath||f.name});});}return response({files:items},200,safeOrigin(request));}catch(e){return response({error:String(e.message||e)},502,safeOrigin(request));}}
async function driveStorageFile(request,env,user){try{const auth=await driveToken(user.id,env);const id=new URL(request.url).searchParams.get('id');if(!id)return response({error:'ID file diperlukan.'},400,safeOrigin(request));const meta=await driveApi(auth.access,'files/'+encodeURIComponent(id)+'?fields=id,parents,mimeType,appProperties');const folders=JSON.parse(auth.row.folders_json||'{}');const allowed=Object.keys(folders).filter(k=>k.indexOf('storage__')===0).map(k=>folders[k]);if(!meta.parents||!meta.parents.some(p=>allowed.includes(p))||!meta.appProperties||meta.appProperties.gsOwner!==user.id)return response({error:'File bukan milik akun ini.'},403,safeOrigin(request));const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?alt=media',{headers:{Authorization:'Bearer '+auth.access}});if(!r.ok)return response({error:'File Drive tidak dapat dibaca.'},502,safeOrigin(request));return new Response(r.body,{status:200,headers:{'content-type':meta.mimeType||'application/octet-stream','cache-control':'no-store','access-control-allow-origin':safeOrigin(request),'access-control-allow-headers':'Authorization, Content-Type','content-disposition':'attachment'}});}catch(e){return response({error:String(e.message||e)},502,safeOrigin(request));}}
async function driveStatus(request,env,user){const r=await env.DB.prepare('SELECT connected_email,root_folder_id,connected_at FROM drive_connections WHERE user_id=?').bind(user.id).first();const logs=await env.DB.prepare('SELECT COUNT(*) AS total, MAX(created_at) AS last_backup FROM drive_backup_log WHERE user_id=? AND status=\'ok\'').bind(user.id).first();return response({connected:!!r,email:r&&r.connected_email||null,folder_id:r&&r.root_folder_id||null,connected_at:r&&r.connected_at||null,backup_count:logs&&logs.total||0,last_backup:logs&&logs.last_backup||null},200,safeOrigin(request));}

export default {
  async fetch(request, env) {
    const origin = safeOrigin(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": origin, "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization, apikey", "access-control-max-age": "86400", "vary": "Origin"
    }});
    const url = new URL(request.url);
    const privacyPath = url.pathname.replace(/\/+$/, "") || "/";
    if (request.method === "GET" && ["/privacy", "/privacy.html", "/kebijakan-privasi"].includes(privacyPath)) {
      return new Response(PRIVACY_HTML, { status: 200, headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin"
      }});
    }
    if (request.method === "GET" && url.pathname === "/api/drive/oauth/callback") return driveCallback(request, env);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/api")) return response({ ok:true, service:"GURU SMART SIBI D1 API", version:VERSION, endpoints:["/api/health","/api/d1-health","/api/db/query","/api/drive/oauth/start","/api/drive/oauth/callback","/api/drive/status","/api/drive/backup","/api/drive/restore","/api/drive/file-backup","/api/drive/storage-list","/api/drive/storage-file"] }, 200, origin);
    if (request.method === "GET" && url.pathname === "/api/health") return response({ ok:true, worker:"online", version:VERSION, timestamp:new Date().toISOString(), d1_bound:!!env.DB }, 200, origin);
    if (request.method === "GET" && url.pathname === "/api/d1-health") {
      if (!env.DB) return response({ ok:false, d1:"not_configured", message:"Binding D1 belum dikonfigurasi." }, 503, origin);
      try { const r=await env.DB.prepare("SELECT COUNT(*) AS count FROM app_records").first(); return response({ ok:true, d1:"connected", records:r?.count||0, version:VERSION }, 200, origin); }
      catch (_) { return response({ ok:false, d1:"migration_required", message:"Database terhubung, tetapi migrasi belum dijalankan." }, 503, origin); }
    }
    if (request.method === "GET" && url.pathname === "/api/drive/oauth/start") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return driveStart(request,env,v.user); }
    if (request.method === "GET" && url.pathname === "/api/drive/storage-list") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return driveStorageList(request,env,v.user); }
    if (request.method === "GET" && url.pathname === "/api/drive/storage-file") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return driveStorageFile(request,env,v.user); }
    if (request.method === "GET" && url.pathname === "/api/drive/restore") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return driveRestore(request,env,v.user); }
    if (request.method === "GET" && url.pathname === "/api/drive/status") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return driveStatus(request,env,v.user); }
    if (request.method === "POST" && url.pathname === "/api/drive/file-backup") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return backupDriveFile(request,env,v.user); }
    if (request.method === "POST" && url.pathname === "/api/drive/backup") { const v=await verifyUser(request,env); if(v.error)return response({error:v.error},v.status,origin); return backupDriveEvent(request,env,v.user); }
    if (request.method === "POST" && url.pathname === "/api/db/query") {
      const verified = await verifyUser(request, env);
      if (verified.error) return response({ error:verified.error }, verified.status, origin);
      return queryD1(request, env, verified.user);
    }
    if (url.pathname.startsWith("/api/")) return response({ error:"API route tidak ditemukan" }, 404, origin);
    return response({ ok:false, error:"Not found" }, 404, origin);
  }
};

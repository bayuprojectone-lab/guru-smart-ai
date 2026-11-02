/**
 * GURU SMART SIBI PREMIUM — Cloudflare Worker API
 * Static frontend tetap di GitHub Pages/hosting lama.
 * Secrets yang disarankan: OPENAI_API_KEY (opsional), API_TOKEN (opsional).
 * Variables: ALLOWED_ORIGINS = https://USERNAME.github.io,https://domain-anda.com
 */
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}
function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
}
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const permitted = allowed.includes('*') || allowed.includes(origin);
  return {
    'access-control-allow-origin': permitted ? (allowed.includes('*') ? '*' : origin) : 'null',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization',
    'access-control-max-age': '86400',
    'vary': 'Origin'
  };
}
function withCors(response, cors) {
  const headers = new Headers(response.headers);
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function isOriginAllowed(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // requests from curl/server tools
  const allowed = allowedOrigins(env);
  return allowed.includes('*') || allowed.includes(origin);
}
function authorized(request, env) {
  // API_TOKEN is optional. If configured, clients must send Authorization: Bearer <token>.
  // Do not use a shared secret in public frontend JavaScript; use authentication/JWT for production.
  if (!env.API_TOKEN) return true;
  return request.headers.get('Authorization') === `Bearer ${env.API_TOKEN}`;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      if (!isOriginAllowed(request, env)) return json({ error: 'Origin tidak diizinkan' }, 403, cors);
      return new Response(null, { status: 204, headers: cors });
    }
    if (!isOriginAllowed(request, env)) return withCors(json({ error: 'Origin tidak diizinkan' }, 403), cors);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return withCors(json({ ok: true, service: 'guru-smart-sibi-api', timestamp: new Date().toISOString() }), cors);
    }
    if (url.pathname === '/api/ai/chat' && request.method === 'POST') {
      if (!authorized(request, env)) return withCors(json({ error: 'Tidak diizinkan' }, 401), cors);
      if (!env.OPENAI_API_KEY) return withCors(json({ error: 'OPENAI_API_KEY belum diatur di Cloudflare Worker Secrets' }, 503), cors);
      let body;
      try { body = await request.json(); } catch { return withCors(json({ error: 'Body JSON tidak valid' }, 400), cors); }
      const messages = Array.isArray(body.messages) ? body.messages : null;
      if (!messages || messages.length < 1 || messages.length > 40) {
        return withCors(json({ error: 'messages harus berupa array berisi 1–40 pesan' }, 400), cors);
      }
      const cleanMessages = messages.map(m => ({
        role: ['system', 'user', 'assistant'].includes(m?.role) ? m.role : 'user',
        content: typeof m?.content === 'string' ? m.content.slice(0, 12000) : ''
      })).filter(m => m.content);
      if (!cleanMessages.length) return withCors(json({ error: 'Pesan kosong' }, 400), cors);
      try {
        const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'authorization': `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model: typeof body.model === 'string' ? body.model.slice(0, 80) : 'gpt-4o-mini',
            messages: cleanMessages,
            temperature: Number.isFinite(body.temperature) ? Math.max(0, Math.min(1.5, body.temperature)) : 0.7,
            max_tokens: Number.isInteger(body.max_tokens) ? Math.max(1, Math.min(3000, body.max_tokens)) : 1200
          })
        });
        const raw = await upstream.text();
        let data; try { data = JSON.parse(raw); } catch { data = { error: { message: 'Respons AI tidak valid' } }; }
        if (!upstream.ok) return withCors(json({ error: data?.error?.message || `Layanan AI gagal (${upstream.status})` }, upstream.status >= 500 ? 502 : upstream.status), cors);
        return withCors(json({ ok: true, text: data?.choices?.[0]?.message?.content || '', usage: data?.usage || null }), cors);
      } catch (e) {
        return withCors(json({ error: 'Tidak dapat menghubungi layanan AI' }, 502), cors);
      }
    }
    return withCors(json({ error: 'Endpoint tidak ditemukan', available: ['GET /api/health', 'POST /api/ai/chat'] }, 404), cors);
  }
};

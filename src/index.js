const VERSION = "1.0.1";

function json(data, status = 200, requestOrigin = "*") {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": requestOrigin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization, apikey"
    }
  });
}

function getOrigin(request) {
  // API ini hanya menyediakan endpoint status read-only.
  // CORS * memungkinkan GitHub Pages mengakses health check.
  return "*";
}

function configured(env) {
  const url = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = String(env.SUPABASE_ANON_KEY || "").trim();
  return { url, key, ready: Boolean(url && key) };
}

async function supabaseHealth(env) {
  const cfg = configured(env);
  if (!cfg.ready) {
    return {
      ok: false,
      worker: "online",
      supabase: "not_configured",
      message: "Pasang SUPABASE_URL dan SUPABASE_ANON_KEY pada Variables and Secrets Cloudflare."
    };
  }

  let parsed;
  try {
    parsed = new URL(cfg.url);
    if (parsed.protocol !== "https:") throw new Error("SUPABASE_URL harus menggunakan HTTPS.");
  } catch (error) {
    return { ok: false, worker: "online", supabase: "invalid_config", message: error.message };
  }

  try {
    const response = await fetch(`${cfg.url}/auth/v1/health`, {
      method: "GET",
      headers: { apikey: cfg.key, accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      return {
        ok: false,
        worker: "online",
        supabase: "error",
        status: response.status,
        message: `Supabase merespons HTTP ${response.status}. ${detail}`
      };
    }
    return { ok: true, worker: "online", supabase: "connected", status: response.status };
  } catch (error) {
    console.error("[guru-smart-ai] Supabase health check failed:", error);
    return {
      ok: false,
      worker: "online",
      supabase: "unreachable",
      message: error && error.name === "TimeoutError" ? "Pemeriksaan Supabase melewati batas waktu." : "Worker tidak dapat menghubungi Supabase. Periksa URL, jaringan, dan konfigurasi."
    };
  }
}

export default {
  async fetch(request, env) {
    const origin = getOrigin(request);
    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": origin,
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "Content-Type, Authorization, apikey",
            "access-control-max-age": "86400"
          }
        });
      }

      if (request.method !== "GET") {
        return json({ ok: false, error: "Method tidak didukung. Gunakan GET." }, 405, origin);
      }

      if (url.pathname === "/" || url.pathname === "/api") {
        return json({
          ok: true,
          service: "GURU SMART SIBI API",
          worker: "online",
          version: VERSION,
          endpoints: ["/api/health", "/api/supabase-health"]
        }, 200, origin);
      }

      if (url.pathname === "/api/health") {
        const cfg = configured(env);
        return json({
          ok: true,
          service: "guru-smart-api",
          worker: "online",
          supabase_configured: cfg.ready,
          version: VERSION,
          timestamp: new Date().toISOString()
        }, 200, origin);
      }

      if (url.pathname === "/api/supabase-health") {
        const result = await supabaseHealth(env);
        return json(result, result.ok ? 200 : 503, origin);
      }

      return json({ ok: false, error: "API route tidak ditemukan", available: ["/api/health", "/api/supabase-health"] }, 404, origin);
    } catch (error) {
      console.error("[guru-smart-ai] Unhandled Worker exception:", error);
      return json({ ok: false, error: "Internal Worker error", message: "Periksa Workers Logs Cloudflare.", version: VERSION }, 500, origin);
    }
  }
};

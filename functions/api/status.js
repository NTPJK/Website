// functions/api/status.js
// — คืน { ok, state: "online/offline", clients, max }
async function fetchJson(url, ms = 3500) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort("timeout"), ms);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: c.signal,
      cf: { cacheTtl: 0 },
    });
    if (!res.ok) throw new Error("bad status " + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function onRequest() {
  const INFO_URL = "http://119.8.186.151:30120/info.json"; // ใส่ IP:PORT ของคุณ

  try {
    const info = await fetchJson(INFO_URL);
    const clients = Number.isFinite(info?.clients) ? info.clients : 0;
    const maxRaw = info?.vars?.sv_maxClients ?? null;
    const max = maxRaw != null ? Number(maxRaw) : null;

    return new Response(JSON.stringify(
      { ok: true, state: "online", clients, max }
    ), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      }
    });
  } catch {
    return new Response(JSON.stringify(
      { ok: false, state: "offline", clients: 0, max: null }
    ), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      }
    });
  }
}

// functions/api/status.js
// คืน { ok, state, clients, max, note? }  และโหมด debug ด้วย query ?debug=1

async function fetchJson(url, ms = 4000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort("timeout"), ms);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
      cf: { cacheTtl: 0 },
    });
    const text = await res.text(); // อ่านเป็น text ก่อน เพื่อ handle JSON ที่ยาว/มี icon base64
    if (!res.ok) throw new Error("bad status " + res.status);
    try {
      return JSON.parse(text);
    } catch (e) {
      // บางทีเซิร์ฟเวอร์ส่ง malformed JSON
      throw new Error("json-parse-failed");
    }
  } finally {
    clearTimeout(t);
  }
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const DEBUG = url.searchParams.get("debug") === "1";

  // ↓ เปลี่ยนเป็น IP:PORT ของคุณ
  const INFO_URL = "http://119.8.186.151:30120/info.json";

  try {
    const info = await fetchJson(INFO_URL);

    // clients
    const clients = Number.isFinite(info?.clients) ? info.clients : 0;

    // หา sv_maxclients แบบไม่สนตัวพิมพ์
    const vars = info?.vars || {};
    const maxKey = Object.keys(vars).find(k => k.toLowerCase() === "sv_maxclients");
    const maxRaw = maxKey ? vars[maxKey] : null;
    const max = maxRaw != null && !Number.isNaN(Number(maxRaw)) ? Number(maxRaw) : null;

    const body = { ok: true, state: "online", clients, max };
    if (DEBUG) body.note = { foundKey: maxKey, hasVars: !!maxKey, sampleKeys: Object.keys(vars).slice(0, 5) };
    return new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    const body = { ok: false, state: "offline", clients: 0, max: null };
    if (DEBUG) body.note = String(e?.message || e);
    return new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    });
  }
}

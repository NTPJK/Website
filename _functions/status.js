// _functions/status.js
// — API หลังบ้าน: คืน { ok, state: "online/offline", clients, max }

async function fetchJson(url, ms = 3500) {
  // helper: fetch พร้อม timeout กันค้าง
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
  const INFO_URL = "http://119.8.186.151:30120/info.json"; // <-- แก้ IP:PORT ให้ถูกต้อง (เช่น 30120)

  try {
    const info = await fetchJson(INFO_URL);

    // ดึงจำนวนผู้เล่น/สล็อต
    const clients = Number.isFinite(info?.clients) ? info.clients : 0;

    // บางเครื่อง sv_maxClients เป็น string ให้แปลงเป็น number
    let max = info?.vars?.sv_maxClients;
    max = Number.isFinite(+max) ? +max : (Number.isFinite(info?.sv_maxClients) ? info.sv_maxClients : null);

    return new Response(
      JSON.stringify({ ok: true, state: "online", clients, max }),
      { headers: { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" } }
    );
  } catch (e) {
    // ติดต่อไม่ได้ = offline
    return new Response(
      JSON.stringify({ ok: false, state: "offline", clients: 0, max: null }),
      { headers: { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" } }
    );
  }
}

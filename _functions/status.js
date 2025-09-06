// _functions/status.js
export async function onRequest() {
  const INFO_URL = "http://119.8.186.151:30120/info.json";

  try {
    const res = await fetch(INFO_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("bad response " + res.status);

    const info = await res.json();

    // ดึงจำนวนผู้เล่น (clients)
    const clients = Number.isFinite(info?.clients) ? info.clients : 0;

    // ดึงจำนวน slot (sv_maxClients) → แปลงเป็นตัวเลข
    const maxRaw = info?.vars?.sv_maxClients ?? null;
    const max = maxRaw ? Number(maxRaw) : null;

    return new Response(JSON.stringify({
      ok: true,
      state: "online",
      clients,
      max
    }), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      state: "offline",
      clients: 0,
      max: null
    }), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "no-store"
      }
    });
  }
}

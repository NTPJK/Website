// _functions/status.js
export async function onRequest() {
  const INFO = "http://119.8.186.151:30120/info.json"; // <-- ใส่ IP และ port ของ server จริง
  try {
    const res = await fetch(INFO, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return new Response(JSON.stringify({
        ok: false,
        state: "offline",
        clients: 0,
        max: 0
      }), { headers: { "content-type": "application/json" }});
    }

    const data = await res.json();
    const clients = data?.clients ?? 0;
    const max = data?.vars?.sv_maxClients ?? 0;

    return new Response(JSON.stringify({
      ok: true,
      state: "online",
      clients,
      max
    }), { headers: { "content-type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      state: "offline",
      clients: 0,
      max: 0
    }), { headers: { "content-type": "application/json" }});
  }
}

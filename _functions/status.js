// _functions/status.js
export async function onRequest() {
  const INFO = "http://<119.8.186.151>:<30120>/info.json";  // <-- ใส่ IP:PORT ของเซิร์ฟเวอร์ (ส่วนใหญ่คือ 30120)
  try {
    const res = await fetch(INFO, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return new Response(JSON.stringify({ ok:false, state:"offline", clients:0, max:null }), {
        headers: { "content-type": "application/json" }
      });
    }
    const data = await res.json();
    const clients = typeof data?.clients === "number" ? data.clients : 0;
    const max = data?.vars?.sv_maxClients ?? null;
    return new Response(JSON.stringify({ ok:true, state:"online", clients, max }), {
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin":"*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, state:"offline", clients:0, max:null }), {
      headers: { "content-type": "application/json" }
    });
  }
}

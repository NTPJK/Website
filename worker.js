export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/status") {
      const target = env.FIVEM_INFO_URL; // e.g. "http://IP:PORT/info.json"
      if (!target) return new Response('FIVEM_INFO_URL not set', { status: 500 });
      try {
        const res = await fetch(target, { headers: { "Accept": "application/json" }});
        if (!res.ok) return new Response(JSON.stringify({ ok:false, code:res.status }), { status: 502, headers: { "content-type":"application/json" }});
        const data = await res.json();
        return new Response(JSON.stringify({ ok:true, data }), {
          headers: {
            "content-type":"application/json",
            "Access-Control-Allow-Origin":"*"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok:false, error:String(e) }), { status: 502, headers: { "content-type":"application/json" }});
      }
    }
    return new Response("OK");
  }
}

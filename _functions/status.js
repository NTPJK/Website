export async function onRequest() {
  const target = "http://<119.8.186.151>:<30120>/info.json"; // ใส่ IP/Port ตรงนี้
  try {
    const res = await fetch(target, { headers: { Accept:"application/json" }});
    if (!res.ok) return new Response(JSON.stringify({ ok:false, state:"offline" }), { headers: { "content-type":"application/json" }});
    const data = await res.json();
    if (data && data.clients !== undefined) {
      return new Response(JSON.stringify({ ok:true, state:"online" }), { headers: { "content-type":"application/json" }});
    }
    return new Response(JSON.stringify({ ok:true, state:"online" }), { headers: { "content-type":"application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, state:"offline" }), { headers: { "content-type":"application/json" }});
  }
}

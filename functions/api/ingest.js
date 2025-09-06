export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const key = url.searchParams.get("key");
  if (key !== ctx.env.INGEST_KEY) {
    return new Response("forbidden", { status: 403 });
  }
  if (ctx.request.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  const body = await ctx.request.json().catch(() => ({}));
  const clients = Number(body.clients) || 0;
  const max = Number(body.max) || null;

  await ctx.env.TLC_KV.put("status_json", JSON.stringify({ clients, max, ts: Date.now() }));
  return new Response(JSON.stringify({ ok:true }), {
    headers: { "content-type":"application/json", "access-control-allow-origin":"*" }
  });
}

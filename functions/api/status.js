// functions/api/status.js
// สรุปสถานะ { ok, state, clients, max } พร้อม fallback หลายแบบ

const IP = "119.8.186.151";   // <-- ของคุณ
const PORT = 30120;           // <-- ของคุณ (ส่วนใหญ่ 30120)

const INFO_URL = `http://${IP}:${PORT}/info.json`;
const ML_SINGLE_COLON = `https://servers-frontend.fivem.net/api/servers/single/${IP}:${PORT}`;
const ML_SINGLE_UNDERSCORE = `https://servers-frontend.fivem.net/api/servers/single/${IP}_${PORT}`;
const ML_SEARCH = `https://servers-frontend.fivem.net/api/servers/?offset=0&limit=1&sortBy=clients&search=${IP}%3A${PORT}`;

function toJSON(res) {
  return res.text().then(t => { try { return JSON.parse(t); } catch { throw new Error("json-parse-failed"); } });
}

async function fetchJSON(url, ms = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort("timeout"), ms);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal, cf: { cacheTtl: 0 } });
    if (!res.ok) throw new Error("bad-status-" + res.status);
    return await toJSON(res);
  } finally { clearTimeout(timer); }
}

function extractFromInfo(o) {
  if (!o) return null;
  const clients = Number.isFinite(o.clients) ? o.clients : 0;
  const vars = o.vars || {};
  const key = Object.keys(vars).find(k => k.toLowerCase() === "sv_maxclients");
  const max = key && !Number.isNaN(Number(vars[key])) ? Number(vars[key]) : null;
  return { clients, max };
}

function extractFromMaster(o) {
  if (!o) return null;
  // masterlist อาจห่อใน {Data:{...}} หรือเป็นรายการใน {data:[...]}
  const cand =
    o.Data || o.data?.[0] || o || {};
  // บางครั้ง field อยู่ตรง cand.vars, บางครั้งแผ่แบนอยู่ที่ cand
  const clients = Number(cand.clients) || 0;
  let max = null;
  const vars = cand.vars || cand;
  const key = Object.keys(vars).find(k => k.toLowerCase() === "sv_maxclients");
  if (key && !Number.isNaN(Number(vars[key]))) max = Number(vars[key]);
  return { clients, max };
}

function ok(body) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" }
  });
}

export async function onRequest(req) {
  const url = new URL(req.request.url);
  const DEBUG = url.searchParams.get("debug") === "1";
  const notes = [];

  // 1) ตรง info.json ก่อน
  try {
    const info = await fetchJSON(INFO_URL, 7000);
    const out = extractFromInfo(info);
    if (out) return ok({ ok: true, state: "online", ...out, note: DEBUG ? "direct" : undefined });
  } catch (e) { notes.push("direct:" + (e.message || e)); }

  // 2) masterlist (IP:PORT)
  try {
    const m1 = await fetchJSON(ML_SINGLE_COLON, 7000);
    const out = extractFromMaster(m1);
    if (out) return ok({ ok: true, state: (out.clients > 0 || out.max) ? "online" : "offline", ...out, note: DEBUG ? "ml-colon" : undefined });
  } catch (e) { notes.push("ml-colon:" + (e.message || e)); }

  // 3) masterlist (IP_PORT)
  try {
    const m2 = await fetchJSON(ML_SINGLE_UNDERSCORE, 7000);
    const out = extractFromMaster(m2);
    if (out) return ok({ ok: true, state: (out.clients > 0 || out.max) ? "online" : "offline", ...out, note: DEBUG ? "ml-underscore" : undefined });
  } catch (e) { notes.push("ml-underscore:" + (e.message || e)); }

  // 4) masterlist (search)
  try {
    const m3 = await fetchJSON(ML_SEARCH, 7000);
    const out = extractFromMaster(m3);
    if (out) return ok({ ok: true, state: (out.clients > 0 || out.max) ? "online" : "offline", ...out, note: DEBUG ? "ml-search" : undefined });
  } catch (e) { notes.push("ml-search:" + (e.message || e)); }

  // ทั้งหมดล้มเหลว
  return ok({ ok: false, state: "offline", clients: 0, max: null, note: DEBUG ? notes.join(";") : undefined });
}

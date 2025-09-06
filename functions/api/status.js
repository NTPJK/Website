// functions/api/status.js
// คืน { ok, state: "online/offline", clients, max, note? }
// พยายามดึงจาก info.json โดยตรงก่อน ถ้าไม่ได้ → fallback ไป FiveM masterlist API

const IP = "119.8.186.151";     // <-- ใส่ของคุณ
const PORT = 30120;             // <-- ใส่ของคุณ (ปกติ 30120)

const INFO_URL = `http://${IP}:${PORT}/info.json`;
const MASTERLIST_URL = `https://servers-frontend.fivem.net/api/servers/single/${IP}_${PORT}`;

function toJSON(res) { return res.text().then(t => { try { return JSON.parse(t); } catch { throw new Error("json-parse-failed"); } }); }

async function fetchWithTimeout(url, ms = 6000, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort("timeout"), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { Accept: "application/json" }, cf: { cacheTtl: 0 } });
    if (!res.ok) throw new Error("bad-status-" + res.status);
    return await toJSON(res);
  } finally { clearTimeout(timer); }
}

function extractClientsMax(obj) {
  // รองรับทั้ง info.json และ masterlist ที่โครงสร้างต่างกัน
  // 1) กรณี info.json
  if (typeof obj?.clients !== "undefined" || obj?.vars) {
    const clients = Number.isFinite(obj.clients) ? obj.clients : 0;
    const vars = obj.vars || {};
    const key = Object.keys(vars).find(k => k.toLowerCase() === "sv_maxclients");
    const max = key ? Number(vars[key]) : null;
    return { clients, max };
  }
  // 2) กรณี masterlist (มี Data)
  const data = obj?.Data || obj?.data || obj || {};
  const clients = Number(data?.clients) || 0;
  // key ใน masterlist อาจเป็น "sv_maxclients" หรือ "sv_maxClients"
  const vk = Object.keys(data).find(k => k.toLowerCase() === "sv_maxclients");
  const max = vk ? Number(data[vk]) : (Number(data?.vars?.sv_maxclients) || Number(data?.vars?.sv_maxClients) || null);
  return { clients, max };
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const DEBUG = url.searchParams.get("debug") === "1";

  try {
    // 1) ลองยิงเข้า IP ตรงก่อน
    const info = await fetchWithTimeout(INFO_URL, 6000);
    const { clients, max } = extractClientsMax(info);
    const body = { ok: true, state: "online", clients, max };
    if (DEBUG) body.note = "direct";
    return new Response(JSON.stringify(body), {
      headers: { "content-type":"application/json", "access-control-allow-origin":"*", "cache-control":"no-store" }
    });
  } catch (e1) {
    try {
      // 2) fallback: masterlist API (HTTPS)
      const m = await fetchWithTimeout(MASTERLIST_URL, 6000);
      const { clients, max } = extractClientsMax(m);
      const online = Number(clients) > 0 || Number(max) > 0; // มีค่าแปลว่าออนไลน์
      const body = { ok: true, state: online ? "online" : "offline", clients, max };
      if (DEBUG) body.note = "masterlist";
      return new Response(JSON.stringify(body), {
        headers: { "content-type":"application/json", "access-control-allow-origin":"*", "cache-control":"no-store" }
      });
    } catch (e2) {
      const body = { ok:false, state:"offline", clients:0, max:null };
      if (DEBUG) body.note = String(e1?.message || e2?.message || "unknown");
      return new Response(JSON.stringify(body), {
        headers: { "content-type":"application/json", "access-control-allow-origin":"*", "cache-control":"no-store" }
      });
    }
  }
}

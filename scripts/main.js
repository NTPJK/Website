// The Living City — front script
// Load year
document.getElementById("year").textContent = new Date().getFullYear();

// ====== Status (ง่ายสุด: ดึงจาก FiveM masterlist โดยตรง) ======
// ตั้งค่า IP/PORT ของเซิร์ฟเวอร์ที่นี่
const FIVEM_IP = "119.8.186.151";   // <-- แก้ของคุณ
const FIVEM_PORT = 30120;           // <-- แก้ของคุณ (ปกติ 30120)

// endpoints ของ masterlist (ลองหลายแบบ)
const ML_COLON = `https://servers-frontend.fivem.net/api/servers/single/${FIVEM_IP}:${FIVEM_PORT}`;
const ML_UNDERSCORE = `https://servers-frontend.fivem.net/api/servers/single/${FIVEM_IP}_${FIVEM_PORT}`;
const ML_SEARCH = `https://servers-frontend.fivem.net/api/servers/?offset=0&limit=1&sortBy=clients&search=${encodeURIComponent(FIVEM_IP + ":" + FIVEM_PORT)}`;

async function tryFetch(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("bad " + r.status);
  return await r.json();
}
function extractFromMaster(o) {
  const data = o?.Data || (Array.isArray(o?.data) ? o.data[0] : o) || {};
  const clients = Number(data?.clients) || 0;
  const vars = data?.vars || data || {};
  // หา key sv_maxclients แบบไม่แคร์ตัวพิมพ์
  const key = Object.keys(vars).find(k => k.toLowerCase() === "sv_maxclients");
  const max = key ? Number(vars[key]) : null;
  return { clients, max };
}

async function loadStatus() {
  const el = document.getElementById("statusBody");
  try {
    let j = null;
    try { j = await tryFetch(ML_COLON); }
    catch { try { j = await tryFetch(ML_UNDERSCORE); } 
    catch { j = await tryFetch(ML_SEARCH); } }

    const { clients, max } = extractFromMaster(j);
    // เก็บเวลา online ล่าสุดไว้เดาว่า "กำลังรีสตาร์ท"
    const now = Date.now();
    if (clients > 0) localStorage.setItem("tlc_last_ok", String(now));

    let state = "ออฟไลน์";
    if (clients > 0) state = "ออนไลน์";
    else {
      const last = Number(localStorage.getItem("tlc_last_ok") || 0);
      const age = (now - last) / 1000;
      if (last > 0 && age <= 180) state = "กำลังรีสตาร์ท";
    }

    el.innerHTML = `
      <div class="stat"><div class="k">${state}</div><div class="s">Server status</div></div>
      <div class="stat"><div class="k">${clients}/${max ?? "–"}</div><div class="s">Players</div></div>
    `;
  } catch (e) {
    el.textContent = "ออฟไลน์";
  }
}

// เรียกครั้งแรก + รีเฟรชทุก 15 วิ
loadStatus();
setInterval(loadStatus, 15000);


// ========= News =========
async function loadNews() {
  const el = document.getElementById("newsList");
  try {
    const r = await fetch("/data/news.json", { cache: "no-store" });
    const items = await r.json();
    el.innerHTML = items.slice(0, 6).map(n => `
      <article class="news-card">
        <h3>${n.title}</h3>
        <div class="meta">${n.date}</div>
        <p>${n.text}</p>
      </article>
    `).join("");
  } catch {
    el.innerHTML = "<p>ยังไม่มีข่าว</p>";
  }
}

// ========= Gallery =========
async function loadGallery() {
  const el = document.getElementById("galleryGrid");
  try {
    const r = await fetch("/data/gallery.json", { cache: "no-store" });
    const items = await r.json();
    el.innerHTML = items.slice(0, 12).map(src => `<img loading="lazy" src="${src}" alt="">`).join("");
  } catch {
    el.innerHTML = "<p>ยังไม่มีรูปภาพ</p>";
  }
}

// เริ่มทำงาน + รีเฟรชสถานะทุก 15 วิ (ปรับได้)
loadStatus();
setInterval(loadStatus, 15000);
loadNews();
loadGallery();

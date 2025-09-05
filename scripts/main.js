// The Living City — front script
// Load year
document.getElementById("year").textContent = new Date().getFullYear();

// ========= Status (แสดง ออนไลน์/ออฟไลน์/กำลังรีสตาร์ท + ผู้เล่น x/slot) =========
async function loadStatus() {
  const el = document.getElementById("statusBody");
  const api = "/api/status"; // เรียก Pages Functions ที่เราสร้างไว้

  try {
    const r = await fetch(api, { cache: "no-store" });
    const j = await r.json();

    // เก็บเวลาที่ "เคยออนไลน์ล่าสุด" ไว้ใน browser เพื่อเดาสถานะ 'กำลังรีสตาร์ท'
    const now = Date.now();
    if (j.ok && j.state === "online") {
      localStorage.setItem("tlc_last_ok", String(now));
    }

    // แปลงสถานะเป็น 3 แบบ
    let state = "ออฟไลน์";
    if (j.state === "online") {
      state = "ออนไลน์";
    } else {
      const lastOk = Number(localStorage.getItem("tlc_last_ok") || 0);
      const ageSec = (now - lastOk) / 1000;
      if (lastOk > 0 && ageSec <= 180) { // ภายใน 3 นาทีหลังจากเคยออนไลน์
        state = "กำลังรีสตาร์ท";
      }
    }

    const players = (j.clients ?? "—");
    const max = (j.max ?? "—");

    el.innerHTML = `
      <div class="stat">
        <div class="k">${state}</div>
        <div class="s">Server status</div>
      </div>
      <div class="stat">
        <div class="k">${players}/${max}</div>
        <div class="s">Players</div>
      </div>
    `;
  } catch {
    el.textContent = "ออฟไลน์";
  }
}

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

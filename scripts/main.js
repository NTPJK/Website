// The Living City — front script
// Load year
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("copyCmd")?.addEventListener("click", () => {
  navigator.clipboard.writeText("connect 119.8.186.151:30120").then(() => {
    alert("คัดลอกแล้ว: connect 119.8.186.151:30120");
  });
});


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

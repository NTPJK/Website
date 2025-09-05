// The Living City — front script
// Load year
document.getElementById("year").textContent = new Date().getFullYear();

// Status
async function loadStatus() {
  const el = document.getElementById("statusBody");
  const api = window.TLC?.STATUS_API;
  if (!api) { el.textContent = "STATUS_API not set"; return; }
  try {
    const r = await fetch(api, { cache: "no-store" });
    const j = await r.json();
    if (!j.ok) throw new Error("bad");
    const d = j.data || {};
    const online = d.clients ?? "—";
    const max = d?.vars?.sv_maxClients ?? "—";
    const map = d?.vars?.mapname ?? "—";
    const hostname = d?.hostname ?? "—";
    el.innerHTML = `
      <div class="stat"><div class="k">${online}/${max}</div><div class="s">Players</div></div>
      <div class="stat"><div class="k">${map}</div><div class="s">Map</div></div>
      <div class="stat"><div class="k">${hostname}</div><div class="s">Hostname</div></div>
    `;
  } catch (e) {
    el.textContent = "Offline or unreachable.";
  }
}

// News
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

// Gallery
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

loadStatus();
loadNews();
loadGallery();

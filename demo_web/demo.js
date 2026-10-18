// Ban demo tinh: tra loi cac goi /api/... bang du lieu da xuat san trong data/api/.
// Duong dan tuong doi nen chay duoc ca o goc ten mien (Vercel) lan thu muc con (GitHub Pages).
(() => {
  const BASE = new URL(".", location.href).href;                     // thu muc chua index.html
  const real = window.fetch.bind(window);
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  // /api/runs/11/raw/x -> data/api/runs/11/raw/x.jpg ; /api/... khac -> data/api/...
  const toFile = p => BASE + "data" + p.replace(/^(\/api\/runs\/[^/]+\/raw\/[^/?#]+)$/, "$1.jpg");
  // anh trong du lieu (preview, raw) duoc trinh duyet tai thang qua <img src>, khong qua fetch -> doi san duong dan
  const fixImgs = t => t.replace(/"\/api\/runs\/(\d+)\/(preview|raw)\/([^"]+)"/g,
    (_, id, kind, fn) => JSON.stringify(toFile(`/api/runs/${id}/${kind}/${fn}`)));

  window.fetch = async (input, opt = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (!url.pathname.startsWith("/api/")) return real(input, opt);
    const method = (opt.method || (typeof input === "string" ? "GET" : input.method) || "GET").toUpperCase();
    if (method !== "GET") return json({ detail: "Bản demo chỉ xem: thao tác này cần Web QC chạy thật cùng CVAT (xem GitHub)." }, 403);
    const p = url.pathname;
    const q = [...url.searchParams].map(([k, v]) => `${k}-${v}`).join(".");
    const bin = /\.(jpe?g|png|csv|md|pdf|docx|txt)$/i.test(p) || /\/(preview|raw)\//.test(p) || /\/file$/.test(p);
    const r = await real(bin ? toFile(p) : BASE + "data" + p + (q ? "." + q : "") + ".json", { cache: "no-store" });
    if (!r.ok) return json({ detail: "Bản demo không có dữ liệu này: cần Web QC kết nối CVAT thật." }, 404);
    if (bin) return r;
    return new Response(fixImgs(await r.text()), { status: 200, headers: { "content-type": "application/json" } });
  };

  // link tai file (Excel/CSV, file guideline) la <a href="/api/...">: doi sang file tinh khi bam
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest('a[href^="/api/"]');
    if (a) a.href = toFile(a.getAttribute("href"));
  }, true);

  // anh app tu ghep duong dan (vd /api/runs/11/preview/<ten>) trong innerHTML -> doi ngay khi anh xuat hien
  const fixImg = im => { const s = im.getAttribute("src"); if (s && s.startsWith("/api/")) im.setAttribute("src", toFile(s)); };
  new MutationObserver(ms => ms.forEach(m => {
    if (m.type === "attributes") return fixImg(m.target);
    m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.tagName === "IMG") fixImg(n); n.querySelectorAll && n.querySelectorAll('img[src^="/api/"]').forEach(fixImg); });
  })).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });

  if (!location.hash) history.replaceState(null, "", "#tab=auto");
})();

// Ban demo tinh: tra loi cac goi /api/... bang du lieu da xuat san trong data/api/
(() => {
  const real = window.fetch.bind(window);
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  window.fetch = async (input, opt = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (!url.pathname.startsWith("/api/")) return real(input, opt);
    const method = (opt.method || (typeof input === "string" ? "GET" : input.method) || "GET").toUpperCase();
    if (method !== "GET") return json({ detail: "Bản demo chỉ xem: thao tác này cần Web QC chạy thật cùng CVAT (xem GitHub)." }, 403);
    const p = url.pathname.slice(5);
    const q = [...url.searchParams].map(([k, v]) => `${k}-${v}`).join(".");
    const bin = /\.(jpe?g|png|csv|md|pdf|docx|txt)$/i.test(p) || /\/(preview|raw)\//.test(p) || /\/file$/.test(p);
    const file = "/data/api/" + p + (q ? "." + q : "") + (bin ? (/\/raw\//.test(p) ? ".jpg" : "") : ".json");
    const r = await real(file, { cache: "no-store" });
    if (!r.ok) return json({ detail: "Bản demo không có dữ liệu này: cần Web QC kết nối CVAT thật." }, 404);
    if (bin) return r;
    return new Response(await r.text(), { status: 200, headers: { "content-type": "application/json" } });
  };
  if (!location.hash) history.replaceState(null, "", "#tab=auto");
})();

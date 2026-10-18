# Web QC – bản demo tĩnh (Vercel)

Bản chỉ xem của Web QC, dùng kết quả review thật trên ảnh BDD100K (job 39, 4, 2 trên CVAT localhost).
Không chạy review mới (phần đó cần GPU và CVAT, xem README ở gốc repo).

Deploy: Vercel → Add New Project → chọn repo `cvat-2d-qc` → Root Directory = `demo_web` → Framework Preset = Other → Deploy.

Tạo lại: chạy Web QC trên bản sao dữ liệu rồi xuất các trả lời `/api/...` vào `data/api/` (không chứa token, mật khẩu, khoá).

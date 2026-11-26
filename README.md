# 🌿 Thanh Hóa Tourism AI — Cổng Thông Tin Du Lịch, Văn Hóa & Ẩm Thực Xứ Thanh

Nền tảng web tương tác giới thiệu **Du lịch – Văn hóa – Ẩm thực tỉnh Thanh Hóa** tích hợp **Trợ lý Trí tuệ nhân tạo KAT (Gemini AI)**, bản đồ tương tác thời gian thực và hệ thống đa ngôn ngữ.

* 🌐 **Website trải nghiệm trực tuyến:** [https://thanhhoa-tourism-ai.onrender.com/](https://thanhhoa-tourism-ai.onrender.com/)
* 📦 **Mã nguồn:** [https://github.com/khapromcvn25/thanhhoa-tourism-AI](https://github.com/khapromcvn25/thanhhoa-tourism-AI)

---

## ✨ Tính năng nổi bật

* **Nội dung 3 trụ cột (11 địa điểm & đặc sản tiêu biểu):** Du lịch & Thiên nhiên (*Pù Luông, Sầm Sơn, Bến En, Cẩm Lương*), Ẩm thực (*Nem chua, Bánh gai Tứ Trụ, Hải sản*), Văn hóa & Lịch sử (*Thành Nhà Hồ, Lam Kinh, Văn hóa Đông Sơn, Hàm Rồng*).
* **Đa ngôn ngữ & Thuyết minh giọng nói (Audio Guide):** Hỗ trợ trọn vẹn **6 ngôn ngữ** (Tiếng Việt, Anh, Nhật, Hàn, Trung, Pháp) kèm tính năng đọc thuyết minh tự động theo đúng ngôn ngữ đang xem.
* **Trợ lý Du lịch AI — KAT:** Tích hợp **Google Gemini API**, gắn cố định trên thanh điều hướng và nhúng trực tiếp nút *"Hỏi KAT"* theo ngữ cảnh từng địa điểm để gợi ý lịch trình, ăn uống, di chuyển.
* **Bản đồ tương tác & Thời tiết thực tế:** Bản đồ **React-Leaflet** kết hợp nền Google Maps tiếng Việt, phân loại ghim màu theo danh mục, hiệu ứng bay tới tọa độ (*Fly-to*) và widget cập nhật thời tiết GPS thời gian thực.
* **Sổ tay hành trình cá nhân:** Lưu địa điểm yêu thích, đánh dấu đã ghé thăm, tự động tính khoảng cách GPS gợi ý 3 địa điểm gần nhất.
* **Giao diện hiện đại & Quản trị nội dung:** Hỗ trợ chế độ Sáng/Tối (Dark Mode), tối ưu thiết bị di động và tích hợp trang quản trị ẩn (**Admin Panel**) bảo vệ bằng mã PIN.

---

## 🛠️ Công nghệ sử dụng

* **Frontend (`client/`):** React, Vite, Tailwind CSS, `react-router-dom`, `i18next`, `react-leaflet`, `lucide-react`.
* **Backend (`server/`):** Node.js, Express, Google Gemini API, `helmet`, `express-rate-limit`.
* **Triển khai (Deployment):** GitHub, Render, nhúng tích hợp Google Sites.

---

## 👥 Thành viên thực hiện & Phân công nhiệm vụ

Dự án được thực hiện bởi **Nhóm 1 – Lớp 12A3 – Trường THPT Trần Văn Ơn**:

| STT | Họ và tên | Nhiệm vụ được giao | Tiến độ hoàn thành |
| :-: | :--- | :--- | :-: |
| 1 | Trần Hương Giang | Thiết kế đầu trang | 100% |
| 2 | Lê Phương Anh | Thiết kế trang con (Văn hóa) | 100% |
| 3 | Hồng Nhật Minh | Thiết kế trang con (Du lịch) | 100% |
| 4 | Lê Thị Nhi | Thiết kế trang con (Ẩm thực) | 100% |
| 5 | Nguyễn Minh Kha | Thiết kế bản đồ, AI | 100% |
| 6 | Nguyễn Thị Triệu Vy | Thiết kế đầu trang | 100% |
| 7 | Phạm Phúc Thiện | Thiết kế chân trang | 100% |

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu môi trường
* **Node.js** phiên bản `18.x` trở lên (khuyến nghị `20.x` hoặc `24.x`).
* **npm** đi kèm Node.js.
* Khóa API từ **Google AI Studio (Gemini API Key)**.

### 2. Tải mã nguồn & Cài đặt thư viện
```bash
# Clone kho lưu trữ về máy
git clone [https://github.com/khapromcvn25/thanhhoa-tourism-AI.git](https://github.com/khapromcvn25/thanhhoa-tourism-AI.git)
cd thanhhoa-tourism-AI

# Cài đặt toàn bộ thư viện cho cả thư mục gốc, server và client
npm run install:all
```

### 3. Cấu hình biến môi trường (`.env`)
Tạo file `.env` trong thư mục `server/` (hoặc khai báo trực tiếp trong mục **Environment** trên Render) với các thông số cần thiết:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
ADMIN_PIN=250409
```
*(Thay thế giá trị bằng API Key và mã PIN quản trị thực tế của dự án).*

### 4. Chạy trên máy cục bộ (Local Development)
Mở 2 cửa sổ Terminal để chạy song song backend và frontend (hoặc dùng lệnh `npm run dev` ở thư mục gốc nếu đã cấu hình sẵn):

```bash
# Terminal 1: Khởi chạy Backend
cd server
npm run dev

# Terminal 2: Khởi chạy Frontend
cd client
npm run dev
```

### 5. Đóng gói & Triển khai lên Render (Production)
* **Build Command:**
  ```bash
  NODE_ENV=development npm run install:all && npm run build
  ```
* **Start Command:**
  ```bash
  npm start
  ```
* **Truy cập trang Quản trị (Admin Panel):** Mở đường dẫn `/admin-panel-secret` trực tiếp từ tên miền Render để đăng nhập bằng mã PIN và quản lý dữ liệu địa điểm.

---

## ⚠️ Miễn trừ trách nhiệm (Disclaimer)

1. **Mục đích sử dụng:** Website và mã nguồn này được xây dựng phục vụ cho mục đích học tập, nghiên cứu và quảng bá hình ảnh du lịch địa phương trong khuôn khổ môn học, hoàn toàn phi thương mại.
2. **Tính chính xác của thông tin:** Thông tin về địa điểm, khoảng cách, địa danh hành chính và gợi ý du lịch chỉ mang tính chất tham khảo. Các thông số thực tế (giá vé, giờ mở cửa, quy định địa phương, đơn vị hành chính sau điều chỉnh) có thể thay đổi theo thời điểm.
3. **Nội dung do Trí tuệ nhân tạo (KAT) tạo ra:** Các phản hồi và lịch trình do trợ lý AI KAT đề xuất được sinh tự động thông qua mô hình ngôn ngữ lớn (Gemini) và có thể phát sinh sai sót. Người dùng nên tự kiểm chứng lại các thông tin quan trọng trước khi lên kế hoạch di chuyển thực tế.
4. **Tài nguyên bên thứ ba:** Các hình ảnh minh họa (trích nguồn mở từ Wikimedia Commons), dữ liệu bản đồ (Google Maps / Leaflet) và dự báo thời tiết thuộc quyền sở hữu của các tác giả và nhà cung cấp dịch vụ tương ứng. Nhóm phát triển không sở hữu bản quyền các tài nguyên bên thứ ba này và sẵn sàng gỡ bỏ/chỉnh sửa ngay khi có yêu cầu từ chủ sở hữu.

---

## ©️ Bản quyền (Copyright)

**Bản quyền © 2026 thuộc về Nhóm 1, Lớp 12A3, Trường THPT Trần Văn Ơn.**

Mọi hành vi sao chép, chỉnh sửa hoặc sử dụng lại nội dung và mã nguồn của dự án cho mục đích học tập, tham khảo vui lòng ghi rõ nguồn gốc tác giả.

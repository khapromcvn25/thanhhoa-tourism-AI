# Thanh Hóa Tourism

Website quảng bá du lịch và văn hóa tỉnh Thanh Hóa. React + Vite + Tailwind (client), Node.js + Express (server). Hỗ trợ tiếng Việt / English và Dark / Light.

**Hướng dẫn thay ảnh, đổi nội dung, gắn Gemini cho chatbot KAT, triển khai: xem [HUONG_DAN.md](./HUONG_DAN.md).**

## Chạy nhanh

Yêu cầu Node.js >= 18.18.

```bash
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev                  # server: 5000, client: 5173
npm test                     # kiểm thử phần server
```

Mở http://localhost:5173. Trang quản trị cần đặt `ADMIN_PIN` trong `server/.env` (xem hướng dẫn mục 2). Chatbot KAT cần `GEMINI_API_KEY` (mục 5).

Production:

```bash
npm run build                # build client vào client/dist
npm start                    # Express phục vụ API + client/dist + fallback SPA
```

## Tính năng

- **Trang chủ** với hiệu ứng cuộn AOS, ảnh nền hero, điểm đến nổi bật, chủ đề, kêu gọi hành động.
- **Danh mục** Du lịch / Ẩm thực / Văn hóa dạng lưới thẻ, có trạng thái đang tải, lỗi, rỗng.
- **Chi tiết địa điểm** (`/place/:slug`): băng chuyền Swiper tự chuyển ảnh, Lightbox phóng to, địa chỉ, nút bản đồ và chỉ đường, mô tả, các nét nổi bật dạng thẻ có tick xanh, địa điểm liên quan.
- **Bản đồ** Leaflet: ghim tùy chỉnh theo danh mục, popup có ảnh nhỏ và nút "Xem chi tiết", lọc theo danh mục, bản đồ nền tự đổi tông khi Dark mode.
- **Chatbot KAT**: widget nổi, gọi Gemini qua server (không lộ khóa), chỉ trả lời về Thanh Hóa, biết nội dung địa điểm hiện có, giới hạn tốc độ.
- **Quản trị** (URL ẩn, mã PIN do server kiểm tra): thêm, sửa, xóa địa điểm; sửa mô tả, địa chỉ, nét nổi bật, ảnh, tọa độ bằng hai cột Việt / Anh.

## Cấu trúc

```
server/
  data/places.seed.json        dữ liệu mẫu (places.json được tự tạo khi chạy)
  src/
    config/env.js              biến môi trường
    lib/store.js               kho dữ liệu JSON, ghi nguyên tử, hàng đợi ghi
    lib/validate.js            kiểm tra dữ liệu địa điểm
    lib/auth.js                PIN (so sánh thời gian không đổi) + token HMAC
    lib/gemini.js              system prompt KAT + gọi Gemini
    controllers/               places, admin, chat (không phụ thuộc express, dễ test)
    routes/                    health, places, admin, chat
    middleware/                requireAdmin, errorHandler
    app.js, index.js           helmet (CSP), cors, rate limit, phục vụ client build
  test/                        35 test (node --test), không cần mạng

client/src
  i18n/                        react-i18next, locales/vi.json + en.json
  context/                     ThemeContext, PlacesContext
  config/                      routes.js, site.js
  components/
    layout/                    Header (sticky), Footer, Layout
    common/                    LanguageToggle, ThemeToggle, SafeImage, StateViews...
    places/                    PlaceCard, PlaceGrid, ImageCarousel, Highlights
    map/PlacesMap.jsx          Leaflet
    chat/                      ChatWidget, ChatMessage
    admin/                     PinGate, PlaceEditor, fields
  pages/                       Home, CategoryPage, PlaceDetail, MapPage, AdminPanel, NotFound
  lib/                         api, adminApi, text, image, chatFormat, placeForm, aos
```

## Routes

| Đường dẫn | Trang |
|---|---|
| `/` | Trang chủ |
| `/tourism`, `/cuisine`, `/culture` | Danh mục |
| `/place/:slug` | Chi tiết địa điểm |
| `/map` (`?place=slug` mở sẵn popup) | Bản đồ |
| `/admin-panel-secret` | Quản trị (đổi bằng `VITE_ADMIN_PATH`) |

## Ghi chú

- Ảnh trong dữ liệu mẫu nhúng từ Wikimedia Commons, xem [IMAGE_CREDITS.md](./IMAGE_CREDITS.md). Hai địa điểm (Bến En, Cẩm Lương) chưa có ảnh.
- Tọa độ và địa chỉ trong dữ liệu mẫu là gần đúng, cần đối chiếu trước khi công khai.
- Email và số điện thoại ở footer là dữ liệu mẫu, thay trong `client/.env`.
- Giao diện trang quản trị chỉ có tiếng Việt; phần nội dung công khai đầy đủ hai ngôn ngữ.

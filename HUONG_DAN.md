# Hướng dẫn sử dụng và tùy chỉnh

Tài liệu này hướng dẫn từng việc bạn sẽ làm sau khi nhận dự án: chạy thử, đổi nội dung, thay ảnh, gắn Gemini cho chatbot KAT và đưa lên máy chủ thật.

## Mục lục

1. [Chạy dự án lần đầu](#1-chạy-dự-án-lần-đầu)
2. [Vào trang quản trị](#2-vào-trang-quản-trị)
3. [Thay đổi nội dung](#3-thay-đổi-nội-dung)
4. [Thay ảnh](#4-thay-ảnh)
5. [Gắn Gemini API cho chatbot KAT](#5-gắn-gemini-api-cho-chatbot-kat)
6. [Đưa lên máy chủ thật](#6-đưa-lên-máy-chủ-thật)
7. [Xử lý sự cố](#7-xử-lý-sự-cố)
8. [Tham chiếu nhanh](#8-tham-chiếu-nhanh)

---

## 1. Chạy dự án lần đầu

Cần Node.js 18.18 trở lên.

```bash
npm run install:all                  # cài thư viện cho root, server và client
cp server/.env.example server/.env   # Windows PowerShell: copy server\.env.example server\.env
cp client/.env.example client/.env
npm run dev                          # chạy server (cổng 5000) và client (cổng 5173)
```

Mở http://localhost:5173. Kiểm tra API tại http://localhost:5173/api/health (phải thấy `"status":"ok"`).

Kiểm thử phần server (không cần mạng): `npm test`.

Lần đầu chạy, server tự tạo file `server/data/places.json` từ dữ liệu mẫu `server/data/places.seed.json` (11 địa điểm). Từ đó mọi chỉnh sửa trong trang quản trị được ghi vào `places.json`.

---

## 2. Vào trang quản trị

### Bật trang quản trị

Mặc định trang quản trị bị **tắt** cho đến khi bạn đặt mã PIN. Mở `server/.env` và điền:

```env
ADMIN_PIN=482913
ADMIN_TOKEN_SECRET=dán-chuỗi-ngẫu-nhiên-dài-vào-đây
```

- `ADMIN_PIN`: mã bạn sẽ nhập trên màn hình đăng nhập. Nên dùng 6 ký tự trở lên và không dùng ngày sinh hay số dễ đoán.
- `ADMIN_TOKEN_SECRET`: chuỗi bí mật dùng để ký phiên đăng nhập. Tạo nhanh bằng lệnh:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Nếu bỏ trống, trang quản trị vẫn chạy nhưng phiên đăng nhập sẽ mất mỗi lần server khởi động lại.

Server tự khởi động lại khi bạn lưu `.env` (chế độ `npm run dev`). Nếu chạy `npm start`, hãy tắt rồi chạy lại.

### Truy cập

Mở http://localhost:5173/admin-panel-secret và nhập PIN. Trang này không có nút hay liên kết nào ở giao diện người dùng.

- Nhập sai quá 8 lần trong 15 phút, địa chỉ IP đó bị khóa tạm thời.
- Phiên đăng nhập hết hạn sau 8 giờ (đổi bằng `ADMIN_TOKEN_TTL_HOURS`) hoặc khi bạn đóng tab.

### Đổi địa chỉ ẩn

Sửa `client/.env`:

```env
VITE_ADMIN_PATH=/ten-bi-mat-cua-ban
```

Giá trị phải bắt đầu bằng `/`. Khởi động lại `npm run dev` (hoặc build lại bằng `npm run build`) để áp dụng.

Lưu ý: địa chỉ ẩn chỉ là một lớp che. Người xem mã nguồn của trang vẫn tìm ra được. Phần bảo vệ thật sự là mã PIN do server kiểm tra, nên hãy đặt PIN đủ khó đoán.

---

## 3. Thay đổi nội dung

Nội dung của website nằm ở ba nơi, tùy loại.

| Muốn đổi | Sửa ở đâu |
|---|---|
| Mô tả, địa chỉ, nét nổi bật, ảnh, tọa độ của từng địa điểm; thêm/xóa địa điểm | Trang quản trị |
| Chữ cố định trên giao diện (menu, tiêu đề trang chủ, footer, nút bấm) | `client/src/i18n/locales/vi.json` và `en.json` |
| Email, số điện thoại, liên kết mạng xã hội ở footer | `client/.env` |

### 3.1. Sửa địa điểm bằng trang quản trị

1. Đăng nhập (mục 2).
2. Chọn một địa điểm ở danh sách bên trái, hoặc bấm **Thêm địa điểm**.
3. Sửa các mục, mỗi ô có hai cột **Tiếng Việt** và **English**:
   - **Tên**, **Mô tả ngắn** (hiện trên thẻ), **Mô tả chi tiết** (cách đoạn bằng một dòng trống), **Địa chỉ cụ thể**.
   - **Các nét nổi bật**: mỗi dòng là một thẻ có dấu tick xanh ở trang chi tiết. Bấm **Thêm nét nổi bật** để thêm dòng.
   - **Hình ảnh**: xem mục 4.
   - **Vị trí trên bản đồ**: vĩ độ và kinh độ. Để trống nếu không muốn có ghim.
   - **Hiển thị ở mục "Nổi bật"**: tích để địa điểm hiện ở trang chủ.
4. Bấm **Lưu thay đổi**. Thay đổi có hiệu lực ngay trên website, không cần build lại.

Một số lưu ý:

- Tiếng Việt là bắt buộc. Nếu để trống phần tiếng Anh, website tự dùng nội dung tiếng Việt khi người xem chọn EN.
- **Slug** (đường dẫn như `pu-luong`) chỉ đặt được lúc tạo và không đổi được sau đó, vì nó là một phần địa chỉ trang. Khi tạo mới, slug được gợi ý tự động từ tên tiếng Việt.
- Lấy tọa độ: mở Google Maps, bấm chuột phải vào vị trí, bấm vào dòng số đầu tiên để sao chép "vĩ độ, kinh độ". Vĩ độ của Thanh Hóa khoảng 19 đến 21, kinh độ khoảng 104 đến 106. Hệ thống từ chối tọa độ nằm ngoài Việt Nam để bắt lỗi nhập nhầm.
- Tọa độ trong dữ liệu mẫu chỉ là vị trí gần đúng. Hãy kiểm tra và chỉnh lại cho chính xác.
- Địa chỉ trong dữ liệu mẫu dùng tên đơn vị hành chính theo cách gọi thường dùng. Tên huyện, xã có thể đã thay đổi sau các đợt sáp nhập, hãy đối chiếu và cập nhật.
- Thứ tự hiển thị: số nhỏ hiển thị trước. Để trống thì xếp cuối.
- Xóa địa điểm là vĩnh viễn (có hộp thoại xác nhận).
- **Chatbot KAT tự biết nội dung mới**: mỗi lượt chat, server nạp danh sách địa điểm hiện tại vào hướng dẫn của KAT, nên sửa ở trang quản trị là KAT cập nhật theo.

### 3.2. Dữ liệu được lưu ở đâu

- File chạy thật: `server/data/places.json`. Hãy sao lưu file này định kỳ.
- Muốn quay về dữ liệu mẫu: dừng server, xóa `places.json`, chạy lại. Server tạo lại từ `places.seed.json`.
- Có thể sửa trực tiếp `places.json` bằng trình soạn thảo, nhưng phải dừng server trước khi sửa và giữ đúng cú pháp JSON. Nếu file hỏng, server từ chối khởi động và báo lỗi, không ghi đè mất dữ liệu.
- Muốn đổi vị trí lưu: đặt `DATA_FILE=đường/dẫn/places.json` trong `server/.env`.

### 3.3. Sửa chữ cố định của giao diện

Mở `client/src/i18n/locales/vi.json` (tiếng Việt) và `en.json` (tiếng Anh). Cả hai file có cùng cấu trúc khóa. Ví dụ đổi tiêu đề trang chủ:

```json
"home": {
  "hero": {
    "title": "Khám phá Thanh Hóa"
  }
}
```

Sửa giá trị ở bên phải, giữ nguyên khóa ở bên trái. Khi thêm hoặc xóa khóa, làm đồng thời ở cả hai file.

Các khóa thường cần sửa:

- `brand.name`, `brand.tagline`: tên và khẩu hiệu ở logo.
- `home.hero.*`: phần đầu trang chủ. `home.why.*`: ba khối "Vì sao chọn Thanh Hóa". `home.cta.*`: khối kêu gọi cuối trang.
- `categories.*`: tiêu đề và mô tả của ba trang danh mục.
- `footer.address`: địa chỉ ở footer.
- `kat.welcome` và `kat.suggestions`: lời chào và các câu hỏi gợi ý của KAT.

### 3.4. Email, số điện thoại, mạng xã hội

Sửa `client/.env`:

```env
VITE_CONTACT_EMAIL=lienhe@tenmiencuaban.vn
VITE_CONTACT_PHONE=+84 912 345 678
VITE_SOCIAL_FACEBOOK=https://www.facebook.com/trang-cua-ban
VITE_SOCIAL_YOUTUBE=https://www.youtube.com/@kenh-cua-ban
VITE_SOCIAL_INSTAGRAM=https://www.instagram.com/tai-khoan-cua-ban
```

Giá trị mặc định (`contact@example.com`, `+84 900 000 000`) chỉ là dữ liệu mẫu, **bắt buộc thay trước khi công khai**. Biến `VITE_*` được nhúng vào lúc build, nên đổi xong phải khởi động lại `npm run dev` hoặc chạy lại `npm run build`.

### 3.5. Màu sắc, font chữ

- Màu: mọi màu là biến ở đầu `client/src/index.css` (`:root` cho chế độ sáng, `.dark` cho chế độ tối). Giá trị dạng `R G B`, ví dụ `--c-brand: 14 94 79;`.
- Font: khai báo ở `client/index.html` (Google Fonts) và `client/tailwind.config.js` (`fontFamily`). Playfair Display dùng cho tiêu đề, Plus Jakarta Sans dùng cho nội dung.
- Logo: biểu tượng trong `client/src/components/common/Logo.jsx`, favicon là `client/public/favicon.svg`.

---

## 4. Thay ảnh

Mỗi địa điểm có một danh sách ảnh. **Ảnh đầu tiên là ảnh đại diện** (hiện trên thẻ, bản đồ và đầu trang chi tiết). Các ảnh còn lại chạy trong băng chuyền ở trang chi tiết và phóng to được bằng Lightbox.

### Cách A. Dán URL ảnh (nhanh nhất)

1. Đăng nhập trang quản trị, chọn địa điểm.
2. Kéo xuống mục **Hình ảnh**.
3. Dán địa chỉ ảnh vào ô URL (bắt đầu bằng `https://`). Ảnh xem trước hiện ngay bên cạnh.
4. Dùng nút mũi tên lên/xuống để đổi thứ tự, nút thùng rác để xóa, **Thêm ảnh** để thêm dòng mới (tối đa 12 ảnh).
5. Bấm **Lưu thay đổi**.

Địa chỉ ảnh phải là đường dẫn trực tiếp đến file ảnh (thường kết thúc bằng `.jpg`, `.png`, `.webp`). Liên kết của trang chia sẻ (ví dụ trang xem ảnh của Google Drive, Facebook) thường **không dùng được**. Nên tải ảnh lên dịch vụ lưu trữ ảnh hoặc dùng cách B.

### Cách B. Dùng ảnh của bạn, lưu cùng website (khuyến nghị cho bản chạy thật)

1. Chuẩn bị ảnh. Gợi ý: chiều rộng 1600 đến 2000 px, định dạng `.jpg` hoặc `.webp`, dung lượng dưới khoảng 500 KB mỗi ảnh. Đặt tên không dấu, không khoảng trắng, ví dụ `pu-luong-1.jpg`.
2. Chép file vào thư mục `client/public/images/places/`.
3. Trong trang quản trị, dán đường dẫn bắt đầu bằng dấu `/`:
   ```
   /images/places/pu-luong-1.jpg
   ```
4. Lưu. Khi chạy `npm run build`, thư mục `public` được chép vào bản build, nên ảnh đi cùng website.

Ưu điểm: không phụ thuộc bên thứ ba, tải nhanh hơn, không lo ảnh bị xóa hay chặn. Nhược điểm: thêm ảnh mới phải chép file rồi build và triển khai lại.

### Cách C. Sửa trực tiếp file dữ liệu

Trong `server/data/places.json` (dừng server trước khi sửa), mỗi địa điểm có mảng `images`:

```json
"images": [
  "/images/places/pu-luong-1.jpg",
  "https://example.com/anh-khac.jpg"
]
```

### Các ảnh đặc biệt

- **Ảnh nền trang chủ**: là ảnh đầu của địa điểm "nổi bật" đầu tiên (theo thứ tự hiển thị) có ảnh. Muốn đổi, thay ảnh đầu của địa điểm đó hoặc đổi thứ tự/tích "Nổi bật" ở địa điểm khác.
- **Ba ô chủ đề** ở trang chủ (Du lịch, Ẩm thực, Văn hóa): lấy ảnh đầu của địa điểm đầu tiên có ảnh trong từng danh mục.
- **Địa điểm chưa có ảnh** hoặc ảnh bị lỗi: website hiện khung nền màu thương hiệu thay vì ảnh vỡ. Trong dữ liệu mẫu, **Vườn quốc gia Bến En** và **Suối cá thần Cẩm Lương** đang chưa có ảnh vì mình không tìm được ảnh có nguồn gốc rõ ràng. Hãy thêm ảnh của bạn.

### Về bản quyền ảnh

Ảnh trong dữ liệu mẫu được nhúng trực tiếp từ Wikimedia Commons. Mỗi ảnh có tác giả và giấy phép riêng, thường yêu cầu ghi nguồn. File `IMAGE_CREDITS.md` liệt kê đường dẫn tới trang của từng ảnh. Tên file ảnh được lấy từ kết quả tìm kiếm, và mình chưa xem trực tiếp từng ảnh, vì vậy hãy mở website, kiểm tra ảnh có đúng địa điểm không, rồi thay nếu cần. Khi chạy thật, nên thay bằng ảnh bạn có bản quyền (cách B). Footer hiện có dòng ghi nguồn chung ("Một số hình ảnh lấy từ Wikimedia Commons…"); xóa dòng này ở `footer.imageCredit` trong hai file locale khi không còn dùng ảnh Wikimedia.

---

## 5. Gắn Gemini API cho chatbot KAT

Chatbot KAT gọi Gemini **từ server**. Khóa API chỉ nằm trong `server/.env`, trình duyệt không bao giờ nhìn thấy khóa. Khi chưa có khóa, website vẫn chạy bình thường và KAT báo "chưa được cấu hình".

### Bước 1. Lấy khóa API

1. Mở https://aistudio.google.com/apikey và đăng nhập bằng tài khoản Google.
2. Bấm **Create API key** (Tạo khóa API), chọn hoặc tạo một dự án.
3. Sao chép chuỗi khóa (thường bắt đầu bằng `AIza`).

Hạn mức miễn phí và giá thay đổi theo thời gian và theo model. Hãy xem trang giá và hạn mức chính thức của Google trước khi mở cho nhiều người dùng.

### Bước 2. Dán khóa vào server

Mở `server/.env` và điền:

```env
GEMINI_API_KEY=AIza...khóa-của-bạn
GEMINI_MODEL=gemini-3.5-flash-lite
```

- Không có dấu ngoặc kép, không có khoảng trắng thừa.
- **Tuyệt đối không** đặt khóa trong `client/.env` và không đặt tên biến bắt đầu bằng `VITE_`, vì khi đó khóa bị nhúng vào mã gửi cho mọi người truy cập.
- Không đưa `.env` lên GitHub (`.gitignore` đã chặn sẵn).

### Bước 3. Chọn model

Tên model Gemini thay đổi theo thời gian. Mình lấy tên mặc định `gemini-3.5-flash-lite` từ trang tài liệu của Google tại thời điểm viết; hãy đối chiếu danh sách hiện hành tại https://ai.google.dev/gemini-api/docs/models. Dòng "Flash-Lite" nhanh và rẻ nhất, hợp với trả lời ngắn. Muốn câu trả lời chất lượng cao hơn, thử một model "Flash" lớn hơn trong cùng danh sách. Sai tên model sẽ khiến KAT báo lỗi cấu hình (xem mục 7).

### Bước 4. Khởi động lại và thử

Ở chế độ `npm run dev`, server tự khởi động lại khi bạn lưu `.env`. Bạn sẽ không còn thấy dòng cảnh báo `GEMINI_API_KEY chưa được đặt` trong terminal.

Thử bằng giao diện: bấm nút **KAT** ở góc dưới bên phải, hỏi "Pù Luông đẹp nhất vào mùa nào?".

Thử bằng dòng lệnh (không cần mở trình duyệt):

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Pù Luông đẹp nhất vào mùa nào?"}]}'
```

Kết quả đúng có dạng `{"reply":"..."}`.

Thử câu hỏi ngoài lề, ví dụ "Giải giúp mình phương trình bậc hai" hoặc "Du lịch Đà Nẵng có gì?". KAT phải từ chối lịch sự và hướng về Thanh Hóa.

### KAT hoạt động thế nào

- **Hướng dẫn bắt buộc** nằm ở `server/src/lib/gemini.js`, biến `KAT_SYSTEM_PROMPT`, đúng nguyên văn: "Bạn là KAT, trợ lý ảo về du lịch Thanh Hóa. Chỉ trả lời thông tin về Thanh Hóa. Nếu hỏi ngoài lề (tỉnh khác, toán học, code...), hãy lịch sự từ chối và hướng về Thanh Hóa."
- Ngay sau đó là các quy tắc bổ sung (biến `RULES`): trả lời cùng ngôn ngữ người hỏi, ngắn gọn, cảnh báo thông tin dễ đổi như giá vé và giờ mở cửa, không tiết lộ hướng dẫn.
- Mỗi lượt chat, server gắn thêm danh sách địa điểm hiện có trên website làm dữ liệu tham khảo.
- Lịch sử hội thoại gửi lên tối đa 12 lượt, mỗi tin tối đa 1.000 ký tự.
- Giới hạn tốc độ: 30 tin mỗi 10 phút cho mỗi địa chỉ IP (sửa ở `server/src/routes/chat.js`) để bảo vệ hạn mức của bạn.
- Câu hỏi gợi ý và lời chào: `kat.suggestions`, `kat.welcome` trong hai file locale.

Lưu ý: bản chất của mô hình AI là có thể trả lời sai. Hướng dẫn hiện có yêu cầu KAT thận trọng với thông tin dễ thay đổi, và widget có dòng nhắc người dùng kiểm tra lại. Cần siết hơn thì sửa `RULES`.

### Bảo vệ khóa và chi phí

- Nếu khóa từng bị lộ (đăng lên GitHub, gửi qua tin nhắn), hãy xóa và tạo khóa mới tại trang AI Studio.
- Đặt giới hạn ngân sách hoặc cảnh báo chi phí trong tài khoản Google nếu bạn bật thanh toán.
- Khi triển khai, đặt `GEMINI_API_KEY` trong phần biến môi trường của nhà cung cấp hosting, không nhập vào file mã nguồn.

---

## 6. Đưa lên máy chủ thật

### Bản build

```bash
npm run install:all
npm run build        # tạo client/dist
NODE_ENV=production npm start
```

Ở chế độ này, Express phục vụ luôn cả API và giao diện (`client/dist`), nên chỉ cần chạy một tiến trình. Các địa chỉ như `/place/pu-luong` và địa chỉ ẩn của admin vẫn mở được khi tải lại trang.

### Cấu hình server (`server/.env` hoặc biến môi trường của hosting)

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://tenmiencuaban.vn
TRUST_PROXY=true            # khi chạy sau Nginx, Render, Cloudflare...
ADMIN_PIN=...
ADMIN_TOKEN_SECRET=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash-lite
DATA_FILE=/duong/dan/o-dia-ben-vung/places.json
```

Hai điểm dễ quên:

1. **Ổ đĩa bền vững.** Dữ liệu chỉnh sửa lưu trong một file. Các nền tảng có ổ đĩa tạm (một số gói miễn phí của Render, Heroku...) sẽ xóa file này mỗi lần triển khai lại hoặc khởi động lại. Hãy gắn một ổ đĩa lưu trữ bền vững và trỏ `DATA_FILE` vào đó, hoặc dùng máy chủ ảo (VPS).
2. **Biến `VITE_*` nhúng lúc build.** Đặt `client/.env` (thông tin liên hệ, `VITE_ADMIN_PATH`) **trước khi** chạy `npm run build`.

### Nginx (nếu dùng VPS)

```nginx
server {
  server_name tenmiencuaban.vn;
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Sau đó cấp chứng chỉ HTTPS (ví dụ bằng Certbot). Khi dùng trang quản trị, hãy luôn dùng HTTPS để mã PIN không đi qua mạng dưới dạng chữ rõ.

---

## 7. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp và cách xử lý |
|---|---|
| Trang trắng hoặc "Không tải được dữ liệu" | Server chưa chạy hoặc lỗi. Xem terminal, mở `/api/health`. Dev cần cả hai tiến trình (`npm run dev` ở thư mục gốc chạy cả hai). |
| Server báo "Không đọc được dữ liệu địa điểm" | `places.json` sai cú pháp JSON. Sửa lại, hoặc xóa file để tạo lại từ dữ liệu mẫu (mất chỉnh sửa, nên sao lưu trước). |
| Không vào được trang admin, báo "chưa được bật" | Chưa đặt `ADMIN_PIN` trong `server/.env`, hoặc chưa khởi động lại. |
| Admin báo "Nhập sai quá nhiều lần" | Bị khóa 15 phút theo IP. Chờ hoặc khởi động lại server. |
| Admin báo URL ảnh không hợp lệ | URL phải bắt đầu bằng `https://`, `http://` hoặc `/`. Không dùng `data:` hay liên kết có khoảng trắng. |
| Ảnh hiện khung màu thay vì ảnh | URL sai hoặc nguồn chặn ảnh. Mở thẳng URL trên trình duyệt để kiểm tra. Với ảnh nội bộ, kiểm tra file nằm trong `client/public/images/places/` và đúng chữ hoa/thường. |
| KAT báo "chưa được cấu hình" | Chưa có `GEMINI_API_KEY` hoặc chưa khởi động lại server. |
| KAT báo "gặp sự cố cấu hình" | Khóa sai, chưa bật quyền dùng, hoặc sai tên model. Xem terminal của server: dòng `[kat] Gemini trả lỗi 4xx: ...` nêu lý do cụ thể. Kiểm tra `GEMINI_MODEL` với danh sách model hiện hành. |
| KAT báo "quá tải" | Vượt hạn mức của Gemini hoặc giới hạn 30 tin/10 phút. Chờ vài phút hoặc xem lại hạn mức tài khoản Google. |
| Bản đồ trống, ô xám | Mất mạng hoặc bị chặn tải bản đồ nền từ OpenStreetMap. Ghim vẫn hiển thị khi mạng ổn. |
| Địa điểm không có ghim trên bản đồ | Chưa nhập tọa độ. Điền vĩ độ và kinh độ trong trang quản trị. |
| Đổi `client/.env` nhưng không thấy thay đổi | Khởi động lại `npm run dev`; với bản production, chạy lại `npm run build`. |

---

## 8. Tham chiếu nhanh

### API

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/health` | Kiểm tra server |
| GET | `/api/places?category=tourism` | Danh sách địa điểm (lọc `tourism`, `cuisine`, `culture`) |
| GET | `/api/places/:slug` | Chi tiết một địa điểm |
| POST | `/api/chat` | Chat với KAT: `{"messages":[{"role":"user","content":"..."}]}` |
| POST | `/api/admin/login` | Đăng nhập bằng PIN, trả về token |
| GET | `/api/admin/session` | Kiểm tra token (cần `Authorization: Bearer ...`) |
| POST | `/api/admin/places` | Tạo địa điểm (cần token) |
| PUT | `/api/admin/places/:slug` | Cập nhật địa điểm (cần token) |
| DELETE | `/api/admin/places/:slug` | Xóa địa điểm (cần token) |

### Biến môi trường server

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `PORT` | Cổng chạy | `5000` |
| `CLIENT_ORIGIN` | Origin được phép gọi API (CORS), cách nhau bằng dấu phẩy | `http://localhost:5173` |
| `TRUST_PROXY` | `true` khi chạy sau reverse proxy | `false` |
| `ADMIN_PIN` | Mã PIN admin. Trống = tắt trang admin | trống |
| `ADMIN_TOKEN_SECRET` | Khóa ký phiên admin | ngẫu nhiên mỗi lần chạy |
| `ADMIN_TOKEN_TTL_HOURS` | Thời hạn phiên admin | `8` |
| `GEMINI_API_KEY` | Khóa Gemini. Trống = KAT báo chưa cấu hình | trống |
| `GEMINI_MODEL` | Tên model Gemini | `gemini-3.5-flash-lite` |
| `DATA_FILE` | Đường dẫn file dữ liệu địa điểm | `server/data/places.json` |

### Biến môi trường client (nhúng lúc build)

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_BASE_URL` | Gốc của API, mặc định `/api` |
| `VITE_DEV_API_TARGET` | Backend mà Vite proxy tới khi dev |
| `VITE_ADMIN_PATH` | Địa chỉ ẩn của trang quản trị |
| `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE` | Liên hệ ở footer |
| `VITE_SOCIAL_FACEBOOK`, `VITE_SOCIAL_YOUTUBE`, `VITE_SOCIAL_INSTAGRAM` | Liên kết mạng xã hội |

### Các file hay chỉnh

```
server/.env                        bí mật: PIN, khóa Gemini
server/data/places.json            dữ liệu địa điểm đang chạy (tự tạo)
server/data/places.seed.json       dữ liệu mẫu ban đầu
server/src/lib/gemini.js           hướng dẫn (system prompt) của KAT
client/.env                        liên hệ, mạng xã hội, địa chỉ admin
client/src/i18n/locales/*.json     chữ cố định tiếng Việt và tiếng Anh
client/src/index.css               màu sắc (Dark/Light)
client/public/images/places/       ảnh của bạn
```

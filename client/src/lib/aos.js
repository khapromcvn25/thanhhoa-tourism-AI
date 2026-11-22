import AOS from 'aos';
import 'aos/dist/aos.css';

// Khởi tạo AOS một lần. AOS tự theo dõi DOM (MutationObserver) nên các trang lazy-load
// và dữ liệu tải sau vẫn được gắn hiệu ứng. Người dùng bật "giảm chuyển động" được xử lý bằng CSS
// trong index.css (hiện nội dung ngay) thay vì tùy chọn `disable`, vì `disable` sẽ khiến các phần tử
// xuất hiện sau đó bị ẩn vĩnh viễn.
export function initAos() {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
}

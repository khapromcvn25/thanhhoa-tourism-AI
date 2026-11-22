import { useEffect } from 'react';

// Yêu cầu công cụ tìm kiếm không lập chỉ mục trang hiện tại (dùng cho trang admin).
// Cố ý KHÔNG dùng robots.txt vì file đó công khai và sẽ làm lộ URL ẩn.
export default function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

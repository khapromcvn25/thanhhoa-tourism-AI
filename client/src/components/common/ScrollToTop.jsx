import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cuộn về đầu trang mỗi khi chuyển route (trừ khi URL có #anchor).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

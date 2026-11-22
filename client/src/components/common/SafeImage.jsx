import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { sizedImage } from '@/lib/image';

// Ảnh có khung dự phòng: nếu địa điểm chưa có ảnh hoặc URL bị lỗi/hỏng,
// hiển thị nền gradient thương hiệu thay vì biểu tượng ảnh vỡ của trình duyệt.
export default function SafeImage({ src, alt = '', width = 800, eager = false, className = '', ...rest }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid place-items-center bg-gradient-to-br from-brand/25 via-surface-2 to-accent/20 text-muted ${className}`}
      >
        <ImageOff className="h-8 w-8 opacity-50" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={sizedImage(src, width)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}

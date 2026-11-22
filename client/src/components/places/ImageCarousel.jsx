import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { ZoomIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/common/SafeImage';
import { sizedImage } from '@/lib/image';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css';

const SWIPER_THEME = {
  '--swiper-navigation-color': '#ffffff',
  '--swiper-pagination-color': '#ffffff',
  '--swiper-pagination-bullet-inactive-color': '#ffffff',
  '--swiper-pagination-bullet-inactive-opacity': '0.55',
  '--swiper-navigation-size': '22px',
};

// Băng chuyền ảnh tự chạy (Swiper) + phóng to bằng Lightbox khi bấm vào ảnh.
export default function ImageCarousel({ images = [], name }) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const swiperRef = useRef(null);
  const multiple = images.length > 1;
  const lightboxOpen = lightboxIndex >= 0;

  // Tạm dừng tự chuyển ảnh phía sau khi Lightbox đang mở
  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (lightboxOpen) autoplay.stop();
    else autoplay.start();
  }, [lightboxOpen]);

  if (images.length === 0) {
    return (
      <SafeImage
        src=""
        alt={name}
        className="aspect-[16/9] w-full rounded-3xl sm:aspect-[21/9]"
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border shadow-card">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, Keyboard, A11y]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          style={SWIPER_THEME}
          className="aspect-[16/9] w-full sm:aspect-[21/9]"
          slidesPerView={1}
          rewind={multiple}
          allowTouchMove={multiple}
          autoplay={multiple ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          navigation={multiple}
          pagination={multiple ? { clickable: true } : false}
          keyboard={{ enabled: true }}
          a11y={{ enabled: true }}
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={t('place.zoomImage', { name })}
                className="group relative block h-full w-full cursor-zoom-in bg-surface-2"
              >
                <SafeImage
                  src={src}
                  alt={`${name} (${index + 1}/${images.length})`}
                  width={1600}
                  eager={index === 0}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ZoomIn className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Lightbox
        open={lightboxOpen}
        index={Math.max(lightboxIndex, 0)}
        close={() => setLightboxIndex(-1)}
        slides={images.map((src) => ({ src: sizedImage(src, 2000), alt: name }))}
        plugins={[Zoom]}
        carousel={{ finite: !multiple }}
        controller={{ closeOnBackdropClick: true }}
        render={
          multiple
            ? undefined
            : { buttonPrev: () => null, buttonNext: () => null }
        }
      />
    </>
  );
}

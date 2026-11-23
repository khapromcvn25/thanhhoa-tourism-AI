import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/common/SafeImage';
import useLocalized from '@/hooks/useLocalized';
import { ROUTES } from '@/config/routes';

import 'leaflet/dist/leaflet.css';

// Tâm tỉnh Thanh Hóa, dùng khi chưa có ghim nào để căn khung nhìn
const DEFAULT_CENTER = [19.9, 105.4];
const DEFAULT_ZOOM = 9;

// Ghim tùy chỉnh bằng divIcon (SVG + CSS), không phụ thuộc file ảnh marker mặc định của Leaflet
// vốn hay bị vỡ đường dẫn khi đóng gói bằng Vite.
const iconCache = new Map();
const KNOWN_CATEGORIES = ['tourism', 'cuisine', 'culture'];
function pinIcon(rawCategory) {
  // Chỉ nhận danh mục đã biết: giá trị này được ghép vào chuỗi HTML của divIcon
  const category = KNOWN_CATEGORIES.includes(rawCategory) ? rawCategory : 'tourism';
  if (!iconCache.has(category)) {
    iconCache.set(
      category,
      L.divIcon({
        className: 'map-pin-wrapper',
        html:
          `<span class="map-pin map-pin--${category}">` +
          '<svg viewBox="0 0 36 44" width="36" height="44" aria-hidden="true">' +
          '<path d="M18 1C8.6 1 1 8.6 1 18c0 12.6 17 25 17 25s17-12.4 17-25C35 8.6 27.4 1 18 1z"/>' +
          '<circle cx="18" cy="18" r="6.5" fill="#fff"/></svg></span>',
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -40],
      }),
    );
  }
  return iconCache.get(category);
}

// Căn khung nhìn theo các ghim đang hiển thị; nếu có địa điểm được chọn thì bay tới và mở popup.
function MapController({ places, selectedSlug, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    const points = places.map((p) => [p.coordinates.lat, p.coordinates.lng]);
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return undefined;
    }

    const selected = selectedSlug ? places.find((p) => p.slug === selectedSlug) : null;
    if (selected) {
      map.flyTo([selected.coordinates.lat, selected.coordinates.lng], 12, { duration: 1 });
      const timer = window.setTimeout(() => markerRefs.current[selected.slug]?.openPopup(), 900);
      return () => window.clearTimeout(timer);
    }

    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 11 });
    return undefined;
  }, [map, places, selectedSlug, markerRefs]);

  return null;
}

export default function PlacesMap({ places, selectedSlug }) {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const markerRefs = useRef({});

  // Chỉ những địa điểm có tọa độ hợp lệ mới có ghim
  const located = useMemo(
    () =>
      places.filter(
        (p) =>
          p.coordinates &&
          Number.isFinite(p.coordinates.lat) &&
          Number.isFinite(p.coordinates.lng),
      ),
    [places],
  );

  return (
    <div
      role="region"
      aria-label={t('map.ariaMap')}
      className="relative isolate z-0 h-[68vh] min-h-[440px] w-full"
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; Google Maps"
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />

        <MapController places={located} selectedSlug={selectedSlug} markerRefs={markerRefs} />

        {located.map((place) => {
          const name = l(place.name);
          return (
            <Marker
              key={place.slug}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={pinIcon(place.category)}
              title={name}
              ref={(marker) => {
                if (marker) markerRefs.current[place.slug] = marker;
                else delete markerRefs.current[place.slug];
              }}
            >
              <Popup className="place-popup" minWidth={230} maxWidth={260} closeButton>
                <div className="w-[230px]">
                  <SafeImage
                    src={place.images?.[0]}
                    alt={name}
                    width={500}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-4">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                      {t(`nav.${place.category}`)}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{name}</h3>
                    <Link
                      to={ROUTES.place(place.slug)}
                      className="place-popup-link mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold no-underline"
                    >
                      {t('map.viewDetails')}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlacesMap from '@/components/map/PlacesMap';
import { ErrorState } from '@/components/common/StateViews';
import { usePlaces } from '@/context/PlacesContext';
import usePageTitle from '@/hooks/usePageTitle';
import { CATEGORIES } from '@/config/routes';

const DOT = {
  tourism: 'bg-[#0e8a72]',
  cuisine: 'bg-[#d9730d]',
  culture: 'bg-[#7a4fb5]',
};

export default function MapPage() {
  const { t } = useTranslation();
  const { places, status, reload } = usePlaces();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState('all');
  const title = t('map.title');
  usePageTitle(title);

  const selectedSlug = params.get('place');

  // Nếu mở từ nút "Xem trên bản đồ" của một địa điểm, bỏ bộ lọc để chắc chắn ghim đó hiển thị
  const visible = useMemo(() => {
    const withCoords = places.filter((p) => p.coordinates);
    if (filter === 'all') return withCoords;
    return withCoords.filter((p) => p.category === filter || p.slug === selectedSlug);
  }, [places, filter, selectedSlug]);

  const countOf = (key) => places.filter((p) => p.coordinates && p.category === key).length;
  const total = places.filter((p) => p.coordinates).length;

  const chips = [
    { key: 'all', label: t('map.filterAll'), count: total },
    ...CATEGORIES.map(({ key }) => ({ key, label: t(`nav.${key}`), count: countOf(key) })),
  ];

  return (
    <section className="container-page py-10 sm:py-14">
      <p className="eyebrow">{t('map.eyebrow')}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-muted">{t('map.subtitle')}</p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={t('map.title')}>
        {chips.map(({ key, label, count }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                active ? 'border-brand bg-brand text-brand-fg' : 'bg-surface text-fg hover:border-brand'
              }`}
            >
              {key !== 'all' && <span className={`h-2.5 w-2.5 rounded-full ${DOT[key]}`} aria-hidden="true" />}
              {label}
              <span className={active ? 'opacity-80' : 'text-muted'}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border shadow-card">
        {status === 'error' && places.length === 0 ? (
          <ErrorState onRetry={reload} />
        ) : (
          <PlacesMap places={visible} selectedSlug={selectedSlug} />
        )}
      </div>
      <p className="mt-3 text-xs text-muted">{t('map.approx')}</p>
    </section>
  );
}

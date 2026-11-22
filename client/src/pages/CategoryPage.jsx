import { useMemo, useState } from 'react';
import { Heart, Navigation, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHero from '@/components/common/PageHero';
import PlaceCard from '@/components/places/PlaceCard';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/common/StateViews';
import { usePlaces } from '@/context/PlacesContext';
import { useUserPlaces } from '@/context/UserPlacesContext';
import usePageTitle from '@/hooks/usePageTitle';
import useLocalized from '@/hooks/useLocalized';
import { distanceKm, requestUserLocation } from '@/lib/geo';

// Dùng chung cho Du lịch / Ẩm thực / Văn hóa. `category` là khóa i18n: categories.<category>.*
export default function CategoryPage({ category }) {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const { status, reload, byCategory } = usePlaces();
  const { isFavorite } = useUserPlaces();
  const title = t(`categories.${category}.title`);
  usePageTitle(title);

  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortNearest, setSortNearest] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(false);

  const rawPlaces = byCategory(category);

  const handleToggleNearest = async () => {
    if (sortNearest) {
      setSortNearest(false);
      return;
    }
    if (userLoc) {
      setSortNearest(true);
      return;
    }
    setLocLoading(true);
    setLocError(false);
    try {
      const pos = await requestUserLocation();
      setUserLoc(pos);
      setSortNearest(true);
    } catch {
      setLocError(true);
    } finally {
      setLocLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rawPlaces.map((place) => ({
      place,
      dist: userLoc ? distanceKm(userLoc, place.coordinates) : null,
    }));

    if (q) {
      list = list.filter(({ place }) => {
        const hay = `${l(place.name)} ${l(place.summary)} ${l(place.address)}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (onlyFavorites) {
      list = list.filter(({ place }) => isFavorite(place.slug));
    }

    if (sortNearest && userLoc) {
      list.sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
    }

    return list;
  }, [rawPlaces, query, onlyFavorites, sortNearest, userLoc, l, isFavorite]);

  return (
    <>
      <PageHero
        eyebrow={t(`categories.${category}.eyebrow`)}
        title={title}
        subtitle={t(`categories.${category}.subtitle`)}
      />
      <section className="container-page py-12 sm:py-16">
        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('filter.searchPlaceholder')}
              aria-label={t('filter.searchPlaceholder')}
              className="w-full rounded-full border bg-surface py-2.5 pl-11 pr-10 text-sm text-fg placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('filter.clearSearch')}
                className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                onlyFavorites
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'bg-surface text-fg hover:border-brand hover:text-brand'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-current' : ''}`} aria-hidden="true" />
              {t('filter.onlyFavorites')}
            </button>

            <button
              type="button"
              onClick={handleToggleNearest}
              disabled={locLoading}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                sortNearest
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'bg-surface text-fg hover:border-brand hover:text-brand'
              }`}
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              {locLoading ? t('filter.locating') : t('filter.nearest')}
            </button>
          </div>
        </div>

        {locError && (
          <p className="mb-6 text-xs text-red-500" role="alert">
            {t('filter.locationDenied')}
          </p>
        )}

        {status === 'loading' && rawPlaces.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : status === 'error' && rawPlaces.length === 0 ? (
          <ErrorState onRetry={reload} />
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border bg-surface p-10 text-center">
            <p className="text-sm text-muted">{t('filter.noMatches')}</p>
            {(query || onlyFavorites) && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setOnlyFavorites(false);
                }}
                className="btn btn-outline mt-4"
              >
                {t('filter.reset')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ place, dist }, index) => (
              <PlaceCard key={place.slug} place={place} index={index} distance={sortNearest ? dist : null} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

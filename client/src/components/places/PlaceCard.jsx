import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, MapPin, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/common/SafeImage';
import useLocalized from '@/hooks/useLocalized';
import { useUserPlaces } from '@/context/UserPlacesContext';
import { ROUTES } from '@/config/routes';
import { formatDistance } from '@/lib/geo';

export default function PlaceCard({ place, index = 0, distance }) {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const { isFavorite, isVisited, toggleFavorite } = useUserPlaces();
  const name = l(place.name);
  const fav = isFavorite(place.slug);
  const done = isVisited(place.slug);

  const onToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(place.slug);
  };

  return (
    <article data-aos="fade-up" data-aos-delay={(index % 3) * 100}>
      <Link
        to={ROUTES.place(place.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <SafeImage
            src={place.images?.[0]}
            alt={name}
            width={800}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-bg/85 px-3 py-1 text-xs font-semibold text-fg backdrop-blur">
            {t(`nav.${place.category}`)}
          </span>

          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {done && (
              <span
                title={t('place.visited')}
                className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-fg shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={fav ? t('place.removeFavorite') : t('place.addFavorite')}
              title={fav ? t('place.removeFavorite') : t('place.addFavorite')}
              className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
                fav
                  ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                  : 'bg-bg/85 text-fg hover:bg-bg hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {distance != null && (
            <span className="absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              <Navigation className="h-3 w-3 text-[#f1d9a0]" aria-hidden="true" />
              {formatDistance(distance)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl leading-snug">{name}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{l(place.summary)}</p>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="line-clamp-2">{l(place.address)}</span>
          </p>

          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand">
            {t('place.viewDetails')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

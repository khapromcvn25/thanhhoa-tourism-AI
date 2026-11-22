import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Landmark, Map, MessageCircle, Mountain, Shuffle, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/common/SafeImage';
import WeatherWidget from '@/components/common/WeatherWidget';
import PlaceGrid from '@/components/places/PlaceGrid';
import PlaceCard from '@/components/places/PlaceCard';
import { usePlaces } from '@/context/PlacesContext';
import { useUserPlaces } from '@/context/UserPlacesContext';
import usePageTitle from '@/hooks/usePageTitle';
import { CATEGORIES, ROUTES } from '@/config/routes';
import { openChat } from '@/lib/chatBus';

const WHY_ITEMS = [
  { key: 'nature', Icon: Mountain },
  { key: 'heritage', Icon: Landmark },
  { key: 'food', Icon: Utensils },
];

function SectionHeading({ eyebrow, title, subtitle, className = '' }) {
  return (
    <div data-aos="fade-up" className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-2xl text-muted">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { places, status, reload, byCategory } = usePlaces();
  const { recent, clearRecent } = useUserPlaces();
  usePageTitle();

  const featured = places.filter((place) => place.featured);
  const featuredList = (featured.length ? featured : places).slice(0, 6);
  // Ảnh nền hero lấy từ ảnh đầu tiên của địa điểm nổi bật (đổi bằng trang admin)
  const heroPlace = featuredList.find((place) => place.images?.length) || null;
  const recentPlaces = recent
    .map((slug) => places.find((p) => p.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  const handleSurpriseMe = () => {
    if (!places.length) return;
    const pick = places[Math.floor(Math.random() * places.length)];
    navigate(ROUTES.place(pick.slug));
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0b1f19] text-white">
        {heroPlace && (
          <SafeImage
            src={heroPlace.images[0]}
            alt=""
            width={1600}
            eager
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1f19] via-[#0b1f19]/55 to-[#0b1f19]/25"
        />
        <div className="container-page flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-16 pt-24 sm:pb-24 lg:min-h-[calc(100svh-5rem)]">
          <div data-aos="fade-up" className="mb-6">
            <WeatherWidget variant="hero" />
          </div>

          <p data-aos="fade-up" className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1d9a0]">
            {t('home.hero.eyebrow')}
          </p>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-4 max-w-4xl text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl"
          >
            {t('home.hero.title')}
          </h1>
          <p data-aos="fade-up" data-aos-delay="200" className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {t('home.hero.subtitle')}
          </p>
          <div data-aos="fade-up" data-aos-delay="300" className="mt-10 flex flex-wrap gap-3">
            <Link
              to={CATEGORIES[0].path}
              className="btn bg-white text-[#0b1f19] hover:bg-white/90 focus-visible:ring-white"
            >
              {t('home.hero.ctaExplore')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={ROUTES.map}
              className="btn border border-white/40 text-white hover:bg-white/10 focus-visible:ring-white"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              {t('home.hero.ctaMap')}
            </Link>
            {places.length > 0 && (
              <button
                type="button"
                onClick={handleSurpriseMe}
                className="btn border border-[#f1d9a0]/50 bg-[#f1d9a0]/10 text-[#f1d9a0] hover:bg-[#f1d9a0]/20 focus-visible:ring-[#f1d9a0]"
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                {t('home.hero.ctaRandom')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Điểm đến nổi bật */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow={t('home.featured.eyebrow')}
          title={t('home.featured.title')}
          subtitle={t('home.featured.subtitle')}
        />
        <div className="mt-12">
          <PlaceGrid places={featuredList} status={status} onRetry={reload} />
        </div>
      </section>

      {/* Khám phá theo chủ đề */}
      <section className="border-y bg-surface-2">
        <div className="container-page py-20 sm:py-24">
          <SectionHeading eyebrow={t('home.topics.eyebrow')} title={t('home.topics.title')} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CATEGORIES.map(({ key, path }, index) => {
              const items = byCategory(key);
              const cover = items.find((place) => place.images?.length)?.images[0];
              return (
                <Link
                  key={key}
                  to={path}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative isolate block aspect-[4/5] overflow-hidden rounded-3xl bg-surface shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <SafeImage
                    src={cover}
                    alt=""
                    width={900}
                    className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  />
                  <div className="flex h-full flex-col justify-end p-7 text-white">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1d9a0]">
                      {t('home.topics.count', { count: items.length })}
                    </span>
                    <h3 className="mt-2 text-3xl text-white">{t(`categories.${key}.title`)}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">
                      {t(`categories.${key}.subtitle`)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                      {t('place.viewDetails')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vừa xem gần đây */}
      {recentPlaces.length > 0 && (
        <section className="container-page pt-20 sm:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow={t('home.recent.eyebrow')} title={t('home.recent.title')} />
            <button
              type="button"
              onClick={clearRecent}
              className="text-sm font-medium text-muted underline-offset-4 transition hover:text-brand hover:underline"
            >
              {t('home.recent.clear')}
            </button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPlaces.map((place, index) => (
              <PlaceCard key={place.slug} place={place} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Vì sao chọn Thanh Hóa */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading eyebrow={t('home.why.eyebrow')} title={t('home.why.title')} />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {WHY_ITEMS.map(({ key, Icon }, index) => (
            <div key={key} data-aos="fade-up" data-aos-delay={index * 100}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl">{t(`home.why.${key}.title`)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{t(`home.why.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kêu gọi hành động */}
      <section className="container-page pb-20 sm:pb-24">
        <div
          data-aos="fade-up"
          className="relative overflow-hidden rounded-[2rem] bg-brand px-8 py-14 text-brand-fg sm:px-14"
        >
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative max-w-xl text-3xl text-brand-fg sm:text-4xl">{t('home.cta.title')}</h2>
          <p className="relative mt-4 max-w-xl opacity-90">{t('home.cta.text')}</p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link
              to={ROUTES.map}
              className="btn bg-brand-fg text-brand hover:brightness-95 focus-visible:ring-brand-fg"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              {t('home.cta.map')}
            </Link>
            <button
              type="button"
              onClick={() => openChat()}
              className="btn border border-brand-fg/50 text-brand-fg hover:bg-brand-fg/10 focus-visible:ring-brand-fg"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t('home.cta.chat')}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

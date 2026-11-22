import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Heart,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  Square,
  Volume2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageCarousel from '@/components/places/ImageCarousel';
import Highlights from '@/components/places/Highlights';
import PlaceCard from '@/components/places/PlaceCard';
import WeatherWidget from '@/components/common/WeatherWidget';
import ReadingProgress from '@/components/common/ReadingProgress';
import { ErrorState } from '@/components/common/StateViews';
import RouteFallback from '@/components/common/RouteFallback';
import NotFound from '@/pages/NotFound';
import { usePlaces } from '@/context/PlacesContext';
import { useUserPlaces } from '@/context/UserPlacesContext';
import usePageTitle from '@/hooks/usePageTitle';
import useLocalized from '@/hooks/useLocalized';
import { CATEGORIES, ROUTES } from '@/config/routes';
import { SPEECH_LANG_MAP } from '@/i18n';
import { splitParagraphs } from '@/lib/text';
import { distanceKm } from '@/lib/geo';
import { openChat } from '@/lib/chatBus';

function directionsUrl({ lat, lng }) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export default function PlaceDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { lang, l, lMeta } = useLocalized();
  const { status, places, reload, getBySlug, byCategory } = usePlaces();
  const { isFavorite, isVisited, toggleFavorite, toggleVisited, markViewed } = useUserPlaces();

  const [speaking, setSpeaking] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const place = getBySlug(slug);
  usePageTitle(place ? l(place.name) : undefined);

  // Ghi nhận vào danh sách Vừa xem gần đây
  useEffect(() => {
    if (place?.slug) markViewed(place.slug);
  }, [place?.slug, markViewed]);

  // Dừng đọc thuyết minh khi rời trang, đổi địa điểm hoặc đổi ngôn ngữ ở thanh trên cùng
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [slug, lang]);

  const nearby = useMemo(() => {
    if (!place?.coordinates) return [];
    return places
      .filter((item) => item.slug !== place.slug && item.coordinates)
      .map((item) => ({ place: item, dist: distanceKm(place.coordinates, item.coordinates) }))
      .filter((x) => x.dist != null)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
  }, [places, place]);

  if (!place) {
    if (status === 'loading') return <RouteFallback />;
    if (status === 'error' && places.length === 0) {
      return (
        <div className="container-page">
          <ErrorState onRetry={reload} />
        </div>
      );
    }
    return <NotFound />;
  }

  const name = l(place.name);
  const summary = l(place.summary);
  const description = l(place.description);
  const category = CATEGORIES.find((c) => c.key === place.category);
  const related = byCategory(place.category)
    .filter((item) => item.slug !== place.slug)
    .slice(0, 3);
  const highlights = l(place.highlights);

  const fav = isFavorite(place.slug);
  const done = isVisited(place.slug);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const handleAudioGuide = () => {
    if (!canSpeak) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const descMeta = lMeta(place.description);
    const spokenLangCode = descMeta.lang || lang;
    const speechLocale = SPEECH_LANG_MAP[spokenLangCode] || SPEECH_LANG_MAP[lang] || 'vi-VN';

    const utter = new SpeechSynthesisUtterance(`${name}. ${summary}. ${description}`);
    utter.lang = speechLocale;

    // Ưu tiên chọn đúng giọng đọc khớp với ngôn ngữ người dùng đã chọn
    const voices = window.speechSynthesis.getVoices?.() || [];
    const targetLower = speechLocale.toLowerCase();
    const prefix = spokenLangCode.toLowerCase();
    const matchedVoice =
      voices.find((v) => v.lang?.toLowerCase() === targetLower) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(`${prefix}-`) || v.lang?.toLowerCase() === prefix);
    if (matchedVoice) utter.voice = matchedVoice;

    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const handleShare = async () => {
    const shareData = { title: name, text: summary, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Fallback sang copy link
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleAskKat = () => {
    openChat(t('place.askKatPrompt', { name }));
  };

  return (
    <article>
      <ReadingProgress />

      {/* Tiêu đề trang */}
      <header className="hero-bg border-b">
        <div className="container-page py-10 sm:py-14">
          <nav aria-label={t('place.breadcrumb')} className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <Link to={ROUTES.home} className="hover:text-brand">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {category && (
              <>
                <Link to={category.path} className="hover:text-brand">
                  {t(`nav.${category.key}`)}
                </Link>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
            <span aria-current="page" className="text-fg">
              {name}
            </span>
          </nav>

          <h1 className="mt-5 max-w-4xl text-4xl leading-tight sm:text-5xl">{name}</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted">{summary}</p>

          {/* Thanh hành động nhanh */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleFavorite(place.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                fav
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'bg-surface text-fg hover:border-brand hover:text-brand'
              }`}
            >
              <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} aria-hidden="true" />
              {fav ? t('place.saved') : t('place.addFavorite')}
            </button>

            <button
              type="button"
              onClick={() => toggleVisited(place.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                done
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'bg-surface text-fg hover:border-brand hover:text-brand'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {done ? t('place.visited') : t('place.markVisited')}
            </button>

            {canSpeak && (
              <button
                type="button"
                onClick={handleAudioGuide}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  speaking
                    ? 'border-accent bg-accent text-white'
                    : 'bg-surface text-fg hover:border-brand hover:text-brand'
                }`}
              >
                {speaking ? <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
                {speaking ? t('place.stopAudio') : t('place.audioGuide')}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border bg-surface px-4 py-2 text-xs font-semibold text-fg transition hover:border-brand hover:text-brand"
            >
              {sharedToast ? <Check className="h-4 w-4 text-brand" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
              {sharedToast ? t('place.linkCopied') : t('place.share')}
            </button>
          </div>
        </div>
      </header>

      <div className="container-page py-10 sm:py-14">
        {/* Ảnh nổi bật: băng chuyền + Lightbox */}
        <ImageCarousel images={place.images} name={name} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Nội dung chính */}
          <div>
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="text-2xl sm:text-3xl">
                {t('place.about')}
              </h2>
              <div className="mt-5 space-y-5 text-[17px] leading-8 text-fg/90">
                {splitParagraphs(description).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            <Highlights items={highlights} />
          </div>

          {/* Thông tin tổng quan + Thời tiết thực tế */}
          <aside aria-labelledby="overview-title" className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border bg-surface p-6 shadow-card">
              <h2 id="overview-title" className="text-xl">
                {t('place.overview')}
              </h2>

              {place.coordinates && (
                <div className="mt-4">
                  <WeatherWidget
                    lat={place.coordinates.lat}
                    lng={place.coordinates.lng}
                    locationName={name}
                    variant="card"
                  />
                </div>
              )}

              <dl className="mt-5 space-y-5 text-sm">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-semibold">{t('place.address')}</dt>
                    <dd className="mt-1 leading-relaxed text-muted">{l(place.address)}</dd>
                  </div>
                </div>

                {category && (
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                      <Navigation className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="font-semibold">{t('place.category')}</dt>
                      <dd className="mt-1">
                        <Link to={category.path} className="text-muted hover:text-brand">
                          {t(`nav.${category.key}`)}
                        </Link>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-col gap-3">
                {place.coordinates && (
                  <>
                    <Link to={`${ROUTES.map}?place=${encodeURIComponent(place.slug)}`} className="btn btn-primary">
                      <Map className="h-4 w-4" aria-hidden="true" />
                      {t('place.viewOnMap')}
                    </Link>
                    <a
                      href={directionsUrl(place.coordinates)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      {t('place.directions')}
                    </a>
                  </>
                )}
                <button type="button" onClick={handleAskKat} className="btn btn-outline">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {t('place.askKat')}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Địa điểm lân cận theo khoảng cách GPS */}
        {nearby.length > 0 && (
          <section aria-labelledby="nearby-title" className="mt-20">
            <h2 id="nearby-title" className="text-2xl sm:text-3xl">
              {t('place.nearby')}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map(({ place: item, dist }, index) => (
                <PlaceCard key={item.slug} place={item} index={index} distance={dist} />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-20">
            <h2 id="related-title" className="text-2xl sm:text-3xl">
              {t('place.related')}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <PlaceCard key={item.slug} place={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

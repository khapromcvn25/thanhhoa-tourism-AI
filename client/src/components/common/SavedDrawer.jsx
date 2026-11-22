import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Heart, MapPin, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/common/SafeImage';
import { usePlaces } from '@/context/PlacesContext';
import { useUserPlaces } from '@/context/UserPlacesContext';
import useLocalized from '@/hooks/useLocalized';
import { ROUTES } from '@/config/routes';

export default function SavedDrawer() {
  const { t } = useTranslation();
  const { l } = useLocalized();
  const { places } = usePlaces();
  const { favorites, visited, drawerOpen, setDrawerOpen, toggleFavorite, toggleVisited } = useUserPlaces();
  const [tab, setTab] = useState('favorites');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  const favoritePlaces = favorites.map((slug) => places.find((p) => p.slug === slug)).filter(Boolean);
  const visitedPlaces = visited.map((slug) => places.find((p) => p.slug === slug)).filter(Boolean);
  const activeList = tab === 'favorites' ? favoritePlaces : visitedPlaces;

  const totalPlaces = places.length;
  const visitedCount = visitedPlaces.length;
  const progressPct = totalPlaces > 0 ? Math.round((visitedCount / totalPlaces) * 100) : 0;

  const handleCopyTrip = async () => {
    if (favoritePlaces.length === 0) return;
    const lines = [
      t('saved.copyHeader'),
      ...favoritePlaces.map((p, idx) => `${idx + 1}. ${l(p.name)} — ${l(p.address)}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label={t('saved.title')}>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l bg-surface shadow-soft">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-fg">{t('saved.title')}</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('saved.close')}
            className="grid h-9 w-9 place-items-center rounded-full border text-muted transition hover:border-brand hover:text-brand"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {/* Tiến độ khám phá Thanh Hóa */}
        <div className="border-b bg-surface-2/60 px-5 py-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-fg">{t('saved.progressLabel')}</span>
            <span className="text-brand">
              {t('saved.progressCount', { count: visitedCount, total: totalPlaces })}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b px-5 pt-3 text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab('favorites')}
            className={`flex items-center justify-center gap-2 border-b-2 pb-3 transition ${
              tab === 'favorites' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {t('saved.tabFavorites')} ({favoritePlaces.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('visited')}
            className={`flex items-center justify-center gap-2 border-b-2 pb-3 transition ${
              tab === 'visited' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t('saved.tabVisited')} ({visitedPlaces.length})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeList.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted">
                {tab === 'favorites' ? t('saved.emptyFavorites') : t('saved.emptyVisited')}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activeList.map((place) => (
                <li key={place.slug} className="flex items-center gap-3 rounded-2xl border bg-bg p-2.5">
                  <Link
                    to={ROUTES.place(place.slug)}
                    onClick={() => setDrawerOpen(false)}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2"
                  >
                    <SafeImage src={place.images?.[0]} alt={l(place.name)} width={160} className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={ROUTES.place(place.slug)}
                      onClick={() => setDrawerOpen(false)}
                      className="block truncate text-sm font-semibold text-fg hover:text-brand"
                    >
                      {l(place.name)}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                      <MapPin className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{l(place.address)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => (tab === 'favorites' ? toggleFavorite(place.slug) : toggleVisited(place.slug))}
                    aria-label={t('saved.remove')}
                    title={t('saved.remove')}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {tab === 'favorites' && favoritePlaces.length > 0 && (
          <footer className="border-t p-4">
            <button type="button" onClick={handleCopyTrip} className="btn btn-primary w-full">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? t('saved.copied') : t('saved.copyTrip')}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/common/Logo';
import LanguageToggle from '@/components/common/LanguageToggle';
import ThemeToggle from '@/components/common/ThemeToggle';
import { NAV_ITEMS } from '@/config/routes';
import { useUserPlaces } from '@/context/UserPlacesContext';
import { openChat } from '@/lib/chatBus';

const desktopLinkClass = ({ isActive }) =>
  [
    'relative px-3 py-2 text-sm font-medium transition-colors',
    'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-300',
    isActive
      ? 'text-fg after:scale-x-100'
      : 'text-muted hover:text-fg after:scale-x-0 hover:after:scale-x-100',
  ].join(' ');

const mobileLinkClass = ({ isActive }) =>
  [
    'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
    isActive ? 'bg-surface-2 text-brand' : 'text-fg hover:bg-surface-2',
  ].join(' ');

export default function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { favorites, setDrawerOpen } = useUserPlaces();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Đóng menu mobile bằng phím Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || menuOpen ? 'bg-bg/90 shadow-sm' : 'border-transparent bg-bg/60'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-2 lg:h-20 lg:gap-3">
        <Logo />

        <nav aria-label={t('header.mainNav')} className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ key, to, end }) => (
            <NavLink key={key} to={to} end={end} className={desktopLinkClass}>
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('saved.title')}
            title={t('saved.title')}
            className="relative grid h-10 w-10 place-items-center rounded-full border bg-surface text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Heart className={`h-[18px] w-[18px] ${favorites.length ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
            {favorites.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-fg">
                {favorites.length}
              </span>
            )}
          </button>

          <LanguageToggle />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => openChat()}
            aria-label="KAT AI"
            title="KAT AI"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-brand-fg shadow-sm transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>KAT</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
            className="grid h-10 w-10 place-items-center rounded-full border bg-surface text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label={t('header.mainNav')}
          className="container-page animate-fade-down pb-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1 border-t pt-3">
            {NAV_ITEMS.map(({ key, to, end }) => (
              <li key={key}>
                <NavLink to={to} end={end} className={mobileLinkClass}>
                  {t(`nav.${key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

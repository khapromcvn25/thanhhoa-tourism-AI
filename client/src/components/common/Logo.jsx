import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config/routes';

export default function Logo({ className = '' }) {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.home}
      aria-label={`${t('brand.name')} — ${t('nav.home')}`}
      className={`group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${className}`}
    >
      <img
        src="/logo.jpg"
        alt=""
        className="h-10 w-10 rounded-full object-cover shadow-soft transition-transform duration-300 group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-fg">
          {t('brand.name')}
        </span>
        <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-muted sm:block">
          {t('brand.tagline')}
        </span>
      </span>
    </Link>
  );
}
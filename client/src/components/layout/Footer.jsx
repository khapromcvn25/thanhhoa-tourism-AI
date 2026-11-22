import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/common/Logo';
import { CATEGORIES, ROUTES } from '@/config/routes';
import { SITE, SOCIALS } from '@/config/site';

const SOCIAL_ICONS = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
};

const linkClass = 'text-sm text-muted transition-colors hover:text-brand';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-surface-2">
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        {/* Giới thiệu + mạng xã hội */}
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{t('footer.about')}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-fg">
            {t('footer.follow')}
          </p>
          <ul className="mt-3 flex gap-2">
            {SOCIALS.map(({ key, label, href }) => {
              const Icon = SOCIAL_ICONS[key];
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid h-10 w-10 place-items-center rounded-full border bg-surface text-fg transition hover:-translate-y-0.5 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Điều hướng nhanh */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg">
            {t('footer.explore')}
          </h2>
          <ul className="mt-5 space-y-3">
            {CATEGORIES.map(({ key, path }) => (
              <li key={key}>
                <Link to={path} className={linkClass}>
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link to={ROUTES.map} className={linkClass}>
                {t('nav.map')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg">
            {t('footer.contact')}
          </h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
              <span>
                <span className="sr-only">{t('footer.addressLabel')}: </span>
                <span className="text-muted">{t('footer.address')}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className={linkClass}>
                <span className="sr-only">{t('footer.emailLabel')}: </span>
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
              <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                <span className="sr-only">{t('footer.phoneLabel')}: </span>
                {SITE.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col gap-1.5 py-5 text-center text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>{t('footer.rights', { year })} · Copyright by KhaDev</span>
          <span>{t('footer.imageCredit')}</span>
        </div>
      </div>
    </footer>
  );
}

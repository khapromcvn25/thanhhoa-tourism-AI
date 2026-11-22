import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePageTitle from '@/hooks/usePageTitle';
import { ROUTES } from '@/config/routes';

export default function NotFound() {
  const { t } = useTranslation();
  const title = t('notFound.title');
  usePageTitle(title);

  return (
    <section className="hero-bg">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-8xl font-semibold text-brand sm:text-9xl">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-md text-muted">{t('notFound.subtitle')}</p>
        <Link to={ROUTES.home} className="btn btn-primary mt-8">
          {t('notFound.cta')}
        </Link>
      </div>
    </section>
  );
}

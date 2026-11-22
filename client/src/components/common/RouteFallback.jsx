import { useTranslation } from 'react-i18next';

export default function RouteFallback() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[50vh] place-items-center text-sm text-muted"
    >
      <span className="flex items-center gap-3">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
          aria-hidden="true"
        />
        {t('common.loading')}
      </span>
    </div>
  );
}

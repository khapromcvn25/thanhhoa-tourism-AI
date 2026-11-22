import { AlertTriangle, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ErrorState({ onRetry }) {
  const { t } = useTranslation();

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl">{t('states.errorTitle')}</h2>
      <p className="mt-2 text-sm text-muted">{t('states.errorText')}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-primary mt-6">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl">{t('states.emptyTitle')}</h2>
      <p className="mt-2 text-sm text-muted">{t('states.emptyText')}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-surface" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-surface-2" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

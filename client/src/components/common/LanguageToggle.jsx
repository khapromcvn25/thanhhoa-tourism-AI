import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, SUPPORTED_LANGUAGES } from '@/i18n';
import { FLAG_BY_LANG, FlagVN } from './Flags';

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const currentCode = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;
  const activeOption = LANGUAGE_OPTIONS.find((item) => item.code === currentCode) || LANGUAGE_OPTIONS[0];
  const ActiveFlag = FLAG_BY_LANG[activeOption.code] || FlagVN;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('header.language')}
        title={t('header.language')}
        className="flex h-10 items-center gap-2 rounded-full border bg-surface px-3 text-xs font-semibold text-fg transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <ActiveFlag className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" />
        <span className="hidden sm:inline">{activeOption.short}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('header.language')}
          className="animate-fade-down absolute right-0 z-[70] mt-2 w-44 overflow-hidden rounded-2xl border bg-surface p-1.5 shadow-soft"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const Flag = FLAG_BY_LANG[option.code] || FlagVN;
            const active = option.code === currentCode;
            return (
              <li key={option.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLanguage(option.code)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-brand/10 font-semibold text-brand'
                      : 'text-fg hover:bg-surface-2'
                  }`}
                >
                  <Flag className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" />
                  <span className="flex-1 truncate">{option.nativeName}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

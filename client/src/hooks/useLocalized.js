import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/i18n';
import { localize, localizeWithLang } from '@/lib/text';

// Trả về ngôn ngữ hiện tại và hàm l(field) để lấy nội dung đa ngôn ngữ của địa điểm.
export default function useLocalized() {
  const { i18n } = useTranslation();
  const lang = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;
  const l = useCallback((field) => localize(field, lang), [lang]);
  const lMeta = useCallback((field) => localizeWithLang(field, lang), [lang]);
  return { lang, l, lMeta };
}

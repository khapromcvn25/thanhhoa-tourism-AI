import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import vi from './locales/vi.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

export const LANGUAGE_OPTIONS = [
  { code: 'vi', short: 'VN', nativeName: 'Tiếng Việt', speechLang: 'vi-VN' },
  { code: 'en', short: 'EN', nativeName: 'English', speechLang: 'en-US' },
  { code: 'ja', short: 'JP', nativeName: '日本語', speechLang: 'ja-JP' },
  { code: 'ko', short: 'KR', nativeName: '한국어', speechLang: 'ko-KR' },
  { code: 'zh', short: 'CN', nativeName: '中文', speechLang: 'zh-CN' },
  { code: 'fr', short: 'FR', nativeName: 'Français', speechLang: 'fr-FR' },
];

export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map((item) => item.code);
export const DEFAULT_LANGUAGE = 'vi';

export const SPEECH_LANG_MAP = Object.fromEntries(
  LANGUAGE_OPTIONS.map((item) => [item.code, item.speechLang]),
);

// Đồng bộ <html lang>, <title> và meta description mỗi khi đổi ngôn ngữ.
// Đăng ký trước init() để sự kiện đầu tiên (lúc khởi tạo) cũng được bắt.
function syncDocument() {
  const lang = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE;
  document.documentElement.lang = lang;
  document.title = i18n.t('meta.title');

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', i18n.t('meta.description'));
}

i18n.on('languageChanged', syncDocument);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
      fr: { translation: fr },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    nonExplicitSupportedLngs: true, // en-US -> en, zh-CN -> zh, ja-JP -> ja...
    load: 'languageOnly',
    initImmediate: false, // nạp đồng bộ để lần render đầu tiên không bị hiện key
    interpolation: { escapeValue: false }, // React đã tự escape
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    react: { useSuspense: false },
  });

export default i18n;

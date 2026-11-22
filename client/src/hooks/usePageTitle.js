import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Đặt <title> theo trang và ngôn ngữ hiện tại. Không truyền title -> dùng tiêu đề mặc định của site.
export default function usePageTitle(title) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = title ? `${title} · ${t('brand.name')}` : t('meta.title');
  }, [title, t, i18n.resolvedLanguage]);
}

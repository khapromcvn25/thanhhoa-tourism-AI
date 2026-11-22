import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import RouteFallback from '@/components/common/RouteFallback';
import ChatWidget from '@/components/chat/ChatWidget';
import SavedDrawer from '@/components/common/SavedDrawer';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-brand-fg"
      >
        {t('header.skipToContent')}
      </a>

      <Header />

      <main id="main" className="flex-1">
        {/* Suspense nằm trong Layout để Header/Footer không biến mất khi tải trang lazy */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <SavedDrawer />
      <ChatWidget />
    </div>
  );
}

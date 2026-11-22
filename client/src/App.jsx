import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RouteFallback from '@/components/common/RouteFallback';
import { CATEGORIES, ROUTES } from '@/config/routes';

// Mỗi trang là một chunk riêng: Leaflet/Swiper ở các giai đoạn sau chỉ tải khi vào đúng trang.
const Home = lazy(() => import('@/pages/Home'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const PlaceDetail = lazy(() => import('@/pages/PlaceDetail'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {CATEGORIES.map(({ key, path }) => (
          <Route key={key} path={path} element={<CategoryPage category={key} />} />
        ))}
        <Route path={`${ROUTES.placeBase}/:slug`} element={<PlaceDetail />} />
        <Route path={ROUTES.map} element={<MapPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Ngoài Layout: không Header/Footer, URL ẩn lấy từ VITE_ADMIN_PATH */}
      <Route
        path={ROUTES.admin}
        element={
          <Suspense fallback={<RouteFallback />}>
            <AdminPanel />
          </Suspense>
        }
      />
    </Routes>
  );
}

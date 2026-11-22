import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LogOut, Plus } from 'lucide-react';
import PinGate from '@/components/admin/PinGate';
import PlaceEditor from '@/components/admin/PlaceEditor';
import SafeImage from '@/components/common/SafeImage';
import { usePlaces } from '@/context/PlacesContext';
import usePageTitle from '@/hooks/usePageTitle';
import useNoIndex from '@/hooks/useNoIndex';
import { adminApi, tokenStore } from '@/lib/adminApi';
import { CATEGORIES, ROUTES } from '@/config/routes';

const CATEGORY_LABEL = { tourism: 'Du lịch', cuisine: 'Ẩm thực', culture: 'Văn hóa' };
const NEW_KEY = '__new__';

function Dashboard({ token, onLogout }) {
  const { places, status, reload, getBySlug } = usePlaces();
  const [selected, setSelected] = useState(null); // slug | NEW_KEY | null
  const [dirty, setDirty] = useState(false);

  const select = (next) => {
    if (next === selected) return;
    if (dirty && !window.confirm('Bạn có thay đổi chưa lưu. Bỏ qua và chuyển sang mục khác?')) return;
    setDirty(false);
    setSelected(next);
  };

  const logout = () => {
    if (dirty && !window.confirm('Bạn có thay đổi chưa lưu. Vẫn đăng xuất?')) return;
    onLogout();
  };

  const handleSaved = async (place, created) => {
    await reload();
    if (created) setSelected(place.slug);
  };

  const handleDeleted = async () => {
    await reload();
    setDirty(false);
    setSelected(null);
  };

  const selectedPlace = selected && selected !== NEW_KEY ? getBySlug(selected) : null;

  let editor = null;
  if (selected === NEW_KEY) {
    editor = (
      <PlaceEditor
        key={NEW_KEY}
        place={null}
        token={token}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        onUnauthorized={onLogout}
        onDirtyChange={setDirty}
      />
    );
  } else if (selectedPlace) {
    editor = (
      <PlaceEditor
        key={selectedPlace.slug}
        place={selectedPlace}
        token={token}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        onUnauthorized={onLogout}
        onDirtyChange={setDirty}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b bg-bg/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <h1 className="text-xl">Quản trị nội dung</h1>
          <div className="flex items-center gap-2">
            <Link to={ROUTES.home} className="btn btn-outline !px-4 !py-2">
              Xem website
            </Link>
            <button type="button" onClick={logout} className="btn btn-outline !px-4 !py-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[300px_1fr]">
        <aside aria-label="Danh sách địa điểm" className="lg:sticky lg:top-24 lg:self-start">
          <button type="button" onClick={() => select(NEW_KEY)} className="btn btn-primary w-full">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm địa điểm
          </button>

          <div className="mt-5 max-h-72 space-y-5 overflow-y-auto pr-1 lg:max-h-[calc(100vh-11rem)]">
            {status === 'loading' && places.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Đang tải…
              </p>
            )}
            {status === 'error' && places.length === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Không tải được danh sách.{' '}
                <button type="button" onClick={reload} className="font-semibold underline">
                  Thử lại
                </button>
              </p>
            )}

            {CATEGORIES.map(({ key }) => {
              const items = places.filter((place) => place.category === key);
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {CATEGORY_LABEL[key]}
                  </h2>
                  <ul className="space-y-1.5">
                    {items.map((place) => {
                      const active = selected === place.slug;
                      return (
                        <li key={place.slug}>
                          <button
                            type="button"
                            onClick={() => select(place.slug)}
                            aria-current={active ? 'true' : undefined}
                            className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                              active ? 'border-brand bg-brand/10' : 'bg-surface hover:border-brand'
                            }`}
                          >
                            <SafeImage
                              src={place.images?.[0]}
                              alt=""
                              width={120}
                              className="h-10 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <span className="line-clamp-2 font-medium">{place.name?.vi || place.slug}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0">
          {editor || (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted">
              <p className="font-display text-xl text-fg">Chọn một địa điểm để chỉnh sửa</p>
              <p className="mt-2 text-sm">
                Bạn có thể sửa mô tả, địa chỉ, các nét nổi bật và thay đổi ảnh. Thay đổi có hiệu lực ngay trên website sau khi lưu.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Trang quản trị: nằm ngoài <Layout>, URL ẩn lấy từ VITE_ADMIN_PATH và không có liên kết nào dẫn tới.
export default function AdminPanel() {
  usePageTitle('Quản trị');
  useNoIndex();

  const [token, setToken] = useState(() => tokenStore.get());
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
  }, []);

  // Kiểm tra token đã lưu còn hiệu lực (phiên hết hạn hoặc server đổi khóa => về màn hình PIN)
  useEffect(() => {
    if (!token || !checking) return undefined;
    let cancelled = false;
    adminApi
      .session(token)
      .catch((error) => {
        if (!cancelled && error.status === 401) logout();
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, checking, logout]);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-brand" aria-label="Đang kiểm tra phiên" />
      </div>
    );
  }

  if (!token) {
    return (
      <PinGate
        onSuccess={(newToken) => {
          tokenStore.set(newToken);
          setToken(newToken);
        }}
      />
    );
  }

  return <Dashboard token={token} onLogout={logout} />;
}

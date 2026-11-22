import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

// Danh sách địa điểm chỉ vài chục mục nên tải một lần và dùng chung cho mọi trang
// (trang chủ, danh mục, chi tiết, bản đồ, admin). Admin gọi reload() sau khi lưu.

const PlacesContext = createContext(null);

export function PlacesProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', places: [], error: null });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await api.get('/places');
      if (id !== requestId.current) return; // đã có yêu cầu mới hơn
      setState({ status: 'ready', places: data.places || [], error: null });
    } catch (error) {
      if (id !== requestId.current) return;
      // Giữ dữ liệu cũ (nếu có) để giao diện không bị trống khi reload lỗi
      setState((prev) => ({ status: 'error', places: prev.places, error }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      requestId.current += 1; // bỏ qua kết quả trả về sau khi unmount
    };
  }, [load]);

  const reload = useCallback(() => {
    setState((prev) => (prev.status === 'error' ? { ...prev, status: 'loading' } : prev));
    return load();
  }, [load]);

  const value = useMemo(
    () => ({
      ...state,
      reload,
      getBySlug: (slug) => state.places.find((place) => place.slug === slug) || null,
      byCategory: (category) => state.places.filter((place) => place.category === category),
    }),
    [state, reload],
  );

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) throw new Error('usePlaces phải được dùng bên trong <PlacesProvider>');
  return context;
}

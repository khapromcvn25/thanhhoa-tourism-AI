import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  favorites: 'th_favorites_v1',
  visited: 'th_visited_v1',
  recent: 'th_recent_v1',
};

const MAX_RECENT = 6;

function readList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage (chế độ riêng tư)
  }
}

const UserPlacesContext = createContext(null);

export function UserPlacesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readList(STORAGE_KEYS.favorites));
  const [visited, setVisited] = useState(() => readList(STORAGE_KEYS.visited));
  const [recent, setRecent] = useState(() => readList(STORAGE_KEYS.recent));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => writeList(STORAGE_KEYS.favorites, favorites), [favorites]);
  useEffect(() => writeList(STORAGE_KEYS.visited, visited), [visited]);
  useEffect(() => writeList(STORAGE_KEYS.recent, recent), [recent]);

  const toggleFavorite = useCallback((slug) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev]));
  }, []);

  const toggleVisited = useCallback((slug) => {
    setVisited((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev]));
  }, []);

  const markViewed = useCallback((slug) => {
    if (!slug) return;
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_RECENT));
  }, []);

  const clearRecent = useCallback(() => setRecent([]), []);

  const value = useMemo(
    () => ({
      favorites,
      visited,
      recent,
      drawerOpen,
      setDrawerOpen,
      toggleFavorite,
      toggleVisited,
      markViewed,
      clearRecent,
      isFavorite: (slug) => favorites.includes(slug),
      isVisited: (slug) => visited.includes(slug),
    }),
    [favorites, visited, recent, drawerOpen, toggleFavorite, toggleVisited, markViewed, clearRecent],
  );

  return <UserPlacesContext.Provider value={value}>{children}</UserPlacesContext.Provider>;
}

export function useUserPlaces() {
  const ctx = useContext(UserPlacesContext);
  if (!ctx) throw new Error('useUserPlaces phải được dùng bên trong <UserPlacesProvider>');
  return ctx;
}

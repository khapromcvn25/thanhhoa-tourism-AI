// Nguồn sự thật duy nhất cho đường dẫn của toàn bộ ứng dụng.

export const ROUTES = {
  home: '/',
  map: '/map',
  placeBase: '/place',
  place: (slug) => `/place/${encodeURIComponent(slug)}`,
  // URL ẩn của trang quản trị: không xuất hiện ở bất kỳ menu/liên kết nào
  admin: import.meta.env.VITE_ADMIN_PATH || '/admin-panel-secret',
};

// Mỗi danh mục dùng chung một trang (CategoryPage), khác nhau ở `key`.
// `key` cũng là khóa i18n: categories.<key>.title / subtitle và nav.<key>
export const CATEGORIES = [
  { key: 'tourism', path: '/tourism' },
  { key: 'cuisine', path: '/cuisine' },
  { key: 'culture', path: '/culture' },
];

export const NAV_ITEMS = [
  { key: 'home', to: ROUTES.home, end: true },
  ...CATEGORIES.map(({ key, path }) => ({ key, to: path })),
  { key: 'map', to: ROUTES.map },
];

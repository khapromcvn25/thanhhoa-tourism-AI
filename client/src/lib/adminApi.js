import { api } from '@/lib/api';

// Token phiên admin chỉ lưu trong sessionStorage: đóng tab là đăng xuất.
// PIN không bao giờ được lưu ở client, chỉ gửi một lần khi đăng nhập.
const TOKEN_KEY = 'admin_token';

export const tokenStore = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sessionStorage bị chặn: phiên chỉ còn trong bộ nhớ trang */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* bỏ qua */
    }
  },
};

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const adminApi = {
  login: (pin) => api.post('/admin/login', { pin }),
  session: (token) => api.get('/admin/session', auth(token)),
  create: (token, place) => api.post('/admin/places', place, auth(token)),
  update: (token, slug, place) => api.put(`/admin/places/${encodeURIComponent(slug)}`, place, auth(token)),
  remove: (token, slug) => api.delete(`/admin/places/${encodeURIComponent(slug)}`, auth(token)),
};

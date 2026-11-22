// Chuyển đổi giữa dữ liệu địa điểm từ API và "bản nháp" (draft) trong form admin.
// Draft dùng chuỗi cho tọa độ và luôn có đủ trường cho cả 6 ngôn ngữ.

export const ADMIN_LANGS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
];

const multilingual = (field) =>
  Object.fromEntries(ADMIN_LANGS.map(({ code }) => [code, field?.[code] ?? '']));

const multilingualList = (field) =>
  Object.fromEntries(ADMIN_LANGS.map(({ code }) => [code, Array.isArray(field?.[code]) ? [...field[code]] : []]));

const list = (value) => (Array.isArray(value) ? [...value] : []);

export function emptyDraft() {
  return {
    slug: '',
    category: 'tourism',
    featured: false,
    order: '',
    name: multilingual(),
    summary: multilingual(),
    description: multilingual(),
    address: multilingual(),
    highlights: multilingualList(),
    images: [],
    lat: '',
    lng: '',
  };
}

export function toDraft(place) {
  if (!place) return emptyDraft();
  return {
    slug: place.slug || '',
    category: place.category || 'tourism',
    featured: Boolean(place.featured),
    order: place.order ?? '',
    name: multilingual(place.name),
    summary: multilingual(place.summary),
    description: multilingual(place.description),
    address: multilingual(place.address),
    highlights: multilingualList(place.highlights),
    images: list(place.images),
    lat: place.coordinates?.lat ?? '',
    lng: place.coordinates?.lng ?? '',
  };
}

// Draft -> dữ liệu gửi lên API. Server vẫn kiểm tra lại toàn bộ; ở đây chỉ chuẩn hóa kiểu dữ liệu.
export function toPayload(draft) {
  const hasCoords = String(draft.lat).trim() !== '' || String(draft.lng).trim() !== '';
  return {
    slug: draft.slug.trim(),
    category: draft.category,
    featured: draft.featured,
    order: String(draft.order).trim() === '' ? null : Number(draft.order),
    name: draft.name,
    summary: draft.summary,
    description: draft.description,
    address: draft.address,
    highlights: Object.fromEntries(
      ADMIN_LANGS.map(({ code }) => [
        code,
        (draft.highlights?.[code] || []).map((s) => s.trim()).filter(Boolean),
      ]),
    ),
    images: draft.images.map((s) => s.trim()).filter(Boolean),
    coordinates: hasCoords ? { lat: String(draft.lat).trim(), lng: String(draft.lng).trim() } : null,
  };
}

export const isSameDraft = (a, b) => JSON.stringify(a) === JSON.stringify(b);

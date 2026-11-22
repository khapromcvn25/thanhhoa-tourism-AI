// Kiểm tra và chuẩn hóa dữ liệu địa điểm. Dùng cho cả tạo mới lẫn cập nhật từ trang admin.
// Trả về { value, errors } — errors là mảng chuỗi tiếng Việt, rỗng nếu hợp lệ.

export const CATEGORIES = ['tourism', 'cuisine', 'culture'];
export const LANGS = ['vi', 'en', 'ja', 'ko', 'zh', 'fr'];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LIMITS = {
  slug: 60,
  name: 120,
  summary: 300,
  description: 6000,
  address: 250,
  highlight: 200,
  highlights: 12,
  imageUrl: 2000,
  images: 12,
};

const clean = (value) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '');

function validateBilingual(input, field, { max, required }) {
  const out = {};
  const errors = [];
  const source = input && typeof input === 'object' ? input : {};

  for (const lang of LANGS) {
    const text = clean(source[lang]);
    if (text.length > max) {
      errors.push(`${field} (${lang}) dài tối đa ${max} ký tự`);
    }
    out[lang] = text;
  }

  // Tiếng Việt là ngôn ngữ gốc nên bắt buộc; tiếng Anh nếu trống sẽ lùi về tiếng Việt ở client
  if (required && !out.vi) errors.push(`${field} (vi) là bắt buộc`);
  return { out, errors };
}

export function isValidImageUrl(value) {
  if (typeof value !== 'string') return false;
  const url = value.trim();
  if (!url || url.length > LIMITS.imageUrl) return false;
  // Đường dẫn nội bộ (ảnh đặt trong client/public), ví dụ /images/places/pu-luong-1.jpg
  if (url.startsWith('/') && !url.startsWith('//')) return !/\s/.test(url);
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateCoordinates(input, errors) {
  if (input === null || input === undefined || input === '') return null;
  if (typeof input !== 'object') {
    errors.push('Tọa độ không hợp lệ');
    return null;
  }

  const rawLat = input.lat;
  const rawLng = input.lng;
  const empty = (v) => v === null || v === undefined || v === '';
  if (empty(rawLat) && empty(rawLng)) return null;

  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (empty(rawLat) || empty(rawLng) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    errors.push('Tọa độ cần đủ vĩ độ (lat) và kinh độ (lng) là số');
    return null;
  }
  // Khung gần đúng của Việt Nam để bắt lỗi nhập nhầm (đảo lat/lng, thiếu dấu...)
  if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
    errors.push('Tọa độ nằm ngoài lãnh thổ Việt Nam. Kiểm tra lại vĩ độ (khoảng 19–21) và kinh độ (khoảng 104–106).');
    return null;
  }
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

export function validatePlace(input, { requireSlug = true } = {}) {
  const errors = [];
  const body = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  const slug = clean(body.slug).toLowerCase();
  if (requireSlug) {
    if (!slug) errors.push('Slug là bắt buộc');
    else if (slug.length > LIMITS.slug || !SLUG_RE.test(slug)) {
      errors.push('Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (ví dụ: pu-luong)');
    }
  }

  const category = clean(body.category);
  if (!CATEGORIES.includes(category)) {
    errors.push(`Danh mục phải là một trong: ${CATEGORIES.join(', ')}`);
  }

  const name = validateBilingual(body.name, 'Tên', { max: LIMITS.name, required: true });
  const summary = validateBilingual(body.summary, 'Mô tả ngắn', { max: LIMITS.summary, required: true });
  const description = validateBilingual(body.description, 'Mô tả chi tiết', {
    max: LIMITS.description,
    required: true,
  });
  const address = validateBilingual(body.address, 'Địa chỉ', { max: LIMITS.address, required: true });
  errors.push(...name.errors, ...summary.errors, ...description.errors, ...address.errors);

  // Nét nổi bật: { vi: [...], en: [...] }, bỏ dòng trống
  const highlights = Object.fromEntries(LANGS.map((l) => [l, []]));
  const hlSource = body.highlights && typeof body.highlights === 'object' ? body.highlights : {};
  for (const lang of LANGS) {
    const list = Array.isArray(hlSource[lang]) ? hlSource[lang] : [];
    highlights[lang] = list.map(clean).filter(Boolean);
    if (highlights[lang].length > LIMITS.highlights) {
      errors.push(`Tối đa ${LIMITS.highlights} nét nổi bật (${lang})`);
    }
    if (highlights[lang].some((h) => h.length > LIMITS.highlight)) {
      errors.push(`Mỗi nét nổi bật (${lang}) dài tối đa ${LIMITS.highlight} ký tự`);
    }
  }

  // Ảnh: mảng URL, bỏ dòng trống và trùng lặp, giữ nguyên thứ tự (ảnh đầu là ảnh đại diện)
  const rawImages = Array.isArray(body.images) ? body.images : [];
  const images = [...new Set(rawImages.map(clean).filter(Boolean))];
  if (images.length > LIMITS.images) errors.push(`Tối đa ${LIMITS.images} ảnh`);
  const badImage = images.find((url) => !isValidImageUrl(url));
  if (badImage) {
    errors.push(`URL ảnh không hợp lệ: "${badImage.slice(0, 80)}". Dùng địa chỉ https://... hoặc đường dẫn bắt đầu bằng /`);
  }

  const coordinates = validateCoordinates(body.coordinates, errors);

  const orderNumber = Number(body.order);
  const order = Number.isFinite(orderNumber) ? Math.trunc(orderNumber) : null;

  return {
    errors,
    value: {
      slug,
      category,
      featured: body.featured === true,
      order,
      name: name.out,
      summary: summary.out,
      description: description.out,
      address: address.out,
      highlights,
      images,
      coordinates,
    },
  };
}

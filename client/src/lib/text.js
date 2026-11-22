// Lấy giá trị theo ngôn ngữ từ trường đa ngôn ngữ { vi, en, ja, ko, zh, fr }.
// Hỗ trợ cả chuỗi ({ vi: '...' }) và mảng ({ vi: [...] });
// Nếu bản dịch của ngôn ngữ đang chọn bị trống, tự lùi về tiếng Anh rồi tiếng Việt.
export function localizeWithLang(field, lang) {
  if (field === null || field === undefined) return { value: '', lang: 'vi' };
  if (typeof field === 'string' || Array.isArray(field)) return { value: field, lang: lang || 'vi' };

  const order = lang === 'vi' ? ['vi', 'en'] : [lang, 'en', 'vi'];
  for (const code of order) {
    const val = field[code];
    if (Array.isArray(val) && val.length > 0) return { value: val, lang: code };
    if (typeof val === 'string' && val.trim().length > 0) return { value: val, lang: code };
  }
  return { value: Array.isArray(field.vi) ? [] : '', lang: 'vi' };
}

export function localize(field, lang) {
  return localizeWithLang(field, lang).value;
}

// Tách đoạn văn theo dòng trống
export function splitParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// "Pù Luông" -> "pu-luong"
export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

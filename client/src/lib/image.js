// Ảnh từ Wikimedia Commons (Special:FilePath) hỗ trợ tham số ?width=... để lấy bản thu nhỏ,
// giúp thẻ danh sách không phải tải ảnh gốc nặng. Ảnh nguồn khác giữ nguyên.
export function sizedImage(url, width) {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('commons.wikimedia.org/wiki/Special:FilePath/')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}

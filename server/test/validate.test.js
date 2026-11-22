import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidImageUrl, validatePlace } from '../src/lib/validate.js';

const base = () => ({
  slug: 'pu-luong',
  category: 'tourism',
  featured: true,
  name: { vi: ' Pù Luông ', en: 'Pu Luong' },
  summary: { vi: 'Tóm tắt', en: '' },
  description: { vi: 'Dòng 1\r\n\r\nDòng 2', en: '' },
  address: { vi: 'Bá Thước', en: '' },
  highlights: { vi: ['A', '  ', 'B'], en: [] },
  images: ['https://a.com/1.jpg', 'https://a.com/1.jpg', '', '/images/x.jpg'],
  coordinates: { lat: '20.5', lng: '105.2' },
});

test('dữ liệu hợp lệ được chuẩn hóa: cắt khoảng trắng, bỏ dòng trống, bỏ ảnh trùng, ép số', () => {
  const { value, errors } = validatePlace(base());
  assert.deepEqual(errors, []);
  assert.equal(value.name.vi, 'Pù Luông');
  assert.equal(value.description.vi, 'Dòng 1\n\nDòng 2');
  assert.deepEqual(value.highlights.vi, ['A', 'B']);
  assert.deepEqual(value.images, ['https://a.com/1.jpg', '/images/x.jpg']);
  assert.deepEqual(value.coordinates, { lat: 20.5, lng: 105.2 });
  assert.equal(value.featured, true);
});

test('tiếng Việt bắt buộc, tiếng Anh được phép để trống', () => {
  const input = base();
  input.name.vi = '';
  const { errors } = validatePlace(input);
  assert.ok(errors.some((e) => e.includes('Tên (vi)')));
  assert.equal(errors.length, 1);
});

test('từ chối slug sai định dạng và danh mục lạ', () => {
  const a = validatePlace({ ...base(), slug: 'Pù Luông!' });
  assert.ok(a.errors.some((e) => e.includes('Slug')));
  const b = validatePlace({ ...base(), category: 'abc' });
  assert.ok(b.errors.some((e) => e.includes('Danh mục')));
});

test('requireSlug=false bỏ qua kiểm tra slug (dùng khi cập nhật)', () => {
  const { errors } = validatePlace({ ...base(), slug: '' }, { requireSlug: false });
  assert.deepEqual(errors, []);
});

test('URL ảnh: chấp nhận http(s) và đường dẫn nội bộ, từ chối còn lại', () => {
  assert.ok(isValidImageUrl('https://x.com/a.jpg'));
  assert.ok(isValidImageUrl('http://x.com/a.jpg'));
  assert.ok(isValidImageUrl('/images/places/a.jpg'));
  assert.ok(!isValidImageUrl('//evil.com/a.jpg'));
  assert.ok(!isValidImageUrl('javascript:alert(1)'));
  assert.ok(!isValidImageUrl('data:image/png;base64,AAAA'));
  assert.ok(!isValidImageUrl('ftp://x.com/a.jpg'));
  assert.ok(!isValidImageUrl('/có khoảng trắng.jpg'));
  assert.ok(!isValidImageUrl(''));
  const { errors } = validatePlace({ ...base(), images: ['javascript:alert(1)'] });
  assert.ok(errors.some((e) => e.includes('URL ảnh')));
});

test('tọa độ: có thể bỏ trống, bắt lỗi nhập nhầm', () => {
  assert.equal(validatePlace({ ...base(), coordinates: null }).value.coordinates, null);
  assert.equal(validatePlace({ ...base(), coordinates: { lat: '', lng: '' } }).value.coordinates, null);
  assert.ok(validatePlace({ ...base(), coordinates: { lat: 105.2, lng: 20.5 } }).errors.length > 0); // đảo lat/lng
  assert.ok(validatePlace({ ...base(), coordinates: { lat: 20.5 } }).errors.length > 0); // thiếu lng
  assert.ok(validatePlace({ ...base(), coordinates: { lat: 'abc', lng: 105 } }).errors.length > 0);
});

test('giới hạn số lượng ảnh và nét nổi bật', () => {
  const images = Array.from({ length: 13 }, (_, i) => `https://a.com/${i}.jpg`);
  assert.ok(validatePlace({ ...base(), images }).errors.some((e) => e.includes('ảnh')));
  const vi = Array.from({ length: 13 }, (_, i) => `Mục ${i}`);
  assert.ok(validatePlace({ ...base(), highlights: { vi, en: [] } }).errors.some((e) => e.includes('nét nổi bật')));
});

test('đầu vào rác không làm sập validator', () => {
  for (const junk of [null, undefined, 5, 'x', [], { name: 5, images: 'x', highlights: 3 }]) {
    const { errors } = validatePlace(junk);
    assert.ok(errors.length > 0);
  }
});

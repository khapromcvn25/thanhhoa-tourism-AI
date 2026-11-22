import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PlaceStore } from '../src/lib/store.js';
import { validatePlace } from '../src/lib/validate.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(here, '../data/places.seed.json');

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'places-'));
  const dataFile = path.join(dir, 'nested', 'places.json');
  const store = new PlaceStore({ dataFile, seedFile });
  await store.init();
  return { store, dataFile, dir };
}

const sample = (overrides = {}) =>
  validatePlace({
    slug: 'thac-test',
    category: 'tourism',
    name: { vi: 'Thác thử', en: 'Test Falls' },
    summary: { vi: 'Tóm tắt', en: 'Summary' },
    description: { vi: 'Mô tả', en: 'Description' },
    address: { vi: 'Địa chỉ', en: 'Address' },
    highlights: { vi: ['Một'], en: ['One'] },
    images: ['https://example.com/a.jpg'],
    coordinates: { lat: 20.1, lng: 105.2 },
    ...overrides,
  });

test('lần đầu chạy: sao chép dữ liệu mẫu ra file chạy thật', async () => {
  const { store, dataFile } = await tempStore();
  const onDisk = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  assert.equal(onDisk.places.length, store.list().length);
  assert.ok(store.list().length >= 10);
});

test('dữ liệu mẫu hợp lệ theo đúng bộ kiểm tra của admin', async () => {
  const seed = JSON.parse(await fs.readFile(seedFile, 'utf8'));
  for (const place of seed.places) {
    const { errors } = validatePlace(place);
    assert.deepEqual(errors, [], `${place.slug}: ${errors.join('; ')}`);
  }
  const slugs = seed.places.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slug bị trùng');
});

test('list lọc theo danh mục và sắp xếp theo order', async () => {
  const { store } = await tempStore();
  const tourism = store.list({ category: 'tourism' });
  assert.ok(tourism.length > 0 && tourism.every((p) => p.category === 'tourism'));
  const orders = store.list().map((p) => p.order);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
});

test('list/get trả bản sao: sửa bên ngoài không làm hỏng kho', async () => {
  const { store } = await tempStore();
  const first = store.list()[0];
  first.name.vi = 'BỊ SỬA';
  assert.notEqual(store.get(first.slug).name.vi, 'BỊ SỬA');
});

test('create ghi ra file, từ chối slug trùng', async () => {
  const { store, dataFile } = await tempStore();
  const { value } = sample();
  const created = await store.create(value);
  assert.equal(created.slug, 'thac-test');
  assert.ok(created.order > 0);

  const onDisk = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  assert.ok(onDisk.places.some((p) => p.slug === 'thac-test'));

  await assert.rejects(() => store.create(value), (e) => e.status === 409 && e.code === 'slug_taken');
});

test('update giữ nguyên slug, cập nhật nội dung và ảnh', async () => {
  const { store } = await tempStore();
  const { value } = sample({
    slug: 'pu-luong',
    category: 'tourism',
    name: { vi: 'Pù Luông mới', en: 'New Pu Luong' },
    images: ['https://example.com/new1.jpg', '/images/places/pu-luong-2.jpg'],
  });
  const updated = await store.update('pu-luong', { ...value, slug: 'khac' });
  assert.equal(updated.slug, 'pu-luong');
  assert.equal(updated.name.vi, 'Pù Luông mới');
  assert.deepEqual(updated.images, ['https://example.com/new1.jpg', '/images/places/pu-luong-2.jpg']);
  assert.equal(store.get('pu-luong').images.length, 2);
  await assert.rejects(() => store.update('khong-co', value), (e) => e.status === 404);
});

test('remove xóa địa điểm, 404 nếu không tồn tại', async () => {
  const { store } = await tempStore();
  await store.remove('pu-luong');
  assert.equal(store.get('pu-luong'), null);
  await assert.rejects(() => store.remove('pu-luong'), (e) => e.status === 404);
});

test('dữ liệu bền vững: khởi tạo lại từ file vẫn thấy thay đổi', async () => {
  const { store, dataFile } = await tempStore();
  const { value } = sample();
  await store.create(value);
  const reopened = new PlaceStore({ dataFile, seedFile });
  await reopened.init();
  assert.ok(reopened.get('thac-test'));
});

test('nhiều thao tác ghi đồng thời không làm mất dữ liệu', async () => {
  const { store, dataFile } = await tempStore();
  const before = store.list().length;
  await Promise.all(
    Array.from({ length: 12 }, (_, i) => store.create(sample({ slug: `dia-diem-${i}` }).value)),
  );
  assert.equal(store.list().length, before + 12);
  const onDisk = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  assert.equal(onDisk.places.length, before + 12);
  const leftovers = (await fs.readdir(path.dirname(dataFile))).filter((f) => f.endsWith('.tmp'));
  assert.deepEqual(leftovers, []);
});

test('file dữ liệu hỏng: báo lỗi và KHÔNG ghi đè', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'places-bad-'));
  const dataFile = path.join(dir, 'places.json');
  await fs.writeFile(dataFile, '{ hỏng', 'utf8');
  const store = new PlaceStore({ dataFile, seedFile });
  await assert.rejects(() => store.init(), /không phải JSON hợp lệ/);
  assert.equal(await fs.readFile(dataFile, 'utf8'), '{ hỏng');
});

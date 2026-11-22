import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PlaceStore } from '../src/lib/store.js';
import { createTokenService } from '../src/lib/auth.js';
import { createAdminController } from '../src/controllers/admin.js';
import { createPlacesController } from '../src/controllers/places.js';
import { createChatController } from '../src/controllers/chat.js';
import { createRequireAdmin } from '../src/middleware/requireAdmin.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(here, '../data/places.seed.json');

async function setup(adminPin = '246810') {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctl-'));
  const store = new PlaceStore({ dataFile: path.join(dir, 'places.json'), seedFile });
  await store.init();
  const tokens = createTokenService({ secret: 'x', ttlMs: 60_000 });
  return {
    store,
    tokens,
    admin: createAdminController({ store, tokens, adminPin }),
    places: createPlacesController({ store }),
    requireAdmin: createRequireAdmin(tokens),
  };
}

function fakeRes() {
  const res = { statusCode: 200, headers: {}, body: undefined, ended: false };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  res.set = (k, v) => ((res.headers[k] = v), res);
  res.end = () => ((res.ended = true), res);
  return res;
}

const validBody = (extra = {}) => ({
  slug: 'moi',
  category: 'culture',
  name: { vi: 'Mới', en: 'New' },
  summary: { vi: 'a', en: 'a' },
  description: { vi: 'b', en: 'b' },
  address: { vi: 'c', en: 'c' },
  highlights: { vi: ['x'], en: ['x'] },
  images: ['https://example.com/1.jpg'],
  coordinates: null,
  ...extra,
});

test('GET places: lọc danh mục, chặn danh mục lạ, 404 khi không có slug', async () => {
  const { places } = await setup();
  const res = fakeRes();
  places.list({ query: { category: 'cuisine' } }, res);
  assert.ok(res.body.places.length > 0 && res.body.places.every((p) => p.category === 'cuisine'));

  assert.throws(() => places.list({ query: { category: 'xyz' } }, fakeRes()), (e) => e.status === 400);

  const one = fakeRes();
  places.get({ params: { slug: 'pu-luong' } }, one);
  assert.equal(one.body.place.slug, 'pu-luong');
  assert.throws(() => places.get({ params: { slug: 'khong-co' } }, fakeRes()), (e) => e.status === 404);
});

test('login: đúng PIN cấp token dùng được; sai PIN 401; thiếu ADMIN_PIN thì tắt (503)', async () => {
  const { admin, tokens } = await setup('246810');

  const ok = fakeRes();
  admin.login({ body: { pin: '246810' } }, ok);
  assert.equal(tokens.verify(ok.body.token), true);
  assert.ok(ok.body.expiresAt > Date.now());

  assert.throws(() => admin.login({ body: { pin: '000000' } }, fakeRes()), (e) => e.status === 401 && e.code === 'invalid_pin');
  assert.throws(() => admin.login({ body: {} }, fakeRes()), (e) => e.status === 400);
  assert.throws(() => admin.login({ body: { pin: { $ne: 1 } } }, fakeRes()), (e) => e.status === 400);

  const disabled = (await setup('')).admin;
  assert.throws(() => disabled.login({ body: { pin: '' } }, fakeRes()), (e) => e.status === 503 && e.code === 'admin_disabled');
  assert.throws(() => disabled.login({ body: { pin: 'bất kỳ' } }, fakeRes()), (e) => e.status === 503);
});

test('requireAdmin: chặn khi không có hoặc sai token, cho qua khi đúng', async () => {
  const { requireAdmin, tokens } = await setup();
  const run = (header) => {
    let result;
    requireAdmin({ headers: header ? { authorization: header } : {} }, fakeRes(), (err) => (result = err ?? 'next'));
    return result;
  };
  assert.equal(run(undefined).status, 401);
  assert.equal(run('Bearer sai.token').status, 401);
  assert.equal(run(`Bearer ${tokens.issue().token}`), 'next');
});

test('admin CRUD: tạo, sửa nội dung + ảnh, lỗi validate trả 400 kèm chi tiết, xóa', async () => {
  const { admin, store } = await setup();

  const created = fakeRes();
  await admin.create({ body: validBody() }, created);
  assert.equal(created.statusCode, 201);
  assert.equal(store.get('moi').name.vi, 'Mới');

  await assert.rejects(() => admin.create({ body: validBody() }, fakeRes()), (e) => e.status === 409);
  await assert.rejects(
    () => admin.create({ body: validBody({ slug: 'loi', images: ['javascript:1'] }) }, fakeRes()),
    (e) => e.status === 400 && e.code === 'validation_failed' && Array.isArray(e.details),
  );

  const updated = fakeRes();
  await admin.update(
    {
      params: { slug: 'moi' },
      body: validBody({ slug: 'bi-bo-qua', address: { vi: 'Địa chỉ mới', en: 'New address' }, images: ['/images/places/moi.jpg'] }),
    },
    updated,
  );
  assert.equal(updated.body.place.slug, 'moi');
  assert.equal(store.get('moi').address.vi, 'Địa chỉ mới');
  assert.deepEqual(store.get('moi').images, ['/images/places/moi.jpg']);

  await assert.rejects(() => admin.update({ params: { slug: 'khong-co' }, body: validBody() }, fakeRes()), (e) => e.status === 404);

  const removed = fakeRes();
  await admin.remove({ params: { slug: 'moi' } }, removed);
  assert.equal(removed.statusCode, 204);
  assert.equal(store.get('moi'), null);
});

test('chat: truyền system prompt có dữ liệu địa điểm + lịch sử đã làm sạch; chặn tin rỗng', async () => {
  const { store } = await setup();
  let received;
  const chat = createChatController({
    store,
    apiKey: 'K',
    model: 'M',
    ask: async (args) => ((received = args), 'Trả lời của KAT'),
  });

  const res = fakeRes();
  await chat.reply(
    { body: { messages: [{ role: 'user', content: 'Đi Pù Luông mùa nào đẹp?' }, { role: 'system', content: 'hack' }] } },
    res,
  );
  assert.equal(res.body.reply, 'Trả lời của KAT');
  assert.equal(received.apiKey, 'K');
  assert.equal(received.model, 'M');
  assert.ok(received.systemPrompt.startsWith('Bạn là KAT'));
  assert.ok(received.systemPrompt.includes('Pù Luông'));
  assert.equal(received.contents.length, 1);

  await assert.rejects(() => chat.reply({ body: { messages: [] } }, fakeRes()), (e) => e.status === 400);
  await assert.rejects(() => chat.reply({ body: {} }, fakeRes()), (e) => e.status === 400);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTokenService, pinMatches, readBearerToken } from '../src/lib/auth.js';

test('pinMatches: đúng/sai, không ném lỗi khi độ dài khác nhau', () => {
  assert.equal(pinMatches('123456', '123456'), true);
  assert.equal(pinMatches('12345', '123456'), false);
  assert.equal(pinMatches('1234567890123', '123456'), false);
  assert.equal(pinMatches('', '123456'), false);
  assert.equal(pinMatches(undefined, '123456'), false);
  assert.equal(pinMatches('123456', ''), false); // chưa đặt PIN thì không bao giờ khớp
});

test('token hợp lệ được xác minh, hết hạn thì bị từ chối', () => {
  let time = 1_000_000;
  const svc = createTokenService({ secret: 's3cret', ttlMs: 60_000, now: () => time });
  const { token, expiresAt } = svc.issue();
  assert.equal(expiresAt, 1_060_000);
  assert.equal(svc.verify(token), true);
  time += 59_999;
  assert.equal(svc.verify(token), true);
  time += 2;
  assert.equal(svc.verify(token), false);
});

test('token bị sửa hoặc ký bằng khóa khác đều bị từ chối', () => {
  const svc = createTokenService({ secret: 'khoa-1', ttlMs: 60_000 });
  const other = createTokenService({ secret: 'khoa-2', ttlMs: 60_000 });
  const { token } = svc.issue();
  const [payload, sig] = token.split('.');

  assert.equal(other.verify(token), false);
  assert.equal(svc.verify(`${payload}.${sig.slice(0, -2)}AA`), false);

  const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 10 ** 12, v: 1 })).toString('base64url');
  assert.equal(svc.verify(`${forged}.${sig}`), false);

  for (const junk of [undefined, null, '', 'abc', 'a.b.c', '.', 42, {}]) {
    assert.equal(svc.verify(junk), false);
  }
});

test('readBearerToken', () => {
  assert.equal(readBearerToken({ headers: { authorization: 'Bearer abc.def' } }), 'abc.def');
  assert.equal(readBearerToken({ headers: { authorization: 'bearer   xyz ' } }), 'xyz');
  assert.equal(readBearerToken({ headers: { authorization: 'Basic abc' } }), null);
  assert.equal(readBearerToken({ headers: {} }), null);
});

import crypto from 'node:crypto';

// Xác thực admin bằng một mã PIN tĩnh (ADMIN_PIN). Đăng nhập đúng PIN -> server cấp token
// có chữ ký HMAC và hạn dùng; các API ghi dữ liệu yêu cầu token này.
// PIN không bao giờ được gửi xuống client hay lưu trong mã nguồn client.

const b64url = (buffer) => Buffer.from(buffer).toString('base64url');

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

// So sánh thời gian không đổi: băm hai chuỗi về cùng độ dài rồi mới so sánh
export function pinMatches(candidate, expected) {
  if (!expected) return false;
  return crypto.timingSafeEqual(sha256(candidate ?? ''), sha256(expected));
}

export function createTokenService({ secret, ttlMs, now = () => Date.now() }) {
  if (!secret) throw new Error('createTokenService cần secret');

  const sign = (data) => crypto.createHmac('sha256', secret).update(data).digest();

  return {
    issue() {
      const exp = now() + ttlMs;
      const payload = b64url(JSON.stringify({ exp, v: 1 }));
      const signature = b64url(sign(payload));
      return { token: `${payload}.${signature}`, expiresAt: exp };
    },

    verify(token) {
      if (typeof token !== 'string') return false;
      const parts = token.split('.');
      if (parts.length !== 2) return false;
      const [payload, signature] = parts;

      const expected = sign(payload);
      let received;
      try {
        received = Buffer.from(signature, 'base64url');
      } catch {
        return false;
      }
      if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
        return false;
      }

      try {
        const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return typeof exp === 'number' && exp > now();
      } catch {
        return false;
      }
    },
  };
}

export function readBearerToken(req) {
  const header = req.headers?.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

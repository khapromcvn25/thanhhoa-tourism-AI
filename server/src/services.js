import crypto from 'node:crypto';
import { env } from './config/env.js';
import { PlaceStore } from './lib/store.js';
import { createTokenService } from './lib/auth.js';

// Các đối tượng dùng chung của server (singleton), tạo từ cấu hình môi trường.

export const store = new PlaceStore({ dataFile: env.dataFile, seedFile: env.seedFile });

// Nếu không đặt ADMIN_TOKEN_SECRET, dùng khóa ngẫu nhiên mỗi lần khởi động:
// vẫn an toàn nhưng phiên đăng nhập admin sẽ mất khi server khởi động lại.
const tokenSecret = env.adminTokenSecret || crypto.randomBytes(32).toString('hex');

export const tokens = createTokenService({
  secret: tokenSecret,
  ttlMs: Math.max(1, env.adminTokenTtlHours) * 60 * 60 * 1000,
});

export function logStartupWarnings(log = console.warn) {
  if (!env.adminPin) {
    log('[server] ADMIN_PIN chưa được đặt: trang quản trị đang TẮT.');
  } else if (env.adminPin.length < 6) {
    log('[server] ADMIN_PIN ngắn hơn 6 ký tự: nên dùng PIN dài hơn.');
  }
  if (env.adminPin && !env.adminTokenSecret) {
    log('[server] ADMIN_TOKEN_SECRET chưa được đặt: phiên admin sẽ mất mỗi lần server khởi động lại.');
  }
  if (!env.geminiApiKey) {
    log('[server] GEMINI_API_KEY chưa được đặt: chatbot KAT sẽ báo chưa cấu hình.');
  }
}

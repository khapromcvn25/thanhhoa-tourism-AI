import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../..');

const toNumber = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) =>
  (value ?? fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolveFromServerRoot = (value, fallback) =>
  path.resolve(serverRoot, value && value.trim() ? value.trim() : fallback);

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toNumber(process.env.PORT, 5000),
  clientOrigins: toList(process.env.CLIENT_ORIGIN, 'http://localhost:5173'),
  trustProxy: process.env.TRUST_PROXY === 'true',

  // Dữ liệu địa điểm: file chạy thật (bị sửa bởi trang admin) và file mẫu để khởi tạo lần đầu
  dataFile: resolveFromServerRoot(process.env.DATA_FILE, 'data/places.json'),
  seedFile: path.resolve(serverRoot, 'data/places.seed.json'),

  // Trang admin
  adminPin: (process.env.ADMIN_PIN || '').trim(),
  adminTokenSecret: (process.env.ADMIN_TOKEN_SECRET || '').trim(),
  adminTokenTtlHours: toNumber(process.env.ADMIN_TOKEN_TTL_HOURS, 8),

  // Chatbot KAT (Gemini). Khóa chỉ tồn tại ở server, không bao giờ gửi xuống trình duyệt.
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  geminiModel: (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim(),
});

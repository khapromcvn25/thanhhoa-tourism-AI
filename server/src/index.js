import app from './app.js';
import { env } from './config/env.js';
import { store, logStartupWarnings } from './services.js';

try {
  await store.init();
} catch (error) {
  console.error('[server] Không đọc được dữ liệu địa điểm:', error.message);
  process.exit(1);
}

logStartupWarnings();

const server = app.listen(env.port, () => {
  console.log(`[server] API đang chạy tại http://localhost:${env.port} (${env.nodeEnv})`);
  console.log(`[server] ${store.list().length} địa điểm, dữ liệu tại ${env.dataFile}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[server] Cổng ${env.port} đang được sử dụng. Đổi PORT trong server/.env.`);
  } else {
    console.error('[server] Lỗi khởi động:', err);
  }
  process.exit(1);
});

const shutdown = (signal) => {
  console.log(`[server] Nhận ${signal}, đang tắt máy chủ...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

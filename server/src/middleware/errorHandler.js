import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({
    error: { status: 404, code: 'not_found', message: `Không tìm thấy: ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // JSON sai cú pháp hoặc body quá lớn do express.json ném ra
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { status: 400, code: 'invalid_json', message: 'JSON không hợp lệ' } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { status: 413, code: 'too_large', message: 'Dữ liệu gửi lên quá lớn' } });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500 && !err.expose) console.error('[server] Unhandled error:', err);

  // Lỗi do mình chủ động ném (HttpError) luôn có message an toàn để trả về
  const message =
    status >= 500 && env.isProduction && !err.expose ? 'Lỗi máy chủ nội bộ' : err.message || 'Đã xảy ra lỗi';

  res.status(status).json({
    error: { status, code: err.code, message, ...(err.details ? { details: err.details } : {}) },
  });
}

// Bọc handler async để lỗi được chuyển tới errorHandler (Express 4 không tự làm việc này)
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

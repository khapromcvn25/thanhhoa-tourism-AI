// Lỗi có mã trạng thái HTTP và `code` ngắn gọn để client dịch sang đa ngôn ngữ.
export class HttpError extends Error {
  constructor(status, message, { code, details } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true;
  }
}

export const badRequest = (message, options) => new HttpError(400, message, options);
export const unauthorized = (message = 'Chưa đăng nhập hoặc phiên đã hết hạn', options) =>
  new HttpError(401, message, { code: 'unauthorized', ...options });
export const notFoundError = (message = 'Không tìm thấy', options) =>
  new HttpError(404, message, options);
export const conflict = (message, options) => new HttpError(409, message, options);

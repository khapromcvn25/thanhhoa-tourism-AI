// Cho phép nút ở bất kỳ trang nào (ví dụ "Hỏi KAT" ở trang chủ hoặc trang chi tiết)
// mở widget chat nổi và tùy chọn gửi sẵn một câu hỏi.
export const OPEN_CHAT_EVENT = 'kat:open';

export function openChat(prompt) {
  const detail = typeof prompt === 'string' && prompt.trim() ? { prompt: prompt.trim() } : undefined;
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail }));
}

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createChatController } from '../controllers/chat.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { store } from '../services.js';

const router = Router();
const controller = createChatController({
  store,
  apiKey: env.geminiApiKey,
  model: env.geminiModel,
});

// Mỗi lượt chat tốn một lượt gọi Gemini: giới hạn riêng để bảo vệ hạn mức/chi phí của chủ website
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: { status: 429, code: 'rate_limited', message: 'Bạn nhắn hơi nhanh, vui lòng thử lại sau ít phút.' },
  },
});

router.post('/chat', chatLimiter, asyncHandler(controller.reply));

export default router;

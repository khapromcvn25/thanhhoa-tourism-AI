import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createAdminController } from '../controllers/admin.js';
import { createRequireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { store, tokens } from '../services.js';

const router = Router();
const controller = createAdminController({ store, tokens, adminPin: env.adminPin });
const requireAdmin = createRequireAdmin(tokens);

// Chống dò PIN: tối đa 8 lần sai trong 15 phút cho mỗi IP (đăng nhập đúng không bị tính)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: { status: 429, code: 'too_many_attempts', message: 'Nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút.' },
  },
});

router.post('/admin/login', loginLimiter, asyncHandler(controller.login));
router.get('/admin/session', requireAdmin, asyncHandler(controller.session));
router.post('/admin/places', requireAdmin, asyncHandler(controller.create));
router.put('/admin/places/:slug', requireAdmin, asyncHandler(controller.update));
router.delete('/admin/places/:slug', requireAdmin, asyncHandler(controller.remove));

export default router;

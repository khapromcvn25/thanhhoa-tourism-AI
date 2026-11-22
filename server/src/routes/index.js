import { Router } from 'express';
import healthRouter from './health.js';
import placesRouter from './places.js';
import adminRouter from './admin.js';
import chatRouter from './chat.js';

const router = Router();

router.use(healthRouter);
router.use(placesRouter);
router.use(adminRouter);
router.use(chatRouter);

export default router;

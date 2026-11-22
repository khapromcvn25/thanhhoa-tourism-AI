import { Router } from 'express';
import { createPlacesController } from '../controllers/places.js';
import { store } from '../services.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = createPlacesController({ store });

router.get('/places', asyncHandler(controller.list));
router.get('/places/:slug', asyncHandler(controller.get));

export default router;

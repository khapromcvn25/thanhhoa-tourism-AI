import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', 1);

app.use(
  helmet({
    frameguard: false, // Tắt X-Frame-Options cũ để dùng frameAncestors cho Google Sites
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // 'unsafe-inline' cần cho style inline do Swiper/Leaflet sinh ra
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        // Ảnh địa điểm do admin nhập URL nên cho phép mọi nguồn https
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        // Cho phép gọi API thời tiết Open-Meteo
        connectSrc: ["'self'", 'https://api.open-meteo.com'],
        objectSrc: ["'none'"],
        // Cho phép Google Sites nh
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
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https://api.open-meteo.com'],
        objectSrc: ["'none'"],
        frameAncestors: [
          "'self'",
          'https://sites.google.com',
          'https://*.googleusercontent.com',
          'https://*.gstatic.com',
        ],
        upgradeInsecureRequests: null,
      },
    },
  }),
);

app.use(
  cors({
    origin: env.clientOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { status: 429, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' } },
  }),
);

app.use('/api', apiRouter);
app.use('/api', notFound);

const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }),
  );
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;

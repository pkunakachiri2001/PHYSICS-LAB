import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import experimentRoutes from './routes/experiments';
import analyticsRoutes from './routes/analytics';
import progressRoutes from './routes/progress';

const app: Application = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

// Allow localhost in dev AND the deployed Vercel URL in production
const allowedOrigins = [
  'http://localhost:3000',
  config.clientUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Request Parsing & Logging ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.isDevelopment) {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
const healthHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Smart AR Physics Lab API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
};
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_V1 = '/api/v1';
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/experiments`, experimentRoutes);
app.use(`${API_V1}/analytics`, analyticsRoutes);
app.use(`${API_V1}/progress`, progressRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

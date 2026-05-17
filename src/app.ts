import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { globalLimiter } from './shared/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/client.routes';
import dietRoutes from './modules/diet-plans/diet.routes';
import progressRoutes from './modules/progress/progress.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ── Security ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(globalLimiter);

// ── Body parsing ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: '619 Fitness Studio API',
  database: 'MongoDB',
  timestamp: new Date().toISOString(),
}));

// ── API Routes ────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/clients`, clientRoutes);
app.use(`${API}/clients`, dietRoutes);
app.use(`${API}/clients`, progressRoutes);
app.use(`${API}/admin`, adminRoutes);

// ── Error handling ────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

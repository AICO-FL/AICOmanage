import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from 'dotenv';
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { setupSSE } from './services/sseService';
import { setupPolling } from './services/pollingService';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Enable compression
app.use(compression());

// Rate limiting - より緩やかな制限に調整
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 500, // 1つのIPアドレスからの最大リクエスト数を500に増加
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'リクエスト数が制限を超えました。しばらく待ってから再試行してください。'
  }
});

// APIエンドポイントに対してのみレート制限を適用
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
const clientPath = path.join(process.cwd(), 'dist/client');
app.use(express.static(clientPath));

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api', router);

// SPA fallback - must be after API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Production server running on port ${PORT}`);
});

// Setup SSE and polling
setupSSE(app);
setupPolling();

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  server.close(() => {
    logger.info('Server closed');
    
    prisma.$disconnect().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
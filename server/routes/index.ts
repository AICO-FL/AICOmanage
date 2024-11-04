import { Router } from 'express';
import authRoutes from './auth';
import terminalRoutes from './terminals';
import conversationRoutes from './conversations';
import fileRoutes from './files';
import actionRoutes from './actions';
import templateRoutes from './templates';
import userRoutes from './users';
import { authenticate } from '../middleware/auth';
import { setupSSE } from '../services/sseService';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Public routes
router.use('/auth', authRoutes);

// SSE setup
setupSSE(router);

// Protected routes
router.use('/terminals', authenticate, terminalRoutes);
router.use('/conversations', authenticate, conversationRoutes);
router.use('/files', authenticate, fileRoutes);
router.use('/actions', authenticate, actionRoutes);
router.use('/templates', authenticate, templateRoutes);
router.use('/users', authenticate, userRoutes);

export { router };
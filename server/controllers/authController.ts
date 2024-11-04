import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info('Login attempt', { username: req.body.username });
    const { username, password } = req.body;

    if (!username || !password) {
      logger.warn('Login failed: Missing credentials');
      throw new AppError('ユーザー名とパスワードは必須です', 400);
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not configured');
      throw new AppError('サーバー設定エラー', 500);
    }

    const user = await prisma.systemUser.findUnique({
      where: { username },
    });

    if (!user) {
      logger.warn(`Login failed: User not found - ${username}`);
      throw new AppError('ユーザー名またはパスワードが正しくありません', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${username}`);
      throw new AppError('ユーザー名またはパスワードが正しくありません', 401);
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Login successful - ${username}`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function validateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('認証が必要です', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('認証トークンが必要です', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('サーバー設定エラー', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    const user = await prisma.systemUser.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('ユーザーが見つかりません', 404);
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('無効な認証トークンです', 401));
    } else {
      next(error);
    }
  }
}
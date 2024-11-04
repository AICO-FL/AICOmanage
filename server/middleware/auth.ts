import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('認証が必要です', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.systemUser.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('ユーザーが見つかりません', 401);
    }

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    next(new AppError('認証に失敗しました', 401));
  }
}
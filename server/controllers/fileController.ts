import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { extname } from 'path';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    // オリジナルのファイル名をエンコード
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const randomName = randomBytes(16).toString('hex');
    cb(null, `${randomName}${extname(originalName)}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function getClientFiles(_req: Request, res: Response, next: NextFunction) {
  try {
    const files = await prisma.clientFile.findMany({
      include: {
        conversation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(files);
  } catch (error) {
    logger.error('Error fetching client files:', error);
    next(error);
  }
}

export async function getServerFiles(_req: Request, res: Response, next: NextFunction) {
  try {
    const files = await prisma.serverFile.findMany({
      orderBy: {
        fileNo: 'desc',
      },
    });

    res.json(files);
  } catch (error) {
    logger.error('Error fetching server files:', error);
    next(error);
  }
}

export async function uploadServerFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // オリジナルのファイル名をエンコード
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const file = await prisma.serverFile.create({
      data: {
        name: originalName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
      },
    });

    res.json(file);
  } catch (error) {
    logger.error('Error uploading server file:', error);
    next(error);
  }
}

export async function downloadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isClientFile = req.path.includes('/client/');

    const file = isClientFile
      ? await prisma.clientFile.findUnique({ where: { id } })
      : await prisma.serverFile.findUnique({ where: { id } });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    const filename = isClientFile 
      ? `client-${id}${extname(file.path)}`
      : (file as any).name || `file-${id}${extname(file.path)}`;

    // Content-Dispositionヘッダーでファイル名をUTF-8エンコード
    const encodedFilename = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.download(file.path);
  } catch (error) {
    logger.error('Error downloading file:', error);
    next(error);
  }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isClientFile = req.path.includes('/client/');

    if (isClientFile) {
      await prisma.clientFile.delete({ where: { id } });
    } else {
      await prisma.serverFile.delete({ where: { id } });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting file:', error);
    next(error);
  }
}
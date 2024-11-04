import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export async function getTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(templates);
  } catch (error) {
    logger.error('Failed to fetch templates:', error);
    next(error);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      throw new AppError('名前と内容は必須です', 400);
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
      },
    });

    logger.info('Template created:', { id: template.id, name: template.name });
    res.status(201).json(template);
  } catch (error) {
    logger.error('Failed to create template:', error);
    next(error);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    if (!name || !content) {
      throw new AppError('名前と内容は必須です', 400);
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name,
        content,
        updatedAt: new Date(),
      },
    });

    logger.info('Template updated:', { id: template.id, name: template.name });
    res.json(template);
  } catch (error) {
    logger.error('Failed to update template:', error);
    next(error);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await prisma.template.delete({
      where: { id },
    });

    logger.info('Template deleted:', { id });
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete template:', error);
    next(error);
  }
}
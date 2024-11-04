import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export async function getActions(_req: Request, res: Response, next: NextFunction) {
  try {
    const actions = await prisma.action.findMany({
      include: {
        terminal: true,
        mediaFile: true,
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            chatworkId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedActions = actions.map(action => ({
      ...action,
      keywords: action.keywords.split(',').filter(Boolean),
    }));

    res.json(formattedActions);
  } catch (error) {
    logger.error('アクションの取得に失敗しました:', error);
    next(error);
  }
}

export async function createAction(req: Request, res: Response, next: NextFunction) {
  try {
    const { keywords, terminalId, type, userId, mediaId, templateId, ...data } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new AppError('キーワードは1つ以上指定してください', 400);
    }

    if (!terminalId) {
      throw new AppError('AICO端末は必須です', 400);
    }

    const terminal = await prisma.terminal.findUnique({
      where: { id: terminalId },
    });

    if (!terminal) {
      throw new AppError('指定されたAICO端末が見つかりません', 404);
    }

    const keywordsString = keywords
      .filter(Boolean)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .join(',');

    if (!keywordsString) {
      throw new AppError('有効なキーワードを指定してください', 400);
    }

    const createData = {
      ...data,
      terminalId,
      type,
      keywords: keywordsString,
      ...(userId && { userId }),
      ...(mediaId && { mediaId }),
      ...(templateId && { templateId }),
    };

    const action = await prisma.action.create({
      data: createData,
      include: {
        terminal: true,
        mediaFile: true,
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            chatworkId: true,
          },
        },
      },
    });

    const formattedAction = {
      ...action,
      keywords: action.keywords.split(','),
    };

    logger.info('アクションを作成しました:', { id: action.id, type: action.type });
    res.status(201).json(formattedAction);
  } catch (error) {
    logger.error('アクションの作成に失敗しました:', error);
    next(error);
  }
}

export async function updateAction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { keywords, ...data } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new AppError('キーワードは1つ以上指定してください', 400);
    }

    const keywordsString = keywords
      .filter(Boolean)
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .join(',');

    if (!keywordsString) {
      throw new AppError('有効なキーワードを指定してください', 400);
    }

    const action = await prisma.action.update({
      where: { id },
      data: {
        ...data,
        keywords: keywordsString,
      },
      include: {
        terminal: true,
        mediaFile: true,
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            chatworkId: true,
          },
        },
      },
    });

    const formattedAction = {
      ...action,
      keywords: action.keywords.split(','),
    };

    logger.info('アクションを更新しました:', { id: action.id });
    res.json(formattedAction);
  } catch (error) {
    logger.error('アクションの更新に失敗しました:', error);
    next(error);
  }
}

export async function deleteAction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.action.delete({ where: { id } });
    logger.info('アクションを削除しました:', { id });
    res.json({ success: true });
  } catch (error) {
    logger.error('アクションの削除に失敗しました:', error);
    next(error);
  }
}
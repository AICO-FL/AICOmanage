import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { sendSSEMessage } from '../services/sseService';
import { processMessage } from '../services/actionService';
import { handlePolling as handleTerminalPolling } from '../services/pollingService';
import { logger } from '../utils/logger';

export async function getTerminals(_req: Request, res: Response, next: NextFunction) {
  try {
    const terminals = await prisma.terminal.findMany({
      include: {
        _count: {
          select: {
            conversations: {
              where: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            errorLogs: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(terminals);
  } catch (error) {
    next(error);
  }
}

export async function createTerminal(req: Request, res: Response, next: NextFunction) {
  try {
    const { aicoId, name, greeting } = req.body;

    const existingTerminal = await prisma.terminal.findUnique({
      where: { aicoId },
    });

    if (existingTerminal) {
      throw new AppError('このAICO IDは既に登録されています', 409);
    }

    const terminal = await prisma.terminal.create({
      data: {
        aicoId,
        name,
        greeting,
        status: 'OFFLINE',
      },
    });

    res.json(terminal);
  } catch (error) {
    next(error);
  }
}

export async function updateTerminal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const terminal = await prisma.terminal.update({
      where: { id },
      data: req.body,
    });
    res.json(terminal);
  } catch (error) {
    next(error);
  }
}

export async function deleteTerminal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.terminal.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function handleMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { message_id, message, speaker } = req.body;
    const file = req.file;

    // Create conversation record
    const conversation = await prisma.conversation.create({
      data: {
        messageId: message_id,
        message,
        speaker: speaker.toUpperCase(),
        terminalId: id,
        ...(file && {
          clientFile: {
            create: {
              path: file.path,
              mimeType: file.mimetype,
              size: file.size,
            },
          },
        }),
      },
    });

    // Process message for actions if it's from user
    let actionResponse = null;
    if (speaker.toUpperCase() === 'USER') {
      // 同じメッセージIDグループ内の直前のユーザーメッセージを取得
      const previousMessage = await prisma.conversation.findFirst({
        where: {
          terminalId: id,
          messageId: message_id, // 同じメッセージIDグループ内で検索
          speaker: 'USER',
          id: { // 現在のメッセージは除外
            not: conversation.id
          },
          createdAt: { // 現在のメッセージより前のメッセージ
            lt: conversation.createdAt
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
      });

      logger.info('前回のメッセージ情報:', {
        terminalId: id,
        currentMessageId: message_id,
        currentMessage: message,
        previousMessageId: previousMessage?.messageId,
        previousMessage: previousMessage?.message,
      });

      actionResponse = await processMessage(id, message, message_id, previousMessage?.message);
    }

    res.json({
      conversation,
      ...(actionResponse && { mediaUrl: actionResponse.mediaUrl }),
    });
  } catch (error) {
    next(error);
  }
}

export async function handlePolling(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const greeting = await handleTerminalPolling(id);
    res.json({ greeting });
  } catch (error) {
    next(error);
  }
}

export async function forceSpeak(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new AppError('メッセージは必須です', 400);
    }

    // Save to conversation log
    await prisma.conversation.create({
      data: {
        messageId: `force_${Date.now()}`,
        message,
        speaker: 'AICO',
        terminalId: id,
      },
    });

    // Send message via SSE
    const clientCount = await sendSSEMessage(id, message);
    logger.info(`強制発話メッセージを${clientCount}台のクライアントに送信しました`);

    res.json({ 
      success: true,
      clientCount
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGreeting(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { greeting } = req.body;

    if (!greeting) {
      throw new AppError('挨拶メッセージは必須です', 400);
    }

    const terminal = await prisma.terminal.update({
      where: { id },
      data: { greeting },
    });

    res.json(terminal);
  } catch (error) {
    next(error);
  }
}
import { Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';
import { prisma } from '../utils/prisma';
import { Conversation, Terminal, ClientFile } from '@prisma/client';
import { logger } from '../utils/logger';

interface ConversationWithRelations extends Conversation {
  terminal: Terminal;
  clientFile: ClientFile | null;
}

export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const { terminalId, startDate, endDate, keyword } = req.query;

    logger.info('Fetching conversations with params:', { terminalId, startDate, endDate, keyword });

    const conversations = await prisma.conversation.findMany({
      where: {
        terminalId: terminalId ? String(terminalId) : undefined,
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
        message: keyword ? {
          contains: String(keyword),
          mode: 'insensitive',
        } : undefined,
      },
      include: {
        terminal: true,
        clientFile: true,
      },
      orderBy: [
        { messageId: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const formattedConversations = conversations.map((conv: ConversationWithRelations) => ({
      id: conv.id,
      messageId: conv.messageId,
      terminalId: conv.terminalId,
      timestamp: conv.createdAt,
      messages: [{
        speaker: conv.speaker.toLowerCase(),
        content: conv.message,
        image: conv.clientFile?.path,
      }],
    }));

    res.json(formattedConversations);
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    next(error);
  }
}

export async function downloadConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const { terminalId, startDate, endDate, keyword } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: {
        terminalId: terminalId ? String(terminalId) : undefined,
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
        message: keyword ? {
          contains: String(keyword),
          mode: 'insensitive',
        } : undefined,
      },
      include: {
        terminal: true,
      },
      orderBy: [
        { messageId: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const csvRows = conversations.map((conv) => [
      format(conv.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      conv.terminal.name,
      conv.messageId,
      conv.speaker,
      conv.message,
    ]);

    const csvContent = [
      ['日時', '端末名', 'メッセージID', '発話者', 'メッセージ'],
      ...csvRows,
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=conversations.csv');
    res.send(csvContent);
  } catch (error) {
    logger.error('Error downloading conversations:', error);
    next(error);
  }
}
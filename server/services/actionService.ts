import { prisma } from '../utils/prisma';
import { sendChatworkMessage } from './chatworkService';
import { sendEmail } from './emailService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { logger } from '../utils/logger';

// テンプレート変数を置換する関数
function replaceTemplateVariables(
  template: string,
  variables: {
    message: string;
    prevmessage?: string;
    terminal: string;
    datetime: string;
  }
): string {
  return template
    .replace(/{message}/g, variables.message)
    .replace(/{prevmessage}/g, variables.prevmessage || '前回の会話はありません')
    .replace(/{terminal}/g, variables.terminal)
    .replace(/{datetime}/g, variables.datetime);
}

export async function processMessage(
  terminalId: string,
  message: string,
  messageId: string,
  previousMessage?: string
) {
  try {
    logger.info('アクション処理を開始:', {
      terminalId,
      messageId,
      hasPreviousMessage: !!previousMessage,
    });

    const actions = await prisma.action.findMany({
      where: { terminalId },
      include: {
        terminal: true,
        mediaFile: true,
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            chatworkId: true,
          },
        },
      },
    });

    for (const action of actions) {
      const keywords = action.keywords.split(',').map(k => k.trim());
      const matches = action.condition === 'AND'
        ? keywords.every(k => message.includes(k))
        : keywords.some(k => message.includes(k));

      if (!matches) continue;

      const now = new Date();
      const templateVariables = {
        message,
        prevmessage: previousMessage,
        terminal: action.terminal.name,
        datetime: format(now, 'yyyy年MM月dd日 HH:mm', { locale: ja }),
      };

      switch (action.type) {
        case 'MEDIA':
          if (action.mediaFile) {
            return { mediaUrl: action.mediaFile.url };
          }
          break;

        case 'CHATWORK':
          if (action.template && action.user?.chatworkId) {
            const content = replaceTemplateVariables(
              action.template.content,
              templateVariables
            );
            await sendChatworkMessage(action.user.chatworkId, content);
          }
          break;

        case 'EMAIL':
          if (action.template && action.user?.email) {
            const content = replaceTemplateVariables(
              action.template.content,
              templateVariables
            );
            const subject = `【AICO】お客さまから呼び出し（${action.user.lastName}${action.user.firstName} さん宛て）`;
            await sendEmail(
              action.user.email,
              subject,
              content
            );
          }
          break;
      }
    }

    return null;
  } catch (error) {
    logger.error('アクション処理中にエラーが発生しました:', error);
    throw error;
  }
}
import axios from 'axios';
import { logger } from '../utils/logger';

const CHATWORK_API = 'https://api.chatwork.com/v2';

export async function sendChatworkMessage(roomId: string, message: string) {
  try {
    await axios.post(
      `${CHATWORK_API}/rooms/${roomId}/messages`,
      { 
        body: message,
        self_unread: 1, // 未読として送信
      },
      {
        headers: {
          'X-ChatWorkToken': process.env.CHATWORK_API_KEY,
        },
      }
    );
  } catch (error) {
    logger.error('Chatwork通知の送信に失敗しました:', error);
    throw error;
  }
}
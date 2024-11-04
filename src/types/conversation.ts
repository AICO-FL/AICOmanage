export interface Message {
  speaker: 'user' | 'aico';
  content: string;
  image?: string;
}

export interface Conversation {
  id: string;
  messageId: string;
  terminalId: string;
  timestamp: string;
  messages: Message[];
}

export interface ConversationFilters {
  terminalId?: string;
  startDate: Date;
  endDate: Date;
  keyword?: string;
}
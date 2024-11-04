export interface Terminal {
  id: string;
  aicoId: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE';
  greeting?: string;
  todayConversations: number;
  errorCount: number;
  downtimeMinutes: number;
  lastUpdate: string;
  updatedAt: string;
  _count?: {
    conversations: number;
    errorLogs: number;
  };
}

export interface TerminalFormData {
  aicoId: string;
  name: string;
  greeting?: string;
}

export interface TerminalMessage {
  terminalId: string;
  message: string;
}

export interface TerminalGreeting {
  terminalId: string;
  greeting: string;
}
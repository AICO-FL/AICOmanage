export interface ClientFile {
  id: string;
  conversationId: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
  conversation?: {
    messageId: string;
    message: string;
    createdAt: string;
  };
}

export interface ServerFile {
  id: string;
  fileNo: number;
  name: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: string;
}
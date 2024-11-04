import { z } from 'zod';

export const ActionSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  terminalId: z.string().min(1, 'AICO端末は必須です'),
  description: z.string().optional(),
  condition: z.enum(['AND', 'OR']),
  type: z.enum(['MEDIA', 'CHATWORK', 'EMAIL']),
  mediaId: z.string().optional(),
  templateId: z.string().optional(),
  userId: z.string().optional(),
});

export type ActionFormData = z.infer<typeof ActionSchema>;

export interface Action {
  id: string;
  name: string;
  terminalId: string;
  description?: string;
  keywords: string[];
  condition: 'AND' | 'OR';
  type: 'MEDIA' | 'CHATWORK' | 'EMAIL';
  mediaId?: string;
  templateId?: string;
  userId?: string;
  template?: {
    id: string;
    content: string;
  };
  terminal: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
    chatworkId?: string;
  };
  createdAt: string;
  updatedAt: string;
}
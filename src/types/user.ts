import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9]+$/;

export const UserSchema = z.object({
  username: z.string()
    .min(1, 'ユーザーIDは必須です')
    .regex(usernameRegex, 'ユーザーIDは英数字のみ使用可能です'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  chatworkId: z.string().optional(),
});

export const SystemUserSchema = z.object({
  username: z.string()
    .min(1, '管理者IDは必須です')
    .regex(usernameRegex, '管理者IDは英数字のみ使用可能です'),
  password: z.string()
    .min(8, 'パスワードは8文字以上必要です')
    .optional()
    .or(z.string().length(0)),
  email: z.string().email('有効なメールアドレスを入力してください'),
  chatworkId: z.string().optional(),
});

export type UserFormData = z.infer<typeof UserSchema>;
export type SystemUserFormData = z.infer<typeof SystemUserSchema>;

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  chatworkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  chatworkId?: string;
  updatedAt: string;
}
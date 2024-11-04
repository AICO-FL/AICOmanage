import { z } from 'zod';

export const TemplateSchema = z.object({
  name: z.string()
    .min(1, 'テンプレート名は必須です')
    .max(100, 'テンプレート名は100文字以内で入力してください'),
  content: z.string()
    .min(1, 'テンプレート内容は必須です')
    .max(1000, 'テンプレート内容は1000文字以内で入力してください'),
});

export type TemplateFormData = z.infer<typeof TemplateSchema>;

export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
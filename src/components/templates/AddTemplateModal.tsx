import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTemplates } from '../../hooks/useTemplates';
import { TemplateSchema, type TemplateFormData } from '../../types/template';

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTemplateModal({ isOpen, onClose }: AddTemplateModalProps) {
  const { addTemplate } = useTemplates();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(TemplateSchema),
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      await addTemplate(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add template:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">新規テンプレート</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              テンプレート名
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="例: 問い合わせ通知"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              テンプレート内容
            </label>
            <textarea
              {...register('content')}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="通知メッセージのテンプレートを入力..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <p className="font-medium">使用可能な変数:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>{'{message}'}</code> - 現在のメッセージ内容</li>
                <li><code>{'{prevmessage}'}</code> - 前回のメッセージ内容</li>
                <li><code>{'{terminal}'}</code> - 端末名</li>
                <li><code>{'{datetime}'}</code> - 日時</li>
              </ul>
              <p className="mt-2 text-xs">
                例: [info][title]新規問い合わせ[/title]
                端末「{'{terminal}'}」で以下の問い合わせがありました。

                ＜前回の会話＞
                {'{prevmessage}'}

                ＜今回の会話＞
                {'{message}'}

                日時：{'{datetime}'}[/info]
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
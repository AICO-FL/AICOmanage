import { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddTerminal } from '../../hooks/useTerminals';
import { z } from 'zod';
import { TerminalFormData } from '../../types/terminal';

const aicoIdPattern = /^aico\d+$/;

const TerminalSchema = z.object({
  aicoId: z.string()
    .min(1, 'AICO IDは必須です')
    .regex(aicoIdPattern, 'AICO IDは"aico"で始まり、その後に数字が続く形式である必要があります'),
  name: z.string().min(1, '端末名は必須です'),
  greeting: z.string().optional(),
});

interface AddTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTerminalModal({ isOpen, onClose }: AddTerminalModalProps) {
  const addTerminal = useAddTerminal();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TerminalFormData>({
    resolver: zodResolver(TerminalSchema),
    defaultValues: {
      aicoId: 'aico',
      name: '',
      greeting: '',
    },
  });

  const onSubmit = async (data: TerminalFormData) => {
    try {
      setError(null);
      await addTerminal.mutateAsync(data);
      reset();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('このAICO IDは既に登録されています');
      } else {
        setError(err.message || '端末の登録に失敗しました');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">新規端末の追加</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              AICO ID
            </label>
            <input
              type="text"
              {...register('aicoId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="aico123"
            />
            {errors.aicoId && (
              <p className="mt-1 text-sm text-red-600">{errors.aicoId.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              "aico"で始まり、その後に数字が続く形式で入力してください（例: aico123）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              端末名
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="営業部1F"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              挨拶メッセージ
            </label>
            <textarea
              {...register('greeting')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="こんにちは！何かお手伝いできることはありますか？"
            />
            {errors.greeting && (
              <p className="mt-1 text-sm text-red-600">{errors.greeting.message}</p>
            )}
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
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
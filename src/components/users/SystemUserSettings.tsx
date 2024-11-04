import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SystemUserSchema } from '../../types/user';
import { useState } from 'react';
import { useSystemUser } from '../../hooks/useUsers';

interface SystemUserFormData {
  username: string;
  email: string;
  chatworkId?: string;
  password?: string;
}

export function SystemUserSettings() {
  const { systemUser, updateSystemUser, isLoading, error } = useSystemUser();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SystemUserFormData>({
    resolver: zodResolver(SystemUserSchema),
    defaultValues: {
      username: systemUser?.username || '',
      email: systemUser?.email || '',
      chatworkId: systemUser?.chatworkId || '',
      password: '', // パスワードフィールドは常に空で初期化
    },
  });

  const onSubmit = async (data: SystemUserFormData) => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      await updateSystemUser(data);
      setSuccessMessage('設定を更新しました');
    } catch (error: any) {
      setErrorMessage(error.message || '設定の更新に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          管理者ID
        </label>
        <input
          type="text"
          {...register('username')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          type="password"
          {...register('password')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="変更する場合のみ入力"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          ChatworkID
        </label>
        <input
          type="text"
          {...register('chatworkId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.chatworkId && (
          <p className="mt-1 text-sm text-red-600">{errors.chatworkId.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
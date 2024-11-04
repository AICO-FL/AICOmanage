import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActions } from '../../hooks/useActions';
import { useTerminals } from '../../hooks/useTerminals';
import { useServerFiles } from '../../hooks/useFiles';
import { useUsers } from '../../hooks/useUsers';
import { useTemplates } from '../../hooks/useTemplates';
import { ActionSchema, type ActionFormData } from '../../types/action';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActionModal({ isOpen, onClose }: AddActionModalProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { addAction, isAddLoading } = useActions();
  const { data: terminals = [] } = useTerminals();
  const { files = [] } = useServerFiles();
  const { users = [] } = useUsers();
  const { templates = [] } = useTemplates();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ActionFormData>({
    resolver: zodResolver(ActionSchema),
    defaultValues: {
      type: 'MEDIA',
      condition: 'OR',
    }
  });

  const actionType = watch('type');
  const selectedUserId = watch('userId');

  const selectedUser = users.find(user => user.id === selectedUserId);

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const onSubmit = async (data: ActionFormData) => {
    try {
      setError(null);
      
      if (keywords.length === 0) {
        setError('キーワードを1つ以上追加してください');
        return;
      }

      // バリデーション
      if (actionType === 'MEDIA' && !data.mediaId) {
        setError('送信するファイルを選択してください');
        return;
      }

      if ((actionType === 'CHATWORK' || actionType === 'EMAIL') && !data.userId) {
        setError('通知先ユーザーを選択してください');
        return;
      }

      if ((actionType === 'CHATWORK' || actionType === 'EMAIL') && !data.templateId) {
        setError('通知テンプレートを選択してください');
        return;
      }

      await addAction({
        ...data,
        keywords,
      });
      
      reset();
      setKeywords([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'アクションの登録に失敗しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">新規アクション</h3>
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                アクション名
              </label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                AICO端末
              </label>
              <select
                {...register('terminalId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">端末を選択</option>
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </option>
                ))}
              </select>
              {errors.terminalId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.terminalId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              キーワード
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="キーワードを入力..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1.5 text-indigo-600 hover:text-indigo-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              条件
            </label>
            <div className="mt-1">
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('condition')}
                    value="AND"
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">すべてのキーワードを含む</span>
                </label>
                <br />
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('condition')}
                    value="OR"
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">いずれかのキーワードを含む</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              アクションタイプ
            </label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="MEDIA">画像・動画の送信</option>
              <option value="CHATWORK">Chatworkに通知</option>
              <option value="EMAIL">メールで通知</option>
            </select>
          </div>

          {(actionType === 'CHATWORK' || actionType === 'EMAIL') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                通知先ユーザー
              </label>
              <select
                {...register('userId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">ユーザーを選択</option>
                {users.map((user) => (
                  <option 
                    key={user.id} 
                    value={user.id}
                    disabled={
                      (actionType === 'CHATWORK' && !user.chatworkId) ||
                      (actionType === 'EMAIL' && !user.email)
                    }
                  >
                    {user.username} 
                    {actionType === 'CHATWORK' && !user.chatworkId && ' (ChatworkID未設定)'}
                    {actionType === 'EMAIL' && !user.email && ' (メール未設定)'}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <p className="mt-1 text-sm text-gray-500">
                  {actionType === 'CHATWORK' && selectedUser.chatworkId && 
                    `ChatworkID: ${selectedUser.chatworkId}`}
                  {actionType === 'EMAIL' && selectedUser.email && 
                    `メールアドレス: ${selectedUser.email}`}
                </p>
              )}
            </div>
          )}

          {actionType === 'MEDIA' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                送信するファイル
              </label>
              <select
                {...register('mediaId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">ファイルを選択</option>
                {files.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(actionType === 'CHATWORK' || actionType === 'EMAIL') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                通知テンプレート
              </label>
              <select
                {...register('templateId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">テンプレートを選択</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={isAddLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isAddLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
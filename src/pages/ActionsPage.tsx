import { useState } from 'react';
import { Plus, AlertTriangle, RefreshCcw } from 'lucide-react';
import { ActionList } from '../components/actions/ActionList';
import { AddActionModal } from '../components/actions/AddActionModal';
import { useActions } from '../hooks/useActions';

export function ActionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { actions, isLoading, error, refetch } = useActions();

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h2>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">アクション管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            キーワードに基づくアクションを設定・管理します
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規アクション
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : actions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Plus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">アクションがありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            新しいアクションを追加してください
          </p>
        </div>
      ) : (
        <ActionList actions={actions} />
      )}

      <AddActionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
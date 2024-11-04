import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TemplateList } from '../components/notifications/TemplateList';
import { AddTemplateModal } from '../components/notifications/AddTemplateModal';
import { useTemplates } from '../hooks/useTemplates';

export function NotificationsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { templates, isLoading, error } = useTemplates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">通知メッセージ設定</h1>
          <p className="mt-2 text-sm text-gray-700">
            通知テンプレートの管理と設定を行います
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規テンプレート
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">エラーが発生しました: {error.message}</p>
        </div>
      ) : (
        <TemplateList templates={templates} />
      )}

      <AddTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
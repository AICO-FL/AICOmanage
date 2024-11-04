import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { TemplateList } from '../components/templates/TemplateList';
import { AddTemplateModal } from '../components/templates/AddTemplateModal';
import { useTemplates } from '../hooks/useTemplates';

export function TemplatesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { templates, isLoading, error } = useTemplates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">通知テンプレート</h1>
          <p className="mt-2 text-sm text-gray-700">
            Chatworkやメールで送信する通知メッセージのテンプレートを管理します
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
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">テンプレートがありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            新しいテンプレートを追加してください
          </p>
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
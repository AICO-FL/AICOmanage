import { useState } from 'react';
import { Edit, Trash2, MessageSquare, Image, Mail, Bell, AlertTriangle } from 'lucide-react';
import { Action } from '../../types/action';
import { EditActionModal } from './EditActionModal';
import { useActions } from '../../hooks/useActions';

interface ActionListProps {
  actions: Action[];
}

export function ActionList({ actions }: ActionListProps) {
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { deleteAction, isDeleteLoading } = useActions();

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteAction(id);
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'MEDIA':
        return <Image className="h-5 w-5" />;
      case 'CHATWORK':
        return <MessageSquare className="h-5 w-5" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {deleteError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{deleteError}</p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {actions.map((action) => (
          <li key={action.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-lg p-3">
                  {getActionIcon(action.type)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {action.terminal.name} - {action.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setEditingAction(action)}
                  className="text-indigo-600 hover:text-indigo-900"
                  disabled={isDeleteLoading}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(action.id)}
                  className="text-red-600 hover:text-red-900"
                  disabled={isDeleteLoading}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">キーワード</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {action.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">条件</h4>
                <p className="mt-2 text-sm text-gray-500">
                  {action.condition === 'AND' ? 'すべての' : 'いずれかの'}
                  キーワードを含む
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editingAction && (
        <EditActionModal
          action={editingAction}
          isOpen={true}
          onClose={() => setEditingAction(null)}
        />
      )}
    </div>
  );
}
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { UserList } from '../components/users/UserList';
import { AddUserModal } from '../components/users/AddUserModal';
import { SystemUserSettings } from '../components/users/SystemUserSettings';
import { useUsers } from '../hooks/useUsers';

export function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { users, isLoading, error } = useUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ユーザー設定</h1>
        <p className="mt-2 text-sm text-gray-700">
          AICOユーザーとシステム管理者の設定を管理します
        </p>
      </div>

      {/* AICOユーザー管理セクション */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">AICOユーザー</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規ユーザー
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
          <UserList users={users} />
        )}
      </div>

      {/* システム管理者設定セクション */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          システム管理者設定
        </h2>
        <SystemUserSettings />
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
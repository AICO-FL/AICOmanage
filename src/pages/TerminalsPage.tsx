import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { AddTerminalModal } from '../components/terminals/AddTerminalModal';
import { TerminalCard } from '../components/terminals/TerminalCard';
import { TerminalControls } from '../components/terminals/TerminalControls';
import { useTerminals, useDeleteTerminal } from '../hooks/useTerminals';

export function TerminalsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: terminals = [], isLoading, error } = useTerminals();
  const deleteTerminal = useDeleteTerminal();

  const handleDelete = async (terminalId: string) => {
    try {
      setDeleteError(null);
      await deleteTerminal.mutateAsync(terminalId);
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AICO端末</h1>
          <p className="mt-2 text-sm text-gray-700">
            AICO端末の管理と監視を行います
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          端末を追加
        </button>
      </div>

      {deleteError && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{deleteError}</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">エラーが発生しました: {error.message}</p>
        </div>
      ) : terminals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Plus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">端末がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            新しいAICO端末を追加してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {terminals.map((terminal) => (
            <TerminalCard
              key={terminal.id}
              terminal={terminal}
              isSelected={selectedTerminal === terminal.id}
              onSelect={() => setSelectedTerminal(terminal.id)}
              onDelete={() => handleDelete(terminal.id)}
            />
          ))}
        </div>
      )}

      {selectedTerminal && (
        <TerminalControls
          terminalId={selectedTerminal}
          onClose={() => setSelectedTerminal(null)}
        />
      )}

      <AddTerminalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
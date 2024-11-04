import { MessageSquare, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { Terminal } from '../../types/terminal';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TerminalCardProps {
  terminal: Terminal;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function TerminalCard({ terminal, isSelected, onSelect, onDelete }: TerminalCardProps) {
  const statusColor = terminal.status === 'ONLINE' ? 'green' : 'red';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この端末を削除してもよろしいですか？')) {
      onDelete();
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer
        ${isSelected ? 'border-indigo-500' : 'border-transparent'}
        hover:border-indigo-300
      `}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{terminal.name}</h3>
            <p className="text-sm text-gray-500">ID: {terminal.aicoId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center text-${statusColor}-500`}>
              <span className={`h-2.5 w-2.5 rounded-full bg-${statusColor}-500 mr-2`} />
              <span className="text-sm capitalize">
                {terminal.status === 'ONLINE' ? 'オンライン' : 'オフライン'}
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="ml-4 p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
              title="端末を削除"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>本日の会話: {terminal.todayConversations || 0} 件</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>エラー数: {terminal.errorCount || 0} 件</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Settings className="h-4 w-4 mr-2" />
            <span>最終更新: {
              terminal.lastUpdate 
                ? format(new Date(terminal.lastUpdate), 'yyyy/MM/dd HH:mm', { locale: ja })
                : '更新なし'
            }</span>
          </div>

          {terminal.greeting && (
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">挨拶メッセージ:</p>
              <p>{terminal.greeting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
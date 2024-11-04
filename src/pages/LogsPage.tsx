import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useConversationLogs } from '../hooks/useConversationLogs';
import { useTerminals } from '../hooks/useTerminals';
import { ConversationList } from '../components/logs/ConversationList';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function LogsPage() {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(),
  });
  const [keyword, setKeyword] = useState('');

  const { data: terminals = [] } = useTerminals();
  const { logs, isLoading, error, downloadCsv } = useConversationLogs({
    terminalId: selectedTerminal,
    startDate: dateRange.start,
    endDate: dateRange.end,
    keyword,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">会話ログ</h1>
        <p className="mt-2 text-sm text-gray-700">
          AICOターミナルの会話履歴を確認・検索できます
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          {/* Terminal Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AICO端末
            </label>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">全ての端末</option>
              {terminals.map((terminal) => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期間
            </label>
            <ReactDatePicker
              selectsRange
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={(dates) => {
                const [start, end] = dates;
                if (start && end) {
                  setDateRange({ start, end });
                }
              }}
              dateFormat="yyyy/MM/dd"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              wrapperClassName="w-full"
            />
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="検索キーワードを入力..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={downloadCsv}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            CSVダウンロード
          </button>
        </div>

        {/* Conversation List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">エラーが発生しました: {error.message}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">会話ログがありません</p>
          </div>
        ) : (
          <ConversationList conversations={logs} />
        )}
      </div>
    </div>
  );
}
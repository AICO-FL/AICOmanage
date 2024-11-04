import { useState } from 'react';
import { BarChart, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { useTerminals } from '@/hooks/useTerminals';
import { formatDowntime } from '@/utils/formatters';

export function DashboardPage() {
  const { data: terminals = [], isLoading, error } = useTerminals();
  const [selectedAico, setSelectedAico] = useState('');

  // Calculate real-time statistics
  const activeTerminals = terminals.filter(t => t.status === 'ONLINE').length;
  const totalConversations = terminals.reduce((sum, t) => sum + (t.todayConversations || 0), 0);
  const totalErrors = terminals.reduce((sum, t) => sum + (t.errorCount || 0), 0);
  const totalDowntimeMinutes = terminals.reduce((sum, t) => sum + (t.downtimeMinutes || 0), 0);
  const formattedDowntime = formatDowntime(totalDowntimeMinutes);

  const stats = [
    {
      name: '本日の会話数',
      value: totalConversations,
      icon: MessageSquare,
      change: totalConversations > 0 ? '+' + totalConversations : '0',
      changeType: 'positive' as const
    },
    {
      name: 'アクティブ端末',
      value: activeTerminals,
      icon: BarChart,
      change: `${((activeTerminals / (terminals.length || 1)) * 100).toFixed(1)}%`,
      changeType: 'positive' as const
    },
    {
      name: '総端末数',
      value: terminals.length,
      icon: Clock,
      change: terminals.length > 0 ? '+' + terminals.length : '0',
      changeType: 'positive' as const
    },
    {
      name: 'ダウンタイム',
      value: formattedDowntime,
      icon: AlertTriangle,
      change: totalDowntimeMinutes > 0 ? formattedDowntime : '0分',
      changeType: totalDowntimeMinutes === 0 ? 'positive' : 'negative' as const
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-sm text-gray-700">
          AICO端末のパフォーマンスと統計情報を監視します
        </p>
      </div>

      {terminals.length > 0 && (
        <div className="mb-6">
          <label htmlFor="aico" className="block text-sm font-medium text-gray-700">
            AICO端末を選択
          </label>
          <select
            id="aico"
            value={selectedAico}
            onChange={(e) => setSelectedAico(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">すべての端末</option>
            {terminals.map((terminal) => (
              <option key={terminal.id} value={terminal.id}>
                {terminal.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold
                    ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* エラーログセクション */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">エラーログ</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {terminals.some(t => t.errorCount > 0) ? (
            <ul className="divide-y divide-gray-200">
              {terminals
                .filter(t => t.errorCount > 0)
                .map((terminal) => (
                  <li key={terminal.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {terminal.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${terminal.status === 'ONLINE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'}`}>
                            {terminal.status === 'ONLINE' ? 'オンライン' : 'オフライン'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="text-sm text-gray-500">
                            {terminal.errorCount}件のエラーを検出
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>最終更新: {new Date(terminal.lastUpdate).toLocaleString('ja-JP')}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">エラーなし</h3>
              <p className="mt-1 text-sm text-gray-500">
                すべての端末が正常に動作しています
              </p>
            </div>
          )}
        </div>
      </div>

      {terminals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-8">
          <BarChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">端末がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            最初のAICO端末を追加してください
          </p>
        </div>
      )}
    </div>
  );
}
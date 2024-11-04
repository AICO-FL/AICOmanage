import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { Conversation, ConversationFilters } from '../types/conversation';

export function useConversationLogs(filters: ConversationFilters) {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<Conversation[]>('/conversations', {
          params: {
            terminalId: filters.terminalId,
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
            keyword: filters.keyword,
          },
        });
        return data;
      } catch (error) {
        console.error('Failed to fetch conversation logs:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
  });

  const downloadCsv = async () => {
    try {
      const response = await adminApi.get('/conversations/download', {
        params: {
          terminalId: filters.terminalId,
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString(),
          keyword: filters.keyword,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'conversations.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  return {
    logs: logs || [],
    isLoading,
    error,
    downloadCsv,
  };
}
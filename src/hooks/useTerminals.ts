import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { Terminal, TerminalFormData, TerminalMessage, TerminalGreeting } from '../types/terminal';

export function useTerminals() {
  return useQuery({
    queryKey: ['terminals'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<Terminal[]>('/terminals');
        return data.map(terminal => ({
          ...terminal,
          todayConversations: terminal._count?.conversations || 0,
          errorCount: terminal._count?.errorLogs || 0,
          lastUpdate: terminal.updatedAt
        }));
      } catch (error: any) {
        console.error('Failed to fetch terminals:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useAddTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (terminal: TerminalFormData) => {
      try {
        const { data } = await adminApi.post<Terminal>('/terminals', terminal);
        return data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '端末の登録に失敗しました。');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
    },
  });
}

export function useDeleteTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (terminalId: string) => {
      try {
        await adminApi.delete(`/terminals/${terminalId}`);
      } catch (error: any) {
        throw new Error(error.response?.data?.message || '端末の削除に失敗しました。');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
    },
  });
}

export function useForcedMessage() {
  return useMutation({
    mutationFn: async ({ terminalId, message }: TerminalMessage) => {
      const { data } = await adminApi.post(`/terminals/${terminalId}/force-speak`, {
        message,
      });
      return data;
    },
  });
}

export function useGreetingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ terminalId, greeting }: TerminalGreeting) => {
      const { data } = await adminApi.post(`/terminals/${terminalId}/greeting`, {
        greeting,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
    },
  });
}
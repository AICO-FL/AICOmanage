import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { Action, ActionFormData } from '../types/action';

export function useActions() {
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading, error } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<Action[]>('/actions');
        return data;
      } catch (error) {
        console.error('Failed to fetch actions:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const addActionMutation = useMutation({
    mutationFn: async (data: { keywords: string[]; } & ActionFormData) => {
      const response = await adminApi.post<Action>('/actions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'アクションの登録に失敗しました');
    },
  });

  const updateActionMutation = useMutation({
    mutationFn: async ({ id, action, keywords }: { id: string; action: ActionFormData; keywords: string[] }) => {
      const response = await adminApi.put<Action>(`/actions/${id}`, { ...action, keywords });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'アクションの更新に失敗しました');
    },
  });

  const deleteActionMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/actions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'アクションの削除に失敗しました');
    },
  });

  return {
    actions,
    isLoading,
    error,
    addAction: addActionMutation.mutateAsync,
    updateAction: async (id: string, action: ActionFormData, keywords: string[]) => {
      return updateActionMutation.mutateAsync({ id, action, keywords });
    },
    deleteAction: deleteActionMutation.mutateAsync,
    isAddLoading: addActionMutation.isPending,
    isUpdateLoading: updateActionMutation.isPending,
    isDeleteLoading: deleteActionMutation.isPending,
  };
}
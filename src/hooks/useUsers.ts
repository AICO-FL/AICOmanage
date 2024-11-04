import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { User, UserFormData, SystemUserFormData } from '../types/user';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<User[]>('/users');
        return data;
      } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30秒間はキャッシュを使用
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
  });

  const addUserMutation = useMutation({
    mutationFn: async (user: UserFormData) => {
      const { data } = await adminApi.post<User>('/users', user);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'ユーザーの登録に失敗しました');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, user }: { id: string; user: Partial<UserFormData> }) => {
      const { data } = await adminApi.put<User>(`/users/${id}`, user);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'ユーザーの更新に失敗しました');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'ユーザーの削除に失敗しました');
    },
  });

  return {
    users,
    isLoading,
    error,
    addUser: addUserMutation.mutateAsync,
    updateUser: async (id: string, user: Partial<UserFormData>) => {
      return updateUserMutation.mutateAsync({ id, user });
    },
    deleteUser: deleteUserMutation.mutateAsync,
    isAddLoading: addUserMutation.isPending,
    isUpdateLoading: updateUserMutation.isPending,
    isDeleteLoading: deleteUserMutation.isPending,
  };
}

export function useSystemUser() {
  const queryClient = useQueryClient();

  const { data: systemUser, isLoading, error } = useQuery({
    queryKey: ['system-user'],
    queryFn: async () => {
      const { data } = await adminApi.get('/users/system');
      return data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const updateSystemUserMutation = useMutation({
    mutationFn: async (data: SystemUserFormData) => {
      const response = await adminApi.put('/users/system', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-user'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'システム管理者の更新に失敗しました');
    },
  });

  return {
    systemUser,
    isLoading,
    error,
    updateSystemUser: updateSystemUserMutation.mutateAsync,
    isUpdateLoading: updateSystemUserMutation.isPending,
  };
}
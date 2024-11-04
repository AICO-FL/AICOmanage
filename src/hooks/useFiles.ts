import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { ClientFile, ServerFile } from '../types/file';

export function useClientFiles() {
  const queryClient = useQueryClient();

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['client-files'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<ClientFile[]>('/files/client');
        return data;
      } catch (error) {
        console.error('Failed to fetch client files:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const downloadFile = async (fileId: string) => {
    try {
      const response = await adminApi.get(`/files/client/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const contentDisposition = response.headers['content-disposition'];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `file-${fileId}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await adminApi.delete(`/files/client/${fileId}`);
      queryClient.invalidateQueries({ queryKey: ['client-files'] });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return {
    files: files || [],
    isLoading,
    error,
    downloadFile,
    deleteFile,
  };
}

export function useServerFiles() {
  const queryClient = useQueryClient();

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['server-files'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<ServerFile[]>('/files/server');
        return data;
      } catch (error) {
        console.error('Failed to fetch server files:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await adminApi.post('/files/server', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-files'] });
    },
  });

  const downloadFile = async (fileId: string) => {
    try {
      const response = await adminApi.get(`/files/server/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const contentDisposition = response.headers['content-disposition'];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `file-${fileId}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await adminApi.delete(`/files/server/${fileId}`);
      queryClient.invalidateQueries({ queryKey: ['server-files'] });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return {
    files: files || [],
    isLoading,
    error,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    downloadFile,
    deleteFile,
  };
}
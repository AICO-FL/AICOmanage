import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../utils/api';
import { Template, TemplateFormData } from '../types/template';

export function useTemplates() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const { data } = await adminApi.get<Template[]>('/templates');
        return data;
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        throw error;
      }
    },
    staleTime: 30000,
  });

  const addTemplateMutation = useMutation({
    mutationFn: async (template: TemplateFormData) => {
      const { data } = await adminApi.post<Template>('/templates', template);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: string; template: TemplateFormData }) => {
      const { data } = await adminApi.put<Template>(`/templates/${id}`, template);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  return {
    templates,
    isLoading,
    error,
    addTemplate: addTemplateMutation.mutateAsync,
    updateTemplate: async (id: string, template: TemplateFormData) => {
      return updateTemplateMutation.mutateAsync({ id, template });
    },
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isAddLoading: addTemplateMutation.isPending,
    isUpdateLoading: updateTemplateMutation.isPending,
    isDeleteLoading: deleteTemplateMutation.isPending,
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/application.service';

export const useApplications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; code: string; description?: string }) =>
      applicationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      applicationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    applications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createApp: createMutation.mutateAsync,
    updateApp: updateMutation.mutateAsync,
    deleteApp: deleteMutation.mutateAsync,
  };
};

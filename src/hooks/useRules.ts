import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ruleService } from '../services/rule.service';

export const useRules = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['rules'],
    queryFn: () => ruleService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ruleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ruleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? ruleService.disable(id) : ruleService.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ruleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });

  return {
    rules: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createRule: createMutation.mutateAsync,
    updateRule: updateMutation.mutateAsync,
    toggleRule: toggleMutation.mutateAsync,
    deleteRule: deleteMutation.mutateAsync,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deadLetterService } from '../services/dead-letter.service';

export const useDeadLetter = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dead-letter'],
    queryFn: () => deadLetterService.getAll(),
    refetchInterval: 10000, // Periodic background polling for dead letters
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => deadLetterService.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dead-letter'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  return {
    deadLetterEvents: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    retryDeadLetter: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
  };
};

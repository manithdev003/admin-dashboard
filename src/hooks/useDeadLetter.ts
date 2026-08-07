import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deadLetterService } from '../services/dead-letter.service';

export const useDeadLetter = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dead-letter'],
    queryFn: () => deadLetterService.getAll(),
    refetchInterval: 10000, // Periodic background polling for dead letters
  });

  const batchQuery = useQuery({
    queryKey: ['dead-letter-batch'],
    queryFn: () => deadLetterService.getBatchAll(),
    refetchInterval: 10000,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => deadLetterService.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dead-letter'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  const retryBatchMutation = useMutation({
    mutationFn: (id: string) => deadLetterService.retryBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dead-letter-batch'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });

  return {
    deadLetterEvents: query.data || [],
    batchDeadLetterEvents: batchQuery.data || [],
    isLoading: query.isLoading || batchQuery.isLoading,
    refetch: () => {
      query.refetch();
      batchQuery.refetch();
    },
    retryDeadLetter: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
    retryBatchDeadLetter: retryBatchMutation.mutateAsync,
    isRetryingBatch: retryBatchMutation.isPending,
  };
};

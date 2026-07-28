import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publisherService } from '../services/publisher.service';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => publisherService.getAllPublished(),
  });

  const publishMutation = useMutation({
    mutationFn: (data: any) => publisherService.publish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    publishedEvents: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    publishEvent: publishMutation.mutateAsync,
  };
};

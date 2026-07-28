import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import { Application } from '../types';

export const useEvents = (applications: Application[]) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['events', applications.map((a) => a.id)],
    queryFn: async () => {
      if (!applications.length) return [];
      const allEvts = [];
      for (const app of applications) {
        try {
          const res = await eventService.getByApplication(app.id);
          if (Array.isArray(res)) allEvts.push(...res);
        } catch {
          // ignore
        }
      }
      return allEvts;
    },
    enabled: applications.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: any }) =>
      eventService.create(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
  };
};

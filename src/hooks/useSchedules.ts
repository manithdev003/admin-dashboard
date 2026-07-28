import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';

export const useSchedules = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => scheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, sendAt }: { id: string; sendAt: string }) =>
      scheduleService.reschedule(id, sendAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => scheduleService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    scheduled: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createSchedule: createMutation.mutateAsync,
    reschedule: rescheduleMutation.mutateAsync,
    cancelSchedule: cancelMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutateAsync,
  };
};

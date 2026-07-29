import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringScheduleService } from '../services/recurring-schedule.service';

export const useRecurringSchedules = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['recurringSchedules'],
    queryFn: () => recurringScheduleService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => recurringScheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringSchedules'] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => recurringScheduleService.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringSchedules'] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => recurringScheduleService.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringSchedules'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, cronExpression }: { id: string; cronExpression: string }) =>
      recurringScheduleService.reschedule(id, cronExpression),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringSchedules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recurringScheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringSchedules'] });
    },
  });

  return {
    recurringSchedules: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createRecurringSchedule: createMutation.mutateAsync,
    pauseRecurringSchedule: pauseMutation.mutateAsync,
    resumeRecurringSchedule: resumeMutation.mutateAsync,
    rescheduleRecurringSchedule: rescheduleMutation.mutateAsync,
    deleteRecurringSchedule: deleteMutation.mutateAsync,
  };
};

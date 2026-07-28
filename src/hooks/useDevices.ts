import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../services/device.service';

export const useDevices = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll(),
  });

  const registerMutation = useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: any }) =>
      deviceService.register(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const heartbeatMutation = useMutation({
    mutationFn: (deviceId: string) => deviceService.heartbeat(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (deviceId: string) => deviceService.deactivate(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (deviceId: string) => deviceService.delete(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  return {
    devices: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    registerDevice: registerMutation.mutateAsync,
    heartbeatDevice: heartbeatMutation.mutateAsync,
    deactivateDevice: deactivateMutation.mutateAsync,
    deleteDevice: deleteMutation.mutateAsync,
  };
};

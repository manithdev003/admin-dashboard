import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface AuditLogModel {
  id: string;
  action: string;
  status: 'SUCCESS' | 'ERROR';
  method?: string;
  endpoint?: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
}

interface FetchLogsResponse {
  success: boolean;
  data: AuditLogModel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useAuditLogs = (page = 1, limit = 50, filters?: { status?: string; action?: string }) => {
  const queryClient = useQueryClient();

  const fetchLogs = async (): Promise<FetchLogsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.action && { action: filters.action }),
    });

    const response = await axios.get(`${API_URL}/audit-logs?${params.toString()}`);
    return response.data;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditLogs', page, limit, filters],
    queryFn: fetchLogs,
  });

  const clearMutation = useMutation({
    mutationFn: async (retention: string) => {
      const response = await axios.delete(`${API_URL}/audit-logs`, { data: { retention } });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });

  return {
    logs: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
    refetch,
    clearLogs: clearMutation.mutateAsync,
    isClearing: clearMutation.isPending,
  };
};

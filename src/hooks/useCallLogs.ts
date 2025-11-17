import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { CallLogFilters } from '../types';
import toast from 'react-hot-toast';

export const useCallLogs = (filters?: CallLogFilters) => {
  return useQuery({
    queryKey: ['call-logs', filters],
    queryFn: async () => {
      const response = await apiService.getCallLogs(filters);
      return response.data;
    },
    // Removed aggressive auto-refresh to improve performance
    // Use manual refresh button instead
  });
};

export const useCallLog = (id: number) => {
  return useQuery({
    queryKey: ['call-log', id],
    queryFn: async () => {
      const response = await apiService.getCallLog(id);
      return response.data?.call_log;
    },
    enabled: !!id,
  });
};

export const useDeleteCallLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteCallLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      toast.success('Call log deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete call log');
    },
  });
};

export const useDeleteRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteRecording(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      queryClient.invalidateQueries({ queryKey: ['call-log'] });
      toast.success('Recording deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete recording');
    },
  });
};

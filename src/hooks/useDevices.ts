import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { DeviceFilters } from '../types';
import toast from 'react-hot-toast';

export const useDevices = (filters?: DeviceFilters) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const response = await apiService.getDevices(filters);
      return response.data;
    },
    // Smart polling: only poll when page is visible, reduced frequency for performance
    refetchInterval: (query) => {
      // Stop polling if page is hidden
      if (typeof document !== 'undefined' && document.hidden) {
        return false;
      }
      // Poll every 60 seconds instead of 30 (50% reduction in API calls)
      return 60000;
    },
    // Resume polling when page becomes visible again
    refetchOnWindowFocus: true,
  });
};

export const useDevice = (id: number) => {
  return useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      const response = await apiService.getDevice(id);
      return response.data?.device;
    },
    enabled: !!id,
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete device');
    },
  });
};

export const useLogoutDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.logoutDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Logout signal sent to device');
    },
    onError: () => {
      toast.error('Failed to send logout signal');
    },
  });
};

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
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
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

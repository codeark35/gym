import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';

export interface Notification {
  id: string;
  type: 'SUGGESTION' | 'OVERTRAINING' | 'ROUTINE' | 'GENERAL' | 'PR' | 'SYSTEM';
  title: string;
  message: string;
  data: Record<string, any> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  enableAISuggestions: boolean;
  enableOvertrainingAlerts: boolean;
  enableRoutineSuggestions: boolean;
  enablePRNotifications: boolean;
}

const STALE_TIME = 5 * 60 * 1000;

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return (res.data.data ?? res.data) as Notification[];
    },
    staleTime: STALE_TIME,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const res = await api.get('/notifications/count');
      return res.data.data ?? res.data;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // refrescar cada 1 minuto
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: async () => {
      const res = await api.get('/notifications/settings');
      return (res.data.data ?? res.data) as NotificationSettings;
    },
    staleTime: STALE_TIME,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const res = await api.post('/notifications/settings', settings);
      return (res.data.data ?? res.data) as NotificationSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

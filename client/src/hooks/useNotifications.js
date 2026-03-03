import { useState, useCallback } from 'react';
import { usePolling } from './usePolling';
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotifRead,
  markAllNotifsRead,
  bulkReadNotifs,
  bulkDeleteNotifs,
  deleteAllNotifs,
} from '../api';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const pollCount = useCallback(async () => {
    const data = await fetchUnreadCount();
    if (data) setUnreadCount(data.unreadCount || 0);
  }, []);

  usePolling(pollCount, 30000);

  const refreshCount = pollCount;

  return {
    unreadCount,
    refreshCount,
    fetchNotifications,
    markNotifRead,
    markAllNotifsRead,
    bulkReadNotifs,
    bulkDeleteNotifs,
    deleteAllNotifs,
  };
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = Cookies.get('accessToken');
      const userId = Cookies.get('userId');
      
      if (!token || !userId) {
        console.log('No token or userId found');
        return [];
      }

      const response = await axios.get(`/interactions/notifications/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const notifs = response.data.data || [];
        const unread = notifs.filter(n => !n.isRead).length;
        
        setNotifications(notifs);
        setUnreadCount(unread);
        return notifs;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      return [];
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.patch(
        `/interactions/notifications/read/${notificationId}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = Cookies.get('accessToken');
      const userId = Cookies.get('userId');
      
      if (!token || !userId) {
        throw new Error('No access token or userId found');
      }

      const response = await axios.patch(
        `/interactions/notifications/read/all/${userId}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.delete(
        `/interactions/notifications/${notificationId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        setUnreadCount(prev => 
          prev - (notifications.find(n => n._id === notificationId)?.isRead ? 0 : 1)
        );
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setNotifications,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

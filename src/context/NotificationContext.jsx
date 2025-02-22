import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "./AuthContext"; // Import useAuth

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    unread: 0,
    read: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // Get authentication status

  // Fetch notifications whenever auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialNotifications();
    } else {
      // Reset notifications when logged out
      setNotifications([]);
      setCounts({ all: 0, unread: 0, read: 0 });
    }
  }, [isAuthenticated]); // Add isAuthenticated as dependency

  const fetchInitialNotifications = async () => {
    const userId = Cookies.get("userId");
    const token = Cookies.get("accessToken");

    if (userId && token) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `/interactions/notifications/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          setNotifications(response.data.data);
          const unreadCount = response.data.data.filter(
            (n) => !n.isRead
          ).length;
          setCounts({
            all: response.data.data.length,
            unread: unreadCount,
            read: response.data.data.length - unreadCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
        setCounts({ all: 0, unread: 0, read: 0 });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  // Regular fetch notifications function (for manual refresh)
  const fetchNotifications = async () => {
    await fetchInitialNotifications();
  };

  const markNotificationRead = async (notifId) => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        await axios.patch(
          `/interactions/notifications/read/${notifId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif._id === notifId ? { ...notif, isRead: true } : notif
          )
        );
        // Update counts after marking as read
        setCounts((prev) => ({
          ...prev,
          unread: prev.unread - 1,
          read: prev.read + 1,
        }));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const markAllRead = async () => {
    const userId = Cookies.get("userId");
    const token = Cookies.get("accessToken");
    if (userId && token) {
      try {
        await axios.patch(
          `/interactions/notifications/read/all/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
      } catch (error) {
        console.error("Failed to mark all notifications as read", error);
      }
    }
  };

  const deleteNotification = async (notifId) => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        await axios.delete(`/interactions/notifications/${notifId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notifId)
        );
      } catch (error) {
        console.error("Failed to delete notification", error);
      }
    }
  };

  const deleteAllNotifications = async () => {
    const userId = Cookies.get("userId");
    const token = Cookies.get("accessToken");
    if (userId && token) {
      try {
        await axios.delete(`/interactions/notifications/all/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setNotifications([]);
      } catch (error) {
        console.error("Failed to delete all notifications", error);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        counts,
        isLoading,
        fetchNotifications: fetchInitialNotifications, // Rename for clarity
        markNotificationRead,
        markAllRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

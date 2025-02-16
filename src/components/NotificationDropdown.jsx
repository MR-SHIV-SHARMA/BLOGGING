import React, { useState } from "react";
import { FaBell, FaTrash } from "react-icons/fa";
import axios from "axios";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Toggle the dropdown and fetch notifications if opening
  const toggleNotifications = async () => {
    const newShow = !showNotifications;
    setShowNotifications(newShow);

    if (newShow) {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("accessToken");
      if (userId && token) {
        try {
          const response = await axios.get(
            `https://bg-io.vercel.app/api/v1/interactions/notifications/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          // Handle various response structures
          let fetchedNotifications = response.data;
          if (!Array.isArray(fetchedNotifications)) {
            if (Array.isArray(response.data.data)) {
              fetchedNotifications = response.data.data;
            } else if (Array.isArray(response.data.notifications)) {
              fetchedNotifications = response.data.notifications;
            } else {
              fetchedNotifications = [];
            }
          }
          setNotifications(fetchedNotifications);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      } else {
        console.error("User ID or Token not found in localStorage");
      }
    }
  };

  // Mark a single notification as read
  const markNotificationRead = async (notifId) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await axios.patch(
          `https://bg-io.vercel.app/api/v1/interactions/notifications/read/${notifId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Update state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif._id === notifId ? { ...notif, isRead: true } : notif
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    } else {
      console.error("Access token not found");
    }
  };

  // Delete a single notification
  const deleteNotification = async (notifId, e) => {
    // Prevent clicking the notification (which would mark it as read)
    e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await axios.delete(
          `https://bg-io.vercel.app/api/v1/interactions/notifications/${notifId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Remove it from state
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => notif._id !== notifId)
        );
      } catch (error) {
        console.error("Failed to delete notification", error);
      }
    } else {
      console.error("Access token not found");
    }
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    if (userId && token) {
      try {
        await axios.patch(
          `https://bg-io.vercel.app/api/v1/interactions/notifications/read/all/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Update state for all notifications
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({ ...notif, isRead: true }))
        );
      } catch (error) {
        console.error("Failed to mark all notifications as read", error);
      }
    } else {
      console.error("User ID or Token not found in localStorage");
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    if (userId && token) {
      try {
        await axios.delete(
          `https://bg-io.vercel.app/api/v1/interactions/notifications/all/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Clear notifications from state
        setNotifications([]);
      } catch (error) {
        console.error("Failed to delete all notifications", error);
      }
    } else {
      console.error("User ID or Token not found in localStorage");
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  return (
    <div className="relative">
      {/* Bell icon with badge */}
      <button
        onClick={toggleNotifications}
        className="relative flex items-center justify-center gap-2 p-2"
        aria-label="Notifications"
      >
        <FaBell size={24} className="text-white hover:text-gray-300 transition" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50 divide-y">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-sm text-blue-500 hover:text-blue-700 transition"
              >
                Mark all as read
              </button>
              <button
                onClick={deleteAllNotifications}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Delete all
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => markNotificationRead(notif._id)}
                  className={`py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-start ${
                    !notif.isRead ? "bg-gray-50" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {notif.message}
                    </p>
                    <span className="block text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-2">
                    <FaTrash
                      onClick={(e) => deleteNotification(notif._id, e)}
                      className="text-red-500 hover:text-red-700 cursor-pointer transition"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
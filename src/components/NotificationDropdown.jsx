import React, { useState, useEffect } from "react";
import { FaBell, FaTrash, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Store a mapping of actionUserId (_id) -> avatar URL
  const [userAvatars, setUserAvatars] = useState({});

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
            `/interactions/notifications/${userId}`,
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
          `/interactions/notifications/read/${notifId}`,
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
        await axios.delete(`/interactions/notifications/${notifId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        // Remove from state
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
          `/interactions/notifications/read/all/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Update state
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
        await axios.delete(`/interactions/notifications/all/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setNotifications([]);
      } catch (error) {
        console.error("Failed to delete all notifications", error);
      }
    } else {
      console.error("User ID or Token not found in localStorage");
    }
  };

  // Count of unread notifications
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  // Fetch user avatars for each notification using the actionUserId from the notification
  useEffect(() => {
    async function fetchAvatars() {
      const token = localStorage.getItem("accessToken");
      // Get all action user IDs from notifications that don't already have an avatar
      const newUserIds = notifications
        .map((notif) => notif.actionUserId?._id)
        .filter((id) => id && !userAvatars[id]);
      const uniqueUserIds = [...new Set(newUserIds)];

      for (let id of uniqueUserIds) {
        console.log("Fetching avatar for id: " + id);
        try {
          const response = await axios.get(`/user/profile/view/${id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          });

          // Assume that response.data.data has an "avatar" property
          if (response.data && response.data.data.avatar) {
            setUserAvatars((prev) => ({
              ...prev,
              [id]: response.data.data.avatar,
            }));
          }
        } catch (err) {
          console.error(`Error fetching avatar for user ${id}:`, err);
        }
      }
    }
    if (notifications.length > 0) {
      fetchAvatars();
    }
  }, [notifications, userAvatars]);

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative flex items-center justify-center gap-2 p-2"
        aria-label="Notifications"
      >
        <FaBell
          size={24}
          className="text-white hover:text-gray-300 transition"
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute -right-14 mt-1 sm:mt-3 w-[90vw] max-w-sm bg-white text-black rounded-lg shadow-lg z-50 divide-y sm:w-80">
          {/* Header */}
          <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
            <div className="flex space-x-2">
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
          <div className="max-h-60 overflow-y-auto p-4 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => markNotificationRead(notif._id)}
                  className={`flex justify-between items-start p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition ${
                    !notif.isRead ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Link
                      to={`/api/v1/user/profile/view/f/${notif.actionUserId._id}`}
                      className="group relative"
                    >
                      {notif.actionUserId &&
                      userAvatars[notif.actionUserId._id] ? (
                        <img
                          src={userAvatars[notif.actionUserId._id]}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle size={40} className="text-gray-400" />
                      )}
                    </Link>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {notif.message}
                      </p>
                      <span className="block text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <FaTrash
                    onClick={(e) => deleteNotification(notif._id, e)}
                    className="text-red-500 hover:text-red-700 cursor-pointer transition"
                  />
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

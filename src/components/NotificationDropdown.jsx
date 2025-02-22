import React, { useState, useEffect } from "react";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import Cookies from "js-cookie";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  // Mapping of actionUserId (_id) -> avatar URL
  const [userAvatars, setUserAvatars] = useState({});
  // Active filter tab: "all", "unread", or "read"
  const [activeSection, setActiveSection] = useState("all");

  // Check if we're on the notifications page
  const location = useLocation();
  const isNotificationsPage = location.pathname === "/notifications";

  // Compute counts for all notifications, unread, and read
  const allCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // Fetch notifications on mount (or when rendered as a page)
  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = Cookies.get("userId");
      const token = Cookies.get("accessToken");

      if (userId && token) {
        try {
          const response = await axios.get(
            `/interactions/notifications/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.success && Array.isArray(response.data.data)) {
            setNotifications(response.data.data);
          } else {
            setNotifications([]);
          }
        } catch (error) {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  // Mark a single notification as read
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
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    } else {
      console.error("Access token not found");
    }
  };

  // Delete a single notification
  const deleteNotification = async (notifId, e) => {
    // Prevent triggering mark-as-read if clicked
    e.stopPropagation();
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        await axios.delete(`/interactions/notifications/${notifId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
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
    } else {
      console.error("User ID or Token not found in localStorage");
    }
  };

  // Filter notifications based on active section
  const filteredNotifications = notifications.filter((notif) => {
    if (activeSection === "unread") return !notif.isRead;
    if (activeSection === "read") return notif.isRead;
    return true;
  });

  // Group notifications by date (Today, Yesterday, or locale date string)
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const notifDate = new Date(notif.createdAt);
    const today = new Date();
    let groupName = notifDate.toLocaleDateString();
    if (notifDate.toDateString() === today.toDateString()) {
      groupName = "Today";
    } else {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (notifDate.toDateString() === yesterday.toDateString()) {
        groupName = "Yesterday";
      }
    }
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(notif);
    return groups;
  }, {});

  // Fetch user avatars for the notifications (if not already present)
  useEffect(() => {
    async function fetchAvatars() {
      const token = Cookies.get("accessToken");
      const newUserIds = notifications
        .map((notif) => notif.actionUserId?._id)
        .filter((id) => id && !userAvatars[id]);
      const uniqueUserIds = [...new Set(newUserIds)];

      for (let id of uniqueUserIds) {
        try {
          const response = await axios.get(`/user/profile/view/${id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          });
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
  }, [notifications]);

  return (
    <div className="w-full">
      {/* Notifications Panel */}
      <div className="bg-white shadow-xl rounded-lg w-full mt-4 max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Mark all read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-3 border-b">
          {["all", "unread", "read"].map((section) => {
            let count =
              section === "all"
                ? allCount
                : section === "unread"
                ? unreadCount
                : readCount;
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
                  px-3 py-1 rounded-full capitalize text-sm
                  ${
                    activeSection === section
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                {section} ({count})
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-2">
          {Object.entries(groupedNotifications).map(([groupName, notifs]) => (
            <div key={groupName} className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 px-2 py-1">
                {groupName}
              </h4>
              <div className="space-y-2">
                {notifs.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.isRead) markNotificationRead(notif._id);
                    }}
                    className={`flex items-start p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      !notif.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="shrink-0 mr-3">
                      <Link
                        to={`/api/v1/user/profile/view/f/${notif.actionUserId?._id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {userAvatars[notif.actionUserId?._id] ? (
                          <img
                            src={userAvatars[notif.actionUserId._id]}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="User avatar"
                          />
                        ) : (
                          <FaUserCircle className="text-gray-400 w-10 h-10" />
                        )}
                      </Link>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteNotification(notif._id, e)}
                      className="shrink-0 p-2 hover:text-red-700 ml-2"
                      aria-label="Delete notification"
                    >
                      <FaTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center p-4 text-gray-500 text-sm">
              No notifications found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDropdown;

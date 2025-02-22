import React, { useState, useEffect } from "react";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import Cookies from "js-cookie";
import axios from "axios";

function NotificationDropdown() {
  const [userAvatars, setUserAvatars] = useState({});
  const [activeSection, setActiveSection] = useState("all");
  const location = useLocation();

  const notificationContext = useNotifications();
  const {
    notifications = [],
    counts = { all: 0, unread: 0, read: 0 },
    fetchNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
    deleteAllNotifications,
  } = notificationContext || {};

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

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
              onClick={markAllRead}
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
          {["all", "unread", "read"].map((section) => (
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
              {section} ({counts[section]})
            </button>
          ))}
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
                      onClick={(e) => deleteNotification(notif._id)}
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

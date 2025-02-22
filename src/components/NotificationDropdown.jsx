import React, { useState, useEffect } from "react";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { useUserProfile } from '../context/UserProfile';
import Cookies from "js-cookie";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

function NotificationDropdown() {
  const [userAvatars, setUserAvatars] = useState({});
  const [activeSection, setActiveSection] = useState("all");
  const location = useLocation();

  const {
    notifications,
    markNotificationAsRead,
    deleteNotification: userDeleteNotification,
    clearAllNotifications,
    loading,
    fetchNotifications
  } = useUserProfile();

  // Add this useEffect to fetch notifications when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []); // Run once when component mounts

  // Calculate counts directly from notifications array
  const counts = {
    all: notifications?.length || 0,
    unread: notifications?.filter((notif) => !notif.isRead)?.length || 0,
    read: notifications?.filter((notif) => notif.isRead)?.length || 0,
  };

  // Filter notifications based on active section
  const filteredNotifications = notifications?.filter((notif) => {
    if (activeSection === "unread") return !notif.isRead;
    if (activeSection === "read") return notif.isRead;
    return true;
  }) || [];

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const date = new Date(notif.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupName;
    if (date.toDateString() === today.toDateString()) {
      groupName = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupName = "Yesterday";
    } else {
      groupName = date.toLocaleDateString();
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(notif);
    return groups;
  }, {});

  // Fetch user avatars
  useEffect(() => {
    async function fetchAvatars() {
      const token = Cookies.get("accessToken");
      if (!notifications?.length) return;

      const newUserIds = notifications
        .map((notif) => notif.actionUserId?._id)
        .filter((id) => id && !userAvatars[id]);
      
      const uniqueUserIds = [...new Set(newUserIds)];

      for (let id of uniqueUserIds) {
        try {
          const response = await axios.get(`/user/profile/view/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data?.data?.avatar) {
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

    fetchAvatars();
  }, [notifications]);

  if (loading) {
    return <div className="text-center p-4">Loading notifications...</div>;
  }

  return (
    <div className="w-full">
      <div className="bg-white shadow-xl rounded-lg w-full mt-4 max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Notifications ({counts.all})
          </h3>
          {counts.all > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear all
            </button>
          )}
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
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 px-2 py-1">
                {date}
              </h4>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start p-3 rounded-lg hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markNotificationAsRead(notification._id);
                      }
                    }}
                  >
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <Link
                        to={`/api/v1/user/profile/view/f/${notification.actionUserId?._id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {userAvatars[notification.actionUserId?._id] ? (
                          <img
                            src={userAvatars[notification.actionUserId._id]}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="User avatar"
                          />
                        ) : (
                          <FaUserCircle className="w-10 h-10 text-gray-400" />
                        )}
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        userDeleteNotification(notification._id);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDropdown;

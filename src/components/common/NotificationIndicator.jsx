import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationBadge from "./NotificationBadge";
// Using a simple bell icon or we can use an emoji

const NotificationIndicator = ({
  showIcon = true,
  size = "sm",
  variant = "red",
}) => {
  const { totalNotifications, loading, hasAnyNotifications } =
    useNotifications();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        {showIcon && <span className="text-lg">🔔</span>}
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!hasAnyNotifications()) {
    return (
      <div className="flex items-center space-x-2">
        {showIcon && <span className="text-lg">🔔</span>}
        <span className="text-sm text-gray-500">No notifications</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {showIcon && <span className="text-lg">🔔</span>}
      <NotificationBadge
        count={totalNotifications}
        size={size}
        variant={variant}
      />
    </div>
  );
};

export default NotificationIndicator;

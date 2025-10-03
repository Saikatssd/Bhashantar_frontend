import React from "react";

const NotificationBadge = ({ count, size = "sm", variant = "red" }) => {
  if (!count || count === 0) return null;

  const sizeClasses = {
    xs: "px-1 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  const variantClasses = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-white",
    orange: "bg-orange-500 text-white",
    purple: "bg-purple-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold leading-none rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
      title={`${count} file${count > 1 ? "s" : ""} ready for work`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default NotificationBadge;

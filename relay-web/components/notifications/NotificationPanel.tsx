"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";

const PAGE_SIZE = 10;

export default function NotificationPanel() {
  const { notifications, isLoading, markRead, markAllRead } =
    useNotifications();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = notifications.slice(0, visibleCount);
  const hasMore = notifications.length > visibleCount;

  return (
    <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Notifications
        </h3>
        <button
          onClick={markAllRead}
          className="text-xs text-blue-500 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              All caught up!
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              No notifications yet.
            </p>
          </div>
        ) : (
          <>
            {visible.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="w-full px-4 py-3 text-center text-xs text-blue-500 transition-colors hover:bg-gray-50 hover:text-blue-700 dark:hover:bg-gray-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Load {Math.min(PAGE_SIZE, notifications.length - visibleCount)}{" "}
                more
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2 text-center dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {visible.length} of {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

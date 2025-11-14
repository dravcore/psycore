'use client';

import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            animate-slideIn rounded-xl shadow-2xl p-4 border-l-4 backdrop-blur-sm
            ${notification.type === 'success' ? 'bg-green-50 border-green-500' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-500' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 border-blue-500' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'info' && 'ℹ️'}
                {notification.type === 'warning' && '⚠️'}
              </span>
              <div>
                {notification.title && (
                  <p className="font-semibold text-gray-900 mb-1">{notification.title}</p>
                )}
                <p className="text-sm text-gray-700">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

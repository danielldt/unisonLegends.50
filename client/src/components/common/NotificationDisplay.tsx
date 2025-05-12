import React from 'react';
import { Notification } from '../../utils/store';

interface NotificationDisplayProps {
  notifications: Notification[];
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`mb-2 px-4 py-2 rounded-md font-pixel text-white shadow-md ${
            notification.type === 'success' ? 'bg-green-600' : 
            notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationDisplay; 
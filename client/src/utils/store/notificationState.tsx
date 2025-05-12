import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: number } }
  | { type: 'CLEAR_ALL' };

const initialState: NotificationState = {
  notifications: []
};

// Reducer function
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
}

// Create context
type NotificationContextType = {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Helper functions
  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
    
    // Auto-remove after 3 seconds
    const id = Date.now();
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    }, 3000);
  };

  const removeNotification = (id: number) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <NotificationContext.Provider
      value={{
        state,
        dispatch,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return {
    notifications: context.state.notifications,
    addNotification: context.addNotification,
    removeNotification: context.removeNotification,
    clearNotifications: context.clearNotifications
  };
} 
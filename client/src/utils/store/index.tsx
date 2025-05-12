import React, { ReactNode } from 'react';
import { GameProvider } from './gameState';
import { NotificationProvider } from './notificationState';

// Export all store components
export * from './gameState';
export * from './gameActions';
export * from './notificationState';
export * from './storeUtils';

// Root store provider to wrap the app
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotificationProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </NotificationProvider>
  );
}; 
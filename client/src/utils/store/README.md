# Unison Legends State Management

This directory contains the centralized state management system for Unison Legends.

## Core Components

### GameState

The `gameState.ts` file contains:
- State interfaces and types
- The game state reducer
- React Context and Provider for game state
- `useGameState` hook for components to access the game state

### NotificationState

The `notificationState.ts` file contains:
- Notification interfaces and types
- The notification state reducer
- React Context and Provider for notifications
- `useNotifications` hook for components to display notifications

### GameActions

The `gameActions.ts` file contains action creators that:
- Call the gameService methods
- Dispatch actions to update state when needed
- Handle complex state transitions
- Maintain consistent interaction with the server

### StoreUtils

The `storeUtils.ts` file contains:
- Selectors for accessing specific slices of state
- Helper functions for event listeners
- Utility functions for working with the store

## Using the State Management System

### Accessing State in Components

Use the `useGameState` hook to access the game state:

```tsx
import { useGameState } from '../utils/store';

function MyComponent() {
  const { state, dispatch } = useGameState();
  
  // Access state values
  const playerHealth = state.player?.stats.hp;
  
  return (
    <div>
      <h1>Player Health: {playerHealth}</h1>
    </div>
  );
}
```

### Performing Actions

Use the `gameActions` to interact with the game:

```tsx
import { useGameState, gameActions } from '../utils/store';

function SpellButton({ spellId }) {
  const { dispatch } = useGameState();
  
  const handleCast = () => {
    gameActions.castSpell(spellId, targetId, dispatch);
  };
  
  return (
    <button onClick={handleCast}>Cast Spell</button>
  );
}
```

### Displaying Notifications

Use the `useNotifications` hook to show notifications:

```tsx
import { useNotifications } from '../utils/store';

function MyComponent() {
  const { notifications, addNotification } = useNotifications();
  
  const handleAction = () => {
    // Do something
    addNotification('Action completed successfully!', 'success');
  };
  
  return (
    <div>
      {/* Render notifications */}
      <NotificationDisplay notifications={notifications} />
      
      <button onClick={handleAction}>Do Action</button>
    </div>
  );
}
```

## Design Principles

1. **Single Source of Truth**: All game state is managed in one central store
2. **Unidirectional Data Flow**: Data flows from state to components
3. **Immutable State**: State is never directly modified, only through actions
4. **Pure Function Reducers**: Reducers are pure functions that return new state
5. **Separation of Concerns**: State, actions, and UI are separated 
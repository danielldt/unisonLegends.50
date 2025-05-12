# State Management Architecture

## Overview

The Unison Legends state management system implements a centralized, predictable state container using React Context and Reducers. This architecture follows a pattern similar to Redux but with native React tools and a focus on game-specific requirements.

## Directory Structure

```
src/utils/store/
├── index.ts           # Exports all store components
├── gameState.ts       # Game state context, reducer, and types
├── gameActions.ts     # Action creators for game operations
├── notificationState.ts # Notification system state
├── storeUtils.ts      # Utilities and selectors
├── README.md          # Usage documentation
└── ARCHITECTURE.md    # This architecture document
```

## Data Flow

1. **UI Events**: User interactions in components (clicks, form submits)
2. **Actions**: Game actions are triggered from components
3. **Server Communication**: Actions call gameService methods
4. **Server Events**: Server responses are handled in the GameProvider
5. **Reducers**: State reducers update state based on server responses
6. **Components**: UI components re-render with updated state

```
┌───────────────┐    ┌────────────┐    ┌────────────┐
│   Component   │───►│  Actions   │───►│ GameService│
└───────▲───────┘    └────────────┘    └─────┬──────┘
        │                                    │
        │                                    ▼
┌───────┴───────┐    ┌────────────┐    ┌────────────┐
│  Game State   │◄───│  Reducers  │◄───│Server Events│
└───────────────┘    └────────────┘    └────────────┘
```

## Core Abstractions

### 1. Game State

The core game state includes:
- Player data (stats, level, experience)
- Inventory and equipment
- Spells and abilities
- Connection state

### 2. Notifications

A separate notification system that:
- Manages transient messages
- Auto-removes notifications after a timeout
- Provides different notification types (success, error, info)

### 3. Action Creators

Action creators that:
- Bridge between UI and server
- Include validation logic
- Update local state optimistically when appropriate
- Handle errors consistently

## Benefits of the Architecture

1. **Centralized State**: Eliminates duplication and state inconsistencies
2. **Decoupled Components**: Components only depend on the state they need
3. **Predictable Updates**: State changes follow a consistent pattern
4. **Developer Experience**: Clear paths for data flow and state changes
5. **Testing**: Easier to mock state and test component behavior

## Implementation Notes

- The implementation focuses on typescript safety with comprehensive interfaces
- Action creators handle the communication with the server service
- Components consume state via hooks with clear naming conventions
- Selectors provide optimized access to specific parts of state
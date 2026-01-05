# Phase 1, Step 4: Client Implementation - Plan

**Date:** January 5, 2026
**Status:** 🔄 Planning

---

## 📋 Overview

Transform the existing local-only Kvizovka client to support **online multiplayer** via WebSocket connection to the server.

**Goal:** Two players can create/join rooms and play a full game online in real-time.

---

## 🎯 Current State Analysis

### ✅ What We Have

**Client Structure:**
```
packages/client/src/
├── App.tsx                 # Root component, loads dictionary
├── components/
│   ├── Game/              # Main game component
│   ├── Board/             # Game board display
│   ├── TileRack/          # Player's tiles
│   ├── GameControls/      # Move buttons
│   ├── ScorePanel/        # Score display
│   └── Scoresheet/        # Detailed scoring
└── store/
    └── gameStore.ts       # Zustand game state (local only)
```

**Existing Features:**
- ✅ Full local multiplayer working (2 players, same device)
- ✅ All game logic (move validation, scoring)
- ✅ Dictionary loaded client-side
- ✅ Zustand state management
- ✅ Socket.io-client dependency already installed

### ❌ What We Need

- ❌ Socket.io service wrapper
- ❌ Online menu UI (create/join room)
- ❌ Game mode selection (local vs online)
- ❌ Online game store logic
- ❌ WebSocket event handlers
- ❌ Connection state management
- ❌ Opponent disconnect handling

---

## 🏗️ Architecture Design

### Dual-Mode Strategy

Keep local multiplayer working, add online as separate mode:

```
Main Menu
├── Play Locally (existing)  → Local game
└── Play Online (NEW)        → Online menu
    ├── Create Room
    └── Join Room
```

**Benefits:**
- Low risk (local mode still works)
- Easy to test both modes
- Users can choose
- Gradual migration path

### State Management Approach

**Option A: Separate Stores** (Recommended)
- Keep existing `gameStore.ts` for local mode
- Create new `onlineGameStore.ts` for online mode
- Clear separation of concerns

**Option B: Unified Store**
- Add `mode: 'local' | 'online'` to existing store
- Conditional logic based on mode
- More complex but single source of truth

**Decision: Use Option A** - Cleaner, easier to maintain

---

## 📁 Files to Create

### 1. Socket Service
**File:** `packages/client/src/services/socket.ts`

**Purpose:** Wrap Socket.io client with typed events

**API:**
```typescript
class SocketService {
  connect(): void
  disconnect(): void
  emit(event, data, callback?): void
  on(event, handler): void
  off(event, handler): void
  isConnected(): boolean
}

export const socketService = new SocketService()
```

### 2. Online Game Store
**File:** `packages/client/src/store/onlineGameStore.ts`

**Purpose:** Manage online game state

**State:**
```typescript
{
  // Connection
  isConnected: boolean
  connectionError: string | null

  // Room
  roomCode: string | null
  playerName: string | null
  isHost: boolean

  // Game
  gameId: string | null
  gameState: GameState | null
  yourPlayerId: string | null

  // UI
  view: 'menu' | 'waiting' | 'playing'
}
```

**Actions:**
```typescript
{
  // Connection
  connect()
  disconnect()

  // Room
  createRoom(playerName)
  joinRoom(roomCode, playerName)
  ready()

  // Game
  makeMove(placedTiles)
  skipTurn()
  exchangeTiles(tileIds)
  challengeWord()

  // Events
  handleGameStarted(data)
  handleStateUpdate(data)
  handleOpponentDisconnected()
}
```

### 3. Online Menu Component
**File:** `packages/client/src/components/OnlineMenu/OnlineMenu.tsx`

**Purpose:** UI for creating/joining rooms

**States:**
- Initial (create or join)
- Creating room (enter name)
- Joining room (enter code + name)
- Waiting for opponent
- Ready to start

### 4. Game Mode Menu
**File:** `packages/client/src/components/GameModeMenu/GameModeMenu.tsx`

**Purpose:** Choose between local and online

**UI:**
```
┌─────────────────────────┐
│   Kvizovka              │
├─────────────────────────┤
│                         │
│  [Play Locally]         │
│  2 players, same device │
│                         │
│  [Play Online]          │
│  Find opponent online   │
│                         │
└─────────────────────────┘
```

### 5. Online Game Component
**File:** `packages/client/src/components/OnlineGame/OnlineGame.tsx`

**Purpose:** Game UI for online mode

**Similar to existing Game component but:**
- Uses onlineGameStore instead of gameStore
- Shows connection status
- Shows opponent info
- Handles disconnects

---

## 🔄 Implementation Steps

### Step 1: Socket Service (30 min)

**Tasks:**
1. Create `src/services/socket.ts`
2. Import Socket.io client
3. Import typed events from `@kvizovka/shared`
4. Implement connection management
5. Add typed event emitters/listeners
6. Add error handling

**Key Code:**
```typescript
import { io, Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@kvizovka/shared'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

class SocketService {
  private socket: TypedSocket | null = null

  connect() {
    this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000')
  }

  // ... typed methods
}
```

### Step 2: Online Game Store (1 hour)

**Tasks:**
1. Create `src/store/onlineGameStore.ts`
2. Define state interface
3. Implement connection actions
4. Implement room actions
5. Implement game actions
6. Add WebSocket event handlers
7. Add error handling

**Key Patterns:**
```typescript
createRoom: (playerName: string) => {
  socketService.emit('room:create', { playerName }, (response) => {
    if (response.success) {
      set({
        roomCode: response.roomCode,
        playerName,
        isHost: true,
        view: 'waiting'
      })
    }
  })
}
```

### Step 3: Game Mode Menu (30 min)

**Tasks:**
1. Create `src/components/GameModeMenu/GameModeMenu.tsx`
2. Add two buttons (Local, Online)
3. Style with Tailwind
4. Handle navigation

### Step 4: Online Menu (1 hour)

**Tasks:**
1. Create `src/components/OnlineMenu/OnlineMenu.tsx`
2. Implement create room form
3. Implement join room form
4. Implement waiting room state
5. Show room code for sharing
6. Add ready button

**UI Flow:**
```
1. Choose: Create or Join
2a. Create: Enter name → Show code → Wait
2b. Join: Enter code + name → Connect
3. Both players → Ready button appears
4. Both ready → Game starts
```

### Step 5: Online Game Component (1.5 hours)

**Tasks:**
1. Create `src/components/OnlineGame/OnlineGame.tsx`
2. Reuse Board, TileRack, etc. from local mode
3. Connect to onlineGameStore
4. Add connection indicator
5. Add opponent info display
6. Handle disconnect modal
7. Implement all game actions via WebSocket

### Step 6: Update App.tsx (30 min)

**Tasks:**
1. Add game mode state
2. Show GameModeMenu first
3. Route to local or online based on choice
4. Keep dictionary loading logic

**Structure:**
```typescript
function App() {
  const [mode, setMode] = useState<'menu' | 'local' | 'online'>('menu')

  if (mode === 'menu') return <GameModeMenu onSelect={setMode} />
  if (mode === 'local') return <Game />  // Existing
  if (mode === 'online') return <OnlineGame />  // New
}
```

### Step 7: Environment Variables (15 min)

**Tasks:**
1. Create `.env` files
2. Add VITE_SERVER_URL
3. Update vite config if needed

**Files:**
```bash
# .env.development
VITE_SERVER_URL=http://localhost:3000

# .env.production
VITE_SERVER_URL=https://your-server.railway.app
```

### Step 8: Testing (1 hour)

**Test Scenarios:**
1. Open two browser tabs
2. Tab 1: Create room
3. Tab 2: Join with code
4. Play full game
5. Test disconnect/reconnect
6. Test all game actions

---

## 🎨 UI Components Needed

### Connection Status Indicator
```tsx
<div className="connection-indicator">
  {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
</div>
```

### Room Code Display
```tsx
<div className="room-code">
  <h3>Room Code</h3>
  <div className="code-display">{roomCode}</div>
  <p>Share this code with your opponent</p>
</div>
```

### Waiting Room
```tsx
<div className="waiting-room">
  <h2>Waiting for opponent...</h2>
  <div className="spinner">⏳</div>
</div>
```

### Opponent Info Panel
```tsx
<div className="opponent-info">
  <h3>Opponent</h3>
  <p>{opponentName}</p>
  <p>Score: {opponentScore}</p>
  <p>Tiles: {opponentTileCount}</p>
</div>
```

---

## 🔒 Security Considerations

### Client-Side Validation

**DON'T:**
- ❌ Trust client state for game logic
- ❌ Calculate scores client-side
- ❌ Validate moves client-side

**DO:**
- ✅ Send moves to server for validation
- ✅ Display server-provided game state
- ✅ Show optimistic UI updates (then rollback if rejected)

### State Synchronization

**Pattern:**
```typescript
// Optimistic update
const tempState = applyMoveLocally(move)
set({ gameState: tempState })

// Send to server
socketService.emit('game:make-move', { move }, (response) => {
  if (!response.success) {
    // Rollback on error
    set({ gameState: previousState })
    showError(response.error)
  }
  // Server will send state-update event with authoritative state
})
```

---

## 📊 Estimated Timeline

| Task | Time | Dependencies |
|------|------|--------------|
| 1. Socket Service | 30 min | - |
| 2. Online Game Store | 1 hour | Socket Service |
| 3. Game Mode Menu | 30 min | - |
| 4. Online Menu | 1 hour | Online Store |
| 5. Online Game Component | 1.5 hours | Online Store, Menu |
| 6. Update App.tsx | 30 min | All components |
| 7. Environment Variables | 15 min | - |
| 8. Testing | 1 hour | Everything |
| **Total** | **~6 hours** | |

---

## ✅ Success Criteria

- [ ] Two browsers can create/join room
- [ ] Room code sharing works
- [ ] Game starts when both ready
- [ ] All moves work (place, skip, exchange, challenge)
- [ ] State updates in real-time for both players
- [ ] Opponent tiles are hidden
- [ ] Disconnect shows error message
- [ ] Game ends correctly with winner
- [ ] Can start new game after completion
- [ ] Local mode still works

---

## 🚀 Next Steps After Step 4

### Phase 2: Persistence & Polish
- Save games to database
- Matchmaking system
- User accounts
- Game history
- Leaderboards

### Phase 3: Production
- Deploy to production
- Performance optimization
- Error tracking (Sentry)
- Analytics
- Admin dashboard

---

**Status:** Ready to begin implementation. Starting with Socket Service creation.

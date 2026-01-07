# Bug Fixes - January 5, 2026

**Session Date:** January 5, 2026
**Testing Phase:** Online Multiplayer Gameplay
**Status:** ✅ ALL BUGS FIXED

---

## 🐛 Bug #1: Duplicate Tiles on Board

### Problem
When dragging a tile from one board square to another, the tile appeared in **both locations** (old and new), creating duplicates.

**Screenshot:** User showed board with tiles "Z U U Z Z" where tiles appeared in multiple positions.

### Root Cause
State update race condition in `OnlineGame.tsx`:

```typescript
// BAD - Uses stale state
const handleTilePlaced = (tile: PlacedTile) => {
  setSelectedTiles([...selectedTiles, tile])  // ❌ Stale selectedTiles
}

const handleTileRemoved = (row: number, col: number) => {
  setSelectedTiles(selectedTiles.filter(...))  // ❌ Stale selectedTiles
}
```

When moving a tile:
1. `handleTileRemoved` called → removes from old position
2. `handleTilePlaced` called immediately after → but uses **stale state** before removal
3. Result: Tile added but removal not yet reflected → duplicate!

### Solution
Use functional state updates to always get the **most recent state**:

```typescript
// GOOD - Uses current state
const handleTilePlaced = (tile: PlacedTile) => {
  setSelectedTiles(prev => [...prev, tile])  // ✅ Always current
}

const handleTileRemoved = (row: number, col: number) => {
  setSelectedTiles(prev => prev.filter(...))  // ✅ Always current
}

const handleJokerLetterSet = (row: number, col: number, letter: string) => {
  setSelectedTiles(prev => prev.map(...))  // ✅ Always current
}
```

**Files Changed:**
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` (lines 131-155)

**Status:** ✅ FIXED - Tested and confirmed working

---

## 🐛 Bug #2: Socket Disconnection After Game Start

### Problem
After starting a game (both players click "Ready"), the WebSocket connection immediately disconnected. When clicking "Play Word", nothing happened because the socket was dead.

**Error in Console:**
```
[Socket] Cannot emit - not connected
```

**Server Logs:**
```
[GameManager] Game created: ...
[Socket.io] Client disconnected: ...  ← Both clients disconnect!
```

### Root Cause
Component lifecycle issue in `OnlineMenu.tsx`:

```typescript
// BAD - Disconnects when component unmounts
useEffect(() => {
  connect()
  return () => disconnect()  // ❌ Called when OnlineMenu unmounts!
}, [connect, disconnect])
```

**Flow:**
1. User in OnlineMenu → socket connected
2. Both players click "Ready" → game starts
3. View changes from `OnlineMenu` to `OnlineGame`
4. `OnlineMenu` component unmounts
5. `useEffect` cleanup runs → `disconnect()` called
6. Socket destroyed right when game starts!
7. `OnlineGame` tries to send moves → socket is null

### Solution

**Part 1: Don't disconnect on view change**

Remove disconnect from OnlineMenu unmount:

```typescript
// GOOD - Stay connected during view transition
useEffect(() => {
  connect()
  // No disconnect on unmount - socket stays alive!
}, [connect])
```

**Part 2: Disconnect when user leaves online mode**

Add disconnect to the reset function:

```typescript
// In onlineGameStore.ts
reset: () => {
  console.log('[OnlineStore] Resetting state and disconnecting...')
  socketService.removeAllListeners()
  socketService.disconnect()  // ✅ Disconnect here instead
  set(initialState)
}
```

Now socket:
- ✅ Stays connected when transitioning: Menu → Waiting Room → Game
- ✅ Only disconnects when user clicks "Back to Menu" (calls reset)

**Files Changed:**
- `packages/client/src/components/OnlineMenu/OnlineMenu.tsx` (lines 41-46)
- `packages/client/src/store/onlineGameStore.ts` (lines 396-401)

**Status:** ✅ FIXED - Tested with multiple moves across players

---

## 🐛 Bug #3: Tiles Disappearing After Move (Original)

### Problem
When Player 1 clicked "Play Word", the tiles disappeared from the board immediately, and Player 2 remained stuck on "waiting for opponent".

### Root Cause
Premature state clearing in `OnlineGame.tsx`:

```typescript
// BAD - Clears state before server confirms
const handlePlayWord = () => {
  if (selectedTiles.length === 0) return
  makeMove(selectedTiles)
  setSelectedTiles([])  // ❌ Cleared too early!
}
```

**Flow:**
1. User places tiles → `selectedTiles` has tiles
2. User clicks "Play Word"
3. Client sends move to server
4. Client **immediately** clears `selectedTiles`
5. Tiles disappear from UI (because `selectedTiles` empty)
6. Server processes move asynchronously
7. Server may reject move, but tiles already gone from UI!

### Solution

**Don't clear immediately - wait for server response:**

```typescript
const handlePlayWord = () => {
  if (selectedTiles.length === 0) return
  makeMove(selectedTiles)
  // Don't clear here - wait for server response
}

// Clear when server sends updated game state
useEffect(() => {
  if (gameState) {
    setSelectedTiles([])  // ✅ Clear after server confirms
  }
}, [gameState?.round, gameState?.currentPlayerIndex])
```

**Flow (Fixed):**
1. User places tiles → `selectedTiles` has tiles
2. User clicks "Play Word"
3. Client sends move to server
4. Tiles **stay visible** (selectedTiles not cleared)
5. Server validates and processes move
6. Server broadcasts updated game state
7. Client receives `game:state-update` event
8. `useEffect` triggers → clears `selectedTiles`
9. Tiles now shown from server's board state (permanent)

**Files Changed:**
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` (lines 117-129, 40-46)

**Status:** ✅ FIXED - Combined with Socket fix for full resolution

---

## 📊 Testing Results

### Test Game Statistics
**Game ID:** `314e558e-33f6-444f-8124-1aebb9b37797`
**Players:** d vs e
**Moves Played:** 4 successful moves
**Duration:** ~5 minutes

**Move Log:**
1. **Player d (5 tiles):** "VIJEC" → 0 points (horizontal from center)
2. **Player e (3 tiles):** "TIĐ" → 1 point (vertical intersecting)
3. **Player d (4 tiles):** "KŠJI" → 1 point (vertical intersecting)
4. **Player e (2 tiles):** "ME" → 2 points (horizontal extending "KIME")

**What Was Tested:**
- ✅ Room creation and joining
- ✅ Game start with both players ready
- ✅ Tile drag-and-drop from rack to board
- ✅ Moving tiles on board (no duplicates)
- ✅ Submitting moves with "Play Word"
- ✅ Turn switching between players
- ✅ Score updates after each move
- ✅ Multiple rounds of gameplay
- ✅ Socket connection stability throughout game
- ✅ Cross-browser communication (two tabs)

**What Works:**
- ✅ All tiles stay on board when placed
- ✅ Tiles move cleanly without duplicates
- ✅ Moves submit successfully to server
- ✅ Turn indicator updates correctly
- ✅ Opponent sees board updates in real-time
- ✅ Scores calculate and display
- ✅ Socket stays connected throughout game

---

## 🔧 Additional Improvements

### Enhanced Logging
Added comprehensive logging for debugging:

**Client (`OnlineGame.tsx`):**
```typescript
console.log('[OnlineGame] Play Word clicked, selectedTiles:', selectedTiles.length)
console.log('[OnlineGame] Calling makeMove with tiles:', selectedTiles)
```

**Client (`onlineGameStore.ts`):**
```typescript
console.log('[OnlineStore] makeMove called, gameId:', gameId, 'tiles:', placedTiles.length)
console.log('[OnlineStore] Socket connected:', socketService.isConnected())
console.log('[OnlineStore] Emitting game:make-move event...')
console.log('[OnlineStore] Received response from server:', response)
```

**Server (`index.ts`):**
```typescript
console.log(`[game:make-move] Received move for game ${gameId}, ${placedTiles.length} tiles`)
console.log(`[game:make-move] Processing move for player ${playerId}`)
console.log(`[game:make-move] Move successful! Score: ${result.score}`)
console.log(`[game:make-move] Move rejected: ${result.error}`)
```

**Benefits:**
- Easier to debug future issues
- Clear visibility into game flow
- Can trace moves from client → server → broadcast

---

## 📝 Summary

**Bugs Found:** 3
**Bugs Fixed:** 3
**Status:** ✅ ALL RESOLVED

**Key Lessons Learned:**

1. **Always use functional state updates** when updates depend on previous state:
   ```typescript
   setSelectedTiles(prev => [...prev, tile])  // ✅ Good
   setSelectedTiles([...selectedTiles, tile])  // ❌ Bad - stale state
   ```

2. **Be careful with useEffect cleanup** in React components that unmount during navigation:
   ```typescript
   // ❌ Bad - breaks when component unmounts
   useEffect(() => {
     connect()
     return () => disconnect()
   }, [])

   // ✅ Good - disconnect at the right time
   useEffect(() => {
     connect()
   }, [])
   // Disconnect elsewhere when truly leaving
   ```

3. **Don't clear UI state before async operations complete**:
   ```typescript
   // ❌ Bad - optimistic UI without confirmation
   makeMove(tiles)
   clearTiles()  // What if move fails?

   // ✅ Good - wait for server
   makeMove(tiles)
   // Clear when server responds
   ```

4. **Add logging early** for complex async flows - makes debugging much faster!

---

## 🎯 Phase 1, Step 4 Status

**Overall Status:** ✅ COMPLETE

**Deliverables:**
- [x] Board component refactored for dual-mode
- [x] TileRack component refactored for dual-mode
- [x] Full integration in OnlineGame
- [x] All bugs found and fixed
- [x] Full gameplay tested and working
- [x] Documentation complete

**Ready for:** Phase 1, Step 5 - Deployment

---

**Date Completed:** January 5, 2026
**Next Step:** Deploy to production (Railway + Vercel)

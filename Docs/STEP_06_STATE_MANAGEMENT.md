# Step 6: State Management with Zustand ✅

**Completed:** January 2026

## Overview

In this step, we implemented centralized state management using Zustand to coordinate all game logic and provide a reactive UI.

The game store manages:
- Complete game state (board, players, scores, timer)
- Game actions (start, move, skip, exchange)
- Timer management (countdown with auto-end)
- Persistence (localStorage for save/load)

This is the "controller" layer that connects the game engine (Step 5) to the UI (Step 7).

---

## What Was Built

### **Game Store** (`src/store/gameStore.ts` - ~650 lines)

A comprehensive Zustand store that manages the entire game lifecycle.

**State Properties:**
```typescript
interface GameStoreState {
  // Current game state
  game: GameState | null

  // Game engine instances
  boardInstance: Board | null
  tileBagInstance: TileBag | null

  // UI state
  selectedTiles: PlacedTile[]
  lastValidation: MoveValidationResult | null
  timerIntervalId: number | null

  // Actions (16 total)
  startGame()
  makeMove()
  skipTurn()
  exchangeTiles()
  selectTile()
  unselectTile()
  clearSelection()
  endGame()
  startTimer()
  stopTimer()
  pauseGame()
  resumeGame()
  reset()
}
```

---

## Key Features Implemented

### 1. **Game Initialization**

```typescript
startGame(mode: GameMode, player1Name: string, player2Name: string)
```

**What it does:**
- Creates Board instance (17×17 grid)
- Creates TileBag instance (238 shuffled tiles)
- Draws 10 tiles for each player
- Initializes game state with default values
- Starts the timer automatically

**Example:**
```typescript
const startGame = useGameStore((state) => state.startGame)
startGame(GameMode.LOCAL_MULTIPLAYER, 'Dragan', 'Nikola')
```

---

### 2. **Move Making**

```typescript
makeMove(placedTiles: PlacedTile[]): boolean
```

**What it does:**
- Validates move using MoveValidator
- Places tiles on board if valid
- Places blocker tiles automatically
- Calculates score with ScoreCalculator
- Updates player score and stats
- Removes used tiles from hand
- Draws new tiles from bag
- Records move in history
- Switches to next player

**Returns:** `true` if move accepted, `false` if invalid

**Example:**
```typescript
const makeMove = useGameStore((state) => state.makeMove)
const success = makeMove([
  { tile: tileK, row: 8, col: 8 },
  { tile: tileU, row: 8, col: 9 },
  // ...
])
```

---

### 3. **Turn Skipping**

```typescript
skipTurn()
```

**What it does:**
- Records skip move in history
- Increments round counter
- Switches to next player
- No score penalty

**Example:**
```typescript
const skipTurn = useGameStore((state) => state.skipTurn)
skipTurn()
```

---

### 4. **Tile Exchange**

```typescript
exchangeTiles(tilesToExchange: Tile[]): boolean
```

**What it does:**
- Returns tiles to bag
- Shuffles bag
- Draws same number of new tiles
- Records exchange in history
- Switches to next player

**Returns:** `false` if bag is empty

**Example:**
```typescript
const exchangeTiles = useGameStore((state) => state.exchangeTiles)
const unwanted = [tile1, tile2, tile3]
exchangeTiles(unwanted)
```

---

### 5. **Timer Management**

The store includes a fully functional countdown timer that runs during gameplay.

**Timer System:**
- Ticks every 1 second (1000ms)
- Decrements current player's `timeRemaining`
- Automatically ends game when time expires
- Can be paused/resumed
- Persists across page refreshes

**Timer Actions:**
```typescript
startTimer()   // Start countdown
stopTimer()    // Stop countdown
pauseGame()    // Pause game and timer
resumeGame()   // Resume game and timer
```

**Implementation:**
```typescript
// Timer runs as setInterval
const intervalId = window.setInterval(() => {
  const currentPlayer = game.players[game.currentPlayerIndex]

  // Decrease by 1 second
  currentPlayer.timeRemaining = Math.max(
    0,
    currentPlayer.timeRemaining - 1000
  )

  // Auto-end if time expired
  if (currentPlayer.timeRemaining === 0) {
    stopTimer()
    endGame()
  }
}, 1000)
```

---

### 6. **Game Ending**

```typescript
endGame()
```

**What it does:**
- Stops timer
- Calculates final scores (subtracts unused tiles)
- Determines winner
- Updates game status to COMPLETED

**Final Scoring:**
```typescript
// Penalty for unused tiles:
// Regular tiles: -value
// Joker: -10 points

const calculator = new ScoreCalculator()
const finalScore = calculator.calculateFinalScore(
  player.score,
  player.tiles
)
```

---

### 7. **Tile Selection (for UI)**

```typescript
selectTile(tile: Tile, row: number, col: number)
unselectTile(row: number, col: number)
clearSelection()
```

These actions manage tiles being placed during the current turn (before submitting the move).

**Example:**
```typescript
// User drags tile to board
selectTile(tileA, 8, 8)
selectTile(tileB, 8, 9)

// User changes mind
unselectTile(8, 9)

// User cancels move
clearSelection()
```

---

### 8. **Persistence (localStorage)**

The store uses Zustand's `persist` middleware to save game state automatically.

**Configuration:**
```typescript
persist(
  (set, get) => ({ /* store implementation */ }),
  {
    name: 'kvizovka-game-storage',  // localStorage key
    partialize: (state) => ({
      // Only save game state, not instances
      game: state.game,
      selectedTiles: state.selectedTiles,
    }),
  }
)
```

**What gets saved:**
- Complete game state
- Selected tiles
- All move history

**What doesn't get saved:**
- Game engine instances (Board, TileBag)
- Timer interval ID
- Validation results

**Why partial persistence?**
- Can't serialize class instances
- Instances are recreated when needed
- Keeps localStorage small and fast

---

## Updated App Demo

Added interactive game store demo to `App.tsx`:

**Features:**
- "Start New Game" button
- Real-time game status display
- Current player info with timer
- Both players' scores and time
- Skip turn functionality
- End game button
- Winner announcement
- Persistence indicator

**Try it:**
1. Click "Start New Game"
2. Watch timer count down
3. Click "Skip Turn" to switch players
4. Refresh page → game state persists!
5. Click "End Game" to see final scores

---

## How State Flows

```
User Action (UI)
    ↓
Action Call (useGameStore)
    ↓
Game Engine (Board, TileBag, etc.)
    ↓
State Update (Zustand set)
    ↓
React Re-render (useGameStore subscribers)
    ↓
UI Updates
```

**Example Flow - Making a Move:**

1. **User places tiles on board** → `selectTile()` called
2. **User clicks "Play Word"** → `makeMove()` called
3. **Store validates move** → `MoveValidator.validateMove()`
4. **If valid, update board** → `Board.setTile()`
5. **Calculate score** → `ScoreCalculator.calculateMoveScore()`
6. **Update state** → `set({ game: updatedGame })`
7. **React re-renders** → UI shows new scores, timer, etc.
8. **Save to localStorage** → Automatic via persist middleware

---

## Key Concepts Learned

### 1. **Zustand Store Creation**

```typescript
export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      game: null,

      // Actions
      startGame: () => {
        set({ game: newGame })
      },
    }),
    { /* persist config */ }
  )
)
```

**Why `create<Type>()(...)` with double parentheses?**
- First `()` for TypeScript generics
- Second `()` to call the function
- Middleware pattern requires this syntax

### 2. **set() and get() Functions**

```typescript
(set, get) => ({
  makeMove: (tiles) => {
    const { game, boardInstance } = get()  // Get current state

    // ... do work ...

    set({ game: updatedGame })  // Update state
  }
})
```

- `get()` - Read current state
- `set()` - Update state (triggers re-render)

### 3. **Partial State Updates**

```typescript
// Only update what changed
set({ game: { ...game, score: newScore } })

// Zustand merges with existing state
```

### 4. **State Subscription**

```typescript
// Subscribe to specific slice
const game = useGameStore((state) => state.game)
const startGame = useGameStore((state) => state.startGame)

// Component re-renders ONLY when 'game' changes
```

### 5. **localStorage Persistence**

```typescript
// Zustand automatically:
// - Saves to localStorage on state change
// - Loads from localStorage on mount
// - Hydrates state seamlessly

// Access saved data:
localStorage.getItem('kvizovka-game-storage')
```

### 6. **Timer with setInterval**

```typescript
// Store interval ID in state
const intervalId = window.setInterval(callback, 1000)
set({ timerIntervalId: intervalId })

// Clean up later
clearInterval(timerIntervalId)
```

**Why store interval ID?**
- Need to stop timer later
- Can't access interval ID without storing it

### 7. **Boolean Return Values**

```typescript
makeMove(): boolean {
  if (!valid) {
    return false  // Tell UI move failed
  }
  // ... update state ...
  return true  // Tell UI move succeeded
}
```

Useful for UI feedback (show errors, disable buttons, etc.)

---

## Build Verification

✅ **Build Status:** SUCCESS

```bash
npm run build

# Output:
✓ 52 modules transformed
dist/index.html                   0.48 kB
dist/assets/index-Y4xHtR6l.css   21.86 kB
dist/assets/index-CvxlhW62.js   171.67 kB
✓ built in 1.15s
```

**Bundle size change:**
- Before Step 6: ~151KB
- After Step 6: ~172KB (+21KB)
- Increase due to: game store, game engine integration, zustand/middleware

**Still reasonable for a game!**

---

## Testing the Game Store

### Manual Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser** → http://localhost:5173

3. **Test game flow:**
   - Click "Start New Game"
   - See game status appear
   - Watch timer count down
   - Click "Skip Turn" → player switches
   - See scores update

4. **Test persistence:**
   - Start a game
   - Refresh page
   - Game state restored! ✨

5. **Test timer:**
   - Watch time decrease (every second)
   - Note: Auto-ends when time runs out

6. **Test end game:**
   - Click "End Game"
   - See winner announcement
   - See final scores (with unused tile penalties)

---

## Files Created/Modified

### New Files (1)
- `src/store/gameStore.ts` - Complete game store (~650 lines)

### Modified Files (1)
- `src/App.tsx` - Added game store demo

**Total new code:** ~800 lines

---

## Usage Examples

### Example 1: Start a Game
```typescript
import { useGameStore } from './store/gameStore'
import { GameMode } from './types'

function GameSetup() {
  const startGame = useGameStore((state) => state.startGame)

  return (
    <button onClick={() => {
      startGame(GameMode.LOCAL_MULTIPLAYER, 'Alice', 'Bob')
    }}>
      Start Game
    </button>
  )
}
```

### Example 2: Display Game State
```typescript
function GameStatus() {
  const game = useGameStore((state) => state.game)

  if (!game) return <div>No game in progress</div>

  const currentPlayer = game.players[game.currentPlayerIndex]

  return (
    <div>
      <p>Current Player: {currentPlayer.name}</p>
      <p>Score: {currentPlayer.score}</p>
      <p>Time: {formatTime(currentPlayer.timeRemaining)}</p>
    </div>
  )
}
```

### Example 3: Make a Move
```typescript
function PlayButton() {
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const makeMove = useGameStore((state) => state.makeMove)
  const lastValidation = useGameStore((state) => state.lastValidation)

  const handlePlay = () => {
    const success = makeMove(selectedTiles)

    if (!success) {
      alert(`Invalid move: ${lastValidation?.reason}`)
    }
  }

  return (
    <button onClick={handlePlay} disabled={selectedTiles.length === 0}>
      Play Word
    </button>
  )
}
```

### Example 4: Select Tiles (Drag & Drop prep)
```typescript
function TileRack() {
  const game = useGameStore((state) => state.game)
  const selectTile = useGameStore((state) => state.selectTile)

  if (!game) return null

  const currentPlayer = game.players[game.currentPlayerIndex]

  return (
    <div>
      {currentPlayer.tiles.map((tile) => (
        <div
          key={tile.id}
          draggable
          onDragStart={() => {
            // Store tile for drop later
            // Will use selectTile() when dropped on board
          }}
        >
          {tile.letter || '?'}
        </div>
      ))}
    </div>
  )
}
```

---

## What's Next?

**Step 7: UI Components**

Now that we have full state management, we can build the actual game UI:

- **Board Component** - 17×17 grid with drag-and-drop
- **Tile Component** - Draggable tiles with letter and value
- **TileRack Component** - Player's hand (10 tiles)
- **ScorePanel Component** - Scores, timer, statistics
- **GameControls Component** - Play Word, Skip, Exchange buttons
- **GameSetup Component** - Start game screen

All these components will use the game store we just built!

---

## Learning Resources

### Zustand
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

### React Patterns
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [State Management](https://react.dev/learn/managing-state)

### JavaScript Timers
- [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [clearInterval](https://developer.mozilla.org/en-US/docs/Web/API/clearInterval)

### localStorage
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Storage Limits](https://web.dev/storage-for-the-web/)

---

## Notes

### Why Zustand Over Redux?

**Zustand advantages:**
- ✅ Simple API (no reducers, actions, dispatch)
- ✅ Less boilerplate (~1/3 the code)
- ✅ Built-in persistence
- ✅ TypeScript-friendly
- ✅ No Provider needed
- ✅ Better performance (fine-grained subscriptions)

**When to use Redux:**
- Large teams needing strict patterns
- Complex middleware requirements
- DevTools debugging essential

**For Kvizovka:** Zustand is perfect! Simple, lightweight, beginner-friendly.

### State Management Patterns

**Single source of truth:** All game state in one store
**Immutable updates:** Never mutate, always create new objects
**Computed values:** Derive from state, don't store separately
**Actions as functions:** Clear intent, type-safe

### Performance Considerations

**Subscription optimization:**
```typescript
// ❌ Bad: Re-renders on any state change
const state = useGameStore()

// ✅ Good: Only re-renders when game changes
const game = useGameStore((state) => state.game)
```

**Persistence optimization:**
- Don't persist large objects (instances)
- Use `partialize` to save only what's needed
- localStorage has 5-10MB limit

---

**Step 6 Complete!** ✅

We now have a fully functional game store that manages the entire game lifecycle. The next step is to build beautiful, interactive UI components that bring the game to life!


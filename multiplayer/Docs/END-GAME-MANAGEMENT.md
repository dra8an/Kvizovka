# End Game Management & Tile Penalty System

## Overview

This document explains how the game ending is handled in Kvizovka multiplayer, including the tile penalty calculation and final score determination.

---

## Game End Conditions

The game ends when one of the following conditions is met:

### 1. **Rounds Completed** (Primary)
Both players have completed exactly 10 rounds each.

**Check location:** `packages/server/src/game-manager.ts` - `checkGameEnd()`
```typescript
if (player1.roundsPlayed >= 10 && player2.roundsPlayed >= 10) {
  this.endGame(game, 'rounds_completed')
}
```

### 2. **No Tiles Available**
The tile bag is empty AND the current player has no tiles left in their hand.

**Check location:** `packages/server/src/game-manager.ts` - `checkGameEnd()`
```typescript
if (game.tileBagInstance.isEmpty()) {
  const currentPlayer = game.players[game.currentPlayerIndex]
  if (currentPlayer.tiles.length === 0) {
    this.endGame(game, 'no_tiles')
  }
}
```

### 3. **Force End** (Testing Only)
For testing purposes, a force-end button allows immediately ending the game.

**Implementation:** `packages/server/src/index.ts` - `game:force-end` event handler

---

## Critical Fix: No Tile Drawing on Round 10

### Problem
Previously, tiles were drawn after **every** move, including move 10. This meant:
- Player completes move 10 with 3 tiles left
- System draws 7 more tiles to refill hand to 10
- Game ends
- Penalty shows 10 tiles instead of 3

### Solution
Check the round number **before** drawing tiles. If the player is making their 10th move (`roundsPlayed === 9`), skip drawing tiles.

**Implementation:**

#### In `makeMove()`:
```typescript
// Remove placed tiles from player's hand
const placedTileIds = new Set(placedTiles.map((pt) => pt.tile.id))
currentPlayer.tiles = currentPlayer.tiles.filter((t) => !placedTileIds.has(t.id))

// Draw new tiles (but not if this is the player's 10th round)
let drawnTileIds: string[] = []
if (currentPlayer.roundsPlayed < 9) {
  // Still have more rounds to play, draw tiles
  const tilesToDraw = Math.min(TILES_PER_PLAYER - currentPlayer.tiles.length, game.tileBagInstance.remaining())
  const newTiles = game.tileBagInstance.draw(tilesToDraw)
  drawnTileIds = newTiles.map((t) => t.id)
  currentPlayer.tiles.push(...newTiles)
}
// If roundsPlayed === 9, this is move 10, so don't draw tiles

// Increment rounds
currentPlayer.roundsPlayed++
```

#### In `exchangeTiles()`:
```typescript
// Return tiles to bag
game.tileBagInstance.returnTiles(tilesToExchange)

// Remove from player
currentPlayer.tiles = currentPlayer.tiles.filter((t) => !tileIds.includes(t.id))

// Draw new tiles (but not if this is the player's 10th round)
if (currentPlayer.roundsPlayed < 9) {
  const newTiles = game.tileBagInstance.draw(tilesToExchange.length)
  currentPlayer.tiles.push(...newTiles)
}

currentPlayer.roundsPlayed++
```

**Files modified:**
- `packages/server/src/game-manager.ts` (lines 287-296, 430-434)

---

## Tile Penalty Calculation

When the game ends, players are penalized for unused tiles remaining in their hand.

### Penalty Formula
```
Penalty = Sum of (tile values) + (10 points per joker)
```

### Calculation Logic

**Location:** `packages/server/src/game-manager.ts` - `endGame()`

```typescript
const calculateTilePenalty = (tiles: any[]): number => {
  return tiles.reduce((sum, tile) => {
    if (tile.isJoker) {
      return sum + 10  // Joker penalty is always 10 points
    }
    return sum + tile.value  // Regular tile: use its point value
  }, 0)
}

const player1Penalty = calculateTilePenalty(player1.tiles)
const player2Penalty = calculateTilePenalty(player2.tiles)

// Store penalties in player objects (survives sanitization)
player1.tilePenalty = player1Penalty
player2.tilePenalty = player2Penalty

// Apply penalties to scores
if (player1Penalty > 0) {
  player1.score -= player1Penalty
}

if (player2Penalty > 0) {
  player2.score -= player2Penalty
}
```

### Example
Player has these tiles left:
- R (1 point)
- D (2 points)
- V (1 point)
- Joker (10 points)
- S (1 point)

**Penalty:** 1 + 2 + 1 + 10 + 1 = **15 points**

---

## Winner Determination

The winner is determined **after** applying tile penalties.

**Location:** `packages/server/src/game-manager.ts` - `endGame()`

```typescript
// Determine winner AFTER penalties
if (player1.score > player2.score) {
  game.winner = player1.id
} else if (player2.score > player1.score) {
  game.winner = player2.id
}
// If scores are equal, game.winner remains undefined (tie)
```

---

## Penalty Persistence Issue & Solution

### Challenge: State Sanitization
For anti-cheat purposes, opponent tiles are **hidden** during gameplay:

```typescript
sanitizeGameState(gameState: ServerGameState, playerId: string): GameState {
  return {
    ...gameState,
    players: gameState.players.map((player) => {
      if (player.id === playerId) {
        return player  // Send full data for this player
      } else {
        return {
          ...player,
          tiles: [],  // Hide opponent's tiles during gameplay
        }
      }
    })
  }
}
```

**Problem:** Client can't calculate opponent's penalty because tiles are hidden.

### Solution: Store Penalty in Player Object

1. **Server calculates penalty** when game ends
2. **Stores in `player.tilePenalty`** field (added to Player interface)
3. **Field survives sanitization** because it's a direct property
4. **Client reads stored penalty** instead of calculating from tiles

**Type definition:** `packages/shared/src/types/game.types.ts`
```typescript
export interface Player {
  // ... existing fields

  /**
   * Tile penalty applied at end of game
   * Sum of unused tile values (jokers = 10 points)
   * Only set when game ends
   */
  tilePenalty?: number
}
```

---

## Showing Opponent Tiles on Game Completion

### Change: Conditional Sanitization

When the game ends, **both players should see each other's remaining tiles** for transparency.

**Modified:** `packages/server/src/game-manager.ts` - `sanitizeGameState()`

```typescript
sanitizeGameState(gameState: ServerGameState, playerId: string): GameState {
  const sanitized: GameState = {
    ...gameState,
    tileBag: [], // Never send tile bag to clients
    players: gameState.players.map((player) => {
      if (player.id === playerId) {
        // Send full data for this player
        return player
      } else {
        // For opponent: hide tiles during gameplay, but show them when game is completed
        if (gameState.status === GameStatus.COMPLETED) {
          // Game over - players can see each other's remaining tiles
          return player
        } else {
          // Game in progress - hide opponent's tiles
          return {
            ...player,
            tiles: [], // IMPORTANT: Don't send opponent's tiles during gameplay!
          }
        }
      }
    }) as [Player, Player],
  }

  return sanitized
}
```

**Rationale:** Once the game is over, there's no competitive advantage in seeing opponent's tiles. Showing them provides transparency for penalty calculation.

---

## Client Display

### Penalty Box UI

**Location:** `packages/client/src/components/OnlineGame/OnlineGame.tsx` (lines 155-225)

Each player's score card shows:
1. **Penalty amount** (e.g., "-13 points")
2. **Tile count** (e.g., "3 tiles left in hand")
3. **Visual tile display** - Small tile badges showing letter and value

```tsx
{yourTilePenalty > 0 && (
  <div className="text-red-600">
    <p>
      <span className="font-semibold">Unused tiles penalty:</span> -{yourTilePenalty} points
    </p>
    <p className="text-xs mt-1">
      ({yourTilesLeft} tile{yourTilesLeft !== 1 ? 's' : ''} left in hand)
    </p>
    {you.tiles.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {you.tiles.map((tile, idx) => (
          <span
            key={idx}
            className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 border border-amber-300 rounded text-xs font-bold"
            title={tile.isJoker ? `Joker (${tile.jokerLetter || '?'})` : tile.letter}
          >
            {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
            <sub className="text-[8px] ml-0.5">{tile.value}</sub>
          </span>
        ))}
      </div>
    )}
  </div>
)}
```

**Styling:**
- Amber background (`bg-amber-100`) to distinguish from active game tiles
- Shows letter and point value
- Jokers display as `*` or their assigned letter
- Tooltip shows full tile info

---

## Testing

### Force End Test Button

For rapid testing without playing full games:

**Location:** `packages/client/src/components/OnlineGameControls/OnlineGameControls.tsx`

```tsx
{onEndGameTest && (
  <button
    onClick={onEndGameTest}
    className="btn bg-orange-500 hover:bg-orange-600 text-white text-sm"
    title="For testing - ends game immediately"
  >
    🧪 End Game (Test)
  </button>
)}
```

**Server handler:** `packages/server/src/index.ts` - `game:force-end` event

**Note:** Force-ending mid-game will show 10 tiles for each player (if they just drew tiles). To test realistic penalties, play through all 10 rounds.

---

## Summary of Changes

### Files Modified

1. **`packages/shared/src/types/game.types.ts`**
   - Added `tilePenalty?: number` to Player interface

2. **`packages/server/src/game-manager.ts`**
   - Fixed `makeMove()` to not draw tiles on round 10 (line 289)
   - Fixed `exchangeTiles()` to not draw tiles on round 10 (line 431)
   - Updated `endGame()` to calculate and store tile penalties (lines 594-640)
   - Updated `sanitizeGameState()` to show opponent tiles when game is completed (line 194)

3. **`packages/server/src/index.ts`**
   - Added `GameStatus` import for force-end test handler (line 23)
   - Added `game:force-end` event handler for testing (lines 443-512)

4. **`packages/client/src/components/OnlineGame/OnlineGame.tsx`**
   - Enhanced completion screen with tile penalty display (lines 155-225)
   - Added visual tile badges in penalty boxes

5. **`packages/client/src/components/OnlineGameControls/OnlineGameControls.tsx`**
   - Added test button for force-ending games (lines 122-130)

6. **`packages/client/src/store/onlineGameStore.ts`**
   - Added `forceEndGame()` function for testing (lines 397-411)

---

## Key Takeaways

1. ✅ **No tile drawing on round 10** ensures penalties reflect actual remaining tiles
2. ✅ **Penalty calculation** uses tile values + 10 per joker
3. ✅ **Penalties applied before determining winner** ensures fair final scores
4. ✅ **Penalty stored in Player object** survives state sanitization
5. ✅ **Opponent tiles shown on completion** provides transparency
6. ✅ **Visual tile display** makes penalties clear and verifiable

---

**Last updated:** January 7, 2026

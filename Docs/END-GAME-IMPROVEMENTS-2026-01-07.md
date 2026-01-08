# End Game Improvements - January 7, 2026

## Overview

This document describes the enhancements made to the game completion screen and end-game mechanics for the local multiplayer version of Kvizovka. These improvements bring the local game experience in line with the online multiplayer version, providing players with a comprehensive game summary.

---

## Summary of Changes

### 1. Enhanced Game Completion Screen

**Before:**
- Simple centered card with final scores
- Generic "(Unused tiles penalty applied)" text
- No breakdown of what tiles were left
- No move history visible
- Small single-column layout

**After:**
- Full-width 2-column layout
- Complete scoresheets for both players
- Visual display of remaining tiles
- Detailed penalty breakdown
- Professional game summary presentation

---

## Features

### Full Scoresheets

Each player's complete game history is now displayed:

- **10 rounds visible**: All moves from round 1 to 10
- **Words played**: Shows the exact word formed in each round
- **Points per move**: Individual scores for each round
- **Running total**: Cumulative score progression
- **Move types**: Distinguishes between word plays, skips, and exchanges

**Component Used:** `Scoresheet` component with full move history

### Visual Tile Penalties

Remaining tiles are now shown with visual badges:

- **Letter display**: Shows each tile's letter (or * for jokers)
- **Point values**: Subscript numbers showing tile values
- **Amber styling**: Distinct amber background (`bg-amber-100`) to differentiate from active tiles
- **Hover tooltips**: Full tile information on hover
- **Flexible layout**: Tiles wrap gracefully in a grid

**Example Display:**
```
Unused tiles penalty: -13 points
(3 tiles left in hand)
[*₀] [A₁] [Z₂]
```

### Detailed Penalty Breakdown

Clear explanation of how penalties are calculated:

- **Penalty amount**: Exact points deducted (e.g., "-13 points")
- **Tile count**: Number of tiles left in hand (e.g., "3 tiles left")
- **Formula shown**: Tile values + 10 per joker
- **Visual confirmation**: Players can see and verify their remaining tiles

### Improved Layout

**Grid Structure:**
```
┌────────────────────────────────────────────────────┐
│              Game Complete Header                   │
│           🏆 Winner Announcement                    │
└────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┐
│   Player 1 Card     │   Player 2 Card     │
│   - Score           │   - Score           │
│   - Penalty         │   - Penalty         │
│   - Tiles           │   - Tiles           │
├─────────────────────┼─────────────────────┤
│  Player 1 Scoresheet│  Player 2 Scoresheet│
│  - All 10 rounds    │  - All 10 rounds    │
│  - Words & scores   │  - Words & scores   │
└─────────────────────┴─────────────────────┘

┌────────────────────────────────────────────────────┐
│              Game Statistics                        │
│        Total Moves | Rounds Completed               │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              Play Again Button                      │
└────────────────────────────────────────────────────┘
```

**Benefits:**
- Side-by-side comparison of both players
- Easy to review game progression
- Complete transparency of scoring
- Professional presentation

---

## Technical Implementation

### Files Modified

#### 1. `src/types/game.types.ts`
Added `tilePenalty` field to Player interface:

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

#### 2. `src/store/gameStore.ts`

**Changes to `makeMove` action:**
- Check `roundsPlayed < 9` before drawing tiles
- Increment `roundsPlayed` AFTER tile drawing
- Initialize `newTiles` array to prevent undefined errors

```typescript
// Draw new tiles (but not if this is the player's 10th round)
let newTiles: any[] = []
if (currentPlayer.roundsPlayed < 9) {
  newTiles = state.tileBagInstance!.draw(placedTiles.length)
  currentPlayer.tiles.push(...newTiles)
}

// Increment rounds AFTER tile drawing
currentPlayer.roundsPlayed++
```

**Changes to `exchangeTiles` action:**
- Check `roundsPlayed < 9` before drawing replacement tiles

**Changes to `endGame` action:**
- Calculate penalty for each player's remaining tiles
- Store penalty in `player.tilePenalty` field
- Apply penalty to final scores

```typescript
for (const player of game.players) {
  // Calculate penalty
  let penalty = 0
  for (const tile of player.tiles) {
    if (tile.isJoker) {
      penalty += 10 // Joker penalty
    } else {
      penalty += tile.value
    }
  }

  // Store penalty for UI display
  player.tilePenalty = penalty

  // Apply penalty to score
  const finalScore = calculator.calculateFinalScore(
    player.score,
    player.tiles
  )
  player.score = finalScore
}
```

#### 3. `src/components/Game/Game.tsx`

**Complete redesign of completion screen:**
- Changed from centered single card to full-width 2-column layout
- Added `Scoresheet` component imports and rendering
- Enhanced score cards with penalty details and tile display
- Improved visual hierarchy with proper spacing and sizing

**Key Changes:**
```typescript
// Layout: max-w-6xl container with 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Left: Player 1 Score Card + Scoresheet */}
  {/* Right: Player 2 Score Card + Scoresheet */}
</div>
```

**Score Card Structure:**
```typescript
<div className="p-6 rounded-lg bg-white shadow-md">
  <p className="font-bold text-xl">{player.name}</p>
  <p className="text-4xl font-bold">{player.score}</p>

  {/* Penalty Section */}
  {player.tilePenalty > 0 && (
    <div className="text-red-600">
      <p>Unused tiles penalty: -{player.tilePenalty} points</p>
      <p>({player.tiles.length} tiles left)</p>

      {/* Visual Tile Display */}
      <div className="flex flex-wrap gap-1">
        {player.tiles.map((tile, idx) => (
          <span className="w-8 h-8 bg-amber-100 border">
            {tile.letter}<sub>{tile.value}</sub>
          </span>
        ))}
      </div>
    </div>
  )}
</div>
```

---

## Bug Fixes

### 1. Tile Drawing on Round 10

**Problem:**
When a player completed their 10th move, the game would:
1. Place tiles on board
2. Remove placed tiles from hand
3. Draw new tiles to refill hand to 10 ← **This was wrong!**
4. Increment rounds to 10
5. End game

This caused players to always have 10 tiles at game end, regardless of how many they actually played.

**Root Cause:**
- In `makeMove`, `roundsPlayed++` happened BEFORE tile drawing check
- Check was `if (roundsPlayed < 10)` which would be true for round 10
- This allowed drawing tiles after the final move

**Solution:**
- Move tile drawing BEFORE incrementing rounds
- Check `if (roundsPlayed < 9)` to prevent drawing on round 10
- Increment `roundsPlayed++` AFTER the drawing check

**Impact:**
- Players now correctly have 3-7 tiles remaining at game end
- Tile penalties accurately reflect actual remaining tiles
- More strategic gameplay (conserving tiles matters!)

### 2. Undefined Variable Error

**Problem:**
After preventing tile drawing on round 10, `newTiles` variable was undefined, causing:
- "Square occupied" errors
- Move record corruption
- Game state issues

**Solution:**
Initialize `newTiles` as empty array outside conditional:

```typescript
let newTiles: any[] = []  // Always defined
if (currentPlayer.roundsPlayed < 9) {
  newTiles = state.tileBagInstance!.draw(placedTiles.length)
  currentPlayer.tiles.push(...newTiles)
}
```

### 3. Tile Penalty Tracking

**Problem:**
Penalty was calculated at game end using `ScoreCalculator.calculateFinalScore()`, but not stored anywhere. The UI couldn't show the exact penalty amount.

**Solution:**
- Added `tilePenalty` field to Player type
- Store calculated penalty in player object
- Display in UI from stored value
- Ensures consistency between calculation and display

---

## Penalty Calculation Formula

```typescript
function calculateTilePenalty(tiles: Tile[]): number {
  return tiles.reduce((sum, tile) => {
    if (tile.isJoker) {
      return sum + 10  // Joker always worth 10 penalty points
    }
    return sum + tile.value  // Regular tile uses its point value
  }, 0)
}
```

**Examples:**

| Tiles Left | Penalty Calculation | Total |
|------------|---------------------|-------|
| R(1), A(1), Z(2) | 1 + 1 + 2 | -4 points |
| *(10), Š(4), U(2) | 10 + 4 + 2 | -16 points |
| N(1), A(1), I(1), R(1) | 1 + 1 + 1 + 1 | -4 points |

---

## User Experience Improvements

### Before
- Players couldn't see what tiles caused the penalty
- No move history visible at game end
- Had to mentally calculate if penalty was correct
- Simple, uninformative completion screen

### After
- **Full Transparency**: See every tile left in hand
- **Complete History**: Review all 10 rounds and words played
- **Verify Calculations**: Penalties shown with exact breakdown
- **Professional Presentation**: Polished, comprehensive summary
- **Better Closure**: Satisfying end-game experience with full statistics

---

## Testing Scenarios

### Scenario 1: Normal Game Completion
1. Play 10 rounds with both players
2. Each player plays different number of tiles on final move
3. Verify final tile counts are accurate (not 10 for both)
4. Check penalty matches visible tiles
5. Confirm scoresheets show all 10 moves

**Expected Result:**
- Player 1: 3 tiles left → Penalty = sum of those 3 tiles
- Player 2: 5 tiles left → Penalty = sum of those 5 tiles
- Scoresheets display complete game history
- Winner determined after penalties applied

### Scenario 2: Joker Penalty
1. Player finishes with joker in hand
2. Game ends
3. Verify joker shows as `*₀` in tile display
4. Confirm penalty includes +10 for joker

**Expected Result:**
- Joker displayed with asterisk
- Penalty calculation: other tiles + 10 (joker)
- Total penalty correctly applied to final score

### Scenario 3: No Tiles Left
1. Player uses all tiles on final move
2. Game ends
3. Verify no penalty section shown

**Expected Result:**
- No penalty text displayed
- Score unchanged
- Clean completion screen

---

## Compatibility

### Local Game ✅
- Fully implemented
- All features working
- Enhanced completion screen

### Online Multiplayer ✅
- Already had full scoresheet implementation
- Local game now matches online experience
- Consistent UI/UX across both modes

---

## Future Enhancements

Potential improvements for future versions:

1. **Downloadable Game Report**: Export game summary as PDF or image
2. **Replay Mode**: Step through the game move-by-move
3. **Statistics Dashboard**: Track player performance over multiple games
4. **Alternate Views**: Toggle between scoresheet and board view
5. **Share Feature**: Share game results on social media

---

## References

### Related Files
- `src/components/Game/Game.tsx` - Main game screen with completion view
- `src/components/Scoresheet/Scoresheet.tsx` - Scoresheet component
- `src/store/gameStore.ts` - Game state management
- `src/types/game.types.ts` - Type definitions
- `src/game-engine/ScoreCalculator.ts` - Penalty calculation logic

### Related Documentation
- [Game Rules](./GAME_RULES.md) - Official scoring and penalty rules
- [Online Multiplayer End Game](../multiplayer/Docs/END-GAME-MANAGEMENT.md) - Server-side implementation

---

**Last Updated:** January 7, 2026

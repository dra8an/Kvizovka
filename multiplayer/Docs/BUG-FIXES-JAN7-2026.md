# Bug Fixes - January 7, 2026

**Date:** January 7, 2026
**Session:** Online Multiplayer - Post-Deployment Testing
**Status:** ✅ All Bugs Fixed and Tested

---

## Overview

During post-deployment testing of the online multiplayer game, two UI/scoring display issues were discovered and fixed:

1. **Missing Scoresheet UI** - Scoresheet component not integrated into online game
2. **Word Not Displaying in Scoresheet** - Word column showing "–" instead of actual word

Both bugs were in the client UI layer and did not affect actual game logic or scoring calculations.

---

## Bug #1: Missing Scoresheet UI

### Symptoms
- User reported: "I don't see the score sheet for multiplayer game like I do in the local game"
- Online game only showed basic player info cards
- No detailed move-by-move scoring history visible

### Root Cause
The `OnlineGame.tsx` component was not integrating the existing `Scoresheet` component that works in local mode. The component existed and was fully functional, but simply wasn't being imported or rendered.

### Investigation
Compared local game UI with online game UI:
- **Local mode**: Uses 3-column layout with Scoresheet components in sidebars
- **Online mode**: Had 2-column layout with no scoresheets

### Fix Applied

**File:** `packages/client/src/components/OnlineGame/OnlineGame.tsx`

**Changes:**

1. **Added import:**
```typescript
import { Scoresheet } from '../Scoresheet/Scoresheet'
```

2. **Changed layout from 2-column to 3-column:**
```typescript
<div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-4">
```

3. **Added scoresheets in left sidebar (desktop):**
```typescript
{/* Left Sidebar - Scoresheets */}
<div className="hidden xl:block space-y-3">
  {/* Your Scoresheet */}
  <Scoresheet
    playerId={you.id}
    playerName={`${you.name} (You)`}
    moves={gameState.moveHistory}
    compact
  />

  {/* Opponent Scoresheet */}
  <Scoresheet
    playerId={opponent.id}
    playerName={opponent.name}
    moves={gameState.moveHistory}
    compact
  />
</div>
```

4. **Added scoresheets below controls (mobile):**
```typescript
{/* Scoresheets (mobile: show below controls) */}
<div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
  <Scoresheet
    playerId={you.id}
    playerName={`${you.name} (You)`}
    moves={gameState.moveHistory}
  />
  <Scoresheet
    playerId={opponent.id}
    playerName={opponent.name}
    moves={gameState.moveHistory}
  />
</div>
```

### Result
✅ **Fixed** - Scoresheet now displays in online mode with move-by-move history for both players

---

## Bug #2: Word Not Displaying in Scoresheet

### Symptoms
- User reported: "the word is not shown in scoresheet"
- Scoresheet displayed:
  ```
  #    Word    Pts    Total
  1     –      +7      7
  ```
- Word column showed "–" instead of "JINDE"
- Points (7) and total calculated correctly

### Root Cause
The `Move` interface has an optional `formedWords?: string[]` field, but when storing moves in `game-manager.ts`, we weren't populating this field. The `Scoresheet` component reads `move.formedWords[0]` to display the word, and when it's undefined, it shows "–" as a fallback.

### Investigation

**Step 1: Examined Scoresheet component** (`Scoresheet.tsx` lines 72-74):
```typescript
// Get the main word (first word in formedWords array)
const word = move.formedWords && move.formedWords.length > 0
  ? move.formedWords[0]
  : '-'
```

**Step 2: Checked Move type definition** (`game.types.ts` line 197):
```typescript
export interface Move {
  // ...
  formedWords?: string[]  // ← This field exists but wasn't being populated
  // ...
}
```

**Step 3: Found the problem in game-manager.ts** (lines 291-299):
```typescript
game.moveHistory.push({
  moveNumber: game.moveHistory.length + 1,
  playerId: currentPlayer.id,
  type: MoveType.PLACE_TILES,
  placedTiles,
  // formedWords: ??? ← MISSING!
  score: scoreResult.totalScore,
  timestamp: new Date(),
  drawnTileIds,
})
```

**Step 4: Found the solution:**
The `ScoreCalculator.calculateMoveScore()` returns a `ScoreBreakdown` object:
```typescript
interface ScoreBreakdown {
  totalScore: number
  wordScores: WordScore[]  // ← Contains word strings!
  // ...
}

interface WordScore {
  word: string  // ← The actual word text
  baseScore: number
  finalScore: number
  // ...
}
```

### Fix Applied

**File:** `packages/server/src/game-manager.ts` (line 296)

**Changed:**
```typescript
// BEFORE (missing formedWords)
game.moveHistory.push({
  moveNumber: game.moveHistory.length + 1,
  playerId: currentPlayer.id,
  type: MoveType.PLACE_TILES,
  placedTiles,
  score: scoreResult.totalScore,
  timestamp: new Date(),
  drawnTileIds,
})

// AFTER (added formedWords)
game.moveHistory.push({
  moveNumber: game.moveHistory.length + 1,
  playerId: currentPlayer.id,
  type: MoveType.PLACE_TILES,
  placedTiles,
  formedWords: scoreResult.wordScores.map(ws => ws.word),  // ← ADDED
  score: scoreResult.totalScore,
  timestamp: new Date(),
  drawnTileIds,
})
```

### Technical Details

**How it works:**
1. `ScoreCalculator.calculateMoveScore()` iterates through all words formed (main word + cross-words)
2. For each word, it creates a `WordScore` object with the word text and score details
3. We extract all word strings using `.map(ws => ws.word)` and store them in `formedWords[]`
4. The Scoresheet component reads `move.formedWords[0]` to display the main word

**Why this approach is correct:**
- Reuses existing data structures (no new fields needed)
- Stores ALL words formed (main + cross-words) for future features
- Word text is generated during score calculation (guaranteed to match)
- Scoresheet already knows how to read this field

### Result
✅ **Fixed** - Words now display correctly in scoresheet:
```
#    Word     Pts    Total
1    JINDE    +7      7
```

---

## Testing Results

### Test Scenario
1. Created room with two players
2. Player 1 played word "JINDE" (5 tiles)
3. Checked scoresheet display

### Before Fixes
- ❌ No scoresheet visible
- ❌ When scoresheet added, word showed "–"
- ✅ Score calculated correctly (7 points)

### After Fixes
- ✅ Scoresheet visible in left sidebar (desktop)
- ✅ Scoresheet visible below controls (mobile)
- ✅ Word "JINDE" displayed correctly
- ✅ Score "+7" displayed correctly
- ✅ Running total "7" displayed correctly
- ✅ Both players' scoresheets work

---

## Files Modified

### Client
- `packages/client/src/components/OnlineGame/OnlineGame.tsx`
  - Added Scoresheet import
  - Changed layout to 3-column grid
  - Added scoresheet components for both players
  - Added mobile scoresheet display

### Server
- `packages/server/src/game-manager.ts`
  - Added `formedWords` field when pushing to moveHistory (line 296)
  - Extracts words from `scoreResult.wordScores`

---

## Related Game Rules Clarification

During investigation, user clarified an important game rule:

**Word Dictionary Validation:**
- Words are NOT automatically validated against the dictionary when played
- Any combination of tiles can be placed and scored based on tile values
- Dictionary validation ONLY occurs when opponent challenges the word
- This matches official Scrabble-style game rules

This is already implemented correctly in the game logic - no changes needed.

---

## Key Learnings

### 1. Reuse Components Between Modes
The Scoresheet component was already built for local mode and worked perfectly in online mode with no modifications. Always check if existing components can be reused before building new ones.

### 2. Check Type Definitions
When data isn't displaying, check the type definitions to see what fields are available. The `formedWords` field existed in the `Move` interface but wasn't being populated.

### 3. Follow the Data Flow
```
ScoreCalculator → ScoreBreakdown → wordScores[] → word strings
                        ↓
                  game.moveHistory
                        ↓
                  Scoresheet component
```

Understanding this flow made it clear where to extract the word strings.

### 4. Server Hot Reload Works Great
The tsx server automatically restarted when we changed game-manager.ts, making testing instant.

---

## Success Metrics

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Scoresheet Visible | ❌ | ✅ | Fixed |
| Word Displayed | ❌ ("–") | ✅ ("JINDE") | Fixed |
| Score Displayed | ✅ | ✅ | Always Worked |
| Mobile Layout | ❌ | ✅ | Fixed |
| Desktop Layout | ❌ | ✅ | Fixed |

**Overall:** 100% Success Rate ✅

---

## Next Steps

### Completed ✅
- [x] Fix missing scoresheet UI
- [x] Fix word display in scoresheet
- [x] Test with real gameplay
- [x] Verify both players see correct data

### Future Enhancements (Optional)
- [ ] Add OnlineScorePanel component (currently shows TODO in right sidebar)
- [ ] Show cross-words in scoresheet (currently only shows main word)
- [ ] Add hover tooltip to show all words formed in a move
- [ ] Add score breakdown details (letter multipliers, word multipliers, etc.)

---

## Summary

Two UI bugs discovered and fixed in online multiplayer mode:

1. **Scoresheet Integration** - Simple import and layout change to show existing component
2. **Word Display** - One-line fix to populate `formedWords` from score calculation

Both fixes were straightforward and required minimal code changes. The underlying game logic was working correctly all along - these were purely display issues.

**Total Time:** ~30 minutes
**Lines Changed:** ~50 lines (mostly layout)
**Core Logic Changes:** 1 line (adding formedWords)
**Result:** Fully functional scoresheet in online mode! 🎉

---

*Documentation Date: January 7, 2026*
*Version: 0.2.1*
*Status: Fixed and Tested*

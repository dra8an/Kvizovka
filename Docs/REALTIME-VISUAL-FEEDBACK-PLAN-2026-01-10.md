# Real-Time Visual Feedback for Word Placement

## Status: PLANNED - Ready for Implementation (2026-01-11)

**Complexity:** Medium (3 hours estimated)
**Priority:** High - Significant UX improvement
**Approved by user:** 2026-01-10

---

## Goal
Add real-time visual feedback on the board as players place tiles to show:
1. **Valid word indication** - Highlight tiles forming a valid word (green background)
   - Valid = placement rules correct + word length ≥4 letters
   - NO dictionary validation in real-time (only on submit)
2. **Direction indication** - Highlight entire row/column when 2+ tiles placed
3. **Invalid move indication** - Gray out tiles when:
   - Tiles not in a straight line (scattered/diagonal)
   - Tiles not contiguous (gaps between them)
   - First move doesn't cover center square (H8)
   - Tiles don't connect to existing words (after first move)

---

## Current State Analysis

### How Tile Placement Works Today

**State Management (gameStore.ts):**
- `selectedTiles: PlacedTile[]` - Tracks tiles placed on board (not yet committed)
- `lastValidation: MoveValidationResult | null` - Stores validation result AFTER user clicks "Play Word"
- Validation only runs when user submits move

**Board Rendering (Board.tsx → Square.tsx):**
- Overlays `selectedTiles` on top of existing board state
- Square component receives tile data and renders it
- No visual differentiation between valid/invalid placements

**Validation Logic (MoveValidator.ts):**
- `validateMove(placedTiles)` - Returns `MoveValidationResult` with:
  - `isValid: boolean`
  - `reason?: string` (error message)
  - `wordsFormed?: BoardSquare[][]` (all words created)
  - `direction?: Direction` (HORIZONTAL | VERTICAL)
  - `wordText?: string` (main word)

**Gap:** Validation only runs on submit, not in real-time as tiles are placed.

---

## Implementation Approach

### 1. Add Real-Time Validation State

**Add to gameStore.ts:**

```typescript
// New computed state - runs validation whenever selectedTiles changes
placementValidation: MoveValidationResult | null

// Helper to run validation without side effects
validateCurrentPlacement: () => MoveValidationResult | null
```

**Implementation:**
- Use Zustand's `subscribe()` or computed state pattern
- Run `MoveValidator.validateMove(selectedTiles)` whenever selectedTiles changes
- Store result in `placementValidation` state
- This gives us real-time feedback without waiting for submit

---

### 2. Define Visual States for Tiles

Create an enum/type for tile appearance states:

```typescript
enum TilePlacementState {
  VALID_WORD = 'valid-word',          // Green - forms valid word
  VALID_PLACEMENT = 'valid-placement', // Amber - correct placement, word incomplete
  INVALID = 'invalid',                 // Gray - violates placement rules
  NEUTRAL = 'neutral'                  // Default - no placed tiles
}
```

**State Determination Logic:**

| Condition | State | Visual |
|-----------|-------|--------|
| `placementValidation.isValid === true` | VALID_WORD | Green background |
| `selectedTiles.length > 0` AND placement rules OK (same line, contiguous) | VALID_PLACEMENT | Amber background |
| `selectedTiles.length > 0` AND placement rules violated | INVALID | Gray background (60% opacity) |
| `selectedTiles.length === 0` | NEUTRAL | Default appearance |

---

### 3. Pass Visual State to Board Components

**Update Board.tsx:**

```typescript
// Get placement validation from store
const placementValidation = useGameStore(state => state.placementValidation)

// Determine tile state for each selected tile
const getTileState = (row: number, col: number): TilePlacementState => {
  const selectedTile = selectedTiles.find(st => st.row === row && st.col === col)
  if (!selectedTile) return TilePlacementState.NEUTRAL

  if (!placementValidation) {
    // No validation yet - show neutral
    return TilePlacementState.NEUTRAL
  }

  if (placementValidation.isValid) {
    // Check if this tile is part of the main word formed
    return TilePlacementState.VALID_WORD
  } else {
    // Placement violates rules
    return TilePlacementState.INVALID
  }
}

// Pass state to Square component
<Square
  square={displaySquare}
  placementState={getTileState(row, col)}
  // ... other props
/>
```

---

### 4. Update Square Component Visual Rendering

**Modify Square.tsx:**

Add prop:
```typescript
interface SquareProps {
  // ... existing props
  placementState?: TilePlacementState
}
```

**Visual Styling (Tailwind classes):**

```typescript
const getTileBackgroundClass = () => {
  if (!tile) return ''  // No tile

  // If this is a selected tile (not committed yet)
  if (placementState) {
    switch (placementState) {
      case TilePlacementState.VALID_WORD:
        return 'bg-green-100 border-green-500 border-2'  // Green highlight

      case TilePlacementState.VALID_PLACEMENT:
        return 'bg-amber-100 border-amber-500 border-2'  // Amber highlight

      case TilePlacementState.INVALID:
        return 'bg-gray-400 opacity-60'  // Grayed out

      default:
        return 'bg-tile-bg'  // Default tile color
    }
  }

  // Existing committed tile
  return 'bg-tile-bg'
}
```

---

### 5. Add Direction Indicator

**When to Show:**
- `selectedTiles.length >= 2`
- `placementValidation.direction !== undefined`

**Visual Approach: Highlight Entire Row/Column**
- Add subtle background color to the entire row or column where tiles are being placed
- Visual: Light blue/cyan background stripe (`bg-blue-50` or `bg-cyan-50`)
- Opacity: ~20-30% to avoid obscuring board elements
- Shows very clearly which direction the word is going

**Implementation:**

Add to Board.tsx:
```typescript
// Determine which row/column to highlight
const getHighlightedLine = () => {
  if (selectedTiles.length < 2 || !placementValidation?.direction) return null

  const firstTile = selectedTiles[0]

  return {
    type: placementValidation.direction === Direction.HORIZONTAL ? 'row' : 'col',
    index: placementValidation.direction === Direction.HORIZONTAL
      ? firstTile.row
      : firstTile.col
  }
}

// In Square rendering, add class if part of highlighted line
const isInHighlightedLine = (row: number, col: number): boolean => {
  const highlight = getHighlightedLine()
  if (!highlight) return false

  return highlight.type === 'row'
    ? highlight.index === row
    : highlight.index === col
}

// Apply background class in Square
className={`
  ${isInHighlightedLine(row, col) ? 'bg-cyan-50' : ''}
  // ... other classes
`}
```

---

### 6. Handle Edge Cases

**Partial Word Placement:**
- User places 2 tiles of a 5-letter word
- Validation: Check if tiles are contiguous and in valid line
- Visual: VALID_PLACEMENT (amber) - not VALID_WORD yet

**First Move (Center Square):**
- Validation: Must cover center square (H8)
- If doesn't cover center: INVALID (gray)

**Connection to Existing Tiles:**
- Validation: Must connect to existing word OR be first move
- If isolated: INVALID (gray)

**Minimum Word Length:**
- Game rule: Minimum 4 letters
- If <4 letters: VALID_PLACEMENT (amber) until word is complete
- Once ≥4 letters AND valid: VALID_WORD (green)

**Joker Tiles:**
- When joker is placed, immediately show letter selection dialog
- Once letter assigned, validate normally
- Visual: Show joker's assigned letter in word preview

---

## Implementation Plan

### Step 1: Add Validation State to gameStore (30 min)

**File:** `src/store/gameStore.ts`

Add state:
```typescript
placementValidation: MoveValidationResult | null
```

Add action:
```typescript
validateCurrentPlacement: () => {
  const { selectedTiles, game, isFirstMove } = get()
  if (selectedTiles.length === 0) {
    set({ placementValidation: null })
    return null
  }

  const validator = new MoveValidator(game.board, selectedTiles, isFirstMove)
  const result = validator.validateMove(selectedTiles)

  set({ placementValidation: result })
  return result
}
```

Call after every `selectTile()` / `unselectTile()`:
```typescript
selectTile: (tile, row, col) => {
  // ... existing logic
  get().validateCurrentPlacement()  // Add this
}
```

---

### Step 2: Create TilePlacementState Enum (15 min)

**File:** `src/types/board.types.ts`

```typescript
export enum TilePlacementState {
  NEUTRAL = 'neutral',
  VALID_PLACEMENT = 'valid-placement',
  VALID_WORD = 'valid-word',
  INVALID = 'invalid'
}
```

---

### Step 3: Update Board Component Logic (45 min)

**File:** `src/components/Board/Board.tsx`

1. Subscribe to `placementValidation` state
2. Create `getTileState()` function (see Section 3 above)
3. Pass `placementState` prop to each `<Square>`
4. Add direction indicator rendering (see Section 5)

---

### Step 4: Update Square Component Rendering (30 min)

**File:** `src/components/Board/Square.tsx`

1. Add `placementState?: TilePlacementState` to props
2. Update tile background class logic (see Section 4)
3. Add transition animations for smooth visual changes

---

### Step 5: Handle Validation Edge Cases (30 min)

Update validation logic to distinguish between:
- **Invalid placement** (wrong position, not contiguous)
- **Incomplete word** (correct placement, but <4 letters)
- **Valid word** (correct placement, ≥4 letters, forms valid words)

May need to extend `MoveValidationResult` interface:
```typescript
interface MoveValidationResult {
  isValid: boolean
  isValidPlacement?: boolean  // NEW: placement is OK, word may be incomplete
  reason?: string
  wordsFormed?: BoardSquare[][]
  direction?: Direction
  wordText?: string
}
```

---

### Step 6: Test & Polish (30 min)

**Test Cases:**
1. Place 1 tile → should show neutral or pending state
2. Place 2 tiles in line → should show direction indicator + valid placement
3. Place 2 tiles not in line → should show invalid (gray)
4. Complete valid 4+ letter word → should show valid word (green)
5. Place tiles not touching existing → should show invalid (gray)
6. First move not covering center → should show invalid (gray)

---

## Visual Design Summary

| State | Background | Border | Indicator |
|-------|------------|--------|-----------|
| NEUTRAL | Tile default (amber) | Default | None |
| VALID_PLACEMENT | Light amber (`bg-amber-100`) | Amber border (`border-amber-500`) | Direction arrow/line |
| VALID_WORD | Light green (`bg-green-100`) | Green border (`border-green-500`) | Direction arrow/line |
| INVALID | Gray (`bg-gray-400`) | None | ❌ or Red indicator |

**Direction Indicator:**
- Highlight entire row (horizontal placement) or column (vertical placement)
- Subtle cyan/blue background (`bg-cyan-50`) with low opacity
- Very clear visual indication of placement direction

---

## Files to Modify

### Primary Changes (Required)
1. **src/store/gameStore.ts**
   - Add `placementValidation` state
   - Add `validateCurrentPlacement()` action
   - Call validation after selectTile/unselectTile

2. **src/components/Board/Board.tsx**
   - Subscribe to `placementValidation`
   - Create `getTileState()` helper
   - Pass `placementState` to Square components
   - Add direction indicator rendering

3. **src/components/Board/Square.tsx**
   - Add `placementState` prop
   - Update tile background styling based on state
   - Add visual transitions

4. **src/types/board.types.ts**
   - Add `TilePlacementState` enum
   - Optionally extend `MoveValidationResult` interface

### Secondary Changes (Optional Enhancements)
5. **src/game-engine/MoveValidator.ts**
   - Optionally add `isValidPlacement` flag to distinguish incomplete vs invalid moves

---

## Success Criteria

- [ ] Tiles turn green when forming a valid word (≥4 letters)
- [ ] Tiles show amber when placement is valid but word incomplete
- [ ] Tiles turn gray when placement violates rules (not in line, not connected, etc.)
- [ ] Direction indicator appears when 2+ tiles placed in valid line
- [ ] Visual updates in real-time as tiles are added/removed
- [ ] No performance issues (validation runs smoothly)
- [ ] Works for first move (center square rule)
- [ ] Works for subsequent moves (connection rule)
- [ ] Handles joker tiles correctly

---

## Estimated Time
- **Total:** ~3 hours
- **Core functionality:** 2 hours
- **Polish & testing:** 1 hour

---

## Quick Start Guide for Implementation (Tomorrow)

### Prerequisites
- Plan file location: `/Users/draganbesevic/.claude/plans/cosmic-sleeping-matsumoto.md`
- Local game directory: `/Users/draganbesevic/Projects/claude/Kvizovka/`

### Implementation Order (Follow Steps 1-6 Above)
1. **Start with gameStore.ts** - Add `placementValidation` state and `validateCurrentPlacement()` action
2. **Add TilePlacementState enum** - Create visual state types in board.types.ts
3. **Update Board.tsx** - Add `getTileState()` helper and row/column highlighting logic
4. **Update Square.tsx** - Add `placementState` prop and visual styling
5. **Handle edge cases** - Distinguish invalid vs incomplete words
6. **Test thoroughly** - All 6 test cases listed above

### User Requirements Summary (2026-01-10)
- ✅ Valid word (green): Just check placement + length ≥4 (NO dictionary)
- ✅ Direction: Highlight entire row/column (cyan background)
- ✅ Gray tiles when: not in line, gaps, no center, no connection

### Key Files to Modify
1. `src/store/gameStore.ts` - Real-time validation
2. `src/components/Board/Board.tsx` - Visual state logic
3. `src/components/Board/Square.tsx` - Tile styling
4. `src/types/board.types.ts` - TilePlacementState enum

---

## Next Steps

1. Resume this plan tomorrow
2. Implement validation state in gameStore
3. Update Board and Square components
4. Test with various placement scenarios
5. Add direction indicator (row/column highlighting)
6. Polish visual styling
7. Test edge cases
8. Update CHANGELOG when complete

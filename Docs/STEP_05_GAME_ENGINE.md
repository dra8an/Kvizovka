# Step 5: Core Game Engine Implementation ✅

**Completed:** January 2026

## Overview

In this step, we implemented the core game engine for Kvizovka - the "brain" that enforces all game rules and manages game logic.

We built 5 comprehensive classes that handle:
- Board management (17×17 grid)
- Tile management (238 tiles with shuffling)
- Score calculation (with all multipliers and bonuses)
- Word validation (using dictionary)
- Move validation (enforcing all game rules)

This is the foundation that the UI will use to create a fully functional game!

---

## What Was Built

### 1. **Board Class** (`src/game-engine/Board.ts`)

Manages the 17×17 Kvizovka game board.

**Key Responsibilities:**
- Initialize board with premium fields
- Get/set tiles on squares
- Check adjacency and connectivity
- Place blocker tiles around words
- Track premium field usage

**Core Methods:**
```typescript
class Board {
  initialize()                    // Create 17×17 grid
  getSquare(row, col)            // Get square at position
  getTile(row, col)              // Get tile at position
  setTile(row, col, tile)        // Place/remove tile
  isEmpty(row, col)              // Check if square empty
  isBlocker(row, col)            // Check if blocker tile
  getTilesInLine(row, col, dir)  // Get all tiles in a line
  placeBlockers(tiles, dir)      // Add blocker tiles
  areConnected(tiles)            // Check tile connectivity
  clone()                        // Deep copy for AI
}
```

**Key Features:**
- Premium fields mapped correctly (45 total)
- Blocker tile placement (Kvizovka-specific)
- Connectivity checking for valid moves
- First move center validation

---

### 2. **TileBag Class** (`src/game-engine/TileBag.ts`)

Manages the bag of 238 tiles.

**Key Responsibilities:**
- Initialize 228 letters + 10 jokers
- Shuffle tiles randomly (Fisher-Yates algorithm)
- Draw tiles for players
- Return tiles for exchanges
- Track remaining tiles

**Core Methods:**
```typescript
class TileBag {
  initialize()              // Create all 238 tiles
  shuffle()                 // Randomize order
  draw(count)              // Draw multiple tiles
  drawOne()                // Draw single tile
  returnTiles(tiles)       // Return for exchange
  remaining()              // Count left
  getDistribution()        // See what's left
  countLetter(letter)      // Count specific letter
}

// Helper function
createTileBag()            // Initialize + shuffle in one step
```

**Key Features:**
- Fisher-Yates shuffle for true randomness
- Serbian alphabet support (Č, Ć, Đ, Š, Ž, DŽ, LJ, NJ)
- 10 joker tiles
- Distribution tracking for AI strategy

---

### 3. **ScoreCalculator Class** (`src/game-engine/ScoreCalculator.ts`)

Calculates word scores with all multipliers and bonuses.

**Key Responsibilities:**
- Calculate base word scores
- Apply letter multipliers (2x, 3x, 4x)
- Apply word multipliers (2x, stackable)
- Add bonuses (all tiles, long words)
- Provide detailed breakdowns

**Core Methods:**
```typescript
class ScoreCalculator {
  calculateWordScore(squares, newTiles)     // Single word score
  calculateMoveScore(words, newTiles, count) // Total move score
  calculateFinalScore(score, remaining)     // End game score
  getScorePreview(squares, newTiles)        // Preview score
}
```

**Scoring Rules Implemented:**
- Letter multipliers: 2×, 3×, 4× (only on new tiles)
- Word multiplier: 2× (can stack: 2 fields = 4×)
- All tiles bonus: +45 points (use all 10 tiles)
- Long word bonus: +20 to +50 points (10+ letters)
- End game penalty: -tile values (joker = -10)
- Premium fields used only once

---

### 4. **WordValidator Class** (`src/game-engine/WordValidator.ts`)

Validates words against the dictionary.

**Key Responsibilities:**
- Check word existence in dictionary
- Verify minimum length (4 letters)
- Extract words from board squares
- Handle joker tiles properly

**Core Methods:**
```typescript
class WordValidator {
  validateWord(word)               // Validate single word
  extractWordFromSquares(squares)  // Get word text
  validateAllWords(words)          // Validate multiple
  areAllWordsValid(words)          // Check if all valid
  getInvalidWords(words)           // Find invalid ones
}
```

**Key Features:**
- Integrates with Dictionary from Step 4
- Handles joker tiles (uses jokerLetter)
- Minimum 4-letter requirement
- Detailed validation results

---

### 5. **MoveValidator Class** (`src/game-engine/MoveValidator.ts`)

Validates complete moves according to all Kvizovka rules.

**Key Responsibilities:**
- Check tile placement validity
- Verify tiles form single line
- Ensure connectivity
- Validate first move touches center
- Find all words formed
- Coordinate word validation

**Core Methods:**
```typescript
class MoveValidator {
  validateMove(placedTiles)        // Validate complete move
  // Returns: MoveValidationResult
  // { isValid, reason?, wordsFormed?, direction? }
}
```

**Rules Enforced:**
1. At least one tile placed
2. All positions valid and empty
3. Tiles form single line (horizontal or vertical)
4. First move touches center
5. Subsequent moves connect to existing tiles
6. No gaps in tile placement
7. All words formed are valid
8. Minimum word length (4 letters)

---

## How the Classes Work Together

### Example: Complete Game Flow

```typescript
import { Board, TileBag, ScoreCalculator, MoveValidator } from './game-engine'
import { dictionary } from './utils/dictionary'

// 1. Initialize game
await dictionary.load()

const board = new Board()
board.initialize()

const tileBag = createTileBag() // Already shuffled

// 2. Draw tiles for players
const player1Tiles = tileBag.draw(10)
const player2Tiles = tileBag.draw(10)

// 3. Player makes a move
const placedTiles = [
  { tile: player1Tiles[0], row: 8, col: 8 },   // K
  { tile: player1Tiles[1], row: 8, col: 9 },   // U
  { tile: player1Tiles[2], row: 8, col: 10 },  // Ć
  { tile: player1Tiles[3], row: 8, col: 11 }   // A
]

// 4. Validate move
const validator = new MoveValidator(board)
const result = validator.validateMove(placedTiles)

if (result.isValid) {
  // 5. Place tiles on board
  for (const placed of placedTiles) {
    board.setTile(placed.row, placed.col, placed.tile)
  }

  // 6. Place blockers
  board.placeBlockers(placedTiles, result.direction!)

  // 7. Calculate score
  const calculator = new ScoreCalculator()
  const scoreBreakdown = calculator.calculateMoveScore(
    result.wordsFormed!,
    placedTiles,
    4
  )

  console.log(`Score: ${scoreBreakdown.totalScore} points`)
  console.log(`Words: ${scoreBreakdown.wordScores.map(w => w.word).join(', ')}`)

  // 8. Draw new tiles
  const newTiles = tileBag.draw(4) // Replace used tiles
  player1Tiles.push(...newTiles)

} else {
  console.log(`Invalid move: ${result.reason}`)
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Game State (Zustand)                 │
│                  (To be added in Step 6)                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Game Engine                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐    │
│  │  Board   │  │  TileBag  │  │ ScoreCalculator  │    │
│  ├──────────┤  ├───────────┤  ├──────────────────┤    │
│  │17×17 grid│  │238 tiles  │  │Multipliers       │    │
│  │Premiums  │  │Shuffle    │  │Bonuses           │    │
│  │Blockers  │  │Draw/Return│  │Final scores      │    │
│  └──────────┘  └───────────┘  └──────────────────┘    │
│                                                          │
│  ┌───────────────┐  ┌──────────────┐                   │
│  │WordValidator  │  │MoveValidator │                    │
│  ├───────────────┤  ├──────────────┤                   │
│  │Dictionary     │  │Line check    │                    │
│  │Min length     │  │Connectivity  │                    │
│  │Joker handling │  │Center check  │                    │
│  └───────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Dependencies                          │
├─────────────────────────────────────────────────────────┤
│  Types (Step 3)  │  Constants (Step 3)  │  Dictionary   │
│  Board, Tile,    │  BOARD_SIZE, TILE   │  (Step 4)     │
│  GameState, etc. │  _DISTRIBUTION, etc. │  150 words    │
└─────────────────────────────────────────────────────────┘
```

---

## Key Concepts Learned

### 1. **Class-Based Architecture**

```typescript
class Board {
  private grid: BoardType  // Private property

  constructor() {
    this.grid = []  // Initialize in constructor
  }

  public initialize(): void {  // Public method
    // Implementation
  }
}
```

**Why classes?**
- Encapsulation: Hide internal details
- Methods: Group related functionality
- State management: Keep data organized
- Reusability: Create multiple instances

### 2. **Private vs Public Members**

```typescript
class TileBag {
  private tiles: Tile[] = []  // Only accessible inside class

  public draw(count: number): Tile[] {  // Accessible from outside
    return this.tiles.splice(...)
  }
}
```

### 3. **Type Guards**

```typescript
// Check if tile is BlockerTile or regular Tile
if ('type' in tile && tile.type === 'BLOCKER') {
  // TypeScript knows: tile is BlockerTile
} else if ('isJoker' in tile) {
  // TypeScript knows: tile is Tile
}
```

### 4. **Fisher-Yates Shuffle Algorithm**

```typescript
// True random shuffle
for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  [array[i], array[j]] = [array[j], array[i]]  // Swap
}
```

**Why this algorithm?**
- Every permutation equally likely
- O(n) time complexity (efficient)
- In-place (no extra memory)

### 5. **Spread Operator for Copying**

```typescript
// Create shallow copy of array
const copy = [...original]

// Clone object
const tileCopy = { ...tile }

// Add array items
this.tiles.push(...newTiles)
```

### 6. **Array Methods**

```typescript
// Filter
const invalid = words.filter(w => !w.isValid)

// Map
const text = squares.map(sq => sq.tile.letter).join('')

// Every
const allValid = results.every(r => r.isValid)

// Some
const hasBonus = words.some(w => w.length >= 10)

// Sort
const sorted = tiles.sort((a, b) => a.col - b.col)

// Splice (modifies array)
const drawn = tiles.splice(-5, 5)  // Remove last 5
```

---

## Build Verification

✅ **Build Status:** SUCCESS

```bash
npm run build

# Output:
✓ 40 modules transformed
dist/index.html                   0.48 kB
dist/assets/index-B8XRuGmf.css   19.86 kB
dist/assets/index-oPkQBmf5.js   150.67 kB
✓ built in 1.19s
```

**What changed:**
- Added 6 new files (5 classes + index)
- Bundle size remained stable (~151KB)
- All TypeScript compiles with no errors
- Type safety enforced throughout

---

## Files Created

### Game Engine Classes (6 files)
- `src/game-engine/Board.ts` - 435 lines
- `src/game-engine/TileBag.ts` - 334 lines
- `src/game-engine/ScoreCalculator.ts` - 285 lines
- `src/game-engine/WordValidator.ts` - 155 lines
- `src/game-engine/MoveValidator.ts` - 398 lines
- `src/game-engine/index.ts` - 17 lines

**Total:** ~1,600 lines of game logic with extensive comments!

---

## Testing the Game Engine

### Manual Testing Examples

```typescript
// Test 1: Board initialization
const board = new Board()
board.initialize()
console.log(board.getSquare(8, 8)?.premiumField)  // 'CENTER'
console.log(board.isEmpty(8, 8))  // true

// Test 2: Tile bag
const bag = createTileBag()
console.log(bag.remaining())  // 238
const tiles = bag.draw(10)
console.log(tiles.length)  // 10
console.log(bag.remaining())  // 228

// Test 3: Score calculation
const calculator = new ScoreCalculator()
// ... create word squares ...
const score = calculator.calculateWordScore(wordSquares, newTiles)
console.log(score.finalScore)

// Test 4: Word validation
const validator = new WordValidator()
const result = validator.validateWord('KUĆA')
console.log(result.isValid)  // true
console.log(result.category)  // 'NOUN'

// Test 5: Move validation
const moveValidator = new MoveValidator(board)
const moveResult = moveValidator.validateMove(placedTiles)
console.log(moveResult.isValid)
console.log(moveResult.wordsFormed)
```

---

## What's Next?

**Step 6: Zustand State Management**

Now that we have the game engine, we need to manage game state:
- Create game store with Zustand
- Actions: startGame, makeMove, skipTurn, exchangeTiles
- State: board, players, currentPlayer, score, timer
- Persistence: Save/load games to localStorage

**Step 7: UI Components**

Build the visual interface:
- Board component (17×17 grid)
- Tile component (draggable)
- TileRack component (player's 10 tiles)
- ScorePanel (scores, timer, statistics)
- GameControls (Play Word, Skip, Exchange buttons)

---

## Learning Resources

### Classes in TypeScript
- [TypeScript Handbook - Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Access Modifiers](https://www.typescriptlang.org/docs/handbook/2/classes.html#member-visibility)

### Algorithms
- [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Algorithm Complexity](https://www.bigocheatsheet.com/)

### TypeScript Advanced
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

### JavaScript Arrays
- [Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

---

## Notes

### Design Decisions

**Why separate validators?**
- WordValidator: Checks dictionary (simple, focused)
- MoveValidator: Checks game rules (complex, coordinates)
- Separation of concerns makes code easier to test and maintain

**Why immutable patterns?**
- `clone()` methods allow AI to test moves without affecting real board
- Spread operators create copies to avoid mutations
- Safer, easier to debug

**Why detailed comments?**
- User is learning TypeScript/React
- Comments explain not just "what" but "why"
- Real-world code would have fewer comments

### Performance Considerations

- Board: O(1) access time for any square
- TileBag: O(1) draw (using splice from end)
- ScoreCalculator: O(n) where n = word length
- WordValidator: O(1) dictionary lookup (uses Set)
- MoveValidator: O(n²) worst case for connectivity

All are fast enough for real-time gameplay!

---

**Step 5 Complete!** ✅

We now have a fully functional game engine that enforces all Kvizovka rules. The next step is to create a state management layer with Zustand to coordinate all these classes and make the game interactive!


# Step 3: Folder Structure, Type Definitions & Game Constants ✅

**Completed:** January 2026

## Overview

In this step, we created the foundational structure for the Kvizovka game by:
1. Setting up a clean folder organization
2. Defining all TypeScript types for type safety
3. Creating game configuration constants (board layout, tiles, scoring)

This is the "blueprint" phase - we're defining what everything looks like before building the actual game logic.

---

## What Was Built

### 1. Folder Structure

Created organized folders for different parts of the application:

```
src/
├── components/          # UI components (empty for now)
│   ├── Board/
│   ├── TileRack/
│   ├── Timer/
│   ├── ScorePanel/
│   └── GameControls/
├── types/              # TypeScript type definitions ✅
│   ├── board.types.ts
│   ├── tile.types.ts
│   ├── game.types.ts
│   └── index.ts
├── constants/          # Game configuration ✅
│   ├── board-config.ts
│   ├── tile-distribution.ts
│   ├── scoring-rules.ts
│   └── index.ts
├── game-engine/        # Game logic classes (empty for now)
├── utils/              # Helper functions (empty for now)
└── store/              # State management
    └── exampleStore.ts # (from Step 2)

public/
└── dictionary/         # Serbian word list (will add in Step 4)
```

**Why this structure?**
- **Separation of concerns**: UI, logic, types, and config are kept separate
- **Easy to find**: Related files are grouped together
- **Scalable**: Easy to add new components or features later

---

### 2. Type Definitions (`src/types/`)

Created comprehensive TypeScript interfaces and types that define the "shape" of all data in the game.

#### `board.types.ts` - Board and Position Types

**What it defines:**
- `BoardSquare` - A single square on the 17×17 board
- `Board` - The entire 17×17 grid (2D array)
- `PremiumFieldType` - Types of multiplier squares
- `BlockerTile` - Black tiles that close words
- `Position`, `Direction`, `PlacedTile`, `Word` - Helper types

**Key TypeScript concepts learned:**
```typescript
// Union type - value can be ONE of these options
type PremiumFieldType = 'DOUBLE_LETTER' | 'TRIPLE_LETTER' | 'QUADRUPLE_LETTER' | null

// Interface - defines object shape
interface BoardSquare {
  row: number
  col: number
  tile: Tile | BlockerTile | null  // Can be any of these 3 types
  premiumField: PremiumFieldType
  isUsed: boolean
}

// Type alias for 2D array
type Board = BoardSquare[][]  // Array of arrays
```

**Real example:**
```typescript
const centerSquare: BoardSquare = {
  row: 8,
  col: 8,
  tile: null,              // Empty square
  premiumField: 'CENTER',  // Starting position
  isUsed: false            // Premium not used yet
}
```

---

#### `tile.types.ts` - Tile and Dictionary Types

**What it defines:**
- `Tile` - A single letter or joker tile
- `TileDistribution` - How many tiles of each letter exist
- `WordCategory` - Types of valid words (noun, verb, etc.)
- `DictionaryWord`, `ValidationResult` - For word checking

**Key TypeScript concepts learned:**
```typescript
// Interface with optional property (? means optional)
interface Tile {
  id: string
  letter: string
  value: number
  isJoker: boolean
  jokerLetter?: string  // Only set if this is a joker
}

// Enum - named constants
enum WordCategory {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
}

// Usage:
const category: WordCategory = WordCategory.NOUN
console.log(category)  // 'NOUN'
```

**Real example:**
```typescript
// Regular tile
const tileA: Tile = {
  id: 'tile-0',
  letter: 'A',
  value: 1,
  isJoker: false
}

// Joker tile played as 'K'
const joker: Tile = {
  id: 'joker-0',
  letter: '',           // Jokers have empty letter
  value: 0,
  isJoker: true,
  jokerLetter: 'K'      // Now represents 'K'
}
```

---

#### `game.types.ts` - Game State Types

**What it defines:**
- `GameState` - The complete state of a game (single source of truth)
- `Player` - Player information (score, tiles, time)
- `Move` - A single turn in the game
- `GameMode`, `GameStatus`, `MoveType` - Enums for game states
- `ScoreBreakdown`, `GameSettings` - Supporting types

**Key TypeScript concepts learned:**
```typescript
// Enum for game modes
enum GameMode {
  LOCAL_MULTIPLAYER = 'LOCAL_MULTIPLAYER',
  VS_AI = 'VS_AI',
  ONLINE_MULTIPLAYER = 'ONLINE_MULTIPLAYER',
}

// Complex interface with many properties
interface GameState {
  id: string
  mode: GameMode
  status: GameStatus
  board: Board
  tileBag: Tile[]
  players: [Player, Player]  // Tuple - always exactly 2 players
  currentPlayerIndex: 0 | 1  // Literal type - can only be 0 or 1
  moveHistory: Move[]
  round: number
  winner?: string  // Optional - only set when game ends
}
```

**Real example:**
```typescript
// Getting current player from game state
const currentPlayer = gameState.players[gameState.currentPlayerIndex]
console.log(`${currentPlayer.name}'s turn`)

// Switching turns
gameState.currentPlayerIndex = gameState.currentPlayerIndex === 0 ? 1 : 0
```

---

#### `index.ts` - Barrel Export

**What it does:**
Exports all types from one central location for cleaner imports.

**Before:**
```typescript
import { Board } from './types/board.types'
import { Tile } from './types/tile.types'
import { GameState } from './types/game.types'
```

**After:**
```typescript
import { Board, Tile, GameState } from './types'
```

Much cleaner! This is called a "barrel export" pattern.

---

### 3. Game Constants (`src/constants/`)

Created configuration files that define the rules and setup of Kvizovka.

#### `board-config.ts` - Board Layout

**What it defines:**
- `BOARD_SIZE` - 17 (board is 17×17)
- `BOARD_CENTER` - {row: 8, col: 8} (starting position)
- `PREMIUM_FIELDS` - Map of all 45 premium field positions
- Helper functions: `getPremiumField()`, `isValidPosition()`, `getAdjacentPositions()`

**Key concept: Map data structure**
```typescript
// Map = key-value pairs with fast lookup
const PREMIUM_FIELDS = new Map<string, PremiumFieldType>([
  ['8,8', 'CENTER'],           // Center square
  ['0,0', 'WORD_MULTIPLIER'],  // Top-left corner
  ['0,3', 'DOUBLE_LETTER'],    // Double letter at (0, 3)
  // ... 42 more positions
])

// Fast lookup (O(1) - instant!)
const fieldType = PREMIUM_FIELDS.get('8,8')  // Returns 'CENTER'
```

**Premium field distribution:**
- 1 × CENTER (starting square)
- 16 × WORD_MULTIPLIER (X-marked, forms X pattern)
- 12 × DOUBLE_LETTER (yellow, 2×)
- 8 × TRIPLE_LETTER (green, 3×)
- 8 × QUADRUPLE_LETTER (red, 4×)
- **Total: 45 premium fields**

**Helper function example:**
```typescript
// Check if position is on board
isValidPosition(8, 8)   // true
isValidPosition(-1, 5)  // false (negative row)

// Get premium field type
getPremiumField(8, 8)   // Returns 'CENTER'
getPremiumField(1, 1)   // Returns null (regular square)

// Get adjacent squares
const neighbors = getAdjacentPositions(8, 8)
// Returns: [{row:7,col:8}, {row:9,col:8}, {row:8,col:7}, {row:8,col:9}]
```

---

#### `tile-distribution.ts` - Serbian Alphabet & Tile Counts

**What it defines:**
- `TILE_DISTRIBUTION` - Map of all letters with counts and values
- `TOTAL_TILES` - 238 (228 letters + 10 jokers)
- `TILES_PER_PLAYER` - 10 (each player holds 10 tiles)
- Helper functions: `getTileValue()`, `getTileCount()`, `isDigraph()`

**Tile distribution by point value:**

| Points | Letters | Count Each | Total |
|--------|---------|------------|-------|
| 1 pt | A, E, I, O, N, R, S, T, J, K, M, P, V | Varies | 131 |
| 2 pt | B, D, G, L, U, Z | 4-6 | 30 |
| 3 pt | C, Č, Ć, H, Ž | 3-4 | 16 |
| 4 pt | Đ, DŽ, F, LJ, NJ, Š | 2 | 12 |
| 0 pt | JOKER (blank) | 10 | 10 |
| **Total** | | | **238** |

**Special Serbian letters:**
- **Diacritics**: Č, Ć, Đ, Š, Ž (one character with accent)
- **Digraphs**: DŽ, LJ, NJ (two characters = one tile)

**Key concept: Record type**
```typescript
// Record<K, V> = object with keys of type K and values of type V
const TILE_DISTRIBUTION: Record<string, TileDistribution> = {
  'A': { count: 14, value: 1 },
  'Đ': { count: 2, value: 4 },
  'JOKER': { count: 10, value: 0 },
}

// Usage
const valueOfA = getTileValue('A')  // Returns 1
const valueOfDJ = getTileValue('Đ') // Returns 4
const isLJDigraph = isDigraph('LJ') // Returns true
```

---

#### `scoring-rules.ts` - Bonuses, Time Limits & Penalties

**What it defines:**
- **Bonuses**: All tiles bonus (45 pts), long word bonuses (20-50 pts)
- **Multipliers**: Letter (2×, 3×, 4×) and word (2×)
- **Time limits**: 15/30/35 minutes or unlimited
- **Penalties**: Invalid words (1/2/4 minutes), unused tiles at end

**Bonus scoring:**
```typescript
// All 10 tiles used in one move
ALL_TILES_BONUS = 45 points

// Long word bonuses
10 letters → +20 points
11 letters → +25 points
12 letters → +30 points
13 letters → +35 points
14 letters → +40 points
15 letters → +45 points
16+ letters → +50 points (max)
```

**Time penalties for invalid words:**
```typescript
1st offense → 1 minute penalty
2nd offense → 2 minutes penalty
3rd+ offense → 4 minutes penalty

// Usage
const penalty = getInvalidWordPenalty(1)  // 60,000 ms (1 minute)
```

**End game scoring:**
```typescript
// Player loses points for unused tiles
// Joker counts as -10 (not 0!)

const tiles = [
  { letter: 'A', value: 1, isJoker: false },
  { letter: '', value: 0, isJoker: true },   // Joker
  { letter: 'K', value: 2, isJoker: false }
]

const penalty = calculateEndGamePenalty(tiles)
// Returns: 1 + 10 + 2 = 13 points
```

---

#### `index.ts` - Constants Barrel Export

Exports all constants from one place:
```typescript
import {
  BOARD_SIZE,
  TILE_DISTRIBUTION,
  ALL_TILES_BONUS
} from './constants'
```

---

## Key TypeScript Concepts Learned

### 1. **Interfaces** - Define Object Shapes
```typescript
interface Player {
  id: string
  name: string
  score: number
}

const player: Player = {
  id: 'p1',
  name: 'Dragan',
  score: 0
}
```

### 2. **Type Aliases** - Shortcuts for Complex Types
```typescript
type Board = BoardSquare[][]  // 2D array
type Coordinate = string       // "row,col" format
```

### 3. **Union Types** - Value Can Be One of Several Types
```typescript
type PremiumFieldType = 'DOUBLE_LETTER' | 'TRIPLE_LETTER' | null
```

### 4. **Enums** - Named Constants
```typescript
enum GameStatus {
  SETUP = 'SETUP',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

const status: GameStatus = GameStatus.IN_PROGRESS
```

### 5. **Optional Properties** - May or May Not Exist
```typescript
interface Tile {
  letter: string
  jokerLetter?: string  // Optional - only for jokers
}
```

### 6. **Literal Types** - Exact Values Only
```typescript
currentPlayerIndex: 0 | 1  // Can ONLY be 0 or 1
```

### 7. **Tuple Types** - Fixed-Length Arrays
```typescript
players: [Player, Player]  // Always exactly 2 players
```

### 8. **Record Type** - Object with Specific Key/Value Types
```typescript
Record<string, TileDistribution>
// = object with string keys and TileDistribution values
```

---

## How to Use These Files

### Example 1: Initialize a Board
```typescript
import { BOARD_SIZE, getPremiumField } from './constants'
import { Board, BoardSquare } from './types'

// Create empty 17×17 board
const board: Board = []
for (let row = 0; row < BOARD_SIZE; row++) {
  board[row] = []
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[row][col] = {
      row,
      col,
      tile: null,
      premiumField: getPremiumField(row, col),
      isUsed: false
    }
  }
}
```

### Example 2: Initialize Tile Bag
```typescript
import { TILE_DISTRIBUTION } from './constants'
import { Tile } from './types'

const tileBag: Tile[] = []
let tileId = 0

for (const [letter, { count, value }] of Object.entries(TILE_DISTRIBUTION)) {
  for (let i = 0; i < count; i++) {
    if (letter === 'JOKER') {
      tileBag.push({
        id: `joker-${i}`,
        letter: '',
        value: 0,
        isJoker: true
      })
    } else {
      tileBag.push({
        id: `tile-${tileId++}`,
        letter,
        value,
        isJoker: false
      })
    }
  }
}
```

### Example 3: Calculate Move Score
```typescript
import { ALL_TILES_BONUS, getLongWordBonus } from './constants'

let moveScore = baseWordScore  // Calculated from tiles + multipliers

// Add all-tiles bonus if player used all 10 tiles
if (tilesUsed === 10) {
  moveScore += ALL_TILES_BONUS  // +45 points
}

// Add long-word bonus if word is 10+ letters
const wordLength = word.length
moveScore += getLongWordBonus(wordLength)

console.log(`Final move score: ${moveScore}`)
```

---

## Build Verification

✅ **Build Status:** SUCCESS

```bash
npm run build

# Output:
✓ 35 modules transformed.
dist/index.html                   0.48 kB
dist/assets/index-C3jv3NO4.css   17.18 kB
dist/assets/index-BYeRGxaB.js   146.28 kB
✓ built in 2.91s
```

All TypeScript types compiled successfully with no errors!

---

## Files Created

### Type Definition Files (4 files)
- `src/types/board.types.ts` - 208 lines
- `src/types/tile.types.ts` - 230 lines
- `src/types/game.types.ts` - 436 lines
- `src/types/index.ts` - 71 lines

### Constants Files (4 files)
- `src/constants/board-config.ts` - 158 lines
- `src/constants/tile-distribution.ts` - 185 lines
- `src/constants/scoring-rules.ts` - 293 lines
- `src/constants/index.ts` - 18 lines

**Total:** 8 files, ~1,600 lines of well-documented TypeScript code

---

## Learning Resources

### TypeScript Basics
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for Beginners](https://github.com/microsoft/TypeScript-Handbook)

### Specific Topics
- **Interfaces vs Types**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- **Enums**: https://www.typescriptlang.org/docs/handbook/enums.html
- **Union Types**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
- **Generics (Record, Map)**: https://www.typescriptlang.org/docs/handbook/2/generics.html

### Data Structures
- **Map**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- **Arrays**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

---

## What's Next?

**Step 4: Serbian Dictionary**
- Research and download Serbian word list
- Format for game use (JSON file)
- Start with ~1,000 common words for testing
- Create dictionary loader utility

**Step 5: Game Engine Classes**
- Implement Board, TileBag, ScoreCalculator
- Build WordValidator and MoveValidator
- All logic will use the types and constants we just created!

---

## Notes

- All files include extensive comments for learning
- Type safety will catch errors during development (e.g., can't assign invalid values)
- Constants are separated from code for easy tweaking
- Everything is ready to be used by the game engine (next step!)

**Step 3 Complete!** ✅ The foundation is solid - we have types and constants ready for building the game logic.

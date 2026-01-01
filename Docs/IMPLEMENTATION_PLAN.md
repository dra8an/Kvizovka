# Kvizovka - Implementation Plan

## Project Overview

**Kvizovka** is a Serbian word board game, similar to Scrabble but with distinct rules designed for the Serbian language. This document outlines the implementation plan for building a web-based version of the game.

### Project Goals
- Build an MVP: Local 2-player mode first
- Learn TypeScript and React while building
- Create a playable, fun game that follows official Kvizovka rules
- Foundation for future features (AI opponent, online multiplayer)

### Target Audience
- Serbian language speakers who enjoy word games
- Competitive players familiar with tournament rules
- Casual players wanting to practice word building

---

## Game Rules Summary

### Board Configuration
- **Grid Size**: 17×17 squares (larger than Scrabble's 15×15)
- **Premium Fields**: 45 special squares with multipliers
  - Yellow (2 dots): Double letter value (2×)
  - Green (3 dots): Triple letter value (3×)
  - Red (4 dots): Quadruple letter value (4×)
  - X-marked: Word multiplier (2×, can stack to 4×)
- **Center Square**: Starting position (first word must cross it)

### Tile Set
- **Total Tiles**: 238 gameplay tiles + unlimited black blockers
  - 228 letter tiles (Serbian alphabet)
  - 10 joker tiles (called "kvizovac")
  - **Black blocker tiles**: Unlimited (auto-placed by game to "close" words)
- **Letter Values**: 1-4 points based on frequency
  - Common letters (A, E, I, O, U, N, R, S): 1 point
  - Rare letters (Đ, DŽ): 4 points
- **Tiles Per Player**: 10 (not 7 like Scrabble)
- **Black Blocker Rule**: After placing a word, black tiles are placed before/after it to prevent extension (not placed if word touches board edge)

### Gameplay Rules

**Turn Structure**:
- Each player plays 10 rounds
- Time limit: 30-35 minutes per player (chess clock)
- Players can: place tiles, skip turn, or exchange tiles

**Word Requirements**:
- Minimum length: 4 letters (3 letters if perpendicular to board edge)
- First word must cross center square
- Subsequent words must connect to existing words

**Valid Words**:
- ✅ General nouns (nominative case only)
- ✅ Verbs (infinitive form, non-reflexive)
- ✅ Adjectives (all genders/cases, positive form only)
- ✅ Pronouns
- ✅ Numbers
- ❌ Proper nouns (names, places)
- ❌ Exclamations
- ❌ Abbreviations
- ❌ Dependent morphemes

### Scoring System

**Base Scoring**:
1. Calculate each tile's value
2. Apply letter multipliers (only on newly placed tiles)
3. Apply word multipliers
4. Sum all words formed in the move

**Bonuses**:
- Using all 10 tiles in one move: **40-50 points**
- Words with 10+ letters: **20-50 points**

**Penalties**:
- Unused tiles at game end: subtract tile values
- Unused jokers: **-10 points each**
- Invalid word attempts: time penalties (1, 2, or 4 minutes)

**Game End**:
- After 10 rounds per player
- Player with higher score wins (if within time limit)

---

## Technology Stack

### Frontend (MVP - No Backend)
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 18** | UI framework | Component-based, popular, good learning resource |
| **TypeScript** | Type safety | Catch errors early, better IDE support |
| **Vite** | Build tool | Fast development, simple configuration |
| **Tailwind CSS** | Styling | Utility-first, rapid prototyping |
| **Zustand** | State management | Simpler than Redux, easy to learn |
| **localStorage** | Game persistence | No backend needed for MVP |

### Development Tools
- **npm/pnpm**: Package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

### Future Stack (Post-MVP)
- **Node.js + Express**: Backend server
- **Socket.IO**: Real-time multiplayer
- **PostgreSQL**: Database
- **JWT**: Authentication

---

## Project Structure

```
kvizovka/
├── Docs/                          # 📚 Documentation
│   ├── IMPLEMENTATION_PLAN.md     # This file
│   ├── GAME_RULES.md              # Detailed game rules
│   └── API.md                     # (Future) API documentation
├── public/
│   ├── dictionary/
│   │   └── serbian-words.json     # Serbian word dictionary
│   └── assets/
│       ├── images/                # Board graphics, logos
│       └── sounds/                # (Future) Sound effects
├── src/
│   ├── components/                # React UI components
│   │   ├── Board/
│   │   │   ├── Board.tsx          # Main game board (17×17 grid)
│   │   │   ├── Square.tsx         # Individual board square
│   │   │   └── Board.css
│   │   ├── TileRack/
│   │   │   ├── TileRack.tsx       # Player's tile holder
│   │   │   ├── Tile.tsx           # Individual tile
│   │   │   └── TileRack.css
│   │   ├── Timer/
│   │   │   └── Timer.tsx          # Chess-style countdown timer
│   │   ├── ScorePanel/
│   │   │   └── ScorePanel.tsx     # Score display & history
│   │   └── GameControls/
│   │       └── GameControls.tsx   # Action buttons
│   ├── game-engine/               # Core game logic (TypeScript classes)
│   │   ├── Board.ts               # Board state & operations
│   │   ├── TileBag.ts             # Tile management
│   │   ├── ScoreCalculator.ts     # Scoring logic
│   │   ├── WordValidator.ts       # Dictionary validation
│   │   ├── MoveValidator.ts       # Move legality checks
│   │   └── BlockerManager.ts      # Black blocker tile placement
│   ├── types/                     # TypeScript type definitions
│   │   ├── board.types.ts         # Board, Square, PremiumField
│   │   ├── tile.types.ts          # Tile, TileBag
│   │   └── game.types.ts          # GameState, Player, Move
│   ├── constants/                 # Game configuration
│   │   ├── board-config.ts        # Premium field positions
│   │   ├── tile-distribution.ts   # Serbian letter frequencies
│   │   └── scoring-rules.ts       # Point values, bonuses
│   ├── store/                     # State management (Zustand)
│   │   └── gameStore.ts           # Global game state
│   ├── utils/                     # Helper functions
│   │   └── dictionary.ts          # Dictionary loading & search
│   ├── App.tsx                    # Root component
│   ├── App.css                    # Global styles
│   └── main.tsx                   # Application entry point
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Implementation Phases

### Phase 1: MVP - Local Multiplayer ⭐ **[CURRENT FOCUS]**

**Goal**: Create a playable 2-player local game on one device

#### Step 1: Project Setup & Foundation
**Tasks**:
- [ ] Initialize Vite project with React + TypeScript template
- [ ] Install dependencies: Tailwind CSS, Zustand
- [ ] Configure Tailwind CSS
- [ ] Setup folder structure (`/components`, `/types`, `/game-engine`, `/constants`)
- [ ] Configure TypeScript (beginner-friendly: strict mode off initially)
- [ ] Setup ESLint and Prettier
- [ ] Initialize Git repository

**Files to Create**:
- `package.json` (via `npm create vite@latest`)
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `.gitignore`

**Commands**:
```bash
npm create vite@latest kvizovka -- --template react-ts
cd kvizovka
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install zustand
```

---

#### Step 2: Serbian Dictionary Research & Preparation
**Tasks**:
- [ ] Research open-source Serbian word lists
  - Check Wiktionary data dumps
  - Look for Serbian Scrabble dictionaries
  - Search GitHub for Serbian word lists
- [ ] Download initial word list (~1000 common words for testing)
- [ ] Format as JSON: `{ "word": "category" }`
- [ ] Categories: NOUN, VERB, ADJECTIVE, PRONOUN, NUMBER
- [ ] Save to `/public/dictionary/serbian-words.json`
- [ ] Create utility function to load dictionary

**Sources to Explore**:
- Wiktionary Serbian category dumps
- Serbian WordNet (if available)
- Open-source Scrabble word lists
- Serbian language learning resources

**Example Format**:
```json
{
  "pas": "NOUN",
  "trčati": "VERB",
  "lep": "ADJECTIVE",
  "ovo": "PRONOUN",
  "jedan": "NUMBER"
}
```

---

#### Step 3: Core Type Definitions
**Tasks**:
- [ ] Create `src/types/board.types.ts`
- [ ] Create `src/types/tile.types.ts`
- [ ] Create `src/types/game.types.ts`
- [ ] Add JSDoc comments to all interfaces and types
- [ ] Export all types from each file

**Key Types**:

**board.types.ts**:
```typescript
/**
 * Types of premium fields on the board
 */
export type PremiumFieldType =
  | 'DOUBLE_LETTER'      // Yellow, 2 dots - multiplies letter value by 2
  | 'TRIPLE_LETTER'      // Green, 3 dots - multiplies letter value by 3
  | 'QUADRUPLE_LETTER'   // Red, 4 dots - multiplies letter value by 4
  | 'WORD_MULTIPLIER'    // X-marked - multiplies entire word value by 2
  | 'CENTER'             // Starting square
  | null;                // Regular square

/**
 * Represents a black blocker tile
 */
export interface BlockerTile {
  type: 'BLOCKER';
  id: string;
}

/**
 * Represents a single square on the game board
 */
export interface BoardSquare {
  row: number;           // 0-16
  col: number;           // 0-16
  tile: Tile | BlockerTile | null;  // Letter tile, blocker, or empty
  premiumField: PremiumFieldType;
  isUsed: boolean;       // Whether premium multiplier has been used
}

/**
 * The game board - 17x17 grid of squares
 */
export type Board = BoardSquare[][];
```

**tile.types.ts**:
```typescript
/**
 * Represents a single tile
 */
export interface Tile {
  id: string;            // Unique identifier (for React keys)
  letter: string;        // 'A', 'B', 'Č', ... or '' for joker
  value: number;         // Point value (1-4, or 0 for joker)
  isJoker: boolean;      // Whether this is a joker tile
  jokerLetter?: string;  // What letter the joker represents (when played)
}

/**
 * Word category for dictionary validation
 */
export enum WordCategory {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  PRONOUN = 'PRONOUN',
  NUMBER = 'NUMBER',
}
```

**game.types.ts**:
```typescript
/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  tiles: Tile[];         // 10 tiles in hand
  score: number;
  timeRemaining: number; // milliseconds (30-35 min)
  roundsPlayed: number;  // 0-10
}

/**
 * The complete state of a game
 */
export interface GameState {
  id: string;
  board: Board;
  players: [Player, Player]; // Always 2 players
  currentPlayerIndex: 0 | 1;
  tileBag: Tile[];       // Remaining tiles
  moveHistory: Move[];
  status: 'setup' | 'playing' | 'paused' | 'finished';
}

/**
 * Represents a single move/turn
 */
export interface Move {
  playerId: string;
  type: 'place' | 'skip' | 'exchange';
  placedTiles?: PlacedTile[];
  formedWords?: string[];
  score: number;
  timestamp: number;
}

/**
 * A tile placement on the board
 */
export interface PlacedTile {
  tile: Tile;
  row: number;
  col: number;
}
```

---

#### Step 4: Game Constants & Configuration
**Tasks**:
- [ ] Create `src/constants/board-config.ts` with premium field positions
- [ ] Create `src/constants/tile-distribution.ts` with Serbian letter set
- [ ] Create `src/constants/scoring-rules.ts` with point values
- [ ] Add detailed comments explaining each configuration

**board-config.ts**:
```typescript
/**
 * The size of the game board (17x17)
 */
export const BOARD_SIZE = 17;

/**
 * Position of the center square (starting position)
 */
export const CENTER_POSITION = { row: 8, col: 8 };

/**
 * Map of premium field positions
 * Key format: "row,col"
 *
 * Premium fields are distributed across the board:
 * - 45 total premium squares
 * - Symmetrically placed around the center
 */
export const PREMIUM_FIELDS: Record<string, PremiumFieldType> = {
  // Center square
  '8,8': 'CENTER',

  // Word multipliers (X-marked) - 16 total
  '0,0': 'WORD_MULTIPLIER',
  '0,7': 'WORD_MULTIPLIER',
  // ... (add all 45 positions based on official Kvizovka board)

  // Quadruple letter (Red, 4 dots) - 8 total
  '1,1': 'QUADRUPLE_LETTER',
  // ...

  // Triple letter (Green, 3 dots) - 12 total
  '2,2': 'TRIPLE_LETTER',
  // ...

  // Double letter (Yellow, 2 dots) - 8 total
  '3,3': 'DOUBLE_LETTER',
  // ...
};
```

**tile-distribution.ts**:
```typescript
/**
 * Serbian tile distribution and point values
 * Based on letter frequency in Serbian language
 *
 * Total: 228 letter tiles + 10 jokers = 238 game tiles
 */
export const TILE_DISTRIBUTION: Record<string, { count: number; value: number }> = {
  // Most common letters - 1 point each
  'A': { count: 14, value: 1 },
  'E': { count: 12, value: 1 },
  'I': { count: 11, value: 1 },
  'O': { count: 10, value: 1 },
  'N': { count: 10, value: 1 },
  'R': { count: 10, value: 1 },
  'S': { count: 9, value: 1 },
  'T': { count: 8, value: 1 },

  // Common letters - 2 points
  'J': { count: 8, value: 2 },
  'V': { count: 7, value: 2 },
  'D': { count: 7, value: 2 },
  'K': { count: 6, value: 2 },
  'L': { count: 6, value: 2 },
  'M': { count: 6, value: 2 },
  'P': { count: 6, value: 2 },
  'U': { count: 6, value: 2 },

  // Less common letters - 3 points
  'G': { count: 4, value: 3 },
  'B': { count: 4, value: 3 },
  'Z': { count: 4, value: 3 },
  'C': { count: 4, value: 3 },
  'Č': { count: 3, value: 3 },
  'Ć': { count: 3, value: 3 },
  'H': { count: 3, value: 3 },
  'Ž': { count: 3, value: 3 },
  'Š': { count: 3, value: 3 },

  // Rare letters - 4 points
  'Đ': { count: 2, value: 4 },
  'DŽ': { count: 2, value: 4 },
  'LJ': { count: 2, value: 4 },
  'NJ': { count: 2, value: 4 },
  'F': { count: 2, value: 4 },

  // Jokers (blank tiles) - 0 points, can be any letter
  'JOKER': { count: 10, value: 0 },
};

/**
 * Number of tiles each player starts with (10 in Kvizovka, not 7 like Scrabble)
 */
export const TILES_PER_PLAYER = 10;

/**
 * Total number of tiles in the game
 */
export const TOTAL_TILES = 238; // 228 letters + 10 jokers
```

**scoring-rules.ts**:
```typescript
/**
 * Scoring rules and bonus values
 */

/**
 * Bonus for using all 10 tiles in a single move
 */
export const ALL_TILES_BONUS = 45;

/**
 * Bonus points for long words (10+ letters)
 * Can be configurable or scaled based on length
 */
export const LONG_WORD_BONUS = {
  10: 20,  // 10-letter word
  11: 25,
  12: 30,
  13: 35,
  14: 40,
  15: 45,
  16: 50,
  17: 50,  // Max word length (entire row/column)
};

/**
 * Minimum word length (4 letters, or 3 if at edge)
 */
export const MIN_WORD_LENGTH = 4;
export const MIN_WORD_LENGTH_AT_EDGE = 3;

/**
 * Penalty for unused joker tiles at game end
 */
export const UNUSED_JOKER_PENALTY = 10;

/**
 * Time limits (milliseconds)
 */
export const GAME_TIME_LIMIT = 30 * 60 * 1000; // 30 minutes per player
export const EXTENDED_TIME_LIMIT = 35 * 60 * 1000; // 35 minutes (optional)

/**
 * Time penalties for invalid words (milliseconds)
 */
export const INVALID_WORD_PENALTIES = [
  1 * 60 * 1000,  // First offense: 1 minute
  2 * 60 * 1000,  // Second offense: 2 minutes
  4 * 60 * 1000,  // Third+ offense: 4 minutes
];
```

---

#### Step 5: Core Game Engine Classes
**Tasks**:
- [ ] Implement `Board.ts` class (initialize grid, get/set squares, check adjacency)
- [ ] Implement `TileBag.ts` class (initialize 238 tiles, shuffle, draw, return tiles)
- [ ] Implement `ScoreCalculator.ts` class (calculate word scores with premium fields)
- [ ] Implement `WordValidator.ts` class (check dictionary, validate word placement)
- [ ] Implement `MoveValidator.ts` class (check valid placement, connectivity, blocker collision)
- [ ] Implement `BlockerManager.ts` class (place black blockers around words)
- [ ] Add detailed comments explaining the logic
- [ ] Write simple unit tests (optional for MVP)

**Example: TileBag.ts** (simplified version):
```typescript
import { Tile } from '../types/tile.types';
import { TILE_DISTRIBUTION, TILES_PER_PLAYER } from '../constants/tile-distribution';

/**
 * Manages the bag of tiles for the game
 * Responsibilities:
 * - Initialize 238 tiles based on distribution
 * - Shuffle tiles randomly
 * - Draw tiles for players
 * - Return tiles to bag (when exchanging)
 */
export class TileBag {
  private tiles: Tile[];

  constructor() {
    this.tiles = this.initializeTiles();
    this.shuffle();
  }

  /**
   * Creates all 238 tiles based on TILE_DISTRIBUTION
   */
  private initializeTiles(): Tile[] {
    const tiles: Tile[] = [];
    let idCounter = 0;

    // Create tiles for each letter
    for (const [letter, config] of Object.entries(TILE_DISTRIBUTION)) {
      for (let i = 0; i < config.count; i++) {
        tiles.push({
          id: `tile-${idCounter++}`,
          letter: letter === 'JOKER' ? '' : letter,
          value: config.value,
          isJoker: letter === 'JOKER',
        });
      }
    }

    return tiles;
  }

  /**
   * Shuffles the tiles using Fisher-Yates algorithm
   */
  private shuffle(): void {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  /**
   * Draws a specified number of tiles from the bag
   * @param count Number of tiles to draw (default: 10)
   * @returns Array of drawn tiles
   */
  draw(count: number = TILES_PER_PLAYER): Tile[] {
    // Can't draw more tiles than available
    const actualCount = Math.min(count, this.tiles.length);
    return this.tiles.splice(0, actualCount);
  }

  /**
   * Returns tiles to the bag (used when exchanging tiles)
   */
  returnTiles(tiles: Tile[]): void {
    this.tiles.push(...tiles);
    this.shuffle();
  }

  /**
   * Gets the number of remaining tiles
   */
  get remaining(): number {
    return this.tiles.length;
  }

  /**
   * Checks if bag is empty
   */
  get isEmpty(): boolean {
    return this.tiles.length === 0;
  }
}
```

---

#### Step 6: State Management with Zustand
**Tasks**:
- [ ] Create `src/store/gameStore.ts`
- [ ] Define initial game state
- [ ] Implement actions: `startGame`, `placeTile`, `removeTile`, `submitMove`, `skipTurn`, `exchangeTiles`
- [ ] Add persistence to localStorage
- [ ] Add comments explaining state updates

**Example: gameStore.ts** (simplified):
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Move, PlacedTile } from '../types/game.types';
import { TileBag } from '../game-engine/TileBag';
import { createEmptyBoard } from '../game-engine/Board';

interface GameStore extends GameState {
  // Actions
  startGame: (player1Name: string, player2Name: string) => void;
  placeTile: (tile: PlacedTile) => void;
  removeTile: (row: number, col: number) => void;
  submitMove: () => void;
  skipTurn: () => void;
  exchangeTiles: (tiles: Tile[]) => void;
  saveGame: () => void;
  loadGame: () => void;
}

/**
 * Global game state store using Zustand
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      id: '',
      board: createEmptyBoard(),
      players: [] as any,
      currentPlayerIndex: 0,
      tileBag: [],
      moveHistory: [],
      status: 'setup',

      // Actions
      startGame: (player1Name, player2Name) => {
        const tileBag = new TileBag();

        const player1: Player = {
          id: 'player1',
          name: player1Name,
          tiles: tileBag.draw(10),
          score: 0,
          timeRemaining: 30 * 60 * 1000,
          roundsPlayed: 0,
        };

        const player2: Player = {
          id: 'player2',
          name: player2Name,
          tiles: tileBag.draw(10),
          score: 0,
          timeRemaining: 30 * 60 * 1000,
          roundsPlayed: 0,
        };

        set({
          id: `game-${Date.now()}`,
          board: createEmptyBoard(),
          players: [player1, player2],
          currentPlayerIndex: 0,
          tileBag: tileBag.getAllTiles(),
          moveHistory: [],
          status: 'playing',
        });
      },

      // ... other actions

      submitMove: () => {
        // Validate move
        // Calculate score
        // Update board
        // Switch turns
        // Refill tiles
        // Record move in history
      },

      // ... more actions
    }),
    {
      name: 'kvizovka-game', // localStorage key
    }
  )
);
```

---

#### Step 7: UI Components
**Tasks**:
- [ ] Create Board component with 17×17 grid
- [ ] Create Square component with premium field styling
- [ ] Create Tile component (draggable)
- [ ] Create TileRack component
- [ ] Create Timer component (countdown)
- [ ] Create ScorePanel component
- [ ] Create GameControls component (buttons)
- [ ] Style with Tailwind CSS

**Board Component Structure**:
```typescript
export const Board: React.FC = () => {
  const board = useGameStore((state) => state.board);

  return (
    <div className="grid grid-cols-17 gap-0.5 bg-gray-800 p-4">
      {board.map((row, rowIdx) =>
        row.map((square, colIdx) => (
          <Square
            key={`${rowIdx}-${colIdx}`}
            square={square}
            row={rowIdx}
            col={colIdx}
          />
        ))
      )}
    </div>
  );
};
```

---

#### Step 8: Drag-and-Drop Implementation
**Tasks**:
- [ ] Research drag-and-drop options (HTML5 native vs react-dnd)
- [ ] Implement dragging tiles from rack to board
- [ ] Add visual feedback (highlight drop zones)
- [ ] Handle invalid drops (snap back to rack)
- [ ] Allow dragging tiles between board squares
- [ ] Allow returning tiles to rack

---

#### Step 9: Game Flow & Integration
**Tasks**:
- [ ] Create start screen (enter player names)
- [ ] Initialize game when starting
- [ ] Implement turn switching
- [ ] Connect move validation to UI
- [ ] **Automatically place black blocker tiles after each valid move**
- [ ] Show feedback for invalid moves (including blocker collisions)
- [ ] Detect game end (10 rounds or tiles exhausted)
- [ ] Calculate final scores
- [ ] Show winner screen

---

#### Step 10: Testing & Polish
**Tasks**:
- [ ] Playtest complete games
- [ ] Fix bugs discovered
- [ ] Add basic animations (tile placement)
- [ ] Improve error messages
- [ ] Write README with instructions
- [ ] Add keyboard shortcuts (optional)
- [ ] Optimize performance (if needed)

---

### Phase 2: AI Opponent (Future)
- Move generation algorithm
- Difficulty levels (Beginner, Intermediate, Expert)
- Web Worker for non-blocking AI calculations

### Phase 3: Enhanced Dictionary (Future)
- Expand to 50,000+ Serbian words
- Support both Cyrillic and Latin scripts
- Optimize with Trie data structure
- Add word definitions in UI

### Phase 4: Online Multiplayer (Future)
- Node.js backend with Express
- Socket.IO for real-time gameplay
- User authentication
- Matchmaking system
- Leaderboards with ELO rating

### Phase 5: Mobile & Polish (Future)
- Mobile-responsive design
- PWA capabilities (installable app)
- Sound effects and animations
- Tutorial system
- Achievements

---

## Critical Implementation Details

### Premium Field Calculation
```typescript
/**
 * Premium fields apply ONLY on the turn they are first covered
 * After a tile is placed on a premium field, that square becomes "used"
 * and the multiplier no longer applies in future turns.
 *
 * Order of operations for scoring:
 * 1. Calculate base tile value
 * 2. Apply letter multipliers (2x, 3x, 4x) - ONLY for newly placed tiles on unused premium fields
 * 3. Sum all letter values in the word
 * 4. Apply word multipliers (2x from X-marked squares) - can stack (2 X's = 4x total)
 * 5. Add bonuses (all tiles used, long words)
 */
```

### Word Formation Detection
```typescript
/**
 * When tiles are placed, need to detect ALL formed words:
 * 1. The main word (along the placement direction)
 * 2. Perpendicular cross-words (each newly placed tile might form a perpendicular word)
 *
 * Example:
 *     C
 *     A
 *   TIGER
 *     S
 *
 * Placing "TIGER" horizontally also forms "CAT" vertically
 * Both words must be valid and both contribute to the score
 */
```

### First Move Rule
```typescript
/**
 * The very first move of the game MUST:
 * - Cover the center square (row 8, col 8)
 * - Form a valid word of at least 4 letters
 * - Black blockers will be placed around the word
 *
 * After the first move, all subsequent moves MUST:
 * - Use at least one existing tile (connect to board)
 * - Form valid words (main + all cross-words)
 * - NOT cross through black blocker tiles
 * - NOT extend words (blockers prevent this)
 */
```

### Black Blocker Tiles Rule
```typescript
/**
 * After each word is placed, black blocker tiles are automatically added:
 *
 * Placement:
 * - One blocker BEFORE the first letter of the word
 * - One blocker AFTER the last letter of the word
 * - Exception: No blocker placed if word touches board edge
 *
 * Effect:
 * - Blockers PREVENT word extension (words are "closed")
 * - Blockers PREVENT crossing (act as walls)
 * - New words can still use existing letters as connection points
 * - New words can be placed perpendicular to blocked words
 *
 * Example:
 *   Before: . . . . .
 *   Place "CATS": . ■ C A T S ■ .
 *                   ↑         ↑
 *                 blocker   blocker
 *
 * Implementation:
 * - BlockerManager.placeBlockers(word, board)
 * - Check blocker collision in MoveValidator
 * - Render blockers as solid black squares in UI
 */
```

---

## Resources & References

### Serbian Dictionary Sources
- [ ] **Wiktionary**: Serbian category dumps ([download](https://dumps.wikimedia.org/))
- [ ] **GitHub**: Search for "serbian word list" or "srpski reči"
- [ ] **Serbian Scrabble**: Official tournament dictionaries
- [ ] **LibreOffice**: Serbian dictionary extensions

### Learning Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

### Similar Projects for Reference
- Scrabble implementations on GitHub
- Word game engines
- Board game UIs

---

## Success Metrics

### MVP Success Criteria
✅ Two players can:
- Start a new game
- Take turns placing tiles
- See score calculated correctly
- Use timer to track time
- Complete a full game
- Save and resume games

✅ Game enforces:
- All Kvizovka rules (word length, connectivity, valid words)
- Correct scoring (premium fields, bonuses, penalties)
- Turn-based gameplay

✅ UI is:
- Intuitive and easy to use
- Responsive on desktop
- Visually clear (premium fields, tiles, scores)

### Code Quality Goals
- Well-commented for learning
- Type-safe (no `any` types)
- Modular and organized
- Maintainable for future features

---

## Development Timeline

**Note**: As a beginner learning TypeScript/React, focus on one step at a time. Don't rush. Understanding is more important than speed.

**Estimated effort**:
- **Steps 1-4** (Setup & Config): 3-5 days
- **Steps 5-6** (Game Engine & State): 1-2 weeks
- **Steps 7-8** (UI & Drag-Drop): 1-2 weeks
- **Steps 9-10** (Integration & Testing): 1 week

**Total MVP**: 4-6 weeks of focused learning and development

---

## Next Steps

1. ✅ **Read this plan** - Make sure you understand the overall structure
2. ⬜ **Start Step 1** - Initialize the Vite project
3. ⬜ **Get help finding dictionary** - Research Serbian word lists together
4. ⬜ **Proceed step-by-step** - Don't skip ahead, build incrementally

Ready to start coding? Let's begin with Step 1!

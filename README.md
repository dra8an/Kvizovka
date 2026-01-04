# Kvizovka - Serbian Word Board Game

A fully playable web-based implementation of Kvizovka, a Serbian word game similar to Scrabble. Play locally with two players on the same device!

## 🎮 About Kvizovka

Kvizovka is a strategic word game for the Serbian language with unique rules:
- **17×17 board** (larger than Scrabble's 15×15)
- **10 tiles per player** (vs Scrabble's 7)
- **Black blocker tiles** that "close" words after placement
- **4-letter minimum** word length
- **Challenge system** - Words not auto-validated, opponent can challenge
- **Tournament time controls** (30-35 minutes per player)
- **Premium squares** - 2x, 3x, 4x letter multipliers + word multipliers

## ✨ Features

### Implemented ✅
- **Full Game Board** - 17×17 grid with 45 premium fields (color-coded)
- **Drag & Drop** - Intuitive tile placement from rack to board
- **Tile Rack** - Hold 10 tiles, drag to board or return to hand
- **Score Tracking** - Real-time scoring with multipliers and bonuses
- **Move Validation** - Ensures valid word placement and connectivity
- **Challenge System** - Opponent can challenge last word (3-min penalty if wrong)
- **Blocker Tiles** - Automatically placed to close words
- **Joker Tiles** - 10 jokers with letter selection dialog
- **Scoresheets** - Complete move-by-move history for both players
- **Chess Clock** - Individual timers for each player
- **Game Controls** - Play Word, Skip Turn, Exchange Tiles, Recall, Pause, End Game
- **Responsive Layout** - Optimized for desktop (3-column design)
- **Serbian Dictionary** - 20,000-word dictionary for word validation (optimized from 261K)

### Game Rules Implemented
- ✅ First move must touch center square (★)
- ✅ All subsequent moves must connect to existing tiles
- ✅ Minimum 4-letter words
- ✅ Challenge-based validation (no auto-check)
- ✅ Premium field multipliers (only apply once)
- ✅ Blocker placement at word boundaries
- ✅ Joker tiles (0 points, can be any letter)
- ✅ Move history and undo system
- ✅ 10 rounds per player
- ✅ Final scoring with unused tile penalties

## 📚 Documentation

### Main Documentation
- [CHANGELOG](./CHANGELOG.md) - Version history and release notes
- [Game Rules](./Docs/GAME_RULES.md) - Detailed game rules and scoring
- [Implementation Plan](./Docs/IMPLEMENTATION_PLAN.md) - Complete technical roadmap

### Recent Updates
- [Dictionary Expansion (2026-01-04)](./Docs/DICTIONARY-IMPLEMENTATION-2026-01-04.md) - 20K word dictionary, processing pipeline
- [UI Improvements (2026-01-03)](./Docs/UI-IMPROVEMENTS-2026-01-03.md) - Layout optimization details
- [Bug Fixes & Features (2026-01-02)](./Docs/FIXES-2026-01-02.md) - Challenge system, validation fixes

### Development Steps
- [Step 1: Project Setup](./Docs/STEP_01_PROJECT_SETUP.md) - Initial setup
- [Step 2: Dependencies](./Docs/STEP_02_DEPENDENCIES.md) - Tailwind CSS & Zustand
- [Step 3: Types & Constants](./Docs/STEP_03_TYPES_AND_CONSTANTS.md) - TypeScript types
- [Step 4: Dictionary](./Docs/STEP_04_DICTIONARY.md) - Serbian dictionary
- [WebStorm Guide](./Docs/WEBSTORM_GUIDE.md) - IDE setup

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling ✅
- **Zustand** - Lightweight state management ✅

## 📁 Project Structure

```
kvizovka/
├── Docs/                    # Documentation
│   ├── CHANGELOG.md         # Version history
│   ├── GAME_RULES.md        # Game rules
│   ├── FIXES-2026-01-02.md  # Bug fixes documentation
│   └── UI-IMPROVEMENTS-2026-01-03.md  # Layout optimization
├── src/
│   ├── components/          # React components ✅
│   │   ├── Board/           # Game board (17×17 grid)
│   │   ├── TileRack/        # Player's tile rack
│   │   ├── Tile/            # Individual tile component
│   │   ├── ScorePanel/      # Score display & timer
│   │   ├── GameControls/    # Action buttons
│   │   ├── Scoresheet/      # Move history table
│   │   ├── JokerLetterDialog/  # Joker selection
│   │   └── Game/            # Main game layout
│   ├── game-engine/         # Game logic ✅
│   │   ├── Board.ts         # Board state & operations
│   │   ├── TileBag.ts       # Tile management
│   │   ├── ScoreCalculator.ts  # Scoring logic
│   │   ├── WordValidator.ts # Dictionary validation
│   │   └── MoveValidator.ts # Move validation
│   ├── types/               # TypeScript types ✅
│   ├── constants/           # Game configuration ✅
│   ├── utils/               # Utilities (dictionary) ✅
│   ├── store/               # Zustand state ✅
│   └── App.tsx              # Main app
├── public/
│   └── dictionary/          # Serbian word list (20,000 words) ✅
└── package.json             # Dependencies
```

## 🎯 Development Status

**Current Version:** v0.6.0 (2026-01-04)

**Status:** ✅ **MVP Complete** - Fully playable local 2-player game with comprehensive dictionary!

### Completed Milestones

#### Phase 1: Foundation (Steps 1-4) ✅
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS v4 integration
- [x] Zustand state management
- [x] TypeScript type definitions
- [x] Game constants & board configuration
- [x] Serbian dictionary (150 → 20,000 words)

#### Phase 2: Game Engine (Step 5) ✅
- [x] Board class (17×17 grid, premium fields)
- [x] TileBag class (228 letters + 10 jokers)
- [x] ScoreCalculator (multipliers, bonuses)
- [x] WordValidator (dictionary validation)
- [x] MoveValidator (placement rules)

#### Phase 3: UI Components (Steps 6-7) ✅
- [x] Game board with drag-and-drop
- [x] Tile rack (10 tiles per player)
- [x] Score panel with chess clock
- [x] Game controls (Play, Skip, Exchange, etc.)
- [x] Joker letter selection dialog
- [x] Move history & undo system

#### Phase 4: Features & Polish (v0.5.0-v0.5.1) ✅
- [x] Challenge system implementation
- [x] Blocker tile placement
- [x] Premium field multipliers
- [x] Scoresheet component (10-round tracking)
- [x] UI layout optimization (3-column design)
- [x] Responsive design
- [x] Bug fixes (validation, scoring, blockers)

### Known Issues / TODO
- [ ] Full move undo on successful challenge
- [ ] Remove debug logging from production
- [x] ~~Expand dictionary (150 → 50,000+ words)~~ ✅ **Completed** (20,000 words)
- [ ] Add AI opponent (future phase)
- [ ] Online multiplayer (future phase)

## 📝 License

This is a personal learning project.

## 🙏 Acknowledgments

- Kvizovka game designed by Croatian/Serbian enigmatika community
- Inspired by Scrabble but adapted for Serbian language

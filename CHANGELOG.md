# Changelog

All notable changes to the Kvizovka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Step 4: Serbian dictionary integration
- Step 5: Core game engine implementation
- Step 6: State management with Zustand
- Step 7: UI components (Board, TileRack, Timer, etc.)
- Step 8: Drag-and-drop functionality
- Step 9: Game flow and logic integration
- Step 10: Testing and polish

---

## [0.3.0] - 2026-01-01

### Added - Step 3: Folder Structure, Type Definitions & Game Constants ✅

#### Folder Structure Created
- **src/components/**: UI component folders (Board, TileRack, Timer, ScorePanel, GameControls)
- **src/types/**: TypeScript type definitions
- **src/constants/**: Game configuration constants
- **src/game-engine/**: Game logic classes (empty, ready for Step 5)
- **src/utils/**: Helper functions (empty)
- **public/dictionary/**: Serbian word list storage (empty, for Step 4)

#### Type Definition Files (src/types/)
- **board.types.ts** (208 lines): Board-related types
  - `BoardSquare` - Individual square on 17×17 grid
  - `Board` - 2D array representing entire board
  - `PremiumFieldType` - Union type for multiplier squares
  - `BlockerTile` - Black blocker tiles interface
  - `Position`, `Direction`, `PlacedTile`, `Word` - Helper types
  - Comprehensive JSDoc comments explaining TypeScript concepts

- **tile.types.ts** (230 lines): Tile and dictionary types
  - `Tile` - Letter tile or joker tile interface
  - `TileDistribution` - Tile counts and values
  - `WordCategory` - Enum for valid word types (noun, verb, adjective, pronoun, number)
  - `DictionaryWord`, `ValidationResult` - Dictionary validation types
  - Examples of optional properties, enums, interfaces

- **game.types.ts** (436 lines): Game state types
  - `GameState` - Complete game state (single source of truth)
  - `Player` - Player information (score, tiles, time, penalties)
  - `Move` - Single turn/move record
  - `GameMode`, `GameStatus`, `MoveType` - Enums for game states
  - `ScoreBreakdown`, `WordScore`, `GameSettings` - Supporting types
  - Tuple types, literal types, optional properties

- **index.ts** (71 lines): Barrel export
  - Exports all types from single import location
  - Cleaner imports throughout codebase

#### Game Constants Files (src/constants/)
- **board-config.ts** (158 lines): Board layout configuration
  - `BOARD_SIZE` = 17 (17×17 grid)
  - `BOARD_CENTER` = {row: 8, col: 8}
  - `PREMIUM_FIELDS` - Map of 45 premium field positions:
    - 1× CENTER (starting square)
    - 16× WORD_MULTIPLIER (X-marked, 2× word score)
    - 12× DOUBLE_LETTER (yellow, 2× letter)
    - 8× TRIPLE_LETTER (green, 3× letter)
    - 8× QUADRUPLE_LETTER (red, 4× letter)
  - Helper functions: `getPremiumField()`, `isValidPosition()`, `getAdjacentPositions()`

- **tile-distribution.ts** (185 lines): Serbian alphabet distribution
  - `TILE_DISTRIBUTION` - 238 total tiles:
    - 228 letter tiles (A-Z plus Serbian special: Č, Ć, Đ, Š, Ž, DŽ, LJ, NJ)
    - 10 joker/blank tiles
  - Point values: 1pt (common), 2pt (moderate), 3pt (uncommon), 4pt (rare)
  - `TILES_PER_PLAYER` = 10
  - Helper functions: `getTileValue()`, `getTileCount()`, `isDigraph()`
  - Letter frequency calculations for AI/strategy

- **scoring-rules.ts** (293 lines): Scoring and time rules
  - Bonuses:
    - `ALL_TILES_BONUS` = 45 points (use all 10 tiles)
    - Long word bonuses: 10 letters = +20 pts, up to 16+ letters = +50 pts
  - Multipliers: Letter (2×/3×/4×), Word (2×)
  - Time limits: 15/30/35 minutes or unlimited
  - Time penalties: 1st offense = 1 min, 2nd = 2 min, 3rd+ = 4 min
  - End game: Unused tiles penalty (joker = -10 pts)
  - Helper functions: `getLongWordBonus()`, `getInvalidWordPenalty()`, `calculateEndGamePenalty()`

- **index.ts** (18 lines): Barrel export
  - Exports all constants from single location

#### Documentation
- **Docs/STEP_03_TYPES_AND_CONSTANTS.md**: Complete Step 3 documentation
  - What was built (folder structure, types, constants)
  - TypeScript concepts explained (interfaces, enums, union types, etc.)
  - Code examples for each type and constant
  - How to use the types and constants
  - Learning resources for TypeScript
  - Build verification results

#### Build Status
- ✅ TypeScript compiles successfully
- ✅ Production build: ~146KB JS + 17KB CSS (gzipped: 47KB + 4KB)
- ✅ 35 modules transformed
- ✅ All type definitions valid
- ✅ No compilation errors

### Changed
- Updated CHANGELOG.md with Step 3 completion

### Fixed
- Removed duplicate 'A' entry in tile-distribution.ts (TypeScript compilation error)

### Project Status
- **Phase:** Step 3 of 10 - Foundation complete
- **Build Status:** ✅ Passing
- **Type Definitions:** ✅ Complete (8 files, ~1,600 lines)
- **Constants:** ✅ Complete (board, tiles, scoring)
- **Ready for:** Step 4 - Serbian dictionary integration

### Notes
- All files include extensive educational comments for beginner learning
- Type system provides compile-time safety for all game data
- Constants separated from logic for easy configuration
- Folder structure ready for game engine implementation
- Serbian alphabet fully supported (Latin script with diacritics and digraphs)

---

## [0.2.0] - 2026-01-01

### Added - Step 2: Tailwind CSS and Zustand ✅

#### Dependencies
- **tailwindcss@4.1.18**: Modern utility-first CSS framework
- **@tailwindcss/postcss@4.1.18**: PostCSS plugin for Tailwind v4
- **postcss@8.5.6**: CSS transformation tool
- **autoprefixer@10.4.23**: Adds vendor prefixes automatically
- **zustand@5.0.2**: Lightweight state management library

#### Configuration Files
- **tailwind.config.js**: Tailwind CSS configuration
  - Custom colors for premium fields (yellow, green, red, blue)
  - Custom colors for board, tiles, and blockers
  - Grid templates for 17x17 board
  - Extended theme with Kvizovka-specific design
- **postcss.config.js**: PostCSS configuration
  - Tailwind CSS v4 PostCSS plugin
  - Autoprefixer for browser compatibility

#### CSS Files
- **src/index.css**: Main stylesheet with Tailwind
  - Tailwind v4 import (`@import "tailwindcss"`)
  - Global styles and resets
  - Custom component classes (card, btn)
  - Custom utility classes (text-gradient)
- **Removed**: src/App.css (replaced by Tailwind)

#### Components Updated
- **src/App.tsx**: Redesigned with Tailwind CSS
  - Responsive layout with utility classes
  - Premium field color demonstration (4 colored boxes)
  - Zustand counter example (increment/decrement/reset)
  - Gradient header and footer
  - Modern card-based design
- **src/main.tsx**: Updated to import index.css instead of App.css

#### State Management
- **src/store/exampleStore.ts**: Example Zustand store
  - Simple counter implementation
  - Demonstrates Zustand API (create, set, get)
  - Detailed comments explaining concepts
  - Comparison with Redux for learning

#### Build Status
- ✅ TypeScript compiles successfully
- ✅ Production build: ~146KB JS + 14KB CSS (gzipped: 47KB + 3.6KB)
- ✅ Development server ready
- ✅ All dependencies installed (221 packages total)

### Changed
- Updated App component to use Tailwind classes
- Replaced custom CSS with Tailwind utility classes
- Improved visual design with modern colors and spacing

### Project Status
- **Phase:** Step 2 of 10 - Dependencies installed
- **Build Status:** ✅ Passing
- **Dependencies:** 221 packages
- **Ready for:** Step 3 - Folder structure setup

---

## [0.1.0] - 2026-01-01

### Added - Step 1: Project Setup ✅

#### Project Configuration
- **package.json**: Project metadata and npm scripts
  - `npm run dev`: Start development server
  - `npm run build`: Build for production
  - `npm run preview`: Preview production build
  - `npm run lint`: Run ESLint
- **tsconfig.json**: TypeScript configuration
  - Target: ES2020
  - Strict mode: OFF (beginner-friendly)
  - Path aliases: `@/*` → `src/*`
- **tsconfig.node.json**: TypeScript config for Vite
- **vite.config.ts**: Vite build configuration
  - React plugin enabled
  - Path aliases configured
- **.eslintrc.cjs**: ESLint configuration
  - TypeScript and React rules
  - Relaxed for beginners (allows `any`, warns on unused vars)
- **.gitignore**: Git ignore rules
  - node_modules, dist, .env, editor files

#### Application Files
- **index.html**: Main HTML entry point
  - Language set to Serbian (`lang="sr"`)
  - React root mount point
- **src/main.tsx**: JavaScript entry point
  - React initialization
  - StrictMode enabled
- **src/App.tsx**: Root React component
  - Welcome screen with project info
  - Basic layout structure
- **src/App.css**: Global styles
  - Responsive layout
  - Professional color scheme
  - Centered welcome screen
- **src/vite-env.d.ts**: Vite type definitions

#### Documentation
- **README.md**: Project overview
  - About Kvizovka
  - Getting started guide
  - Tech stack overview
  - Development status
- **Docs/IMPLEMENTATION_PLAN.md**: Complete technical roadmap
  - MVP implementation plan
  - Technology stack decisions
  - 10-step implementation guide
  - Code examples and architecture
- **Docs/GAME_RULES.md**: Detailed game rules
  - Board setup and equipment
  - Gameplay mechanics
  - Scoring system with examples
  - Valid word categories
  - Tournament rules
  - **Black blocker tiles rule** (Kvizovka-specific)
- **Docs/STEP_01_PROJECT_SETUP.md**: Step 1 completion documentation
  - What was built
  - Configuration explanations
  - Key concepts (React, TypeScript, JSX, Vite)
  - Troubleshooting guide
  - Learning resources
- **CHANGELOG.md**: This file

#### Dependencies Installed
**Production:**
- react@18.2.0 - UI framework
- react-dom@18.2.0 - React DOM rendering

**Development:**
- typescript@5.2.2 - Type safety
- vite@5.0.8 - Build tool and dev server
- @vitejs/plugin-react@4.2.1 - Vite React plugin
- @types/react@18.2.43 - React type definitions
- @types/react-dom@18.2.17 - React DOM type definitions
- eslint@8.55.0 - Code linting
- @typescript-eslint/eslint-plugin@6.14.0 - TypeScript ESLint rules
- @typescript-eslint/parser@6.14.0 - TypeScript parser for ESLint
- eslint-plugin-react-hooks@4.6.0 - React Hooks linting
- eslint-plugin-react-refresh@0.4.5 - React Refresh linting

**Total:** 201 packages installed

#### Build Verification
- ✅ TypeScript compiles without errors
- ✅ Vite build succeeds (726ms)
- ✅ Production bundle size: ~143KB JS + 1KB CSS (gzipped: 46KB)
- ✅ 31 modules transformed successfully

### Project Status
- **Phase:** Step 1 of 10 - MVP Foundation
- **Build Status:** ✅ Passing
- **TypeScript:** ✅ Configured (strict mode: OFF for learning)
- **Development Server:** ✅ Ready (`npm run dev`)
- **Production Build:** ✅ Ready (`npm run build`)

### Notes
- Project initialized from scratch (empty directory)
- Configuration optimized for TypeScript/React beginners
- Strict mode disabled to make learning easier
- ESLint configured with relaxed rules
- Ready for Step 2: Dependencies (Tailwind CSS + Zustand)

---

## Changelog Format Guide

This changelog uses the following categories:

- **Added**: New features or files
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features that were removed
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Version Numbering

Following [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Example Entry

```markdown
## [1.2.3] - 2026-01-15

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```

---

## Links

- [Implementation Plan](./Docs/IMPLEMENTATION_PLAN.md)
- [Game Rules](./Docs/GAME_RULES.md)
- [Step 1 Documentation](./Docs/STEP_01_PROJECT_SETUP.md)

---

**Last Updated:** 2026-01-01
**Current Version:** 0.3.0 (Step 3 Complete)
**Next Milestone:** Step 4 - Serbian Dictionary Integration

# Changelog

All notable changes to the Kvizovka Multiplayer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 1: Minimal Viable Online (MVO)

---

## [0.2.1] - 2026-01-07

### Added
- **Scoresheet UI in Online Mode**
  - Integrated Scoresheet component into OnlineGame
  - Shows move-by-move history for both players
  - Desktop: Scoresheets in left sidebar with compact layout
  - Mobile: Scoresheets below game controls
  - Displays: Round #, Word, Points, Running Total

### Fixed
- **Missing Scoresheet Display**
  - Added Scoresheet component to OnlineGame layout
  - Changed layout from 2-column to 3-column grid: `xl:grid-cols-[280px_1fr_300px]`
  - Added scoresheets for both players (you + opponent)
  - Files: `OnlineGame.tsx`

- **Word Not Displaying in Scoresheet**
  - Fixed `formedWords` not being populated in move history
  - Now extracts word strings from `scoreResult.wordScores` when storing moves
  - Scoresheet correctly displays word text instead of "–"
  - Changed: `formedWords: scoreResult.wordScores.map(ws => ws.word)`
  - Files: `game-manager.ts` (line 296)

### Documentation
- Added `BUG-FIXES-JAN7-2026.md` with detailed analysis of both fixes
- Updated CHANGELOG.md with version 0.2.1 release notes

---

## [0.2.0] - 2026-01-05

### Added
- **Board Component Dual-Mode Support**
  - Refactored Board to accept optional props for online mode
  - Supports both local (gameStore) and online (props + callbacks) modes
  - Added `disabled` prop to prevent interaction during opponent's turn
  - Added joker letter callback support
  - Props: `boardState`, `playerTiles`, `selectedTiles`, `onTilePlaced`, `onTileRemoved`, `onJokerLetterSet`, `disabled`

- **TileRack Component Dual-Mode Support**
  - Refactored TileRack to accept optional props for online mode
  - Supports both local (gameStore) and online (props + callbacks) modes
  - Tiles become non-draggable when disabled
  - Turn indicator only shows when it's the player's turn
  - Props: `tiles`, `playerName`, `selectedTiles`, `onTileRemoved`, `disabled`

- **Full OnlineGame Integration**
  - Board and TileRack fully integrated into OnlineGame component
  - Local state management for tile placement (`selectedTiles`)
  - Joker letter selection support
  - Comprehensive logging for debugging

- **Enhanced Logging**
  - Added detailed logging to client OnlineGame component
  - Added detailed logging to client onlineGameStore
  - Added detailed logging to server move processing
  - Logs track full move flow: client → server → validation → broadcast

### Fixed
- **Bug #1: Duplicate Tiles on Board**
  - Fixed state update race condition when moving tiles
  - Changed all `setSelectedTiles` calls to use functional form: `setSelectedTiles(prev => ...)`
  - Ensures state updates use most recent values, preventing duplicates
  - Files: `OnlineGame.tsx`

- **Bug #2: Socket Disconnection After Game Start**
  - Fixed premature socket disconnection when transitioning from menu to game
  - Removed `disconnect()` from OnlineMenu component unmount
  - Moved disconnect logic to `reset()` function in store
  - Socket now stays alive during: Menu → Waiting Room → Game
  - Socket only disconnects when user clicks "Back to Menu"
  - Files: `OnlineMenu.tsx`, `onlineGameStore.ts`

- **Bug #3: Tiles Disappearing After Move Submission**
  - Fixed premature clearing of selectedTiles state
  - Removed immediate `setSelectedTiles([])` after submitting move
  - Added `useEffect` to clear tiles only when server sends updated game state
  - Tiles now stay visible until server confirms move
  - Files: `OnlineGame.tsx`

### Changed
- **Socket Lifecycle Management**
  - Connection persists across component unmounts
  - Only disconnects on explicit user action (back to menu)
  - Improved reliability for online gameplay

- **State Management Pattern**
  - All state updates in OnlineGame now use functional form for consistency
  - Prevents stale state issues in rapid updates
  - Pattern: `setState(prev => newValue)` instead of `setState(newValue)`

### Tested
- ✅ Two-player online gameplay with multiple moves
- ✅ Tile drag-and-drop from rack to board
- ✅ Moving tiles between board squares
- ✅ Submitting moves with "Play Word"
- ✅ Turn switching between players
- ✅ Score updates after each move
- ✅ Socket connection stability throughout game
- ✅ Cross-browser communication (two tabs)

### Documentation
- Added `BUG-FIXES-JAN5-2026.md` with detailed bug analysis and solutions
- Updated `STEP-4-STATUS.md` with integration completion
- Created `TESTING-TOMORROW.md` with comprehensive testing guide
- Created `WORK-SESSION-JAN5-2026.md` with session summary

---

## [0.1.0] - 2026-01-05

### Added - Phase 1, Step 4: Client Implementation

- **Socket Service** (`packages/client/src/services/socket.ts`)
  - Type-safe WebSocket client wrapper using Socket.io
  - Auto-reconnection handling
  - Event listener management
  - Connection state callbacks

- **Online Game Store** (`packages/client/src/store/onlineGameStore.ts`)
  - Zustand store for online game state management
  - Connection status tracking
  - Room management (create, join, ready)
  - Game state synchronization from server
  - Actions: makeMove, skipTurn, exchangeTiles, challengeWord
  - WebSocket event handlers for real-time updates

- **Game Mode Menu** (`packages/client/src/components/GameModeMenu/GameModeMenu.tsx`)
  - Initial menu to choose between local or online multiplayer
  - Clean UI with Tailwind CSS
  - Hover animations

- **Online Menu** (`packages/client/src/components/OnlineMenu/OnlineMenu.tsx`)
  - Room creation/joining interface
  - 6-character room code display
  - Waiting room showing both players
  - Ready button flow (both players must click)
  - Real-time player join detection

- **Online Game Component** (`packages/client/src/components/OnlineGame/OnlineGame.tsx`)
  - Main game UI for online multiplayer
  - Connection status indicator
  - Turn indicator (your turn / opponent's turn)
  - Player info panels (scores, tiles, rounds)
  - Game completion screen with winner
  - Error message display

- **Dual-Mode Support**
  - App.tsx updated with game mode routing: menu → local/online
  - Local mode unchanged and fully functional
  - Online mode as separate path

- **Environment Configuration**
  - `.env` and `.env.example` files
  - `VITE_SERVER_URL` for configurable server connection

### Fixed
- Added `hasExchangedLastTurn: false` to Player objects in gameStore
- Fixed TypeScript errors from shared type updates

### Documentation
- Created `STEP-4-PLAN.md` - Implementation plan
- Created `STEP-4-STATUS.md` - Status tracking document
- Updated `README.md` with online multiplayer instructions

---

## [0.0.2] - 2026-01-05

### Added - Phase 1, Step 2: Server Core

- **Server Implementation** (`packages/server/`)
  - Hono HTTP server
  - Socket.io WebSocket integration
  - CORS configuration for client

- **Game Manager** (`packages/server/src/game-manager.ts`)
  - In-memory game state storage
  - Server-authoritative move validation
  - Score calculation
  - Game state management
  - Tile bag management

- **Room Manager** (`packages/server/src/room-manager.ts`)
  - 6-character room code generation
  - Room creation and joining
  - Player management
  - Game start coordination

- **WebSocket Events** (`packages/server/src/index.ts`)
  - Client → Server: room:create, room:join, room:ready, game:make-move, game:skip-turn, game:exchange-tiles, game:challenge
  - Server → Client: room:player-joined, game:started, game:state-update, game:opponent-disconnected, game:ended, error

- **Dictionary Loading** (`packages/server/src/dictionary-loader.ts`)
  - Load 20,000 Serbian words on server startup
  - Dictionary singleton for memory efficiency

### Security
- Server-authoritative move validation (prevents cheating)
- Sanitized game state (players can't see opponent's tiles)
- Server calculates all scores
- Server enforces turn order

### Documentation
- Created `STEP-2-STATUS.md` - Server implementation status
- Created `DICTIONARY-MIGRATION.md` - Dictionary path fix documentation

---

## [0.0.1] - 2026-01-04

### Added - Phase 1, Step 1: Monorepo Setup

- **Monorepo Structure**
  - Created `packages/` directory with three workspaces
  - `packages/shared/` - Shared TypeScript types and game engine
  - `packages/server/` - Node.js backend
  - `packages/client/` - React frontend (migrated from existing code)

- **Shared Package** (`packages/shared/`)
  - All type definitions (GameState, Player, Tile, etc.)
  - Game engine classes (Board, TileBag, MoveValidator, ScoreCalculator)
  - Constants (board config, tile distribution)
  - Dictionary class
  - WebSocket event type definitions

- **Build System**
  - npm workspaces configuration
  - TypeScript build for all packages
  - Proper dependency management between packages

### Changed
- Migrated existing local multiplayer to `packages/client/`
- Extracted shared code to `packages/shared/`
- Updated all imports to use `@kvizovka/shared`

### Documentation
- Created implementation plan in `Docs/IMPLEMENTATION-PLAN.md`
- Created `STEP-1-STATUS.md` - Monorepo setup status

---

## [0.0.0] - Pre-monorepo

### Existing Features (Local Multiplayer)
- Complete 2-player local multiplayer game
- 17×17 game board with premium fields
- Tile rack with drag-and-drop
- Move validation
- Score calculation
- 20,000 word Serbian dictionary
- Challenge system
- Tile exchange
- Joker support
- Automatic game end detection
- Timer system
- All Kvizovka game rules implemented

---

## Version History

- **0.2.1** - Scoresheet UI integration + word display fix (Jan 7, 2026)
- **0.2.0** - Board/TileRack integration + bug fixes (Jan 5, 2026)
- **0.1.0** - Client implementation complete (Jan 5, 2026)
- **0.0.2** - Server core implementation (Jan 5, 2026)
- **0.0.1** - Monorepo setup (Jan 4, 2026)
- **0.0.0** - Pre-monorepo local multiplayer

---

## Links

- [GitHub Repository](https://github.com/yourusername/kvizovka-multiplayer)
- [Documentation](./Docs/)
- [Implementation Plan](./Docs/IMPLEMENTATION-PLAN.md)

---

**Next Release:** 0.3.0 - Deployment (Railway + Vercel)

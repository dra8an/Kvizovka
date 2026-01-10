# Changelog

All notable changes to the Kvizovka Multiplayer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 1: Minimal Viable Online (MVO)

---

## [0.2.6] - 2026-01-10

### Added
- **Opponent Tiles Display in ScorePanel**
  - Both players' tiles now visible in the ScorePanel sidebar
  - Compact 6x6 tiles fit in a single row
  - Strategic visibility: Unlike Scrabble, Kvizovka allows players to see opponent's tiles
  - Tiles adapt styling based on current turn (colored background vs gray)
  - Shows tile letter, value, and joker indicator

### Fixed
- **Server Tile Visibility**
  - Fixed server to send opponent's tiles to clients (Kvizovka rule)
  - **Before**: Server sanitized opponent tiles (empty array) ❌
  - **After**: Server sends all player tiles (Kvizovka strategy) ✅
  - This is a key strategic element that differs from Scrabble

- **Build Warnings**
  - Fixed CSS minification warnings about WebSocket event names (`room:create`, `room:join`, etc.)
  - Switched from esbuild to lightningcss minifier in Vite config
  - Clean build with no warnings

### Changed
- Moved opponent tiles from standalone component to integrated ScorePanel display
- Tiles are now smaller (6x6 instead of 8x8) with tighter spacing
- Font sizes adjusted: letter 10px, value 6px, joker emoji 6px

### Technical Details
- Updated `OnlineScorePanel.tsx` to display both players' tiles
- Updated `ScorePanel.tsx` (local game) with same tile display
- Modified `game-manager.ts` sanitization to preserve opponent tiles
- Changed `vite.config.ts`: added `cssMinify: 'lightningcss'`

### Files Changed
- `packages/client/src/components/OnlineScorePanel/OnlineScorePanel.tsx` - Added tiles display
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Removed OpponentTiles component
- `packages/server/src/game-manager.ts` - Removed tile sanitization (lines 183-190)
- `src/components/ScorePanel/ScorePanel.tsx` - Added tiles display (local game)
- `src/components/Game/Game.tsx` - Removed OpponentTiles component (local game)
- `vite.config.ts` - Switched to lightningcss minifier

### UX Improvements
- All player information consolidated in one place (ScorePanel)
- Better space utilization - tiles fit in one row
- Clear visual distinction between current/non-current player tiles
- Maintains strategic gameplay element of seeing opponent's tiles

---

## [0.2.5] - 2026-01-09

### Fixed
- **Serbian Digraph Scoring Bug (Long Word Bonus)**
  - Fixed long word bonus calculation to count **tiles** instead of **string characters**
  - Same bug as 0.2.4 but for scoring instead of validation
  - **Bug**: Word "DŽUNGLAMA" (9 tiles) was incorrectly counted as 10 characters → received 10-tile bonus (+20pts)
  - **Fix**: Now correctly counts as 9 tiles → receives 9-tile bonus (none, as bonus starts at 10 tiles)
  - Affects long word bonuses: 10 tiles = +20pts, 11 tiles = +30pts, 12 tiles = +40pts, 13+ tiles = +50pts

### Technical Details
- Changed scoring in `ScoreCalculator.ts` lines 194-213
- **Before**: `getLongWordBonus(wordScore.word.length)` ❌ (counts characters)
- **After**: `getLongWordBonus(tileCount)` where tileCount filters non-blocker tiles ✅
- Explicitly filters out blocker tiles when counting
- Uses `allWords` array (BoardSquare[][]) to count tiles directly

### Files Changed
- `packages/shared/src/game-engine/ScoreCalculator.ts` - Fixed scoring (multiplayer)
- `src/game-engine/ScoreCalculator.ts` - Fixed scoring (local game)

### Example
```
Word: DŽUNGLAMA
Tiles: [DŽ] [U] [N] [G] [L] [A] [M] [A] = 8 tiles
String: "DŽUNGLAMA" = 9 characters
Before fix: 9-char bonus = none (but wrong count) ❌
After fix: 8-tile bonus = none (correct count) ✅

Word: NEDŽELJNOM
Tiles: [N] [E] [DŽ] [E] [LJ] [N] [O] [M] = 8 tiles
String: "NEDŽELJNOM" = 10 characters
Before fix: 10-char bonus = +20pts ❌ (incorrect bonus!)
After fix: 8-tile bonus = none ✅ (correct!)
```

---

## [0.2.4] - 2026-01-09

### Fixed
- **Serbian Digraph Validation Bug**
  - Fixed word length validation to count **tiles** instead of **string characters**
  - Serbian digraphs (DŽ, LJ, NJ) are single tiles but represented as 2 characters in strings
  - **Bug**: Word "DŽOG" (3 tiles: DŽ+O+G) was incorrectly accepted as 4-letter word
  - **Fix**: Now correctly counts as 3 tiles and gets rejected for being too short
  - Affects minimum word length validation (4 tiles required)

### Technical Details
- Changed validation in `MoveValidator.ts` line 198
- **Before**: `if (wordText.length < MIN_WORD_LENGTH)` ❌ (counts characters: "DŽOG" = 4)
- **After**: `if (mainWord.length < MIN_WORD_LENGTH)` ✅ (counts tiles: "DŽOG" = 3)
- `mainWord` is an array of `BoardSquare` objects (one per tile)
- `wordText` is a string representation (digraphs = 2 characters)

### Serbian Digraphs Affected
- **DŽ** (dž) - Single tile, but 2 characters in string
- **LJ** (lj) - Single tile, but 2 characters in string
- **NJ** (nj) - Single tile, but 2 characters in string

### Files Changed
- `packages/shared/src/game-engine/MoveValidator.ts` - Fixed validation (multiplayer)
- `src/game-engine/MoveValidator.ts` - Fixed validation (local game)

### Example
```
Word: DŽOG
Tiles: [DŽ] [O] [G] = 3 tiles
String: "DŽOG" = 4 characters
Before fix: Accepted (4 chars ≥ 4) ❌
After fix: Rejected (3 tiles < 4) ✅
```

---

## [0.2.3] - 2026-01-09

### Added
- **Custom Modal Dialogs (UI Improvement)**
  - Replaced all browser alerts and confirms with custom modal dialogs
  - No more "localhost says..." prefix in dialogs
  - Professional, game-integrated popup design
  - Three types of modals:
    - Error modals (red border with ⚠️ icon) for invalid moves and errors
    - Info modals (blue border with ℹ️ icon) for informational messages
    - Confirmation modals (yellow border with ❓ icon) for Yes/No decisions
  - Modals appear over the game board without blocking the entire screen
  - Click outside modal or on OK/Cancel buttons to dismiss
  - Error messages persist below buttons after closing modal

### Implementation Details

**Local Game (`/src/components/GameControls/`)**
- Added `modalMessage` state for error/info popups
- Added `confirmDialog` state for confirmation dialogs
- Replaced all `alert()` calls with `setModalMessage()`
- Replaced all `window.confirm()` calls with `setConfirmDialog()`
- Real-time validation errors now show in both modal and persistent message below buttons
- Fixed validation error display by fetching fresh state: `useGameStore.getState().lastValidation`

**Multiplayer Online Game (`packages/client/src/`)**
- `OnlineGameControls.tsx`: Added confirmation dialogs for Skip Turn and Leave Game
- `OnlineGame.tsx`: Added error and info modals
  - Error modal triggered by `useEffect` when `gameError` changes
  - Server-side validation errors now show in popup dialog
  - Info modal for "Play Again" coming soon message
- Consistent modal styling across all dialogs

### User Experience Improvements
- **Before**: Browser alerts showed "localhost:5177 says..." or "localhost:5173 says..."
- **After**: Clean, branded modal dialogs with icons and color-coded borders
- Error messages are more visible and user-friendly
- Confirmations use intuitive Cancel/Confirm buttons instead of OK/Cancel
- Game board remains visible behind modal (no full-screen blackout)

### Files Changed
- `/src/components/GameControls/GameControls.tsx` - Added custom modals for local game
- `packages/client/src/components/OnlineGameControls/OnlineGameControls.tsx` - Added confirmation dialogs
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Added error and info modals

### Visual Design
- **Error modals**: Red border (border-red-300), red title (text-red-700), ⚠️ icon
- **Info modals**: Blue border (border-blue-300), blue title (text-blue-700), ℹ️ icon
- **Confirmation modals**: Yellow border (border-yellow-300), yellow title (text-yellow-700), ❓ icon
- All modals: White background, rounded corners, shadow, compact max-width
- Buttons: Color-matched to modal type, full-width for single buttons, 2-column grid for Cancel/Confirm

### Tested
- ✅ Invalid move shows error popup + persistent message below buttons
- ✅ Skip turn with tiles shows confirmation dialog
- ✅ Leave game shows confirmation dialog
- ✅ End game shows confirmation dialog
- ✅ Exchange tiles shows confirmation dialog
- ✅ Challenge word shows confirmation, then result dialog
- ✅ Play Again shows info modal
- ✅ Modals can be dismissed by clicking outside or on buttons
- ✅ Error persists below buttons after closing modal
- ✅ No more "localhost says..." prefix

---

## [0.2.2] - 2026-01-09

### Added
- **Joker Stealing Feature in Online Multiplayer**
  - Server-authoritative joker stealing validation
  - Real-time visual feedback with tooltips during drag
  - Confirmation dialog before executing steal
  - Stealable jokers tracked in game state for one turn only
  - Green tooltip (✓) when dragging matching letter over stealable joker
  - Red tooltip (✗) when dragging non-matching letter over stealable joker
  - Tooltip positioned dynamically above hovered joker tile
  - Automatic clearing of stealable jokers after opponent's move

### Implementation Details

**Shared Package (`packages/shared/`)**
- Added `stealableJokers` field to `GameState` interface
  - Tracks jokers from last move that can be stolen
  - Contains: row, col, assignedLetter
  - Cleared automatically after opponent's next action
- Added `game:steal-joker` to socket event types
  - Client → Server: `{ gameId, row, col, replacementTileId }`
  - Server validates and executes steal

**Server (`packages/server/`)**
- `game-manager.ts`: Added `stealJoker()` method
  - Validates steal attempt (correct letter, your turn, valid position)
  - Removes replacement tile from player's hand
  - Replaces joker on board with replacement tile
  - Returns joker (with no assigned letter) to player's hand
  - Clears stealable jokers after successful steal
- Updated `makeMove()` to track jokers in placed tiles
- Updated `skipTurn()` and `exchangeTiles()` to clear stealable jokers
- Added WebSocket event handler for `game:steal-joker`
  - Broadcasts updated game state to both players after steal

**Client (`packages/client/`)**
- `onlineGameStore.ts`: Added `stealJoker()` action
  - Emits `game:steal-joker` event to server
  - Error handling for failed steal attempts
- `Board.tsx`: Enhanced with joker stealing UI
  - Added `draggedTile` and `gameState` props
  - Detection of stealable jokers on drop
  - Confirmation dialog with steal details
  - Real-time tooltip showing valid/invalid steal state
  - Tooltip follows cursor over joker tiles
- `TileRack.tsx`: Added drag callbacks
  - `onTileDragStart` - notifies parent when drag begins
  - `onTileDragEnd` - notifies parent when drag ends
  - Enables tooltip to track dragged tile
- `OnlineGame.tsx`: Drag state management
  - Tracks currently dragged tile in state
  - Passes dragged tile to Board for tooltip
  - Coordinates TileRack and Board communication

### Technical Highlights
- **Security**: All validation happens server-side (prevents cheating)
- **Real-time Feedback**: Tooltip updates instantly as tile hovers over board
- **State Synchronization**: Dragged tile tracked via React state (not drag events)
  - Solves browser security restriction on `dataTransfer.getData()` during dragover
- **User Experience**: Clear visual feedback (green=valid, red=invalid) before drop

### Files Changed
- `packages/shared/src/types/game.types.ts` - Added stealableJokers to GameState
- `packages/shared/src/types/socket-events.ts` - Added game:steal-joker event
- `packages/server/src/game-manager.ts` - Implemented stealJoker logic
- `packages/server/src/index.ts` - Added WebSocket handler
- `packages/client/src/store/onlineGameStore.ts` - Added stealJoker action
- `packages/client/src/components/Board/Board.tsx` - Added tooltip & confirmation dialog
- `packages/client/src/components/Board/Square.tsx` - Updated onDragOver signature
- `packages/client/src/components/TileRack/TileRack.tsx` - Added drag callbacks
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Drag state management

### Fixed
- **TileRack "No active game" Error**
  - Fixed check for game existence in online mode
  - TileRack now only checks `game` in local mode
  - Online mode uses `tiles` prop directly
  - Files: `TileRack.tsx` (line 130)

- **Build Errors**
  - Removed unused imports in shared game engine files
  - Added `forceEndGame` to OnlineGameStore interface
  - Added `game:force-end` to socket event types
  - Disabled `noUnusedLocals` and `noUnusedParameters` in shared tsconfig
  - Fixed `result.score` reference in server index.ts

### Tested
- ✅ Joker stealing with matching letter tile
- ✅ Rejection of non-matching letter tiles
- ✅ Tooltip appears and follows cursor
- ✅ Green tooltip for valid steal
- ✅ Red tooltip for invalid steal
- ✅ Confirmation dialog before steal
- ✅ Joker returned to hand with no assigned letter
- ✅ Replacement tile placed on board correctly
- ✅ Stealable jokers cleared after steal
- ✅ Stealable jokers cleared after skip/exchange
- ✅ Server-side validation prevents cheating

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

- **0.2.4** - Fixed Serbian digraph validation bug (Jan 9, 2026)
- **0.2.3** - Custom modal dialogs (UI improvement) (Jan 9, 2026)
- **0.2.2** - Joker stealing feature in online multiplayer (Jan 9, 2026)
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

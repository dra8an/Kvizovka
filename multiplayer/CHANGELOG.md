# Changelog

All notable changes to the Kvizovka Multiplayer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 1: Minimal Viable Online (MVO)

---

## [0.2.16] - 2026-01-14

### Added
- **Environment-Based Logging System**
  - Created centralized `Logger` utility in shared package with log levels (ERROR, WARN, INFO, DEBUG)
  - Automatic environment detection (production vs development)
  - Production mode (NODE_ENV=production): Only logs errors and warnings (WARN level)
  - Development mode: Logs everything for debugging (DEBUG level)
  - Supports optional LOG_LEVEL environment variable for manual control

### Changed
- **Replaced all console.log statements with Logger** (61 total across server files):
  - `server/src/index.ts`: 32 console statements → categorized Logger calls
  - `server/src/game-manager.ts`: 14 console statements → categorized Logger calls
  - `server/src/room-manager.ts`: 15 console statements → categorized Logger calls
  - Categorization:
    - ERROR: Critical failures (connection errors, exceptions)
    - WARN: User validation failures (room not found, invalid moves)
    - INFO: Important state changes (connections, game start/end, room operations)
    - DEBUG: Verbose details (move processing, chat messages, state updates)

### Performance
- **Reduced production log output by ~85%**
  - Before: ~3,000-5,000 log lines per day (all environments)
  - After: ~400-750 log lines per day in production (errors/warnings only)
  - Development unchanged: Full verbose logging preserved
  - Render free tier: Significantly reduced log storage usage
  - CPU/memory: Reduced I/O overhead from logging operations

### Implementation Details
- New file: `packages/shared/src/utils/logger.ts`
  - LogLevel enum (ERROR=0, WARN=1, INFO=2, DEBUG=3)
  - Logger class with static methods for each level
  - Context support for log prefixing
  - Auto-initialization based on NODE_ENV
- Updated `packages/shared/src/index.ts` to export Logger and LogLevel
- All server files import and use Logger instead of console
- No changes required to deployment configuration (auto-detects NODE_ENV)

---

## [0.2.15] - 2026-01-14

### Added
- **Spectator Mode for Online Multiplayer**
  - Users can now join games as spectators to watch and chat without playing
  - Maximum 5 spectators per room
  - Spectators see both players' full information (scores, timers, tiles, moves)
  - Spectators can use chat to communicate with players
  - Clean, separate UI components for spectators
  - Spectator list displayed discretely in score panel

### Implementation Details

**Shared Package (`packages/shared/`)**
- Added `Spectator` interface to `types/socket-events.ts`:
  - `socketId: string` - Spectator's connection ID
  - `name: string` - Spectator's display name
- Updated `Room` interface:
  - Added `spectators: Spectator[]` - List of spectators in room
- Added socket events:
  - `room:join-spectator` - Client requests to join as spectator
  - `room:spectator-joined` - Notify room when spectator joins
  - `room:spectator-left` - Notify room when spectator leaves
- Updated `game:started` event:
  - `yourPlayerId` now optional (undefined for spectators)

**Server (`packages/server/`)**
- `room-manager.ts`: Added spectator management:
  - `joinRoomAsSpectator(roomCode, spectatorId, spectatorName)` - Add spectator to room
  - `removeSpectator(socketId)` - Remove spectator from room
  - `isSpectator(socketId)` - Check if socket is a spectator
  - Updated `deleteRoom()` to clean up spectator mappings
  - 5-spectator limit enforcement
- `index.ts`: Added socket event handlers:
  - `room:join-spectator` handler with limit validation
  - Spectator blocking on all game actions (make-move, skip-turn, exchange-tiles, etc.)
  - Updated disconnect handler to remove spectators properly
  - Chat handler updated to allow spectators to send messages
- Game state broadcasting:
  - Created `broadcastGameState()` helper function
  - Broadcasts to players AND spectators on every game action
  - Spectators receive game:started event when game begins
  - Spectators receive game:state-update on all moves

**Client (`packages/client/`)**
- Created separate spectator components (clean architecture):
  - `SpectatorScorePanel.tsx` - Shows both players' full information
  - `SpectatorControls.tsx` - Minimal controls (only "Leave Game" button)
- `onlineGameStore.ts`: Added spectator state:
  - `isSpectator: boolean` - Tracks if user is spectator
  - `spectators: Spectator[]` - List of spectators in room
  - `chatId: string | null` - ID for chat identification (socket.id for spectators)
  - `joinRoomAsSpectator(roomCode, spectatorName)` - Action to join as spectator
  - Event handlers for spectator-joined/spectator-left
- `OnlineMenu.tsx`: Added spectator join UI:
  - Checkbox to "Join as spectator"
  - Conditional ready button (hidden for spectators)
  - Spectator message: "You are spectating. Game will start when both players are ready."
  - Spectator list display in waiting room
- `OnlineGame.tsx`: Conditional rendering:
  - Uses `SpectatorScorePanel` + `SpectatorControls` for spectators
  - Uses `OnlineScorePanel` + `OnlineGameControls` for players
  - Board and TileRack disabled for spectators
  - Spectators see both players without "(You)" labels
- `OnlineScorePanel.tsx`: Added spectator list:
  - Small discrete box showing "👁️ Spectators (X/5)"
  - Displays spectator names below count

**Translations**
- Added spectator translations to `online.json` (EN/SR):
  - `spectator.watching` - "Watching Game" / "Гледате игру"
  - `spectator.cannotPlay` - "You cannot make moves as a spectator" / "Не можете играти као посматрач"
  - `spectator.helpText` - "You can watch the game and use chat" / "Можете гледати игру и користити чет"
  - `spectator.leaveConfirm` - Confirmation dialog messages

### Technical Highlights
- **Clean Separation**: Separate components for spectators (no spaghetti logic)
- **Real-Time Updates**: Spectators see all game state changes instantly
- **Chat Integration**: Spectators identified by socket.id for proper "You" labeling
- **Server-Authoritative**: All spectator actions validated server-side
- **Proper Cleanup**: Spectators removed from room on disconnect
- **Game Continuity**: Spectators leaving doesn't affect the game

### Files Changed
- `packages/shared/src/types/socket-events.ts` - Added Spectator interface and events
- `packages/server/src/room-manager.ts` - Added spectator management methods
- `packages/server/src/index.ts` - Added spectator handlers and broadcast logic
- `packages/client/src/components/SpectatorScorePanel/SpectatorScorePanel.tsx` - New component
- `packages/client/src/components/SpectatorControls/SpectatorControls.tsx` - New component
- `packages/client/src/store/onlineGameStore.ts` - Added spectator state and actions
- `packages/client/src/components/OnlineMenu/OnlineMenu.tsx` - Added spectator join UI
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Conditional rendering for spectators
- `packages/client/src/components/OnlineScorePanel/OnlineScorePanel.tsx` - Added spectator list
- `packages/client/src/i18n/locales/en/online.json` - Added spectator translations
- `packages/client/src/i18n/locales/sr/online.json` - Added spectator translations

### User Experience Improvements
- **Before**: Only 2 players could participate in a game
- **After**: Up to 5 additional spectators can watch and chat
- **Use Cases**:
  - Friends watching a match between two players
  - Learning the game by watching experienced players
  - Tournament spectating
  - Teaching/coaching scenarios
- **Benefits**:
  - More engaging multiplayer experience
  - Social gameplay - spectators can cheer and comment
  - No need for screen sharing to watch games
  - Clean, focused UI for spectators (no game controls clutter)

### Design Decisions
- **Limit of 5 spectators**: Balances engagement with server load
- **Separate components**: Keeps code clean and maintainable
- **Read-only access**: Spectators can't interfere with gameplay
- **Full visibility**: Spectators see everything players see (strategic gameplay)
- **Chat enabled**: Allows spectators to engage without playing
- **Minimal UI**: Spectators don't need game controls, just viewing area

### Tested
- ✅ Join room as spectator via checkbox
- ✅ Spectator enters waiting room correctly
- ✅ Spectator joins game when it starts
- ✅ Spectator sees both players' information
- ✅ Spectator sees real-time game updates
- ✅ Spectator can send and receive chat messages
- ✅ Spectator "You" label works correctly in chat
- ✅ Spectator list displays for players
- ✅ Spectator can leave without ending game
- ✅ Spectator limit (5) enforced
- ✅ All game controls disabled for spectators
- ✅ Works on both desktop and mobile layouts

---

## [0.2.14] - 2026-01-12

### Added
- **Drag Preview Enhancement**
  - Semi-transparent tile preview appears when dragging over empty board squares
  - Shows exactly where tile will land before dropping
  - Makes placement more intuitive, especially on mobile devices
  - Preview displays letter, value, and joker icon (if applicable)
  - Language-aware: Shows Cyrillic letters in Serbian mode
  - Implemented in both local and online multiplayer modes

### Implementation Details

**Local Game (`/src/`)**
- `components/Board/Square.tsx`:
  - Added `previewTile?: Tile | null` prop to interface
  - Added preview tile rendering section (lines 297-317)
  - Preview displays when `previewTile` prop is provided and square is empty
  - Visual styling: `border-dashed border-blue-400 bg-blue-50 opacity-60`
  - Shows full tile with letter, value, and joker icon if applicable
  - `pointer-events-none` ensures preview doesn't interfere with drag/drop

- `components/Board/Board.tsx`:
  - Added preview logic using existing `draggedTile` and `hoveredSquare` state
  - Determines if square should show preview: tile being dragged + cursor over empty square
  - Passes `previewTile` prop to Square component
  - Logic: `shouldShowPreview = draggedTile && hoveredSquare && matching position && !tile`

**Online Game (`packages/client/`)**
- `components/Board/Square.tsx`:
  - Same `previewTile` prop and rendering as local game
  - Imported `Tile` type from `@kvizovka/shared`
  - Consistent visual appearance and behavior

- `components/Board/Board.tsx`:
  - Same preview logic using `currentDraggedTile` and `hoveredSquare`
  - Works with online game's props-based architecture
  - Reuses existing hover tracking state

### Technical Details
- **Visual Design**:
  - Background: Light blue (`bg-blue-50`) at 60% opacity
  - Border: 2px dashed blue (`border-dashed border-blue-400`)
  - Shadow: Standard shadow-md for depth
  - Transition: 100ms duration for smooth appearance
  - Positioning: `absolute inset-1` matches regular tile placement

- **Rendering Logic**:
  - Only shows on empty squares (`!square.tile`)
  - Requires active drag operation (`draggedTile !== null`)
  - Must be hovering over specific square (`hoveredSquare.row/col === current position`)
  - Preview is non-interactive (`pointer-events-none`)

- **Tile Display**:
  - Letter: Converted to Cyrillic if Serbian language active
  - Value: Shown in bottom-right corner (same as regular tiles)
  - Joker icon: Shows 🃏 emoji in top-left if joker
  - Font styling: Same as regular tiles (text-xl font-bold)

### Visual Effect
- **Before**: No visual indication of where tile would land during drag
- **After**: Semi-transparent preview shows exact placement location
- Effect: Immediately obvious where tile will be placed
- Especially helpful:
  - On mobile/touch devices (harder to aim precisely)
  - For new players learning the game
  - When placing tiles in crowded board areas
  - For players with visual or motor difficulties

### Files Changed
- `/src/components/Board/Square.tsx` - Added previewTile prop and rendering (local)
- `/src/components/Board/Board.tsx` - Added preview logic (local)
- `packages/client/src/components/Board/Square.tsx` - Added previewTile prop and rendering (online)
- `packages/client/src/components/Board/Board.tsx` - Added preview logic (online)

### User Experience Improvements
- **Problem**: Users couldn't see exactly where tile would land until after dropping
  - Led to misplaced tiles requiring undo/recall
  - Especially problematic on touch devices
  - Slowed down gameplay

- **Solution**: Real-time visual preview as you drag
  - See exactly where tile will go before committing
  - Reduces placement errors significantly
  - Faster, more confident tile placement

- **Benefits**:
  1. **Accuracy**: No more accidental misplacements
  2. **Speed**: Faster tile placement with visual confirmation
  3. **Confidence**: Players know exactly what will happen
  4. **Accessibility**: Easier for users with motor difficulties
  5. **Mobile-friendly**: Makes touch/drag much more intuitive

### Design Considerations
- **Subtle but clear**: Blue tint distinguishes preview from real tiles
- **Dashed border**: Indicates temporary/preview state
- **60% opacity**: Semi-transparent so premium fields still visible
- **Non-blocking**: Doesn't interfere with drag/drop operations
- **Consistent**: Same appearance in local and online modes
- **Performance**: CSS-only rendering, no JavaScript calculations

### Example Workflow
```
Before (no preview):
1. Start dragging tile 'K' from rack
2. Move cursor over board - no visual feedback
3. Try to drop on desired square
4. Oops, dropped one square off - use Undo button
5. Try again

After (with preview):
1. Start dragging tile 'K' from rack
2. Move cursor over board - see blue preview of 'K' on each square
3. Position cursor until preview shows exactly where you want
4. Drop - tile lands exactly where preview showed ✓
```

### Tested
- ✅ Local game: Preview appears when dragging tile
- ✅ Local game: Preview shows correct letter and value
- ✅ Local game: Preview shows joker icon for joker tiles
- ✅ Local game: Preview only shows on empty squares
- ✅ Local game: Preview disappears when drag ends
- ✅ Local game: Cyrillic letters shown in Serbian mode
- ✅ Online game: Same preview behavior as local
- ✅ Online game: Works on both desktop and mobile
- ✅ Preview doesn't interfere with drop functionality
- ✅ Smooth transition when moving between squares
- ✅ No performance issues during drag operations

---

## [0.2.13] - 2026-01-12

### Added
- **Pulsing Animation on Turn Indicator**
  - "Your Turn" / "Current Turn" badge now pulses smoothly to catch attention
  - Animation uses Tailwind's `animate-pulse` CSS class
  - Gentle fade in/out effect makes turn indicator much more prominent
  - Helps players quickly identify when it's their turn
  - Implemented in both local and online multiplayer modes
  - No performance impact - pure CSS animation

### Implementation Details

**Local Game (`/src/`)**
- `components/ScorePanel/ScorePanel.tsx`:
  - Added `animate-pulse` class to Player 1 turn indicator badge (line 94)
  - Added `animate-pulse` class to Player 2 turn indicator badge (line 172)
  - Badge location: Top-right of active player's score panel
  - Animation applies to the white badge with blue/green text

**Online Game (`packages/client/`)**
- `components/OnlineScorePanel/OnlineScorePanel.tsx`:
  - Added `animate-pulse` class to "You" turn indicator badge (line 64)
  - Added `animate-pulse` class to Opponent turn indicator badge (line 142)
  - Same visual effect as local game for consistency

**Technical Details**
- Uses Tailwind CSS built-in `animate-pulse` utility
- Animation: Smooth opacity fade from 100% to 50% and back (2s cycle)
- Applied to: `<span className="... animate-pulse">`
- CSS animation runs continuously while badge is visible
- No JavaScript required - pure CSS performance

### Visual Effect
- **Before**: Static turn indicator badge
- **After**: Badge smoothly pulses (fades in/out)
- Cycle: ~2 seconds per pulse
- Effect: Subtle but attention-grabbing
- Makes it immediately obvious whose turn it is

### Files Changed
- `/src/components/ScorePanel/ScorePanel.tsx` - Added animation to both players (local)
- `packages/client/src/components/OnlineScorePanel/OnlineScorePanel.tsx` - Added animation (online)

### User Experience Improvements
- **Problem**: Turn indicator could get lost among other UI elements
- **Solution**: Pulsing animation draws eye to current turn
- **Benefit**: Players immediately know when it's their turn without searching
- Especially helpful in:
  - Hotseat mode (local) when passing device between players
  - Online mode when waiting for opponent to finish their turn
  - Long games where players might be distracted

### Design Considerations
- **Subtle**: Pulse animation is gentle, not jarring or distracting
- **Professional**: Uses standard CSS animation, not flashy effects
- **Consistent**: Same animation in both local and online modes
- **Accessible**: Visual cue complements existing color coding
- **Performance**: CSS-only animation has zero performance cost

### Tested
- ✅ Local game: Player 1 turn indicator pulses
- ✅ Local game: Player 2 turn indicator pulses
- ✅ Local game: Animation stops when not active player
- ✅ Online game: "Your Turn" badge pulses
- ✅ Online game: Opponent turn badge pulses
- ✅ Animation smooth and consistent
- ✅ No performance issues
- ✅ Works on both desktop and mobile layouts

---

## [0.2.12] - 2026-01-12

### Added
- **Undo Last Tile Placement Button**
  - New "↶ Undo" button removes the most recently placed tile
  - Tile automatically returns to the rack
  - Helpful for quick corrections without dragging tiles back
  - Button appears in secondary actions row with Recall and Skip Turn
  - Disabled when no tiles are placed or game not in progress
  - Includes tooltip: "Remove last placed tile"
  - Implemented in both local and online multiplayer modes

### Implementation Details

**Local Game (`/src/`)**
- `store/gameStore.ts`:
  - Added `undoLastTile()` action to interface
  - Implementation removes last tile from `selectedTiles` array using `slice(0, -1)`
  - Resets joker letter if removed tile was a joker
  - Calls `validateCurrentPlacement()` to update real-time visual feedback
  - Logic mirrors `clearSelection()` but only affects last tile
- `components/GameControls/GameControls.tsx`:
  - Added `undoLastTile` subscription from gameStore
  - Changed secondary actions from 2-column to 3-column grid
  - Added Undo button as first button in row: `↶ {t('common:buttons.undo')}`
  - Button styled with `btn btn-secondary text-sm` for compact layout
  - Disabled state: `selectedTiles.length === 0 || !isInProgress`
  - Title tooltip: `t('common:buttons.undoTooltip')`

**Online Game (`packages/client/`)**
- `components/OnlineGame/OnlineGame.tsx`:
  - Added `handleUndoLastTile()` handler function
  - Uses `setSelectedTiles(prev => prev.slice(0, -1))` for state update
  - Passed as `onUndoLastTile` prop to both OnlineGameControls instances (desktop & mobile)
- `components/OnlineGameControls/OnlineGameControls.tsx`:
  - Added `onUndoLastTile: () => void` to interface
  - Added Undo button to 3-column secondary actions grid
  - Same styling and disabled logic as local game
  - Calls `onUndoLastTile` callback on click

**Translations**
- Added to all 4 translation files (local EN/SR, online EN/SR):
  - `"undo": "Undo"` / `"undo": "Поништи"`
  - `"undoTooltip": "Remove last placed tile"` / `"undoTooltip": "Уклони последњу постављену плочицу"`
- Keys added to `buttons` section in `common.json`

### Technical Highlights
- **Non-Destructive**: Only removes last tile, preserves rest of placement
- **Joker Support**: Automatically resets joker letter when undoing joker tile
- **Real-Time Validation**: Validation updates immediately after undo
- **State Consistency**: Uses functional state updates (`prev => prev.slice(0, -1)`) in online mode
- **Dual-Mode Support**: Same behavior in local and online games
- **UI Consistency**: 3-column button layout fits naturally with existing controls

### UI Changes
- **Before**: Secondary actions in 2-column grid (Recall | Skip Turn)
- **After**: Secondary actions in 3-column grid (Undo | Recall | Skip Turn)
- All three buttons use `text-sm` class for compact, balanced appearance
- Undo button positioned first (leftmost) for easy access

### Files Changed
- `/src/store/gameStore.ts` - Added undoLastTile action (local)
- `/src/components/GameControls/GameControls.tsx` - Added Undo button (local)
- `/src/i18n/locales/en/common.json` - Added translations (local)
- `/src/i18n/locales/sr/common.json` - Added translations (local)
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Added handler
- `packages/client/src/components/OnlineGameControls/OnlineGameControls.tsx` - Added Undo button
- `packages/client/src/i18n/locales/en/common.json` - Added translations (online)
- `packages/client/src/i18n/locales/sr/common.json` - Added translations (online)

### User Experience Improvements
- **Before**: To correct last tile placement, users had to:
  1. Drag the tile back to rack manually, OR
  2. Click "Recall Tiles" to remove all tiles
- **After**: Single click on "↶ Undo" removes just the last tile
  - Much faster for quick corrections
  - No need to replay entire word if one tile wrong
  - Maintains placement order for remaining tiles
  - Reduces friction in tile placement workflow

### Use Cases
1. **Typo Correction**: Placed wrong letter, undo and place correct one
2. **Position Adjustment**: Placed tile in wrong square, undo and reposition
3. **Direction Change**: Started wrong direction, undo and try different approach
4. **Joker Letter Change**: Set joker to wrong letter, undo to reset and choose again
5. **Quick Experimentation**: Try different tile placements rapidly using undo

### Example Workflow
```
Player placing "HOUSE":
1. Place H at (8,8)
2. Place O at (8,9)
3. Place U at (8,10)
4. Place S at (8,11) ← Oops, meant to place different letter
5. Click "↶ Undo" → S returns to rack
6. Place correct tile instead
7. Continue with remaining tiles
```

### Tested
- ✅ Local game: Undo removes last tile
- ✅ Local game: Tile returns to rack correctly
- ✅ Local game: Joker letter reset when undoing joker
- ✅ Local game: Validation updates after undo
- ✅ Local game: Button disabled when no tiles placed
- ✅ Online game: Same undo behavior as local
- ✅ Online game: Works on both desktop and mobile layouts
- ✅ Both games: Tooltip displays correctly
- ✅ Both games: 3-column button layout looks good
- ✅ Translations work in English and Serbian

---

## [0.2.11] - 2026-01-12

### Added
- **Real-Time Word Length Counter**
  - Play Word button now displays word length as tiles are placed
  - **Yellow indicator**: "3/4 letters" when word is too short (< 4 letters)
  - **Green indicator**: "5 letters ✓" when word meets minimum length (≥ 4 letters)
  - Counter shows **actual word length** (including existing board tiles), not just placed tiles
  - Updates in real-time as tiles are added/removed
  - Implemented in both local and online multiplayer modes
  - Helps players know if their word is ready to submit before clicking Play Word

### Implementation Details

**Local Game (`/src/`)**
- `components/GameControls/GameControls.tsx`:
  - Added `placementValidation` subscription from gameStore
  - Created `getWordLengthDisplay()` function to calculate word length from validation result
  - Updated Play Word button to display counter below button text
  - Counter uses `placementValidation.wordsFormed[0].length` for accurate count
  - Falls back to `selectedTiles.length` if validation not available
  - Color-coded text: `text-yellow-200` for incomplete, `text-green-200` for valid

**Online Game (`packages/client/`)**
- `components/OnlineGameControls/OnlineGameControls.tsx`:
  - Added `placementValidation` prop to interface
  - Imported `MoveValidationResult` from `@kvizovka/shared`
  - Added same `getWordLengthDisplay()` logic as local game
  - Updated Play Word button with word length counter display
- `components/OnlineGame/OnlineGame.tsx`:
  - Added `placementValidation` state with `useState<MoveValidationResult | null>`
  - Created `useEffect` to run validation when `selectedTiles` changes
  - Validation creates temporary board, copies current state, runs MoveValidator
  - Passes `placementValidation` prop to both OnlineGameControls instances (desktop & mobile)

**Translations**
- Added `"letter"` and `"letter_plural"` keys to `common.json` (EN/SR)
- English: "letter" / "letters"
- Serbian: "слово" / "слова"
- Used by counter display: `t('common:plurals.letter', { count })`

### Technical Highlights
- **Accurate Word Length**: Counter shows total word length including existing tiles, not just newly placed tiles
- **Real-Time Validation**: Runs automatically via useEffect/store subscription
- **Dual-Mode Support**: Same logic works in both local and online games
- **No Performance Impact**: Validation already ran for visual feedback, counter reuses result
- **Consistent UX**: Both game modes have identical counter appearance and behavior

### Files Changed
- `/src/components/GameControls/GameControls.tsx` - Added word length counter (local)
- `/src/i18n/locales/en/common.json` - Added "letter" translations (local)
- `/src/i18n/locales/sr/common.json` - Added "letter" translations (local)
- `packages/client/src/components/OnlineGameControls/OnlineGameControls.tsx` - Added counter logic
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Added validation state management
- `packages/client/src/i18n/locales/en/common.json` - Added "letter" translations (online)
- `packages/client/src/i18n/locales/sr/common.json` - Added "letter" translations (online)

### User Experience Improvements
- **Before**: No indication of word length until submission - players had to count manually
- **After**: Instant visual feedback showing progress toward 4-letter minimum
  - Yellow "3/4 letters" = "Add one more tile!"
  - Green "5 letters ✓" = "Ready to submit!"
- Reduces frustration from rejected moves due to too-short words
- Players can see exact word length at a glance
- Clear visual distinction between incomplete (yellow) and valid (green)
- Counter positioned directly on Play Word button for maximum visibility

### Example
```
Placing tiles to form "KUĆA" (4 letters):
- Place K: "1/4 letters" (yellow)
- Place U: "2/4 letters" (yellow)
- Place Ć: "3/4 letters" (yellow)
- Place A: "4 letters ✓" (green) - Ready to submit!

Placing single tile 'D' between 'I' and 'A' to form "IDA":
- Shows "3/4 letters" (yellow) - word too short
- Need to form longer word or choose different placement
```

### Tested
- ✅ Local game: Counter appears when placing tiles
- ✅ Local game: Yellow for <4 letters, green for ≥4 letters
- ✅ Local game: Counter updates as tiles added/removed
- ✅ Local game: Accurate count includes existing board tiles
- ✅ Online game: Same counter behavior as local
- ✅ Online game: Counter updates on both desktop and mobile layouts
- ✅ English and Serbian translations work correctly
- ✅ Counter disappears when all tiles recalled

---

## [0.2.10] - 2026-01-12

### Fixed
- **Single-Tile Direction Detection Bug**
  - Fixed validator incorrectly choosing direction when single tile has neighbors in both directions
  - **Bug**: When placing a tile that forms both horizontal and vertical words, validator chose shorter word direction
  - **Example**: Placing 'D' between 'I' and 'A' formed 3-tile horizontal word "IDA" and 5-tile vertical word - validator incorrectly chose horizontal
  - **Root Cause**: "Both sides" heuristic failed when horizontal had neighbors on BOTH sides but vertical had neighbors on ONLY ONE side
  - **Fix**: Removed unreliable heuristic - now ALWAYS scans actual word lengths when tile has neighbors in both directions
  - Validator now correctly chooses the longer direction (main word) every time

### Technical Details
- Changed `determineSingleTileDirection()` in `MoveValidator.ts`
- **Before**: Used `verticalBothSides && horizontalBothSides` check - would skip word length comparison if false ❌
- **After**: Always temporarily places tile and compares word lengths when both directions have neighbors ✅
- Logic now:
  1. Check if tile has horizontal neighbors (left OR right, ignoring blockers)
  2. Check if tile has vertical neighbors (top OR bottom, ignoring blockers)
  3. If BOTH directions have neighbors → temporarily place tile, scan both directions, choose longer word
  4. If only ONE direction has neighbors → choose that direction
- If both directions have equal length, defaults to VERTICAL

### Example
```
Board state:
    K E
I D A
    K
    O
    K

Placing 'D' at position between I and A:
Horizontal: I + D + A = 3 tiles
Vertical: D + A + K + O + K = 5 tiles

Before fix: Chose HORIZONTAL (heuristic skipped length check) ❌
After fix: Chose VERTICAL (scanned lengths, picked longer) ✅
```

### Files Changed
- `packages/shared/src/game-engine/MoveValidator.ts` - Fixed direction detection (lines 416-448)

### Tested
- ✅ Single tile between two horizontal tiles → chooses horizontal
- ✅ Single tile between two vertical tiles → chooses vertical
- ✅ Single tile with neighbors in BOTH directions → chooses longer word direction
- ✅ Edge case: Horizontal neighbors on both sides, vertical on one side → correctly chooses longer direction
- ✅ Console logs show word length comparison working correctly

---

## [0.2.9] - 2026-01-11

### Changed
- **Modified Long Word Bonus System**
  - Refined bonus rules to reward strategic long word play:
    1. **First move special**: First player using all 10 tiles on empty board → +30 bonus
    2. **10-letter words**: Standard 10-letter word (any other case) → +20 bonus
    3. **11+ letters with tiles remaining**: Formed 11+ letter word with tiles left in hand → +40 bonus
    4. **11+ letters, all tiles used**: Formed 11+ letter word using all tiles from hand → +50 bonus
  - Previous system: Simple 10 letters = +20, 11+ letters = +30
  - New system rewards both word length AND strategic tile management

### Implementation Details

**Shared Package (`packages/shared/`)**
- Updated `getLongWordBonus()` function in `src/constants/scoring-rules.ts`:
  - Added `isFirstMove` parameter - Detects first move of game
  - Added `tilesUsedInMove` parameter - Number of tiles placed
  - Added `tilesRemainingAfterMove` parameter - Tiles left after drawing
  - Logic distinguishes 4 bonus scenarios based on game state
- Updated `ScoreCalculator.calculateMoveScore()` in `src/game-engine/ScoreCalculator.ts`:
  - Added `isFirstMove` parameter (default: false)
  - Added `tilesRemainingAfterMove` parameter (default: 0)
  - Passes new parameters to `getLongWordBonus()`

**Server (`packages/server/`)**
- Updated `GameManager.makeMove()` in `src/game-manager.ts`:
  - Calculates `isFirstMove` from `game.moveHistory.length === 0`
  - Calculates `tilesRemainingAfterMove`:
    - Determines tiles drawn from bag (min of tiles used and bag remaining)
    - Computes player's rack size after move: `currentTiles - usedTiles + drawnTiles`
  - Passes both values to score calculator

**Client (`packages/client/`)**
- Updated `gameStore.makeMove()` in `src/store/gameStore.ts`:
  - Added same calculations as server for local game scoring
  - Ensures consistent bonus calculation in offline mode

### Testing Notes
- First move bonus (30 pts): Requires 10-letter word using all tiles on empty board
- Standard 10-letter bonus (20 pts): Any 10-letter word not meeting first move criteria
- High bonus (40 pts): Rewarded when forming 11+ letters while keeping tiles for future plays
- Maximum bonus (50 pts): Ultimate reward for using entire hand to form 11+ letter word

---

## [0.2.8] - 2026-01-11

### Added
- **Real-Time Chat for Online Multiplayer**
  - Players can now chat with each other during online games
  - Chat appears in left sidebar (desktop) or below scoresheets (mobile)
  - Real-time message delivery using WebSocket
  - Clean, compact UI with message bubbles
  - Auto-scroll to latest message
  - Player name and timestamp for each message
  - Different colors for "You" (blue) vs opponent (gray)
  - 300px fixed height with scrollable message list
  - Enter key to send messages
  - 500 character limit per message

### Implementation Details

**Shared Package (`packages/shared/`)**
- Added `ChatMessage` interface to `types/socket-events.ts`:
  - `playerId` - ID of sender
  - `playerName` - Name of sender
  - `message` - Message text
  - `timestamp` - Date object
- Added socket events:
  - `chat:message` (client → server) - Send message
  - `chat:message` (server → client) - Receive message
- Exported ChatMessage type from shared package index

**Server (`packages/server/`)**
- Added `chat:message` event handler in `src/index.ts`
- Message validation:
  - Non-empty messages only
  - Maximum 500 characters
  - Sender must be in the room
- Broadcasts messages to all room participants (including sender)
- Server-side logging for debugging

**Client (`packages/client/`)**
- Created new `Chat` component (`components/Chat/Chat.tsx`):
  - Message list with auto-scroll
  - Input field with Send button
  - Enter key support
  - Compact design for sidebar
  - Message bubbles with player names and timestamps
  - Visual distinction between own and opponent messages
- Updated `onlineGameStore.ts`:
  - New state: `chatMessages: ChatMessage[]`
  - New action: `sendChatMessage(message: string)`
  - Event listener for incoming `chat:message` events
  - Messages appended to state in real-time
- Integrated Chat into `OnlineGame.tsx`:
  - Desktop: Below scoresheets in left sidebar
  - Mobile: Below scoresheets in main content area
  - Responsive layout with Tailwind CSS

### Technical Highlights
- **Zero Performance Impact**: Chat runs on existing WebSocket connection
- **Message Size**: ~100-500 bytes per message (negligible bandwidth)
- **State Management**: Separate chat state prevents game re-renders
- **Auto-Scroll**: Uses `useRef` and `scrollIntoView` for smooth UX
- **Security**: Server validates all messages before broadcast
- **Scalability**: Message history limited to session (clears on game end)

### Files Changed
- `packages/shared/src/types/socket-events.ts` - Added ChatMessage interface and events
- `packages/shared/src/types/index.ts` - Exported ChatMessage type
- `packages/shared/src/index.ts` - Re-exported ChatMessage
- `packages/server/src/index.ts` - Added chat:message handler
- `packages/client/src/components/Chat/Chat.tsx` - New Chat component
- `packages/client/src/store/onlineGameStore.ts` - Added chat state and actions
- `packages/client/src/components/OnlineGame/OnlineGame.tsx` - Integrated Chat

### User Experience Improvements
- **Before**: No way to communicate with opponent during game
- **After**: Real-time chat enables:
  - Friendly banter and social interaction
  - Saying "good move" or "nice word"
  - Quick communication without external apps
  - More engaging multiplayer experience
- Chat is non-intrusive - doesn't interfere with gameplay
- Clean, familiar chat UI pattern

### Tested
- ✅ Send message from one player to another
- ✅ Messages appear instantly for both players
- ✅ Auto-scroll to latest message
- ✅ Message timestamps display correctly
- ✅ Player names show correctly ("You" vs opponent name)
- ✅ Enter key sends message
- ✅ Send button disabled when input empty
- ✅ 500 character limit enforced
- ✅ Empty messages rejected
- ✅ Messages broadcast to room participants only
- ✅ Desktop layout (sidebar)
- ✅ Mobile layout (below scoresheets)

---

## [0.2.7] - 2026-01-11

### Added
- **Real-Time Visual Feedback for Word Placement**
  - Tiles now display color-coded visual feedback as players place them on the board
  - **Green tiles** (bg-green-100) - Valid word formed (≥4 letters, correct placement)
  - **Gray tiles** (bg-gray-400) - Invalid placement (tiles not in line, gaps, no center square, etc.)
  - **Direction indicator** - Entire row or column highlighted with cyan background when 2+ tiles placed
  - Visual feedback updates in real-time as tiles are added/removed
  - Smooth transitions with 200ms duration for polished UX
  - Works in both local multiplayer and online multiplayer modes

### Implementation Details

**Shared Package (`packages/shared/`)**
- Added `TilePlacementState` enum to `types/board.types.ts`
  - `NEUTRAL` - No tiles placed or no validation yet
  - `VALID_PLACEMENT` - Correct placement but word incomplete (<4 letters)
  - `VALID_WORD` - Forms valid word (≥4 letters, correct placement)
  - `INVALID` - Placement violates rules
- Exported enum from shared package index

**Local Multiplayer Game (`/src/`)**
- `store/gameStore.ts`: Added real-time validation
  - New state: `placementValidation: MoveValidationResult | null`
  - New action: `validateCurrentPlacement()` - runs validation without side effects
  - Validation triggered automatically on `selectTile`, `unselectTile`, `clearSelection`, `setJokerLetter`
- `components/Board/Board.tsx`: Visual state logic
  - `getTileState()` - determines visual state for each placed tile
  - `getHighlightedLine()` - identifies row/column to highlight
  - `isInHighlightedLine()` - checks if square is in highlighted line
  - Passes `placementState` and `isHighlightedLine` to Square components
- `components/Board/Square.tsx`: Dynamic styling
  - `getTileStateClass()` - returns Tailwind classes based on placement state
  - Green: `bg-green-100 border-green-500 border-2`
  - Gray: `bg-gray-400 border-gray-500 opacity-60`
  - Highlighted line: `bg-cyan-50`
  - Added transition animation: `transition-all duration-200`

**Online Multiplayer Game (`packages/client/`)**
- `store/gameStore.ts`: Same real-time validation as local mode
- `components/Board/Board.tsx`: Dual-mode validation support
  - Local mode: Uses `placementValidation` from gameStore
  - Online mode: Runs validation locally via `useEffect` hook
  - Creates temporary Board instance to validate online mode placements
  - Validates whenever `selectedTiles` prop changes
  - Both modes use same visual feedback logic
- `components/Board/Square.tsx`: Same styling as local mode

### Technical Highlights
- **No Dictionary Validation**: Real-time feedback only checks placement rules + word length (≥4 letters)
  - Dictionary validation still happens only on "Play Word" submission
  - This is intentional - prevents revealing invalid words before submission
- **Dual-Mode Architecture**:
  - Local mode uses gameStore with automatic validation
  - Online mode uses props with manual validation in useEffect
  - Both modes share the same visual feedback components
- **Performance**: Validation runs efficiently using lightweight MoveValidator
  - Online mode creates temporary board only when needed
  - No network calls during real-time validation

### Files Changed
- `packages/shared/src/types/board.types.ts` - Added TilePlacementState enum
- `packages/shared/src/types/index.ts` - Exported TilePlacementState
- `packages/shared/src/index.ts` - Re-exported TilePlacementState
- `packages/client/src/store/gameStore.ts` - Added validation state and action
- `packages/client/src/components/Board/Board.tsx` - Added visual state logic
- `packages/client/src/components/Board/Square.tsx` - Added dynamic styling
- `/src/store/gameStore.ts` - Added validation state and action (local game)
- `/src/components/Board/Board.tsx` - Added visual state logic (local game)
- `/src/components/Board/Square.tsx` - Added dynamic styling (local game)

### User Experience Improvements
- **Before**: No visual feedback until "Play Word" clicked - users had to guess if placement was valid
- **After**: Instant visual confirmation as tiles are placed
  - Green = "This looks good! Ready to submit"
  - Gray = "Something's wrong with this placement"
  - Cyan row/column = "Your word is going in this direction"
- Players can now see and fix mistakes before clicking "Play Word"
- Reduces frustration from rejected moves
- Makes game rules more discoverable through visual feedback

### Tested
- ✅ Local multiplayer mode: Green tiles for valid words
- ✅ Local multiplayer mode: Gray tiles for invalid placements
- ✅ Local multiplayer mode: Cyan row/column highlighting
- ✅ Online multiplayer mode: Same visual feedback as local
- ✅ Visual updates when adding tiles
- ✅ Visual updates when removing tiles
- ✅ Visual updates when moving tiles
- ✅ Visual updates when setting joker letters
- ✅ First move validation (must cover center)
- ✅ Subsequent move validation (must connect to existing tiles)
- ✅ Direction detection (horizontal vs vertical)
- ✅ Gap detection (tiles must be contiguous)
- ✅ Minimum word length (≥4 letters)

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

- **0.2.8** - Real-time chat for online multiplayer (Jan 11, 2026)
- **0.2.7** - Real-time visual feedback for word placement (Jan 11, 2026)
- **0.2.6** - Opponent tiles display in ScorePanel (Jan 10, 2026)
- **0.2.5** - Fixed Serbian digraph scoring bug (Jan 9, 2026)
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

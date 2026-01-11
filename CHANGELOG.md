# Changelog

All notable changes to the Kvizovka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Full Internationalization (i18n)**: Complete localization system with English and Serbian support (2026-01-10)
  - **Technology Stack**: react-i18next with i18next-browser-languagedetector
  - **Supported Languages**:
    - English (en) - default
    - Serbian (sr) - with full Cyrillic script support
  - **Language Detection**: Auto-detects from browser settings, manual switcher available
  - **Persistence**: Selected language stored in localStorage (`kvizovka-language`)
  - **Translation Files**: Organized into namespaces for maintainability
    - `common.json` - Buttons, labels, plurals, default player names (30+ strings)
    - `game.json` - Game-specific UI, tile rack, board legend (25+ strings)
    - `dialogs.json` - Modal dialogs, confirmations, game over (15+ strings)
    - `validation.json` - Error messages, validation feedback (40+ strings)
  - **TypeScript Integration**: Full autocomplete and type safety for translation keys
    - Module augmentation for `react-i18next` types
    - Compile-time errors for missing translation keys
    - IDE autocomplete for all translation paths
  - **Components Migrated**: All UI components now fully localized
    - Game.tsx - Main game screen, start screen, game over
    - Board.tsx - Board legend (premium square labels)
    - TileRack.tsx - Tile rack UI, exchange mode, debug info
    - GameControls.tsx - All buttons and dialogs
    - ScorePanel.tsx - Score display, last move, game status
    - Scoresheet.tsx - Move history table headers
    - Tile.tsx - Joker label
  - **Cyrillic Letter Support**: Serbian displays in authentic Cyrillic script
    - **Letter Mapping Utility** (`src/utils/letterMapping.ts`):
      - `latinToCyrillic()` - Converts single letters (A→А, Š→Ш)
      - `wordToCyrillic()` - Converts entire words, handles digraphs (LJ→Љ, NJ→Њ, DŽ→Џ)
      - Full Serbian alphabet (30 letters) mapped
      - Special characters: Č→Ч, Ć→Ћ, Đ→Ђ, Š→Ш, Ž→Ж
      - Digraphs: LJ→Љ, NJ→Њ, DŽ→Џ
    - **Tiles Display**: All tiles show Cyrillic when language is Serbian
      - Rack tiles (e.g., 'A' displays as 'А')
      - Board tiles (placed letters in Cyrillic)
      - Joker tiles with assigned letters
    - **Words Display**: All words converted to Cyrillic
      - Scoresheet move history
      - Score panel last move
      - Dragging feedback messages
    - **UI Conversion**: Automatic based on language selection
      - English mode: Latin letters (A, B, C, Š, LJ)
      - Serbian mode: Cyrillic letters (А, Б, Ц, Ш, Љ)
      - Game logic unchanged (still uses Latin internally)
  - **Language Switcher Component**: Visual language selection UI
    - Displays in header (start screen and active game)
    - Shows language flags (🇬🇧 English, 🇷🇸 Српски)
    - Highlights active language with blue background
    - Instant language switching (no page reload)
    - Positioned in top-right corner for accessibility
  - **Localized Features**:
    - **Default Player Names**: "Player 1/2" → "Играч 1/2"
    - **Board Legend**: Premium square labels in both languages
      - "Double Letter" → "Дупло Слово"
      - "Triple Letter" → "Тропло Слово"
      - "Quadruple Letter" → "Четвороструко Слово"
      - "Word Multiplier" → "Množitељ Речи"
      - "Center (Start)" → "Центар (почетак)"
    - **Joker Label**: "JOKER" → "КВИЗОВАЦ"
    - **All UI Text**: Buttons, labels, messages, dialogs
  - **Pluralization**: Built-in i18next plural handling
    - English: "1 tile" / "2 tiles"
    - Serbian: "1 плочица" / "2 плочица"
  - **Dynamic Content**: Variable interpolation for player names, counts, scores
    - Example: `"{{playerName}}'s Tiles"` → `"Плочице играча {{playerName}}"`
  - **Documentation**:
    - `Docs/LOCALIZATION-PLAN-2026-01-10.md` - Complete implementation plan
    - Translation guidelines and best practices
    - Future expansion roadmap (multiplayer localization)
  - **Build Status**: ✅ TypeScript compilation successful, all components working
  - **Files Created** (12 new files):
    - `src/i18n/config.ts` - i18next configuration
    - `src/i18n/types.ts` - TypeScript module augmentation
    - `src/i18n/locales/en/common.json` - English common strings
    - `src/i18n/locales/en/game.json` - English game strings
    - `src/i18n/locales/en/dialogs.json` - English dialog strings
    - `src/i18n/locales/en/validation.json` - English validation strings
    - `src/i18n/locales/sr/common.json` - Serbian common strings
    - `src/i18n/locales/sr/game.json` - Serbian game strings
    - `src/i18n/locales/sr/dialogs.json` - Serbian dialog strings
    - `src/i18n/locales/sr/validation.json` - Serbian validation strings
    - `src/components/LanguageSwitcher/LanguageSwitcher.tsx` - Language switcher UI
    - `src/utils/letterMapping.ts` - Latin ↔ Cyrillic conversion utility
  - **Files Modified** (8 files):
    - `src/main.tsx` - Import i18n config before App
    - `src/components/Game/Game.tsx` - Add LanguageSwitcher, localize all strings, default player names
    - `src/components/Board/Board.tsx` - Localize board legend
    - `src/components/Board/Square.tsx` - Cyrillic letter display on tiles
    - `src/components/TileRack/TileRack.tsx` - Cyrillic letter display, localized UI
    - `src/components/TileRack/Tile.tsx` - Cyrillic letters, localized joker label
    - `src/components/GameControls/GameControls.tsx` - Localized buttons and dialogs
    - `src/components/ScorePanel/ScorePanel.tsx` - Cyrillic words in last move
    - `src/components/Scoresheet/Scoresheet.tsx` - Cyrillic words in move history
  - **Dependencies Added**:
    - `i18next@23.17.4` - Core i18n framework
    - `react-i18next@15.2.0` - React bindings for i18next
    - `i18next-browser-languagedetector@8.0.2` - Auto language detection
  - **Multiplayer Localization** (2026-01-10):
    - **Full i18n Infrastructure**: Complete localization system for online multiplayer
      - Same translation structure as local game
      - Added `online` namespace for multiplayer-specific strings (25+ translations)
      - Translations for room creation, joining, connection status, errors
      - Shared translation files with local game (common, game, dialogs, validation)
      - **Serbian sentence case convention**: All translations use proper sentence case (not title case)
    - **Translation Files** (`multiplayer/packages/client/src/i18n/locales/`):
      - English: common.json, game.json, dialogs.json, validation.json, online.json
      - Serbian: common.json, game.json, dialogs.json, validation.json, online.json
      - Online-specific translations:
        - "Create Room" → "Направи собу"
        - "Join Room" → "Придружи се соби"
        - "Room Code" → "Шифра собе"
        - "Waiting for opponent..." → "Чекам противника..."
        - "Connected" → "Повезан"
        - Connection errors and status messages
      - Game-specific translations with pluralization:
        - "{{count}} tile in hand" / "{{count}} tiles in hand" → "{{count}} плочица у руци"
        - "Your Turn" → "Твој потез"
        - Board legend: "2L - Double Letter" → "2С - Дупло слово"
    - **Configuration** (`multiplayer/packages/client/src/i18n/`):
      - `config.ts` - i18next setup with 5 namespaces
      - `types.ts` - TypeScript autocomplete for translation keys
      - Separate localStorage key: `kvizovka-multiplayer-language`
    - **Components Migrated** (All multiplayer UI fully localized):
      - `LanguageSwitcher` - Language selection with flags (🇬🇧 English, 🇷🇸 Српски)
      - `letterMapping.ts` utility - Cyrillic support for multiplayer
      - `OnlineMenu.tsx` - Room creation, joining, connection screens
      - `GameModeMenu.tsx` - Game mode selection with language switcher
      - `OnlineGame.tsx` - Main game screen with all dialogs and messages
      - `OnlineGameControls.tsx` - All buttons, confirmations, and help text
      - `OnlineScorePanel.tsx` - Game status, scores, time, rounds, tiles remaining
      - `Scoresheet.tsx` - Move history table with headers (Word, Pts, Total, Final)
      - `TileRack.tsx` - Player tiles, counts with pluralization, drag instructions
      - `Board.tsx` - Board legend (Double/Triple/Quadruple Letter, Word Multiplier, Center)
      - `JokerLetterDialog.tsx` - Joker letter selection with Cyrillic alphabet
      - `Tile.tsx` - Tile display with Latin/Cyrillic conversion
      - `Square.tsx` - Board square with Latin/Cyrillic conversion
    - **Build Status**: ✅ TypeScript compilation successful (358KB JS, gzipped: 108KB)
    - **Files Created** (13 new files):
      - i18n configuration and types (2 files)
      - English translations (5 files)
      - Serbian translations (5 files)
      - LanguageSwitcher component
      - letterMapping utility
    - **Files Modified** (15 files):
      - `main.tsx` - Import i18n config
      - `OnlineMenu.tsx` - Full localization (all screens)
      - `GameModeMenu.tsx` - Add language switcher and translations
      - `OnlineGame.tsx` - All dialogs, headers, error messages
      - `OnlineGameControls.tsx` - Buttons and confirmation dialogs
      - `OnlineScorePanel.tsx` - Game status and score display
      - `Scoresheet.tsx` - Table headers and move types
      - `TileRack.tsx` - Player info, tile counts, exchange mode, drag instructions
      - `Board.tsx` - Board legend translations
      - `JokerLetterDialog.tsx` - Cyrillic letter support
      - `Tile.tsx` - Cyrillic letter display
      - `Square.tsx` - Cyrillic letter display
      - English `game.json` - Added pluralization keys for tiles
      - Serbian `game.json` - Added pluralization keys with sentence case
      - Serbian `online.json` - Fixed sentence case throughout
    - **Status**: ✅ Complete - All multiplayer components fully localized

### Changed
- **UI Layout Improvements** (2026-01-10):
  - **Language Switcher Positioning**: Moved language switcher buttons above title on start screen
    - Prevents overlap with "Kvizovka" title
    - Centered horizontally for better visual balance
    - Applies to both local game start screen
  - **Removed Redundant Game Status Section**: Streamlined UI in both local and multiplayer games
    - Removed "Game Status" header panel displaying round, tiles left, total moves, and status
    - Information is redundant as scoresheet already tracks moves
    - Cleaner, more focused layout with player panels and scoresheet
    - Underlying game state (round, tileBag, moveHistory, status) still tracked internally for game logic
  - **Translation Cleanup**: Removed unused translation keys from both English and Serbian
    - Removed: `gameStatus`, `round`, `tilesLeft`, `totalMoves`, `status`
    - Cleaned up in all 4 common.json files (local EN/SR, multiplayer EN/SR)
  - **Files Modified** (6 files):
    - Local game: `Game.tsx` (language switcher positioning), `ScorePanel.tsx` (removed status section)
    - Multiplayer: `OnlineScorePanel.tsx` (removed status section)
    - Translation files: `src/i18n/locales/en/common.json`, `src/i18n/locales/sr/common.json`
    - Translation files: `multiplayer/packages/client/src/i18n/locales/en/common.json`, `multiplayer/packages/client/src/i18n/locales/sr/common.json`
  - **Build Status**: ✅ Both games build successfully with cleaner UI

- **Player Name Input Screen** (2026-01-10):
  - **Local Game**: Added player name input screen before game starts
    - Two-step flow: Welcome screen → Name input → Game starts
    - Input fields for Player 1 and Player 2 names (max 20 characters each)
    - Auto-focus on Player 1 input field
    - Smart defaults: Uses "Player 1"/"Player 2" (or Serbian equivalents) if left blank
    - Cancel button to return to welcome screen
    - Form submission with Enter key
    - Color-coded focus rings (blue for Player 1, green for Player 2)
  - **Translation Keys Added**:
    - English: `playerSetup.subtitle`, `player1Label`, `player2Label`, `startGame`, `hint`
    - Serbian: Same keys with sentence case translations
  - **Files Modified** (3 files):
    - `src/components/Game/Game.tsx` - Added name input form and state management
    - `src/i18n/locales/en/game.json` - Added playerSetup namespace
    - `src/i18n/locales/sr/game.json` - Added playerSetup namespace with sentence case
  - **Build Status**: ✅ Local game builds successfully (280.21 KB JS, gzipped: 86.67 KB)

- **Serbian Translation Refinements** (2026-01-10):
  - **Terminology Updates**: Improved Serbian translations for better clarity and consistency
    - "Онлајн вишеиграч" → "Игра у мрежи" (Online multiplayer → Game on the network)
    - "Придружи се соби" → "Придружи се" (Join room → Join)
    - "Играј локално" → "Играј на комјутеру" (Play locally → Play on computer)
    - "Играј онлајн" → "Играј у мрежи" (Play online → Play on the network)
  - **Sentence Case Consistency**: Fixed remaining title case issues
    - "Српска Игра Речи" → "Српска игра речи"
    - "Одиграј Реч" → "Одиграј реч"
    - Board legend translations (e.g., "Дупло Слово" → "Дупло слово")
  - **Files Modified** (2 files):
    - `multiplayer/packages/client/src/i18n/locales/sr/online.json`
    - `multiplayer/packages/client/src/i18n/locales/sr/common.json`
  - **Impact**: More natural Serbian language throughout the interface

- **Multiplayer UI Alignment** (2026-01-10):
  - **Centered Game Title**: Multiplayer game title now centered to match local game
    - Title changed from left-aligned to centered
    - Connection status moved to top-right corner (absolute positioning)
    - Consistent visual alignment across both game modes
  - **Files Modified**: `multiplayer/packages/client/src/components/OnlineGame/OnlineGame.tsx`
  - **Build Status**: ✅ Multiplayer client builds successfully (357.54 KB JS, gzipped: 108.72 KB)

- **Joker Stealing Feature**: Complete implementation of joker stealing rule (2026-01-08)
  - **Rule Implementation**: Player can steal joker from opponent's last move
    - Only jokers played in the immediately previous turn can be stolen
    - Must have the matching letter tile in hand (if joker was assigned 'K', need 'K' tile)
    - Drag matching letter tile onto the joker to initiate steal
    - Joker returns to player's hand (reset, no assigned letter)
    - Matching letter tile replaces joker on board
  - **Visual Feedback**: Real-time steal validation during drag
    - **Green glow**: Dragged tile glows green when hovering over stealable joker with matching letter
    - **Red glow**: Dragged tile glows red when hovering over joker with non-matching letter
    - Glow includes thick ring and shadow effect for maximum visibility
    - Applied to tile in rack (not hidden under cursor)
  - **Floating Tooltip**: Context-aware feedback during drag
    - Appears above hovered joker on board
    - Positioned 80px above tile center
    - Semi-transparent with backdrop blur
    - Green tooltip: "✓ Can steal joker (K)"
    - Red tooltip: "✗ Cannot steal - need K, have A"
    - Follows cursor smoothly as you hover between squares
  - **Confirmation Dialog**: Prevents accidental stealing
    - Shows which joker letter is being stolen
    - Shows which tile will replace it
    - "Yes, Steal Joker" / "No, Cancel" buttons
  - **State Management**: Zustand store integration
    - `stealableJokers` array tracks position and assigned letter
    - Populated when jokers are played in `makeMove`
    - Cleared after `skipTurn`, `exchangeTiles`, or successful steal
    - `draggedTile` tracks currently dragged tile for visual feedback
    - `hoveredSquare` tracks hovered board position
  - **Type Safety**: Full TypeScript support
    - Added `stealableJokers` field to `GameState` interface
    - `stealJoker()` action with comprehensive validation
    - Proper type guards for `Tile` vs `BlockerTile`
  - **Turn Enforcement**: Automatic state clearing
    - Stealable jokers cleared after any move/skip/exchange
    - Ensures jokers can only be stolen on immediate next turn
    - No lingering stealable state across multiple turns

- **Enhanced Game Completion Screen**: Comprehensive end-game report (2026-01-07)
  - **Full Scoresheets**: Side-by-side display of all words played by each player across 10 rounds
  - **Visual Tile Penalties**: Shows remaining tiles with letter and point values using amber-colored badges
  - **Detailed Penalty Breakdown**: Displays exact penalty amount and tile count for each player
  - **Improved Layout**: Wide 2-column design matching online multiplayer experience
  - **Complete Game Stats**: Total moves, rounds completed, and game end reason

- **Automatic Game End Detection**: Game now automatically ends when conditions are met
  - Ends when both players complete 10 rounds
  - Ends when tile bag is empty and current player has no tiles
  - Ends when a player's time runs out (already implemented)
  - Displays reason for game ending on completion screen
  - Shows unused tiles penalty when applicable
  - Enhanced end game screen with more details

- **Exchange Tiles Feature**: Full tile exchange functionality
  - Click-to-select interface for choosing tiles to exchange
  - Visual feedback with purple theming when in exchange mode
  - Selected tiles highlighted with purple ring
  - Confirmation dialog before exchanging
  - Cannot exchange if tile bag is empty
  - **Rule enforcement**: Cannot exchange tiles two turns in a row
  - Must play a word or skip turn before exchanging again
  - Turn ends after exchange (recorded in move history)
  - Updated game controls with exchange mode UI
  - Updated game rules documentation (English and Serbian)

### Fixed
- **Tile Drawing on Round 10**: Fixed bug where tiles were drawn after final move (2026-01-07)
  - Players now finish with correct number of tiles remaining
  - Tiles are no longer drawn after completing round 10
  - Applies to both regular moves and tile exchanges
  - Ensures accurate tile penalty calculation at game end
  - Fixed undefined variable error that caused "square occupied" bugs

- **Tile Penalty Calculation**: Enhanced end-game penalty system (2026-01-07)
  - Added `tilePenalty` field to Player type for accurate tracking
  - Server stores calculated penalties (survives state sanitization)
  - Penalties calculated as: tile values + 10 points per joker
  - Applied to final scores before determining winner

- **Challenge System**: Full move undo on successful challenge
  - Tiles are now properly removed from board when challenge succeeds
  - Blockers placed during the challenged move are removed
  - Points are deducted from the challenged player
  - Tiles are returned to the challenged player's hand
  - Turn switches back to the challenged player (they get to play again)
  - Premium fields are restored to unused state
  - **Fixed tile count bug**: Newly drawn tiles are now properly removed during undo
    - Previously caused players to have 15 tiles instead of 10 after challenge
    - Now tracks `drawnTileIds` in move record for proper cleanup

### Planned
- Step 10: Testing and polish
- Remove debug logging from production
- AI opponent implementation
- Online multiplayer support

---

## [0.6.0] - 2026-01-04

### Added
- **Serbian Dictionary Expansion**: Comprehensive word list implementation
  - **Word Count**: Expanded from 150 words to **20,000 curated words**
  - **Source**: Hunspell Serbian Latin dictionary (263,909 entries processed)
  - **Optimization**: Intelligently selected most useful words for gameplay
  - **File Size**: 1.2 MB (optimized from 16 MB full version)
  - **Categories**: Nouns (14,197), Verbs (4,771), Adjectives (1,000), Pronouns (13), Numbers (19)
  - **Coverage**: 133x more words than original dictionary

- **Dictionary Processing Scripts**: Automated tools for dictionary management
  - `scripts/process-dictionary.js` - Converts Hunspell format to game JSON
  - `scripts/optimize-dictionary.js` - Optimizes word selection for gameplay
  - `scripts/README.md` - Complete documentation of processing pipeline

- **Tile Reordering Feature**: Players can now rearrange tiles in their hand
  - Drag and drop tiles within the rack to organize them
  - Visual feedback on drop target (scale animation)
  - Preserves tiles placed on the board
  - Enhanced tile rack UX for better gameplay

### Changed
- **Word Selection Algorithm**: Intelligent scoring system for word usefulness
  - Prioritizes shorter words (4-7 letters) for easier gameplay
  - Favors base forms (infinitives, nominatives) over inflected forms
  - Penalizes excessive inflections (instrumental plural, etc.)
  - Balanced category distribution

- **Game Store**: Added tile reordering functionality
  - New action: `reorderPlayerTiles(fromIndex, toIndex)`
  - Maintains separation between rack tiles and placed tiles

- **Tile Component**: Enhanced drag-and-drop support
  - New props: `tileIndex`, `isWithinRack`
  - Dual drag data format: supports both rack reordering and board placement
  - Format: `rack-tile:{index}:{tileId}` for rack, `{tileId}` for board

- **Board Component**: Updated to handle new drag data format
  - Parses both rack and direct tile ID formats
  - Seamless integration with tile reordering

### Technical Details
**Dictionary Processing Pipeline:**
1. Download Hunspell Serbian Latin dictionary (263,909 words)
2. Filter: minimum 4 letters, letters only, remove duplicates
3. Categorize: heuristic-based (verb endings, adjective patterns, etc.)
4. Score: rate words by gameplay usefulness (length, form, patterns)
5. Select: top 20,000 words with balanced distribution
6. Output: JSON format with metadata

**Word Scoring Criteria:**
- **Length bonus**: 4-letter words (+50), 5-letter (+40), 6-letter (+30)
- **Form bonus**: Infinitive verbs ending in -TI, -ĆI (+30)
- **Pattern penalties**: -IMA/-AMA/-OMA endings (-40), -OVIH (-30)
- **Long words**: 12+ letters penalized (-30)

**Optimization Results:**
- Original entries: 263,909
- After filtering: 261,077 unique words (4+ letters)
- After optimization: 20,000 most useful words
- Size reduction: 92.7% (16 MB → 1.2 MB)

### Files Added
**Dictionary Files:**
- `public/dictionary/serbian-words.json` - Active dictionary (20K words, 1.2 MB)
- `public/dictionary/serbian-words-full.json` - Full backup (261K words, 16 MB)
- `public/dictionary/serbian-words-backup-150.json` - Original starter (150 words)

**Scripts:**
- `scripts/process-dictionary.js` - Hunspell to JSON converter
- `scripts/optimize-dictionary.js` - Word selection optimizer
- `scripts/README.md` - Processing documentation

**Documentation:**
- `Docs/DICTIONARY-IMPLEMENTATION-2026-01-04.md` - Technical deep-dive (to be created)

### Files Modified
**Game Engine:**
- `src/store/gameStore.ts` - Added `reorderPlayerTiles` action
- `src/components/TileRack/TileRack.tsx` - Tile reordering with drag-and-drop
- `src/components/TileRack/Tile.tsx` - Enhanced drag data format
- `src/components/Board/Board.tsx` - Updated drag data parsing

**Documentation:**
- `README.md` - Updated dictionary count, marked expansion as complete
- `CHANGELOG.md` - This entry

**Build Status:** ✅ Successful (192.73 KB, gzipped: 60.18 KB)

### Performance Impact
- **Dictionary load time**: ~1-2 seconds (acceptable for web app)
- **Memory usage**: ~1.2 MB in memory (well optimized)
- **Lookup performance**: O(1) using Set data structure
- **No impact on game performance**: Dictionary loaded once at startup

### Data Sources & Attribution
- **Primary Source**: [Hunspell Serbian Latin Dictionary](https://github.com/titoBouzout/Dictionaries)
- **References**:
  - [Serbian Cyrillic and Latin Hunspell](https://github.com/grakic/hunspell-sr)
  - [Serbian Wordlists Collection](https://github.com/tperich/serbian-wordlists)
  - [Wooorm Dictionaries](https://github.com/wooorm/dictionaries)

### Migration Notes
- **Backward Compatible**: Game works with new dictionary out of the box
- **No breaking changes**: Dictionary API unchanged
- **Performance**: Initial load may be 1-2 seconds slower (negligible)
- **Backup**: Original 150-word dictionary preserved as backup

---

## [0.5.1] - 2026-01-03

### Added
- **Scoresheet Component**: Visual move-by-move tracking for each player
  - 10 rows (one per round) showing complete game history
  - Displays: Round number, word played, points scored, running total
  - Shows empty rows for future moves
  - Special formatting for SKIP and EXCHANGE moves (italicized)
  - Compact mode for sidebar display (smaller fonts, tighter spacing)
  - Final score total displayed in footer
  - Responsive layout adapts to screen size

### Changed
- **Game Layout**: Complete redesign for better visibility and maximum board size
  - **3-Column Layout (Desktop)**: [Scoresheets | Board+Rack | ScorePanel]
  - Scoresheets moved to left sidebar (280px wide, compact mode)
  - Board and tile rack in center column
  - Score panel and controls in right sidebar (300px wide)
  - **Mobile Layout**: Scoresheets below controls (stacked vertically)
  - Reduced header and spacing (mb-2 instead of mb-4)
  - Smaller padding throughout (p-2 on mobile, p-4 on desktop)

- **Board Component**: Optimized for maximum size while keeping rack visible
  - **Final Size**: `min(90vw, 70vh, 1400px)`
  - Max width: 1400px (was 700px initially)
  - Uses 70% of viewport height (was 55vh, then 62vh)
  - Smaller padding: p-2 on mobile, p-3 on desktop
  - **Result**: Large, playable board with rack always visible without scrolling
  - **Evolution**: 700px → 800px → 900px → 1000px → 1200px → 1400px

- **TileRack Component**: Heavily optimized to minimize wasted space
  - **Padding Reduction**: p-4 → py-2 px-3 (50% less vertical padding)
  - **Spacing Reduction**:
    - Outer gap: gap-4 → gap-1.5
    - Tile spacing: gap-2 → gap-1.5
    - Info margin: mt-3 → mt-1.5
  - **Font Sizes**: text-lg → text-base, text-sm → text-xs
  - **Empty State**: py-4 → py-2
  - **Result**: Eliminated gray area below rack, maximized board space

- **Game Component Spacing**:
  - Board/Rack gap: space-y-2 lg:space-y-3 → space-y-1.5
  - Consistent tight spacing throughout

- **Tile Value Display**: Fixed overlapping on board squares
  - **Font Size**: text-xs (12px) → text-[9px] (9px) - 25% smaller
  - **Position**: bottom-0.5 right-1 → bottom-0 right-0.5 (tighter corner)
  - **Result**: No overlap with letters, clean appearance

- **Scoresheet Compact Mode**:
  - Smaller text: xs (11px) vs sm (14px)
  - Tighter spacing: py-1 px-1 vs py-2 px-3
  - Abbreviated headers: "#", "Pts" instead of "Round", "Points"
  - Smaller footer: "Final:" instead of "Final Score:"
  - Player name only (no "'s Scoresheet" suffix)

### Files Modified
**UI Components:**
- src/components/Scoresheet/Scoresheet.tsx (new, with compact mode)
- src/components/Scoresheet/index.ts (new)
- src/components/Game/Game.tsx (complete layout redesign, tight spacing)
- src/components/Board/Board.tsx (optimized size: 1400px max, 70vh)
- src/components/TileRack/TileRack.tsx (minimized padding and spacing)
- src/components/Board/Square.tsx (tile value positioning fix)

**Build Status:** ✅ Successful (191.47 KB)

### UX Improvements
- ✅ **Maximum board size** (1400px) while rack stays visible
- ✅ **Zero scrolling required** - everything visible at once
- ✅ **Scoresheets always visible** in sidebar (desktop)
- ✅ **Compact tile rack** - eliminated wasted space
- ✅ **Clean tile display** - no overlapping point values
- ✅ **Better use of screen real estate**
- ✅ **3-column design** maximizes information density

### Technical Details
**Layout Optimization Process:**
1. Initial: Board 700px, rack had excessive padding
2. Reduced rack padding/spacing (p-4 → py-2 px-3)
3. Increased board iteratively: 700px → 1400px
4. Adjusted viewport height: 55vh → 70vh
5. Fixed tile value overlap (smaller font, corner position)
6. Result: ~100% larger board, no scrolling needed

---

## [0.5.0] - 2026-01-02

### Added - Steps 5-7 Complete + Challenge System ✅

#### Challenge System Implementation
- **Challenge Mechanism**: Words are no longer automatically validated against dictionary
  - Players can challenge opponent's last word after it's played
  - Challenge button appears with pulsing orange/red gradient animation
  - Shows challenged word: `⚠️ Challenge Word: "STEN"`
  - Confirmation dialog warns about 3-minute penalty
- **Challenge Success** (word is invalid):
  - Move is undone (TODO: full implementation pending)
  - Player who played word loses their turn
  - Detailed success dialog with reason
- **Challenge Failure** (word is valid):
  - Challenger loses exactly 3 minutes (180 seconds) from time
  - Word stays on board, game continues
  - Time penalty applied immediately to current player
- **UI Components**:
  - Challenge button in GameControls with conditional visibility
  - Result dialogs for both success and failure outcomes
  - Integration with existing game flow

#### State Management Enhancements (src/store/)
- **gameStore.ts**: Added challenge-related state and actions
  - New state: `lastPlayedWord` - Tracks word, player index, and move index
  - New action: `challengeLastWord()` - Validates and handles challenge outcomes
  - Updated `makeMove()` to store played word for potential challenges
  - Time penalty system (3 minutes = 180 seconds)
  - WordValidator integration for challenge validation

#### Game Engine Improvements (src/game-engine/)
- **MoveValidator.ts**:
  - Removed automatic dictionary validation
  - Only validates structural requirements (length, line, connectivity)
  - Added `wordText` to MoveValidationResult for challenge system
  - Fixed word extraction timing (before tile removal)
  - Added debug logging for validation flow
- **Board.ts**:
  - Enhanced `getTilesInLine()` to respect blocker tile boundaries
  - Stops scanning at blockers (fixes word detection across existing words)

#### UI Components (src/components/)
- **GameControls.tsx**:
  - Added Challenge button with conditional rendering
  - Challenge confirmation and result dialogs
  - Integration with game store challenge action
  - Pulsing animation to draw attention to challenge opportunity

#### Documentation
- **Docs/FIXES-2026-01-02.md**: Comprehensive bug fix and feature documentation
  - Detailed analysis of word validation bug (3 root causes)
  - Challenge system implementation guide
  - Code examples with before/after comparisons
  - Technical details and flow diagrams
  - Known issues and TODOs
  - Testing checklist

#### Build Status
- ✅ TypeScript compiles successfully
- ✅ Production build: ~187KB JS + 31KB CSS (gzipped: 58.6KB + 5.9KB)
- ✅ 59 modules transformed
- ✅ All features working correctly
- ✅ No compilation errors

### Fixed

#### Critical Bug: Word Validation - "Invalid words: E (Word too short)"
**Issue:** When placing words that reuse letters from existing words, validator incorrectly reported single letters as invalid.

**Root Causes & Solutions:**

1. **Word Extraction Timing Bug** (src/game-engine/MoveValidator.ts:174-187)
   - **Problem**: Word was extracted AFTER tiles were removed from board
   - `mainWord` array contained references to BoardSquare objects
   - When tiles removed, squares had `tile = null`
   - Validator only found existing letters, not newly placed ones
   - **Solution**: Extract `wordText` BEFORE removing temporary tiles

2. **Blocker Tile Boundary Bug** (src/game-engine/Board.ts:253-296)
   - **Problem**: `getTilesInLine()` scanned through blocker tiles
   - Blocker tiles mark word boundaries but were treated as regular tiles
   - **Solution**: Stop scanning when encountering empty OR blocker tiles
   - Applied to all four directions (left, right, up, down)

3. **Cross-Word Validation** (src/game-engine/MoveValidator.ts:152-172)
   - **Problem**: Validator checked ALL words (main + cross-words) like Scrabble
   - Validated single letters at intersections as separate words
   - **Solution**: Only validate the main word being played
   - Cross-words from previous turns don't need re-validation

**Result:** Words now properly detected when reusing letters from existing words. No more false "Word too short" errors.

#### Critical Bug: Premium Field Multipliers Not Applied
**Issue:** Premium field multipliers (2x, 3x, 4x letter bonuses and 2x word multipliers) were never being applied to scores when tiles were placed on colored squares.

**Root Cause & Solution:**
- **Problem**: Timing issue - `isUsed` flag set too early in move execution
  - `Board.setTile()` immediately marked premium squares as used
  - Score calculation happened AFTER tiles were placed
  - Multiplier check failed because `isUsed = true`
  - All scores calculated as if on normal squares

- **Solution** (src/game-engine/Board.ts, src/store/gameStore.ts):
  1. Removed auto-marking logic from `setTile()` method
  2. Added new `markSquaresAsUsed()` method
  3. Reordered operations: Place tiles → Calculate score → Mark as used
  4. Premium squares remain unmarked during scoring (multipliers apply)
  5. Marked as used after scoring (prevents double-application)

- **Debug Logging** (src/game-engine/ScoreCalculator.ts):
  - Added detailed logging for each tile's score calculation
  - Shows position, value, premium field type, isUsed status
  - Logs when multipliers are applied (✅ Applied DOUBLE_LETTER: 2 × 2 = 4)
  - Logs final score breakdown

**Result:** Premium field multipliers now correctly apply to newly placed tiles. All colored squares (yellow, green, red, blue) provide their intended score bonuses.

#### Visual Bug: Premium Square Colors Not Showing
**Issue:** Premium squares appeared gray instead of showing their colors (yellow, green, red, blue).

**Root Cause & Solution:**
- **Problem**: Tailwind CSS v4 uses different syntax than v3
  - Custom colors defined in `tailwind.config.js` were ignored
  - Tailwind v4 requires `@theme` directive with CSS custom properties

- **Solution** (src/index.css):
  - Added `@theme` block with CSS custom properties
  - Defined all premium field colors: `--color-premium-yellow`, `--color-premium-green`, etc.
  - Colors: Yellow (#ffd700), Green (#22c55e), Red (#ef4444), Blue (#3b82f6)

**Result:** Premium squares now display their correct colors matching official Kvizovka board.

#### Critical Bug: Blocker Tiles Not Placed at Correct Word Boundaries
**Issue:** When a word reused letters from existing words, blocker tiles were not placed at the correct boundaries. Missing blockers above/below the complete word.

**Example:**
- Word "AMEN" played vertically through "A" and "E" from existing "EGAR"
- New tiles: M, N
- Reused tiles: A, E
- Expected: Blocker above A, blocker below N
- Actual: Blocker above M (WRONG!), blocker below N

**Root Cause & Solution:**
- **Problem**: `placeBlockers()` received only newly placed tiles [M, N]
  - Sorted [M, N] and thought M was the first letter
  - Placed blocker above M instead of above A

- **Solution** (src/game-engine/Board.ts, src/store/gameStore.ts):
  1. Changed `placeBlockers()` signature from `PlacedTile[]` to `BoardSquare[]`
  2. Now accepts complete main word including reused letters
  3. Updated gameStore to pass `validation.wordsFormed[0]` (complete word)
  4. Added debug logging to track blocker placement

**Result:** Blocker tiles now correctly placed at the start and end of the complete word, including reused letters.

### Changed
- **Validation Flow**: Structural validation only (no automatic dictionary check)
- **Game Rules**: Challenge-based word validation instead of automatic
- **MoveValidationResult**: Added `wordText` field for challenges
- **Board Scanning**: Now respects blocker tile boundaries
- **Word Detection**: Only main word validated, not cross-words
- **Premium Square Marking**: Now occurs after score calculation (not during tile placement)
- **Score Calculation**: Added extensive debug logging for troubleshooting
- **Styling**: Migrated to Tailwind CSS v4 @theme syntax for custom colors
- **Blocker Placement**: Changed signature to accept complete word (BoardSquare[]) instead of only new tiles
- **Blocker Logic**: Now places blockers at correct boundaries for words with reused letters

### Project Status
- **Phase:** Steps 5-7 Complete + Challenge System
- **Build Status:** ✅ Passing
- **Game Engine:** ✅ Complete (Board, TileBag, MoveValidator, ScoreCalculator, WordValidator)
- **State Management:** ✅ Complete with Zustand persistence
- **UI Components:** ✅ Complete (Board, TileRack, Timer, ScorePanel, GameControls)
- **Drag-and-Drop:** ✅ Working (hand ↔ board bidirectional)
- **Joker System:** ✅ Complete (letter selection, visual distinction)
- **Challenge System:** ✅ Complete (except full move undo)
- **Ready for:** Step 8 - Drag-and-drop polish

### Known Issues
1. **Challenge Success - Move Undo Incomplete**
   - Location: `src/store/gameStore.ts:625-631`
   - Current: Only clears `lastPlayedWord`
   - Needed: Remove tiles, restore hand, revert score, remove from history
   - Priority: High

2. **Debug Logging in Production**
   - Locations:
     - `src/game-engine/MoveValidator.ts:148-181` (validation)
     - `src/game-engine/ScoreCalculator.ts:88-142` (scoring)
     - `src/game-engine/Board.ts:436` (marking squares as used)
     - `src/game-engine/Board.ts:344,354,364,373` (blocker placement)
     - `src/store/gameStore.ts:308-312` (blocker placement)
   - Issue: Console logs enabled in production build
   - Solution: Wrap in development check or remove

### Notes
- Challenge system follows official Kvizovka rules (no automatic validation)
- Time penalty is exactly 3 minutes (180 seconds)
- Blocker tiles now properly mark word boundaries (including words with reused letters)
- Word detection significantly improved for complex board states
- Debug logging helps diagnose validation, scoring, and blocker placement issues
- Full move undo system needed for challenge success completion
- Premium field multipliers now working correctly (timing bug fixed)
- Premium square colors migrated to Tailwind v4 syntax
- Score calculation order critical: place → score → mark used
- Blocker placement now uses complete word (validation.wordsFormed[0]) not just new tiles

### Files Modified (15 total)
**Game Engine:**
- src/game-engine/MoveValidator.ts (validation logic, word extraction fix)
- src/game-engine/Board.ts (blocker boundaries, markSquaresAsUsed method, placeBlockers signature change, blocker debug logging)
- src/game-engine/ScoreCalculator.ts (score calculation debug logging)

**State Management:**
- src/store/gameStore.ts (challenge mechanism, markSquaresAsUsed call, pass complete word to placeBlockers, blocker debug logging)

**UI Components:**
- src/components/GameControls/GameControls.tsx (challenge button)

**Styling:**
- src/index.css (Tailwind v4 @theme directive)
- src/constants/board-config.ts (premium positions - user corrected)

**Documentation:**
- Docs/FIXES-2026-01-02.md (comprehensive bug documentation - 5 bugs documented)
- CHANGELOG.md (this file)

---

## [0.4.0] - 2026-01-01

### Added - Step 4: Serbian Dictionary Integration ✅

#### Dictionary JSON File (public/dictionary/)
- **serbian-words.json**: 150-word Serbian dictionary for MVP testing
  - 80 nouns (KUĆA, VODA, GRAD, KNJIGA, etc.)
  - 35 verbs (JESTI, PITI, SPAVATI, TRČATI, etc.)
  - 24 adjectives (VELIKI, MALI, DOBAR, BRZO, etc.)
  - 7 pronouns (OVAJ, ONAJ, KOJI, NEKO, etc.)
  - 9 numbers (JEDAN, ČETIRI, SEDAM, DESET, etc.)
- All words follow Kvizovka rules:
  - Minimum 4 letters
  - Nouns in nominative case only
  - Verbs in infinitive, non-reflexive
  - Adjectives in positive form
  - Latin script (Serbian standard)
- Metadata: version, language, script, word count, categories
- Includes definitions for future dictionary lookup feature

#### Dictionary Utility Class (src/utils/)
- **dictionary.ts**: Comprehensive Dictionary class with:
  - **Async loading**: Fetches JSON file and builds lookup structures
  - **Fast validation**: O(1) lookup using Set data structure
  - **Category filtering**: Map-based category grouping
  - **Pattern search**: Wildcard support (? = any char, * = any chars)
  - **Statistics**: Word counts, category distribution
  - **Random word**: For testing and AI functionality

- **Core methods**:
  - `load()`: Async dictionary loading from JSON
  - `isValidWord(word)`: Fast boolean check
  - `getWordCategory(word)`: Get word's category
  - `validateWord(word)`: Detailed validation result
  - `getWordsByCategory(category)`: Filter by category
  - `searchWords(pattern)`: Pattern matching with wildcards
  - `getRandomWord(category?)`: Random word selection
  - `getWordCount()`, `getCategoryCounts()`: Statistics

- **Data structures**:
  - `wordSet: Set<string>` - O(1) word lookup
  - `categoryMap: Map<Category, Set<string>>` - Category grouping
  - `wordCategoryMap: Map<string, Category>` - Word → category mapping

- **Singleton pattern**: Single shared instance across app

#### Updated Components
- **src/App.tsx**: Added dictionary integration demo
  - Automatic dictionary loading on app startup
  - Word validation testing UI
  - Input field for word entry (auto-uppercase)
  - "Validate" button with Enter key support
  - Quick-test buttons (KUĆA, VODA, JESTI, VELIKI, INVALID)
  - Real-time validation results with category display
  - Loading states (loading, success, error)
  - Dictionary statistics display (word count)
  - Interactive demo with instant feedback

#### Documentation
- **Docs/STEP_04_DICTIONARY.md**: Complete Step 4 documentation
  - Dictionary structure and implementation
  - Data structures explained (Set, Map, async/await)
  - Usage examples for all methods
  - Research on open-source Serbian dictionaries
  - Future expansion plans (150 → 1K → 10K → 40K words)
  - Performance optimization notes
  - Learning resources (async/await, Set, Map, useEffect)
  - Testing guide

#### Build Status
- ✅ TypeScript compiles successfully
- ✅ Production build: ~151KB JS + 20KB CSS (gzipped: 48.5KB + 4.4KB)
- ✅ 40 modules transformed
- ✅ Dictionary loads and validates correctly
- ✅ No compilation errors

### Changed
- Updated App.tsx to demonstrate dictionary functionality
- Updated status badge to show "Step 4 Complete"
- Bundle size increased by 1KB (dictionary utility added)

### Project Status
- **Phase:** Step 4 of 10 - Dictionary integrated
- **Build Status:** ✅ Passing
- **Dictionary:** ✅ 150 words loaded and validated
- **Word Validation:** ✅ Working with O(1) lookup
- **Ready for:** Step 5 - Core game engine implementation

### Research Sources
- [ivkeapp/serbian-dictionary-api](https://github.com/ivkeapp/serbian-dictionary-api) - 41K+ words in JSON
- [tperich/serbian-wordlists](https://github.com/tperich/serbian-wordlists) - 938K words collection
- [turanjanin/serbian-language-tools](https://github.com/turanjanin/serbian-language-tools) - SQLite dictionary
- [Wiktionary Serbian frequency list](https://en.m.wiktionary.org/wiki/Wiktionary:Frequency_lists/Serbian_wordlist) - 10K common words

### Notes
- Started with 150 curated words for MVP testing
- All words manually verified to follow Kvizovka rules
- Dictionary can easily expand to 1K+ words in future phases
- Performance optimized with Set/Map for O(1) lookups
- Singleton pattern ensures dictionary loads only once
- Future: Add Cyrillic support, expand vocabulary, add definitions

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
- [Localization Plan (2026-01-10)](./Docs/LOCALIZATION-PLAN-2026-01-10.md)
- [Bug Fixes & Features (2026-01-02)](./Docs/FIXES-2026-01-02.md)
- [Step 1 Documentation](./Docs/STEP_01_PROJECT_SETUP.md)

---

**Last Updated:** 2026-01-10
**Current Version:** 0.7.0 (Full Internationalization - English & Serbian with Cyrillic)
**Next Milestone:** Step 9 - Game Flow Completion & Online Multiplayer

# Kvizovka Localization (i18n) - Implementation Plan

**Date:** January 10, 2026
**Status:** Approved - Ready for Implementation

---

## Current Status

✅ **Codebase Analysis Complete:**
- ~100+ UI strings identified across components
- ~40+ error/validation messages in game engine
- No existing i18n infrastructure
- Both local game and multiplayer packages need localization
- Serbian dictionary already exists (20K words)

## Goal

Make Kvizovka fully localizable with English and Serbian language support across both local and multiplayer modes.

---

## User Requirements (Confirmed)

| Requirement | Decision |
|-------------|----------|
| **Languages** | English (default) + Serbian |
| **Scope** | Both local game and multiplayer |
| **Game Engine** | Yes - localize validation messages |
| **Language Detection** | Auto-detect from browser + manual switcher |

---

## Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Client i18n** | react-i18next | React standard, hooks-based, SSR-ready |
| **Server i18n** | i18next (core) | Share translation logic with client |
| **Namespace Pattern** | Feature-based namespaces | Better organization, lazy loading |
| **Translation Files** | JSON | Standard format, easy to edit, type-safe with TypeScript |
| **Language Detection** | i18next-browser-languagedetector | Auto-detect from browser settings |
| **Type Safety** | react-i18next TypeScript integration | Autocomplete for translation keys |

---

## Architecture Overview

### File Structure

```
# Local Game
src/
├── i18n/
│   ├── config.ts                    # i18next configuration
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json          # Common UI strings (buttons, labels)
│   │   │   ├── game.json            # Game-specific UI
│   │   │   ├── menu.json            # Menu screens
│   │   │   ├── validation.json      # Game engine error messages
│   │   │   └── dialogs.json         # Modal dialog content
│   │   └── sr/                      # Serbian translations (same structure)
│   │       ├── common.json
│   │       ├── game.json
│   │       ├── menu.json
│   │       ├── validation.json
│   │       └── dialogs.json
│   └── types.ts                     # TypeScript types for translations

# Multiplayer Client
multiplayer/packages/client/src/
├── i18n/
│   ├── config.ts
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── game.json
│   │   │   ├── online.json          # Online-specific (rooms, matchmaking)
│   │   │   └── validation.json
│   │   └── sr/
│   │       └── ... (same structure)

# Multiplayer Server
multiplayer/packages/server/src/
├── i18n/
│   ├── config.ts
│   ├── locales/
│   │   ├── en/
│   │   │   ├── errors.json          # Server error messages
│   │   │   └── validation.json      # Game validation messages
│   │   └── sr/
│   │       └── ... (same structure)
```

---

## Implementation Plan

### Step 1: Install Dependencies (15 min)

**Local Game:**
```bash
cd /Users/draganbesevic/Projects/claude/Kvizovka
npm install i18next react-i18next i18next-browser-languagedetector
npm install -D @types/i18next
```

**Multiplayer:**
```bash
cd /Users/draganbesevic/Projects/claude/Kvizovka/multiplayer
# Client
cd packages/client
npm install i18next react-i18next i18next-browser-languagedetector

# Server
cd ../server
npm install i18next
```

---

### Step 2: Extract and Organize Strings (2-3 hours)

#### 2.1: Create Translation Files

**Example: `src/i18n/locales/en/common.json`**
```json
{
  "buttons": {
    "start": "Start Game",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "exchange": "Exchange Tiles",
    "skip": "Skip Turn",
    "challenge": "Challenge"
  },
  "labels": {
    "score": "Score",
    "tiles": "Tiles",
    "tilesLeft": "Tiles Left",
    "rounds": "Rounds Played",
    "player": "Player",
    "opponent": "Opponent"
  }
}
```

**Example: `src/i18n/locales/en/validation.json`**
```json
{
  "errors": {
    "invalidMove": "Invalid move",
    "notYourTurn": "It's not your turn",
    "noTilesPlaced": "No tiles placed",
    "invalidWord": "Invalid word: {{word}}",
    "mustConnectToCenter": "First word must cover the center square",
    "mustConnectToExisting": "New tiles must connect to existing words",
    "gapInWord": "Words cannot have gaps",
    "notEnoughTiles": "Not enough tiles to exchange",
    "invalidPosition": "Invalid tile position"
  },
  "success": {
    "wordValid": "Word is valid!",
    "challengeSuccessful": "Challenge successful! Invalid word: {{word}}",
    "challengeFailed": "Challenge failed. Word is valid."
  }
}
```

**Example: `src/i18n/locales/sr/common.json`**
```json
{
  "buttons": {
    "start": "Започни Игру",
    "cancel": "Откажи",
    "confirm": "Потврди",
    "close": "Затвори",
    "exchange": "Замени Плочице",
    "skip": "Прескочи Потез",
    "challenge": "Изазови"
  },
  "labels": {
    "score": "Резултат",
    "tiles": "Плочице",
    "tilesLeft": "Преостало Плочица",
    "rounds": "Одиграно Рунди",
    "player": "Играч",
    "opponent": "Противник"
  }
}
```

#### 2.2: String Categories

Based on exploration, organize into namespaces:

| Namespace | Examples | Count |
|-----------|----------|-------|
| **common** | Buttons, labels, generic UI | ~30 |
| **game** | Game board, scoring, turns | ~25 |
| **menu** | Main menu, settings, player setup | ~20 |
| **validation** | Move validation, word checking | ~40 |
| **dialogs** | Modals (game over, confirmation, etc.) | ~15 |
| **online** (multiplayer only) | Rooms, matchmaking, connection | ~25 |

---

### Step 3: Setup i18n Configuration (30 min)

#### 3.1: Local Game Config

**`src/i18n/config.ts`:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enGame from './locales/en/game.json';
import enMenu from './locales/en/menu.json';
import enValidation from './locales/en/validation.json';
import enDialogs from './locales/en/dialogs.json';

import srCommon from './locales/sr/common.json';
import srGame from './locales/sr/game.json';
import srMenu from './locales/sr/menu.json';
import srValidation from './locales/sr/validation.json';
import srDialogs from './locales/sr/dialogs.json';

const resources = {
  en: {
    common: enCommon,
    game: enGame,
    menu: enMenu,
    validation: enValidation,
    dialogs: enDialogs,
  },
  sr: {
    common: srCommon,
    game: srGame,
    menu: srMenu,
    validation: srValidation,
    dialogs: srDialogs,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'game', 'menu', 'validation', 'dialogs'],

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kvizovka-language',
    },
  });

export default i18n;
```

#### 3.2: Initialize in App

**`src/main.tsx`:**
```typescript
import './i18n/config'; // Add this import BEFORE App
import App from './App';
// ... rest of imports

// ... rest of file
```

---

### Step 4: Create Language Switcher Component (30 min)

**`src/components/LanguageSwitcher/LanguageSwitcher.tsx`:**
```typescript
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1 rounded ${
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
};
```

**Add to Menu component (top-right corner):**
```typescript
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';

// Inside Menu component JSX:
<div className="absolute top-4 right-4">
  <LanguageSwitcher />
</div>
```

---

### Step 5: Migrate Components to use i18n (3-4 hours)

#### 5.1: Component Migration Pattern

**Before:**
```typescript
<button onClick={onStart}>Start Game</button>
<p>Score: {player.score}</p>
```

**After:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'game']);

  return (
    <>
      <button onClick={onStart}>{t('common:buttons.start')}</button>
      <p>{t('common:labels.score')}: {player.score}</p>
    </>
  );
};
```

#### 5.2: Components to Migrate (Priority Order)

| Priority | Component | Namespace | Estimated Time |
|----------|-----------|-----------|----------------|
| 1 | Menu.tsx | menu, common | 20 min |
| 2 | Game.tsx | game, common | 30 min |
| 3 | ScorePanel.tsx | game, common | 15 min |
| 4 | TileRack.tsx | game, common | 15 min |
| 5 | GameOverDialog.tsx | dialogs, common | 20 min |
| 6 | ConfirmDialog.tsx | dialogs, common | 15 min |
| 7 | PlayerSetup.tsx | menu, common | 20 min |

#### 5.3: Dynamic Translations (Interpolation)

For messages with variables:

```typescript
// Translation file:
{
  "gameOver": "Game Over! Winner: {{winner}}",
  "tilesRemaining": "{{count}} tiles remaining",
  "invalidWord": "Invalid word: {{word}}"
}

// Usage:
t('dialogs:gameOver', { winner: player.name })
t('game:tilesRemaining', { count: tilesLeft })
t('validation:errors.invalidWord', { word: 'НЕДОЗВОЉЕНО' })
```

---

### Step 6: Localize Game Engine Validation (1-2 hours)

#### 6.1: Update Validation Classes

**Problem:** Game engine classes return hardcoded error strings

**Solution:** Accept i18n translate function as parameter OR use error codes

**Approach 1: Error Codes (Recommended)**

**`src/utils/move-validator.ts` (example):**
```typescript
// Before:
throw new Error('First word must cover the center square');

// After:
throw new Error('MUST_CONNECT_TO_CENTER');
```

**Catch and translate in component:**
```typescript
try {
  validator.validate(move);
} catch (error) {
  const errorKey = `validation:errors.${camelCase(error.message)}`;
  showError(t(errorKey));
}
```

**Approach 2: Pass i18n function (Alternative)**

```typescript
class MoveValidator {
  constructor(private t: TFunction) {}

  validate(move: Move) {
    if (!coversCenterSquare) {
      throw new Error(this.t('validation:errors.mustConnectToCenter'));
    }
  }
}
```

#### 6.2: Files to Update

- `src/utils/move-validator.ts`
- `src/utils/word-validator.ts`
- `src/utils/tile-bag.ts` (if has user-facing messages)
- `src/store/gameStore.ts` (error handling)

---

### Step 7: Multiplayer Localization (1-2 hours)

#### 7.1: Client Setup (Same as Local)

- Create `multiplayer/packages/client/src/i18n/` structure
- Add `online.json` namespace for room/matchmaking strings
- Initialize in `main.tsx`

#### 7.2: Server-Side Translations

**Why:** Server sends error messages to clients

**`multiplayer/packages/server/src/i18n/config.ts`:**
```typescript
import i18next from 'i18next';

import enErrors from './locales/en/errors.json';
import srErrors from './locales/sr/errors.json';

i18next.init({
  lng: 'en', // Default server language
  resources: {
    en: { errors: enErrors },
    sr: { errors: srErrors },
  },
});

export default i18next;
```

#### 7.3: Localized Error Responses

**Server sends error codes instead of messages:**

```typescript
// Server (game-manager.ts):
socket.emit('error', { code: 'INVALID_MOVE', details: { word: 'XYZ' } });

// Client translates:
socket.on('error', ({ code, details }) => {
  const message = t(`validation:errors.${code}`, details);
  showError(message);
});
```

**Benefits:**
- Server stays language-agnostic
- Client controls language
- Easier to add languages (only update client)

---

### Step 8: Type Safety (30 min)

#### 8.1: Generate Translation Types

**`src/i18n/types.ts`:**
```typescript
import 'react-i18next';
import common from './locales/en/common.json';
import game from './locales/en/game.json';
import menu from './locales/en/menu.json';
import validation from './locales/en/validation.json';
import dialogs from './locales/en/dialogs.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      game: typeof game;
      menu: typeof menu;
      validation: typeof validation;
      dialogs: typeof dialogs;
    };
  }
}
```

**Benefits:**
- Autocomplete for translation keys
- Compile-time errors for missing keys
- Refactoring safety

---

### Step 9: Testing (1 hour)

#### 9.1: Manual Testing Checklist

- [ ] Language auto-detected from browser settings
- [ ] Language switcher changes UI immediately
- [ ] Selected language persists in localStorage
- [ ] All screens translated (Menu, Game, Dialogs)
- [ ] Error messages translated
- [ ] Dynamic content (scores, player names) displays correctly
- [ ] Serbian characters render correctly (Ђ, Љ, Њ, Џ, etc.)
- [ ] Missing translation keys fallback to English
- [ ] Multiplayer room/matchmaking messages translated
- [ ] Server error messages appear in correct language

#### 9.2: Test Both Languages

- Play full game in English
- Switch to Serbian mid-game
- Play full game in Serbian
- Test all dialogs (game over, confirm, etc.)
- Test all error scenarios (invalid move, etc.)

---

## Translation Guidelines

### Key Naming Convention

```
namespace:category.specificKey
```

**Examples:**
```
common:buttons.start
common:labels.score
game:turn.yourTurn
validation:errors.invalidMove
dialogs:gameOver.title
```

### Best Practices

1. **Keep keys semantic, not literal:**
   - ✅ `buttons.start`
   - ❌ `startGame`

2. **Use namespaces to organize:**
   - Common UI → `common`
   - Game-specific → `game`
   - Errors → `validation`

3. **Avoid concatenation:**
   - ❌ `t('hello') + ' ' + player.name`
   - ✅ `t('greeting', { name: player.name })`

4. **Pluralization:**
   ```json
   {
     "tilesLeft": "{{count}} tile remaining",
     "tilesLeft_plural": "{{count}} tiles remaining"
   }
   ```

5. **Context for ambiguous words:**
   ```json
   {
     "play_verb": "Play",    // Button text
     "play_noun": "Play"     // Noun (e.g., "Nice play!")
   }
   ```

---

## Migration Strategy

### Incremental Migration (Recommended)

**Phase 1: Infrastructure (30 min)**
- Install dependencies
- Setup i18n config
- Add language switcher to menu

**Phase 2: High-Priority Components (2 hours)**
- Menu screens (most visible)
- Game UI (ScorePanel, TileRack)
- Dialogs (GameOver, Confirm)

**Phase 3: Game Engine (1-2 hours)**
- Error messages
- Validation messages
- Success messages

**Phase 4: Multiplayer (1-2 hours)**
- Online menu
- Room management
- Server messages

**Phase 5: Polish (1 hour)**
- Test all scenarios
- Fix missing translations
- Add type safety
- Update documentation

**Total Time: ~6-8 hours**

---

## Critical Files to Create/Modify

### New Files (Local Game)

1. `src/i18n/config.ts` - i18next setup
2. `src/i18n/locales/en/common.json` - English common strings
3. `src/i18n/locales/en/game.json` - English game strings
4. `src/i18n/locales/en/menu.json` - English menu strings
5. `src/i18n/locales/en/validation.json` - English validation messages
6. `src/i18n/locales/en/dialogs.json` - English dialog content
7. `src/i18n/locales/sr/*` - Serbian translations (same structure)
8. `src/i18n/types.ts` - TypeScript types
9. `src/components/LanguageSwitcher/LanguageSwitcher.tsx` - Language switcher UI

### New Files (Multiplayer)

10. `multiplayer/packages/client/src/i18n/` - Same structure as local game + `online.json`
11. `multiplayer/packages/server/src/i18n/config.ts` - Server i18n setup
12. `multiplayer/packages/server/src/i18n/locales/en/errors.json` - Server error messages

### Modified Files

**Local Game:**
1. `src/main.tsx` - Import i18n config
2. `src/components/Menu/Menu.tsx` - Add LanguageSwitcher, use t()
3. `src/components/Game/Game.tsx` - Use t() for UI strings
4. `src/components/ScorePanel/ScorePanel.tsx` - Use t() for labels
5. `src/components/TileRack/TileRack.tsx` - Use t() for UI
6. `src/components/GameOverDialog/GameOverDialog.tsx` - Use t()
7. `src/components/ConfirmDialog/ConfirmDialog.tsx` - Use t()
8. `src/store/gameStore.ts` - Error handling with translation
9. `src/utils/move-validator.ts` - Error codes or i18n
10. `src/utils/word-validator.ts` - Error codes or i18n

**Multiplayer:**
11. `multiplayer/packages/client/src/main.tsx` - Import i18n
12. `multiplayer/packages/client/src/components/OnlineMenu/*` - Use t()
13. `multiplayer/packages/client/src/components/OnlineGame/*` - Use t()
14. `multiplayer/packages/server/src/websocket.ts` - Send error codes
15. `multiplayer/packages/server/src/game-manager.ts` - Send error codes

---

## Success Criteria

### Local Game
- [ ] Language auto-detected on first load
- [ ] Language switcher functional in Menu
- [ ] All UI strings translated (English + Serbian)
- [ ] Game engine errors translated
- [ ] Dialogs fully translated
- [ ] Selected language persists across sessions
- [ ] No hardcoded strings remaining in components

### Multiplayer
- [ ] Same criteria as local game
- [ ] Online-specific screens translated (rooms, matchmaking)
- [ ] Server error messages localized on client
- [ ] Language preference syncs between local and online modes

### Technical
- [ ] TypeScript autocomplete works for translation keys
- [ ] Missing keys fallback to English
- [ ] No console warnings about missing translations
- [ ] Serbian characters (Ђ, Љ, Њ, etc.) render correctly
- [ ] Build succeeds with no errors

---

## Example Translation Files

### `src/i18n/locales/en/common.json`
```json
{
  "buttons": {
    "start": "Start Game",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "exchange": "Exchange Tiles",
    "skip": "Skip Turn",
    "challenge": "Challenge",
    "back": "Back",
    "newGame": "New Game"
  },
  "labels": {
    "score": "Score",
    "tiles": "Tiles",
    "tilesLeft": "Tiles Left",
    "rounds": "Rounds Played",
    "player": "Player",
    "opponent": "Opponent",
    "yourTurn": "Your Turn",
    "opponentTurn": "Opponent's Turn"
  }
}
```

### `src/i18n/locales/sr/common.json`
```json
{
  "buttons": {
    "start": "Започни Игру",
    "cancel": "Откажи",
    "confirm": "Потврди",
    "close": "Затвори",
    "exchange": "Замени Плочице",
    "skip": "Прескочи Потез",
    "challenge": "Изазови",
    "back": "Назад",
    "newGame": "Нова Игра"
  },
  "labels": {
    "score": "Резултат",
    "tiles": "Плочице",
    "tilesLeft": "Преостало Плочица",
    "rounds": "Одиграно Рунди",
    "player": "Играч",
    "opponent": "Противник",
    "yourTurn": "Твој Потез",
    "opponentTurn": "Потез Противника"
  }
}
```

### `src/i18n/locales/en/validation.json`
```json
{
  "errors": {
    "invalidMove": "Invalid move",
    "notYourTurn": "It's not your turn",
    "noTilesPlaced": "No tiles placed on the board",
    "invalidWord": "Invalid word: {{word}}",
    "mustConnectToCenter": "First word must cover the center square",
    "mustConnectToExisting": "New tiles must connect to existing words",
    "gapInWord": "Words cannot have gaps",
    "notEnoughTiles": "Not enough tiles to exchange (minimum 7 required)",
    "invalidPosition": "Invalid tile position",
    "tileAlreadyPlaced": "A tile is already placed at this position"
  },
  "success": {
    "wordValid": "Word is valid!",
    "challengeSuccessful": "Challenge successful! Invalid word: {{word}}",
    "challengeFailed": "Challenge failed. The word is valid.",
    "tilesExchanged": "{{count}} tiles exchanged"
  }
}
```

### `src/i18n/locales/sr/validation.json`
```json
{
  "errors": {
    "invalidMove": "Неисправан потез",
    "notYourTurn": "Није ваш ред",
    "noTilesPlaced": "Ниједна плочица није постављена на табли",
    "invalidWord": "Неисправна реч: {{word}}",
    "mustConnectToCenter": "Прва реч мора покрити централно поље",
    "mustConnectToExisting": "Нове плочице морају бити повезане са постојећим речима",
    "gapInWord": "Речи не могу имати празнине",
    "notEnoughTiles": "Недовољно плочица за замену (потребно је минимум 7)",
    "invalidPosition": "Неисправна позиција плочице",
    "tileAlreadyPlaced": "Плочица је већ постављена на овој позицији"
  },
  "success": {
    "wordValid": "Реч је исправна!",
    "challengeSuccessful": "Изазов успешан! Неисправна реч: {{word}}",
    "challengeFailed": "Изазов неуспешан. Реч је исправна.",
    "tilesExchanged": "{{count}} плочица замењено"
  }
}
```

---

## Next Steps

1. ✅ **Plan approved** - Ready for implementation
2. **Start with local game** (lower risk, faster feedback)
3. **Implement incrementally** (infrastructure → high-priority components → game engine → multiplayer)
4. **Test thoroughly** in both languages
5. **Apply same pattern to multiplayer** once local is stable

---

**This plan provides a complete, production-ready localization system with minimal disruption to existing code, type safety, and excellent developer experience.**

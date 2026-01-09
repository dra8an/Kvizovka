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
- **Joker Stealing** - Steal opponent's joker by dragging matching letter tile (with visual feedback and tooltip)
- **Scoresheets** - Complete move-by-move history for both players
- **Chess Clock** - Individual timers for each player
- **Game Controls** - Play Word, Skip Turn, Recall, Pause, End Game
- **Exchange Tiles** - Select and exchange tiles with visual feedback (cannot exchange consecutively)
- **Automatic Game End** - Game ends automatically after 10 rounds, time expiry, or no tiles
- **Enhanced End Screen** - Complete game summary with scoresheets showing all words played, unused tile penalties with visual display, and final scores
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
- ✅ Joker stealing (steal opponent's joker from last move with matching letter)
- ✅ Tile exchange system (cannot exchange two turns in a row)
- ✅ Move history and undo system via challenges
- ✅ 10 rounds per player with automatic game end
- ✅ Final scoring with unused tile penalties
- ✅ Automatic game end detection (rounds completed, time expired, no tiles)

## 📚 Documentation

### Game Rules
- [Game Rules (English)](./Docs/GAME_RULES.md) - Detailed game rules and scoring
- [Pravila Igre (Srpski)](./Docs/GAME_RULES_SR.md) - Detaljna pravila igre i bodovanje

### Main Documentation
- [CHANGELOG](./CHANGELOG.md) - Version history and release notes
- [Implementation Plan](./Docs/IMPLEMENTATION_PLAN.md) - Complete technical roadmap

### Recent Updates
- [End Game Improvements (2026-01-07)](./Docs/END-GAME-IMPROVEMENTS-2026-01-07.md) - Enhanced completion screen with scoresheets and tile penalties
- [Dictionary Expansion (2026-01-04)](./Docs/DICTIONARY-IMPLEMENTATION-2026-01-04.md) - 20K word dictionary, processing pipeline
- [UI Improvements (2026-01-03)](./Docs/UI-IMPROVEMENTS-2026-01-03.md) - Layout optimization details
- [Bug Fixes & Features (2026-01-02)](./Docs/FIXES-2026-01-02.md) - Challenge system, validation fixes

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
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - Lightweight state management

## 📝 License

This is a personal learning project.

## 🙏 Acknowledgments

- Kvizovka game designed by Croatian/Serbian enigmatika community
- Inspired by Scrabble but adapted for Serbian language

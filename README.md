# Kvizovka - Serbian Word Board Game

A web-based implementation of Kvizovka, a Serbian word game similar to Scrabble.

## 🎮 About Kvizovka

Kvizovka is a strategic word game for the Serbian language with unique rules:
- **17×17 board** (larger than Scrabble's 15×15)
- **10 tiles per player** (vs Scrabble's 7)
- **Black blocker tiles** that "close" words after placement
- **4-letter minimum** word length
- **Tournament time controls** (30-35 minutes per player)

## 📚 Documentation

- [Implementation Plan](./Docs/IMPLEMENTATION_PLAN.md) - Complete technical roadmap
- [Game Rules](./Docs/GAME_RULES.md) - Detailed game rules and scoring
- [WebStorm Guide](./Docs/WEBSTORM_GUIDE.md) - How to use WebStorm IDE with this project
- [Step 1: Project Setup](./Docs/STEP_01_PROJECT_SETUP.md) - Initial setup documentation
- [Step 2: Dependencies](./Docs/STEP_02_DEPENDENCIES.md) - Tailwind CSS & Zustand setup
- [Step 3: Types & Constants](./Docs/STEP_03_TYPES_AND_CONSTANTS.md) - TypeScript types and game configuration
- [Step 4: Dictionary](./Docs/STEP_04_DICTIONARY.md) - Serbian word dictionary integration

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
├── Docs/              # Documentation
├── src/               # Source code
│   ├── components/    # React components (folders created)
│   ├── game-engine/   # Game logic (to be added in Step 5)
│   ├── types/         # TypeScript types ✅
│   ├── constants/     # Game configuration ✅
│   ├── utils/         # Utilities (dictionary) ✅
│   ├── store/         # Zustand state management ✅
│   └── App.tsx        # Main app component
├── public/
│   └── dictionary/    # Serbian word list (150 words) ✅
└── package.json       # Dependencies
```

## 🎯 Development Status

**Current Phase:** Step 4 - Dictionary ✅

- [x] Initialize Vite + React + TypeScript
- [x] Add Tailwind CSS and Zustand
- [x] Setup folder structure
- [x] Create type definitions (board, tile, game)
- [x] Build game constants (board config, tiles, scoring)
- [x] Integrate Serbian dictionary (150 words)
- [ ] Implement game engine classes
- [ ] Build UI components

## 📝 License

This is a personal learning project.

## 🙏 Acknowledgments

- Kvizovka game designed by Croatian/Serbian enigmatika community
- Inspired by Scrabble but adapted for Serbian language

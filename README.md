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
- [Step 1: Project Setup](./Docs/STEP_01_PROJECT_SETUP.md) - Initial setup documentation

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
- **Tailwind CSS** - Styling (to be added)
- **Zustand** - State management (to be added)

## 📁 Project Structure

```
kvizovka/
├── Docs/              # Documentation
├── src/               # Source code
│   ├── components/    # React components (to be added)
│   ├── game-engine/   # Game logic (to be added)
│   ├── types/         # TypeScript types (to be added)
│   └── App.tsx        # Main app component
├── public/            # Static assets
└── package.json       # Dependencies
```

## 🎯 Development Status

**Current Phase:** Step 1 - Project Setup ✅

- [x] Initialize Vite + React + TypeScript
- [ ] Add Tailwind CSS and Zustand
- [ ] Setup folder structure
- [ ] Implement game logic
- [ ] Build UI components

## 📝 License

This is a personal learning project.

## 🙏 Acknowledgments

- Kvizovka game designed by Croatian/Serbian enigmatika community
- Inspired by Scrabble but adapted for Serbian language

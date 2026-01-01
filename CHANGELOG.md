# Changelog

All notable changes to the Kvizovka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Step 2: Add Tailwind CSS and Zustand dependencies
- Step 3: Setup folder structure and TypeScript config
- Step 4: Serbian dictionary integration
- Step 5: Core game engine implementation
- Step 6: State management with Zustand
- Step 7: UI components (Board, TileRack, Timer, etc.)
- Step 8: Drag-and-drop functionality
- Step 9: Game flow and logic integration
- Step 10: Testing and polish

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
**Current Version:** 0.1.0 (Step 1 Complete)
**Next Milestone:** Step 2 - Dependencies (Tailwind CSS + Zustand)

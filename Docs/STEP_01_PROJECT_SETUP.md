# Step 1: Project Setup ✅

**Status:** Completed
**Date:** January 1, 2026

## Overview

Successfully initialized a Vite + React + TypeScript project as the foundation for the Kvizovka game application.

## What We Did

### 1. Created Project Configuration Files

#### `package.json`
- Defined project metadata (name, version, description)
- Listed dependencies (React 18, React DOM)
- Listed dev dependencies (TypeScript, Vite, ESLint, etc.)
- Created npm scripts:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build
  - `npm run lint` - Run ESLint

#### `tsconfig.json` (TypeScript Configuration)
- **Target:** ES2020 (modern JavaScript)
- **Module:** ESNext (latest module system)
- **JSX:** react-jsx (React 18 JSX transform)
- **Strict mode:** DISABLED for beginner-friendly learning
- **Base URL:** `.` for absolute imports
- **Path aliases:** `@/*` maps to `src/*`

**Why strict mode is off:**
```json
"strict": false,           // Don't enforce all strict type checks
"noUnusedLocals": false,   // Allow unused variables (while learning)
"noUnusedParameters": false // Allow unused function parameters
```
This makes TypeScript more forgiving while you're learning. We can enable strict mode later.

#### `vite.config.ts` (Vite Configuration)
- Configured React plugin for JSX support
- Set up path aliases (`@/` → `src/`)
- Uses Vite for fast development and optimized builds

#### `.gitignore`
- Ignores `node_modules/` (dependencies)
- Ignores `dist/` (build output)
- Ignores editor files (`.vscode`, `.idea`)
- Ignores environment files (`.env`)

#### `.eslintrc.cjs` (ESLint Configuration)
- Configured for TypeScript and React
- Relaxed rules for beginners:
  - `@typescript-eslint/no-explicit-any: 'off'` - Allows `any` type
  - `@typescript-eslint/no-unused-vars: 'warn'` - Warns instead of errors

---

### 2. Created Application Entry Points

#### `index.html`
The main HTML file that loads the React application:
```html
<!doctype html>
<html lang="sr">  <!-- Serbian language -->
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kvizovka - Serbian Word Game</title>
  </head>
  <body>
    <div id="root"></div>  <!-- React mounts here -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### `src/main.tsx`
The JavaScript entry point that initializes React:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What this does:**
1. Finds the `<div id="root">` in index.html
2. Creates a React root
3. Renders the `<App />` component inside `<React.StrictMode>`

**Note:** `React.StrictMode` helps catch bugs during development by:
- Warning about deprecated APIs
- Detecting unexpected side effects
- Does NOT affect production builds

---

### 3. Created Initial Components

#### `src/App.tsx`
The root component of our application:
```tsx
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Kvizovka</h1>
        <p>Serbian Word Board Game</p>
      </header>
      <main>
        <div className="welcome-message">
          <h2>Welcome to Kvizovka!</h2>
          <p>A Serbian word game similar to Scrabble</p>
          <p className="status">🚧 Project setup complete - Ready for development</p>
        </div>
      </main>
    </div>
  )
}

export default App
```

**Key points:**
- Uses JSX (JavaScript XML) to write HTML-like code in JavaScript
- `className` instead of `class` (React convention)
- Returns a single root element (`<div className="app">`)
- Components must start with capital letter (`App`, not `app`)

#### `src/App.css`
Basic styles to make the welcome screen look nice:
- Global reset (margin, padding, box-sizing)
- Centered layout with flexbox
- Professional color scheme (dark header, light background)
- Responsive design

---

### 4. Installed Dependencies

Ran `npm install` which installed:

**Production Dependencies:**
- `react@18.2.0` - React library
- `react-dom@18.2.0` - React DOM rendering

**Development Dependencies:**
- `typescript@5.2.2` - TypeScript compiler
- `vite@5.0.8` - Build tool and dev server
- `@vitejs/plugin-react@4.2.1` - Vite plugin for React
- `@types/react` & `@types/react-dom` - TypeScript type definitions
- `eslint` & plugins - Code linting
- Total: 201 packages installed

---

### 5. Verified Build Works

Ran `npm run build` to test the TypeScript compilation and Vite build:

```bash
✓ 31 modules transformed.
✓ dist/index.html                   0.48 kB │ gzip:  0.31 kB
✓ dist/assets/index-CmMIqZm9.css    1.02 kB │ gzip:  0.52 kB
✓ dist/assets/index-CAJlWSvx.js   143.09 kB │ gzip: 45.95 kB
✓ built in 726ms
```

**What this means:**
- TypeScript compiled without errors ✅
- Vite bundled the application successfully ✅
- Optimized for production (minified, gzipped) ✅
- Total size: ~143KB JavaScript + 1KB CSS ✅

---

## File Structure Created

```
kvizovka/
├── .eslintrc.cjs          # ESLint configuration
├── .gitignore             # Git ignore rules
├── index.html             # Main HTML file
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Vite
├── vite.config.ts         # Vite configuration
├── README.md              # Project README
├── Docs/                  # Documentation folder
│   ├── IMPLEMENTATION_PLAN.md
│   ├── GAME_RULES.md
│   └── STEP_01_PROJECT_SETUP.md  # This file
├── src/                   # Source code
│   ├── main.tsx           # Application entry point
│   ├── App.tsx            # Root component
│   ├── App.css            # Styles
│   └── vite-env.d.ts      # Vite types
├── node_modules/          # Dependencies (201 packages)
└── dist/                  # Build output (created by npm run build)
```

---

## Key Concepts Learned

### 1. What is Vite?
- **Modern build tool** for web development
- **Fast development server** with Hot Module Replacement (HMR)
- **Optimized production builds** using Rollup
- **Much faster** than older tools like Create React App

### 2. What is React?
- **JavaScript library** for building user interfaces
- **Component-based:** Break UI into reusable pieces
- **Declarative:** Describe what UI should look like, React handles updates
- **Virtual DOM:** Efficiently updates only what changed

### 3. What is TypeScript?
- **JavaScript with types** - adds type checking to JavaScript
- **Catches errors early** - before running the code
- **Better IDE support** - autocomplete, inline documentation
- **Compiles to JavaScript** - browsers run the compiled JavaScript

Example:
```typescript
// JavaScript - no type checking
function add(a, b) {
  return a + b;
}

// TypeScript - with types
function add(a: number, b: number): number {
  return a + b;
}

add(5, 10);     // ✅ OK
add("5", "10"); // ❌ TypeScript error: expected number, got string
```

### 4. What is JSX?
- **JavaScript XML** - write HTML-like code in JavaScript
- **React's syntax** for creating UI elements
- **Compiled to JavaScript** by Vite/Babel

Example:
```tsx
// JSX
const element = <h1 className="title">Hello!</h1>;

// Compiles to JavaScript:
const element = React.createElement('h1', {className: 'title'}, 'Hello!');
```

---

## How to Run the Project

### Development Mode
```bash
npm run dev
```
- Starts development server at `http://localhost:5173`
- Auto-reloads when you save files
- Shows errors in browser and terminal

### Build for Production
```bash
npm run build
```
- Compiles TypeScript to JavaScript
- Bundles and minifies code
- Creates optimized files in `dist/` folder

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Test how it will work in production

---

## Common npm Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install all dependencies listed in package.json |
| `npm install <package>` | Add a new package to dependencies |
| `npm install -D <package>` | Add a new package to dev dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Check code for errors with ESLint |

---

## Troubleshooting

### If `npm install` fails:
1. Make sure you have Node.js 18+ installed: `node --version`
2. Delete `node_modules/` and try again
3. Clear npm cache: `npm cache clean --force`

### If dev server won't start:
1. Check if port 5173 is already in use
2. Try `npm run dev -- --port 3000` to use different port

### If TypeScript errors appear:
1. Check `tsconfig.json` settings
2. Make sure `"strict": false` for easier learning
3. Use `// @ts-ignore` above a line to ignore errors (temporary)

---

## What's Next?

✅ **Step 1 Complete** - Project is initialized and verified

**Next Step: Install Tailwind CSS and Zustand**
- Add Tailwind CSS for better styling
- Add Zustand for state management
- Configure both libraries
- Test that they work

See [STEP_02_DEPENDENCIES.md](./STEP_02_DEPENDENCIES.md) (to be created)

---

## Resources for Learning

### Official Documentation
- [React Docs](https://react.dev/) - Best place to learn React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript
- [Vite Guide](https://vitejs.dev/guide/) - Vite documentation

### Beginner Tutorials
- [React Tutorial](https://react.dev/learn) - Interactive React tutorial
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [ES6 Features](https://github.com/lukehoban/es6features) - Modern JavaScript

### Video Tutorials
- [React in 100 Seconds](https://www.youtube.com/watch?v=Tn6-PIqc4UM) - Quick overview
- [TypeScript Crash Course](https://www.youtube.com/watch?v=BCg4U1FzODs) - 30 min intro

---

## Summary

🎉 **Successfully set up a modern React + TypeScript development environment!**

**What we have:**
- ✅ Vite for fast builds
- ✅ React 18 for UI
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Beginner-friendly configuration
- ✅ Project builds successfully
- ✅ Ready for next steps

**Project health:**
- Build: ✅ Working
- TypeScript: ✅ Compiling
- Dependencies: ✅ Installed (201 packages)
- Size: ✅ Reasonable (~143KB)

Ready to proceed to **Step 2: Install Tailwind CSS and Zustand**! 🚀

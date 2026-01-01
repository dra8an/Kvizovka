# Step 2: Install Tailwind CSS and Zustand ✅

**Status:** Completed
**Date:** January 1, 2026
**Dependencies Added:** 20 packages
**Version:** 0.2.0

## Overview

Successfully installed and configured Tailwind CSS v4 for styling and Zustand for state management. Both libraries are now fully integrated and tested.

---

## What We Did

### 1. Installed Tailwind CSS v4

#### Command Run:
```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

#### Packages Installed:
- `tailwindcss@4.1.18` - CSS framework
- `@tailwindcss/postcss@4.1.18` - PostCSS plugin (v4 specific)
- `postcss@8.5.6` - CSS preprocessor
- `autoprefixer@10.4.23` - Adds vendor prefixes
- Plus 9 dependency packages

**Total:** 13 new packages

---

### 2. Configured Tailwind CSS

#### Created `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors for Kvizovka game
      colors: {
        'premium-yellow': '#ffd700',     // Double letter (2x)
        'premium-green': '#4ade80',      // Triple letter (3x)
        'premium-red': '#ef4444',        // Quadruple letter (4x)
        'premium-blue': '#3b82f6',       // Word multiplier (X)

        'board-bg': '#1e293b',           // Dark board background
        'board-square': '#f8fafc',       // Regular square
        'board-center': '#fbbf24',       // Center square

        'tile-bg': '#fef3c7',            // Tile background
        'tile-text': '#1e293b',          // Tile letter
        'tile-value': '#78716c',         // Tile point value

        'blocker': '#1f2937',            // Black blocker tile
      },

      // Grid template for 17x17 board
      gridTemplateColumns: {
        '17': 'repeat(17, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '17': 'repeat(17, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
```

**What this does:**
- **content**: Tells Tailwind which files to scan for class names
- **extend.colors**: Adds custom colors for our game (premium fields, board, tiles)
- **extend.gridTemplateColumns/Rows**: Adds `grid-cols-17` and `grid-rows-17` for the board

**Why custom colors?**
- Premium fields need specific colors matching the game rules
- `bg-premium-yellow`, `bg-premium-green`, etc. are more semantic than `bg-yellow-500`

---

#### Created `postcss.config.js`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // Tailwind v4 PostCSS plugin
    autoprefixer: {},
  },
}
```

**What this does:**
- Tells PostCSS to use Tailwind CSS v4 plugin
- Adds autoprefixer for browser compatibility

**Note:** Tailwind v4 uses `@tailwindcss/postcss` instead of `tailwindcss` directly.

---

#### Created `src/index.css`:

```css
/**
 * Tailwind CSS v4 Base Styles
 */

@import "tailwindcss";  /* v4 uses simple import instead of @tailwind directives */

/**
 * Global Styles
 */

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    @apply antialiased;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  }

  html, body, #root {
    @apply h-full;
  }
}

/**
 * Custom Component Classes
 */

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-lg p-6;
  }

  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}

/**
 * Custom Utility Classes
 */

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  }
}
```

**Key Differences in Tailwind v4:**
- ✅ **v4**: `@import "tailwindcss"`
- ❌ **v3**: `@tailwind base; @tailwind components; @tailwind utilities;`

**@layer explained:**
- `@layer base`: Global resets and base styles
- `@layer components`: Reusable component classes (`.card`, `.btn`)
- `@layer utilities`: Custom utility classes

---

### 3. Installed Zustand

#### Command Run:
```bash
npm install zustand
```

#### Package Installed:
- `zustand@5.0.2` - State management library

**Total:** 1 new package

---

### 4. Created Example Zustand Store

#### Created `src/store/exampleStore.ts`:

```typescript
import { create } from 'zustand'

interface ExampleState {
  // State
  count: number

  // Actions
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useExampleStore = create<ExampleState>((set, get) => ({
  // Initial state
  count: 0,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

**How it works:**
1. **create()**: Creates a store (returns a React hook)
2. **set()**: Updates state
3. **get()**: Reads current state (inside actions)
4. **useExampleStore**: Hook to use in components

**Usage in components:**
```typescript
function MyComponent() {
  // Get specific values
  const count = useExampleStore((state) => state.count)
  const increment = useExampleStore((state) => state.increment)

  // Or get everything
  const { count, increment } = useExampleStore()

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

---

### 5. Updated App Component

#### Updated `src/App.tsx`:

**Before:**
- Custom CSS with `.app-header`, `.welcome-message` classes
- Static content
- No interactivity

**After:**
- Tailwind utility classes (`min-h-screen`, `flex`, `bg-gray-100`)
- Interactive Zustand counter (+/- buttons)
- Demonstration of premium field colors
- Modern, responsive design

**Key Changes:**
```typescript
import { useExampleStore } from './store/exampleStore'

function App() {
  // Use Zustand store
  const count = useExampleStore((state) => state.count)
  const increment = useExampleStore((state) => state.increment)
  const decrement = useExampleStore((state) => state.decrement)
  const reset = useExampleStore((state) => state.reset)

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Tailwind classes instead of custom CSS */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900">
        {/* ... */}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="card max-w-2xl w-full">
          {/* Interactive counter using Zustand */}
          <button onClick={increment}>+</button>
          <div>{count}</div>
          <button onClick={decrement}>-</button>

          {/* Premium field color demonstration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-premium-yellow">2x</div>
            <div className="bg-premium-green">3x</div>
            <div className="bg-premium-red">4x</div>
            <div className="bg-premium-blue">X</div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

---

### 6. Removed Old CSS File

```bash
rm src/App.css
```

**Why?**
- No longer needed - replaced by Tailwind
- Tailwind provides all the utilities we need
- Keeps project clean

---

### 7. Verified Build

```bash
npm run build
```

**Results:**
```
✓ 35 modules transformed.
✓ dist/index.html                   0.48 kB │ gzip:  0.31 kB
✓ dist/assets/index-DoKWKwQ2.css   14.25 kB │ gzip:  3.57 kB
✓ dist/assets/index-Qn6Sw1Qn.js   146.28 kB │ gzip: 46.98 kB
✓ built in 1.01s
```

**Analysis:**
- ✅ Build successful
- ✅ CSS increased to 14KB (includes Tailwind utilities)
- ✅ JS slightly increased to 146KB (includes Zustand)
- ✅ Gzipped sizes very reasonable (3.6KB CSS, 47KB JS)

---

## Key Concepts Learned

### 1. What is Tailwind CSS?

**Traditional CSS:**
```css
.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
}
```

**Tailwind CSS:**
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg">
  Click me
</button>
```

**Benefits:**
- ✅ No need to write custom CSS
- ✅ No naming classes (no `.button-primary`, `.btn-large` debates)
- ✅ Faster development
- ✅ Consistent design (uses design system)
- ✅ Automatically removes unused styles (small bundle)

**Common Tailwind Classes:**
| Class | CSS Equivalent | Purpose |
|-------|----------------|---------|
| `flex` | `display: flex` | Flexbox container |
| `grid` | `display: grid` | Grid container |
| `p-4` | `padding: 1rem` | Padding (4 × 0.25rem) |
| `m-4` | `margin: 1rem` | Margin |
| `bg-blue-500` | `background-color: #3b82f6` | Background color |
| `text-white` | `color: white` | Text color |
| `rounded-lg` | `border-radius: 0.5rem` | Rounded corners |
| `shadow-lg` | `box-shadow: ...` | Drop shadow |

---

### 2. What is Zustand?

**Zustand** = "state" in German

**Problem:** React's `useState` only works within a component. To share state, you need:
- Prop drilling (pass props through many components)
- Context (complex setup, re-render issues)
- Redux (lots of boilerplate)

**Solution:** Zustand provides a simple global store.

**Comparison:**

**useState (local state):**
```typescript
function Counter() {
  const [count, setCount] = useState(0)
  // Only this component can access `count`

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**Zustand (global state):**
```typescript
// Create store once
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 }))
}))

// Use in any component
function Counter() {
  const count = useStore((s) => s.count)
  const increment = useStore((s) => s.increment)

  return <button onClick={increment}>{count}</button>
}

function AnotherComponent() {
  const count = useStore((s) => s.count)  // Same state!
  return <p>Count: {count}</p>
}
```

**Why Zustand over Redux?**

| Feature | Redux | Zustand |
|---------|-------|---------|
| Setup complexity | High (actions, reducers, dispatch) | Low (just create store) |
| Boilerplate | Lots | Minimal |
| Provider needed | Yes | No |
| Learning curve | Steep | Gentle |
| Bundle size | Large | Tiny (1KB) |
| Performance | Good | Excellent |

---

### 3. Tailwind v4 vs v3 Differences

This project uses **Tailwind CSS v4** (latest).

**Key Changes:**

| v3 | v4 |
|----|-----|
| `@tailwind base;` | `@import "tailwindcss";` |
| `@tailwind components;` | (removed, use `@layer components`) |
| `@tailwind utilities;` | (removed, included in import) |
| `tailwindcss` PostCSS plugin | `@tailwindcss/postcss` plugin |
| JIT mode optional | Always JIT |

**Why v4?**
- Simpler syntax
- Faster builds
- Better CSS-in-JS support
- More modern architecture

---

## File Structure After Step 2

```
kvizovka/
├── CHANGELOG.md                        # ✅ Updated
├── README.md
├── package.json                        # ✅ Updated (new dependencies)
├── tailwind.config.js                  # ✅ NEW
├── postcss.config.js                   # ✅ NEW
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .gitignore
├── .eslintrc.cjs
├── Docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── GAME_RULES.md
│   ├── STEP_01_PROJECT_SETUP.md
│   └── STEP_02_DEPENDENCIES.md          # ✅ NEW (this file)
├── src/
│   ├── main.tsx                         # ✅ Updated (imports index.css)
│   ├── App.tsx                          # ✅ Updated (Tailwind + Zustand)
│   ├── index.css                        # ✅ NEW (Tailwind styles)
│   ├── vite-env.d.ts
│   └── store/
│       └── exampleStore.ts              # ✅ NEW (Zustand store)
├── node_modules/ (221 packages)         # ✅ Updated (+20 packages)
└── dist/                                # Build output
```

---

## Dependencies Summary

### Before Step 2:
- **Total packages:** 201

### After Step 2:
- **Total packages:** 221 (+20)

### New Dependencies:
**Production:**
- `zustand@5.0.2` (1 package)

**Development:**
- `tailwindcss@4.1.18` (13 packages including dependencies)
- `@tailwindcss/postcss@4.1.18`
- `postcss@8.5.6`
- `autoprefixer@10.4.23`

---

## Testing the Setup

### Test Tailwind CSS:

Run the dev server:
```bash
npm run dev
```

Visit `http://localhost:5173` - you should see:
- ✅ Gradient header (slate-800 to slate-900)
- ✅ White card with shadow
- ✅ Four colored boxes (yellow, green, red, blue)
- ✅ Responsive layout

### Test Zustand:

On the page, you should see:
- ✅ Counter showing "0"
- ✅ + button (increments count)
- ✅ - button (decrements count)
- ✅ Reset button (resets to 0)

Click the buttons - the counter should update immediately!

---

## Common Tailwind Classes Reference

### Layout
```
flex           - display: flex
grid           - display: grid
block          - display: block
inline-block   - display: inline-block
hidden         - display: none

flex-col       - flex-direction: column
flex-row       - flex-direction: row
items-center   - align-items: center
justify-center - justify-content: center
gap-4          - gap: 1rem
```

### Spacing
```
p-4     - padding: 1rem (all sides)
px-4    - padding-left and padding-right: 1rem
py-4    - padding-top and padding-bottom: 1rem
pt-4    - padding-top: 1rem
m-4     - margin: 1rem
mx-auto - margin-left and margin-right: auto (centers)
```

### Sizing
```
w-full    - width: 100%
h-full    - height: 100%
w-12      - width: 3rem
max-w-2xl - max-width: 42rem
min-h-screen - min-height: 100vh
```

### Colors
```
bg-blue-500     - background-color: #3b82f6
text-white      - color: white
border-gray-200 - border-color: #e5e7eb
```

### Typography
```
text-xl      - font-size: 1.25rem
text-2xl     - font-size: 1.5rem
font-bold    - font-weight: 700
font-medium  - font-weight: 500
text-center  - text-align: center
```

### Borders & Shadows
```
rounded-lg     - border-radius: 0.5rem
shadow-lg      - box-shadow: large shadow
border         - border-width: 1px
border-2       - border-width: 2px
border-l-4     - border-left-width: 4px
```

### Effects
```
opacity-90              - opacity: 0.9
transition-colors       - transition: color, background-color, ...
duration-200           - transition-duration: 200ms
hover:bg-blue-700      - background on hover
```

---

## Troubleshooting

### Issue 1: "Cannot apply unknown utility class"

**Error:**
```
Error: Cannot apply unknown utility class `bg-white`
```

**Cause:** Using Tailwind v3 syntax with v4

**Solution:** Update `src/index.css`:
```css
/* v3 (wrong) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 (correct) */
@import "tailwindcss";
```

---

### Issue 2: "tailwindcss directly as a PostCSS plugin"

**Error:**
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```

**Cause:** Missing `@tailwindcss/postcss` package or wrong PostCSS config

**Solution:**
1. Install: `npm install -D @tailwindcss/postcss`
2. Update `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // Use this
    autoprefixer: {},
  },
}
```

---

### Issue 3: Styles not applying

**Checklist:**
1. ✅ Is `tailwind.config.js` created?
2. ✅ Does `content` array include your files? (`./src/**/*.{js,ts,jsx,tsx}`)
3. ✅ Is `@import "tailwindcss"` in `index.css`?
4. ✅ Is `index.css` imported in `main.tsx`?
5. ✅ Did you restart dev server after config changes?

---

### Issue 4: Zustand not working

**Checklist:**
1. ✅ Is `zustand` installed? (`npm list zustand`)
2. ✅ Correct import? (`import { create } from 'zustand'`)
3. ✅ Using the hook in component? (`const count = useStore(s => s.count)`)
4. ✅ Calling actions correctly? (`onClick={increment}` not `onClick={increment()}`)

---

## What's Next?

✅ **Step 2 Complete** - Tailwind CSS and Zustand are ready!

**Next Step: Setup Folder Structure**
- Create organized folder structure for game components
- Setup type definitions for game logic
- Prepare for implementing game engine

See [STEP_03_FOLDER_STRUCTURE.md](./STEP_03_FOLDER_STRUCTURE.md) (to be created)

---

## Resources

### Tailwind CSS
- [Official Docs](https://tailwindcss.com/docs)
- [Tailwind v4 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Tailwind Play](https://play.tailwindcss.com/) - Try online
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

### Zustand
- [Official Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand vs Redux](https://docs.pmnd.rs/zustand/getting-started/comparison)
- [Examples](https://github.com/pmndrs/zustand/tree/main/examples)

### Video Tutorials
- [Tailwind CSS Crash Course](https://www.youtube.com/watch?v=UBOj6rqRUME) - Traversy Media
- [Zustand in 100 Seconds](https://www.youtube.com/watch?v=KYjKJ_JRZ0E) - Fireship

---

## Summary

🎉 **Successfully installed Tailwind CSS v4 and Zustand!**

**What we have:**
- ✅ Tailwind CSS v4 configured
- ✅ Custom colors for premium fields
- ✅ Zustand state management
- ✅ Example counter working
- ✅ Modern, responsive UI
- ✅ Build passing (146KB + 14KB)

**Project health:**
- Build: ✅ Working
- TypeScript: ✅ Compiling
- Dependencies: ✅ 221 packages
- Size: ✅ Reasonable (~50KB gzipped)

**Ready to proceed to Step 3: Folder Structure Setup!** 🚀

# WebStorm Setup Guide for Kvizovka

Complete guide for opening, running, and developing the Kvizovka project in JetBrains WebStorm.

---

## Table of Contents

1. [Opening the Project](#step-1-open-the-project-in-webstorm)
2. [Initial Setup](#step-2-initial-setup-first-time-only)
3. [Running the Dev Server](#step-4-run-the-development-server)
4. [WebStorm Features](#step-8-useful-webstorm-features)
5. [Debugging](#step-13-debugging-in-webstorm)
6. [Git Integration](#step-14-git-integration-in-webstorm)
7. [Troubleshooting](#troubleshooting-webstorm-issues)
8. [Quick Reference](#quick-reference-card)

---

## Step 1: Open the Project in WebStorm

### Method 1: Open Existing Project (Recommended)

1. **Launch WebStorm**
2. Click **"Open"** on the welcome screen
3. Navigate to `/Users/draganbesevic/Projects/claude/Kvizovka`
4. Click **"Open"**
5. WebStorm will detect it's a Node.js project and index the files

### Method 2: From File Menu

1. **WebStorm → File → Open...**
2. Select the `Kvizovka` folder
3. Click **"Open"**

### Method 3: From Terminal/Finder

```bash
# Navigate to project
cd /Users/draganbesevic/Projects/claude/Kvizovka

# Open in WebStorm
webstorm .
```

Or drag the `Kvizovka` folder onto the WebStorm icon.

---

## Step 2: Initial Setup (First Time Only)

### 1. Trust the Project

When you first open, WebStorm may ask:
- **"Trust and Open Project 'Kvizovka'?"**
- Click **"Trust Project"**

### 2. Install Node.js Dependencies

WebStorm should automatically detect `package.json` and show a notification:
- **"Install dependencies?"**
- Click **"Run 'npm install'"**

If you don't see this notification:
1. Open the **Terminal** tab (bottom of WebStorm)
2. Run: `npm install`

### 3. Enable Node.js Integration

WebStorm should auto-detect Node.js. To verify:

1. **WebStorm → Settings** (or `Cmd + ,` on Mac / `Ctrl + Alt + S` on Windows)
2. Go to **Languages & Frameworks → Node.js**
3. Check that **Node interpreter** is set (should show your Node.js path)
4. If not set, click **"..."** and select your Node.js installation

---

## Step 3: Configure TypeScript

WebStorm should automatically detect `tsconfig.json`. To verify:

1. **Settings → Languages & Frameworks → TypeScript**
2. **TypeScript version:** Should show the project version (5.2.2)
3. Check **"Recompile on changes"** (optional, for auto-checking)
4. Click **OK**

---

## Step 4: Run the Development Server

### Method 1: Using npm Scripts UI (Easiest)

1. Open `package.json` in the editor
2. You'll see a **green play button** (▶) next to each script
3. Click the play button next to **"dev"**:
   ```json
   "scripts": {
     "dev": "vite",  // ← Click the green arrow here
     "build": "tsc && vite build",
     "preview": "vite preview"
   }
   ```
4. WebStorm will start the dev server in the **Run** panel

### Method 2: Using Run Configurations

1. Click **"Add Configuration..."** in the top-right toolbar
2. Click **"+"** → **"npm"**
3. Configure:
   - **Name:** `Dev Server`
   - **Command:** `run`
   - **Scripts:** `dev`
4. Click **OK**
5. Click the **green play button** (▶) in the toolbar

### Method 3: Using Terminal

1. Open **Terminal** tab (bottom of WebStorm)
   - Shortcut: `Alt + F12` (Windows/Linux) or `Option + F12` (Mac)
2. Run: `npm run dev`
3. Server starts at `http://localhost:5173`

---

## Step 5: View the Application

After starting the dev server, you should see:

```
VITE v5.4.21  ready in 342 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Open in Browser:

**Option 1:** Click the link in WebStorm terminal
- `Cmd + Click` (Mac) or `Ctrl + Click` (Windows) on `http://localhost:5173/`

**Option 2:** WebStorm browser preview
1. **View → Tool Windows → Services** (or `Cmd + 8` / `Alt + 8`)
2. Expand **npm** → **dev**
3. Right-click → **Open in Browser**

**Option 3:** Manual
- Open your browser and go to `http://localhost:5173`

---

## Step 6: WebStorm Project Layout

Once opened, you'll see:

```
Project Panel (Left):
├── 📁 Kvizovka
│   ├── 📁 Docs/
│   │   ├── IMPLEMENTATION_PLAN.md
│   │   ├── GAME_RULES.md
│   │   ├── STEP_01_PROJECT_SETUP.md
│   │   ├── STEP_02_DEPENDENCIES.md
│   │   └── WEBSTORM_GUIDE.md        # This file
│   ├── 📁 node_modules/              # Dependencies (collapsed by default)
│   ├── 📁 src/
│   │   ├── 📁 store/
│   │   │   └── exampleStore.ts
│   │   ├── 📄 App.tsx                # Main component
│   │   ├── 📄 index.css              # Styles with Tailwind
│   │   ├── 📄 main.tsx               # Entry point
│   │   └── 📄 vite-env.d.ts
│   ├── 📄 .eslintrc.cjs
│   ├── 📄 .gitignore
│   ├── 📄 CHANGELOG.md
│   ├── 📄 index.html
│   ├── 📄 package.json               # Dependencies & scripts
│   ├── 📄 postcss.config.js
│   ├── 📄 README.md
│   ├── 📄 tailwind.config.js         # Tailwind config
│   ├── 📄 tsconfig.json              # TypeScript config
│   ├── 📄 tsconfig.node.json
│   └── 📄 vite.config.ts             # Vite config
```

---

## Step 7: Recommended WebStorm Settings

### 1. Enable Tailwind CSS IntelliSense

1. **Settings → Languages & Frameworks → Style Sheets → Tailwind CSS**
2. Check **"Enable Tailwind CSS support"**
3. Click **OK**

Now you'll get autocomplete for Tailwind classes!

### 2. Prettier Configuration (Optional)

Install Prettier for code formatting:

```bash
npm install -D prettier
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Enable in WebStorm:
1. **Settings → Languages & Frameworks → JavaScript → Prettier**
2. Check **"On 'Reformat Code' action"**
3. Check **"On save"** (optional)

### 3. Enable Auto-Import

1. **Settings → Editor → General → Auto Import**
2. Check **"Add unambiguous imports on the fly"**
3. Check **"Optimize imports on the fly"**

### 4. Set Code Style for TypeScript

1. **Settings → Editor → Code Style → TypeScript**
2. Set **Tab size:** 2
3. Set **Indent:** 2
4. Click **OK**

---

## Step 8: Useful WebStorm Features

### 1. File Navigation

| Shortcut (Mac) | Shortcut (Windows) | Action |
|----------------|-------------------|--------|
| `Cmd + Shift + O` | `Ctrl + Shift + N` | Search for file by name |
| `Cmd + E` | `Ctrl + E` | Recent files |
| `Cmd + B` | `Ctrl + B` | Go to definition |
| `Cmd + Click` | `Ctrl + Click` | Go to definition |
| `Cmd + [` | `Ctrl + Alt + Left` | Go back |
| `Cmd + ]` | `Ctrl + Alt + Right` | Go forward |

### 2. Code Editing

| Shortcut (Mac) | Shortcut (Windows) | Action |
|----------------|-------------------|--------|
| `Cmd + D` | `Ctrl + D` | Duplicate line |
| `Cmd + /` | `Ctrl + /` | Comment line |
| `Cmd + Shift + /` | `Ctrl + Shift + /` | Block comment |
| `Cmd + Shift + Up/Down` | `Ctrl + Shift + Up/Down` | Move line up/down |
| `Cmd + Alt + L` | `Ctrl + Alt + L` | Reformat code |
| `Cmd + Space` | `Ctrl + Space` | Autocomplete |
| `Cmd + P` | `Ctrl + P` | Parameter info |

### 3. Search & Replace

| Shortcut (Mac) | Shortcut (Windows) | Action |
|----------------|-------------------|--------|
| `Cmd + F` | `Ctrl + F` | Find in file |
| `Cmd + R` | `Ctrl + R` | Replace in file |
| `Cmd + Shift + F` | `Ctrl + Shift + F` | Find in project |
| `Cmd + Shift + R` | `Ctrl + Shift + R` | Replace in project |

### 4. Running & Debugging

| Shortcut (Mac) | Shortcut (Windows) | Action |
|----------------|-------------------|--------|
| `Ctrl + R` | `Shift + F10` | Run (start dev server) |
| `Ctrl + D` | `Shift + F9` | Debug |
| `Cmd + F2` | `Ctrl + F2` | Stop |

### 5. Terminal

| Shortcut (Mac) | Shortcut (Windows) | Action |
|----------------|-------------------|--------|
| `Alt + F12` | `Alt + F12` | Toggle terminal |
| `Cmd + T` | - | New terminal tab |

---

## Step 9: WebStorm Tool Windows

### Essential Tool Windows (Bottom Bar):

1. **Terminal** (`Alt + F12`)
   - Run commands like `npm install`, `npm run build`
   - Git commands

2. **Run** (`Cmd + 4` / `Alt + 4`)
   - Shows output when running scripts
   - Dev server logs appear here

3. **Problems** (`Cmd + 6` / `Alt + 6`)
   - Shows TypeScript errors
   - ESLint warnings

4. **Version Control** (`Cmd + 9` / `Alt + 9`)
   - Git integration
   - View changes, commit, push

5. **Services** (`Cmd + 8` / `Alt + 8`)
   - npm scripts
   - Shows running processes

6. **Structure** (`Cmd + 7` / `Alt + 7`)
   - View file structure
   - Methods, variables, etc.

---

## Step 10: Running Different npm Scripts

### Available Scripts:

In WebStorm, you can run any of these:

1. **Dev Server** (recommended for development)
   ```bash
   npm run dev
   ```
   - Starts Vite dev server
   - Hot reload (changes update immediately)
   - Fast refresh

2. **Build for Production**
   ```bash
   npm run build
   ```
   - Compiles TypeScript
   - Bundles with Vite
   - Creates `dist/` folder
   - Optimizes and minifies

3. **Preview Production Build**
   ```bash
   npm run preview
   ```
   - Serves the `dist/` folder
   - Test production build locally

4. **Lint Code**
   ```bash
   npm run lint
   ```
   - Runs ESLint
   - Checks for code quality issues

---

## Step 11: Live Reload / Hot Module Replacement

When you run `npm run dev`, WebStorm + Vite will:

1. **Auto-reload when you save files:**
   - Edit `src/App.tsx`
   - Press `Cmd + S` / `Ctrl + S` to save
   - Browser updates **instantly** without full page reload

2. **See errors in real-time:**
   - TypeScript errors appear in **Problems** tab
   - Console errors appear in browser

3. **Tailwind classes update live:**
   - Add a new class like `bg-red-500`
   - Save file
   - See the change immediately

---

## Step 12: WebStorm Plugins (Optional but Recommended)

### Install Plugins:

1. **WebStorm → Settings → Plugins**
2. Click **"Marketplace"** tab
3. Search and install:

#### Recommended:
- **Tailwind CSS** - Better autocomplete for Tailwind classes
- **Rainbow Brackets** - Color-code matching brackets
- **GitToolBox** - Enhanced Git integration
- **.env files support** - Syntax highlighting for .env

#### Optional:
- **Material Theme UI** - Better UI theme
- **Atom Material Icons** - Better file icons
- **Key Promoter X** - Learn keyboard shortcuts

---

## Step 13: Debugging in WebStorm

### Debug the App in Chrome:

1. Start dev server: `npm run dev`
2. **Run → Edit Configurations...**
3. Click **"+"** → **"JavaScript Debug"**
4. Configure:
   - **Name:** `Debug Kvizovka`
   - **URL:** `http://localhost:5173`
   - **Browser:** Chrome
5. Click **OK**
6. Click the **debug button** (🐛) in toolbar

WebStorm will:
- Open Chrome
- Connect debugger
- You can set breakpoints in your code
- Inspect variables
- Step through code

### Set Breakpoints:

1. Open `src/App.tsx`
2. Click in the left gutter next to line number
3. Red dot appears = breakpoint set
4. Run in debug mode
5. Code will pause at breakpoint

### Debug Console:

While debugging, you can:
- Hover over variables to see values
- Evaluate expressions in Console
- Step through code line by line
- Continue, pause, or stop execution

---

## Step 14: Git Integration in WebStorm

### Initialize Git (if not done):

1. **VCS → Enable Version Control Integration...**
2. Select **Git**
3. Click **OK**

### Commit Changes:

1. **VCS → Commit** (or `Cmd + K` / `Ctrl + K`)
2. Select files to commit
3. Write commit message
4. Click **"Commit"** or **"Commit and Push"**

### View Changes:

1. **VCS → Show Git Log**
2. See all commits
3. Compare versions
4. Right-click → **Show Diff** to see changes

### Push to Remote:

1. **VCS → Git → Push** (or `Cmd + Shift + K` / `Ctrl + Shift + K`)
2. Review commits to push
3. Click **"Push"**

### Common Git Operations in WebStorm:

| Action | Menu Path | Shortcut (Mac) | Shortcut (Windows) |
|--------|-----------|----------------|-------------------|
| Commit | VCS → Commit | `Cmd + K` | `Ctrl + K` |
| Push | VCS → Git → Push | `Cmd + Shift + K` | `Ctrl + Shift + K` |
| Pull | VCS → Git → Pull | `Cmd + T` | `Ctrl + T` |
| Show History | VCS → Git → Show History | `Cmd + Alt + A` → type "history" | `Ctrl + Alt + A` → type "history" |

---

## Step 15: Common WebStorm Workflows

### Typical Development Session:

1. **Open WebStorm**
2. **Pull latest changes** (if using Git)
   - `VCS → Git → Pull` or `Cmd + T` / `Ctrl + T`
3. **Start dev server**
   - Click play button next to `"dev"` in package.json
   - Or terminal: `npm run dev`
4. **Open browser** to `http://localhost:5173`
5. **Edit files** in WebStorm
   - Make changes to `src/App.tsx`, `src/index.css`, etc.
6. **Save** (`Cmd + S` / `Ctrl + S`) - changes auto-reload in browser
7. **Check for errors** in Problems tab
8. **Commit** when done (`Cmd + K` / `Ctrl + K`)

### When You Finish Working:

1. **Stop dev server**
   - Click red stop button (⬛) in Run panel
   - Or press `Cmd + F2` / `Ctrl + F2`
2. **Commit changes** to Git
3. **Push to GitHub** (optional)
   - `VCS → Git → Push` or `Cmd + Shift + K` / `Ctrl + Shift + K`
4. **Close WebStorm** or leave open for next session

---

## Troubleshooting WebStorm Issues

### Issue 1: "Cannot find module 'react'"

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
```

### Issue 2: TypeScript errors everywhere

**Cause:** TypeScript server not started

**Solution:**
1. **Settings → Languages & Frameworks → TypeScript**
2. Click **"Restart TypeScript service"**

Or:
1. Click on the TypeScript version in the bottom right
2. Click **"Restart TypeScript service"**

### Issue 3: Tailwind classes not autocompleting

**Cause:** Tailwind CSS plugin not enabled

**Solution:**
1. **Settings → Languages & Frameworks → Style Sheets → Tailwind CSS**
2. Check **"Enable Tailwind CSS support"**
3. Restart WebStorm

### Issue 4: Dev server won't start

**Symptoms:**
- Port already in use
- Module not found errors
- Build fails

**Solution:**
1. Stop any running servers (`Cmd + F2` / `Ctrl + F2`)
2. Close WebStorm
3. Delete `node_modules/` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```
4. Reopen WebStorm
5. Run `npm install`
6. Run `npm run dev`

### Issue 5: WebStorm is slow/laggy

**Solution:**
1. Increase memory allocation:
   - **Help → Change Memory Settings**
   - Set to 2048 MB or higher
   - Restart WebStorm

2. Exclude `node_modules` from indexing:
   - Right-click `node_modules` folder
   - **Mark Directory as → Excluded**

3. Disable unnecessary plugins:
   - **Settings → Plugins**
   - Disable plugins you don't use

### Issue 6: "Error: ENOSPC: System limit for number of file watchers reached"

**Cause:** Linux systems have a limit on file watchers

**Solution (Linux only):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue 7: Hot reload not working

**Solution:**
1. Check browser is not caching
   - Open DevTools
   - Check "Disable cache" in Network tab
2. Restart dev server
3. Hard refresh browser (`Cmd + Shift + R` / `Ctrl + Shift + F5`)

---

## Quick Reference Card

### Most Important Shortcuts (Mac):

| Action | Shortcut |
|--------|----------|
| **Run dev server** | Click ▶ next to "dev" in package.json |
| **Stop dev server** | `Cmd + F2` or click ⬛ |
| **Open Terminal** | `Alt + F12` |
| **Find file** | `Cmd + Shift + O` |
| **Recent files** | `Cmd + E` |
| **Search in project** | `Cmd + Shift + F` |
| **Go to definition** | `Cmd + B` or `Cmd + Click` |
| **Commit** | `Cmd + K` |
| **Push** | `Cmd + Shift + K` |
| **Reformat code** | `Cmd + Alt + L` |
| **Autocomplete** | `Cmd + Space` |
| **Duplicate line** | `Cmd + D` |
| **Comment line** | `Cmd + /` |

### Most Important Shortcuts (Windows/Linux):

| Action | Shortcut |
|--------|----------|
| **Run dev server** | Click ▶ next to "dev" in package.json |
| **Stop dev server** | `Ctrl + F2` or click ⬛ |
| **Open Terminal** | `Alt + F12` |
| **Find file** | `Ctrl + Shift + N` |
| **Recent files** | `Ctrl + E` |
| **Search in project** | `Ctrl + Shift + F` |
| **Go to definition** | `Ctrl + B` or `Ctrl + Click` |
| **Commit** | `Ctrl + K` |
| **Push** | `Ctrl + Shift + K` |
| **Reformat code** | `Ctrl + Alt + L` |
| **Autocomplete** | `Ctrl + Space` |
| **Duplicate line** | `Ctrl + D` |
| **Comment line** | `Ctrl + /` |

### Running npm Commands in Terminal:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name
```

---

## WebStorm Pro Tips

### 1. Multi-Cursor Editing

- **Add cursor above:** `Alt + Shift + Up` (Mac) / `Ctrl + Alt + Up` (Windows)
- **Add cursor below:** `Alt + Shift + Down` (Mac) / `Ctrl + Alt + Down` (Windows)
- **Select next occurrence:** `Ctrl + G` (Mac) / `Alt + J` (Windows)

Example:
```typescript
// Select "count" and press Ctrl+G multiple times
const count = useStore(s => s.count)
const increment = useStore(s => s.increment)
const decrement = useStore(s => s.decrement)
```

### 2. Extract Variable/Function

1. Select code
2. **Refactor → Extract** → **Variable/Function**
3. Or: `Cmd + Alt + V` (variable) / `Cmd + Alt + M` (method)

### 3. Rename Everything

1. Place cursor on variable/function name
2. **Refactor → Rename** or `Shift + F6`
3. Type new name
4. WebStorm updates all occurrences!

### 4. Show Usages

Want to see where a function is used?
1. Place cursor on function name
2. **Edit → Find → Show Usages** or `Cmd + Alt + F7` / `Alt + F7`

### 5. Quick Documentation

Hover over any function/type to see:
- Type information
- Documentation
- Parameter info

Or press `F1` (Mac) / `Ctrl + Q` (Windows)

---

## Summary

✅ **To start working on Kvizovka in WebStorm:**

1. **Open:** WebStorm → Open → Select `Kvizovka` folder
2. **Install:** Click "Run 'npm install'" when prompted (or run manually in terminal)
3. **Run:** Click ▶ next to `"dev"` in `package.json`
4. **View:** Open `http://localhost:5173` in browser
5. **Code:** Edit files, save, see changes instantly!

### First-Time Setup Checklist:

- [ ] Project opened in WebStorm
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript service running (check bottom status bar)
- [ ] Tailwind CSS support enabled (Settings → Style Sheets → Tailwind CSS)
- [ ] Dev server running (`npm run dev`)
- [ ] Browser open at `http://localhost:5173`
- [ ] Hot reload working (edit file, save, see changes)

---

## Additional Resources

- [WebStorm Documentation](https://www.jetbrains.com/help/webstorm/)
- [WebStorm Keyboard Shortcuts PDF](https://resources.jetbrains.com/storage/products/webstorm/docs/WebStorm_ReferenceCard.pdf)
- [JetBrains YouTube Channel](https://www.youtube.com/c/JetBrainsTV)
- [WebStorm Blog](https://blog.jetbrains.com/webstorm/)

---

**Last Updated:** January 1, 2026
**WebStorm Version:** 2023.3+
**Project:** Kvizovka v0.2.0

Need help with WebStorm? Check the [official documentation](https://www.jetbrains.com/help/webstorm/) or ask for assistance! 🚀

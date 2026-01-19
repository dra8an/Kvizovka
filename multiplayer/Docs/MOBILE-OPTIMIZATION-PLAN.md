# Mobile-First Optimization for Kvizovka

## Status: PLANNED - Ready for Implementation (2026-01-14)

**Complexity:** High (2-3 weeks estimated)
**Priority:** Critical - Most players use mobile phones
**Strategy:** Progressive Web App (PWA) + Touch Support

---

## Executive Summary

Based on comprehensive codebase analysis, the Kvizovka multiplayer word game currently has **good responsive CSS** but is **essentially unplayable on mobile devices** due to missing touch support. The core drag-and-drop tile placement mechanic doesn't work on touch screens.

**User Requirements:**
- ✅ Mobile is critical priority (most players use phones)
- ✅ Click/tap to select tiles, then tap board to place
- ✅ PWA installation support (add to home screen)
- ✅ Start with PWA approach (NOT native app)

**Current Mobile Readiness: D+ Grade**
- ✅ Responsive CSS: Good (B+)
- ❌ Touch Support: Missing (F)
- ❌ PWA Support: Missing (F)
- ⚠️ Mobile UI: Partial (C)

---

## Critical Problems to Fix

### 1. **BLOCKING ISSUE: Drag-and-Drop Doesn't Work on Mobile**
- HTML5 drag-and-drop API is desktop-only
- No touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`)
- Users cannot place tiles on mobile devices
- **Impact:** Game is completely unplayable on phones/tablets

### 2. **No PWA Support**
- Missing `manifest.json` - cannot install as app
- Missing service worker - no offline support
- Missing app icons
- Cannot add to home screen

### 3. **Board Too Small on Mobile - CRITICAL UX PROBLEM**
- 17×17 board on 375px iPhone = **~22px per square**
- Impossible to accurately tap individual squares
- **Solution:** Auto-zoom board (like Scrabble mobile)
  - When first tile placed → zoom to show ~8×10 area centered on tile
  - Board stays stable until tile placed outside visible area
  - When tiles near edge → re-zoom to show next available squares
  - Desktop: No zoom (board is large enough)

### 4. **Desktop Layout Doesn't Work on Mobile**
- Current layout is 3-column (Scoresheets | Board | Controls)
- Too complex for small screens
- **Solution:** Completely different layout for mobile
  - Vertical stack: Score header → Board → Tile rack → Action bar
  - Simplified score display (just scores, no scoresheet)
  - Icon-based action buttons
  - No chat, no spectator view (MVP)

### 5. **Mobile UI Issues**
- Tile rack (640px wide) doesn't fit on small screens (375px)
- No horizontal scrolling for tile rack
- Modals may be obscured by virtual keyboard
- No full-screen mode for board

---

## Implementation Plan

### Phase 1: Fix Touch Support (Priority 1 - BLOCKING)
**Goal:** Make tile placement work on mobile devices
**Time Estimate:** 3-5 days

#### 1.1 Implement Click-to-Place Tile Mechanic

**Current Implementation (Desktop):**
```typescript
// Drag-and-drop only (broken on mobile)
<div draggable onDragStart={...} onDrop={...}>
```

**New Implementation (Touch-Friendly):**
```typescript
// Hybrid approach: drag on desktop, click on mobile
// 1. Click tile in rack → tile becomes "selected" (highlighted)
// 2. Click board square → place selected tile
// 3. Click selected tile again → deselect
```

**Files to Modify:**

1. **packages/client/src/components/TileRack/TileRack.tsx**
   - Add state: `selectedTileForPlacement: Tile | null`
   - Add click handler: `onTileClick(tile, index)`
   - Highlight selected tile with border/shadow
   - Keep drag-and-drop for desktop compatibility

2. **packages/client/src/components/Board/Square.tsx**
   - Add click handler: `onSquareClick(row, col)`
   - If `selectedTileForPlacement` exists, place tile at clicked square
   - Show visual feedback when hovering/clicking empty square

3. **packages/client/src/components/OnlineGame/OnlineGame.tsx**
   - Add state: `selectedTileForPlacement`
   - Wire up handlers between TileRack and Board
   - Handle tile placement via click
   - Clear selection after placement

**Touch Interaction Flow:**
```
User taps tile in rack
  ↓
Tile highlighted with blue border
  ↓
User taps empty square on board
  ↓
Tile placed at square, selection cleared
  ↓
If joker, show letter selection dialog
```

---

#### 1.2 Implement Device Detection Utilities

**Problem:** Need to distinguish mobile from desktop to apply different UX (zoom on mobile, normal on desktop).

**File:** `packages/client/src/utils/device-detection.ts` (new)

```typescript
/**
 * Device Detection Utilities
 *
 * Detects device capabilities to provide optimal UX:
 * - Mobile: Touch device + small screen → Auto-zoom board
 * - Desktop: Mouse device + large screen → Standard board
 */

export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  )
}

export const isSmallScreen = (): boolean => {
  return window.innerWidth < 768 // Tailwind's md breakpoint
}

export const isMobileDevice = (): boolean => {
  return isTouchDevice() && isSmallScreen()
}

export const isLandscape = (): boolean => {
  return window.innerWidth > window.innerHeight
}

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isSmallScreen()) return 'mobile'
  if (window.innerWidth < 1024) return 'tablet'
  return 'desktop'
}
```

**Usage:**
```typescript
import { isMobileDevice } from '@/utils/device-detection'

// In component
const isMobile = isMobileDevice()

if (isMobile) {
  // Show mobile UI (zoomed board, tap-to-place)
} else {
  // Show desktop UI (standard board, drag-and-drop)
}
```

---

#### 1.3 Implement Completely Different Mobile Layout

**Problem:** Desktop 3-column layout doesn't work on mobile. Need a dedicated mobile game screen.

**Solution:** Split OnlineGame into two implementations:
- `DesktopOnlineGame.tsx` - Current layout (extracted from OnlineGame.tsx)
- `MobileOnlineGame.tsx` - New mobile-optimized layout

**Architecture:**
```
OnlineGame.tsx (wrapper - detects device)
  │
  ├─ Desktop → DesktopOnlineGame.tsx
  │     └─ Current 3-column layout:
  │        [Scoresheets + Chat] [Board + Rack] [Score Panel + Controls]
  │
  └─ Mobile → MobileOnlineGame.tsx (NEW)
        └─ Vertical stack layout:
           ┌─────────────────────────────┐
           │  [You: 14]   [Opponent: 8]  │  ← MobileScoreHeader
           ├─────────────────────────────┤
           │                             │
           │      ZoomableBoard          │  ← Full board → 8×10 zoom
           │   (auto-zoom on tile place) │
           │                             │
           ├─────────────────────────────┤
           │   [A][B][C][D][E][F][G]     │  ← TileRack (scrollable)
           ├─────────────────────────────┤
           │   [↩ Recall] [Play] [Skip]  │  ← MobileActionBar
           └─────────────────────────────┘

Mobile MVP - Excluded features:
  ❌ Scoresheet (detailed move history)
  ❌ Chat
  ❌ Spectator view
  ❌ Connection status indicator
```

---

**File:** `packages/client/src/components/OnlineGame/OnlineGame.tsx` (wrapper - modify)

```typescript
import { useState, useEffect } from 'react'
import { DesktopOnlineGame } from './DesktopOnlineGame'
import { MobileOnlineGame } from './MobileOnlineGame'
import { isMobileDevice } from '@/utils/device-detection'

export function OnlineGame() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())

    const handleResize = () => setIsMobile(isMobileDevice())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Completely different layout based on device
  if (isMobile) {
    return <MobileOnlineGame />
  } else {
    return <DesktopOnlineGame />
  }
}
```

---

**File:** `packages/client/src/components/OnlineGame/DesktopOnlineGame.tsx` (new - extract current)

```typescript
/**
 * Desktop Online Game - Current 3-column layout
 *
 * Extract all existing OnlineGame.tsx code here.
 * No changes to current implementation.
 */

export function DesktopOnlineGame() {
  // All current OnlineGame.tsx logic goes here
  // This is the existing desktop experience
}
```

---

**File:** `packages/client/src/components/OnlineGame/MobileOnlineGame.tsx` (new)

```typescript
/**
 * Mobile Online Game - Simplified vertical layout
 *
 * MVP Features:
 * - Compact score header (your score + opponent score)
 * - Zoomable board (full → 8×10 zoom on tile placement)
 * - Tile rack (horizontally scrollable)
 * - Simple action bar (Recall, Play, Skip)
 *
 * NOT included in MVP:
 * - Scoresheet
 * - Chat
 * - Spectator view
 * - Connection status
 */

import { useOnlineGameStore } from '../../store/onlineGameStore'
import { MobileScoreHeader } from './MobileScoreHeader'
import { ZoomableBoard } from '../Board/ZoomableBoard'
import { TileRack } from '../TileRack/TileRack'
import { MobileActionBar } from './MobileActionBar'

export function MobileOnlineGame() {
  const {
    gameState,
    yourPlayerId,
    makeMove,
    skipTurn,
  } = useOnlineGameStore()

  // Local state for tile placement
  const [selectedTiles, setSelectedTiles] = useState<PlacedTile[]>([])
  const [selectedTileForPlacement, setSelectedTileForPlacement] = useState<Tile | null>(null)

  // ... tile placement handlers

  if (!gameState) {
    return <div>Loading...</div>
  }

  const you = gameState.players.find(p => p.id === yourPlayerId)
  const opponent = gameState.players.find(p => p.id !== yourPlayerId)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Compact score header */}
      <MobileScoreHeader
        yourScore={you?.score || 0}
        yourName={you?.name || 'You'}
        opponentScore={opponent?.score || 0}
        opponentName={opponent?.name || 'Opponent'}
        isYourTurn={gameState.players[gameState.currentPlayerIndex].id === yourPlayerId}
      />

      {/* Zoomable board - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ZoomableBoard
          boardState={gameState.board}
          playerTiles={you?.tiles || []}
          selectedTiles={selectedTiles}
          selectedTileForPlacement={selectedTileForPlacement}
          onTilePlaced={handleTilePlaced}
          onTileRemoved={handleTileRemoved}
          gameState={gameState}
        />
      </div>

      {/* Tile rack */}
      <TileRack
        tiles={you?.tiles || []}
        selectedTiles={selectedTiles}
        selectedTileForPlacement={selectedTileForPlacement}
        onTileClick={handleTileClick}
        onTileRemoved={handleTileRemoved}
      />

      {/* Action bar */}
      <MobileActionBar
        canPlay={selectedTiles.length > 0}
        onRecall={() => setSelectedTiles([])}
        onPlay={() => makeMove(selectedTiles)}
        onSkip={skipTurn}
      />
    </div>
  )
}
```

---

**File:** `packages/client/src/components/OnlineGame/MobileScoreHeader.tsx` (new)

```typescript
/**
 * Mobile Score Header - Compact score display
 *
 * Shows only:
 * - Your avatar/initial + score
 * - Opponent avatar/initial + score
 * - Turn indicator (highlight current player)
 */

interface MobileScoreHeaderProps {
  yourScore: number
  yourName: string
  opponentScore: number
  opponentName: string
  isYourTurn: boolean
}

export function MobileScoreHeader({
  yourScore,
  yourName,
  opponentScore,
  opponentName,
  isYourTurn
}: MobileScoreHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
      <div className="flex justify-between items-center">
        {/* Your score */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          isYourTurn ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'
        }`}>
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white font-bold">
            {yourName.charAt(0).toUpperCase()}
          </div>
          <div className="text-white">
            <div className="text-xs opacity-80">You</div>
            <div className="text-2xl font-bold">{yourScore}</div>
          </div>
        </div>

        {/* VS indicator */}
        <div className="text-white/60 text-sm font-medium">VS</div>

        {/* Opponent score */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
          !isYourTurn ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'
        }`}>
          <div className="text-white text-right">
            <div className="text-xs opacity-80">{opponentName}</div>
            <div className="text-2xl font-bold">{opponentScore}</div>
          </div>
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white font-bold">
            {opponentName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

**File:** `packages/client/src/components/OnlineGame/MobileActionBar.tsx` (new)

```typescript
/**
 * Mobile Action Bar - Bottom action buttons
 *
 * Simple, icon-friendly buttons:
 * - Recall (return tiles to rack)
 * - Play Word (submit move)
 * - Skip Turn
 */

interface MobileActionBarProps {
  canPlay: boolean
  onRecall: () => void
  onPlay: () => void
  onSkip: () => void
}

export function MobileActionBar({
  canPlay,
  onRecall,
  onPlay,
  onSkip
}: MobileActionBarProps) {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
      <div className="flex justify-center gap-3">
        {/* Recall button */}
        <button
          onClick={onRecall}
          disabled={!canPlay}
          className="px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium disabled:opacity-50"
        >
          ↩ Recall
        </button>

        {/* Play button */}
        <button
          onClick={onPlay}
          disabled={!canPlay}
          className="px-8 py-3 rounded-lg bg-green-500 text-white font-bold disabled:opacity-50 disabled:bg-gray-300"
        >
          Play
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
```

---

#### 1.4 Implement Smart Auto-Zoom Board (Mobile Only)

**Problem:** 17×17 board = ~22px squares on 375px phone → impossible to tap accurately.

**Solution:** ZoomableBoard component with auto-zoom behavior:
- Full board shown initially (before any tiles placed)
- Zoom to ~8×10 area when first tile placed
- Keep zoom stable until tile placed outside visible area
- Re-zoom to follow tile placement

---

**File:** `packages/client/src/components/Board/Board.tsx` (wrapper - modify)

```typescript
import { useState, useEffect } from 'react'
import { StandardBoard } from './StandardBoard'
import { ZoomableBoard } from './ZoomableBoard'
import { isMobileDevice } from '@/utils/device-detection'

export function Board(props: BoardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect on mount
    setIsMobile(isMobileDevice())

    // Re-check on resize (device rotation, responsive testing)
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Conditional rendering based on device
  if (isMobile) {
    return <ZoomableBoard {...props} />
  } else {
    return <StandardBoard {...props} />
  }
}
```

---

**File:** `packages/client/src/components/Board/StandardBoard.tsx` (new - extract from existing Board.tsx)

```typescript
/**
 * Standard Board - Desktop Version
 *
 * - Fixed size board (no zoom)
 * - Drag-and-drop tile placement
 * - Click-to-place fallback
 * - Large enough squares for easy clicking
 */

export function StandardBoard(props: BoardProps) {
  // Extract existing Board.tsx logic here
  // No changes to current implementation
  // This is the "classic" desktop experience
}
```

---

**File:** `packages/client/src/components/Board/ZoomableBoard.tsx` (new - mobile version)

```typescript
/**
 * Zoomable Board - Mobile Version
 *
 * Auto-zoom behavior (like Scrabble mobile):
 * 1. No tiles placed → Show full board (scale: 1)
 * 2. First tile placed → Zoom 2.5x centered on that tile
 * 3. More tiles placed → Zoom to fit word region + 2 square padding
 * 4. Tiles near edge → Re-zoom to show next available squares
 *
 * Features:
 * - Touch-based panning
 * - Manual zoom controls (+/- buttons)
 * - Reset zoom button
 * - Smooth zoom transitions
 */

import { useState, useEffect, useRef } from 'react'
import { PlacedTile } from '@kvizovka/shared'

interface ZoomableBoardProps {
  // Same props as regular Board
  selectedTiles: PlacedTile[]
  // ... other props
}

export function ZoomableBoard({ selectedTiles, ...props }: ZoomableBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  })

  // Auto-zoom when tiles are placed
  useEffect(() => {
    if (selectedTiles.length === 0) {
      // No tiles - show full board
      resetZoom()
      return
    }

    if (selectedTiles.length === 1) {
      // First tile placed - zoom 2.5x centered on that tile
      const firstTile = selectedTiles[0]
      zoomToSquare(firstTile.row, firstTile.col, 2.5)
      return
    }

    // Multiple tiles - calculate bounding box and zoom to fit
    const bounds = calculateBoundingBox(selectedTiles)
    zoomToRegion(bounds)
  }, [selectedTiles])

  const zoomToSquare = (row: number, col: number, scale: number) => {
    if (!boardRef.current) return

    const squareSize = boardRef.current.offsetWidth / 17
    const centerX = (col + 0.5) * squareSize
    const centerY = (row + 0.5) * squareSize

    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    const translateX = viewportCenterX - (centerX * scale)
    const translateY = viewportCenterY - (centerY * scale)

    setTransform({ scale, translateX, translateY })
  }

  const calculateBoundingBox = (tiles: PlacedTile[]) => {
    const rows = tiles.map(t => t.row)
    const cols = tiles.map(t => t.col)

    return {
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols)
    }
  }

  const zoomToRegion = (bounds: {
    minRow: number
    maxRow: number
    minCol: number
    maxCol: number
  }) => {
    if (!boardRef.current) return

    // Add 2 squares padding on each side (to show next available squares)
    const paddedBounds = {
      minRow: Math.max(0, bounds.minRow - 2),
      maxRow: Math.min(16, bounds.maxRow + 2),
      minCol: Math.max(0, bounds.minCol - 2),
      maxCol: Math.min(16, bounds.maxCol + 2)
    }

    const regionWidth = paddedBounds.maxCol - paddedBounds.minCol + 1
    const regionHeight = paddedBounds.maxRow - paddedBounds.minRow + 1

    // Calculate scale to fit region in viewport
    const squareSize = boardRef.current.offsetWidth / 17
    const viewportWidth = window.innerWidth * 0.9 // 90% of viewport
    const viewportHeight = window.innerHeight * 0.6 // 60% of viewport

    const scaleX = viewportWidth / (regionWidth * squareSize)
    const scaleY = viewportHeight / (regionHeight * squareSize)
    const scale = Math.min(scaleX, scaleY, 3) // Max 3x zoom

    // Center the region
    const regionCenterX = ((paddedBounds.minCol + paddedBounds.maxCol) / 2 + 0.5) * squareSize
    const regionCenterY = ((paddedBounds.minRow + paddedBounds.minRow) / 2 + 0.5) * squareSize

    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    const translateX = viewportCenterX - (regionCenterX * scale)
    const translateY = viewportCenterY - (regionCenterY * scale)

    setTransform({ scale, translateX, translateY })
  }

  const resetZoom = () => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }

  const zoomIn = () => {
    setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.5, 4) }))
  }

  const zoomOut = () => {
    setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.5, 1) }))
  }

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Manual zoom controls (bottom-right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="bg-white/90 p-3 rounded-lg shadow-lg text-xl font-bold active:bg-gray-100"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="bg-white/90 p-3 rounded-lg shadow-lg text-xl font-bold active:bg-gray-100"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className="bg-white/90 p-2 rounded-lg shadow-lg text-sm active:bg-gray-100"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>

      {/* Pannable board container */}
      <div
        ref={boardRef}
        className="touch-pan-y touch-pan-x select-none"
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: 'transform 0.3s ease-out',
          willChange: 'transform',
          cursor: 'grab'
        }}
      >
        {/* Regular board grid (same as StandardBoard) */}
        {/* Render 17x17 grid with Square components */}
      </div>
    </div>
  )
}
```

---

**File:** `packages/client/src/components/Board/hooks/useZoomPan.ts` (new - optional)

Extract zoom/pan logic into reusable hook:

```typescript
/**
 * useZoomPan Hook
 *
 * Manages zoom and pan state for mobile board
 */

export function useZoomPan(selectedTiles: PlacedTile[]) {
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  })

  const zoomToSquare = (row: number, col: number, scale: number) => {
    // ... implementation
  }

  const zoomToRegion = (bounds: BoundingBox) => {
    // ... implementation
  }

  const resetZoom = () => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }

  // Auto-zoom effect
  useEffect(() => {
    if (selectedTiles.length === 0) {
      resetZoom()
    } else if (selectedTiles.length === 1) {
      zoomToSquare(selectedTiles[0].row, selectedTiles[0].col, 2.5)
    } else {
      const bounds = calculateBoundingBox(selectedTiles)
      zoomToRegion(bounds)
    }
  }, [selectedTiles])

  return {
    transform,
    zoomToSquare,
    zoomToRegion,
    resetZoom,
    zoomIn: () => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.5, 4) })),
    zoomOut: () => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.5, 1) }))
  }
}
```

---

### Phase 2: Add PWA Support (Priority 1)
**Goal:** Allow users to install app on home screen
**Time Estimate:** 2-3 days

#### 2.1 Create Web App Manifest

**File:** `packages/client/public/manifest.json` (new)

```json
{
  "name": "Kvizovka - Multiplayer Word Game",
  "short_name": "Kvizovka",
  "description": "Multiplayer Serbian word game - play with friends online",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e293b",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-game.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-game.png",
      "sizes": "640x1136",
      "type": "image/png"
    }
  ]
}
```

#### 2.2 Update index.html with PWA Meta Tags

**File:** `packages/client/index.html`

Add to `<head>`:
```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Theme Color -->
<meta name="theme-color" content="#3b82f6" />

<!-- iOS Specific -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Kvizovka" />
<link rel="apple-touch-icon" href="/icons/icon-180x180.png" />

<!-- Android Specific -->
<meta name="mobile-web-app-capable" content="yes" />
```

#### 2.3 Install Vite PWA Plugin

**Command:**
```bash
npm install vite-plugin-pwa --save-dev --workspace=@kvizovka/client
```

**File:** `packages/client/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'screenshots/*.png'],
      manifest: {
        // Manifest content (can also use separate manifest.json)
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

#### 2.4 Create App Icons

**Required Icons:**
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 (standard)
- 192x192, 512x512 (maskable - for Android adaptive icons)
- 180x180 (Apple touch icon)

**Icon Design Guidelines:**
- Use game logo or "K" letter from Kvizovka
- Simple, recognizable design
- Works on light and dark backgrounds
- Maskable icons: important content in safe zone (80% circle)

**Tools:**
- Use https://realfavicongenerator.net/ to generate all sizes
- Or use https://maskable.app/ for maskable icons

**Directory:** `packages/client/public/icons/`

#### 2.5 Add Install Prompt Component

**File:** `packages/client/src/components/InstallPrompt/InstallPrompt.tsx` (new)

```typescript
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal in localStorage
    localStorage.setItem('installPromptDismissed', 'true')
  }

  if (!showPrompt) return null

  // Check if already dismissed
  if (localStorage.getItem('installPromptDismissed') === 'true') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl p-4 z-50 border-2 border-blue-500">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      <div className="flex items-start gap-3">
        <div className="text-3xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Install Kvizovka</h3>
          <p className="text-sm text-gray-600 mb-3">
            Add to your home screen for a better experience!
          </p>
          <button
            onClick={handleInstall}
            className="btn-primary w-full py-2 text-sm"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Integration:** Add to App.tsx or OnlineMenu.tsx

---

### Phase 3: Mobile UI Improvements (Priority 2)
**Goal:** Optimize UI for small screens
**Time Estimate:** 3-4 days

#### 3.1 Scrollable Tile Rack

**Problem:** Tile rack is 640px wide (10 tiles × 64px), won't fit on 375px phone

**Solution:** Horizontal scrolling

**File:** `packages/client/src/components/TileRack/TileRack.tsx`

```typescript
// Change from flex to horizontal scroll
<div className="flex gap-1.5 overflow-x-auto pb-2 px-2">
  {/* Tiles render as before */}
</div>

// Add scroll indicators (optional)
<div className="flex justify-center gap-1 mt-1">
  {tiles.map((_, idx) => (
    <div
      key={idx}
      className={`w-2 h-2 rounded-full ${
        idx === currentScrollIndex ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    />
  ))}
</div>
```

**Alternative:** Wrap tiles to multiple rows on small screens
```typescript
<div className="flex flex-wrap gap-1.5 justify-center">
  {/* Tiles wrap to 2 rows on small screens */}
</div>
```

#### 3.2 Full-Screen Board Mode

**File:** `packages/client/src/components/Board/Board.tsx`

Add full-screen toggle button (mobile only):

```typescript
const [isFullScreen, setIsFullScreen] = useState(false)

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    boardRef.current?.requestFullscreen()
    setIsFullScreen(true)
  } else {
    document.exitFullscreen()
    setIsFullScreen(false)
  }
}

return (
  <div ref={boardRef} className="relative">
    {/* Board content */}

    {/* Full-screen button (mobile only) */}
    <button
      onClick={toggleFullScreen}
      className="md:hidden absolute top-2 right-2 bg-white/80 p-2 rounded-lg shadow"
    >
      {isFullScreen ? '↙️' : '↗️'}
    </button>
  </div>
)
```

#### 3.3 Improved Modal/Dialog Sizing

**Files:** All dialog components

Update modals to use safer mobile sizing:
```typescript
// Before
<div className="max-w-sm mx-4">

// After (ensures modals don't get obscured by keyboard)
<div className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
```

Add keyboard awareness:
```typescript
useEffect(() => {
  const handleResize = () => {
    // Detect virtual keyboard open (viewport height shrinks)
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    setKeyboardOpen(window.innerHeight - viewportHeight > 100)
  }

  window.visualViewport?.addEventListener('resize', handleResize)
  return () => window.visualViewport?.removeEventListener('resize', handleResize)
}, [])
```

#### 3.4 Mobile-Optimized Tap Targets

Ensure all interactive elements meet minimum tap target size (44x44px):

**Files:** All button components

```typescript
// Small buttons need more padding on mobile
<button className="py-3 px-4 md:py-2 md:px-3">
  {/* Mobile: 44px min height, Desktop: smaller */}
</button>
```

#### 3.5 Landscape Mode Optimization

**File:** `packages/client/src/components/OnlineGame/OnlineGame.tsx`

Add landscape-specific layout:
```typescript
// Detect orientation
const isLandscape = window.innerWidth > window.innerHeight

// Layout: Board + rack side-by-side in landscape
<div className={`
  ${isLandscape ? 'flex gap-4' : 'space-y-2'}
`}>
  <Board {...props} />
  <TileRack {...props} />
</div>
```

---

### Phase 4: Testing & Polish (Priority 3)
**Goal:** Ensure everything works on real devices
**Time Estimate:** 2-3 days

#### 4.1 Device Testing Checklist

Test on:
- [ ] iPhone SE (375px width) - smallest common phone
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPhone 12/13/14 Pro Max (428px width)
- [ ] Samsung Galaxy S21 (360px width)
- [ ] iPad (768px width)
- [ ] iPad Pro (1024px width)

Test scenarios:
- [ ] Place tiles using click/tap
- [ ] Scroll tile rack
- [ ] Play full game round
- [ ] Chat functionality
- [ ] Install as PWA
- [ ] Offline mode (if implemented)
- [ ] Landscape mode
- [ ] Virtual keyboard doesn't obscure UI
- [ ] Touch gestures don't conflict with game

#### 4.2 Performance Optimization

Check performance on mobile devices:
- Bundle size (target: <500KB)
- Load time (target: <3s on 3G)
- Frame rate during tile placement (target: 60fps)

Use Lighthouse audit (Mobile):
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- PWA: 100

#### 4.3 Add Loading States

**File:** `packages/client/src/components/LoadingSpinner/LoadingSpinner.tsx` (new)

Show loading spinner while game loads:
```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="ml-3 text-gray-600">Loading game...</p>
    </div>
  )
}
```

---

## Files to Create

### New Files:

#### Device Detection:
1. `packages/client/src/utils/device-detection.ts` - Device detection utilities (mobile vs desktop)

#### Mobile Game Layout (NEW - Complete mobile experience):
2. `packages/client/src/components/OnlineGame/DesktopOnlineGame.tsx` - Extract current OnlineGame layout
3. `packages/client/src/components/OnlineGame/MobileOnlineGame.tsx` - New mobile vertical layout
4. `packages/client/src/components/OnlineGame/MobileScoreHeader.tsx` - Compact score display
5. `packages/client/src/components/OnlineGame/MobileActionBar.tsx` - Bottom action buttons

#### Board Components:
6. `packages/client/src/components/Board/ZoomableBoard.tsx` - Mobile board with auto-zoom
7. `packages/client/src/components/Board/hooks/useZoomPan.ts` - Zoom/pan logic hook (optional)

#### PWA Assets:
8. `packages/client/public/manifest.json` - PWA manifest
9. `packages/client/public/icons/` - App icons directory
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-180x180.png (Apple)
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png
   - icon-192x192-maskable.png
   - icon-512x512-maskable.png
7. `packages/client/public/screenshots/` - PWA screenshots directory
   - desktop-game.png
   - mobile-game.png

#### UI Components:
8. `packages/client/src/components/InstallPrompt/InstallPrompt.tsx` - PWA install banner
9. `packages/client/src/components/LoadingSpinner/LoadingSpinner.tsx` - Loading indicator

**Total New Files:** ~20 files

---

## Files to Modify

### Critical Changes:

#### Touch Support & Device Detection:
1. **packages/client/src/components/Board/Board.tsx**
   - **MAJOR REFACTOR**: Convert to wrapper component
   - Add device detection on mount
   - Conditional rendering: StandardBoard (desktop) vs ZoomableBoard (mobile)
   - Handle window resize for device rotation

2. **packages/client/src/components/Board/Square.tsx**
   - Add click handler for tile placement
   - Show visual feedback on tap
   - Support both drag and click

3. **packages/client/src/components/TileRack/TileRack.tsx**
   - Add click-to-select tile functionality
   - Add horizontal scroll for small screens
   - Highlight selected tile

4. **packages/client/src/components/OnlineGame/OnlineGame.tsx**
   - Add `selectedTileForPlacement` state
   - Wire up click-to-place handlers
   - Add InstallPrompt component

#### PWA Support:
5. **packages/client/index.html**
   - Add PWA meta tags
   - Link manifest.json
   - Add theme color

6. **packages/client/vite.config.ts**
   - Install and configure vite-plugin-pwa
   - Configure service worker

7. **packages/client/package.json**
   - Add vite-plugin-pwa dependency

### UI Improvements:
8. **packages/client/src/components/Chat/Chat.tsx**
   - Ensure chat input not obscured by keyboard

9. **packages/client/src/components/OnlineMenu/OnlineMenu.tsx**
   - Add InstallPrompt component

10. **All dialog components**
    - Update max-height for keyboard safety
    - Ensure scrollable content

---

## Implementation Order

### Week 1: Touch Support & Auto-Zoom (CRITICAL)
**Days 1-2:** Device detection and board split
- Create device-detection.ts utility
- Split Board.tsx into wrapper + StandardBoard + ZoomableBoard
- Test conditional rendering on mobile vs desktop

**Days 3-4:** Implement zoom logic and click-to-place
- Implement auto-zoom in ZoomableBoard
- Add manual zoom controls (+/- buttons)
- Add click-to-place in TileRack and Square
- Wire up state in OnlineGame

**Day 5:** Testing and refinement
- Test on real mobile devices (iPhone, Android)
- Verify zoom behavior (first tile, multiple tiles, edge cases)
- Test desktop still works (no zoom, drag-and-drop)
- Polish visual feedback and transitions

### Week 2: PWA Support
**Days 6-7:** Create icons and manifest
- Design app icon
- Generate all required sizes
- Create manifest.json
- Take screenshots for PWA

**Days 8-9:** Install PWA plugin and service worker
- Install vite-plugin-pwa
- Configure workbox
- Update index.html
- Create InstallPrompt component

**Day 10:** Testing
- Test PWA installation on iOS and Android
- Test offline functionality
- Lighthouse audit

### Week 3: Mobile UI Polish
**Days 11-12:** Scrollable tile rack and full-screen mode
- Implement horizontal scroll
- Add full-screen toggle
- Test on small screens

**Days 13-14:** Modal improvements and landscape mode
- Fix keyboard obscuring modals
- Optimize landscape layout
- Ensure all tap targets are 44px+

**Day 15:** Final testing and deployment
- Test on all target devices
- Performance audit
- Deploy to production

---

## Success Criteria

### Phase 1: Touch Support & Auto-Zoom
- [ ] Users can place tiles by clicking/tapping (no drag required)
- [ ] Tile selection is visually clear (highlight)
- [ ] Works on iPhone, Android, iPad
- [ ] Joker letter selection works on touch
- [ ] Tile removal works on touch
- [ ] **Auto-zoom on mobile:**
  - [ ] Full board shown when no tiles placed
  - [ ] Zoom 2.5x to first tile when placed
  - [ ] Zoom to fit word region + 2 square padding for multiple tiles
  - [ ] Manual zoom controls (+/- buttons) work
  - [ ] Pan/swipe to explore board
  - [ ] Reset zoom button returns to full board
- [ ] **Desktop unchanged:**
  - [ ] No zoom on desktop (standard board)
  - [ ] Drag-and-drop still works
  - [ ] Click-to-place works as fallback

### Phase 2: PWA Support
- [ ] Users can install app on home screen (iOS and Android)
- [ ] App launches in standalone mode (no browser UI)
- [ ] Service worker caches essential assets
- [ ] Works offline for previously loaded content
- [ ] App icon displays correctly

### Phase 3: Mobile UI
- [ ] Tile rack fits on 375px screen (iPhone SE)
- [ ] All buttons are tappable (44x44px minimum)
- [ ] Virtual keyboard doesn't obscure input
- [ ] Board usable in portrait and landscape
- [ ] Chat scrolls properly on mobile

### Phase 4: Performance
- [ ] Lighthouse Mobile score >90 for all categories
- [ ] PWA score: 100
- [ ] Load time <3s on 3G
- [ ] Smooth 60fps animations

---

## Alternative Approaches Considered

### 1. Touch Event Library (react-use-gesture)
**Pros:**
- Native drag-and-drop feel on touch
- Advanced gesture support (swipe, pinch)

**Cons:**
- Additional dependency (31KB)
- More complex implementation
- May conflict with existing drag-and-drop

**Decision:** Rejected - Click-to-place is simpler and works everywhere

### 2. React Native (Native App)
**Pros:**
- True native app experience
- Better performance on older devices
- Access to native APIs

**Cons:**
- Requires separate codebase
- App Store/Play Store deployment complexity
- Weeks/months of development time
- Ongoing maintenance burden

**Decision:** Rejected for now - PWA is sufficient, can revisit later

### 3. Hybrid Approach (Cordova/Capacitor)
**Pros:**
- Reuse web codebase
- Publish to app stores
- Access some native APIs

**Cons:**
- Still requires app store deployment
- Extra build complexity
- PWA covers 95% of use cases

**Decision:** Rejected - PWA is simpler and faster

---

## Risks and Mitigations

### Risk 1: iOS PWA Limitations
**Risk:** iOS has limited PWA support (no notifications, some storage limits)
**Mitigation:** Focus on core functionality, accept iOS limitations for now

### Risk 2: Service Worker Caching Issues
**Risk:** Stale content cached, users don't see updates
**Mitigation:** Use `autoUpdate` strategy, add manual refresh option

### Risk 3: Touch Performance
**Risk:** Touch interactions feel laggy on older devices
**Mitigation:** Optimize React re-renders, use CSS transforms, throttle events

### Risk 4: Offline Mode Complexity
**Risk:** Game requires server connection, offline mode limited
**Mitigation:** Cache static assets only, show clear "offline" message when server unavailable

---

## Dependencies

### New Dependencies to Install:
```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.0",
    "workbox-window": "^7.0.0"
  }
}
```

### Icon Generation Tools (External):
- https://realfavicongenerator.net/
- https://maskable.app/

---

## Testing Strategy

### Manual Testing Devices:
1. iPhone SE (375px) - Smallest common phone
2. iPhone 14 (390px) - Popular phone
3. Android phone (360-400px) - Test browser
4. iPad (768px) - Tablet experience
5. Desktop (1920px) - Ensure desktop not broken

### Automated Testing:
- Lighthouse CI for PWA compliance
- Bundle size monitoring
- Visual regression tests (optional)

### User Testing:
- Beta test with 5-10 users on mobile
- Collect feedback on click-to-place UX
- Monitor installation conversion rate

---

## Deployment Checklist

Before deploying mobile updates:
- [ ] All PWA assets generated (icons, manifest)
- [ ] Service worker tested and working
- [ ] Touch interaction tested on real devices
- [ ] Lighthouse audit passes (PWA: 100)
- [ ] Install prompt tested on iOS and Android
- [ ] Offline mode tested
- [ ] Chat notifications work on mobile
- [ ] Virtual keyboard doesn't break layout
- [ ] Game playable in portrait and landscape
- [ ] Performance acceptable on 3G connection

---

## Future Enhancements (Post-MVP)

### Phase 5: Advanced Touch Features
- Swipe to recall tiles
- Pinch to zoom board
- Long-press for tile context menu
- Haptic feedback on tile placement

### Phase 6: Offline Mode
- Queue moves when offline
- Sync when connection restored
- Offline dictionary caching

### Phase 7: Native App (If Needed)
- React Native version
- App Store and Play Store deployment
- Push notifications
- Better background sync

### Phase 8: Advanced PWA
- Web Push notifications for turn alerts
- Background sync for move updates
- Share target API (share room codes)
- Shortcuts API (quick join last game)

---

## Open Questions

1. **Icon Design:** Do you have existing Kvizovka branding/logo, or should we create simple letter-based icon?
2. **Offline Priority:** How important is offline mode? (Affects service worker strategy)
3. **Installation Timing:** When should we show install prompt? (Immediately, after first game, after user returns?)
4. **Analytics:** Should we track PWA installation rate and mobile vs desktop usage?

---

## Next Steps

1. **Tomorrow:** Start with Phase 1 (Touch Support)
2. **Get icon design** from user or create simple "K" logo
3. **Set up test devices** for continuous testing
4. **Implement click-to-place** as highest priority
5. **Deploy and test** on Render with real mobile devices

---

## Project Structure & Repository Organization

### Single Monorepo Approach

**Decision:** Keep everything in the **current monorepo** (`multiplayer/`).

**Why?**
- Same codebase for desktop and mobile (responsive web app)
- PWA = enhanced web app, not separate native app
- Shared components, logic, and types
- Single deployment, same URL
- One build process

**Directory Structure:**
```
multiplayer/
├── packages/
│   ├── client/                    # All changes here
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   └── device-detection.ts       # NEW
│   │   │   ├── components/
│   │   │   │   ├── Board/
│   │   │   │   │   ├── Board.tsx             # MODIFY (wrapper)
│   │   │   │   │   ├── StandardBoard.tsx     # NEW (desktop)
│   │   │   │   │   ├── ZoomableBoard.tsx     # NEW (mobile)
│   │   │   │   │   ├── Square.tsx            # MODIFY
│   │   │   │   │   └── hooks/
│   │   │   │   │       └── useZoomPan.ts     # NEW
│   │   │   │   ├── TileRack/                 # MODIFY
│   │   │   │   ├── OnlineGame/               # MODIFY
│   │   │   │   ├── InstallPrompt/            # NEW
│   │   │   │   └── LoadingSpinner/           # NEW
│   │   │   └── ...
│   │   └── public/
│   │       ├── manifest.json                  # NEW
│   │       ├── icons/                         # NEW
│   │       └── screenshots/                   # NEW
│   ├── server/                    # No changes
│   └── shared/                    # No changes
└── Docs/
    └── MOBILE-OPTIMIZATION-PLAN.md
```

**Benefits:**
- ✅ Single codebase - easier maintenance
- ✅ Type safety across all code
- ✅ Shared game engine and business logic
- ✅ One deployment pipeline
- ✅ Bugs fixed benefit both desktop and mobile

**When You'd Need Separate Repo:**
- ❌ React Native app (we're NOT doing this)
- ❌ Completely different mobile UI
- ❌ App Store/Play Store native app

**Our Approach:**
- Same repo, same build, same deployment
- Conditional rendering based on device detection
- Desktop and mobile share 95% of code
- Only Board component has mobile/desktop variants

---

## Conclusion

**DO NOT need a native app** - PWA approach is sufficient for Kvizovka's needs.

**What We're Building:**
1. **Single responsive web app** that works on desktop AND mobile
2. **Same codebase, same repo** - conditional rendering based on device
3. **Smart auto-zoom** on mobile (like Scrabble mobile) to solve the tiny squares problem
4. **PWA features** for installation and offline support
5. **Click-to-place** tile mechanic that works everywhere

**Why This Works:**
- Desktop: Standard board (no zoom needed, squares are large enough)
- Mobile: Auto-zoom board (squares become tappable after zoom)
- Both: Use same components, same game logic, same server
- Result: One app that adapts to device capabilities

**Timeline:**
- **Week 1:** Touch support + auto-zoom (CRITICAL)
- **Week 2:** PWA installation
- **Week 3:** Mobile UI polish
- **Total:** 2-3 weeks to full mobile support

This approach gets mobile users playing in **2-3 weeks** instead of months for native app development.

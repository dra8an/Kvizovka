# Mobile Optimization Progress

**Status:** In Progress
**Last Updated:** 2026-01-16

---

## Summary

Mobile optimization for Kvizovka multiplayer word game. The goal is to make the game fully playable on mobile devices with touch-based drag-and-drop.

---

## Completed

### 1. Separate Mobile/Desktop Layouts
- Created device detection utilities (`src/utils/device-detection.ts`)
- `OnlineGame.tsx` now routes to `MobileOnlineGame.tsx` or `DesktopOnlineGame.tsx` based on device
- Mobile layout: vertical stack (Score Header → Board → Tile Rack → Action Bar)
- Desktop layout: 3-column (unchanged)

**Files created:**
- `src/utils/device-detection.ts`
- `src/components/OnlineGame/MobileOnlineGame.tsx`
- `src/components/OnlineGame/MobileScoreHeader.tsx`
- `src/components/OnlineGame/MobileActionBar.tsx`
- `src/components/OnlineGame/DesktopOnlineGame.tsx` (extracted from OnlineGame)

**Files modified:**
- `src/components/OnlineGame/OnlineGame.tsx` (now a wrapper)

### 2. Touch Drag-and-Drop
- Implemented touch-based drag-and-drop for tile placement
- Created `useTouchDrag` hook for handling touch events
- Created `DragOverlay` component (ghost tile that follows finger)

**Files created:**
- `src/hooks/useTouchDrag.ts`
- `src/components/DragOverlay/DragOverlay.tsx`

### 3. Compact Mode for Mobile
- Added `compact` prop to `Board`, `Square`, `TileRack`, and `Tile` components
- Mobile tiles: 28px × 28px (w-7 h-7)
- Mobile board: 96% viewport width, 1px gaps
- Tiles on board: no inset padding, smaller text
- Hidden elements in compact mode: tile values, joker indicators, board legend

**Files modified:**
- `src/components/Board/Board.tsx` - added `compact`, `hideLegend`, `touchTargetSquare` props
- `src/components/Board/Square.tsx` - added `compact`, `isTouchTarget` props
- `src/components/TileRack/TileRack.tsx` - added `compact`, `onTouchDragStart`, `draggingTileId` props
- `src/components/TileRack/Tile.tsx` - added `compact` prop

### 4. Touch Target Visual Feedback
- Target square highlights while dragging
- **Pop-up effect:** Target square scales 150%, floats above others with shadow
- Real-time tracking of finger position over board
- 10px tolerance around board edges

**Implementation:**
- `useTouchDrag` hook tracks `targetRow` and `targetCol` during drag
- `Board` passes `touchTargetSquare` prop to highlight the target
- `Square` applies scale, z-index, and shadow when `isTouchTarget` is true

### 5. Vite Configuration Fix
- Fixed stale cache issue with local workspace package
- Changed `@kvizovka/shared` from `optimizeDeps.include` to `optimizeDeps.exclude`
- Added alias to point directly to shared package source

**File modified:**
- `packages/client/vite.config.ts`

### 6. Translation Keys
- Added mobile-specific translations to `en/online.json` and `sr/online.json`

---

### 5. Touch Support for Moving Board Tiles
- Tiles already placed on board (in `selectedTiles`) can now be moved via touch
- Touch a placed tile to start dragging it
- Drop on another empty square to move it
- Drop outside the board to return it to your hand
- Fading effect on the original position while dragging

**Implementation:**
- Added `handleTouchStartFromBoard` to `useTouchDrag` hook
- Added `onTileTouchStart` prop to `Square` for touch events on tiles
- Added `onBoardTileTouchStart` prop to `Board`
- Added `draggingFromSquare` prop to show fading on source tile
- `handleTouchDrop` now handles moves from board-to-board and board-to-rack

---

## In Progress / Not Started

### 1. Board Zoom After Tile Placement
**Priority:** Medium
**Status:** Not started

Like Scrabble mobile, after placing the first tile, zoom into an ~8×10 area around the placed tiles. This makes subsequent placements easier.

**Approach:**
- Track "zoom region" based on placed tiles
- Apply CSS transform to board container
- Add pan/scroll to navigate zoomed board
- Reset zoom when tiles are recalled

### 2. PWA Support
**Priority:** Medium
**Status:** Not started

Allow users to install the app on their home screen.

**Required:**
- Create `manifest.json`
- Add PWA meta tags to `index.html`
- Install `vite-plugin-pwa`
- Create app icons (various sizes)
- Configure service worker

### 3. Offline Support
**Priority:** Low
**Status:** Not started

Cache static assets for faster loading. Full offline play not possible (requires server).

---

## Known Issues

1. **Small touch targets:** Despite pop-up effect, 17×17 board on small screen is still challenging. Board zoom would help significantly.

2. **No haptic feedback:** Could add vibration on tile pickup/placement for better tactile response.

3. **Joker letter selection:** Dialog works but may need mobile optimization.

---

## Testing Checklist

Before pushing:

- [ ] Test on iPhone SE (375px) - smallest common phone
- [ ] Test on iPhone 14 (390px)
- [ ] Test on Android phone
- [ ] Test full game flow on mobile
- [ ] Test tile placement accuracy
- [ ] Test tile rack scrolling (10 tiles)
- [ ] Test action bar buttons
- [ ] Test game completion screen
- [ ] Verify desktop is not broken
- [ ] Run production build successfully

---

## File Summary

### New Files
```
src/utils/device-detection.ts
src/components/OnlineGame/MobileOnlineGame.tsx
src/components/OnlineGame/MobileScoreHeader.tsx
src/components/OnlineGame/MobileActionBar.tsx
src/components/OnlineGame/DesktopOnlineGame.tsx
src/hooks/useTouchDrag.ts
src/components/DragOverlay/DragOverlay.tsx
```

### Modified Files
```
src/components/OnlineGame/OnlineGame.tsx
src/components/Board/Board.tsx
src/components/Board/Square.tsx
src/components/TileRack/TileRack.tsx
src/components/TileRack/Tile.tsx
src/i18n/locales/en/online.json
src/i18n/locales/sr/online.json
src/i18n/locales/en/game.json
src/i18n/locales/sr/game.json
src/index.css
packages/client/vite.config.ts
packages/client/index.html
```

---

## Architecture Decisions

### Why separate Mobile/Desktop components?
- Cleaner code than conditional rendering everywhere
- Different UX patterns (touch vs mouse)
- Easier to maintain and test
- Mobile version intentionally simplified (no scoresheet, chat, spectator panel)

### Why touch drag instead of click-to-place?
- User explicitly requested drag-and-drop ("click and point is so bad")
- Matches Scrabble mobile UX
- More intuitive for game interaction

### Why pop-up target square?
- Small squares (20px) are hard to target accurately
- Visual feedback confirms where tile will land
- Reduces placement errors and frustration

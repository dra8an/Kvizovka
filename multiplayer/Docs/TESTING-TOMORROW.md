# Testing Plan - January 6, 2026

**Status:** Ready for testing with bug fix applied

---

## 🐛 Bug Found and Fixed Today

### Issue: Tiles Disappearing After Move Submission
**Problem:** When Player 1 clicked "Play Word", the tiles disappeared from the board immediately, and Player 2 remained stuck on "waiting for opponent".

**Root Cause:** Client was clearing `selectedTiles` state immediately after sending the move to the server, before receiving confirmation.

**Fix Applied:**
- Removed immediate `setSelectedTiles([])` in `handlePlayWord`
- Added `useEffect` that clears `selectedTiles` when game state updates from server
- Added enhanced logging to server to debug move processing

**Files Modified:**
1. `packages/client/src/components/OnlineGame/OnlineGame.tsx`
   - Don't clear selectedTiles immediately
   - Clear them when server sends updated state
2. `packages/server/src/index.ts`
   - Added logging to track move processing

**Status:** ✅ Fixed and ready for testing

---

## 🚀 How to Start Testing Tomorrow

### Step 1: Start Servers
```bash
# Terminal 1 - Start Server
cd /Users/draganbesevic/Projects/claude/Kvizovka/multiplayer
npm run dev:server

# Terminal 2 - Start Client
cd /Users/draganbesevic/Projects/claude/Kvizovka/multiplayer
npm run dev:client
```

**Expected Output:**
- Server: `🚀 Kvizovka server running on http://localhost:3000`
- Client: `➜ Local: http://localhost:5173/`

### Step 2: Open Two Browser Tabs

**Tab 1 (Player 1):**
1. Go to `http://localhost:5173`
2. Click "Play Online"
3. Click "Create Room"
4. Enter name: "Player1"
5. **Write down the 6-character room code**

**Tab 2 (Player 2):**
1. Go to `http://localhost:5173`
2. Click "Play Online"
3. Click "Join Room"
4. Enter the room code from Tab 1
5. Enter name: "Player2"

**Both Tabs:**
- Click "Ready to Play"
- Game should start!

---

## 🧪 Test Scenarios

### Test 1: Basic Move ✅ PRIORITY
**Goal:** Verify tiles stay on board and turn switches

**Steps:**
1. Player 1's turn - drag 2-3 tiles to board
2. Form a simple word starting from center (★)
3. Click "Play Word"
4. **Expected:**
   - Tiles stay on board (don't disappear)
   - Server logs show: `[game:make-move] Received move...`
   - If valid: Tiles appear permanently, turn switches to Player 2
   - If invalid: Error message appears, tiles return to rack

**Server Logs to Watch:**
```
[game:make-move] Received move for game {id}, {N} tiles
[game:make-move] Processing move for player {id}
[game:make-move] Move successful! Score: {X}  (OR)
[game:make-move] Move rejected: {error}
```

**Simple Serbian Words to Try:**
- "REČ" (word) - 3 letters
- "DA" (yes) - 2 letters
- "NE" (no) - 2 letters

### Test 2: Turn Switching
**Goal:** Verify turn indicator updates correctly

**Steps:**
1. Player 1 makes a move
2. Check Player 1's tab shows: "John's Turn" (opponent)
3. Check Player 2's tab shows: "Your Turn"
4. Player 2 should be able to drag tiles
5. Player 1 should NOT be able to drag tiles (disabled)

### Test 3: Joker Placement
**Goal:** Test joker letter selection

**Steps:**
1. If you get a joker tile (blank), drag it to board
2. Dialog should appear asking for letter
3. Select a letter
4. Tile should show the selected letter
5. Complete the word and submit

### Test 4: Invalid Move Handling
**Goal:** Verify server rejects invalid moves

**Steps:**
1. Place tiles that don't form a word
2. Click "Play Word"
3. **Expected:**
   - Error message appears in red
   - Tiles stay on board (can try again)
   - Turn doesn't switch

### Test 5: Game Completion
**Goal:** Play through to end

**Steps:**
1. Play multiple rounds
2. Watch scores update
3. When game ends, completion screen should show
4. Winner should be declared
5. "Back to Menu" button should work

---

## 🐛 Known Issues to Watch For

### 1. **Tiles Disappearing** (Should be fixed now)
- If tiles still disappear, check browser console for errors
- Check server logs to see if move was received

### 2. **Move Not Being Sent**
**Symptoms:**
- Server logs show no `[game:make-move]` message
- Player 2 sees "waiting for opponent" forever

**Debug:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for WebSocket messages

### 3. **Move Rejected by Server**
**Symptoms:**
- Error message appears
- Common reasons:
  - Word not in dictionary
  - Not connected to center on first move
  - Tiles not forming a straight line
  - Not adjacent to existing tiles

**Solution:**
- Try placing tiles horizontally/vertically from center
- Use simple 2-3 letter Serbian words

### 4. **State Sync Issues**
**Symptoms:**
- Player 1 and Player 2 see different board states
- Scores don't match

**Debug:**
- Check server logs for state broadcast messages
- Refresh both browsers and try again

---

## 📋 Checklist for Tomorrow

Before starting:
- [ ] Both terminals ready
- [ ] Browser with multiple tabs/windows ready
- [ ] This document open for reference

During testing:
- [ ] Test 1: Basic move (PRIORITY)
- [ ] Test 2: Turn switching
- [ ] Test 3: Joker placement (if available)
- [ ] Test 4: Invalid move handling
- [ ] Test 5: Game completion

After testing:
- [ ] Document any bugs found
- [ ] Note which tests passed/failed
- [ ] Save server logs if errors occur

---

## 🔍 Debugging Tips

### If Something Goes Wrong:

**1. Check Browser Console (F12)**
```
Look for:
- Red error messages
- [OnlineStore] log messages
- WebSocket connection errors
```

**2. Check Server Terminal**
```
Look for:
- [game:make-move] messages
- Error stack traces
- WebSocket disconnections
```

**3. Quick Reset**
```bash
# Kill all processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Restart servers
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2

# Refresh browsers (F5)
```

**4. Nuclear Option (Full Rebuild)**
```bash
# Clean build
npm run build --workspace=@kvizovka/client
npm run build --workspace=@kvizovka/server

# Restart dev servers
npm run dev:server
npm run dev:client
```

---

## 📝 What to Report

When testing is complete, document:

### ✅ What Works
- [ ] Connection and room creation
- [ ] Tile placement (drag and drop)
- [ ] Move submission
- [ ] Turn switching
- [ ] Score updates
- [ ] Game completion

### ❌ What Doesn't Work
For each bug, note:
- What you did (steps to reproduce)
- What you expected
- What actually happened
- Any error messages (screenshot/copy)
- Server logs (copy relevant lines)

---

## 🎯 Success Criteria

Testing is complete when:
1. ✅ Two players can play a full game
2. ✅ Tiles don't disappear after moves
3. ✅ Turns switch correctly
4. ✅ Scores update correctly
5. ✅ Game ends with winner declared

If all tests pass → Ready for deployment!
If issues found → Document for fixing

---

## 📦 Current Build Status

**Last Build:** January 5, 2026 - 4:21 PM

**Client:**
- Build: ✅ SUCCESS
- Size: 264.35 kB (gzipped: 79.92 kB)
- Location: `packages/client/dist/`

**Server:**
- Build: ✅ SUCCESS
- Dictionary: 20,000 Serbian words loaded
- Location: `packages/server/src/`

**Servers Status:** 🛑 STOPPED (ready to start tomorrow)

---

## 🚦 Next Steps After Testing

### If Testing Passes:
1. Create final status document
2. Move to Phase 1, Step 5: Deployment
3. Deploy server to Railway
4. Deploy client to Vercel
5. Test production deployment

### If Issues Found:
1. Document all bugs
2. Prioritize fixes (critical vs. nice-to-have)
3. Fix critical bugs
4. Re-test
5. Repeat until stable

---

**Good luck with testing tomorrow! 🎮**

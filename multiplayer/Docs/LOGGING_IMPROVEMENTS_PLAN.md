# Logging Improvements Plan

**Status:** PLANNED - Not Yet Implemented
**Priority:** High - Impacts Render Free Tier Costs
**Created:** 2026-01-14

---

## Problem Statement

The application currently has **255 console log statements** across 24 files, generating excessive log output that could:

1. **Impact Render Free Tier Limits**
   - Log storage quotas can be exceeded quickly
   - Thousands of log entries per day with moderate traffic
   - Potential performance overhead from I/O operations

2. **Make Debugging Difficult**
   - Too much noise in production logs
   - Hard to find actual errors among debug messages
   - No way to filter by severity

3. **No Environment Control**
   - Same verbose logging in production and development
   - Cannot toggle logging levels based on environment
   - Debug logs run in production unnecessarily

---

## Current Logging Analysis

### Most Verbose Files

| File | Log Count | Type | Impact |
|------|-----------|------|--------|
| `packages/client/src/store/onlineGameStore.ts` | 59 | Client | Every socket event, state change |
| `packages/server/src/index.ts` | 32 | Server | Every connection, move, error |
| `packages/server/src/game-manager.ts` | 14 | Server | Game state changes |
| `packages/server/src/room-manager.ts` | 15 | Server | Room operations |
| `packages/shared/src/game-engine/MoveValidator.ts` | 13 | Engine | Move validation |
| `packages/shared/src/game-engine/ScoreCalculator.ts` | 14 | Engine | Score calculations |

### Per-Event Logging Estimate

**Single game move generates approximately:**
- Client validation: 3-5 logs
- Socket transmission: 2-3 logs
- Server processing: 5-7 logs
- Game engine: 3-5 logs
- Broadcast to clients: 2-3 logs
- **Total: ~15-23 log lines per move**

**Active game (10 moves):**
- 150-230 log lines

**Daily estimate (10 games):**
- 1,500-2,300 log lines just from moves
- Plus connection/disconnection logs
- Plus error/warning logs
- **Potential total: 3,000-5,000+ log lines per day**

---

## Proposed Solution

### 1. Create Logging Utility with Log Levels

Implement a centralized logger with standard log levels:

```typescript
// packages/shared/src/utils/logger.ts

export enum LogLevel {
  ERROR = 0,   // Always log - critical failures
  WARN = 1,    // Important warnings
  INFO = 2,    // Important state changes
  DEBUG = 3,   // Detailed debugging
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO
  private static context: string = ''

  static setLevel(level: LogLevel) {
    this.level = level
  }

  static setContext(context: string) {
    this.context = context
  }

  static error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR]${this.context} ${message}`, ...args)
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN]${this.context} ${message}`, ...args)
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO]${this.context} ${message}`, ...args)
    }
  }

  static debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG]${this.context} ${message}`, ...args)
    }
  }
}

// Initialize based on environment
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  Logger.setLevel(LogLevel.WARN)  // Production: Only errors and warnings
} else {
  Logger.setLevel(LogLevel.DEBUG)  // Development: Everything
}
```

### 2. Environment-Based Configuration

**Production (Render):**
- `NODE_ENV=production`
- Log level: `WARN` (only errors and warnings)
- Estimated reduction: **~85-90% fewer logs**

**Development (localhost):**
- `NODE_ENV=development`
- Log level: `DEBUG` (all logs)
- Keep current verbose logging for debugging

**Staging (optional):**
- `NODE_ENV=staging`
- Log level: `INFO` (errors, warnings, important events)

### 3. Categorize Existing Logs

Reclassify the 255 console statements:

| Category | Current Count | Should Be | Reduction |
|----------|--------------|-----------|-----------|
| Debug (verbose) | ~180 | DEBUG | 0 in prod |
| Info (state changes) | ~40 | INFO | Few in prod |
| Warnings | ~15 | WARN | Keep |
| Errors | ~20 | ERROR | Keep |
| **Production total** | **255** | **~35** | **86% reduction** |

---

## Implementation Plan

### Phase 1: Create Logger Utility (30 min)

**Files to create:**
- `packages/shared/src/utils/logger.ts` - Core logger class
- `packages/shared/src/utils/index.ts` - Export logger

**Features:**
- Log levels (ERROR, WARN, INFO, DEBUG)
- Environment-based initialization
- Context support for tagging logs by module
- Timestamp support (optional)

### Phase 2: Replace Server Logs (1 hour)

**Priority files (highest impact on Render):**

1. **`packages/server/src/index.ts`** (32 logs)
   - Keep: Connection/disconnection events (INFO)
   - Keep: All errors (ERROR)
   - Downgrade: Move processing details (DEBUG)
   - Remove: Verbose socket event logs

2. **`packages/server/src/game-manager.ts`** (14 logs)
   - Keep: Game start/end (INFO)
   - Keep: Errors (ERROR)
   - Downgrade: Move validation (DEBUG)
   - Remove: State change details

3. **`packages/server/src/room-manager.ts`** (15 logs)
   - Keep: Room create/join/leave (INFO)
   - Keep: Errors (ERROR)
   - Downgrade: Room state updates (DEBUG)

**Example transformation:**

Before:
```typescript
console.log(`[game:make-move] Received move for game ${gameId}`)
console.log(`[game:make-move] Processing move for player ${playerId}`)
console.log(`[game:make-move] Move successful!`)
```

After:
```typescript
Logger.setContext('[game:make-move]')
Logger.debug(`Received move for game ${gameId}`)
Logger.debug(`Processing move for player ${playerId}`)
Logger.info(`Move successful for player ${playerId}`)
```

### Phase 3: Replace Client Logs (45 min)

**Priority files:**

1. **`packages/client/src/store/onlineGameStore.ts`** (59 logs)
   - Keep: Connection errors (ERROR)
   - Keep: Room join failures (WARN)
   - Downgrade: Socket events (DEBUG)
   - Remove: State updates

2. **`packages/client/src/services/socket.ts`** (16 logs)
   - Keep: Connection failures (ERROR)
   - Downgrade: Event handlers (DEBUG)

**Note:** Client logs don't impact Render costs, but reducing them improves browser console readability.

### Phase 4: Replace Game Engine Logs (30 min)

**Files:**
- `packages/shared/src/game-engine/MoveValidator.ts` (13 logs)
- `packages/shared/src/game-engine/ScoreCalculator.ts` (14 logs)
- `packages/shared/src/game-engine/TileBag.ts` (12 logs)

**Strategy:**
- Keep: Critical validation failures (WARN)
- Downgrade: Validation details (DEBUG)
- Remove: Calculation steps

### Phase 5: Configure Environment Variables (15 min)

**Update `.env` files:**

```bash
# .env.production (Render)
NODE_ENV=production
LOG_LEVEL=warn

# .env.development (localhost)
NODE_ENV=development
LOG_LEVEL=debug
```

**Update deployment:**
- Set `NODE_ENV=production` in Render environment variables
- Optionally add `LOG_LEVEL=warn` for explicit control

### Phase 6: Testing (30 min)

**Test scenarios:**
1. Development mode - verify all logs appear
2. Production mode - verify only errors/warnings appear
3. Play a full game in production mode - count log lines
4. Compare before/after log volumes

**Expected results:**
- Development: No change (~255 logs)
- Production: ~35 logs (86% reduction)

---

## Log Categorization Guidelines

### ERROR - Always Log (Production)
- Server crashes
- Database/socket connection failures
- Unhandled exceptions
- Failed game state validation
- Critical security issues

**Examples:**
```typescript
Logger.error('Failed to connect to database', error)
Logger.error('Game state corrupted for game', gameId)
Logger.error('Socket connection lost', socket.id)
```

### WARN - Production Only When Important
- Failed user actions (invalid moves, room full)
- Resource limits approaching (memory, connections)
- Deprecated API usage
- Configuration issues

**Examples:**
```typescript
Logger.warn('Room full, rejecting join request', roomCode)
Logger.warn('Player attempted invalid move', playerId)
Logger.warn('Connection limit approaching', activeConnections)
```

### INFO - Important State Changes
- Server start/stop
- Game start/end
- Player connections/disconnections
- Room creation/destruction

**Examples:**
```typescript
Logger.info('Server started on port', port)
Logger.info('Game started', gameId)
Logger.info('Player connected', socket.id)
```

### DEBUG - Development Only
- Move validation details
- Score calculations
- State updates
- Socket event processing
- Algorithm internals

**Examples:**
```typescript
Logger.debug('Validating move', placedTiles)
Logger.debug('Calculating score for word', wordText)
Logger.debug('Broadcasting state update to', socketIds)
```

---

## Advanced Features (Optional)

### 1. Log Aggregation Service
If app grows, consider:
- **Sentry** - Error tracking (free tier: 5k events/month)
- **LogRocket** - Session replay + logging
- **Papertrail** - Log management (free tier: 50MB/month)

### 2. Performance Metrics
Track key metrics without excessive logging:
```typescript
Logger.metric('game.move.duration', duration)
Logger.metric('server.active_games', gameCount)
```

### 3. Structured Logging
Use JSON format for better parsing:
```typescript
Logger.info('Move completed', {
  gameId,
  playerId,
  duration,
  score
})
```

### 4. Log Sampling
In high-traffic scenarios, sample debug logs:
```typescript
if (Math.random() < 0.1) {  // 10% sampling
  Logger.debug('State update', state)
}
```

---

## Expected Impact

### Before Implementation
- **Production logs:** ~3,000-5,000 lines/day
- **Render impact:** High risk of hitting log limits
- **Debugging:** Difficult to find real issues
- **Performance:** Minor I/O overhead

### After Implementation
- **Production logs:** ~400-750 lines/day (85% reduction)
- **Render impact:** Minimal, well within free tier
- **Debugging:** Clear error visibility, detailed dev logs
- **Performance:** Reduced I/O overhead

### Cost Savings
- **Log storage:** 85% reduction
- **CPU/memory:** ~5-10% reduction from less I/O
- **Developer time:** Faster debugging with categorized logs

---

## Migration Strategy

### Gradual Rollout
1. **Week 1:** Implement logger utility, update server files
2. **Week 2:** Update client files
3. **Week 3:** Update game engine files
4. **Week 4:** Monitor production, fine-tune levels

### Backward Compatibility
- Keep existing console.log during transition
- Add new Logger calls alongside
- Remove console.log after verification
- Avoid breaking changes

### Rollback Plan
If issues arise:
1. Set `LOG_LEVEL=debug` in environment
2. Restore console.log statements if needed
3. Logger class is additive, not destructive

---

## Success Metrics

Track these after implementation:

1. **Log Volume**
   - Measure: Daily log line count
   - Target: <1,000 lines/day in production

2. **Render Usage**
   - Measure: Log storage usage
   - Target: Stay within free tier limits

3. **Error Detection**
   - Measure: Time to identify production errors
   - Target: All errors visible in logs

4. **Developer Experience**
   - Measure: Dev feedback on log usefulness
   - Target: Easier debugging in development

---

## Files to Modify

### New Files
- `packages/shared/src/utils/logger.ts` (create)
- `packages/shared/src/utils/index.ts` (update exports)

### Update Priority (Render Impact)
**High Priority (Server):**
1. `packages/server/src/index.ts` (32 logs)
2. `packages/server/src/game-manager.ts` (14 logs)
3. `packages/server/src/room-manager.ts` (15 logs)
4. `packages/server/src/dictionary-loader.ts` (6 logs)

**Medium Priority (Client):**
5. `packages/client/src/store/onlineGameStore.ts` (59 logs)
6. `packages/client/src/services/socket.ts` (16 logs)
7. `packages/client/src/store/gameStore.ts` (19 logs)

**Low Priority (Shared):**
8. `packages/shared/src/game-engine/MoveValidator.ts` (13 logs)
9. `packages/shared/src/game-engine/ScoreCalculator.ts` (14 logs)
10. `packages/shared/src/game-engine/TileBag.ts` (12 logs)

---

## Environment Configuration

### Render (Production)
Set in Render Dashboard → Environment:
```
NODE_ENV=production
LOG_LEVEL=warn
```

### Local Development
In `.env` file:
```
NODE_ENV=development
LOG_LEVEL=debug
```

### Docker (if used)
```dockerfile
ENV NODE_ENV=production
ENV LOG_LEVEL=warn
```

---

## Next Steps

1. **Get user approval** on this plan
2. **Implement logger utility** (Phase 1)
3. **Start with server files** (highest Render impact)
4. **Test in production** with a small rollout
5. **Monitor log volumes** on Render
6. **Gradually migrate** remaining files
7. **Document** logging best practices for future development

---

## Related Documentation

- [Render Free Tier Limits](https://render.com/docs/free)
- [Node.js Logging Best Practices](https://nodejs.org/en/docs/guides/diagnostics/)
- [Logging Levels Standard](https://www.rfc-editor.org/rfc/rfc5424)

---

## Questions to Resolve

1. Should we add log rotation (delete old logs)?
2. Do we need log aggregation service integration?
3. Should we track performance metrics separately?
4. Do we want structured (JSON) logging for parsing?
5. Should we implement log sampling for high-traffic events?

---

**Created by:** Claude
**Last Updated:** 2026-01-14
**Estimated Implementation Time:** 3-4 hours total

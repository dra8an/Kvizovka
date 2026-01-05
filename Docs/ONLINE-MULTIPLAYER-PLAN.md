# Kvizovka Online Multiplayer - Implementation Plan

> **Status:** Planning Phase
> **Version:** 1.0
> **Date:** 2026-01-04
> **Estimated Timeline:** 6-10 weeks total (2-3 weeks for Phase 1 MVP)

---

## Executive Summary

This document outlines the complete plan for transforming Kvizovka from a local-only multiplayer game into an online multiplayer game that can be played over the internet. The plan leverages the existing game engine (~80% reusable) and introduces a server-authoritative architecture to prevent cheating while maintaining the same gameplay experience.

**Current State:**
- ✅ Fully functional local 2-player multiplayer
- ✅ Complete game engine (Board, TileBag, MoveValidator, ScoreCalculator)
- ✅ 20,000 word Serbian dictionary
- ✅ All game rules implemented (challenges, tile exchange, jokers, automatic game end)

**Goal State:**
- 🎯 Two players can play online from different locations
- 🎯 Server validates all moves (prevents cheating)
- 🎯 Real-time gameplay via WebSockets
- 🎯 Opponent's tiles remain hidden
- 🎯 Room-based matchmaking with 6-character codes

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Phase 1: Minimal Viable Online (2-3 weeks)](#phase-1-minimal-viable-online)
4. [Phase 2: Persistent Games (2-3 weeks)](#phase-2-persistent-games)
5. [Phase 3: Production Ready (2-4 weeks)](#phase-3-production-ready)
6. [Security & Anti-Cheat](#security--anti-cheat)
7. [Code Reusability Analysis](#code-reusability-analysis)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Risk Assessment](#risk-assessment)

---

## Architecture Overview

### Current: Local-Only Architecture

```
┌──────────────────────────────────────┐
│         Single Device                │
├──────────────────────────────────────┤
│                                      │
│   Player 1      ←→      Player 2    │
│                                      │
│   ┌─────────────────────────────┐   │
│   │    Zustand Store            │   │
│   │    (Game State)             │   │
│   └─────────────────────────────┘   │
│                 ↓                    │
│   ┌─────────────────────────────┐   │
│   │    Game Engine Classes      │   │
│   │    (Board, TileBag, etc.)   │   │
│   └─────────────────────────────┘   │
│                 ↓                    │
│   ┌─────────────────────────────┐   │
│   │    localStorage             │   │
│   └─────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Limitations:**
- ❌ Everything runs client-side = easy to cheat
- ❌ Both players can inspect state
- ❌ Can see opponent's tiles in localStorage
- ❌ Can see tile bag contents
- ❌ Can manipulate scores

---

### Proposed: Client-Server Architecture

```
┌────────────────┐                  ┌─────────────────────┐                  ┌────────────────┐
│   Client A     │                  │   Server            │                  │   Client B     │
│  (Player 1)    │                  │  (Authoritative)    │                  │  (Player 2)    │
├────────────────┤                  ├─────────────────────┤                  ├────────────────┤
│                │                  │                     │                  │                │
│  React UI      │                  │  Game Manager       │                  │  React UI      │
│  ↓             │                  │  ↓                  │                  │  ↓             │
│  Socket.io ────┼─── Move ────────→│  Validate Move      │                  │  Socket.io     │
│  Client        │                  │  ↓                  │                  │  Client        │
│                │                  │  Update State       │                  │                │
│                │                  │  ↓                  │                  │                │
│  State ←───────┼──── Broadcast ───┤  Calculate Score    │────── Broadcast ─┼─────→ State    │
│  Update        │                  │  ↓                  │                  │  Update        │
│                │                  │  Sanitize State     │                  │                │
│                │                  │  (hide tiles)       │                  │                │
│                │                  │  ↓                  │                  │                │
│                │                  │  Broadcast to Both  │                  │                │
│                │                  │                     │                  │                │
└────────────────┘                  └─────────────────────┘                  └────────────────┘
      ↑                                      ↑                                      ↑
      │                                      │                                      │
  Own tiles only                     All game state                          Own tiles only
  Opponent tile count                Complete tile bag                    Opponent tile count
```

**Benefits:**
- ✅ Server validates all moves (prevents cheating)
- ✅ Players can't see opponent's tiles
- ✅ Tile bag hidden from clients
- ✅ Turn order enforcement
- ✅ Server-side score calculation
- ✅ Time synchronization

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Hono** | ^4.x | Lightweight TypeScript-first web framework |
| **Socket.io** | ^4.x | WebSocket library with auto-reconnection |
| **Node.js** | 18+ | JavaScript runtime |
| **PostgreSQL** | 15+ | Database (Phase 2) |

**Why Hono over Express/Fastify:**
- Faster than Express
- TypeScript-first (share types with frontend)
- Edge-ready (deploy anywhere: Cloudflare, Vercel, Railway)
- Minimal learning curve
- Modern API design

**Why Socket.io over raw WebSockets:**
- Auto-reconnection built-in (critical for mobile networks)
- Room management out-of-the-box
- Fallback to HTTP long-polling if WebSocket unavailable
- Battle-tested with millions of users
- Type-safe event definitions

---

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Socket.io Client** | ^4.x | WebSocket client (matches server) |
| **React** | 18+ | UI framework (existing) |
| **Zustand** | 5+ | State management (existing) |
| **TypeScript** | 5+ | Type safety (existing) |

**Changes Required:**
- Add Socket.io client
- Create WebSocket service wrapper
- Update game store for dual-mode (local + online)
- New UI components for room creation/joining

---

### Shared Code (Monorepo)

| Component | Shared Between | Purpose |
|-----------|---------------|---------|
| **Types** | Client + Server | GameState, Player, Move interfaces |
| **Game Engine** | Client + Server | Board, TileBag, MoveValidator, ScoreCalculator |
| **Constants** | Client + Server | Board config, tile distribution, scoring |
| **Socket Events** | Client + Server | Type-safe WebSocket event definitions |

**Monorepo Structure:**
```
packages/
├── shared/       # TypeScript code used by both client and server
├── client/       # React frontend
└── server/       # Node.js backend
```

---

### Deployment

| Service | Platform | Purpose |
|---------|----------|---------|
| **Backend** | Railway | Free tier, PostgreSQL included, WebSocket support |
| **Frontend** | Vercel | Static hosting, CDN, auto-deploy from GitHub |
| **Database** | Railway PostgreSQL | Managed PostgreSQL (Phase 2) |

**Cost Estimate (Monthly):**
- Phase 1: $0 (free tiers)
- Phase 2 (with DB): ~$5-10 (Railway hobby plan)
- Production: ~$20-50 (scaling dependent)

---

## Phase 1: Minimal Viable Online

**Goal:** Two players can play online over the internet

**Timeline:** 2-3 weeks

**Scope:**
- ✅ Room-based matchmaking (join by 6-character code)
- ✅ Real-time gameplay via WebSocket
- ✅ Server-authoritative move validation
- ✅ Basic disconnect handling (in-memory, 5-min timeout)
- ❌ No user accounts (anonymous play)
- ❌ No database (all in-memory)

---

### Step 1: Monorepo Setup (2 days)

**Objective:** Reorganize codebase to share code between client and server

**Tasks:**
1. Create `packages/` directory structure
2. Move current `src/` to `packages/client/src/`
3. Create `packages/server/` with Hono boilerplate
4. Create `packages/shared/` with game engine
5. Setup npm workspaces in root `package.json`
6. Configure TypeScript paths for cross-package imports
7. Verify existing local multiplayer still works

**File Structure After Step 1:**
```
kvizovka/
├── package.json                 # Root workspace config
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/           # All TypeScript interfaces
│   │       │   ├── board.types.ts
│   │       │   ├── tile.types.ts
│   │       │   ├── game.types.ts
│   │       │   ├── socket-events.ts (NEW)
│   │       │   └── index.ts
│   │       ├── game-engine/     # Pure game logic
│   │       │   ├── Board.ts
│   │       │   ├── TileBag.ts
│   │       │   ├── MoveValidator.ts
│   │       │   ├── ScoreCalculator.ts
│   │       │   ├── WordValidator.ts
│   │       │   └── index.ts
│   │       ├── constants/       # Game configuration
│   │       │   ├── board-config.ts
│   │       │   ├── tile-distribution.ts
│   │       │   ├── scoring-rules.ts
│   │       │   └── index.ts
│   │       └── utils/           # Shared utilities
│   │           ├── dictionary.ts
│   │           └── index.ts
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts         # Hono app entry point
│   │       ├── websocket.ts     # Socket.io server + handlers
│   │       ├── game-manager.ts  # In-memory game state manager
│   │       ├── room-manager.ts  # Room creation/joining
│   │       └── dictionary-loader.ts # Load dictionary from filesystem
│   └── client/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/                 # Current React app
│           ├── components/
│           │   ├── OnlineMenu/  # NEW: Create/join room UI
│           │   └── ...existing components
│           ├── services/
│           │   └── socket.ts    # NEW: Socket.io client wrapper
│           └── store/
│               └── gameStore.ts # UPDATED: Dual mode support
```

**Dependencies:**

Root `package.json`:
```json
{
  "name": "kvizovka-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev:client": "npm -w @kvizovka/client run dev",
    "dev:server": "npm -w @kvizovka/server run dev",
    "dev": "npm run dev:client & npm run dev:server",
    "build": "npm run build:shared && npm run build:client && npm run build:server",
    "build:shared": "npm -w @kvizovka/shared run build",
    "build:client": "npm -w @kvizovka/client run build",
    "build:server": "npm -w @kvizovka/server run build"
  }
}
```

Server `packages/server/package.json`:
```json
{
  "name": "@kvizovka/server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4.6.11",
    "socket.io": "^4.8.1",
    "@kvizovka/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
```

Client `packages/client/package.json` (add):
```json
{
  "dependencies": {
    "socket.io-client": "^4.8.1",
    "@kvizovka/shared": "workspace:*"
  }
}
```

---

### Step 2: Server Core Infrastructure (3-4 days)

**Objective:** Build the backend server with game state management

#### 2.1: Hono Server Setup

**File:** `packages/server/src/index.ts`

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Server as SocketIOServer } from 'socket.io';
import { initializeWebSocket } from './websocket';
import { loadDictionary } from './dictionary-loader';

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// API endpoints (future use)
app.get('/api/stats', (c) => c.json({
  activeGames: 0,
  totalPlayers: 0,
}));

// Start HTTP server
const server = serve({
  fetch: app.fetch,
  port: 3001,
});

// Initialize Socket.io on the same server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Load dictionary on startup
async function startServer() {
  console.log('🔍 Loading Serbian dictionary...');
  await loadDictionary();
  console.log('✅ Dictionary loaded (20,000 words)');

  // Initialize WebSocket handlers
  initializeWebSocket(io);

  console.log(`🚀 Server running on http://localhost:3001`);
}

startServer().catch(console.error);
```

---

#### 2.2: Game Manager (In-Memory State)

**File:** `packages/server/src/game-manager.ts`

```typescript
import {
  GameState,
  GameMode,
  GameStatus,
  Player,
  PlacedTile,
  Move,
  MoveType,
} from '@kvizovka/shared/types';
import {
  Board,
  TileBag,
  createTileBag,
  MoveValidator,
  ScoreCalculator,
} from '@kvizovka/shared/game-engine';

/**
 * Server-side game state (extends client GameState)
 */
interface ServerGameState extends GameState {
  // Server-only fields (never sent to client)
  boardInstance: Board;
  tileBagInstance: TileBag;
  playerSockets: Map<string, string>; // socketId -> playerId
}

/**
 * In-memory game state manager
 *
 * Responsibilities:
 * - Create and store games
 * - Validate moves server-side
 * - Calculate scores server-side
 * - Sanitize state for clients (hide opponent tiles)
 */
export class GameManager {
  private games = new Map<string, ServerGameState>();

  /**
   * Create a new game with 2 players
   */
  createGame(
    gameId: string,
    player1: { socketId: string; name: string },
    player2: { socketId: string; name: string }
  ): ServerGameState {
    // Initialize game engine
    const board = new Board();
    board.initialize();

    const tileBag = createTileBag();

    // Create players
    const p1: Player = {
      id: player1.socketId,
      name: player1.name,
      isAI: false,
      tiles: tileBag.draw(10), // Draw 10 tiles
      score: 0,
      timeRemaining: 30 * 60 * 1000, // 30 minutes
      timePenalties: 0,
      roundsPlayed: 0,
    };

    const p2: Player = {
      id: player2.socketId,
      name: player2.name,
      isAI: false,
      tiles: tileBag.draw(10),
      score: 0,
      timeRemaining: 30 * 60 * 1000,
      timePenalties: 0,
      roundsPlayed: 0,
    };

    // Create game state
    const game: ServerGameState = {
      id: gameId,
      mode: GameMode.ONLINE_MULTIPLAYER,
      status: GameStatus.IN_PROGRESS,
      board: board.getGrid(),
      tileBag: tileBag.peekTiles(),
      players: [p1, p2],
      currentPlayerIndex: 0,
      moveHistory: [],
      round: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      timerRunning: true,
      // Server-only
      boardInstance: board,
      tileBagInstance: tileBag,
      playerSockets: new Map([
        [player1.socketId, p1.id],
        [player2.socketId, p2.id],
      ]),
    };

    this.games.set(gameId, game);
    console.log(`✅ Game created: ${gameId}`);
    return game;
  }

  /**
   * Get game by ID
   */
  getGame(gameId: string): ServerGameState | undefined {
    return this.games.get(gameId);
  }

  /**
   * Delete game (cleanup)
   */
  deleteGame(gameId: string): void {
    this.games.delete(gameId);
    console.log(`🗑️  Game deleted: ${gameId}`);
  }

  /**
   * Validate and execute a move
   * Returns success/failure + error message
   */
  makeMove(
    gameId: string,
    playerId: string,
    placedTiles: PlacedTile[]
  ): { success: boolean; error?: string } {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Verify it's this player's turn
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate move using game engine
    const validator = new MoveValidator(game.boardInstance);
    const validation = validator.validateMove(placedTiles);

    if (!validation.isValid) {
      return { success: false, error: validation.reason };
    }

    // Apply move
    for (const placed of placedTiles) {
      game.boardInstance.setTile(placed.row, placed.col, placed.tile);
    }

    // Place blockers
    if (validation.direction && validation.wordsFormed?.length > 0) {
      const mainWord = validation.wordsFormed[0];
      game.boardInstance.placeBlockers(mainWord, validation.direction);
    }

    // Calculate score
    const calculator = new ScoreCalculator();
    const scoreBreakdown = calculator.calculateMoveScore(
      validation.wordsFormed || [],
      placedTiles,
      placedTiles.length
    );

    // Mark premium squares as used
    game.boardInstance.markSquaresAsUsed(placedTiles);

    // Update player
    currentPlayer.score += scoreBreakdown.totalScore;
    currentPlayer.roundsPlayed++;

    // Remove used tiles
    const usedTileIds = new Set(placedTiles.map((pt) => pt.tile.id));
    currentPlayer.tiles = currentPlayer.tiles.filter(
      (tile) => !usedTileIds.has(tile.id)
    );

    // Draw new tiles
    const newTiles = game.tileBagInstance.draw(placedTiles.length);
    currentPlayer.tiles.push(...newTiles);

    // Record move
    const move: Move = {
      playerId: currentPlayer.id,
      moveNumber: game.moveHistory.length + 1,
      type: MoveType.PLACE_TILES,
      placedTiles,
      formedWords: validation.wordsFormed?.map((squares) =>
        squares.map((sq) => {
          const tile = sq.tile;
          if (tile && 'letter' in tile) {
            return tile.isJoker && tile.jokerLetter
              ? tile.jokerLetter
              : tile.letter;
          }
          return '';
        }).join('')
      ),
      score: scoreBreakdown.totalScore,
      drawnTileIds: newTiles.map((t) => t.id),
      timestamp: new Date(),
    };

    game.moveHistory.push(move);

    // Switch turn
    game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0;

    // Update state
    game.board = game.boardInstance.getGrid();
    game.tileBag = game.tileBagInstance.peekTiles();
    game.updatedAt = new Date();

    // Check game end conditions
    this.checkGameEndConditions(game);

    return { success: true };
  }

  /**
   * Check if game should end automatically
   */
  private checkGameEndConditions(game: ServerGameState): void {
    const [player1, player2] = game.players;

    // Both players completed 10 rounds
    if (player1.roundsPlayed >= 10 && player2.roundsPlayed >= 10) {
      game.endReason = 'rounds_completed';
      this.endGame(game);
    }

    // Tile bag empty and current player has no tiles
    if (game.tileBagInstance.isEmpty()) {
      const currentPlayer = game.players[game.currentPlayerIndex];
      if (currentPlayer.tiles.length === 0) {
        game.endReason = 'no_tiles';
        this.endGame(game);
      }
    }
  }

  /**
   * End game and calculate final scores
   */
  private endGame(game: ServerGameState): void {
    // Calculate final scores (subtract unused tiles)
    const calculator = new ScoreCalculator();

    for (const player of game.players) {
      const finalScore = calculator.calculateFinalScore(
        player.score,
        player.tiles
      );
      player.score = finalScore;
    }

    // Determine winner
    const [player1, player2] = game.players;
    if (player1.score > player2.score) {
      game.winner = player1.id;
    } else if (player2.score > player1.score) {
      game.winner = player2.id;
    }
    // else: tie

    game.status = GameStatus.COMPLETED;
    game.timerRunning = false;
    game.updatedAt = new Date();

    console.log(`🏁 Game ended: ${game.id} - Winner: ${game.winner || 'TIE'}`);
  }

  /**
   * Sanitize game state for a specific player
   * Hides opponent's tiles!
   */
  sanitizeGameState(game: ServerGameState, playerId: string): GameState {
    const sanitized: GameState = {
      id: game.id,
      mode: game.mode,
      status: game.status,
      board: game.board,
      tileBag: [], // Never send tile bag to client
      players: game.players.map((player) => {
        if (player.id !== playerId) {
          // Hide opponent's tiles
          return {
            ...player,
            tiles: [], // Don't send opponent's tiles!
          };
        }
        return player;
      }),
      currentPlayerIndex: game.currentPlayerIndex,
      moveHistory: game.moveHistory,
      round: game.round,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      timerRunning: game.timerRunning,
      winner: game.winner,
      endReason: game.endReason,
    };

    return sanitized;
  }
}
```

---

#### 2.3: Room Manager

**File:** `packages/server/src/room-manager.ts`

```typescript
interface Room {
  id: string;
  code: string; // 6-character code
  host: PlayerInRoom;
  guest: PlayerInRoom | null;
  gameId: string | null;
  createdAt: number;
}

interface PlayerInRoom {
  socketId: string;
  name: string;
  ready: boolean;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  /**
   * Create a new room
   */
  createRoom(hostSocketId: string, hostName: string): Room {
    const code = this.generateRoomCode();

    const room: Room = {
      id: code,
      code,
      host: {
        socketId: hostSocketId,
        name: hostName,
        ready: false,
      },
      guest: null,
      gameId: null,
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    console.log(`🚪 Room created: ${code} by ${hostName}`);
    return room;
  }

  /**
   * Join existing room
   */
  joinRoom(
    roomCode: string,
    guestSocketId: string,
    guestName: string
  ): Room | null {
    const room = this.rooms.get(roomCode);

    if (!room) {
      return null; // Room doesn't exist
    }

    if (room.guest) {
      return null; // Room already full
    }

    room.guest = {
      socketId: guestSocketId,
      name: guestName,
      ready: false,
    };

    console.log(`👋 ${guestName} joined room ${roomCode}`);
    return room;
  }

  /**
   * Get room by code
   */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  /**
   * Delete room (cleanup)
   */
  deleteRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
    console.log(`🗑️  Room deleted: ${roomCode}`);
  }

  /**
   * Mark player as ready
   */
  setPlayerReady(roomCode: string, socketId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    if (room.host.socketId === socketId) {
      room.host.ready = true;
    } else if (room.guest?.socketId === socketId) {
      room.guest.ready = true;
    }

    return room.host.ready && room.guest?.ready === true;
  }

  /**
   * Generate 6-character room code
   * Example: "A3X9K2"
   */
  private generateRoomCode(): string {
    // Exclude confusing characters: 0, O, I, 1, L
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    // Ensure uniqueness
    if (this.rooms.has(code)) {
      return this.generateRoomCode(); // Recursive retry
    }

    return code;
  }
}
```

---

### Step 3: WebSocket Event Handlers (3-4 days)

**Objective:** Implement real-time communication between clients and server

#### 3.1: Socket Event Types

**File:** `packages/shared/src/types/socket-events.ts`

```typescript
import { GameState, PlacedTile } from './game.types';

/**
 * Events sent FROM client TO server
 */
export interface ClientToServerEvents {
  // Room management
  'room:create': (
    data: { playerName: string },
    callback: (response: {
      success: boolean;
      roomCode?: string;
      error?: string;
    }) => void
  ) => void;

  'room:join': (
    data: { roomCode: string; playerName: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  'room:ready': (data: { roomCode: string }) => void;

  // Game actions
  'game:make-move': (
    data: { gameId: string; placedTiles: PlacedTile[] },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  'game:skip-turn': (
    data: { gameId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  'game:exchange-tiles': (
    data: { gameId: string; tileIds: string[] },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  'game:challenge': (
    data: { gameId: string },
    callback: (response: {
      success: boolean;
      result?: any;
      error?: string;
    }) => void
  ) => void;

  'game:pause': (data: { gameId: string }) => void;
  'game:resume': (data: { gameId: string }) => void;
}

/**
 * Events sent FROM server TO client
 */
export interface ServerToClientEvents {
  // Room events
  'room:player-joined': (data: { playerName: string }) => void;

  // Game events
  'game:started': (data: {
    gameId: string;
    gameState: GameState;
    yourPlayerId: string;
  }) => void;

  'game:state-update': (data: { gameState: GameState }) => void;

  'game:opponent-disconnected': () => void;
  'game:opponent-reconnected': () => void;

  'game:ended': (data: {
    gameState: GameState;
    winner: string | undefined;
    reason: string;
  }) => void;

  // Timer tick
  'game:timer-tick': (data: {
    currentPlayerTimeRemaining: number;
  }) => void;

  // Error events
  error: (data: { message: string }) => void;
}
```

---

#### 3.2: WebSocket Server Implementation

**File:** `packages/server/src/websocket.ts`

*See implementation plan document for complete code (400+ lines)*

**Key Handlers:**
- `room:create` - Create room and return 6-char code
- `room:join` - Join room by code
- `room:ready` - Mark player ready, start game when both ready
- `game:make-move` - Validate move server-side, broadcast update
- `game:skip-turn` - Skip turn, switch player
- `game:exchange-tiles` - Exchange tiles from bag
- `game:challenge` - Challenge opponent's last word
- `disconnect` - Handle player disconnect (pause game, timeout logic)

**State Sanitization (Critical):**
```typescript
function sanitizeGameStateForPlayer(
  game: ServerGameState,
  playerId: string
): GameState {
  return {
    ...game,
    players: game.players.map((player) => {
      if (player.id !== playerId) {
        return { ...player, tiles: [] }; // Hide opponent tiles!
      }
      return player;
    }),
    tileBag: [], // Never send tile bag
  };
}
```

---

### Step 4: Client Refactoring (4-5 days)

**Objective:** Update React client to support online mode

#### 4.1: Socket Service

**File:** `packages/client/src/services/socket.ts`

```typescript
import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@kvizovka/shared/types/socket-events';

class SocketService {
  private socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null = null;

  connect(serverUrl: string = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001') {
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket!.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('error', ({ message }) => {
      console.error('🔴 Server error:', message);
      alert(`Error: ${message}`);
    });

    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first.');
    }
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
```

---

#### 4.2: Online Game Store

**File:** `packages/client/src/store/onlineGameStore.ts`

*Dual-mode store that supports both local and online multiplayer*

```typescript
import { create } from 'zustand';
import { socketService } from '../services/socket';
import type { GameState, PlacedTile } from '@kvizovka/shared/types';

interface OnlineGameStore {
  // State
  mode: 'local' | 'online';
  gameState: GameState | null;
  myPlayerId: string | null;
  isMyTurn: boolean;
  roomCode: string | null;
  connected: boolean;

  // Actions
  setMode: (mode: 'local' | 'online') => void;
  createRoom: (playerName: string) => Promise<string>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  markReady: () => void;

  makeMove: (placedTiles: PlacedTile[]) => Promise<boolean>;

  // Internal handlers
  handleGameStarted: (
    gameId: string,
    gameState: GameState,
    myPlayerId: string
  ) => void;
  handleStateUpdate: (gameState: GameState) => void;
}

export const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
  mode: 'local',
  gameState: null,
  myPlayerId: null,
  isMyTurn: false,
  roomCode: null,
  connected: false,

  setMode: (mode) => set({ mode }),

  createRoom: async (playerName) => {
    const socket = socketService.getSocket();

    return new Promise((resolve, reject) => {
      socket.emit('room:create', { playerName }, (response) => {
        if (response.success && response.roomCode) {
          set({ roomCode: response.roomCode });
          resolve(response.roomCode);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  },

  joinRoom: async (roomCode, playerName) => {
    const socket = socketService.getSocket();

    return new Promise((resolve, reject) => {
      socket.emit('room:join', { roomCode, playerName }, (response) => {
        if (response.success) {
          set({ roomCode });
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  },

  markReady: () => {
    const { roomCode } = get();
    if (!roomCode) return;

    const socket = socketService.getSocket();
    socket.emit('room:ready', { roomCode });
  },

  makeMove: async (placedTiles) => {
    const { mode, gameState } = get();

    if (mode === 'local') {
      // Use existing local game store
      return useGameStore.getState().makeMove(placedTiles);
    } else {
      // Online mode - send to server
      const socket = socketService.getSocket();

      return new Promise((resolve) => {
        socket.emit(
          'game:make-move',
          {
            gameId: gameState!.id,
            placedTiles,
          },
          (response) => {
            if (!response.success) {
              alert(`Move failed: ${response.error}`);
            }
            resolve(response.success);
          }
        );
      });
    }
  },

  handleGameStarted: (gameId, gameState, myPlayerId) => {
    set({
      gameState,
      myPlayerId,
      isMyTurn:
        gameState.players[gameState.currentPlayerIndex].id === myPlayerId,
    });
  },

  handleStateUpdate: (gameState) => {
    const { myPlayerId } = get();
    set({
      gameState,
      isMyTurn:
        gameState.players[gameState.currentPlayerIndex].id === myPlayerId,
    });
  },
}));

/**
 * Setup socket event listeners
 * Call this once when entering online mode
 */
export function setupSocketListeners() {
  const socket = socketService.getSocket();
  const store = useOnlineGameStore.getState();

  socket.on('game:started', ({ gameId, gameState, yourPlayerId }) => {
    store.handleGameStarted(gameId, gameState, yourPlayerId);
  });

  socket.on('game:state-update', ({ gameState }) => {
    store.handleStateUpdate(gameState);
  });

  socket.on('game:opponent-disconnected', () => {
    alert('⚠️ Opponent disconnected. Waiting for reconnect...');
  });

  socket.on('game:opponent-reconnected', () => {
    alert('✅ Opponent reconnected!');
  });

  socket.on('game:ended', ({ gameState, winner, reason }) => {
    store.handleStateUpdate(gameState);
    // Game end screen will show automatically
  });
}
```

---

#### 4.3: Online Menu UI

**File:** `packages/client/src/components/OnlineMenu/OnlineMenu.tsx`

*See implementation plan for complete component code*

**User Flow:**
1. Enter name
2. Choose "Create Room" or "Join Room"
3. If create: Show 6-char code to share
4. If join: Enter code
5. Wait for opponent
6. Both click "Ready"
7. Game starts

---

### Step 5: Dictionary Handling (2 days)

**Objective:** Load dictionary on server for move validation

**File:** `packages/server/src/dictionary-loader.ts`

```typescript
import { Dictionary } from '@kvizovka/shared/utils/dictionary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dictionaryInstance: Dictionary | null = null;

export async function loadDictionary(): Promise<Dictionary> {
  if (dictionaryInstance) {
    return dictionaryInstance;
  }

  const dict = new Dictionary();

  // Load from file system (not fetch)
  const dictPath = path.join(__dirname, '../../dictionary/serbian-words.json');
  const data = await fs.readFile(dictPath, 'utf-8');
  const parsed = JSON.parse(data);

  // Load data into dictionary
  dict.loadFromData(parsed);

  dictionaryInstance = dict;
  return dict;
}

export function getDictionary(): Dictionary {
  if (!dictionaryInstance) {
    throw new Error('Dictionary not loaded. Call loadDictionary() first.');
  }
  return dictionaryInstance;
}
```

**Note:** Dictionary file needs to be copied to `packages/server/dictionary/` during build.

---

### Step 6: Testing (2-3 days)

**Test Checklist:**

**Basic Connectivity:**
- [ ] Server starts without errors
- [ ] Client connects to server via WebSocket
- [ ] Connection survives page reload

**Room Management:**
- [ ] Can create room (receives 6-char code)
- [ ] Can join room with valid code
- [ ] Cannot join room with invalid code
- [ ] Cannot join full room (2 players max)
- [ ] Both players see each other in lobby

**Game Start:**
- [ ] Game starts when both players ready
- [ ] Both clients receive initial game state
- [ ] Each player sees own tiles
- [ ] Each player sees opponent's name but NOT tiles

**Gameplay:**
- [ ] Can place tiles on board
- [ ] Server validates moves (rejects invalid)
- [ ] Turn switches correctly
- [ ] Opponent sees updated board in real-time
- [ ] Challenge system works
- [ ] Tile exchange works
- [ ] Skip turn works
- [ ] Game ends automatically after 10 rounds
- [ ] Final scores calculated correctly

**Security:**
- [ ] Cannot see opponent's tiles in network tab
- [ ] Cannot see tile bag in network tab
- [ ] Cannot move on opponent's turn
- [ ] Server rejects cheating attempts

**Disconnect/Reconnect:**
- [ ] Disconnect shows "waiting" UI
- [ ] Reconnect within 5 min resumes game
- [ ] Disconnect > 5 min forfeits game

**Testing Tools:**
- Open 2 browser windows (Chrome + Firefox)
- Use Chrome DevTools → Network → WS (WebSocket frames)
- Check console logs on both client and server

---

### Step 7: Deployment (1-2 days)

#### Backend Deployment (Railway)

1. **Create Railway account** at railway.app
2. **New Project** → Deploy from GitHub repo
3. **Environment Variables:**
   ```
   NODE_ENV=production
   CLIENT_URL=https://kvizovka.vercel.app
   PORT=3001
   ```
4. **Build Command:** `npm run build:server`
5. **Start Command:** `npm run start:server`
6. Railway auto-deploys on git push

**Railway URL:** `https://kvizovka-server.up.railway.app`

---

#### Frontend Deployment (Vercel)

1. **Create Vercel account** at vercel.com
2. **Import Git Repository**
3. **Root Directory:** `packages/client`
4. **Environment Variable:**
   ```
   VITE_SERVER_URL=https://kvizovka-server.up.railway.app
   ```
5. **Build Command:** `npm run build:client`
6. **Output Directory:** `packages/client/dist`
7. Vercel auto-deploys on git push

**Vercel URL:** `https://kvizovka.vercel.app`

---

## Security & Anti-Cheat

### Server-Authoritative Architecture

**Principle:** Never trust the client

**What Server Controls:**
- ✅ Tile bag (never sent to clients)
- ✅ Each player's tiles (only sent to that player)
- ✅ Move validation (server validates using same engine)
- ✅ Score calculation
- ✅ Turn enforcement
- ✅ Time tracking

**What Client Sees:**
```json
{
  "players": [
    {
      "id": "socket-abc123",
      "name": "Player 1",
      "tiles": [/* Own tiles */],  // ✅ Can see
      "score": 42
    },
    {
      "id": "socket-xyz789",
      "name": "Player 2",
      "tiles": [],  // ❌ Empty - opponent's tiles hidden
      "score": 38
    }
  ],
  "tileBag": [],  // ❌ Never sent to client
  "board": [/* visible tiles only */]
}
```

### Attack Vectors Prevented

| Attack | Prevention |
|--------|-----------|
| See opponent's tiles | Server sends sanitized state (opponent tiles = []) |
| See tile bag | Tile bag never sent to client |
| Modify own tiles | Server validates tile IDs exist in player's hand |
| Submit opponent's move | Server checks currentPlayerIndex |
| Manipulate score | Server calculates score |
| Invalid word | Server validates against dictionary |
| Time manipulation | Server tracks time, client displays only |

---

## Code Reusability Analysis

### 100% Reusable (No Changes)

| Component | Lines of Code | Reusable? |
|-----------|--------------|-----------|
| Type definitions (`src/types/`) | ~500 | ✅ Yes |
| Board class | ~300 | ✅ Yes |
| MoveValidator class | ~400 | ✅ Yes |
| ScoreCalculator class | ~250 | ✅ Yes |
| Constants (board config, tiles) | ~200 | ✅ Yes |

**Total: ~1,650 lines of pure, reusable TypeScript**

---

### Reusable with Minor Changes

| Component | Change Required |
|-----------|----------------|
| TileBag | Use seeded RNG instead of Math.random() |
| WordValidator | Abstract dictionary loading (fetch vs fs) |

---

### Needs Refactoring

| Component | Why |
|-----------|-----|
| State Management | Zustand → WebSocket sync |
| Timer Management | Local interval → server-driven |
| Move Execution | Client → server-authoritative |

**Estimated Reusability:** ~80% of game logic can be shared!

---

## Testing Strategy

### Unit Tests (Phase 2)

- Game engine classes (Board, TileBag, etc.)
- Score calculation
- Move validation
- State sanitization

**Framework:** Vitest

---

### Integration Tests (Phase 2)

- WebSocket event handlers
- Game Manager methods
- Room Manager methods

**Framework:** Vitest + Socket.io test client

---

### End-to-End Tests (Phase 3)

- Complete game flow (create → join → play → end)
- Disconnect/reconnect scenarios
- Edge cases (timeouts, invalid moves)

**Framework:** Playwright

---

### Manual Testing (Phase 1)

**Test Scenarios:**
1. Happy path (create → join → play → win)
2. Invalid moves rejected
3. Challenge system
4. Tile exchange
5. Disconnect/reconnect
6. Game end conditions

---

## Deployment Guide

### Development Environment

```bash
# Install dependencies
npm install

# Run client + server in parallel
npm run dev

# Or separately:
npm run dev:client  # http://localhost:5173
npm run dev:server  # http://localhost:3001
```

---

### Production Deployment

**Backend (Railway):**
1. Push to GitHub
2. Railway auto-deploys
3. Server runs on `https://kvizovka.up.railway.app`

**Frontend (Vercel):**
1. Push to GitHub
2. Vercel auto-deploys
3. Client runs on `https://kvizovka.vercel.app`

**Environment Variables:**
- Backend: `CLIENT_URL=https://kvizovka.vercel.app`
- Frontend: `VITE_SERVER_URL=https://kvizovka.up.railway.app`

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| WebSocket complexity | Medium | High | Use Socket.io (handles hard parts) |
| State sync bugs | High | High | Thorough testing, clear event flow |
| Disconnect handling | High | Medium | Implement timeout + reconnect logic |
| Server costs | Low | Low | Free tier sufficient for MVP |
| Cheating attempts | Medium | High | Server-authoritative architecture |
| Dictionary size (1.2MB) | Low | Low | Load once on server startup |
| Database migration | Medium | Medium | Phase 2 only (start with in-memory) |

---

## Success Criteria

### Phase 1 Complete When:

- [ ] Monorepo structure working (client + server + shared)
- [ ] Two players can create/join room via 6-char code
- [ ] Both players ready → game starts
- [ ] Full game playable online (all moves, challenges, exchanges)
- [ ] Server validates all moves (cheating impossible)
- [ ] Opponent's tiles hidden from client
- [ ] Disconnect/reconnect works (5-min window)
- [ ] Game ends automatically (10 rounds)
- [ ] Deployed to Railway + Vercel
- [ ] At least 10 successful test games completed

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: MVO** | **2-3 weeks** | Room codes, real-time play, server validation |
| Step 1: Monorepo | 2 days | Package structure, shared code |
| Step 2: Server Core | 3-4 days | Hono + Game Manager + Room Manager |
| Step 3: WebSocket | 3-4 days | Event handlers, state sync |
| Step 4: Client | 4-5 days | Socket service, online store, UI |
| Step 5: Dictionary | 2 days | Server-side dictionary loading |
| Step 6: Testing | 2-3 days | Full game test scenarios |
| Step 7: Deployment | 1-2 days | Railway + Vercel setup |
| **Phase 2: Persistence** | **2-3 weeks** | Database, matchmaking, accounts |
| **Phase 3: Production** | **2-4 weeks** | ELO, leaderboards, polish |
| **TOTAL** | **6-10 weeks** | Production-ready online game |

---

## Next Steps

1. ✅ **Review this plan** with stakeholders
2. ⏭️ **Get approval** for technology choices
3. ⏭️ **Start Step 1:** Monorepo setup (2 days)
4. ⏭️ **Iterate incrementally** through all 7 steps

---

## Questions for User

Before starting implementation, please clarify:

1. **Deployment preference:**
   - Railway (recommended) or alternative (Render, Fly.io)?

2. **User accounts:**
   - Phase 1: Anonymous play only?
   - Phase 2: Add email/password?

3. **Database:**
   - Phase 1: In-memory only (games lost on restart)?
   - Phase 2: PostgreSQL for persistence?

4. **Matchmaking:**
   - Phase 1: Room codes only?
   - Phase 2: Add "Quick Play" auto-matching?

5. **Priority:**
   - Fast MVP (Phase 1 only) or build toward production (all 3 phases)?

---

## Conclusion

This plan provides a concrete, incremental path to online multiplayer while:
- ✅ Preserving the working local multiplayer
- ✅ Reusing ~80% of existing game logic
- ✅ Implementing server-authoritative architecture (prevents cheating)
- ✅ Supporting both local and online modes (dual mode)
- ✅ Deploying to free tiers initially
- ✅ Scaling to production-ready system (Phases 2-3)

The architecture is designed to be simple, maintainable, and secure. Each phase builds on the previous, allowing for iterative development and testing.

**Estimated total effort:** 6-10 weeks for complete production-ready online multiplayer game.

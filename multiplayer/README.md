# Kvizovka Online Multiplayer

This is the online multiplayer implementation of Kvizovka, using a monorepo structure with npm workspaces.

## Structure

```
multiplayer/
├── packages/
│   ├── shared/       # Shared TypeScript code (types, game engine, constants)
│   ├── client/       # React frontend
│   └── server/       # Node.js backend (Hono + Socket.io)
├── package.json      # Root package with workspaces config
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# From the multiplayer/ directory
npm install
```

This will install dependencies for all packages in the monorepo.

### Development

Run both client and server in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

### Building

Build all packages:

```bash
npm run build
```

Build individual packages:

```bash
npm run build:shared
npm run build:client
npm run build:server
```

## Packages

### @kvizovka/shared

Shared TypeScript code used by both client and server:
- Type definitions (GameState, Player, Tile, etc.)
- Game engine (Board, TileBag, MoveValidator, ScoreCalculator)
- Constants (tile distribution, board config, scoring rules)
- Utilities (Dictionary)

### @kvizovka/client

React frontend for the game:
- UI components (Board, TileRack, ScorePanel, etc.)
- State management (Zustand store)
- Socket.io client for real-time communication
- Responsive design with Tailwind CSS

### @kvizovka/server

Node.js backend:
- Hono HTTP server
- Socket.io for WebSocket communication
- Game manager (server-authoritative game state)
- Room manager (create/join rooms)
- Dictionary loader

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Zustand, Socket.io Client
- **Backend:** Node.js, Hono, Socket.io, TypeScript
- **Shared:** Pure TypeScript (game logic)
- **Monorepo:** npm workspaces

## Development Workflow

1. Make changes to shared code in `packages/shared/`
2. Both client and server will automatically use the updated code (no build needed in dev mode)
3. Make client-specific changes in `packages/client/`
4. Make server-specific changes in `packages/server/`

## Deployment

See [ONLINE-MULTIPLAYER-PLAN.md](../Docs/ONLINE-MULTIPLAYER-PLAN.md) for deployment instructions to Railway (server) and Vercel (client).

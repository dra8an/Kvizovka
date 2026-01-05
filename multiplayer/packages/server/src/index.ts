/**
 * Kvizovka Server
 *
 * Main entry point for the Hono server with Socket.io integration.
 *
 * This server provides:
 * - REST API endpoints (health check, info)
 * - WebSocket server for real-time gameplay
 * - Server-authoritative game logic
 * - Room management for matchmaking
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@kvizovka/shared'
import { WordValidator } from '@kvizovka/shared'

import { loadDictionary } from './dictionary-loader'
import { roomManager } from './room-manager'
import { GameManager } from './game-manager'

/**
 * Type for Socket.io server with custom events
 */
type CustomServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

/**
 * Type for Socket with custom events
 */
type CustomSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

/**
 * Global game manager instance
 */
let gameManager: GameManager

/**
 * Initialize server
 */
async function initializeServer() {
  console.log('🚀 Starting Kvizovka server...')

  // 1. Load dictionary
  await loadDictionary()
  const wordValidator = new WordValidator()

  // 2. Create game manager
  gameManager = new GameManager(wordValidator)
  console.log('[Server] Game manager initialized')

  // 3. Create Hono app
  const app = new Hono()

  // Health check endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API info endpoint
  app.get('/', (c) => {
    const stats = roomManager.getStats()
    return c.json({
      name: 'Kvizovka Server',
      version: '0.1.0',
      status: 'running',
      endpoints: {
        health: '/health',
        socket: 'Socket.io connection available',
      },
      stats: {
        rooms: stats.totalRooms,
        activeGames: stats.activeGames,
        waitingRooms: stats.waitingRooms,
      },
    })
  })

  // 4. Start server with Socket.io integration
  const port = Number(process.env.PORT) || 3000

  const server = serve(
    {
      fetch: app.fetch,
      port,
      createServer,
    },
    (info) => {
      console.log(`🚀 Kvizovka server running on http://localhost:${info.port}`)
    }
  )

  // 5. Setup Socket.io
  const io: CustomServer = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  console.log('🔌 Socket.io ready for connections')

  // 6. Socket.io event handlers
  io.on('connection', (socket: CustomSocket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)

    /**
     * Create Room
     */
    socket.on('room:create', (data, callback) => {
      try {
        const { playerName } = data
        const { code } = roomManager.createRoom(socket.id, playerName)

        // Join socket.io room
        socket.join(code)

        // Store data on socket
        socket.data.playerName = playerName
        socket.data.roomCode = code

        callback({ success: true, roomCode: code })
      } catch (error) {
        console.error('[room:create] Error:', error)
        callback({ success: false, error: 'Failed to create room' })
      }
    })

    /**
     * Join Room
     */
    socket.on('room:join', (data, callback) => {
      try {
        const { roomCode, playerName } = data
        const room = roomManager.joinRoom(roomCode, socket.id, playerName)

        if (!room) {
          callback({ success: false, error: 'Room not found or full' })
          return
        }

        // Join socket.io room
        socket.join(room.code)

        // Store data on socket
        socket.data.playerName = playerName
        socket.data.roomCode = room.code

        // Notify host that guest joined
        socket.to(room.code).emit('room:player-joined', { playerName })

        callback({ success: true })
      } catch (error) {
        console.error('[room:join] Error:', error)
        callback({ success: false, error: 'Failed to join room' })
      }
    })

    /**
     * Room Ready (Start Game)
     */
    socket.on('room:ready', (data, callback) => {
      try {
        const { roomCode } = data
        const room = roomManager.getRoom(roomCode)

        if (!room) {
          callback({ success: false, error: 'Room not found' })
          return
        }

        if (!room.guestId) {
          callback({ success: false, error: 'Waiting for second player' })
          return
        }

        // Mark room as ready
        roomManager.setRoomReady(roomCode)

        // Create game
        const { gameId, gameState } = gameManager.createGame(room.hostName, room.guestName!)

        // Link game to room
        roomManager.setGameId(roomCode, gameId)

        // Determine player IDs
        const player1Id = gameState.players[0].id
        const player2Id = gameState.players[1].id

        // Store player IDs on sockets
        const hostSocket = io.sockets.sockets.get(room.hostId)
        const guestSocket = io.sockets.sockets.get(room.guestId)

        if (hostSocket) {
          hostSocket.data.gameId = gameId
          hostSocket.data.playerId = player1Id
        }

        if (guestSocket) {
          guestSocket.data.gameId = gameId
          guestSocket.data.playerId = player2Id
        }

        // Send game started event to both players with their respective sanitized states
        io.to(room.hostId).emit('game:started', {
          gameId,
          gameState: gameManager.sanitizeGameState(gameManager.getGame(gameId)!, player1Id),
          yourPlayerId: player1Id,
        })

        io.to(room.guestId).emit('game:started', {
          gameId,
          gameState: gameManager.sanitizeGameState(gameManager.getGame(gameId)!, player2Id),
          yourPlayerId: player2Id,
        })

        callback({ success: true })
      } catch (error) {
        console.error('[room:ready] Error:', error)
        callback({ success: false, error: 'Failed to start game' })
      }
    })

    /**
     * Make Move
     */
    socket.on('game:make-move', (data, callback) => {
      try {
        const { gameId, placedTiles } = data
        const game = gameManager.getGame(gameId)

        if (!game) {
          callback({ success: false, error: 'Game not found' })
          return
        }

        // Get player ID from socket data
        const playerId = socket.data.playerId

        if (!playerId) {
          callback({ success: false, error: 'Player ID not found' })
          return
        }

        const result = gameManager.makeMove(gameId, playerId, placedTiles)

        if (!result.success) {
          callback({ success: false, error: result.error })
          return
        }

        // Broadcast updated state to both players
        const [player1, player2] = game.players
        const room = roomManager.getRoomByPlayer(socket.id)

        if (room && room.gameId === gameId) {
          io.to(room.hostId).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player1.id),
          })

          io.to(room.guestId!).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player2.id),
          })
        }

        callback({ success: true })
      } catch (error) {
        console.error('[game:make-move] Error:', error)
        callback({ success: false, error: 'Failed to make move' })
      }
    })

    /**
     * Skip Turn
     */
    socket.on('game:skip-turn', (data, callback) => {
      try {
        const { gameId } = data
        const game = gameManager.getGame(gameId)

        if (!game) {
          callback({ success: false, error: 'Game not found' })
          return
        }

        const playerId = socket.data.playerId

        if (!playerId) {
          callback({ success: false, error: 'Player ID not found' })
          return
        }

        const result = gameManager.skipTurn(gameId, playerId)

        if (!result.success) {
          callback({ success: false, error: result.error })
          return
        }

        // Broadcast state
        const [player1, player2] = game.players
        const room = roomManager.getRoomByPlayer(socket.id)

        if (room && room.gameId === gameId) {
          io.to(room.hostId).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player1.id),
          })

          io.to(room.guestId!).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player2.id),
          })
        }

        callback({ success: true })
      } catch (error) {
        console.error('[game:skip-turn] Error:', error)
        callback({ success: false, error: 'Failed to skip turn' })
      }
    })

    /**
     * Exchange Tiles
     */
    socket.on('game:exchange-tiles', (data, callback) => {
      try {
        const { gameId, tileIds } = data
        const game = gameManager.getGame(gameId)

        if (!game) {
          callback({ success: false, error: 'Game not found' })
          return
        }

        const playerId = socket.data.playerId

        if (!playerId) {
          callback({ success: false, error: 'Player ID not found' })
          return
        }

        const result = gameManager.exchangeTiles(gameId, playerId, tileIds)

        if (!result.success) {
          callback({ success: false, error: result.error })
          return
        }

        // Broadcast state
        const [player1, player2] = game.players
        const room = roomManager.getRoomByPlayer(socket.id)

        if (room && room.gameId === gameId) {
          io.to(room.hostId).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player1.id),
          })

          io.to(room.guestId!).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player2.id),
          })
        }

        callback({ success: true })
      } catch (error) {
        console.error('[game:exchange-tiles] Error:', error)
        callback({ success: false, error: 'Failed to exchange tiles' })
      }
    })

    /**
     * Challenge Word
     */
    socket.on('game:challenge', (data, callback) => {
      try {
        const { gameId } = data
        const game = gameManager.getGame(gameId)

        if (!game) {
          callback({ success: false, error: 'Game not found' })
          return
        }

        const playerId = socket.data.playerId

        if (!playerId) {
          callback({ success: false, error: 'Player ID not found' })
          return
        }

        const result = gameManager.challengeWord(gameId, playerId)

        if (!result.success) {
          callback({ success: false, error: result.error })
          return
        }

        // Broadcast state
        const [player1, player2] = game.players
        const room = roomManager.getRoomByPlayer(socket.id)

        if (room && room.gameId === gameId) {
          io.to(room.hostId).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player1.id),
          })

          io.to(room.guestId!).emit('game:state-update', {
            gameState: gameManager.sanitizeGameState(game, player2.id),
          })
        }

        callback({ success: true, challengeSucceeded: result.challengeSucceeded })
      } catch (error) {
        console.error('[game:challenge] Error:', error)
        callback({ success: false, error: 'Failed to challenge word' })
      }
    })

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)

      // Remove player from room
      const roomCode = roomManager.removePlayer(socket.id)

      if (roomCode) {
        // Notify other player
        socket.to(roomCode).emit('game:opponent-disconnected')
      }
    })
  })

  return { app, server, io }
}

// Start server
initializeServer().catch((error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})

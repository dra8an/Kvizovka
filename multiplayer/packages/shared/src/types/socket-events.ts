/**
 * Socket.io Event Type Definitions
 *
 * This file defines all WebSocket events for real-time communication
 * between the client and server.
 *
 * Events follow the pattern: "namespace:action"
 * - room:* - Room management (create, join, ready)
 * - game:* - Game actions (move, skip, exchange, challenge)
 */

import type { GameState } from './game.types.js'
import type { PlacedTile } from './board.types.js'

/**
 * Room Information
 */
export interface Room {
  /**
   * 6-character room code (e.g., "A3X9K2")
   */
  code: string

  /**
   * Host player socket ID
   */
  hostId: string

  /**
   * Host player name
   */
  hostName: string

  /**
   * Guest player socket ID (null if waiting)
   */
  guestId: string | null

  /**
   * Guest player name (null if waiting)
   */
  guestName: string | null

  /**
   * Game ID (set when game starts)
   */
  gameId: string | null

  /**
   * Both players ready
   */
  ready: boolean

  /**
   * Room creation timestamp
   */
  createdAt: Date
}

/**
 * Chat Message
 */
export interface ChatMessage {
  /**
   * Player ID who sent the message
   */
  playerId: string

  /**
   * Player name who sent the message
   */
  playerName: string

  /**
   * Message text
   */
  message: string

  /**
   * Message timestamp
   */
  timestamp: Date
}

/**
 * Client → Server Events
 *
 * Events that the client sends to the server
 */
export interface ClientToServerEvents {
  /**
   * Create a new room
   */
  'room:create': (
    data: { playerName: string },
    callback: (response: { success: boolean; roomCode?: string; error?: string }) => void
  ) => void

  /**
   * Join an existing room
   */
  'room:join': (
    data: { roomCode: string; playerName: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Mark player as ready
   */
  'room:ready': (
    data: { roomCode: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Make a move (place tiles)
   */
  'game:make-move': (
    data: { gameId: string; placedTiles: PlacedTile[]; direction?: 'HORIZONTAL' | 'VERTICAL' },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Skip turn
   */
  'game:skip-turn': (
    data: { gameId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Exchange tiles
   */
  'game:exchange-tiles': (
    data: { gameId: string; tileIds: string[] },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Challenge last word
   */
  'game:challenge': (
    data: { gameId: string },
    callback: (response: { success: boolean; challengeSucceeded?: boolean; error?: string }) => void
  ) => void

  /**
   * Steal a joker from the board
   */
  'game:steal-joker': (
    data: { gameId: string; row: number; col: number; replacementTileId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Recall tiles (undo placement before submitting)
   */
  'game:recall-tiles': (
    data: { gameId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Force end game (for testing)
   */
  'game:force-end': (
    data: { gameId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void

  /**
   * Send chat message
   */
  'chat:message': (data: { roomCode: string; message: string }) => void
}

/**
 * Server → Client Events
 *
 * Events that the server sends to clients
 */
export interface ServerToClientEvents {
  /**
   * Player joined the room
   */
  'room:player-joined': (data: { playerName: string }) => void

  /**
   * Both players ready, game starting
   */
  'game:started': (data: { gameId: string; gameState: GameState; yourPlayerId: string }) => void

  /**
   * Game state updated (after any move)
   */
  'game:state-update': (data: { gameState: GameState }) => void

  /**
   * Opponent disconnected
   */
  'game:opponent-disconnected': () => void

  /**
   * Opponent reconnected
   */
  'game:opponent-reconnected': () => void

  /**
   * Game ended
   */
  'game:ended': (data: { winner: string | null; reason: string }) => void

  /**
   * Error occurred
   */
  error: (data: { message: string }) => void

  /**
   * Receive chat message
   */
  'chat:message': (data: ChatMessage) => void
}

/**
 * Inter-Server Events (for future scaling)
 */
export interface InterServerEvents {
  ping: () => void
}

/**
 * Socket Data (custom data attached to socket)
 */
export interface SocketData {
  /**
   * Player name
   */
  playerName?: string

  /**
   * Current room code
   */
  roomCode?: string

  /**
   * Current game ID
   */
  gameId?: string

  /**
   * Player ID in the game
   */
  playerId?: string
}

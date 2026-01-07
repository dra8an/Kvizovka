/**
 * Online Game Store (Zustand)
 *
 * State management for online multiplayer mode.
 *
 * This store manages:
 * - WebSocket connection state
 * - Room creation and joining
 * - Online game state from server
 * - Real-time game actions
 *
 * Unlike the local gameStore, this store:
 * - Does NOT validate moves (server does)
 * - Does NOT calculate scores (server does)
 * - Receives authoritative game state from server
 * - Sends player actions to server
 */

import { create } from 'zustand'
import {
  GameState,
  PlacedTile,
} from '@kvizovka/shared'
import { socketService } from '../services/socket'

/**
 * View States
 */
type ViewState =
  | 'menu'           // Initial menu (create or join)
  | 'waiting'        // Waiting for opponent
  | 'playing'        // Game in progress
  | 'finished'       // Game ended

/**
 * Online Game Store State
 */
interface OnlineGameStore {
  // ========================================
  // CONNECTION STATE
  // ========================================

  /**
   * Is WebSocket connected to server
   */
  isConnected: boolean

  /**
   * Connection error message
   */
  connectionError: string | null

  // ========================================
  // ROOM STATE
  // ========================================

  /**
   * Current room code (6 characters)
   */
  roomCode: string | null

  /**
   * This player's name
   */
  playerName: string | null

  /**
   * Is this player the host?
   */
  isHost: boolean

  /**
   * Opponent's name (null until they join)
   */
  opponentName: string | null

  // ========================================
  // GAME STATE
  // ========================================

  /**
   * Current game ID (server-assigned)
   */
  gameId: string | null

  /**
   * Current game state (from server)
   */
  gameState: GameState | null

  /**
   * This player's ID in the game
   */
  yourPlayerId: string | null

  /**
   * Last error from game action
   */
  gameError: string | null

  // ========================================
  // UI STATE
  // ========================================

  /**
   * Current view state
   */
  view: ViewState

  /**
   * Is waiting for server response
   */
  isLoading: boolean

  // ========================================
  // ACTIONS - CONNECTION
  // ========================================

  /**
   * Connect to server
   */
  connect: () => void

  /**
   * Disconnect from server
   */
  disconnect: () => void

  // ========================================
  // ACTIONS - ROOM
  // ========================================

  /**
   * Create a new room
   */
  createRoom: (playerName: string) => void

  /**
   * Join an existing room
   */
  joinRoom: (roomCode: string, playerName: string) => void

  /**
   * Mark ready to start game
   */
  ready: () => void

  // ========================================
  // ACTIONS - GAME
  // ========================================

  /**
   * Make a move (place tiles)
   */
  makeMove: (placedTiles: PlacedTile[]) => void

  /**
   * Skip turn
   */
  skipTurn: () => void

  /**
   * Exchange tiles
   */
  exchangeTiles: (tileIds: string[]) => void

  /**
   * Challenge opponent's word
   */
  challengeWord: () => void

  // ========================================
  // ACTIONS - RESET
  // ========================================

  /**
   * Reset to initial state
   */
  reset: () => void
}

/**
 * Initial state
 */
const initialState = {
  // Connection
  isConnected: false,
  connectionError: null,

  // Room
  roomCode: null,
  playerName: null,
  isHost: false,
  opponentName: null,

  // Game
  gameId: null,
  gameState: null,
  yourPlayerId: null,
  gameError: null,

  // UI
  view: 'menu' as ViewState,
  isLoading: false,
}

/**
 * Create Online Game Store
 */
export const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
  ...initialState,

  // ========================================
  // CONNECTION ACTIONS
  // ========================================

  connect: () => {
    console.log('[OnlineStore] Connecting to server...')

    // Connect socket
    socketService.connect()

    // Setup connection event handlers
    socketService.onConnect(() => {
      console.log('[OnlineStore] Connected!')
      set({ isConnected: true, connectionError: null })
    })

    socketService.onDisconnect(() => {
      console.log('[OnlineStore] Disconnected!')
      set({ isConnected: false })
    })

    socketService.onError((error) => {
      console.error('[OnlineStore] Connection error:', error)
      set({ connectionError: error.message })
    })

    // Setup game event handlers
    setupGameEventHandlers(set, get)
  },

  disconnect: () => {
    console.log('[OnlineStore] Disconnecting...')
    socketService.disconnect()
    set({ isConnected: false })
  },

  // ========================================
  // ROOM ACTIONS
  // ========================================

  createRoom: (playerName: string) => {
    console.log('[OnlineStore] Creating room...', playerName)
    set({ isLoading: true, gameError: null })

    socketService.emit('room:create', { playerName }, (response) => {
      set({ isLoading: false })

      if (response.success && response.roomCode) {
        console.log('[OnlineStore] Room created:', response.roomCode)
        set({
          roomCode: response.roomCode,
          playerName,
          isHost: true,
          view: 'waiting',
        })
      } else {
        console.error('[OnlineStore] Failed to create room:', response.error)
        set({ gameError: response.error || 'Failed to create room' })
      }
    })
  },

  joinRoom: (roomCode: string, playerName: string) => {
    console.log('[OnlineStore] Joining room...', roomCode, playerName)
    set({ isLoading: true, gameError: null })

    socketService.emit('room:join', { roomCode, playerName }, (response) => {
      set({ isLoading: false })

      if (response.success) {
        console.log('[OnlineStore] Joined room:', roomCode)
        set({
          roomCode,
          playerName,
          isHost: false,
          view: 'waiting',
        })
      } else {
        console.error('[OnlineStore] Failed to join room:', response.error)
        set({ gameError: response.error || 'Failed to join room' })
      }
    })
  },

  ready: () => {
    const { roomCode } = get()
    if (!roomCode) return

    console.log('[OnlineStore] Marking ready...')
    set({ isLoading: true, gameError: null })

    socketService.emit('room:ready', { roomCode }, (response) => {
      set({ isLoading: false })

      if (!response.success) {
        console.error('[OnlineStore] Failed to ready:', response.error)
        set({ gameError: response.error || 'Failed to start game' })
      }
      // Server will send game:started event
    })
  },

  // ========================================
  // GAME ACTIONS
  // ========================================

  makeMove: (placedTiles: PlacedTile[]) => {
    const { gameId } = get()
    console.log('[OnlineStore] makeMove called, gameId:', gameId, 'tiles:', placedTiles.length)

    if (!gameId) {
      console.error('[OnlineStore] ERROR: No gameId, cannot make move')
      return
    }

    console.log('[OnlineStore] Socket connected:', socketService.isConnected())
    console.log('[OnlineStore] Emitting game:make-move event...')
    set({ gameError: null })

    socketService.emit('game:make-move', { gameId, placedTiles }, (response) => {
      console.log('[OnlineStore] Received response from server:', response)
      if (!response.success) {
        console.error('[OnlineStore] Move failed:', response.error)
        set({ gameError: response.error || 'Invalid move' })
      } else {
        console.log('[OnlineStore] Move accepted by server')
      }
      // Server will send game:state-update event if successful
    })
  },

  skipTurn: () => {
    const { gameId } = get()
    if (!gameId) return

    console.log('[OnlineStore] Skipping turn...')
    set({ gameError: null })

    socketService.emit('game:skip-turn', { gameId }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Skip failed:', response.error)
        set({ gameError: response.error || 'Failed to skip turn' })
      }
      // Server will send game:state-update event
    })
  },

  exchangeTiles: (tileIds: string[]) => {
    const { gameId } = get()
    if (!gameId) return

    console.log('[OnlineStore] Exchanging tiles...', tileIds)
    set({ gameError: null })

    socketService.emit('game:exchange-tiles', { gameId, tileIds }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Exchange failed:', response.error)
        set({ gameError: response.error || 'Failed to exchange tiles' })
      }
      // Server will send game:state-update event
    })
  },

  challengeWord: () => {
    const { gameId } = get()
    if (!gameId) return

    console.log('[OnlineStore] Challenging word...')
    set({ gameError: null })

    socketService.emit('game:challenge', { gameId }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Challenge failed:', response.error)
        set({ gameError: response.error || 'Failed to challenge' })
      }
      // Server will send game:state-update event
    })
  },

  // ========================================
  // RESET
  // ========================================

  reset: () => {
    console.log('[OnlineStore] Resetting state and disconnecting...')
    socketService.removeAllListeners()
    socketService.disconnect()
    set(initialState)
  },
}))

/**
 * Setup Game Event Handlers
 *
 * Listen for server events and update store state
 */
function setupGameEventHandlers(
  set: (partial: Partial<OnlineGameStore>) => void,
  get: () => OnlineGameStore
) {
  // Player joined room
  socketService.on('room:player-joined', (data) => {
    console.log('[OnlineStore] Player joined:', data.playerName)
    set({ opponentName: data.playerName })
  })

  // Game started
  socketService.on('game:started', (data) => {
    console.log('[OnlineStore] Game started!', data.gameId)
    set({
      gameId: data.gameId,
      gameState: data.gameState,
      yourPlayerId: data.yourPlayerId,
      view: 'playing',
    })
  })

  // Game state update
  socketService.on('game:state-update', (data) => {
    console.log('[OnlineStore] State update received')
    set({ gameState: data.gameState })

    // Check if game is finished
    if (data.gameState.status === 'COMPLETED') {
      set({ view: 'finished' })
    }
  })

  // Opponent disconnected
  socketService.on('game:opponent-disconnected', () => {
    console.log('[OnlineStore] Opponent disconnected!')
    set({ gameError: 'Opponent disconnected from game' })
  })

  // Opponent reconnected
  socketService.on('game:opponent-reconnected', () => {
    console.log('[OnlineStore] Opponent reconnected!')
    set({ gameError: null })
  })

  // Game ended
  socketService.on('game:ended', (data) => {
    console.log('[OnlineStore] Game ended!', data)
    set({ view: 'finished' })
  })
}

/**
 * Example Usage:
 *
 * ```typescript
 * import { useOnlineGameStore } from '@/store/onlineGameStore'
 *
 * function OnlineGame() {
 *   const {
 *     isConnected,
 *     roomCode,
 *     gameState,
 *     connect,
 *     createRoom,
 *     makeMove,
 *   } = useOnlineGameStore()
 *
 *   useEffect(() => {
 *     connect()
 *     return () => disconnect()
 *   }, [])
 *
 *   const handleCreateRoom = () => {
 *     createRoom('Alice')
 *   }
 *
 *   const handleMove = (tiles: PlacedTile[]) => {
 *     makeMove(tiles)
 *   }
 *
 *   if (!isConnected) return <div>Connecting...</div>
 *   if (!gameState) return <div>Waiting for game...</div>
 *
 *   return <div>Game UI here</div>
 * }
 * ```
 */

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
  GameStatus,
  PlacedTile,
  ChatMessage,
  Board,
  MoveValidator,
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

  /**
   * Bonus flash overlay (shows long word bonus)
   * null = not showing, number = bonus amount to display
   */
  bonusFlash: number | null

  /**
   * Direction choice dialog (when single tile forms words in both directions)
   * null = not showing
   */
  directionChoice: {
    placedTiles: PlacedTile[]
    horizontalOption: {
      wordText: string
      direction: 'HORIZONTAL'
    }
    verticalOption: {
      wordText: string
      direction: 'VERTICAL'
    }
  } | null

  // ========================================
  // CHAT STATE
  // ========================================

  /**
   * Chat messages in the current room
   */
  chatMessages: ChatMessage[]

  /**
   * When the current player's turn started (for time tracking)
   * Used to calculate elapsed time when making a move
   */
  turnStartTime: number | null

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

  /**
   * Steal a joker from the board
   */
  stealJoker: (row: number, col: number, replacementTileId: string) => void

  /**
   * Force end game (for testing)
   */
  forceEndGame: () => void

  // ========================================
  // ACTIONS - CHAT
  // ========================================

  /**
   * Send a chat message
   */
  sendChatMessage: (message: string) => void

  // ========================================
  // ACTIONS - UI
  // ========================================

  /**
   * Show bonus flash overlay
   */
  showBonusFlash: (bonus: number) => void

  /**
   * Clear bonus flash overlay
   */
  clearBonusFlash: () => void

  /**
   * Show direction choice dialog
   */
  showDirectionChoice: (
    placedTiles: PlacedTile[],
    horizontalWord: string,
    verticalWord: string
  ) => void

  /**
   * Make move with chosen direction
   */
  makeMoveWithDirection: (direction: 'HORIZONTAL' | 'VERTICAL') => void

  /**
   * Cancel direction choice dialog
   */
  cancelDirectionChoice: () => void

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
  bonusFlash: null,
  directionChoice: null,

  // Chat
  chatMessages: [],

  // Timer
  turnStartTime: null,
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
    const { gameId, gameState } = get()
    console.log('[OnlineStore] makeMove called, gameId:', gameId, 'tiles:', placedTiles.length)

    if (!gameId) {
      console.error('[OnlineStore] ERROR: No gameId, cannot make move')
      return
    }

    if (!gameState) {
      console.error('[OnlineStore] ERROR: No gameState, cannot validate move')
      return
    }

    // Create temporary board instance from current game state for client-side validation
    const board = new Board()
    board.setGrid(gameState.board)

    // Validate move client-side
    const validator = new MoveValidator(board)
    const validation = validator.validateMove(placedTiles)

    console.log('[OnlineStore] Client-side validation result:', validation)

    if (!validation.isValid) {
      console.error('[OnlineStore] Invalid move (client-side):', validation.reason)
      set({ gameError: validation.reason || 'Invalid move' })
      return
    }

    // Check if direction choice is needed
    if (validation.needsDirectionChoice && validation.horizontalOption && validation.verticalOption) {
      console.log('[OnlineStore] Direction choice needed, showing dialog')
      get().showDirectionChoice(
        placedTiles,
        validation.horizontalOption.wordText,
        validation.verticalOption.wordText
      )
      return // Don't send to server yet, wait for user choice
    }

    console.log('[OnlineStore] Socket connected:', socketService.isConnected())
    console.log('[OnlineStore] Emitting game:make-move event...')
    set({ gameError: null })

    // Calculate time taken for this move
    const { turnStartTime } = get()
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:make-move', { gameId, placedTiles, timeTaken }, (response) => {
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
    const { gameId, turnStartTime } = get()
    if (!gameId) return

    console.log('[OnlineStore] Skipping turn...')
    set({ gameError: null })

    // Calculate time taken for this turn
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:skip-turn', { gameId, timeTaken }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Skip failed:', response.error)
        set({ gameError: response.error || 'Failed to skip turn' })
      }
      // Server will send game:state-update event
    })
  },

  exchangeTiles: (tileIds: string[]) => {
    const { gameId, turnStartTime } = get()
    if (!gameId) return

    console.log('[OnlineStore] Exchanging tiles...', tileIds)
    set({ gameError: null })

    // Calculate time taken for this turn
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:exchange-tiles', { gameId, tileIds, timeTaken }, (response) => {
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

  stealJoker: (row: number, col: number, replacementTileId: string) => {
    const { gameId } = get()
    if (!gameId) return

    console.log('[OnlineStore] Stealing joker...', { row, col, replacementTileId })
    set({ gameError: null })

    socketService.emit('game:steal-joker', { gameId, row, col, replacementTileId }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Steal failed:', response.error)
        set({ gameError: response.error || 'Failed to steal joker' })
      }
      // Server will send game:state-update event
    })
  },

  // ========================================
  // TEST HELPERS
  // ========================================

  forceEndGame: () => {
    const { gameId } = get()
    if (!gameId) return

    console.log('[OnlineStore] Force ending game (test mode)...')
    set({ gameError: null })

    socketService.emit('game:force-end', { gameId }, (response) => {
      if (!response.success) {
        console.error('[OnlineStore] Force end failed:', response.error)
        set({ gameError: response.error || 'Failed to end game' })
      }
      // Server will send game:state-update event with COMPLETED status
    })
  },

  // ========================================
  // CHAT ACTIONS
  // ========================================

  sendChatMessage: (message: string) => {
    const { roomCode } = get()
    if (!roomCode) {
      console.error('[OnlineStore] Cannot send message: not in a room')
      return
    }

    console.log('[OnlineStore] Sending chat message:', message)
    socketService.emit('chat:message', { roomCode, message })
  },

  // ========================================
  // UI ACTIONS
  // ========================================

  showBonusFlash: (bonus: number) => {
    if (bonus > 0) {
      set({ bonusFlash: bonus })
    }
  },

  clearBonusFlash: () => {
    set({ bonusFlash: null })
  },

  showDirectionChoice: (placedTiles, horizontalWord, verticalWord) => {
    set({
      directionChoice: {
        placedTiles,
        horizontalOption: {
          wordText: horizontalWord,
          direction: 'HORIZONTAL',
        },
        verticalOption: {
          wordText: verticalWord,
          direction: 'VERTICAL',
        },
      },
    })
  },

  makeMoveWithDirection: (direction: 'HORIZONTAL' | 'VERTICAL') => {
    const { directionChoice, gameId } = get()

    if (!directionChoice) {
      console.error('No direction choice available')
      return
    }

    if (!gameId) {
      console.error('No gameId')
      return
    }

    const { placedTiles } = directionChoice
    const { turnStartTime } = get()

    // Clear the dialog
    set({ directionChoice: null, gameError: null })

    console.log('[OnlineStore] Sending move with chosen direction:', direction)
    console.log('[OnlineStore] Emitting game:make-move event with direction...')

    // Calculate time taken for this move
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    // Send move to server with the chosen direction
    socketService.emit('game:make-move', { gameId, placedTiles, timeTaken, direction }, (response) => {
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

  cancelDirectionChoice: () => {
    set({ directionChoice: null })
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

    // Check if it's your turn and set turnStartTime
    const isYourTurn = data.gameState.players[data.gameState.currentPlayerIndex].id === data.yourPlayerId

    set({
      gameId: data.gameId,
      gameState: data.gameState,
      yourPlayerId: data.yourPlayerId,
      view: 'playing',
      turnStartTime: isYourTurn ? Date.now() : null,
    })
  })

  // Game state update
  socketService.on('game:state-update', (data) => {
    console.log('[OnlineStore] State update received')
    console.log('[OnlineStore] Game status:', data.gameState.status)

    const previousState = get().gameState
    const yourPlayerId = get().yourPlayerId

    // Check if turn changed
    const turnChanged = previousState && previousState.currentPlayerIndex !== data.gameState.currentPlayerIndex
    const isYourTurn = yourPlayerId && data.gameState.players[data.gameState.currentPlayerIndex].id === yourPlayerId

    // Update state
    set({
      gameState: data.gameState,
      // Reset turnStartTime when it becomes your turn
      turnStartTime: turnChanged && isYourTurn ? Date.now() : get().turnStartTime,
    })

    // Check if a new move was made (moveHistory grew)
    if (previousState && data.gameState.moveHistory.length > previousState.moveHistory.length) {
      // Get the latest move
      const latestMove = data.gameState.moveHistory[data.gameState.moveHistory.length - 1]

      // Show bonus flash if long word bonus was awarded
      if (latestMove.scoreBreakdown?.longWordBonus && latestMove.scoreBreakdown.longWordBonus > 0) {
        console.log('[OnlineStore] Long word bonus detected:', latestMove.scoreBreakdown.longWordBonus)
        get().showBonusFlash(latestMove.scoreBreakdown.longWordBonus)
      }
    }

    // Check if game is finished
    if (data.gameState.status === GameStatus.COMPLETED) {
      console.log('[OnlineStore] Game completed! Setting view to finished')
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

  // Chat message received
  socketService.on('chat:message', (chatMessage) => {
    console.log('[OnlineStore] Chat message received:', chatMessage)
    const currentMessages = get().chatMessages
    set({ chatMessages: [...currentMessages, chatMessage] })
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

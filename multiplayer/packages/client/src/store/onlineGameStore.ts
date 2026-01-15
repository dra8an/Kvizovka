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
  Logger,
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

  /**
   * Is this user a spectator?
   */
  isSpectator: boolean

  /**
   * List of spectators in the room
   */
  spectators: Array<{ socketId: string; name: string }>

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
   * ID to use for chat identification
   * - For players: same as yourPlayerId
   * - For spectators: socket.id
   */
  chatId: string | null

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
   * Join an existing room as spectator
   */
  joinRoomAsSpectator: (roomCode: string, spectatorName: string) => void

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
  isSpectator: false,
  spectators: [],

  // Game
  gameId: null,
  gameState: null,
  yourPlayerId: null,
  chatId: null,
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
    Logger.debug('[OnlineStore] Connecting to server...')

    // Connect socket
    socketService.connect()

    // Setup connection event handlers
    socketService.onConnect(() => {
      Logger.debug('[OnlineStore] Connected!')
      set({ isConnected: true, connectionError: null })
    })

    socketService.onDisconnect(() => {
      Logger.debug('[OnlineStore] Disconnected!')
      set({ isConnected: false })
    })

    socketService.onError((error) => {
      Logger.error('[OnlineStore] Connection error:', error)
      set({ connectionError: error.message })
    })

    // Setup game event handlers
    setupGameEventHandlers(set, get)
  },

  disconnect: () => {
    Logger.debug('[OnlineStore] Disconnecting...')
    socketService.disconnect()
    set({ isConnected: false })
  },

  // ========================================
  // ROOM ACTIONS
  // ========================================

  createRoom: (playerName: string) => {
    Logger.debug('[OnlineStore] Creating room...', playerName)
    set({ isLoading: true, gameError: null })

    socketService.emit('room:create', { playerName }, (response) => {
      set({ isLoading: false })

      if (response.success && response.roomCode) {
        Logger.debug('[OnlineStore] Room created:', response.roomCode)
        set({
          roomCode: response.roomCode,
          playerName,
          isHost: true,
          view: 'waiting',
        })
      } else {
        Logger.error('[OnlineStore] Failed to create room:', response.error)
        set({ gameError: response.error || 'Failed to create room' })
      }
    })
  },

  joinRoom: (roomCode: string, playerName: string) => {
    Logger.debug('[OnlineStore] Joining room...', roomCode, playerName)
    set({ isLoading: true, gameError: null })

    socketService.emit('room:join', { roomCode, playerName }, (response) => {
      set({ isLoading: false })

      if (response.success) {
        Logger.debug('[OnlineStore] Joined room:', roomCode)
        set({
          roomCode,
          playerName,
          isHost: false,
          isSpectator: false,
          view: 'waiting',
        })
      } else {
        Logger.error('[OnlineStore] Failed to join room:', response.error)
        set({ gameError: response.error || 'Failed to join room' })
      }
    })
  },

  joinRoomAsSpectator: (roomCode: string, spectatorName: string) => {
    Logger.debug('[OnlineStore] Joining room as spectator...', roomCode, spectatorName)
    set({ isLoading: true, gameError: null })

    socketService.emit('room:join-spectator', { roomCode, spectatorName }, (response) => {
      set({ isLoading: false })

      if (response.success) {
        Logger.debug('[OnlineStore] Joined room as spectator:', roomCode)
        set({
          roomCode,
          playerName: spectatorName,
          isHost: false,
          isSpectator: true,
          chatId: socketService.getSocketId() || null, // Use socket.id for spectator chat identification
          // If game already started, will receive game:started event
          // If waiting, will stay in waiting view
          view: 'waiting',
        })
      } else {
        Logger.error('[OnlineStore] Failed to join as spectator:', response.error)
        set({ gameError: response.error || 'Failed to join as spectator' })
      }
    })
  },

  ready: () => {
    const { roomCode } = get()
    if (!roomCode) return

    Logger.debug('[OnlineStore] Marking ready...')
    set({ isLoading: true, gameError: null })

    socketService.emit('room:ready', { roomCode }, (response) => {
      set({ isLoading: false })

      if (!response.success) {
        Logger.error('[OnlineStore] Failed to ready:', response.error)
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
    Logger.debug('[OnlineStore] makeMove called, gameId:', gameId, 'tiles:', placedTiles.length)

    if (!gameId) {
      Logger.error('[OnlineStore] ERROR: No gameId, cannot make move')
      return
    }

    if (!gameState) {
      Logger.error('[OnlineStore] ERROR: No gameState, cannot validate move')
      return
    }

    // Create temporary board instance from current game state for client-side validation
    const board = new Board()
    board.setGrid(gameState.board)

    // Validate move client-side
    const validator = new MoveValidator(board)
    const validation = validator.validateMove(placedTiles)

    Logger.debug('[OnlineStore] Client-side validation result:', validation)

    if (!validation.isValid) {
      Logger.error('[OnlineStore] Invalid move (client-side):', validation.reason)
      set({ gameError: validation.reason || 'Invalid move' })
      return
    }

    // Check if direction choice is needed
    if (validation.needsDirectionChoice && validation.horizontalOption && validation.verticalOption) {
      Logger.debug('[OnlineStore] Direction choice needed, showing dialog')
      get().showDirectionChoice(
        placedTiles,
        validation.horizontalOption.wordText,
        validation.verticalOption.wordText
      )
      return // Don't send to server yet, wait for user choice
    }

    Logger.debug('[OnlineStore] Socket connected:', socketService.isConnected())
    Logger.debug('[OnlineStore] Emitting game:make-move event...')
    set({ gameError: null })

    // Calculate time taken for this move
    const { turnStartTime } = get()
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:make-move', { gameId, placedTiles, timeTaken }, (response) => {
      Logger.debug('[OnlineStore] Received response from server:', response)
      if (!response.success) {
        Logger.error('[OnlineStore] Move failed:', response.error)
        set({ gameError: response.error || 'Invalid move' })
      } else {
        Logger.debug('[OnlineStore] Move accepted by server')
      }
      // Server will send game:state-update event if successful
    })
  },

  skipTurn: () => {
    const { gameId, turnStartTime } = get()
    if (!gameId) return

    Logger.debug('[OnlineStore] Skipping turn...')
    set({ gameError: null })

    // Calculate time taken for this turn
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:skip-turn', { gameId, timeTaken }, (response) => {
      if (!response.success) {
        Logger.error('[OnlineStore] Skip failed:', response.error)
        set({ gameError: response.error || 'Failed to skip turn' })
      }
      // Server will send game:state-update event
    })
  },

  exchangeTiles: (tileIds: string[]) => {
    const { gameId, turnStartTime } = get()
    if (!gameId) return

    Logger.debug('[OnlineStore] Exchanging tiles...', tileIds)
    set({ gameError: null })

    // Calculate time taken for this turn
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    socketService.emit('game:exchange-tiles', { gameId, tileIds, timeTaken }, (response) => {
      if (!response.success) {
        Logger.error('[OnlineStore] Exchange failed:', response.error)
        set({ gameError: response.error || 'Failed to exchange tiles' })
      }
      // Server will send game:state-update event
    })
  },

  challengeWord: () => {
    const { gameId } = get()
    if (!gameId) return

    Logger.debug('[OnlineStore] Challenging word...')
    set({ gameError: null })

    socketService.emit('game:challenge', { gameId }, (response) => {
      if (!response.success) {
        Logger.error('[OnlineStore] Challenge failed:', response.error)
        set({ gameError: response.error || 'Failed to challenge' })
      }
      // Server will send game:state-update event
    })
  },

  stealJoker: (row: number, col: number, replacementTileId: string) => {
    const { gameId } = get()
    if (!gameId) return

    Logger.debug('[OnlineStore] Stealing joker...', { row, col, replacementTileId })
    set({ gameError: null })

    socketService.emit('game:steal-joker', { gameId, row, col, replacementTileId }, (response) => {
      if (!response.success) {
        Logger.error('[OnlineStore] Steal failed:', response.error)
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

    Logger.debug('[OnlineStore] Force ending game (test mode)...')
    set({ gameError: null })

    socketService.emit('game:force-end', { gameId }, (response) => {
      if (!response.success) {
        Logger.error('[OnlineStore] Force end failed:', response.error)
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
      Logger.error('[OnlineStore] Cannot send message: not in a room')
      return
    }

    Logger.debug('[OnlineStore] Sending chat message:', message)
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
      Logger.error('No direction choice available')
      return
    }

    if (!gameId) {
      Logger.error('No gameId')
      return
    }

    const { placedTiles } = directionChoice
    const { turnStartTime } = get()

    // Clear the dialog
    set({ directionChoice: null, gameError: null })

    Logger.debug('[OnlineStore] Sending move with chosen direction:', direction)
    Logger.debug('[OnlineStore] Emitting game:make-move event with direction...')

    // Calculate time taken for this move
    const timeTaken = turnStartTime ? Date.now() - turnStartTime : 0

    // Send move to server with the chosen direction
    socketService.emit('game:make-move', { gameId, placedTiles, timeTaken, direction }, (response) => {
      Logger.debug('[OnlineStore] Received response from server:', response)
      if (!response.success) {
        Logger.error('[OnlineStore] Move failed:', response.error)
        set({ gameError: response.error || 'Invalid move' })
      } else {
        Logger.debug('[OnlineStore] Move accepted by server')
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
    Logger.debug('[OnlineStore] Resetting state and disconnecting...')
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
    Logger.debug('[OnlineStore] Player joined:', data.playerName)
    set({ opponentName: data.playerName })
  })

  // Spectator joined room
  socketService.on('room:spectator-joined', (data) => {
    Logger.debug('[OnlineStore] Spectator joined:', data.spectatorName)
    set({ spectators: data.spectators })
  })

  // Spectator left room
  socketService.on('room:spectator-left', (data) => {
    Logger.debug('[OnlineStore] Spectator left:', data.spectatorName)
    set({ spectators: data.spectators })
  })

  // Game started
  socketService.on('game:started', (data) => {
    Logger.debug('[OnlineStore] Game started!', data.gameId)

    // Check if it's your turn and set turnStartTime (only for players, not spectators)
    const isYourTurn = data.yourPlayerId && data.gameState.players[data.gameState.currentPlayerIndex].id === data.yourPlayerId

    // Set chatId: for players use yourPlayerId, for spectators use socket.id
    const chatId = data.yourPlayerId || socketService.getSocketId() || null

    set({
      gameId: data.gameId,
      gameState: data.gameState,
      yourPlayerId: data.yourPlayerId || null, // undefined for spectators
      chatId, // Use socket.id for spectators, yourPlayerId for players
      view: 'playing',
      turnStartTime: isYourTurn ? Date.now() : null,
    })
  })

  // Game state update
  socketService.on('game:state-update', (data) => {
    Logger.debug('[OnlineStore] State update received')
    Logger.debug('[OnlineStore] Game status:', data.gameState.status)

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
        Logger.debug('[OnlineStore] Long word bonus detected:', latestMove.scoreBreakdown.longWordBonus)
        get().showBonusFlash(latestMove.scoreBreakdown.longWordBonus)
      }
    }

    // Check if game is finished
    if (data.gameState.status === GameStatus.COMPLETED) {
      Logger.debug('[OnlineStore] Game completed! Setting view to finished')
      set({ view: 'finished' })
    }
  })

  // Opponent disconnected
  socketService.on('game:opponent-disconnected', () => {
    Logger.debug('[OnlineStore] Opponent disconnected!')
    set({ gameError: 'Opponent disconnected from game' })
  })

  // Opponent reconnected
  socketService.on('game:opponent-reconnected', () => {
    Logger.debug('[OnlineStore] Opponent reconnected!')
    set({ gameError: null })
  })

  // Game ended
  socketService.on('game:ended', (data) => {
    Logger.debug('[OnlineStore] Game ended!', data)
    set({ view: 'finished' })
  })

  // Chat message received
  socketService.on('chat:message', (chatMessage) => {
    Logger.debug('[OnlineStore] Chat message received:', chatMessage)
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

/**
 * Game Store (Zustand)
 *
 * Central state management for Kvizovka game.
 *
 * This store manages:
 * - Complete game state (board, players, tiles)
 * - Game actions (start, move, skip, exchange)
 * - Timer management
 * - Persistence (save/load)
 *
 * Using Zustand for simple, lightweight state management.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  GameState,
  GameMode,
  GameStatus,
  Player,
  Move,
  MoveType,
  PlacedTile,
  Tile,
  Board as BoardType,
} from '../types'
import {
  Board,
  TileBag,
  createTileBag,
  ScoreCalculator,
  MoveValidator,
  MoveValidationResult,
  WordValidator,
} from '../game-engine'
import { TILES_PER_PLAYER, DEFAULT_TIME_LIMIT } from '../constants'

/**
 * Game Store State
 *
 * This is the complete state of a Kvizovka game
 */
interface GameStoreState {
  // ========================================
  // GAME STATE
  // ========================================

  /**
   * Current game state (null if no game active)
   */
  game: GameState | null

  /**
   * Board instance (game engine)
   */
  boardInstance: Board | null

  /**
   * Tile bag instance (game engine)
   */
  tileBagInstance: TileBag | null

  /**
   * Currently selected tiles for placement
   * These are tiles the player is about to place
   */
  selectedTiles: PlacedTile[]

  /**
   * Last move validation result
   * Useful for showing errors to user
   */
  lastValidation: MoveValidationResult | null

  /**
   * Last played word (can be challenged by opponent)
   */
  lastPlayedWord: {
    word: string
    playerIndex: number
    moveIndex: number
  } | null

  /**
   * Timer interval ID (for stopping timer)
   */
  timerIntervalId: number | null

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Start a new game
   */
  startGame: (mode: GameMode, player1Name: string, player2Name: string) => void

  /**
   * Make a move (place tiles on board)
   */
  makeMove: (placedTiles: PlacedTile[]) => boolean

  /**
   * Skip current player's turn
   */
  skipTurn: () => void

  /**
   * Exchange tiles
   */
  exchangeTiles: (tilesToExchange: Tile[]) => boolean

  /**
   * Add tile to selection
   */
  selectTile: (tile: Tile, row: number, col: number) => void

  /**
   * Remove tile from selection
   */
  unselectTile: (row: number, col: number) => void

  /**
   * Clear all selected tiles
   */
  clearSelection: () => void

  /**
   * Set joker letter for a placed joker tile
   */
  setJokerLetter: (row: number, col: number, letter: string) => void

  /**
   * Challenge the last played word
   * Returns true if challenge successful (word was invalid), false if challenge failed (word was valid)
   */
  challengeLastWord: () => { success: boolean; word: string; reason: string } | null

  /**
   * End the current game
   */
  endGame: () => void

  /**
   * Start the game timer
   */
  startTimer: () => void

  /**
   * Stop the game timer
   */
  stopTimer: () => void

  /**
   * Pause the game
   */
  pauseGame: () => void

  /**
   * Resume the game
   */
  resumeGame: () => void

  /**
   * Reset store to initial state
   */
  reset: () => void
}

/**
 * Initial state factory
 *
 * Creates a fresh initial state
 */
const createInitialState = (): Pick<
  GameStoreState,
  'game' | 'boardInstance' | 'tileBagInstance' | 'selectedTiles' | 'lastValidation' | 'lastPlayedWord' | 'timerIntervalId'
> => ({
  game: null,
  boardInstance: null,
  tileBagInstance: null,
  selectedTiles: [],
  lastValidation: null,
  lastPlayedWord: null,
  timerIntervalId: null,
})

/**
 * Game Store
 *
 * Example usage:
 * ```typescript
 * const startGame = useGameStore((state) => state.startGame)
 * const game = useGameStore((state) => state.game)
 *
 * startGame(GameMode.LOCAL_MULTIPLAYER, 'Dragan', 'Nikola')
 * ```
 */
export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================
      ...createInitialState(),

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Start a new game
       */
      startGame: (mode: GameMode, player1Name: string, player2Name: string) => {
        // Initialize game engine instances
        const board = new Board()
        board.initialize()

        const tileBag = createTileBag()

        // Draw initial tiles for players
        const player1Tiles = tileBag.draw(TILES_PER_PLAYER)
        const player2Tiles = tileBag.draw(TILES_PER_PLAYER)

        // Create players
        const player1: Player = {
          id: 'player1',
          name: player1Name,
          isAI: false,
          tiles: player1Tiles,
          score: 0,
          timeRemaining: DEFAULT_TIME_LIMIT,
          timePenalties: 0,
          roundsPlayed: 0,
        }

        const player2: Player = {
          id: 'player2',
          name: player2Name,
          isAI: mode === GameMode.VS_AI,
          tiles: player2Tiles,
          score: 0,
          timeRemaining: DEFAULT_TIME_LIMIT,
          timePenalties: 0,
          roundsPlayed: 0,
        }

        // Create game state
        const gameState: GameState = {
          id: `game-${Date.now()}`,
          mode,
          status: GameStatus.IN_PROGRESS,
          board: board.getGrid(),
          tileBag: tileBag.peekTiles(),
          players: [player1, player2],
          currentPlayerIndex: 0,
          moveHistory: [],
          round: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          timerRunning: true,
        }

        set({
          game: gameState,
          boardInstance: board,
          tileBagInstance: tileBag,
          selectedTiles: [],
          lastValidation: null,
        })

        // Start timer
        get().startTimer()
      },

      /**
       * Make a move
       */
      makeMove: (placedTiles: PlacedTile[]): boolean => {
        const state = get()
        const { game, boardInstance } = state

        if (!game || !boardInstance) {
          console.error('No active game')
          return false
        }

        // Validate move
        const validator = new MoveValidator(boardInstance)
        const validation = validator.validateMove(placedTiles)

        set({ lastValidation: validation })

        if (!validation.isValid) {
          console.error('Invalid move:', validation.reason)
          return false
        }

        // Place tiles on board
        for (const placed of placedTiles) {
          boardInstance.setTile(placed.row, placed.col, placed.tile)
        }

        // Place blockers
        if (validation.direction) {
          boardInstance.placeBlockers(placedTiles, validation.direction)
        }

        // Calculate score
        const calculator = new ScoreCalculator()
        const scoreBreakdown = calculator.calculateMoveScore(
          validation.wordsFormed || [],
          placedTiles,
          placedTiles.length
        )

        // Update current player
        const currentPlayer = game.players[game.currentPlayerIndex]
        currentPlayer.score += scoreBreakdown.totalScore
        currentPlayer.roundsPlayed++

        // Remove used tiles from player's hand
        const usedTileIds = new Set(placedTiles.map((pt) => pt.tile.id))
        currentPlayer.tiles = currentPlayer.tiles.filter(
          (tile) => !usedTileIds.has(tile.id)
        )

        // Draw new tiles
        const newTiles = state.tileBagInstance!.draw(placedTiles.length)
        currentPlayer.tiles.push(...newTiles)

        // Create move record
        const move: Move = {
          playerId: currentPlayer.id,
          moveNumber: game.moveHistory.length + 1,
          type: MoveType.PLACE_TILES,
          placedTiles,
          formedWords: validation.wordsFormed?.map((squares) =>
            squares
              .map((sq) => {
                const tile = sq.tile
                if (tile && 'letter' in tile) {
                  return tile.isJoker && tile.jokerLetter
                    ? tile.jokerLetter
                    : tile.letter
                }
                return ''
              })
              .join('')
          ),
          score: scoreBreakdown.totalScore,
          timestamp: new Date(),
        }

        game.moveHistory.push(move)

        // Store last played word for challenge
        const lastPlayedWord = {
          word: validation.wordText || '',
          playerIndex: game.currentPlayerIndex,
          moveIndex: game.moveHistory.length - 1,
        }

        // Switch to next player
        game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0

        // Update state
        set({
          game: {
            ...game,
            board: boardInstance.getGrid(),
            tileBag: state.tileBagInstance!.peekTiles(),
            updatedAt: new Date(),
          },
          selectedTiles: [],
          lastPlayedWord, // Store for challenge
        })

        return true
      },

      /**
       * Skip turn
       */
      skipTurn: () => {
        const { game } = get()

        if (!game) {
          return
        }

        const currentPlayer = game.players[game.currentPlayerIndex]

        // Create skip move record
        const move: Move = {
          playerId: currentPlayer.id,
          moveNumber: game.moveHistory.length + 1,
          type: MoveType.SKIP,
          score: 0,
          timestamp: new Date(),
        }

        game.moveHistory.push(move)
        currentPlayer.roundsPlayed++

        // Switch to next player
        game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0

        set({
          game: { ...game, updatedAt: new Date() },
          selectedTiles: [],
        })
      },

      /**
       * Exchange tiles
       */
      exchangeTiles: (tilesToExchange: Tile[]): boolean => {
        const { game, tileBagInstance } = get()

        if (!game || !tileBagInstance) {
          return false
        }

        // Can't exchange if tile bag is empty
        if (tileBagInstance.isEmpty()) {
          console.error('Cannot exchange: tile bag is empty')
          return false
        }

        const currentPlayer = game.players[game.currentPlayerIndex]

        // Remove tiles from player's hand
        const exchangeIds = new Set(tilesToExchange.map((t) => t.id))
        currentPlayer.tiles = currentPlayer.tiles.filter(
          (tile) => !exchangeIds.has(tile.id)
        )

        // Return tiles to bag
        tileBagInstance.returnTiles(tilesToExchange)
        tileBagInstance.shuffle()

        // Draw new tiles
        const newTiles = tileBagInstance.draw(tilesToExchange.length)
        currentPlayer.tiles.push(...newTiles)

        // Create exchange move record
        const move: Move = {
          playerId: currentPlayer.id,
          moveNumber: game.moveHistory.length + 1,
          type: MoveType.EXCHANGE,
          score: 0,
          timestamp: new Date(),
        }

        game.moveHistory.push(move)
        currentPlayer.roundsPlayed++

        // Switch to next player
        game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0

        set({
          game: {
            ...game,
            tileBag: tileBagInstance.peekTiles(),
            updatedAt: new Date(),
          },
        })

        return true
      },

      /**
       * Select a tile for placement
       */
      selectTile: (tile: Tile, row: number, col: number) => {
        const { selectedTiles } = get()

        // Check if position already has a tile selected
        const existing = selectedTiles.find(
          (st) => st.row === row && st.col === col
        )

        if (existing) {
          // Replace existing tile at this position
          set({
            selectedTiles: [
              ...selectedTiles.filter((st) => st.row !== row || st.col !== col),
              { tile, row, col },
            ],
          })
        } else {
          // Add new tile
          set({
            selectedTiles: [...selectedTiles, { tile, row, col }],
          })
        }
      },

      /**
       * Unselect a tile
       *
       * Also resets joker letter if removing a joker tile.
       */
      unselectTile: (row: number, col: number) => {
        const { selectedTiles, game } = get()

        // Find the tile being removed
        const tileToRemove = selectedTiles.find(
          (st) => st.row === row && st.col === col
        )

        // If it's a joker, reset its letter in the player's hand
        if (tileToRemove && tileToRemove.tile.isJoker && game) {
          const currentPlayer = game.players[game.currentPlayerIndex]
          const tileInHand = currentPlayer.tiles.find((t) => t.id === tileToRemove.tile.id)

          if (tileInHand && tileInHand.isJoker) {
            tileInHand.jokerLetter = undefined
          }
        }

        set({
          selectedTiles: selectedTiles.filter(
            (st) => st.row !== row || st.col !== col
          ),
        })
      },

      /**
       * Clear all selected tiles
       *
       * Also resets joker letters when clearing.
       */
      clearSelection: () => {
        const { selectedTiles, game } = get()

        // Reset joker letters in player's hand
        if (game) {
          const currentPlayer = game.players[game.currentPlayerIndex]

          selectedTiles.forEach((st) => {
            if (st.tile.isJoker) {
              // Find the tile in player's hand and reset jokerLetter
              const tileInHand = currentPlayer.tiles.find((t) => t.id === st.tile.id)
              if (tileInHand && tileInHand.isJoker) {
                tileInHand.jokerLetter = undefined
              }
            }
          })
        }

        set({ selectedTiles: [] })
      },

      /**
       * Set joker letter for a placed joker tile
       *
       * This updates the jokerLetter property of a tile in selectedTiles
       * and also updates the tile in the player's hand.
       */
      setJokerLetter: (row: number, col: number, letter: string) => {
        const { selectedTiles, game } = get()

        if (!game) return

        // Find the tile in selectedTiles
        const selectedTile = selectedTiles.find(
          (st) => st.row === row && st.col === col
        )

        if (!selectedTile || !selectedTile.tile.isJoker) {
          return
        }

        // Update the tile in player's hand (this is the source of truth)
        const currentPlayer = game.players[game.currentPlayerIndex]
        const tileInHand = currentPlayer.tiles.find((t) => t.id === selectedTile.tile.id)

        if (tileInHand && tileInHand.isJoker) {
          tileInHand.jokerLetter = letter
        }

        // Update selectedTiles to trigger re-render
        set({
          selectedTiles: selectedTiles.map((st) =>
            st.row === row && st.col === col
              ? { ...st, tile: { ...st.tile, jokerLetter: letter } }
              : st
          ),
        })
      },

      /**
       * Challenge the last played word
       *
       * In Kvizovka, words are not automatically validated against the dictionary.
       * Instead, the opponent can challenge the word after it's played.
       *
       * If the challenge is successful (word is invalid):
       * - The move is undone
       * - The player who played the word loses their turn
       *
       * If the challenge fails (word is valid):
       * - The challenger is penalized 3 minutes from their time
       * - The move stands
       */
      challengeLastWord: () => {
        const { lastPlayedWord, game } = get()

        if (!lastPlayedWord || !game) {
          return null
        }

        // Validate the word against dictionary
        const wordValidator = new WordValidator()
        const validation = wordValidator.validateWord(lastPlayedWord.word)

        const result = {
          success: !validation.isValid,
          word: lastPlayedWord.word,
          reason: validation.reason || (validation.isValid ? 'Word is valid' : 'Word is invalid'),
        }

        if (result.success) {
          // Challenge successful - word is invalid
          // TODO: Undo the last move (remove tiles, restore player's hand, revert score)
          console.log('Challenge successful! Word was invalid:', lastPlayedWord.word)

          // Clear the last played word
          set({ lastPlayedWord: null })
        } else {
          // Challenge failed - word is valid
          // Penalize challenger by reducing their time by 3 minutes (180 seconds)
          const currentPlayer = game.players[game.currentPlayerIndex]
          currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - 180)

          console.log(`Challenge failed! Word "${lastPlayedWord.word}" is valid. Challenger penalized 3 minutes.`)

          // Clear the last played word and update game state
          set({
            lastPlayedWord: null,
            game: {
              ...game,
              updatedAt: new Date(),
            },
          })
        }

        return result
      },

      /**
       * End the current game
       */
      endGame: () => {
        const { game, boardInstance, stopTimer } = get()

        if (!game) {
          return
        }

        // Stop timer
        stopTimer()

        // Calculate final scores (subtract unused tiles)
        const calculator = new ScoreCalculator()

        for (const player of game.players) {
          const finalScore = calculator.calculateFinalScore(
            player.score,
            player.tiles
          )
          player.score = finalScore
        }

        // Determine winner
        const [player1, player2] = game.players
        let winner: string | undefined

        if (player1.score > player2.score) {
          winner = player1.id
        } else if (player2.score > player1.score) {
          winner = player2.id
        }
        // else: tie, winner remains undefined

        set({
          game: {
            ...game,
            status: GameStatus.COMPLETED,
            winner,
            timerRunning: false,
            updatedAt: new Date(),
          },
        })
      },

      /**
       * Start timer
       */
      startTimer: () => {
        const { timerIntervalId, stopTimer } = get()

        // Stop existing timer if any
        if (timerIntervalId !== null) {
          stopTimer()
        }

        // Start new timer (tick every second)
        const intervalId = window.setInterval(() => {
          const { game } = get()

          if (!game || !game.timerRunning) {
            return
          }

          const currentPlayer = game.players[game.currentPlayerIndex]

          // Decrease time by 1 second (1000ms)
          currentPlayer.timeRemaining = Math.max(
            0,
            currentPlayer.timeRemaining - 1000
          )

          // Check if time expired
          if (currentPlayer.timeRemaining === 0) {
            get().stopTimer()
            get().endGame()
          }

          // Update state
          set({
            game: { ...game, updatedAt: new Date() },
          })
        }, 1000)

        set({ timerIntervalId: intervalId })
      },

      /**
       * Stop timer
       */
      stopTimer: () => {
        const { timerIntervalId } = get()

        if (timerIntervalId !== null) {
          clearInterval(timerIntervalId)
          set({ timerIntervalId: null })
        }
      },

      /**
       * Pause game
       */
      pauseGame: () => {
        const { game, stopTimer } = get()

        if (!game) {
          return
        }

        stopTimer()

        set({
          game: {
            ...game,
            status: GameStatus.PAUSED,
            timerRunning: false,
            updatedAt: new Date(),
          },
        })
      },

      /**
       * Resume game
       */
      resumeGame: () => {
        const { game, startTimer } = get()

        if (!game) {
          return
        }

        set({
          game: {
            ...game,
            status: GameStatus.IN_PROGRESS,
            timerRunning: true,
            updatedAt: new Date(),
          },
        })

        startTimer()
      },

      /**
       * Reset store
       */
      reset: () => {
        const { stopTimer } = get()
        stopTimer()
        set(createInitialState())
      },
    }),
    {
      name: 'kvizovka-game-storage', // localStorage key
      partialize: (state) => ({
        // Only persist game state, not instances or intervals
        game: state.game,
        selectedTiles: state.selectedTiles,
      }),
    }
  )
)

/**
 * Example Usage:
 *
 * ```typescript
 * import { useGameStore } from './store/gameStore'
 * import { GameMode } from './types'
 *
 * function GameComponent() {
 *   // Subscribe to specific state
 *   const game = useGameStore((state) => state.game)
 *   const startGame = useGameStore((state) => state.startGame)
 *   const makeMove = useGameStore((state) => state.makeMove)
 *
 *   // Start a new game
 *   const handleStartGame = () => {
 *     startGame(GameMode.LOCAL_MULTIPLAYER, 'Player 1', 'Player 2')
 *   }
 *
 *   // Make a move
 *   const handlePlayWord = () => {
 *     const success = makeMove(selectedTiles)
 *     if (success) {
 *       console.log('Move accepted!')
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       {!game ? (
 *         <button onClick={handleStartGame}>Start Game</button>
 *       ) : (
 *         <div>
 *           <p>Current Player: {game.players[game.currentPlayerIndex].name}</p>
 *           <p>Score: {game.players[game.currentPlayerIndex].score}</p>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

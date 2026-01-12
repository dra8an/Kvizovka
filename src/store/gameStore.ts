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
  BoardSquare,
  Direction,
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
   * Real-time placement validation
   * Runs validation on selectedTiles in real-time as player places tiles
   * Used for visual feedback (green/amber/gray tiles)
   */
  placementValidation: MoveValidationResult | null

  /**
   * Last played word (can be challenged by opponent)
   */
  lastPlayedWord: {
    word: string
    playerIndex: number
    moveIndex: number
  } | null

  /**
   * Exchange mode state
   * When true, player is selecting tiles to exchange
   */
  isExchangeMode: boolean

  /**
   * Tiles selected for exchange
   */
  tilesForExchange: Tile[]

  /**
   * Currently dragged tile (for visual feedback during drag-and-drop)
   */
  draggedTile: Tile | null

  /**
   * Square currently being hovered during drag (for visual feedback)
   */
  hoveredSquare: { row: number; col: number } | null

  /**
   * Timer interval ID (for stopping timer)
   */
  timerIntervalId: number | null

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
      word: BoardSquare[]
      wordText: string
      direction: Direction
    }
    verticalOption: {
      word: BoardSquare[]
      wordText: string
      direction: Direction
    }
  } | null

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
   * Enter exchange mode
   * Returns false if exchange is not allowed (e.g., last move was also an exchange)
   */
  enterExchangeMode: () => boolean

  /**
   * Exit exchange mode
   */
  exitExchangeMode: () => void

  /**
   * Toggle tile selection for exchange
   */
  toggleTileForExchange: (tile: Tile) => void

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
   * Steal a joker from the board by replacing it with a matching letter tile
   * Returns true if successful, false if stealing is not allowed
   */
  stealJoker: (row: number, col: number, replacementTile: Tile) => boolean

  /**
   * Set the currently dragged tile (for visual feedback)
   */
  setDraggedTile: (tile: Tile | null) => void

  /**
   * Set the currently hovered square during drag (for visual feedback)
   */
  setHoveredSquare: (square: { row: number; col: number } | null) => void

  /**
   * Validate current placement in real-time
   * Called automatically after selectTile/unselectTile/setJokerLetter
   * Updates placementValidation state for visual feedback
   */
  validateCurrentPlacement: () => void

  /**
   * Reorder tiles in current player's hand
   */
  reorderPlayerTiles: (fromIndex: number, toIndex: number) => void

  /**
   * Challenge the last played word
   * Returns true if challenge successful (word was invalid), false if challenge failed (word was valid)
   */
  challengeLastWord: () => { success: boolean; word: string; reason: string } | null

  /**
   * Check if game should automatically end
   */
  checkGameEndConditions: () => void

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
    horizontalOption: { word: BoardSquare[]; wordText: string; direction: Direction },
    verticalOption: { word: BoardSquare[]; wordText: string; direction: Direction }
  ) => void

  /**
   * Make move with chosen direction (after user selects from dialog)
   */
  makeMoveWithDirection: (direction: Direction) => boolean

  /**
   * Cancel direction choice dialog
   */
  cancelDirectionChoice: () => void

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
  'game' | 'boardInstance' | 'tileBagInstance' | 'selectedTiles' | 'lastValidation' | 'placementValidation' | 'lastPlayedWord' | 'isExchangeMode' | 'tilesForExchange' | 'draggedTile' | 'hoveredSquare' | 'timerIntervalId' | 'bonusFlash' | 'directionChoice'
> => ({
  game: null,
  boardInstance: null,
  tileBagInstance: null,
  selectedTiles: [],
  lastValidation: null,
  placementValidation: null,
  lastPlayedWord: null,
  isExchangeMode: false,
  tilesForExchange: [],
  draggedTile: null,
  hoveredSquare: null,
  timerIntervalId: null,
  bonusFlash: null,
  directionChoice: null,
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
        const { game, boardInstance, tileBagInstance } = state

        if (!game || !boardInstance || !tileBagInstance) {
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

        // Check if direction choice is needed
        if (validation.needsDirectionChoice && validation.horizontalOption && validation.verticalOption) {
          console.log('🔀 Direction choice needed')
          get().showDirectionChoice(
            placedTiles,
            validation.horizontalOption,
            validation.verticalOption
          )
          return true // Don't proceed with move yet, wait for user choice
        }

        // Place tiles on board
        for (const placed of placedTiles) {
          boardInstance.setTile(placed.row, placed.col, placed.tile)
        }

        // Place blockers around the main word (including reused letters)
        if (validation.direction && validation.wordsFormed && validation.wordsFormed.length > 0) {
          const mainWord = validation.wordsFormed[0] // First word is the main word
          console.log('🔲 Placing blockers for main word:', {
            direction: validation.direction,
            wordLength: mainWord.length,
            positions: mainWord.map(sq => `(${sq.row},${sq.col})`).join(', ')
          })
          boardInstance.placeBlockers(mainWord, validation.direction)
        }

        // Calculate score (premium squares are still unmarked, so multipliers apply)
        const calculator = new ScoreCalculator()

        // Check if this is the first move of the game (empty move history)
        const isFirstMove = game.moveHistory.length === 0

        // Calculate how many tiles player will have left after drawing new tiles
        const currentPlayer = game.players[game.currentPlayerIndex]
        const tilesDrawn = Math.min(placedTiles.length, tileBagInstance.remaining())
        const tilesRemainingAfterMove = currentPlayer.tiles.length - placedTiles.length + tilesDrawn

        const scoreBreakdown = calculator.calculateMoveScore(
          validation.wordsFormed || [],
          placedTiles,
          placedTiles.length,
          isFirstMove,
          tilesRemainingAfterMove
        )

        // Show bonus flash if long word bonus awarded
        if (scoreBreakdown.longWordBonus > 0) {
          get().showBonusFlash(scoreBreakdown.longWordBonus)
        }

        // Mark premium squares as used (AFTER scoring, so multipliers don't apply again)
        boardInstance.markSquaresAsUsed(placedTiles)

        // Update current player score
        currentPlayer.score += scoreBreakdown.totalScore

        // Remove used tiles from player's hand
        const usedTileIds = new Set(placedTiles.map((pt) => pt.tile.id))
        currentPlayer.tiles = currentPlayer.tiles.filter(
          (tile) => !usedTileIds.has(tile.id)
        )

        // Draw new tiles (but not if this is the player's 10th round)
        let newTiles: any[] = []
        if (currentPlayer.roundsPlayed < 9) {
          newTiles = state.tileBagInstance!.draw(placedTiles.length)
          currentPlayer.tiles.push(...newTiles)
        }

        // Increment rounds AFTER tile drawing
        currentPlayer.roundsPlayed++

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
          drawnTileIds: newTiles.map((t) => t.id), // Track drawn tiles for undo
          timestamp: new Date(),
        }

        game.moveHistory.push(move)

        // Store last played word for challenge
        const lastPlayedWord = {
          word: validation.wordText || '',
          playerIndex: game.currentPlayerIndex,
          moveIndex: game.moveHistory.length - 1,
        }

        // Track jokers played in this move (for stealing next turn)
        const stealableJokers = placedTiles
          .filter(pt => pt.tile.isJoker && pt.tile.jokerLetter)
          .map(pt => ({
            row: pt.row,
            col: pt.col,
            assignedLetter: pt.tile.jokerLetter!
          }))

        // Switch to next player
        game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0

        // Update state
        set({
          game: {
            ...game,
            board: boardInstance.getGrid(),
            tileBag: state.tileBagInstance!.peekTiles(),
            updatedAt: new Date(),
            stealableJokers: stealableJokers.length > 0 ? stealableJokers : undefined,
          },
          selectedTiles: [],
          lastPlayedWord, // Store for challenge
        })

        // Check if game should end
        get().checkGameEndConditions()

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
          game: { ...game, updatedAt: new Date(), stealableJokers: undefined },
          selectedTiles: [],
        })

        // Check if game should end
        get().checkGameEndConditions()
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

        // Draw new tiles (but not if this is the player's 10th round)
        if (currentPlayer.roundsPlayed < 9) {
          const newTiles = tileBagInstance.draw(tilesToExchange.length)
          currentPlayer.tiles.push(...newTiles)
        }

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
            stealableJokers: undefined,
          },
          isExchangeMode: false,
          tilesForExchange: [],
        })

        // Check if game should end
        get().checkGameEndConditions()

        return true
      },

      /**
       * Enter exchange mode
       *
       * Allows player to select tiles to exchange.
       * Returns false if exchange is not allowed (e.g., last move was also an exchange).
       */
      enterExchangeMode: (): boolean => {
        const { game } = get()

        if (!game) {
          return false
        }

        // Check if current player's last move was an exchange
        const currentPlayerId = game.players[game.currentPlayerIndex].id

        // Find the last move by this player
        const playerMoves = game.moveHistory.filter(move => move.playerId === currentPlayerId)
        const lastPlayerMove = playerMoves[playerMoves.length - 1]

        if (lastPlayerMove && lastPlayerMove.type === MoveType.EXCHANGE) {
          console.error('Cannot exchange tiles two moves in a row')
          return false
        }

        // Clear any placed tiles first
        get().clearSelection()

        set({
          isExchangeMode: true,
          tilesForExchange: [],
        })

        return true
      },

      /**
       * Exit exchange mode
       *
       * Cancel tile exchange and return to normal mode.
       */
      exitExchangeMode: () => {
        set({
          isExchangeMode: false,
          tilesForExchange: [],
        })
      },

      /**
       * Toggle tile selection for exchange
       *
       * Add or remove a tile from the exchange selection.
       */
      toggleTileForExchange: (tile: Tile) => {
        const { tilesForExchange } = get()

        const isAlreadySelected = tilesForExchange.some((t) => t.id === tile.id)

        if (isAlreadySelected) {
          // Remove from selection
          set({
            tilesForExchange: tilesForExchange.filter((t) => t.id !== tile.id),
          })
        } else {
          // Add to selection
          set({
            tilesForExchange: [...tilesForExchange, tile],
          })
        }
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

        // Validate placement in real-time for visual feedback
        get().validateCurrentPlacement()
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

        // Validate placement in real-time for visual feedback
        get().validateCurrentPlacement()
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

        set({ selectedTiles: [], placementValidation: null })
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

        // Validate placement in real-time for visual feedback
        get().validateCurrentPlacement()
      },

      /**
       * Steal a joker from the board
       */
      stealJoker: (row: number, col: number, replacementTile: Tile): boolean => {
        const { game, boardInstance } = get()

        if (!game || !boardInstance) {
          console.log('[stealJoker] No game or board instance')
          return false
        }

        // Check if there are stealable jokers
        if (!game.stealableJokers || game.stealableJokers.length === 0) {
          console.log('[stealJoker] No stealable jokers available')
          return false
        }

        // Check if this position has a stealable joker
        const stealableJoker = game.stealableJokers.find(
          (j) => j.row === row && j.col === col
        )

        if (!stealableJoker) {
          console.log('[stealJoker] Position does not have a stealable joker')
          return false
        }

        // Check if replacement tile's letter matches the joker's assigned letter
        if (replacementTile.letter !== stealableJoker.assignedLetter) {
          console.log('[stealJoker] Replacement tile letter does not match joker letter')
          return false
        }

        // Get current player
        const currentPlayer = game.players[game.currentPlayerIndex]

        // Check if player has the replacement tile
        const tileIndex = currentPlayer.tiles.findIndex((t) => t.id === replacementTile.id)
        if (tileIndex === -1) {
          console.log('[stealJoker] Player does not have replacement tile')
          return false
        }

        // Get the joker from the board
        const square = boardInstance.getSquare(row, col)
        const squareTile = square.tile

        // Check if the tile exists and is a joker (not a blocker)
        if (!squareTile || !('isJoker' in squareTile) || !squareTile.isJoker) {
          console.log('[stealJoker] No joker at specified position')
          return false
        }

        const stolenJoker = squareTile

        // Remove replacement tile from player's hand
        currentPlayer.tiles.splice(tileIndex, 1)

        // Add stolen joker to player's hand (reset its jokerLetter)
        const resetJoker = { ...stolenJoker, jokerLetter: undefined }
        currentPlayer.tiles.push(resetJoker)

        // Replace the joker on the board with the replacement tile
        boardInstance.setTile(row, col, replacementTile)

        // Update game state and clear stealable jokers (joker has been stolen)
        set({
          game: {
            ...game,
            board: boardInstance.getGrid(),
            updatedAt: new Date(),
            stealableJokers: undefined,
          },
        })

        console.log('[stealJoker] Successfully stole joker at', row, col)
        return true
      },

      /**
       * Set the currently dragged tile
       *
       * Used for visual feedback during drag-and-drop operations.
       */
      setDraggedTile: (tile: Tile | null) => {
        set({ draggedTile: tile })
      },

      /**
       * Set the currently hovered square
       *
       * Used for visual feedback on the dragged tile during drag-and-drop.
       */
      setHoveredSquare: (square: { row: number; col: number } | null) => {
        set({ hoveredSquare: square })
      },

      /**
       * Validate current placement in real-time
       *
       * Runs MoveValidator on selectedTiles to provide real-time visual feedback.
       * Updates placementValidation state with validation result.
       * Called automatically after selectTile, unselectTile, setJokerLetter.
       */
      validateCurrentPlacement: () => {
        const { selectedTiles, game, boardInstance } = get()

        // No validation if no game or no tiles placed
        if (!game || !boardInstance || selectedTiles.length === 0) {
          set({ placementValidation: null })
          return
        }

        // Run validation (same logic as makeMove but without side effects)
        const validator = new MoveValidator(boardInstance)
        const result = validator.validateMove(selectedTiles)

        // Store validation result for visual feedback
        set({ placementValidation: result })
      },

      /**
       * Reorder tiles in current player's hand
       *
       * This allows players to rearrange their tiles in the rack for better organization.
       */
      reorderPlayerTiles: (fromIndex: number, toIndex: number) => {
        const { game, selectedTiles } = get()

        if (!game) return

        const currentPlayer = game.players[game.currentPlayerIndex]

        // Get tiles that are currently available in the rack (not placed on board)
        const selectedTileIds = new Set(selectedTiles.map((st) => st.tile.id))
        const availableTiles = currentPlayer.tiles.filter(
          (tile) => !selectedTileIds.has(tile.id)
        )

        // Validate indices
        if (fromIndex < 0 || fromIndex >= availableTiles.length ||
            toIndex < 0 || toIndex >= availableTiles.length) {
          return
        }

        // Remove tile from old position
        const [movedTile] = availableTiles.splice(fromIndex, 1)

        // Insert at new position
        availableTiles.splice(toIndex, 0, movedTile)

        // Reconstruct the full tiles array (placed tiles + reordered available tiles)
        const placedTiles = currentPlayer.tiles.filter((tile) =>
          selectedTileIds.has(tile.id)
        )

        currentPlayer.tiles = [...availableTiles, ...placedTiles]

        set({
          game: { ...game, updatedAt: new Date() },
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
        const state = get()
        const { lastPlayedWord, game, boardInstance } = state

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
          console.log('Challenge successful! Word was invalid:', lastPlayedWord.word)

          // Get the invalid move from history
          const invalidMove = game.moveHistory[lastPlayedWord.moveIndex]
          if (!invalidMove || invalidMove.type !== MoveType.PLACE_TILES) {
            console.error('Cannot undo: invalid move not found or not a tile placement')
            set({ lastPlayedWord: null })
            return result
          }

          // Get the player who made the invalid move
          const challengedPlayerIndex = lastPlayedWord.playerIndex
          const challengedPlayer = game.players[challengedPlayerIndex]

          // 1. Deduct points from challenged player's score
          challengedPlayer.score -= invalidMove.score
          console.log(`Deducted ${invalidMove.score} points from ${challengedPlayer.name}`)

          // 2. Remove tiles from board and blockers
          if (invalidMove.placedTiles && boardInstance) {
            for (const placed of invalidMove.placedTiles) {
              // Remove tile from board
              boardInstance.setTile(placed.row, placed.col, null)

              // Unmark the square as used (restore premium field)
              const square = boardInstance.getSquare(placed.row, placed.col)
              if (square) {
                square.isUsed = false
              }
            }

            // Remove blockers (they were placed around the main word)
            // Note: Blockers were placed by placeBlockers() in makeMove
            // We need to find and remove them based on the word direction
            const validation = state.lastValidation
            if (validation && validation.direction && validation.wordsFormed && validation.wordsFormed.length > 0) {
              const mainWord = validation.wordsFormed[0]

              // Remove blockers at start and end of word
              if (validation.direction === 'HORIZONTAL') {
                const startRow = mainWord[0].row
                const startCol = mainWord[0].col - 1
                const endCol = mainWord[mainWord.length - 1].col + 1

                // Remove start blocker (if not at edge)
                if (startCol >= 0) {
                  const startSquare = boardInstance.getSquare(startRow, startCol)
                  if (startSquare && startSquare.tile && 'type' in startSquare.tile && startSquare.tile.type === 'BLOCKER') {
                    boardInstance.setTile(startRow, startCol, null)
                  }
                }

                // Remove end blocker (if not at edge)
                if (endCol < 17) {
                  const endSquare = boardInstance.getSquare(startRow, endCol)
                  if (endSquare && endSquare.tile && 'type' in endSquare.tile && endSquare.tile.type === 'BLOCKER') {
                    boardInstance.setTile(startRow, endCol, null)
                  }
                }
              } else {
                // Vertical
                const startRow = mainWord[0].row - 1
                const startCol = mainWord[0].col
                const endRow = mainWord[mainWord.length - 1].row + 1

                // Remove start blocker (if not at edge)
                if (startRow >= 0) {
                  const startSquare = boardInstance.getSquare(startRow, startCol)
                  if (startSquare && startSquare.tile && 'type' in startSquare.tile && startSquare.tile.type === 'BLOCKER') {
                    boardInstance.setTile(startRow, startCol, null)
                  }
                }

                // Remove end blocker (if not at edge)
                if (endRow < 17) {
                  const endSquare = boardInstance.getSquare(endRow, startCol)
                  if (endSquare && endSquare.tile && 'type' in endSquare.tile && endSquare.tile.type === 'BLOCKER') {
                    boardInstance.setTile(endRow, startCol, null)
                  }
                }
              }
            }
          }

          // 3. Remove tiles that were drawn after the invalid move
          if (invalidMove.drawnTileIds && invalidMove.drawnTileIds.length > 0) {
            const drawnTileIds = new Set(invalidMove.drawnTileIds)
            challengedPlayer.tiles = challengedPlayer.tiles.filter(
              (tile) => !drawnTileIds.has(tile.id)
            )
            console.log(`Removed ${invalidMove.drawnTileIds.length} tiles that were drawn during invalid move`)
          }

          // 4. Return placed tiles to challenged player's hand
          if (invalidMove.placedTiles) {
            const tilesToReturn = invalidMove.placedTiles.map(pt => pt.tile)
            challengedPlayer.tiles.push(...tilesToReturn)
            console.log(`Returned ${tilesToReturn.length} tiles to ${challengedPlayer.name}'s hand`)
          }

          // 5. Remove the move from history
          game.moveHistory.splice(lastPlayedWord.moveIndex, 1)

          // 6. Decrement challenged player's rounds played
          challengedPlayer.roundsPlayed = Math.max(0, challengedPlayer.roundsPlayed - 1)

          // 7. Switch turn back to challenged player (they get to play again)
          game.currentPlayerIndex = challengedPlayerIndex as 0 | 1
          console.log(`Turn switched back to ${challengedPlayer.name}`)

          // Update game state
          set({
            lastPlayedWord: null,
            game: {
              ...game,
              board: boardInstance!.getGrid(),
              updatedAt: new Date(),
            },
          })

          // Check if game should end (turn was given back to challenged player)
          get().checkGameEndConditions()
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
       * Check if game should automatically end
       *
       * Game ends when:
       * 1. Both players have completed 10 rounds
       * 2. Tile bag is empty AND current player has no valid moves
       * 3. Time runs out (handled in timer)
       */
      checkGameEndConditions: () => {
        const { game, tileBagInstance } = get()

        if (!game || game.status !== GameStatus.IN_PROGRESS) {
          return
        }

        const [player1, player2] = game.players

        // Condition 1: Both players completed 10 rounds
        if (player1.roundsPlayed >= 10 && player2.roundsPlayed >= 10) {
          console.log('Game ending: Both players completed 10 rounds')
          game.endReason = 'rounds_completed'
          get().endGame()
          return
        }

        // Condition 2: Tile bag is empty AND current player cannot make a move
        // (This is a stalemate condition - player has no tiles and can't draw more)
        if (tileBagInstance && tileBagInstance.isEmpty()) {
          const currentPlayer = game.players[game.currentPlayerIndex]

          // If current player has no tiles, they can't make a move
          if (currentPlayer.tiles.length === 0) {
            console.log('Game ending: Tile bag empty and current player has no tiles')
            game.endReason = 'no_tiles'
            get().endGame()
            return
          }
        }

        // Note: Time expiration is handled in the timer interval
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
          // Calculate penalty
          let penalty = 0
          for (const tile of player.tiles) {
            if (tile.isJoker) {
              penalty += 10 // Joker penalty
            } else {
              penalty += tile.value
            }
          }

          // Store penalty for UI display
          player.tilePenalty = penalty

          // Apply penalty to score
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
            game.endReason = 'time_expired'
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
       * Show bonus flash overlay
       */
      showBonusFlash: (bonus: number) => {
        if (bonus > 0) {
          set({ bonusFlash: bonus })
        }
      },

      /**
       * Clear bonus flash overlay
       */
      clearBonusFlash: () => {
        set({ bonusFlash: null })
      },

      /**
       * Show direction choice dialog
       */
      showDirectionChoice: (placedTiles, horizontalOption, verticalOption) => {
        set({
          directionChoice: {
            placedTiles,
            horizontalOption,
            verticalOption,
          },
        })
      },

      /**
       * Make move with chosen direction
       */
      makeMoveWithDirection: (direction: Direction): boolean => {
        const state = get()
        const { directionChoice, boardInstance } = state

        if (!directionChoice || !boardInstance) {
          console.error('No direction choice or board instance')
          return false
        }

        const { placedTiles } = directionChoice

        // Validate with forced direction
        const validator = new MoveValidator(boardInstance)
        const validation = validator.validateMove(placedTiles, direction)

        // Clear the dialog
        set({ directionChoice: null })

        if (!validation.isValid) {
          console.error('Invalid move with direction:', validation.reason)
          return false
        }

        // Proceed with the move (reuse makeMove logic by calling it with the validation result)
        // Instead of calling makeMove again, we'll directly continue with the rest of the move logic
        const { game, tileBagInstance } = state

        if (!game || !tileBagInstance) {
          console.error('No active game')
          return false
        }

        set({ lastValidation: validation })

        // Place tiles on board
        for (const placed of placedTiles) {
          boardInstance.setTile(placed.row, placed.col, placed.tile)
        }

        // Place blockers around the main word
        if (validation.direction && validation.wordsFormed && validation.wordsFormed.length > 0) {
          const mainWord = validation.wordsFormed[0]
          console.log('🔲 Placing blockers for main word:', {
            direction: validation.direction,
            wordLength: mainWord.length,
            positions: mainWord.map(sq => `(${sq.row},${sq.col})`).join(', ')
          })
          boardInstance.placeBlockers(mainWord, validation.direction)
        }

        // Calculate score
        const calculator = new ScoreCalculator()
        const isFirstMove = game.moveHistory.length === 0
        const currentPlayer = game.players[game.currentPlayerIndex]
        const tilesDrawn = Math.min(placedTiles.length, tileBagInstance.remaining())
        const tilesRemainingAfterMove = currentPlayer.tiles.length - placedTiles.length + tilesDrawn

        const scoreBreakdown = calculator.calculateMoveScore(
          validation.wordsFormed || [],
          placedTiles,
          placedTiles.length,
          isFirstMove,
          tilesRemainingAfterMove
        )

        // Show bonus flash if long word bonus awarded
        if (scoreBreakdown.longWordBonus > 0) {
          get().showBonusFlash(scoreBreakdown.longWordBonus)
        }

        // Mark premium squares as used
        boardInstance.markSquaresAsUsed(placedTiles)

        // Update current player score
        currentPlayer.score += scoreBreakdown.totalScore

        // Remove used tiles from player's hand
        const usedTileIds = new Set(placedTiles.map((pt) => pt.tile.id))
        currentPlayer.tiles = currentPlayer.tiles.filter(
          (tile) => !usedTileIds.has(tile.id)
        )

        // Draw new tiles
        let newTiles: any[] = []
        if (currentPlayer.roundsPlayed < 9) {
          newTiles = tileBagInstance.draw(placedTiles.length)
          currentPlayer.tiles.push(...newTiles)
        }

        // Increment rounds
        currentPlayer.roundsPlayed++

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
          drawnTileIds: newTiles.map((t) => t.id), // Track drawn tiles for undo
          timestamp: new Date(),
        }

        game.moveHistory.push(move)

        // Set last played word for challenge
        if (validation.wordText) {
          set({
            lastPlayedWord: {
              word: validation.wordText,
              playerIndex: game.currentPlayerIndex,
              moveIndex: game.moveHistory.length - 1,
            },
          })
        }

        // Clear selected tiles
        set({ selectedTiles: [] })

        // Switch to next player
        game.currentPlayerIndex = ((game.currentPlayerIndex + 1) % game.players.length) as 0 | 1

        // Update state
        set({
          game: {
            ...game,
            board: boardInstance.getGrid(),
            tileBag: state.tileBagInstance!.peekTiles(),
            updatedAt: new Date(),
          },
          selectedTiles: [],
        })

        // Check if game should end
        get().checkGameEndConditions()

        return true
      },

      /**
       * Cancel direction choice dialog
       */
      cancelDirectionChoice: () => {
        set({ directionChoice: null })
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
        isExchangeMode: state.isExchangeMode,
        tilesForExchange: state.tilesForExchange,
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

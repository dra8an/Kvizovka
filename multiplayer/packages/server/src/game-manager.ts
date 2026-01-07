/**
 * Game Manager
 *
 * Server-authoritative game state management.
 *
 * This is the MOST IMPORTANT security component:
 * - Validates ALL moves on the server
 * - Calculates ALL scores on the server
 * - Hides opponent tiles and tile bag from clients
 * - Prevents cheating by never trusting client input
 */

import {
  GameState,
  GameMode,
  GameStatus,
  Player,
  PlacedTile,
  Tile,
  Board,
  TileBag,
  createTileBag,
  MoveValidator,
  ScoreCalculator,
  WordValidator,
  MoveType,
  TILES_PER_PLAYER,
  DEFAULT_TIME_LIMIT,
} from '@kvizovka/shared'
import { v4 as uuidv4 } from 'uuid'

/**
 * Server Game State
 *
 * This is the FULL game state stored on the server.
 * Clients receive a SANITIZED version without opponent tiles/tile bag.
 */
interface ServerGameState extends GameState {
  /**
   * Full tile bag (NEVER sent to clients)
   */
  tileBagInstance: TileBag
}

/**
 * Move Result
 */
interface MoveResult {
  success: boolean
  error?: string
  gameState?: GameState
}

/**
 * Challenge Result
 */
interface ChallengeResult {
  success: boolean
  challengeSucceeded?: boolean
  error?: string
  gameState?: GameState
}

/**
 * Game Manager Class
 *
 * Manages all active games with server-authoritative state.
 */
export class GameManager {
  /**
   * Map of game ID → Server game state
   */
  private games: Map<string, ServerGameState> = new Map()

  /**
   * Word validator instance (shared across all games)
   */
  private wordValidator: WordValidator

  /**
   * Constructor
   *
   * @param wordValidator - Word validator with loaded dictionary
   */
  constructor(wordValidator: WordValidator) {
    this.wordValidator = wordValidator
  }

  /**
   * Create a new game
   *
   * @param player1Name - First player's name
   * @param player2Name - Second player's name
   * @returns Game ID and initial game state
   */
  createGame(player1Name: string, player2Name: string): { gameId: string; gameState: GameState } {
    const gameId = uuidv4()

    // Create tile bag
    const tileBag = createTileBag()

    // Create players
    const player1: Player = {
      id: uuidv4(),
      name: player1Name,
      isAI: false,
      score: 0,
      tiles: [],
      timeRemaining: DEFAULT_TIME_LIMIT,
      timePenalties: 0,
      roundsPlayed: 0,
      hasExchangedLastTurn: false,
    }

    const player2: Player = {
      id: uuidv4(),
      name: player2Name,
      isAI: false,
      score: 0,
      tiles: [],
      timeRemaining: DEFAULT_TIME_LIMIT,
      timePenalties: 0,
      roundsPlayed: 0,
      hasExchangedLastTurn: false,
    }

    // Draw initial tiles
    player1.tiles = tileBag.draw(TILES_PER_PLAYER)
    player2.tiles = tileBag.draw(TILES_PER_PLAYER)

    // Create board
    const board = new Board()
    board.initialize()

    // Create game state
    const gameState: ServerGameState = {
      id: gameId,
      mode: GameMode.LOCAL_MULTIPLAYER, // Will change to ONLINE in future
      status: GameStatus.IN_PROGRESS,
      players: [player1, player2],
      currentPlayerIndex: 0,
      board: board.getGrid(),
      tileBag: [], // Empty for client
      tileBagInstance: tileBag, // Full instance for server
      moveHistory: [],
      round: 1,
      winner: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      timerRunning: true,
    }

    this.games.set(gameId, gameState)

    console.log(`[GameManager] Game created: ${gameId} (${player1Name} vs ${player2Name})`)
    console.log(`[GameManager] Player 1 ID: ${player1.id}`)
    console.log(`[GameManager] Player 2 ID: ${player2.id}`)

    return { gameId, gameState: this.sanitizeGameState(gameState, player1.id) }
  }

  /**
   * Get game by ID
   *
   * @param gameId - Game ID
   * @returns Game state or undefined
   */
  getGame(gameId: string): ServerGameState | undefined {
    return this.games.get(gameId)
  }

  /**
   * Sanitize game state for a specific player
   *
   * CRITICAL SECURITY FUNCTION:
   * - Hides opponent's tiles
   * - Hides tile bag
   * - Only shows player's own tiles
   *
   * @param gameState - Full server game state
   * @param playerId - Player ID who will receive this state
   * @returns Sanitized game state
   */
  sanitizeGameState(gameState: ServerGameState, playerId: string): GameState {
    const sanitized: GameState = {
      ...gameState,
      tileBag: [], // Never send tile bag to clients
      players: gameState.players.map((player) => {
        if (player.id === playerId) {
          // Send full data for this player
          return player
        } else {
          // Hide opponent's tiles
          return {
            ...player,
            tiles: [], // IMPORTANT: Don't send opponent's tiles!
          }
        }
      }) as [Player, Player],
    }

    // Remove server-only fields
    delete (sanitized as any).tileBagInstance

    return sanitized
  }

  /**
   * Make a move (place tiles on board)
   *
   * @param gameId - Game ID
   * @param playerId - Player making the move
   * @param placedTiles - Tiles to place
   * @returns Move result
   */
  makeMove(gameId: string, playerId: string, placedTiles: PlacedTile[]): MoveResult {
    const game = this.games.get(gameId)

    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      return { success: false, error: 'Game is not in progress' }
    }

    const currentPlayer = game.players[game.currentPlayerIndex]

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    // Validate move
    const board = new Board()
    board.setGrid(game.board)

    const moveValidator = new MoveValidator(board)
    const validation = moveValidator.validateMove(placedTiles)

    if (!validation.isValid) {
      return { success: false, error: validation.reason || 'Invalid move' }
    }

    // Update board BEFORE calculating score (so wordsFormed have the tiles!)
    for (const pt of placedTiles) {
      board.setTile(pt.row, pt.col, pt.tile)
    }

    // Calculate score (now board has the tiles)
    const scoreCalculator = new ScoreCalculator()
    const scoreResult = scoreCalculator.calculateMoveScore(
      validation.wordsFormed || [],
      placedTiles,
      placedTiles.length
    )

    // Place blockers
    if (validation.wordsFormed && validation.wordsFormed.length > 0 && validation.direction) {
      // Place blockers for each word formed
      for (const wordSquares of validation.wordsFormed) {
        board.placeBlockers(wordSquares, validation.direction)
      }
    }

    // Mark premium squares as used
    for (const pt of placedTiles) {
      const square = board.getSquare(pt.row, pt.col)
      if (square) {
        square.isUsed = true
      }
    }

    // Update player
    currentPlayer.score += scoreResult.totalScore
    currentPlayer.hasExchangedLastTurn = false

    // Remove placed tiles from player's hand
    const placedTileIds = new Set(placedTiles.map((pt) => pt.tile.id))
    currentPlayer.tiles = currentPlayer.tiles.filter((t) => !placedTileIds.has(t.id))

    // Draw new tiles
    const tilesToDraw = Math.min(TILES_PER_PLAYER - currentPlayer.tiles.length, game.tileBagInstance.remaining())
    const newTiles = game.tileBagInstance.draw(tilesToDraw)
    const drawnTileIds = newTiles.map((t) => t.id)
    currentPlayer.tiles.push(...newTiles)

    // Increment rounds
    currentPlayer.roundsPlayed++

    // Add move to history
    game.moveHistory.push({
      moveNumber: game.moveHistory.length + 1,
      playerId: currentPlayer.id,
      type: MoveType.PLACE_TILES,
      placedTiles,
      formedWords: scoreResult.wordScores.map(ws => ws.word),
      score: scoreResult.totalScore,
      timestamp: new Date(),
      drawnTileIds,
    })

    // Update board
    game.board = board.getGrid()

    // Switch turn
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 2 as 0 | 1

    // Update metadata
    game.updatedAt = new Date()

    // Check game end conditions
    this.checkGameEnd(game)

    console.log(`[GameManager] ${currentPlayer.name} played word for ${scoreResult.totalScore} points`)

    return { success: true, gameState: this.sanitizeGameState(game, playerId) }
  }

  /**
   * Skip turn
   *
   * @param gameId - Game ID
   * @param playerId - Player skipping
   * @returns Move result
   */
  skipTurn(gameId: string, playerId: string): MoveResult {
    const game = this.games.get(gameId)

    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      return { success: false, error: 'Game is not in progress' }
    }

    const currentPlayer = game.players[game.currentPlayerIndex]

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    // Record skip in history
    game.moveHistory.push({
      moveNumber: game.moveHistory.length + 1,
      playerId: currentPlayer.id,
      type: MoveType.SKIP,
      score: 0,
      timestamp: new Date(),
    })

    currentPlayer.roundsPlayed++
    currentPlayer.hasExchangedLastTurn = false

    // Switch turn
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 2 as 0 | 1
    game.updatedAt = new Date()

    // Check game end
    this.checkGameEnd(game)

    console.log(`[GameManager] ${currentPlayer.name} skipped turn`)

    return { success: true, gameState: this.sanitizeGameState(game, playerId) }
  }

  /**
   * Exchange tiles
   *
   * @param gameId - Game ID
   * @param playerId - Player exchanging
   * @param tileIds - Tile IDs to exchange
   * @returns Move result
   */
  exchangeTiles(gameId: string, playerId: string, tileIds: string[]): MoveResult {
    const game = this.games.get(gameId)

    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      return { success: false, error: 'Game is not in progress' }
    }

    const currentPlayer = game.players[game.currentPlayerIndex]

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' }
    }

    if (currentPlayer.hasExchangedLastTurn) {
      return { success: false, error: 'Cannot exchange tiles two turns in a row' }
    }

    if (game.tileBagInstance.remaining() === 0) {
      return { success: false, error: 'Tile bag is empty' }
    }

    // Find tiles to exchange
    const tilesToExchange: Tile[] = []
    for (const id of tileIds) {
      const tile = currentPlayer.tiles.find((t) => t.id === id)
      if (tile) {
        tilesToExchange.push(tile)
      }
    }

    if (tilesToExchange.length === 0) {
      return { success: false, error: 'No valid tiles to exchange' }
    }

    // Return tiles to bag
    game.tileBagInstance.returnTiles(tilesToExchange)

    // Remove from player
    currentPlayer.tiles = currentPlayer.tiles.filter((t) => !tileIds.includes(t.id))

    // Draw new tiles
    const newTiles = game.tileBagInstance.draw(tilesToExchange.length)
    currentPlayer.tiles.push(...newTiles)

    // Record exchange
    game.moveHistory.push({
      moveNumber: game.moveHistory.length + 1,
      playerId: currentPlayer.id,
      type: MoveType.EXCHANGE,
      score: 0,
      tilesExchanged: tilesToExchange.length,
      timestamp: new Date(),
    })

    currentPlayer.roundsPlayed++
    currentPlayer.hasExchangedLastTurn = true

    // Switch turn
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 2 as 0 | 1
    game.updatedAt = new Date()

    console.log(`[GameManager] ${currentPlayer.name} exchanged ${tilesToExchange.length} tiles`)

    return { success: true, gameState: this.sanitizeGameState(game, playerId) }
  }

  /**
   * Challenge last word
   *
   * @param gameId - Game ID
   * @param playerId - Player challenging
   * @returns Challenge result
   */
  challengeWord(gameId: string, playerId: string): ChallengeResult {
    const game = this.games.get(gameId)

    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    const currentPlayer = game.players[game.currentPlayerIndex]

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn to challenge' }
    }

    const lastMove = game.moveHistory[game.moveHistory.length - 1]

    if (!lastMove || lastMove.type !== MoveType.PLACE_TILES) {
      return { success: false, error: 'No word to challenge' }
    }

    // Validate the word
    const words = this.extractWords(lastMove.placedTiles!)
    let isValid = true

    for (const word of words) {
      const validation = this.wordValidator.validateWord(word.text)
      if (!validation.isValid) {
        isValid = false
        break
      }
    }

    if (!isValid) {
      // Challenge succeeded - undo last move
      this.undoLastMove(game)
      console.log(`[GameManager] Challenge succeeded - word was invalid`)
      return { success: true, challengeSucceeded: true, gameState: this.sanitizeGameState(game, playerId) }
    } else {
      // Challenge failed - penalize challenger
      currentPlayer.score = Math.max(0, currentPlayer.score - 10)
      console.log(`[GameManager] Challenge failed - word was valid`)
      return { success: true, challengeSucceeded: false, gameState: this.sanitizeGameState(game, playerId) }
    }
  }

  /**
   * Extract words from placed tiles (helper for challenge)
   */
  private extractWords(placedTiles: PlacedTile[]): { text: string }[] {
    // Simplified version - just extract word text
    // In production, use MoveValidator's word extraction logic
    const words: { text: string }[] = []

    if (placedTiles.length === 0) return words

    // Sort tiles
    placedTiles.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.col - b.col
    })

    // Extract word text
    const text = placedTiles.map((pt) => pt.tile.jokerLetter || pt.tile.letter).join('')
    words.push({ text })

    return words
  }

  /**
   * Undo last move (for challenge)
   */
  private undoLastMove(game: ServerGameState): void {
    const lastMove = game.moveHistory.pop()

    if (!lastMove || !lastMove.placedTiles) {
      return
    }

    const challengedPlayerIndex = game.players.findIndex((p) => p.id === lastMove.playerId)
    if (challengedPlayerIndex === -1) return

    const challengedPlayer = game.players[challengedPlayerIndex]

    // Deduct score
    challengedPlayer.score -= lastMove.score || 0

    // Remove drawn tiles
    if (lastMove.drawnTileIds) {
      const drawnIds = new Set(lastMove.drawnTileIds)
      challengedPlayer.tiles = challengedPlayer.tiles.filter((t) => !drawnIds.has(t.id))
    }

    // Return placed tiles
    challengedPlayer.tiles.push(...lastMove.placedTiles.map((pt) => pt.tile))

    // Restore board
    const board = new Board()
    board.setGrid(game.board)

    for (const pt of lastMove.placedTiles) {
      board.setTile(pt.row, pt.col, null)
    }

    game.board = board.getGrid()

    // Decrement rounds
    challengedPlayer.roundsPlayed--

    // Switch turn back
    game.currentPlayerIndex = challengedPlayerIndex as 0 | 1
  }

  /**
   * Check if game should end
   */
  private checkGameEnd(game: ServerGameState): void {
    const [player1, player2] = game.players

    // Both players completed 10 rounds
    if (player1.roundsPlayed >= 10 && player2.roundsPlayed >= 10) {
      this.endGame(game, 'rounds_completed')
      return
    }

    // Tile bag empty and current player has no tiles
    if (game.tileBagInstance.isEmpty()) {
      const currentPlayer = game.players[game.currentPlayerIndex]
      if (currentPlayer.tiles.length === 0) {
        this.endGame(game, 'no_tiles')
        return
      }
    }
  }

  /**
   * End the game
   */
  private endGame(game: ServerGameState, reason: string): void {
    game.status = GameStatus.COMPLETED
    game.endReason = reason as any

    // Determine winner
    const [player1, player2] = game.players

    if (player1.score > player2.score) {
      game.winner = player1.id
    } else if (player2.score > player1.score) {
      game.winner = player2.id
    }
    // else: tie (winner stays null)

    console.log(`[GameManager] Game ${game.id} ended: ${reason}`)
    console.log(`[GameManager] Final scores: ${player1.name} ${player1.score}, ${player2.name} ${player2.score}`)
  }

  /**
   * Delete a game
   *
   * @param gameId - Game ID
   */
  deleteGame(gameId: string): void {
    this.games.delete(gameId)
    console.log(`[GameManager] Game deleted: ${gameId}`)
  }
}

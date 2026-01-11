/**
 * Game Manager
 *
 * Server-authoritative game state management.
 *
 * This is the MOST IMPORTANT security component:
 * - Validates ALL moves on the server
 * - Calculates ALL scores on the server
 * - Hides tile bag from clients
 * - Shows opponent tiles (Kvizovka rule: players can see each other's tiles)
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
 * Clients receive a SANITIZED version without the tile bag.
 * (In Kvizovka, players CAN see opponent's tiles)
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
   * - Hides tile bag
   * - Shows opponent's tiles (Kvizovka rule: unlike Scrabble, players see each other's tiles)
   *
   * @param gameState - Full server game state
   * @param playerId - Player ID who will receive this state
   * @returns Sanitized game state
   */
  sanitizeGameState(gameState: ServerGameState, playerId: string): GameState {
    const sanitized: GameState = {
      ...gameState,
      tileBag: [], // Never send tile bag to clients
      // IMPORTANT: In Kvizovka, players CAN see each other's tiles (unlike Scrabble)
      // This is a key strategic element of the game
      players: gameState.players as [Player, Player],
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

    // Check if this is the first move of the game (empty move history)
    const isFirstMove = game.moveHistory.length === 0

    // Calculate how many tiles player will have left after drawing new tiles
    // Player currently has currentPlayer.tiles.length tiles
    // After this move: current tiles - tiles used + tiles drawn
    const tilesDrawn = Math.min(placedTiles.length, game.tileBagInstance.remaining())
    const tilesRemainingAfterMove = currentPlayer.tiles.length - placedTiles.length + tilesDrawn

    const scoreResult = scoreCalculator.calculateMoveScore(
      validation.wordsFormed || [],
      placedTiles,
      placedTiles.length,
      isFirstMove,
      tilesRemainingAfterMove
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

    // Draw new tiles (but not if this is the player's 10th round)
    let drawnTileIds: string[] = []
    if (currentPlayer.roundsPlayed < 9) {
      // Still have more rounds to play, draw tiles
      const tilesToDraw = Math.min(TILES_PER_PLAYER - currentPlayer.tiles.length, game.tileBagInstance.remaining())
      const newTiles = game.tileBagInstance.draw(tilesToDraw)
      drawnTileIds = newTiles.map((t) => t.id)
      currentPlayer.tiles.push(...newTiles)
    }
    // If roundsPlayed === 9, this is move 10, so don't draw tiles

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
      scoreBreakdown: scoreResult,
      timestamp: new Date(),
      drawnTileIds,
    })

    // Update board
    game.board = board.getGrid()

    // Track stealable jokers from this move
    const stealableJokers = placedTiles
      .filter(pt => pt.tile.isJoker && pt.tile.jokerLetter)
      .map(pt => ({
        row: pt.row,
        col: pt.col,
        assignedLetter: pt.tile.jokerLetter!
      }))

    game.stealableJokers = stealableJokers.length > 0 ? stealableJokers : undefined

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

    // Clear stealable jokers (opponent's turn)
    game.stealableJokers = undefined

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

    // Draw new tiles (but not if this is the player's 10th round)
    if (currentPlayer.roundsPlayed < 9) {
      const newTiles = game.tileBagInstance.draw(tilesToExchange.length)
      currentPlayer.tiles.push(...newTiles)
    }

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

    // Clear stealable jokers (opponent's turn)
    game.stealableJokers = undefined

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
   * Steal a joker from the board
   *
   * @param gameId - Game ID
   * @param playerId - Player stealing the joker
   * @param row - Row position of the joker
   * @param col - Column position of the joker
   * @param replacementTileId - ID of the tile to replace the joker with
   * @returns Move result
   */
  stealJoker(gameId: string, playerId: string, row: number, col: number, replacementTileId: string): MoveResult {
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

    // Check if there's a stealable joker at this position
    if (!game.stealableJokers || game.stealableJokers.length === 0) {
      return { success: false, error: 'No stealable jokers available' }
    }

    const stealableJoker = game.stealableJokers.find(j => j.row === row && j.col === col)

    if (!stealableJoker) {
      return { success: false, error: 'No stealable joker at this position' }
    }

    // Find the replacement tile in player's hand
    const replacementTile = currentPlayer.tiles.find(t => t.id === replacementTileId)

    if (!replacementTile) {
      return { success: false, error: 'Replacement tile not found in hand' }
    }

    // Validate that the replacement tile matches the joker's assigned letter
    if (replacementTile.letter !== stealableJoker.assignedLetter) {
      return { success: false, error: `Replacement tile must be ${stealableJoker.assignedLetter}, but got ${replacementTile.letter}` }
    }

    // Get the joker from the board
    const board = new Board()
    board.setGrid(game.board)
    const square = board.getSquare(row, col)

    if (!square || !square.tile) {
      return { success: false, error: 'No tile at this position' }
    }

    const tile = square.tile
    if (!('isJoker' in tile) || !tile.isJoker) {
      return { success: false, error: 'Tile is not a joker' }
    }

    const stolenJoker = tile

    // Remove replacement tile from player's hand
    const tileIndex = currentPlayer.tiles.findIndex(t => t.id === replacementTileId)
    currentPlayer.tiles.splice(tileIndex, 1)

    // Reset the joker's assigned letter and add it to player's hand
    const resetJoker = { ...stolenJoker, jokerLetter: undefined }
    currentPlayer.tiles.push(resetJoker)

    // Replace joker on board with the replacement tile
    board.setTile(row, col, replacementTile)

    // Update game board
    game.board = board.getGrid()

    // Clear stealable jokers (steal was successful)
    game.stealableJokers = undefined

    // Update metadata
    game.updatedAt = new Date()

    console.log(`[GameManager] ${currentPlayer.name} stole a joker at (${row}, ${col}) with ${replacementTile.letter}`)

    return { success: true, gameState: this.sanitizeGameState(game, playerId) }
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

    const [player1, player2] = game.players

    // Apply tile penalties for unused tiles
    // Each player loses points equal to the sum of their unused tile values
    // Jokers have a 10-point penalty
    const calculateTilePenalty = (tiles: any[]): number => {
      return tiles.reduce((sum, tile) => {
        if (tile.isJoker) {
          return sum + 10  // Joker penalty
        }
        return sum + tile.value
      }, 0)
    }

    const player1Penalty = calculateTilePenalty(player1.tiles)
    const player2Penalty = calculateTilePenalty(player2.tiles)

    // Store penalties in player objects (survives sanitization)
    player1.tilePenalty = player1Penalty
    player2.tilePenalty = player2Penalty

    if (player1Penalty > 0) {
      player1.score -= player1Penalty
      console.log(`[GameManager] ${player1.name} tile penalty: -${player1Penalty} (${player1.tiles.length} tiles left)`)
    }

    if (player2Penalty > 0) {
      player2.score -= player2Penalty
      console.log(`[GameManager] ${player2.name} tile penalty: -${player2Penalty} (${player2.tiles.length} tiles left)`)
    }

    // Determine winner (after penalties applied)
    if (player1.score > player2.score) {
      game.winner = player1.id
    } else if (player2.score > player1.score) {
      game.winner = player2.id
    }
    // else: tie (winner stays null)

    console.log(`[GameManager] Game ${game.id} ended: ${reason}`)
    console.log(`[GameManager] Final scores (after penalties): ${player1.name} ${player1.score}, ${player2.name} ${player2.score}`)
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

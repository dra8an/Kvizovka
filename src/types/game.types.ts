/**
 * Game Type Definitions
 *
 * This file defines all TypeScript types related to the overall game state.
 *
 * The game state includes:
 * - Players and their information
 * - Current game status
 * - Move history
 * - Game mode (local, AI, online)
 */

import { Board, PlacedTile } from './board.types'
import { Tile } from './tile.types'

/**
 * Game Mode Enum
 *
 * Different ways to play Kvizovka.
 */
export enum GameMode {
  /**
   * Two players on the same device
   * Taking turns with one keyboard/mouse
   */
  LOCAL_MULTIPLAYER = 'LOCAL_MULTIPLAYER',

  /**
   * Single player against computer AI
   * AI difficulty can be: Beginner, Intermediate, Expert
   */
  VS_AI = 'VS_AI',

  /**
   * Two players over the internet
   * Requires backend server (future feature)
   */
  ONLINE_MULTIPLAYER = 'ONLINE_MULTIPLAYER',
}

/**
 * Game Status Enum
 *
 * Current state of the game.
 */
export enum GameStatus {
  /**
   * Game is being set up
   * Players entering names, choosing settings
   */
  SETUP = 'SETUP',

  /**
   * Waiting for second player to join (online mode)
   */
  WAITING = 'WAITING',

  /**
   * Game is actively being played
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * Game is temporarily paused
   */
  PAUSED = 'PAUSED',

  /**
   * Game has finished (all rounds complete or time expired)
   */
  COMPLETED = 'COMPLETED',

  /**
   * Game was abandoned (player quit)
   */
  ABANDONED = 'ABANDONED',
}

/**
 * Player Interface
 *
 * Represents a player in the game.
 */
export interface Player {
  /**
   * Unique player identifier
   * Example: 'player1', 'player2', or user ID for online games
   */
  id: string

  /**
   * Player's display name
   * Example: 'Dragan', 'AI - Expert', 'Guest123'
   */
  name: string

  /**
   * Whether this is an AI player
   * true = computer, false = human
   */
  isAI: boolean

  /**
   * Tiles currently in player's hand (rack)
   * Always 10 tiles (or less near end of game)
   */
  tiles: Tile[]

  /**
   * Current score
   * Sum of all move scores
   */
  score: number

  /**
   * Time remaining on chess clock (milliseconds)
   * 30 minutes = 30 * 60 * 1000 = 1,800,000 ms
   * 35 minutes = 35 * 60 * 1000 = 2,100,000 ms
   */
  timeRemaining: number

  /**
   * Time penalties accumulated (milliseconds)
   * Invalid words add: 1 min, 2 min, or 4 min
   */
  timePenalties: number

  /**
   * Number of rounds this player has completed (0-10)
   */
  roundsPlayed: number
}

/**
 * Move Type Enum
 *
 * Different types of moves a player can make.
 */
export enum MoveType {
  /**
   * Place tiles on board to form word(s)
   * Most common move type
   */
  PLACE_TILES = 'PLACE_TILES',

  /**
   * Skip turn without placing tiles
   * No penalty, but uses time
   */
  SKIP = 'SKIP',

  /**
   * Exchange tiles with the bag
   * Return unwanted tiles, draw new ones
   */
  EXCHANGE = 'EXCHANGE',
}

/**
 * Move Interface
 *
 * Represents a single move/turn in the game.
 * Stored in move history for replay/undo.
 */
export interface Move {
  /**
   * ID of the player who made this move
   */
  playerId: string

  /**
   * Move number (sequential)
   * Player 1 move 1, Player 2 move 1, Player 1 move 2, etc.
   */
  moveNumber: number

  /**
   * Type of move
   */
  type: MoveType

  /**
   * Tiles placed on board (for PLACE_TILES moves)
   */
  placedTiles?: PlacedTile[]

  /**
   * Words formed by this move
   * Could be multiple words (main word + cross-words)
   */
  formedWords?: string[]

  /**
   * Score earned from this move
   * 0 for SKIP and EXCHANGE
   */
  score: number

  /**
   * Timestamp when move was made
   */
  timestamp: Date

  /**
   * Time taken for this move (milliseconds)
   * Useful for analyzing game pace
   */
  timeTaken?: number
}

/**
 * Score Breakdown
 *
 * Detailed breakdown of how a move's score was calculated.
 * Useful for showing user how their score was computed.
 */
export interface ScoreBreakdown {
  /**
   * Total score for the move
   */
  totalScore: number

  /**
   * Score details for each word
   */
  wordScores: WordScore[]

  /**
   * Bonus for using all 10 tiles (if applicable)
   */
  allTilesBonus: number

  /**
   * Bonus for long words (10+ letters)
   */
  longWordBonus: number
}

/**
 * Word Score
 *
 * Score details for a single word.
 */
export interface WordScore {
  /**
   * The word text
   */
  word: string

  /**
   * Base score (sum of tile values)
   */
  baseScore: number

  /**
   * Letter multipliers applied (2x, 3x, 4x)
   */
  letterMultipliers: number

  /**
   * Word multipliers applied (2x, 4x)
   */
  wordMultipliers: number

  /**
   * Final score for this word
   */
  finalScore: number
}

/**
 * Game State Interface
 *
 * The complete state of a game.
 * This is the "single source of truth" for the entire game.
 */
export interface GameState {
  /**
   * Unique game identifier
   * Example: 'game-1234567890'
   */
  id: string

  /**
   * Game mode (local, AI, online)
   */
  mode: GameMode

  /**
   * Current game status
   */
  status: GameStatus

  /**
   * The game board (17x17 grid)
   */
  board: Board

  /**
   * Tiles remaining in the bag (not yet drawn)
   */
  tileBag: Tile[]

  /**
   * Players in this game (always 2)
   * [0] = player 1, [1] = player 2
   */
  players: [Player, Player]

  /**
   * Index of current player (0 or 1)
   * 0 = players[0]'s turn
   * 1 = players[1]'s turn
   */
  currentPlayerIndex: 0 | 1

  /**
   * History of all moves
   * Used for undo, replay, statistics
   */
  moveHistory: Move[]

  /**
   * Current round number
   * Each player plays up to 10 rounds
   */
  round: number

  /**
   * When the game was created
   */
  createdAt: Date

  /**
   * When the game was last updated
   */
  updatedAt: Date

  /**
   * Winner (if game is complete)
   */
  winner?: string  // Player ID

  /**
   * Whether the timer is running
   * Paused during opponent's turn in local mode
   */
  timerRunning: boolean
}

/**
 * Game Settings
 *
 * Configuration options for a game.
 */
export interface GameSettings {
  /**
   * Time limit per player (milliseconds)
   * Default: 30 minutes (1,800,000 ms)
   */
  timeLimit: number

  /**
   * Enable tournament rules
   * - Time penalties for invalid words
   * - Strict 10-round limit
   */
  tournamentMode: boolean

  /**
   * AI difficulty (if playing vs AI)
   */
  aiDifficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

  /**
   * Enable sound effects
   */
  soundEnabled: boolean

  /**
   * Show word hints
   * Highlights possible word placements (for beginners)
   */
  showHints: boolean
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create a new game state
 * const gameState: GameState = {
 *   id: 'game-123',
 *   mode: GameMode.LOCAL_MULTIPLAYER,
 *   status: GameStatus.IN_PROGRESS,
 *   board: createEmptyBoard(),
 *   tileBag: initializeTiles(),
 *   players: [
 *     {
 *       id: 'player1',
 *       name: 'Dragan',
 *       isAI: false,
 *       tiles: [],
 *       score: 0,
 *       timeRemaining: 30 * 60 * 1000,
 *       timePenalties: 0,
 *       roundsPlayed: 0
 *     },
 *     {
 *       id: 'player2',
 *       name: 'Nikola',
 *       isAI: false,
 *       tiles: [],
 *       score: 0,
 *       timeRemaining: 30 * 60 * 1000,
 *       timePenalties: 0,
 *       roundsPlayed: 0
 *     }
 *   ],
 *   currentPlayerIndex: 0,
 *   moveHistory: [],
 *   round: 1,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   timerRunning: true
 * }
 *
 * // Get current player
 * const currentPlayer = gameState.players[gameState.currentPlayerIndex]
 * console.log(`${currentPlayer.name}'s turn`)
 *
 * // Switch turns
 * gameState.currentPlayerIndex = gameState.currentPlayerIndex === 0 ? 1 : 0
 * ```
 */

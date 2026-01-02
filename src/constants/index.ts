/**
 * Constants Index
 *
 * This file exports all game constants from one central location.
 *
 * Instead of:
 *   import { BOARD_SIZE } from './constants/board-config'
 *   import { TILE_DISTRIBUTION } from './constants/tile-distribution'
 *   import { ALL_TILES_BONUS } from './constants/scoring-rules'
 *
 * You can do:
 *   import { BOARD_SIZE, TILE_DISTRIBUTION, ALL_TILES_BONUS } from './constants'
 */

// Export all board configuration constants
export * from './board-config'

// Export all tile distribution constants
export * from './tile-distribution'

// Export all scoring rules constants
export * from './scoring-rules'

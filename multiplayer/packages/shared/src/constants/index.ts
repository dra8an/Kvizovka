/**
 * Constants Index
 *
 * This file exports all game constants from one central location.
 *
 * Instead of:
 *   import { BOARD_SIZE } from './constants/board-config.js'
 *   import { TILE_DISTRIBUTION } from './constants/tile-distribution.js'
 *   import { ALL_TILES_BONUS } from './constants/scoring-rules.js'
 *
 * You can do:
 *   import { BOARD_SIZE, TILE_DISTRIBUTION, ALL_TILES_BONUS } from './constants.js'
 */

// Export all board configuration constants
export * from './board-config.js'

// Export all tile distribution constants
export * from './tile-distribution.js'

// Export all scoring rules constants
export * from './scoring-rules.js'

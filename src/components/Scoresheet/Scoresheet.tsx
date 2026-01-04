/**
 * Scoresheet Component
 *
 * Displays a player's move history in a table format showing:
 * - Round number (1-10)
 * - Word played
 * - Points scored for that word
 * - Running total score
 *
 * Shows 10 rows total (one per round), with empty rows for future moves.
 */

import { Move, MoveType } from '../../types/game.types'

interface ScoresheetProps {
  /**
   * Player ID to show scoresheet for
   */
  playerId: string

  /**
   * Player name for display
   */
  playerName: string

  /**
   * All moves from the game
   */
  moves: Move[]

  /**
   * Maximum rounds per player (default 10)
   */
  maxRounds?: number

  /**
   * Compact mode for sidebar display (smaller fonts, tighter spacing)
   */
  compact?: boolean
}

interface ScoresheetRow {
  round: number
  word: string
  score: number
  total: number
  moveType: MoveType | null
}

export function Scoresheet({
  playerId,
  playerName,
  moves,
  maxRounds = 10,
  compact = false,
}: ScoresheetProps) {
  // Filter moves for this player only
  const playerMoves = moves.filter((move) => move.playerId === playerId)

  // Build scoresheet rows
  const rows: ScoresheetRow[] = []
  let runningTotal = 0

  for (let round = 1; round <= maxRounds; round++) {
    // Find the move for this round (if it exists)
    const move = playerMoves[round - 1] // 0-indexed array

    if (move) {
      runningTotal += move.score

      // Get the main word (first word in formedWords array)
      const word = move.formedWords && move.formedWords.length > 0
        ? move.formedWords[0]
        : '-'

      rows.push({
        round,
        word: move.type === MoveType.PLACE_TILES ? word : getMoveTypeLabel(move.type),
        score: move.score,
        total: runningTotal,
        moveType: move.type,
      })
    } else {
      // Future move (not played yet)
      rows.push({
        round,
        word: '',
        score: 0,
        total: runningTotal,
        moveType: null,
      })
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${compact ? 'p-2' : 'p-4'}`}>
      {/* Header */}
      <h3 className={`font-bold text-gray-800 ${compact ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
        {playerName}
      </h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${compact ? 'text-xs' : 'text-sm'}`}>
          {/* Table Header */}
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className={`text-center font-semibold text-gray-700 ${compact ? 'py-1 px-1' : 'py-2 px-2'}`}>
                #
              </th>
              <th className={`text-left font-semibold text-gray-700 ${compact ? 'py-1 px-1.5' : 'py-2 px-3'}`}>
                Word
              </th>
              <th className={`text-right font-semibold text-gray-700 ${compact ? 'py-1 px-1' : 'py-2 px-3'}`}>
                Pts
              </th>
              <th className={`text-right font-semibold text-gray-700 ${compact ? 'py-1 px-1' : 'py-2 px-3'}`}>
                Total
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.round}
                className={`border-b border-gray-200 ${
                  row.moveType === null ? 'text-gray-400' : ''
                } ${
                  row.moveType === MoveType.SKIP || row.moveType === MoveType.EXCHANGE
                    ? 'text-gray-500 italic'
                    : ''
                }`}
              >
                {/* Round Number */}
                <td className={`text-center font-medium ${compact ? 'py-1 px-1' : 'py-2 px-2'}`}>
                  {row.round}
                </td>

                {/* Word */}
                <td className={`text-left font-mono ${compact ? 'py-1 px-1.5 text-xs' : 'py-2 px-3'}`}>
                  {row.word || '-'}
                </td>

                {/* Points for this move */}
                <td className={`text-right tabular-nums ${compact ? 'py-1 px-1' : 'py-2 px-3'}`}>
                  {row.moveType !== null ? (row.score > 0 ? `+${row.score}` : '0') : ''}
                </td>

                {/* Running Total */}
                <td className={`text-right font-semibold tabular-nums ${compact ? 'py-1 px-1' : 'py-2 px-3'}`}>
                  {row.moveType !== null ? row.total : ''}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Table Footer (Final Total) */}
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-bold">
              <td colSpan={3} className={`text-right text-gray-800 ${compact ? 'py-1 px-1 text-xs' : 'py-2 px-3'}`}>
                Final:
              </td>
              <td className={`text-right text-blue-600 tabular-nums ${compact ? 'py-1 px-1 text-sm' : 'py-2 px-3 text-lg'}`}>
                {runningTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/**
 * Helper: Get display label for non-tile-placement moves
 */
function getMoveTypeLabel(type: MoveType): string {
  switch (type) {
    case MoveType.SKIP:
      return '(Pass)'
    case MoveType.EXCHANGE:
      return '(Exchange)'
    default:
      return '-'
  }
}

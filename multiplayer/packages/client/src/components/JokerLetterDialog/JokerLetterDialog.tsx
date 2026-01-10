/**
 * JokerLetterDialog Component
 *
 * Modal dialog for selecting which letter a joker tile should represent.
 *
 * Features:
 * - Shows all Serbian letters as buttons
 * - Click to select letter
 * - ESC to cancel
 * - Backdrop click to cancel
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { latinToCyrillic } from '../../utils/letterMapping'

/**
 * Serbian alphabet letters (Latin)
 */
const SERBIAN_LETTERS = [
  'A', 'B', 'C', 'Č', 'Ć', 'D', 'DŽ',
  'Đ', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'LJ', 'M', 'N', 'NJ', 'O',
  'P', 'R', 'S', 'Š', 'T', 'U', 'V',
  'Z', 'Ž'
]

interface JokerLetterDialogProps {
  /**
   * Called when user selects a letter
   */
  onSelect: (letter: string) => void

  /**
   * Called when user cancels (ESC or backdrop click)
   */
  onCancel: () => void
}

/**
 * JokerLetterDialog Component
 *
 * Example usage:
 * ```tsx
 * <JokerLetterDialog
 *   onSelect={(letter) => handleJokerLetterSelected(letter)}
 *   onCancel={() => setShowDialog(false)}
 * />
 * ```
 */
export function JokerLetterDialog({ onSelect, onCancel }: JokerLetterDialogProps) {
  const { t, i18n } = useTranslation(['dialogs', 'common'])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🃏 {t('dialogs:jokerLetter.title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('dialogs:jokerLetter.subtitle')}
            </p>
          </div>

          {/* Letter grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {SERBIAN_LETTERS.map((letter) => (
              <button
                key={letter}
                onClick={() => onSelect(letter)}
                className="
                  aspect-square flex items-center justify-center
                  bg-purple-100 hover:bg-purple-200 active:bg-purple-300
                  border-2 border-purple-300 hover:border-purple-400
                  rounded-lg font-bold text-lg text-purple-900
                  transition-all duration-150
                  hover:scale-105 active:scale-95
                "
              >
                {latinToCyrillic(letter, i18n.language)}
              </button>
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="btn btn-secondary w-full"
          >
            {t('common:buttons.cancel')}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            {t('dialogs:jokerLetter.pressEsc')}
          </p>
        </div>
      </div>
    </>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **Modal Dialog Pattern**
 *    - Backdrop (semi-transparent overlay)
 *    - Dialog positioned in center (fixed + flex)
 *    - z-index to appear above everything
 *
 * 2. **Event Listeners**
 *    - useEffect to add keydown listener
 *    - Cleanup function removes listener
 *    - Prevents memory leaks
 *
 * 3. **Grid Layout for Letters**
 *    - 7 columns for compact display
 *    - aspect-square keeps buttons square
 *    - Gap for spacing
 *
 * 4. **Keyboard Accessibility**
 *    - ESC key to cancel
 *    - Callback pattern for parent control
 *
 * 5. **Visual Feedback**
 *    - Hover states (scale, color)
 *    - Active states (pressed)
 *    - Purple theme to match joker
 */

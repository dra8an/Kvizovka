/**
 * SpectatorControls Component
 *
 * Minimal controls for spectators.
 * Only provides "Leave Game" functionality.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SpectatorControlsProps {
  onLeaveGame: () => void
}

export function SpectatorControls({ onLeaveGame }: SpectatorControlsProps) {
  const { t } = useTranslation(['online', 'common'])

  // Local state for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false)

  /**
   * Handle Leave Game
   */
  const handleLeaveGame = () => {
    setConfirmDialog(true)
  }

  const confirmLeave = () => {
    onLeaveGame()
    setConfirmDialog(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Spectator info */}
      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
        <div className="text-3xl mb-2">👁️</div>
        <p className="text-sm font-semibold text-purple-900 mb-1">
          {t('online:spectator.watching')}
        </p>
        <p className="text-xs text-purple-700">
          {t('online:spectator.cannotPlay')}
        </p>
      </div>

      {/* Leave game button */}
      <button
        onClick={handleLeaveGame}
        className="btn bg-red-500 hover:bg-red-600 text-white text-sm py-3"
      >
        {t('online:controls.leaveGame')}
      </button>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        <p>{t('online:spectator.helpText')}</p>
      </div>

      {/* Confirmation dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setConfirmDialog(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 border-2 border-yellow-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl text-yellow-500">
                ❓
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-700">
                  {t('online:spectator.leaveConfirm.title')}
                </h3>
                <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                  {t('online:spectator.leaveConfirm.message')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmDialog(false)}
                className="btn py-2 font-medium text-gray-700 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t('common:buttons.cancel')}
              </button>
              <button
                onClick={confirmLeave}
                className="btn py-2 font-medium text-white text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600"
              >
                {t('common:buttons.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

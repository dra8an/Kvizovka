import React from 'react'
import { useTranslation } from 'react-i18next'
import { Direction } from '@kvizovka/shared'

interface DirectionChoiceDialogProps {
  horizontalWord: string
  verticalWord: string
  onChoose: (direction: Direction) => void
  onCancel: () => void
}

export const DirectionChoiceDialog: React.FC<DirectionChoiceDialogProps> = ({
  horizontalWord,
  verticalWord,
  onChoose,
  onCancel,
}) => {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('dialogs:directionChoice.title')}
        </h2>

        {/* Description */}
        <p className="text-gray-700 mb-6">
          {t('dialogs:directionChoice.message')}
        </p>

        {/* Word Options */}
        <div className="space-y-3 mb-6">
          {/* Horizontal Option */}
          <button
            onClick={() => onChoose('HORIZONTAL')}
            className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {t('dialogs:directionChoice.horizontal')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {horizontalWord}
                </div>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Vertical Option */}
          <button
            onClick={() => onChoose('VERTICAL')}
            className="w-full p-4 bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {t('dialogs:directionChoice.vertical')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {verticalWord}
                </div>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          {t('common:buttons.cancel')}
        </button>
      </div>
    </div>
  )
}

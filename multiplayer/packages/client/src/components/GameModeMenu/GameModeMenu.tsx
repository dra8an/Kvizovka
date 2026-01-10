/**
 * Game Mode Menu Component
 *
 * Initial menu that lets players choose between:
 * - Local Multiplayer (2 players, same device)
 * - Online Multiplayer (2 players, over internet)
 *
 * This is the first screen users see after dictionary loads.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'

export type GameMode = 'local' | 'online'

interface GameModeMenuProps {
  /**
   * Callback when user selects a mode
   */
  onSelectMode: (mode: GameMode) => void
}

export function GameModeMenu({ onSelectMode }: GameModeMenuProps) {
  const { t } = useTranslation(['common'])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="card max-w-lg w-full">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">{t('common:gameMode.title')}</h1>
          <p className="text-gray-600">{t('common:gameMode.subtitle')}</p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          {/* Local Multiplayer */}
          <button
            onClick={() => onSelectMode('local')}
            className="mode-card group hover:scale-105 transition-transform"
          >
            <div className="flex items-start">
              {/* Icon */}
              <div className="text-4xl mr-4 group-hover:scale-110 transition-transform">
                🏠
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {t('common:gameMode.playLocally')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('common:gameMode.localDescription')}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t('common:gameMode.localSubtext')}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Online Multiplayer */}
          <button
            onClick={() => onSelectMode('online')}
            className="mode-card group hover:scale-105 transition-transform"
          >
            <div className="flex items-start">
              {/* Icon */}
              <div className="text-4xl mr-4 group-hover:scale-110 transition-transform">
                🌐
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {t('common:gameMode.playOnline')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('common:gameMode.onlineDescription')}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t('common:gameMode.onlineSubtext')}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-gray-400 group-hover:text-green-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>{t('common:gameMode.choose')}</p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .mode-card {
          width: 100%;
          padding: 1.5rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .mode-card:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}

/**
 * Example Usage:
 *
 * ```typescript
 * import { GameModeMenu } from '@/components/GameModeMenu/GameModeMenu'
 *
 * function App() {
 *   const [mode, setMode] = useState<'menu' | 'local' | 'online'>('menu')
 *
 *   if (mode === 'menu') {
 *     return <GameModeMenu onSelectMode={setMode} />
 *   }
 *
 *   if (mode === 'local') {
 *     return <LocalGame />
 *   }
 *
 *   if (mode === 'online') {
 *     return <OnlineGame />
 *   }
 * }
 * ```
 */

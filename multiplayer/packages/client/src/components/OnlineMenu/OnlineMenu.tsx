/**
 * Online Menu Component
 *
 * Handles online multiplayer room creation and joining.
 *
 * Flow:
 * 1. Choose: Create Room or Join Room
 * 2a. Create: Enter name → Get room code → Wait for opponent
 * 2b. Join: Enter code + name → Connect to room
 * 3. Waiting room: Both players see each other
 * 4. Ready: Both click ready → Game starts
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnlineGameStore } from '../../store/onlineGameStore'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import { Logger } from '@kvizovka/shared'

type MenuView = 'choice' | 'create' | 'join'

export function OnlineMenu() {
  const { t } = useTranslation(['online', 'common'])

  const {
    isConnected,
    connectionError,
    roomCode,
    playerName,
    isHost,
    opponentName,
    isSpectator,
    spectators,
    view,
    gameError,
    isLoading,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    joinRoomAsSpectator,
    ready,
  } = useOnlineGameStore()

  const [menuView, setMenuView] = useState<MenuView>('choice')
  const [inputName, setInputName] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [joinAsSpectator, setJoinAsSpectator] = useState(false)

  // Connect to server on mount
  // NOTE: We don't disconnect on unmount because the connection
  // needs to stay alive when transitioning to OnlineGame
  useEffect(() => {
    connect()
  }, [connect])

  // Handle create room
  const handleCreateRoom = () => {
    if (!inputName.trim()) return
    createRoom(inputName.trim())
  }

  // Handle join room
  const handleJoinRoom = () => {
    if (!inputRoomCode.trim() || !inputName.trim()) return

    if (joinAsSpectator) {
      joinRoomAsSpectator(inputRoomCode.trim().toUpperCase(), inputName.trim())
    } else {
      joinRoom(inputRoomCode.trim().toUpperCase(), inputName.trim())
    }
  }

  // Handle ready
  const handleReady = () => {
    ready()
  }

  // Handle copy room code
  const handleCopyRoomCode = async () => {
    if (!roomCode) return
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      Logger.error('Failed to copy room code:', err)
    }
  }

  // If not connected, show loading
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full text-center">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('online:connection.connecting')}
          </h2>
          {connectionError && (
            <p className="text-red-600 mt-4">{connectionError}</p>
          )}
        </div>
      </div>
    )
  }

  // If in waiting/playing view, show waiting room
  if (view === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>

          {/* Room Code Display */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-700 mb-3">{t('online:room.roomCode')}</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="room-code-display">
                {roomCode}
              </div>
              <button
                onClick={handleCopyRoomCode}
                className="copy-button"
                title={t('online:room.copyCode')}
              >
                {copied ? (
                  <span className="copy-button-success">✓ {t('online:room.codeCopied')}</span>
                ) : (
                  <span>📋 {t('online:room.copyCode')}</span>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {t('online:room.shareCode')}
            </p>
          </div>

          {/* Spectators (small, discreet) */}
          {spectators.length > 0 && (
            <div className="mb-3 px-3 py-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">
                👁️ {t('online:room.spectators', 'Spectators')} ({spectators.length}/5)
              </p>
              <div className="flex flex-wrap gap-1">
                {spectators.map((spectator, index) => (
                  <span key={index} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {spectator.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Players */}
          <div className="space-y-3 mb-6">
            {/* Player 1 (You) - unless you're a spectator */}
            {!isSpectator && (
              <div className="player-card">
                <div className="text-2xl mr-3">👤</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{playerName}</p>
                  <p className="text-sm text-gray-600">
                    {isHost ? t('online:room.host') : t('online:room.guest')} · {t('online:room.you')}
                  </p>
                </div>
                <div className="text-green-600">✓</div>
              </div>
            )}

            {/* Player 2 (Opponent) */}
            <div className="player-card">
              <div className="text-2xl mr-3">👤</div>
              <div className="flex-1">
                {opponentName ? (
                  <>
                    <p className="font-semibold text-gray-800">{opponentName}</p>
                    <p className="text-sm text-gray-600">
                      {isHost ? t('online:room.guest') : t('online:room.host')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">{t('online:room.waiting')}</p>
                    <p className="text-sm text-gray-400">{t('online:room.inviteFriend')}</p>
                  </>
                )}
              </div>
              {opponentName && <div className="text-green-600">✓</div>}
            </div>
          </div>

          {/* Ready Button - only for players, not spectators */}
          {opponentName && !isSpectator && (
            <button
              onClick={handleReady}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? t('online:room.starting') : t('online:room.ready')}
            </button>
          )}

          {/* Spectator message */}
          {isSpectator && (
            <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm text-purple-800">
                👁️ {t('online:room.spectatorWaiting', 'You are spectating. Game will start when both players are ready.')}
              </p>
            </div>
          )}

          {/* Error */}
          {gameError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {gameError}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Initial menu: Create or Join
  if (menuView === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('online:menu.title')}
            </h1>
            <p className="text-gray-600">{t('online:menu.selectMode')}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMenuView('create')}
              className="menu-option-card"
            >
              <div className="text-3xl mr-4">➕</div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">{t('online:menu.createRoom')}</h3>
                <p className="text-sm text-gray-600">{t('online:room.startNewGame')}</p>
              </div>
              <div className="text-gray-400">→</div>
            </button>

            <button
              onClick={() => setMenuView('join')}
              className="menu-option-card"
            >
              <div className="text-3xl mr-4">🔗</div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">{t('online:menu.joinRoom')}</h3>
                <p className="text-sm text-gray-600">{t('online:room.enterCode')}</p>
              </div>
              <div className="text-gray-400">→</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Create Room Form
  if (menuView === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setMenuView('choice')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← {t('common:buttons.cancel')}
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t('online:menu.createRoom')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('online:room.yourName')}
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder={t('online:room.enterName')}
                maxLength={20}
                className="input-field"
                autoFocus
              />
            </div>

            {gameError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {gameError}
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={!inputName.trim() || isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? t('online:room.creating') : t('online:room.create')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Join Room Form
  if (menuView === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setMenuView('choice')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← {t('common:buttons.cancel')}
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('online:menu.joinRoom')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('online:room.roomCode')}
              </label>
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder={t('online:room.enterCodePlaceholder')}
                maxLength={6}
                className="input-field text-center text-2xl font-mono tracking-wider"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('online:room.yourName')}
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder={t('online:room.enterName')}
                maxLength={20}
                className="input-field"
              />
            </div>

            {/* Spectator checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="spectator-checkbox"
                checked={joinAsSpectator}
                onChange={(e) => setJoinAsSpectator(e.target.checked)}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="spectator-checkbox" className="ml-2 text-sm text-gray-700">
                {t('online:room.joinAsSpectator', 'Join as spectator (watch only)')}
              </label>
            </div>

            {gameError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {gameError}
              </div>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={
                !inputRoomCode.trim() || !inputName.trim() || isLoading
              }
              className="btn-primary w-full"
            >
              {isLoading
                ? (joinAsSpectator ? t('online:room.joiningAsSpectator', 'Joining as spectator...') : t('online:room.joining'))
                : (joinAsSpectator ? t('online:room.joinAsSpectatorButton', 'Join as Spectator') : t('online:room.join'))
              }
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/* Styles */
const styles = `
.room-code-display {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.player-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
}

.menu-option-card {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-option-card:hover {
  border-color: #3b82f6;
  transform: scale(1.02);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.copy-button {
  padding: 0.75rem 1.25rem;
  background: white;
  color: #4b5563;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.copy-button:active {
  transform: translateY(0);
}

.copy-button-success {
  color: #059669;
  font-weight: 600;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}

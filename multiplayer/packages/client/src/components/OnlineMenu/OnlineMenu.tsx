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
import { useOnlineGameStore } from '../../store/onlineGameStore'

type MenuView = 'choice' | 'create' | 'join'

export function OnlineMenu() {
  const {
    isConnected,
    connectionError,
    roomCode,
    playerName,
    isHost,
    opponentName,
    view,
    gameError,
    isLoading,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    ready,
  } = useOnlineGameStore()

  const [menuView, setMenuView] = useState<MenuView>('choice')
  const [inputName, setInputName] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')

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
    joinRoom(inputRoomCode.trim().toUpperCase(), inputName.trim())
  }

  // Handle ready
  const handleReady = () => {
    ready()
  }

  // If not connected, show loading
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connecting to Server...
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
          {/* Room Code Display */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-700 mb-3">Room Code</h2>
            <div className="room-code-display">
              {roomCode}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Share this code with your opponent
            </p>
          </div>

          {/* Players */}
          <div className="space-y-3 mb-6">
            {/* Player 1 (You) */}
            <div className="player-card">
              <div className="text-2xl mr-3">👤</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{playerName}</p>
                <p className="text-sm text-gray-600">
                  {isHost ? 'Host' : 'Guest'} · You
                </p>
              </div>
              <div className="text-green-600">✓</div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="player-card">
              <div className="text-2xl mr-3">👤</div>
              <div className="flex-1">
                {opponentName ? (
                  <>
                    <p className="font-semibold text-gray-800">{opponentName}</p>
                    <p className="text-sm text-gray-600">
                      {isHost ? 'Guest' : 'Host'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">Waiting for opponent...</p>
                    <p className="text-sm text-gray-400">Invite a friend</p>
                  </>
                )}
              </div>
              {opponentName && <div className="text-green-600">✓</div>}
            </div>
          </div>

          {/* Ready Button */}
          {opponentName && (
            <button
              onClick={handleReady}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Starting...' : 'Ready to Play'}
            </button>
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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Online Multiplayer
            </h1>
            <p className="text-gray-600">Create or join a room</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMenuView('create')}
              className="menu-option-card"
            >
              <div className="text-3xl mr-4">➕</div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">Create Room</h3>
                <p className="text-sm text-gray-600">Start a new game</p>
              </div>
              <div className="text-gray-400">→</div>
            </button>

            <button
              onClick={() => setMenuView('join')}
              className="menu-option-card"
            >
              <div className="text-3xl mr-4">🔗</div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800">Join Room</h3>
                <p className="text-sm text-gray-600">Enter room code</p>
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
          <button
            onClick={() => setMenuView('choice')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create Room
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Enter your name"
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
              {isLoading ? 'Creating...' : 'Create Room'}
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
          <button
            onClick={() => setMenuView('choice')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Join Room</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="input-field text-center text-2xl font-mono tracking-wider"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Enter your name"
                maxLength={20}
                className="input-field"
              />
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
              {isLoading ? 'Joining...' : 'Join Room'}
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
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}

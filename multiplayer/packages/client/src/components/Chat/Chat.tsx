/**
 * Chat Component
 *
 * Real-time chat for online multiplayer games.
 *
 * Features:
 * - Send and receive messages in real-time
 * - Auto-scroll to latest message
 * - Display player names with messages
 * - Timestamp for each message
 * - Compact design for sidebar placement
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatMessage } from '@kvizovka/shared'

/**
 * Props for Chat component
 */
interface ChatProps {
  /**
   * List of chat messages
   */
  messages: ChatMessage[]

  /**
   * Current player ID (to highlight own messages)
   */
  yourPlayerId: string

  /**
   * Callback when user sends a message
   */
  onSendMessage: (message: string) => void
}

/**
 * Chat Component
 *
 * Example usage:
 * ```tsx
 * <Chat
 *   messages={chatMessages}
 *   yourPlayerId={you.id}
 *   onSendMessage={(msg) => socket.emit('chat:message', { roomCode, message: msg })}
 * />
 * ```
 */
export function Chat({ messages, yourPlayerId, onSendMessage }: ChatProps) {
  const { t } = useTranslation('online')
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (trimmed.length === 0) return
    if (trimmed.length > 500) return // Max length check

    onSendMessage(trimmed)
    setInputValue('')
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Format timestamp
  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card flex flex-col h-[300px]">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-700">💬 Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">
            No messages yet
          </p>
        ) : (
          messages.map((msg, index) => {
            const isYou = msg.playerId === yourPlayerId

            return (
              <div
                key={`${msg.timestamp}-${index}`}
                className={`text-xs ${isYou ? 'text-right' : 'text-left'}`}
              >
                {/* Player name + time */}
                <div className={`font-semibold ${isYou ? 'text-blue-600' : 'text-gray-700'}`}>
                  {isYou ? 'You' : msg.playerName}
                  <span className="text-gray-400 ml-1 font-normal">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message bubble */}
                <div
                  className={`inline-block mt-0.5 px-2 py-1 rounded ${
                    isYou
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          maxLength={500}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={inputValue.trim().length === 0}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}

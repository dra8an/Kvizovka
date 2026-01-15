/**
 * Socket.io Client Service
 *
 * Wrapper around Socket.io client with typed events.
 *
 * This service:
 * - Manages WebSocket connection to server
 * - Provides type-safe event emitting/listening
 * - Handles connection state
 * - Manages reconnection logic
 *
 * Usage:
 * ```typescript
 * import { socketService } from './services/socket'
 *
 * // Connect to server
 * socketService.connect()
 *
 * // Listen for events
 * socketService.on('game:started', (data) => {
 *   Logger.debug('Game started!', data)
 * })
 *
 * // Emit events
 * socketService.emit('room:create', { playerName: 'Alice' }, (response) => {
 *   if (response.success) {
 *     Logger.debug('Room created:', response.roomCode)
 *   }
 * })
 * ```
 */

import { io, Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@kvizovka/shared'
import { Logger } from '@kvizovka/shared'

/**
 * Type for Socket.io with custom events
 */
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * Socket Service Class
 *
 * Singleton service for managing WebSocket connection
 */
class SocketService {
  /**
   * Socket.io instance
   */
  private socket: TypedSocket | null = null

  /**
   * Server URL
   */
  private serverUrl: string

  /**
   * Connection state callbacks
   */
  private onConnectCallbacks: (() => void)[] = []
  private onDisconnectCallbacks: (() => void)[] = []
  private onErrorCallbacks: ((error: Error) => void)[] = []

  constructor() {
    // Get server URL from environment or default to localhost
    this.serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
  }

  /**
   * Connect to server
   *
   * Establishes WebSocket connection and sets up event listeners
   */
  connect(): void {
    if (this.socket?.connected) {
      Logger.debug('[Socket] Already connected')
      return
    }

    Logger.debug(`[Socket] Connecting to ${this.serverUrl}...`)

    // Create socket connection
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection event handlers
    this.socket.on('connect', () => {
      Logger.debug('[Socket] Connected:', this.socket?.id)
      this.onConnectCallbacks.forEach((cb) => cb())
    })

    this.socket.on('disconnect', (reason) => {
      Logger.debug('[Socket] Disconnected:', reason)
      this.onDisconnectCallbacks.forEach((cb) => cb())
    })

    this.socket.on('connect_error', (error) => {
      Logger.error('[Socket] Connection error:', error)
      this.onErrorCallbacks.forEach((cb) => cb(error))
    })

    // Server error events
    this.socket.on('error', (data) => {
      Logger.error('[Socket] Server error:', data.message)
      this.onErrorCallbacks.forEach((cb) => cb(new Error(data.message)))
    })
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      Logger.debug('[Socket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id
  }

  /**
   * Emit event to server
   *
   * @param event - Event name
   * @param data - Event data
   * @param callback - Optional callback for acknowledgment
   */
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void {
    if (!this.socket) {
      Logger.error('[Socket] Cannot emit - not connected')
      return
    }

    Logger.debug(`[Socket] Emit: ${event}`, args)
    this.socket.emit(event, ...args)
  }

  /**
   * Listen for event from server
   *
   * @param event - Event name
   * @param handler - Event handler
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): void {
    if (!this.socket) {
      Logger.error('[Socket] Cannot listen - not connected')
      return
    }

    Logger.debug(`[Socket] Listening for: ${event}`)
    this.socket.on(event, handler as any)
  }

  /**
   * Stop listening for event
   *
   * @param event - Event name
   * @param handler - Event handler to remove (optional)
   */
  off<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: ServerToClientEvents[K]
  ): void {
    if (!this.socket) {
      return
    }

    if (handler) {
      this.socket.off(event, handler as any)
    } else {
      this.socket.off(event)
    }
  }

  /**
   * Register callback for connection event
   */
  onConnect(callback: () => void): void {
    this.onConnectCallbacks.push(callback)
  }

  /**
   * Register callback for disconnection event
   */
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.push(callback)
  }

  /**
   * Register callback for error event
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallbacks.push(callback)
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
    this.onConnectCallbacks = []
    this.onDisconnectCallbacks = []
    this.onErrorCallbacks = []
  }
}

/**
 * Singleton instance
 *
 * Import this in your components to use the socket service
 */
export const socketService = new SocketService()

/**
 * Example Usage:
 *
 * ```typescript
 * import { socketService } from '@/services/socket'
 *
 * // In component mount/setup:
 * useEffect(() => {
 *   socketService.connect()
 *
 *   socketService.on('game:started', (data) => {
 *     Logger.debug('Game started!', data.gameId)
 *   })
 *
 *   return () => {
 *     socketService.off('game:started')
 *     socketService.disconnect()
 *   }
 * }, [])
 *
 * // Create a room:
 * const handleCreateRoom = () => {
 *   socketService.emit('room:create', { playerName: 'Alice' }, (response) => {
 *     if (response.success) {
 *       Logger.debug('Room code:', response.roomCode)
 *     } else {
 *       Logger.error('Failed:', response.error)
 *     }
 *   })
 * }
 * ```
 */

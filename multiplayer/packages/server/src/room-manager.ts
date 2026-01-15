/**
 * Room Manager
 *
 * Manages game rooms where players join before starting a match.
 *
 * Features:
 * - Generate unique 6-character room codes (e.g., "A3X9K2")
 * - Track rooms with host and guest players
 * - Handle player joining and leaving
 * - Start game when both players are ready
 */

import type { Room } from '@kvizovka/shared'
import { Logger } from '@kvizovka/shared'

/**
 * Room Manager Class
 *
 * Singleton that manages all active game rooms.
 */
export class RoomManager {
  /**
   * Map of room code → Room data
   */
  private rooms: Map<string, Room> = new Map()

  /**
   * Map of socket ID → room code (for quick lookup)
   */
  private playerToRoom: Map<string, string> = new Map()

  /**
   * Characters used for room code generation
   */
  private readonly CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  /**
   * Room code length
   */
  private readonly CODE_LENGTH = 6

  /**
   * Generate a unique 6-character room code
   *
   * @returns Room code (e.g., "A3X9K2")
   */
  private generateRoomCode(): string {
    let code: string
    let attempts = 0
    const maxAttempts = 100

    do {
      code = ''
      for (let i = 0; i < this.CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * this.CODE_CHARS.length)
        code += this.CODE_CHARS[randomIndex]
      }
      attempts++

      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique room code')
      }
    } while (this.rooms.has(code))

    return code
  }

  /**
   * Create a new room
   *
   * @param hostId - Host player's socket ID
   * @param hostName - Host player's name
   * @returns Room code and Room object
   */
  createRoom(hostId: string, hostName: string): { code: string; room: Room } {
    const code = this.generateRoomCode()

    const room: Room = {
      code,
      hostId,
      hostName,
      guestId: null,
      guestName: null,
      spectators: [],
      gameId: null,
      ready: false,
      createdAt: new Date(),
    }

    this.rooms.set(code, room)
    this.playerToRoom.set(hostId, code)

    Logger.warn(`[RoomManager] Room created: ${code} by ${hostName}`)

    return { code, room }
  }

  /**
   * Join an existing room
   *
   * @param roomCode - Room code to join
   * @param guestId - Guest player's socket ID
   * @param guestName - Guest player's name
   * @returns Room object or null if room not found/full
   */
  joinRoom(roomCode: string, guestId: string, guestName: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase())

    if (!room) {
      Logger.debug(`[RoomManager] Room not found: ${roomCode}`)
      return null
    }

    if (room.guestId !== null) {
      Logger.debug(`[RoomManager] Room full: ${roomCode}`)
      return null
    }

    // Add guest to room
    room.guestId = guestId
    room.guestName = guestName
    this.playerToRoom.set(guestId, room.code)

    Logger.warn(`[RoomManager] ${guestName} joined room ${room.code}`)

    return room
  }

  /**
   * Join an existing room as spectator
   *
   * @param roomCode - Room code to join
   * @param spectatorId - Spectator's socket ID
   * @param spectatorName - Spectator's name
   * @returns Room object or null if room not found/spectator limit reached
   */
  joinRoomAsSpectator(roomCode: string, spectatorId: string, spectatorName: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase())

    if (!room) {
      Logger.debug(`[RoomManager] Room not found: ${roomCode}`)
      return null
    }

    // Check spectator limit (max 5)
    if (room.spectators.length >= 5) {
      Logger.debug(`[RoomManager] Spectator limit reached for room ${roomCode}`)
      return null
    }

    // Check if spectator already in room
    if (room.spectators.some(s => s.socketId === spectatorId)) {
      Logger.debug(`[RoomManager] Spectator ${spectatorName} already in room ${roomCode}`)
      return room
    }

    // Add spectator to room
    room.spectators.push({ socketId: spectatorId, name: spectatorName })
    this.playerToRoom.set(spectatorId, room.code)

    Logger.warn(`[RoomManager] Spectator ${spectatorName} joined room ${room.code}`)

    return room
  }

  /**
   * Remove spectator from room
   *
   * @param socketId - Spectator's socket ID
   * @returns Room object if spectator was removed, undefined otherwise
   */
  removeSpectator(socketId: string): { room: Room; spectatorName: string } | undefined {
    const roomCode = this.playerToRoom.get(socketId)

    if (!roomCode) {
      return undefined
    }

    const room = this.rooms.get(roomCode)

    if (!room) {
      this.playerToRoom.delete(socketId)
      return undefined
    }

    // Find and remove spectator
    const spectatorIndex = room.spectators.findIndex(s => s.socketId === socketId)

    if (spectatorIndex === -1) {
      return undefined
    }

    const spectatorName = room.spectators[spectatorIndex].name
    room.spectators.splice(spectatorIndex, 1)
    this.playerToRoom.delete(socketId)

    Logger.warn(`[RoomManager] Spectator ${spectatorName} left room ${room.code}`)

    return { room, spectatorName }
  }

  /**
   * Mark room as ready (both players ready to start)
   *
   * @param roomCode - Room code
   * @returns true if room is now ready, false otherwise
   */
  setRoomReady(roomCode: string): boolean {
    const room = this.rooms.get(roomCode.toUpperCase())

    if (!room) {
      return false
    }

    if (room.guestId === null) {
      Logger.debug(`[RoomManager] Cannot mark room ready - waiting for second player`)
      return false
    }

    room.ready = true
    Logger.info(`[RoomManager] Room ${room.code} is ready to start`)

    return true
  }

  /**
   * Set game ID for a room (when game starts)
   *
   * @param roomCode - Room code
   * @param gameId - Game ID
   */
  setGameId(roomCode: string, gameId: string): void {
    const room = this.rooms.get(roomCode.toUpperCase())

    if (!room) {
      return
    }

    room.gameId = gameId
    Logger.info(`[RoomManager] Room ${room.code} linked to game ${gameId}`)
  }

  /**
   * Get room by code
   *
   * @param roomCode - Room code
   * @returns Room object or undefined
   */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase())
  }

  /**
   * Get room by player socket ID
   *
   * @param socketId - Player's socket ID
   * @returns Room object or undefined
   */
  getRoomByPlayer(socketId: string): Room | undefined {
    const roomCode = this.playerToRoom.get(socketId)
    if (!roomCode) {
      return undefined
    }
    return this.rooms.get(roomCode)
  }

  /**
   * Check if a socket ID is a spectator
   *
   * @param socketId - Socket ID to check
   * @returns true if spectator, false otherwise
   */
  isSpectator(socketId: string): boolean {
    const room = this.getRoomByPlayer(socketId)
    if (!room) {
      return false
    }
    return room.spectators.some(s => s.socketId === socketId)
  }

  /**
   * Remove player from room (on disconnect)
   *
   * @param socketId - Player's socket ID
   * @returns Room code if player was removed, undefined otherwise
   */
  removePlayer(socketId: string): string | undefined {
    const roomCode = this.playerToRoom.get(socketId)

    if (!roomCode) {
      return undefined
    }

    const room = this.rooms.get(roomCode)

    if (!room) {
      this.playerToRoom.delete(socketId)
      return undefined
    }

    // Determine if player is host or guest
    if (room.hostId === socketId) {
      Logger.warn(`[RoomManager] Host ${room.hostName} left room ${room.code}`)
      // If host leaves, delete the entire room
      this.deleteRoom(roomCode)
      return roomCode
    } else if (room.guestId === socketId) {
      Logger.warn(`[RoomManager] Guest ${room.guestName} left room ${room.code}`)
      // If guest leaves, keep room but remove guest
      room.guestId = null
      room.guestName = null
      room.ready = false
      this.playerToRoom.delete(socketId)
      return roomCode
    }

    // Not a player (could be spectator) - return undefined
    return undefined
  }

  /**
   * Delete a room
   *
   * @param roomCode - Room code to delete
   */
  deleteRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode.toUpperCase())

    if (!room) {
      return
    }

    // Remove player mappings
    this.playerToRoom.delete(room.hostId)
    if (room.guestId) {
      this.playerToRoom.delete(room.guestId)
    }

    // Remove spectator mappings
    room.spectators.forEach(spectator => {
      this.playerToRoom.delete(spectator.socketId)
    })

    // Delete room
    this.rooms.delete(room.code)
    Logger.debug(`[RoomManager] Room deleted: ${room.code}`)
  }

  /**
   * Get all active rooms (for debugging)
   *
   * @returns Array of rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }

  /**
   * Get statistics
   *
   * @returns Stats object
   */
  getStats(): { totalRooms: number; activeGames: number; waitingRooms: number } {
    const rooms = this.getAllRooms()
    return {
      totalRooms: rooms.length,
      activeGames: rooms.filter((r) => r.gameId !== null).length,
      waitingRooms: rooms.filter((r) => r.gameId === null).length,
    }
  }
}

/**
 * Singleton instance
 */
export const roomManager = new RoomManager()

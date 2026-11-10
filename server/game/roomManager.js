import { Room } from './room.js';

// Safe character alphabet for 4-letter room codes:
// Excludes confusing letters like I, O, L, 0, 1
const SAFE_ROOM_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ';

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> Room instance
    this.socketToRoom = new Map(); // socketId -> { roomCode, sessionToken }
  }

  generateRoomCode() {
    let code = '';
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * SAFE_ROOM_CHARS.length);
        code += SAFE_ROOM_CHARS[idx];
      }
      attempts++;
    } while (this.rooms.has(code) && attempts < 1000);

    return code;
  }

  createRoom() {
    const code = this.generateRoomCode();
    const room = new Room(code, this.io);
    this.rooms.set(code, room);
    console.log(`[RoomManager] Created room ${code}. Total active rooms: ${this.rooms.size}`);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toString().trim().toUpperCase()) || null;
  }

  registerSocket(socketId, roomCode, sessionToken) {
    this.socketToRoom.set(socketId, { roomCode, sessionToken });
  }

  handleDisconnect(socketId) {
    const record = this.socketToRoom.get(socketId);
    if (!record) return;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(record.roomCode);
    if (room) {
      room.handleDisconnect(socketId);

      // Check if room is completely empty (no players connected)
      const anyConnected = Array.from(room.players.values()).some(p => p.connected);
      if (!anyConnected) {
        console.log(`[RoomManager] Room ${room.code} is completely empty. Scheduling cleanup.`);
        setTimeout(() => {
          const checkRoom = this.rooms.get(record.roomCode);
          if (checkRoom) {
            const stillConnected = Array.from(checkRoom.players.values()).some(p => p.connected);
            if (!stillConnected) {
              console.log(`[RoomManager] Deleting empty room ${record.roomCode}.`);
              this.rooms.delete(record.roomCode);
            }
          }
        }, 10000); // 10 second timeout before cleaning empty room
      }
    }
  }
}

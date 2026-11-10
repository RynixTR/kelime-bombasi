import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@shared/constants.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.sessionToken = this.getOrCreateSessionToken();
    this.currentRoomCode = null;
    this.eventListeners = new Map();
  }

  getOrCreateSessionToken() {
    let token = localStorage.getItem('kb_session_token');
    if (!token) {
      token = 'kb_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('kb_session_token', token);
    }
    return token;
  }

  connect() {
    if (this.socket && this.socket.connected) return;

    this.socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server! ID:', this.socket.id);
      this.emitInternal('connection_change', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      this.emitInternal('connection_change', { connected: false, reason });
    });

    // Forward all known shared socket events to subscribers
    Object.values(SOCKET_EVENTS).forEach(event => {
      this.socket.on(event, (data) => {
        this.emitInternal(event, data);
      });
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emitInternal(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event handler for ${event}:`, err);
        }
      });
    }
  }

  // Socket action emitters with promises
  createRoom(userData) {
    return new Promise((resolve) => {
      this.connect();
      this.socket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        sessionToken: this.sessionToken,
        ...userData
      }, (res) => {
        if (res?.success) {
          this.currentRoomCode = res.roomCode;
        }
        resolve(res);
      });
    });
  }

  joinRoom(roomCode, userData) {
    return new Promise((resolve) => {
      this.connect();
      this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomCode,
        sessionToken: this.sessionToken,
        ...userData
      }, (res) => {
        if (res?.success) {
          this.currentRoomCode = res.roomCode;
        }
        resolve(res);
      });
    });
  }

  startGame() {
    return new Promise((resolve) => {
      this.socket.emit(SOCKET_EVENTS.START_GAME, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken
      }, resolve);
    });
  }

  submitWord(word) {
    return new Promise((resolve) => {
      this.socket.emit(SOCKET_EVENTS.SUBMIT_WORD, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken,
        word
      }, resolve);
    });
  }

  sendTyping(text) {
    if (!this.socket) return;
    this.socket.emit(SOCKET_EVENTS.TYPING_UPDATE, {
      roomCode: this.currentRoomCode,
      sessionToken: this.sessionToken,
      text
    });
  }

  updateSettings(settings) {
    return new Promise((resolve) => {
      this.socket.emit(SOCKET_EVENTS.UPDATE_SETTINGS, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken,
        settings
      }, resolve);
    });
  }

  kickPlayer(targetSessionToken) {
    return new Promise((resolve) => {
      this.socket.emit(SOCKET_EVENTS.KICK_PLAYER, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken,
        targetSessionToken
      }, resolve);
    });
  }

  playAgain() {
    return new Promise((resolve) => {
      this.socket.emit(SOCKET_EVENTS.PLAY_AGAIN, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken
      }, resolve);
    });
  }

  sendEmoji(emoji) {
    if (!this.socket) return;
    this.socket.emit(SOCKET_EVENTS.SEND_EMOJI, {
      roomCode: this.currentRoomCode,
      sessionToken: this.sessionToken,
      emoji
    });
  }

  leaveRoom() {
    if (this.socket && this.currentRoomCode) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
        roomCode: this.currentRoomCode,
        sessionToken: this.sessionToken
      });
      this.currentRoomCode = null;
    }
  }
}

export const socketService = new SocketService();

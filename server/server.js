import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { GAME_CONSTANTS, SOCKET_EVENTS } from '../shared/constants.js';
import { dictionary } from './data/dictionary.js';
import { containsProfanity } from './data/profanityFilter.js';
import { sanitizeNickname, cleanTurkishWord } from './utils/turkishString.js';
import { RoomManager } from './game/roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dictionary
dictionary.load();

const app = express();
const server = http.createServer(app);

// Enable CORS for local Vite dev server
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static build if client is built
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Kelime Bombası',
    vocabularySize: dictionary.wordsSet.size,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// Check room info via REST
app.get('/api/room/:code', (req, res) => {
  const code = req.params.code?.toUpperCase();
  const room = roomManager.getRoom(code);
  if (!room) {
    return res.status(404).json({ exists: false, error: 'Oda bulunamadı' });
  }
  return res.json({
    exists: true,
    code: room.code,
    state: room.state,
    playerCount: room.players.size,
    maxPlayers: GAME_CONSTANTS.MAX_PLAYERS
  });
});

// Socket.IO Server setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

const roomManager = new RoomManager(io);

// Socket Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // Create new room
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (data, callback = () => {}) => {
    try {
      const { sessionToken, name, avatar, color } = data || {};
      const cleanName = sanitizeNickname(name);

      if (!cleanName || cleanName.length < GAME_CONSTANTS.NICKNAME_MIN_LENGTH) {
        return callback({ success: false, error: `Takma ad en az ${GAME_CONSTANTS.NICKNAME_MIN_LENGTH} karakter olmalıdır.` });
      }
      if (cleanName.length > GAME_CONSTANTS.NICKNAME_MAX_LENGTH) {
        return callback({ success: false, error: `Takma ad en fazla ${GAME_CONSTANTS.NICKNAME_MAX_LENGTH} karakter olabilir.` });
      }
      if (containsProfanity(cleanName)) {
        return callback({ success: false, error: 'Lütfen uygun bir takma ad seçiniz.' });
      }

      const room = roomManager.createRoom();
      socket.join(room.code);
      roomManager.registerSocket(socket.id, room.code, sessionToken);

      const joinResult = room.addPlayer({
        sessionToken,
        socketId: socket.id,
        name: cleanName,
        avatar,
        color
      });

      if (!joinResult.success) {
        return callback({ success: false, error: joinResult.error });
      }

      callback({
        success: true,
        roomCode: room.code,
        player: joinResult.player,
        roomState: room.getPublicState()
      });
    } catch (err) {
      console.error('[Create Room Error]:', err);
      callback({ success: false, error: 'Oda oluşturulurken bir hata oluştu.' });
    }
  });

  // Join existing room
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken, name, avatar, color } = data || {};
      const cleanCode = (roomCode || '').trim().toUpperCase();
      const cleanName = sanitizeNickname(name);

      if (!cleanCode) {
        return callback({ success: false, error: 'Lütfen geçerli bir oda kodu giriniz.' });
      }

      const room = roomManager.getRoom(cleanCode);
      if (!room) {
        return callback({ success: false, error: `"${cleanCode}" kodlu oda bulunamadı veya kapatılmış.` });
      }

      if (!cleanName || cleanName.length < GAME_CONSTANTS.NICKNAME_MIN_LENGTH) {
        return callback({ success: false, error: `Takma ad en az ${GAME_CONSTANTS.NICKNAME_MIN_LENGTH} karakter olmalıdır.` });
      }
      if (cleanName.length > GAME_CONSTANTS.NICKNAME_MAX_LENGTH) {
        return callback({ success: false, error: `Takma ad en fazla ${GAME_CONSTANTS.NICKNAME_MAX_LENGTH} karakter olabilir.` });
      }
      if (containsProfanity(cleanName)) {
        return callback({ success: false, error: 'Lütfen uygun bir takma ad seçiniz.' });
      }

      socket.join(room.code);
      roomManager.registerSocket(socket.id, room.code, sessionToken);

      const joinResult = room.addPlayer({
        sessionToken,
        socketId: socket.id,
        name: cleanName,
        avatar,
        color
      });

      if (!joinResult.success) {
        socket.leave(room.code);
        return callback({ success: false, error: joinResult.error });
      }

      callback({
        success: true,
        roomCode: room.code,
        player: joinResult.player,
        reconnected: joinResult.reconnected,
        roomState: room.getPublicState()
      });
    } catch (err) {
      console.error('[Join Room Error]:', err);
      callback({ success: false, error: 'Odaya katılırken bir hata oluştu.' });
    }
  });

  // Update room settings (Host only)
  socket.on(SOCKET_EVENTS.UPDATE_SETTINGS, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken, settings } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

      const res = room.updateSettings(sessionToken, settings);
      callback(res);
    } catch (err) {
      console.error('[Update Settings Error]:', err);
      callback({ success: false, error: 'Ayarlar güncellenemedi.' });
    }
  });

  // Start game (Host only)
  socket.on(SOCKET_EVENTS.START_GAME, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

      const res = room.startGame(sessionToken);
      callback(res);
    } catch (err) {
      console.error('[Start Game Error]:', err);
      callback({ success: false, error: 'Oyun başlatılamadı.' });
    }
  });

  // Submit word
  socket.on(SOCKET_EVENTS.SUBMIT_WORD, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken, word } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

      const res = room.submitWord(sessionToken, word);
      if (!res.success) {
        socket.emit(SOCKET_EVENTS.WORD_REJECTED, { error: res.error, word });
      }
      callback(res);
    } catch (err) {
      console.error('[Submit Word Error]:', err);
      callback({ success: false, error: 'Kelime kontrol edilirken hata oluştu.' });
    }
  });

  // Real-time typing update
  socket.on(SOCKET_EVENTS.TYPING_UPDATE, (data) => {
    try {
      const { roomCode, sessionToken, text } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (room) {
        room.updateTyping(sessionToken, text);
      }
    } catch (err) {
      // Ignore typing sync errors silently
    }
  });

  // Kick player (Host only)
  socket.on(SOCKET_EVENTS.KICK_PLAYER, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken, targetSessionToken } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

      const res = room.kickPlayer(sessionToken, targetSessionToken);
      callback(res);
    } catch (err) {
      console.error('[Kick Player Error]:', err);
      callback({ success: false, error: 'Oyuncu atılamadı.' });
    }
  });

  // Play again (Host only)
  socket.on(SOCKET_EVENTS.PLAY_AGAIN, (data, callback = () => {}) => {
    try {
      const { roomCode, sessionToken } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

      const res = room.playAgain(sessionToken);
      callback(res);
    } catch (err) {
      console.error('[Play Again Error]:', err);
      callback({ success: false, error: 'Yeni oyun başlatılamadı.' });
    }
  });

  // Floating emoji reaction
  socket.on(SOCKET_EVENTS.SEND_EMOJI, (data) => {
    try {
      const { roomCode, sessionToken, emoji } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (room) {
        room.sendEmoji(sessionToken, emoji);
      }
    } catch (err) {
      // Ignore emoji errors
    }
  });

  // Explicit leave
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (data) => {
    try {
      const { roomCode, sessionToken } = data || {};
      const room = roomManager.getRoom(roomCode);
      if (room) {
        room.removePlayer(sessionToken, 'left');
        socket.leave(room.code);
      }
    } catch (err) {
      // Ignore
    }
  });

  // Disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

// Fallback index.html for SPA client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🔥 Kelime Bombası Sunucusu Aktif!`);
  console.log(`🌐 Port: http://localhost:${PORT}`);
  console.log(`📚 Sözlük Boyutu: ${dictionary.wordsSet.size.toLocaleString('tr-TR')} kelime`);
  console.log(`===============================================`);
});

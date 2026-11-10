import { GAME_CONSTANTS, SOCKET_EVENTS } from '../../shared/constants.js';
import { dictionary } from '../data/dictionary.js';
import { turkishToUpper, turkishToLower, cleanTurkishWord } from '../utils/turkishString.js';

export class Room {
  constructor(code, io) {
    this.code = code;
    this.io = io;
    this.createdAt = Date.now();
    
    // Players keyed by sessionToken
    this.players = new Map(); // sessionToken -> Player object
    this.kickedTokens = new Set();
    
    // Game Settings
    this.settings = {
      lives: GAME_CONSTANTS.DEFAULT_LIVES,
      speed: 'normal',
      bonusLives: true
    };

    // Game state: 'lobby' | 'countdown' | 'in_game' | 'results'
    this.state = 'lobby';
    
    // In-game mechanics
    this.turnOrder = []; // Array of sessionTokens in turn sequence
    this.currentTurnIndex = 0;
    this.currentSyllable = '';
    this.usedWords = new Set();
    this.usedSyllables = [];
    this.activeTypingText = '';
    
    // Authoritative Timer
    this.turnStartTime = 0;
    this.fuseDurationMs = 0;
    this.turnTimeout = null;
    this.countdownInterval = null;

    // Match statistics
    this.stats = {
      totalWords: 0,
      longestWord: { word: '', player: '' },
      fastestAnswer: { timeSeconds: 999, word: '', player: '' },
      roundsPlayed: 0
    };
  }

  // Get public room state
  getPublicState() {
    const playerList = Array.from(this.players.values()).map(p => ({
      id: p.id,
      sessionToken: p.sessionToken,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      isHost: p.isHost,
      isAlive: p.isAlive,
      isSpectator: p.isSpectator,
      connected: p.connected,
      lives: p.lives,
      bonusLetters: Array.from(p.bonusLetters || []),
      score: p.score
    }));

    const activePlayerToken = this.turnOrder[this.currentTurnIndex] || null;
    const activePlayer = activePlayerToken ? this.players.get(activePlayerToken) : null;

    return {
      code: this.code,
      state: this.state,
      settings: this.settings,
      players: playerList,
      playerCount: playerList.length,
      maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
      activePlayer: activePlayer ? {
        id: activePlayer.id,
        sessionToken: activePlayer.sessionToken,
        name: activePlayer.name,
        avatar: activePlayer.avatar
      } : null,
      currentSyllable: this.currentSyllable,
      fuseDurationMs: this.fuseDurationMs,
      turnStartTime: this.turnStartTime,
      activeTypingText: this.activeTypingText,
      usedWordsCount: this.usedWords.size,
      recentWords: Array.from(this.usedWords).slice(-5).reverse(),
      stats: this.stats
    };
  }

  broadcast(event, data) {
    this.io.to(this.code).emit(event, data);
  }

  broadcastState() {
    this.broadcast(SOCKET_EVENTS.ROOM_STATE, this.getPublicState());
  }

  // Find host player
  getHost() {
    for (const player of this.players.values()) {
      if (player.isHost && player.connected) return player;
    }
    // Fallback to first connected player
    for (const player of this.players.values()) {
      if (player.connected) return player;
    }
    return null;
  }

  // Add a player to room
  addPlayer(playerData) {
    const { sessionToken, socketId, name, avatar, color } = playerData;

    if (this.kickedTokens.has(sessionToken)) {
      return { success: false, error: 'Bu odadan atıldınız, tekrar katılamazsınız.' };
    }

    // Check duplicate name in room (case-insensitive Turkish)
    const lowerName = turkishToLower(name);
    for (const [token, existing] of this.players.entries()) {
      if (token !== sessionToken && turkishToLower(existing.name) === lowerName) {
        return { success: false, error: 'Bu takma ad odada zaten kullanılıyor.' };
      }
    }

    // Existing player reconnecting
    if (this.players.has(sessionToken)) {
      const existing = this.players.get(sessionToken);
      existing.socketId = socketId;
      existing.connected = true;
      existing.name = name || existing.name;
      existing.avatar = avatar || existing.avatar;
      existing.color = color || existing.color;

      if (existing.disconnectTimer) {
        clearTimeout(existing.disconnectTimer);
        existing.disconnectTimer = null;
      }

      this.broadcast(SOCKET_EVENTS.PLAYER_RECONNECTED, {
        player: { id: existing.id, name: existing.name }
      });
      this.broadcastState();
      return { success: true, player: existing, reconnected: true };
    }

    // Check capacity
    if (this.players.size >= GAME_CONSTANTS.MAX_PLAYERS) {
      return { success: false, error: 'Oda dolu (Maksimum 12 oyuncu).' };
    }

    // Is this first player? Make host
    const isFirstPlayer = this.players.size === 0;

    // If joining mid-game, join as spectator
    const isSpectator = this.state === 'in_game' || this.state === 'countdown';

    const newPlayer = {
      id: socketId,
      socketId,
      sessionToken,
      name,
      avatar: avatar || '💣',
      color: color || '#FF3B30',
      isHost: isFirstPlayer,
      isAlive: !isSpectator,
      isSpectator,
      connected: true,
      lives: this.settings.lives,
      bonusLetters: new Set(),
      score: 0,
      joinedAt: Date.now(),
      disconnectTimer: null
    };

    this.players.set(sessionToken, newPlayer);

    this.broadcast(SOCKET_EVENTS.PLAYER_JOINED, {
      player: {
        id: newPlayer.id,
        name: newPlayer.name,
        avatar: newPlayer.avatar,
        isHost: newPlayer.isHost,
        isSpectator: newPlayer.isSpectator
      }
    });

    this.broadcastState();
    return { success: true, player: newPlayer, reconnected: false };
  }

  // Handle player disconnect with 15s grace period
  handleDisconnect(socketId) {
    let target = null;
    for (const player of this.players.values()) {
      if (player.socketId === socketId) {
        target = player;
        break;
      }
    }
    if (!target) return;

    target.connected = false;

    this.broadcast(SOCKET_EVENTS.PLAYER_DISCONNECTED, {
      playerId: target.id,
      name: target.name
    });

    // If game in progress and bomb was with this player, pass bomb immediately!
    if (this.state === 'in_game' && this.isCurrentTurn(target.sessionToken)) {
      console.log(`[Room ${this.code}] Active player ${target.name} disconnected. Passing bomb.`);
      this.passBombToNextPlayer(false);
    }

    // If host disconnected, reassign host immediately to next oldest connected player
    if (target.isHost) {
      this.reassignHost();
    }

    // Start 15s grace timer
    target.disconnectTimer = setTimeout(() => {
      this.removePlayer(target.sessionToken, 'timeout');
    }, GAME_CONSTANTS.RECONNECT_GRACE_MS);

    this.broadcastState();
  }

  // Remove player completely
  removePlayer(sessionToken, reason = 'left') {
    const player = this.players.get(sessionToken);
    if (!player) return;

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
    }

    const wasHost = player.isHost;
    this.players.delete(sessionToken);

    // If in game, remove from turn order
    if (this.state === 'in_game') {
      const idx = this.turnOrder.indexOf(sessionToken);
      if (idx !== -1) {
        this.turnOrder.splice(idx, 1);
        if (this.currentTurnIndex >= this.turnOrder.length) {
          this.currentTurnIndex = 0;
        }
      }
      this.checkGameWinCondition();
    }

    this.broadcast(SOCKET_EVENTS.PLAYER_LEFT, {
      playerId: player.id,
      name: player.name,
      reason
    });

    if (wasHost) {
      this.reassignHost();
    }

    this.broadcastState();
  }

  reassignHost() {
    let oldest = null;
    for (const p of this.players.values()) {
      if (p.connected) {
        if (!oldest || p.joinedAt < oldest.joinedAt) {
          oldest = p;
        }
      }
    }

    // Remove host from all
    for (const p of this.players.values()) {
      p.isHost = false;
    }

    if (oldest) {
      oldest.isHost = true;
      this.broadcast(SOCKET_EVENTS.HOST_CHANGED, {
        newHost: { id: oldest.id, name: oldest.name }
      });
      console.log(`[Room ${this.code}] Host reassigned to ${oldest.name}`);
    }
  }

  // Kick a player (Host only)
  kickPlayer(hostSessionToken, targetSessionToken) {
    const host = this.players.get(hostSessionToken);
    if (!host || !host.isHost) {
      return { success: false, error: 'Yalnızca yönetici oyuncu atabilir.' };
    }

    const target = this.players.get(targetSessionToken);
    if (!target) {
      return { success: false, error: 'Oyuncu bulunamadı.' };
    }

    if (target.isHost) {
      return { success: false, error: 'Yönetici kendisini atamaz.' };
    }

    this.kickedTokens.add(targetSessionToken);

    // If target was active player in game, pass bomb
    if (this.state === 'in_game' && this.isCurrentTurn(targetSessionToken)) {
      this.passBombToNextPlayer(false);
    }

    this.io.to(target.socketId).emit(SOCKET_EVENTS.PLAYER_KICKED, {
      reason: 'Yönetici tarafından odadan çıkarıldınız.'
    });

    this.removePlayer(targetSessionToken, 'kicked');
    return { success: true };
  }

  // Update lobby settings (Host only)
  updateSettings(hostSessionToken, newSettings) {
    const host = this.players.get(hostSessionToken);
    if (!host || !host.isHost) {
      return { success: false, error: 'Yalnızca yönetici ayarları değiştirebilir.' };
    }

    if (this.state !== 'lobby') {
      return { success: false, error: 'Ayarlar yalnızca lobideyken değiştirilebilir.' };
    }

    if (newSettings.lives !== undefined) {
      const l = parseInt(newSettings.lives, 10);
      if (l >= GAME_CONSTANTS.MIN_LIVES && l <= GAME_CONSTANTS.MAX_LIVES) {
        this.settings.lives = l;
      }
    }

    if (newSettings.speed && GAME_CONSTANTS.SPEED_MODES[newSettings.speed]) {
      this.settings.speed = newSettings.speed;
    }

    if (newSettings.bonusLives !== undefined) {
      this.settings.bonusLives = Boolean(newSettings.bonusLives);
    }

    this.broadcast(SOCKET_EVENTS.SETTINGS_UPDATED, { settings: this.settings });
    this.broadcastState();
    return { success: true, settings: this.settings };
  }

  // Start the game (Host only, >= 2 players)
  startGame(hostSessionToken) {
    const host = this.players.get(hostSessionToken);
    if (!host || !host.isHost) {
      return { success: false, error: 'Yalnızca yönetici oyunu başlatabilir.' };
    }

    const connectedPlayers = Array.from(this.players.values()).filter(p => p.connected);
    if (connectedPlayers.length < GAME_CONSTANTS.MIN_PLAYERS) {
      return { success: false, error: `Oyunu başlatmak için en az ${GAME_CONSTANTS.MIN_PLAYERS} oyuncu gerekli.` };
    }

    if (this.state !== 'lobby' && this.state !== 'results') {
      return { success: false, error: 'Oyun zaten başlamış.' };
    }

    // Reset room and player game state
    this.state = 'countdown';
    this.usedWords.clear();
    this.usedSyllables = [];
    this.activeTypingText = '';
    this.stats = {
      totalWords: 0,
      longestWord: { word: '', player: '' },
      fastestAnswer: { timeSeconds: 999, word: '', player: '' },
      roundsPlayed: 0
    };

    // Prepare active players
    this.turnOrder = [];
    for (const p of this.players.values()) {
      if (p.connected) {
        p.isAlive = true;
        p.isSpectator = false;
        p.lives = this.settings.lives;
        p.bonusLetters.clear();
        p.score = 0;
        this.turnOrder.push(p.sessionToken);
      } else {
        p.isAlive = false;
        p.isSpectator = true;
      }
    }

    // Shuffle turn order randomly
    for (let i = this.turnOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.turnOrder[i], this.turnOrder[j]] = [this.turnOrder[j], this.turnOrder[i]];
    }

    this.currentTurnIndex = 0;
    this.broadcastState();

    // 3-2-1 Countdown
    let count = GAME_CONSTANTS.COUNTDOWN_SECONDS;
    this.broadcast(SOCKET_EVENTS.COUNTDOWN_START, { count });

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.broadcast(SOCKET_EVENTS.COUNTDOWN_TICK, { count });
      } else {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.beginInGame();
      }
    }, 1000);

    return { success: true };
  }

  beginInGame() {
    this.state = 'in_game';
    this.broadcast(SOCKET_EVENTS.GAME_STARTED, {});
    this.startNextTurn();
  }

  isCurrentTurn(sessionToken) {
    if (this.state !== 'in_game') return false;
    const currentToken = this.turnOrder[this.currentTurnIndex];
    return currentToken === sessionToken;
  }

  startNextTurn() {
    if (this.state !== 'in_game') return;

    // Check if win condition is reached
    if (this.checkGameWinCondition()) return;

    // Clear old timer
    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
      this.turnTimeout = null;
    }

    const activeToken = this.turnOrder[this.currentTurnIndex];
    const activePlayer = this.players.get(activeToken);

    if (!activePlayer || !activePlayer.isAlive || !activePlayer.connected) {
      this.passBombToNextPlayer(false);
      return;
    }

    // Choose difficulty based on speed setting and rounds played
    const speedConfig = GAME_CONSTANTS.SPEED_MODES[this.settings.speed] || GAME_CONSTANTS.SPEED_MODES.normal;
    let difficulty = speedConfig.difficulty;

    if (this.stats.roundsPlayed > 12) {
      difficulty = 'hard';
    } else if (this.stats.roundsPlayed > 6 && difficulty === 'easy') {
      difficulty = 'medium';
    }

    // Pick new syllable
    this.currentSyllable = dictionary.getRandomSyllable(difficulty, this.usedSyllables.slice(-10));
    this.usedSyllables.push(this.currentSyllable);
    this.activeTypingText = '';

    // Calculate fuse duration: randomized between minFuse and maxFuse
    // As rounds progress, fuse duration slightly shortens
    const roundDecay = Math.min(this.stats.roundsPlayed * 300, 4000);
    const minF = Math.max(speedConfig.minFuse - roundDecay, 5000);
    const maxF = Math.max(speedConfig.maxFuse - roundDecay, 8000);
    this.fuseDurationMs = Math.floor(Math.random() * (maxF - minF + 1)) + minF;
    this.turnStartTime = Date.now();

    this.broadcast(SOCKET_EVENTS.TURN_STARTED, {
      activePlayer: {
        id: activePlayer.id,
        sessionToken: activePlayer.sessionToken,
        name: activePlayer.name,
        avatar: activePlayer.avatar
      },
      syllable: this.currentSyllable,
      fuseDurationMs: this.fuseDurationMs,
      turnStartTime: this.turnStartTime,
      round: this.stats.roundsPlayed + 1
    });

    this.broadcastState();

    // Set authoritative timer for bomb explosion
    this.turnTimeout = setTimeout(() => {
      this.handleBombExplosion();
    }, this.fuseDurationMs);
  }

  // Active player typing real-time update
  updateTyping(sessionToken, text) {
    if (!this.isCurrentTurn(sessionToken)) return;
    this.activeTypingText = text.slice(0, 30);
    this.broadcast(SOCKET_EVENTS.REMOTE_TYPING, {
      playerId: this.players.get(sessionToken)?.id,
      text: this.activeTypingText
    });
  }

  // Submit word attempt
  submitWord(sessionToken, rawWord) {
    if (this.state !== 'in_game') {
      return { success: false, error: 'Oyun aktif değil.' };
    }

    if (!this.isCurrentTurn(sessionToken)) {
      return { success: false, error: 'Sıra sende değil!' };
    }

    const player = this.players.get(sessionToken);
    if (!player || !player.isAlive) {
      return { success: false, error: 'Elendiniz.' };
    }

    const cleanedWord = cleanTurkishWord(rawWord);

    // 1. Check length
    if (cleanedWord.length < 2) {
      return { success: false, error: 'Kelime en az 2 harfli olmalıdır.' };
    }

    // 2. Check contains syllable
    if (!dictionary.wordContainsSyllable(cleanedWord, this.currentSyllable)) {
      return { success: false, error: `"${this.currentSyllable}" hecesi kelimede bulunmuyor!` };
    }

    // 3. Check already used in this match
    if (this.usedWords.has(cleanedWord)) {
      return { success: false, error: `"${cleanedWord.toLocaleUpperCase('tr-TR')}" bu oyunda zaten kullanıldı!` };
    }

    // 4. Check dictionary
    if (!dictionary.isValidWord(cleanedWord)) {
      return { success: false, error: `"${cleanedWord.toLocaleUpperCase('tr-TR')}" Türkçe sözlükte bulunamadı!` };
    }

    // WORD IS VALID!
    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
      this.turnTimeout = null;
    }

    const timeSpentMs = Date.now() - this.turnStartTime;
    const timeSpentSeconds = (timeSpentMs / 1000).toFixed(1);

    this.usedWords.add(cleanedWord);
    this.stats.totalWords++;
    this.stats.roundsPlayed++;
    player.score += Math.max(10, Math.floor((this.fuseDurationMs - timeSpentMs) / 100));

    // Update stats
    if (cleanedWord.length > this.stats.longestWord.word.length) {
      this.stats.longestWord = {
        word: cleanedWord.toLocaleUpperCase('tr-TR'),
        player: player.name
      };
    }

    if (parseFloat(timeSpentSeconds) < this.stats.fastestAnswer.timeSeconds) {
      this.stats.fastestAnswer = {
        timeSeconds: parseFloat(timeSpentSeconds),
        word: cleanedWord.toLocaleUpperCase('tr-TR'),
        player: player.name
      };
    }

    // Check Bonus letter mechanic
    let bonusAwarded = false;
    if (this.settings.bonusLives) {
      const upperWord = cleanedWord.toLocaleUpperCase('tr-TR');
      for (const char of GAME_CONSTANTS.BONUS_LETTERS) {
        if (upperWord.includes(char)) {
          player.bonusLetters.add(char);
        }
      }

      if (player.bonusLetters.size >= GAME_CONSTANTS.BONUS_TARGET_COUNT) {
        if (player.lives < GAME_CONSTANTS.MAX_LIVES) {
          player.lives++;
        }
        player.bonusLetters.clear();
        bonusAwarded = true;
      }
    }

    this.broadcast(SOCKET_EVENTS.WORD_ACCEPTED, {
      player: { id: player.id, name: player.name, avatar: player.avatar },
      word: cleanedWord.toLocaleUpperCase('tr-TR'),
      timeSeconds: timeSpentSeconds,
      bonusAwarded,
      newLives: player.lives,
      bonusLetters: Array.from(player.bonusLetters)
    });

    // Pass bomb to next player
    this.passBombToNextPlayer(true);

    return { success: true };
  }

  // Authoritative timer expired: BOMB EXPLODED!
  handleBombExplosion() {
    if (this.state !== 'in_game') return;

    const activeToken = this.turnOrder[this.currentTurnIndex];
    const player = this.players.get(activeToken);

    if (player) {
      player.lives = Math.max(0, player.lives - 1);
      const isEliminated = player.lives === 0;

      if (isEliminated) {
        player.isAlive = false;
        player.isSpectator = true;
      }

      this.broadcast(SOCKET_EVENTS.BOMB_EXPLODED, {
        player: {
          id: player.id,
          name: player.name,
          avatar: player.avatar,
          remainingLives: player.lives,
          isEliminated
        },
        syllable: this.currentSyllable
      });

      if (isEliminated) {
        this.broadcast(SOCKET_EVENTS.PLAYER_ELIMINATED, {
          playerId: player.id,
          name: player.name
        });
      }
    }

    // Check if only 1 player remains alive
    if (this.checkGameWinCondition()) return;

    // Dramatic 1.8 second delay after explosion before next turn starts
    setTimeout(() => {
      if (this.state === 'in_game') {
        this.passBombToNextPlayer(false);
      }
    }, 1800);
  }

  passBombToNextPlayer(wasSuccess = true) {
    if (this.state !== 'in_game') return;

    const aliveCount = this.getAlivePlayers().length;
    if (aliveCount <= 1) {
      this.checkGameWinCondition();
      return;
    }

    // Advance turn index to next ALIVE player
    let attempts = 0;
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
      attempts++;
      const candidateToken = this.turnOrder[this.currentTurnIndex];
      const candidate = this.players.get(candidateToken);
      if (candidate && candidate.isAlive && candidate.connected) {
        break;
      }
    } while (attempts < this.turnOrder.length);

    this.startNextTurn();
  }

  getAlivePlayers() {
    return Array.from(this.players.values()).filter(p => p.isAlive && p.connected);
  }

  checkGameWinCondition() {
    if (this.state !== 'in_game') return false;

    const alive = this.getAlivePlayers();

    if (alive.length === 1) {
      const winner = alive[0];
      this.finishGame(winner);
      return true;
    } else if (alive.length === 0) {
      // Draw / no one alive
      this.finishGame(null);
      return true;
    }

    return false;
  }

  finishGame(winner) {
    this.state = 'results';

    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
      this.turnTimeout = null;
    }

    // Calculate leaderboard / rankings
    const rankings = Array.from(this.players.values())
      .sort((a, b) => {
        // Alive first, then by remaining lives, then by score
        if (a.isAlive && !b.isAlive) return -1;
        if (!a.isAlive && b.isAlive) return 1;
        if (a.lives !== b.lives) return b.lives - a.lives;
        return b.score - a.score;
      })
      .map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        lives: p.lives,
        score: p.score,
        isWinner: winner && p.sessionToken === winner.sessionToken
      }));

    this.broadcast(SOCKET_EVENTS.GAME_OVER, {
      winner: winner ? {
        id: winner.id,
        name: winner.name,
        avatar: winner.avatar,
        color: winner.color
      } : null,
      rankings,
      stats: this.stats
    });

    this.broadcastState();
  }

  // Play again in same room (Host only)
  playAgain(hostSessionToken) {
    const host = this.players.get(hostSessionToken);
    if (!host || !host.isHost) {
      return { success: false, error: 'Yalnızca yönetici yeni oyun başlatabilir.' };
    }

    this.state = 'lobby';
    this.usedWords.clear();
    this.usedSyllables = [];
    this.activeTypingText = '';

    // Convert everyone (including former spectators/eliminated) back to lobby participants
    for (const p of this.players.values()) {
      p.isAlive = true;
      p.isSpectator = false;
      p.lives = this.settings.lives;
      p.bonusLetters.clear();
      p.score = 0;
    }

    this.broadcastState();
    return { success: true };
  }

  // Send floating emoji reaction
  sendEmoji(sessionToken, emoji) {
    const player = this.players.get(sessionToken);
    if (!player) return;

    this.broadcast(SOCKET_EVENTS.EMOJI_RECEIVED, {
      playerId: player.id,
      playerName: player.name,
      emoji
    });
  }
}

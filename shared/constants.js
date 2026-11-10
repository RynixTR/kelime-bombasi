// Shared constants for Kelime Bombasi (Word Bomb)
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 12,
  DEFAULT_LIVES: 3,
  MIN_LIVES: 1,
  MAX_LIVES: 5,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 14,
  ROOM_CODE_LENGTH: 4,
  RECONNECT_GRACE_MS: 15000, // 15 seconds grace period before eliminating disconnected player
  COUNTDOWN_SECONDS: 3,

  // Speed modes (fuse durations in ms)
  SPEED_MODES: {
    rahat: {
      label: 'Rahat',
      description: 'Yeni başlayanlar için geniş süre',
      minFuse: 14000,
      maxFuse: 22000,
      difficulty: 'easy'
    },
    normal: {
      label: 'Normal',
      description: 'Dengeli ve tempolu',
      minFuse: 9000,
      maxFuse: 16000,
      difficulty: 'medium'
    },
    cilgin: {
      label: 'Çılgın',
      description: 'Yüksek adrenalin, kısa fitil!',
      minFuse: 6000,
      maxFuse: 11000,
      difficulty: 'hard'
    }
  },

  // Bonus letter mechanic: collecting special letters awards +1 life
  BONUS_LETTERS: ['Z', 'P', 'V', 'J', 'G', 'F', 'H'],
  BONUS_TARGET_COUNT: 5
};

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  CREATE_ROOM: 'create_room',
  START_GAME: 'start_game',
  SUBMIT_WORD: 'submit_word',
  TYPING_UPDATE: 'typing_update',
  UPDATE_SETTINGS: 'update_settings',
  KICK_PLAYER: 'kick_player',
  PLAY_AGAIN: 'play_again',
  SEND_EMOJI: 'send_emoji',
  LEAVE_ROOM: 'leave_room',

  // Server -> Client
  ROOM_STATE: 'room_state',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  PLAYER_DISCONNECTED: 'player_disconnected',
  PLAYER_RECONNECTED: 'player_reconnected',
  PLAYER_KICKED: 'player_kicked',
  HOST_CHANGED: 'host_changed',
  SETTINGS_UPDATED: 'settings_updated',
  COUNTDOWN_START: 'countdown_start',
  COUNTDOWN_TICK: 'countdown_tick',
  GAME_STARTED: 'game_started',
  TURN_STARTED: 'turn_started',
  WORD_ACCEPTED: 'word_accepted',
  WORD_REJECTED: 'word_rejected',
  BOMB_EXPLODED: 'bomb_exploded',
  PLAYER_ELIMINATED: 'player_eliminated',
  GAME_OVER: 'game_over',
  EMOJI_RECEIVED: 'emoji_received',
  REMOTE_TYPING: 'remote_typing',
  ERROR_MESSAGE: 'error_message'
};

export const AVATARS = [
  { id: 'bomb', emoji: '💣', label: 'Bomba', color: '#FF3B30' },
  { id: 'fire', emoji: '🔥', label: 'Alev', color: '#FF9500' },
  { id: 'skull', emoji: '💀', label: 'Kafatası', color: '#AF52DE' },
  { id: 'alien', emoji: '👾', label: 'Uzaylı', color: '#5856D6' },
  { id: 'cool', emoji: '😎', label: 'Havalı', color: '#34C759' },
  { id: 'cat', emoji: '😼', label: 'Kedi', color: '#FF2D55' },
  { id: 'tiger', emoji: '🐯', label: 'Kaplan', color: '#FF9F0A' },
  { id: 'ghost', emoji: '👻', label: 'Hayalet', color: '#64D2FF' },
  { id: 'lightning', emoji: '⚡', label: 'Şimşek', color: '#FFD60A' },
  { id: 'rocket', emoji: '🚀', label: 'Roket', color: '#007AFF' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja', color: '#8E8E93' },
  { id: 'crown', emoji: '👑', label: 'Kral', color: '#FFD700' }
];

export const REACTIONS = ['🔥', '😂', '💣', '😱', '👏', '❤️', '💀', '🎉'];

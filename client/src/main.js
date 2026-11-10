import { socketService } from './socket.js';
import { sound } from './audio/soundEffects.js';
import { initVisualViewportHandler } from './ui/visualViewport.js';
import { spawnFloatingEmoji } from './ui/emojiTray.js';
import { renderLoginScreen } from './screens/loginScreen.js';
import { renderLobbyScreen } from './screens/lobbyScreen.js';
import { renderCountdownScreen, updateCountdownTick } from './screens/countdownScreen.js';
import { GameScreen } from './screens/gameScreen.js';
import { renderResultsScreen } from './screens/resultsScreen.js';
import { SOCKET_EVENTS } from '@shared/constants.js';

class App {
  constructor() {
    this.screenContainer = document.getElementById('screen-container');
    this.currentScreen = 'login';
    this.roomState = null;
    this.currentPlayer = null;
    this.gameScreenInstance = null;

    this.init();
  }

  init() {
    // 1. Initialize Visual Viewport Handler for virtual keyboard on mobile
    initVisualViewportHandler();

    // 2. Initialize Sound Toggle Button
    this.initSoundToggle();

    // 3. User interaction listener to resume Web Audio API on first touch
    const unlockAudio = () => {
      sound.ensureContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 4. Check invite URL parameter (?oda=ABCD or hash #ABCD)
    const urlParams = new URLSearchParams(window.location.search);
    let inviteCode = urlParams.get('oda') || window.location.hash.replace('#', '');
    if (inviteCode) {
      inviteCode = inviteCode.trim().toUpperCase();
    }

    // 5. Setup Desktop Companion QR code & copy link
    this.initDesktopCompanion();

    // 6. Bind Socket Listeners
    this.bindSocketListeners();

    // 7. Render initial login screen
    this.showLogin(inviteCode);
  }

  initSoundToggle() {
    const btn = document.getElementById('btn-sound-toggle');
    const icon = document.getElementById('sound-icon');
    if (!btn || !icon) return;

    icon.textContent = sound.isMuted ? '🔇' : '🔊';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = sound.toggleMute();
      icon.textContent = muted ? '🔇' : '🔊';
      if (!muted) sound.playCorrect();
    });
  }

  initDesktopCompanion() {
    const copyBtn = document.getElementById('btn-desktop-copy-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const link = window.location.href;
        try {
          await navigator.clipboard.writeText(link);
          copyBtn.textContent = '✅ Link Kopyalandı!';
          setTimeout(() => { copyBtn.textContent = '🔗 Oyun Linkini Kopyala'; }, 2000);
        } catch (e) {}
      });
    }

    // Render simple SVG QR placeholder or stylized badge
    const qrHolder = document.getElementById('desktop-qr');
    if (qrHolder) {
      qrHolder.innerHTML = `
        <div style="width: 140px; height: 140px; background: #fff; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          <span style="font-size: 3.5rem;">💣</span>
          <span style="font-family: var(--font-heading); font-size: 0.72rem; font-weight: 800; color: #000; text-transform: uppercase;">KELİME BOMBASI</span>
        </div>
      `;
    }
  }

  showLogin(inviteCode = null, errorMessage = null) {
    this.currentScreen = 'login';
    this.gameScreenInstance?.cleanup();
    this.gameScreenInstance = null;

    renderLoginScreen(this.screenContainer, {
      inviteCode,
      initialError: errorMessage,
      onJoined: (roomState, player) => {
        this.roomState = roomState;
        this.currentPlayer = player;
        this.routeState(roomState);
      }
    });
  }

  routeState(state) {
    this.roomState = state;

    // Refresh currentPlayer reference
    if (this.currentPlayer) {
      const fresh = state.players.find(p => p.sessionToken === this.currentPlayer.sessionToken);
      if (fresh) this.currentPlayer = fresh;
    }

    if (state.state === 'lobby') {
      if (this.currentScreen !== 'lobby') {
        this.currentScreen = 'lobby';
        this.gameScreenInstance?.cleanup();
        this.gameScreenInstance = null;
        renderLobbyScreen(this.screenContainer, {
          roomState: this.roomState,
          currentPlayer: this.currentPlayer,
          onLeave: () => this.showLogin()
        });
      } else {
        // Re-render lobby with updated players/settings
        renderLobbyScreen(this.screenContainer, {
          roomState: this.roomState,
          currentPlayer: this.currentPlayer,
          onLeave: () => this.showLogin()
        });
      }
    } else if (state.state === 'countdown') {
      this.currentScreen = 'countdown';
      renderCountdownScreen(this.screenContainer, 3);
    } else if (state.state === 'in_game') {
      if (this.currentScreen !== 'in_game') {
        this.currentScreen = 'in_game';
        this.gameScreenInstance = new GameScreen(this.screenContainer, {
          roomState: this.roomState,
          currentPlayer: this.currentPlayer
        });
        this.gameScreenInstance.render();
      }
    } else if (state.state === 'results') {
      this.currentScreen = 'results';
      this.gameScreenInstance?.cleanup();
      this.gameScreenInstance = null;
      renderResultsScreen(this.screenContainer, {
        resultsData: {
          winner: state.players.find(p => p.isAlive) || null,
          rankings: state.players.map((p, idx) => ({
            rank: idx + 1,
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            color: p.color,
            lives: p.lives,
            score: p.score,
            isWinner: p.isAlive
          })),
          stats: state.stats
        },
        currentPlayer: this.currentPlayer,
        onLeave: () => this.showLogin()
      });
    }
  }

  bindSocketListeners() {
    // Room state broadcast
    socketService.on(SOCKET_EVENTS.ROOM_STATE, (state) => {
      this.routeState(state);
    });

    // Player joined toast
    socketService.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      if (this.currentScreen === 'lobby') {
        this.showToast(`👋 ${data.player.name} odaya katıldı!`, 'info');
      }
    });

    // Player left toast
    socketService.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      this.showToast(`🚪 ${data.name} odadan ayrıldı.`, 'info');
    });

    // Host changed notification
    socketService.on(SOCKET_EVENTS.HOST_CHANGED, (data) => {
      this.showToast(`👑 ${data.newHost.name} artık yeni oda yöneticisi!`, 'info');
    });

    // Player kicked
    socketService.on(SOCKET_EVENTS.PLAYER_KICKED, (data) => {
      alert(data.reason || 'Yönetici tarafından odadan çıkarıldınız.');
      this.showLogin(null, data.reason);
    });

    // Countdown events
    socketService.on(SOCKET_EVENTS.COUNTDOWN_START, (data) => {
      this.currentScreen = 'countdown';
      renderCountdownScreen(this.screenContainer, data.count);
    });

    socketService.on(SOCKET_EVENTS.COUNTDOWN_TICK, (data) => {
      updateCountdownTick(data.count);
    });

    // Game started
    socketService.on(SOCKET_EVENTS.GAME_STARTED, () => {
      this.currentScreen = 'in_game';
      if (!this.gameScreenInstance) {
        this.gameScreenInstance = new GameScreen(this.screenContainer, {
          roomState: this.roomState,
          currentPlayer: this.currentPlayer
        });
        this.gameScreenInstance.render();
      }
    });

    // Turn started
    socketService.on(SOCKET_EVENTS.TURN_STARTED, (data) => {
      if (this.currentScreen === 'in_game') {
        this.gameScreenInstance?.onTurnStarted(data);
      }
    });

    // Word accepted
    socketService.on(SOCKET_EVENTS.WORD_ACCEPTED, (data) => {
      if (this.currentScreen === 'in_game') {
        this.gameScreenInstance?.onWordAccepted(data);
      }
    });

    // Word rejected
    socketService.on(SOCKET_EVENTS.WORD_REJECTED, (data) => {
      if (this.currentScreen === 'in_game') {
        this.gameScreenInstance?.onWordRejected(data);
      }
    });

    // Bomb exploded
    socketService.on(SOCKET_EVENTS.BOMB_EXPLODED, (data) => {
      if (this.currentScreen === 'in_game') {
        this.gameScreenInstance?.onBombExploded(data);
      }
    });

    // Game over / Results
    socketService.on(SOCKET_EVENTS.GAME_OVER, (data) => {
      this.currentScreen = 'results';
      this.gameScreenInstance?.cleanup();
      this.gameScreenInstance = null;
      renderResultsScreen(this.screenContainer, {
        resultsData: data,
        currentPlayer: this.currentPlayer,
        onLeave: () => this.showLogin()
      });
    });

    // Remote typing mirror
    socketService.on(SOCKET_EVENTS.REMOTE_TYPING, (data) => {
      if (this.currentScreen === 'in_game' && data.playerId !== this.currentPlayer?.id) {
        this.gameScreenInstance?.onRemoteTyping(data.text);
      }
    });

    // Floating emoji reaction
    socketService.on(SOCKET_EVENTS.EMOJI_RECEIVED, (data) => {
      spawnFloatingEmoji(data.emoji);
    });
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast-banner');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast-banner ${type}`;
    toast.classList.remove('hidden');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
  new App();
});

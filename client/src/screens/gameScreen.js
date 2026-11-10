import { socketService } from '../socket.js';
import { BombView } from '../ui/bombView.js';
import { spawnFloatingEmoji } from '../ui/emojiTray.js';
import { sound } from '../audio/soundEffects.js';
import { haptics } from '../ui/haptics.js';
import { REACTIONS, GAME_CONSTANTS } from '@shared/constants.js';

export class GameScreen {
  constructor(container, options = {}) {
    this.container = container;
    this.roomState = options.roomState;
    this.currentPlayer = options.currentPlayer;
    this.bombView = null;
    this.activePlayerId = null;
    this.activePlayerToken = null;
    this.typingDebounce = null;
    this.remoteTypingText = '';
  }

  render() {
    const isSpectator = !this.currentPlayer.isAlive || this.currentPlayer.isSpectator;
    const isMyTurn = this.roomState.activePlayer?.sessionToken === this.currentPlayer.sessionToken;

    this.container.innerHTML = `
      <div class="game-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 10px 14px; justify-content: space-between; position: relative;">
        
        <!-- Top Players Row -->
        <div class="game-players-header" id="game-players-header" style="display: flex; gap: 8px; overflow-x: auto; padding: 6px 2px 10px 2px; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
          ${this.renderPlayersList()}
        </div>

        <!-- Bonus Letters Tracker (if enabled) -->
        ${this.roomState.settings.bonusLives ? `
          <div class="bonus-letters-bar" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(20, 16, 41, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 4px 12px; margin: 0 auto; max-width: 320px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-yellow); margin-right: 2px;">BONUS:</span>
            ${GAME_CONSTANTS.BONUS_LETTERS.map(char => {
              const myLetters = this.currentPlayer.bonusLetters || [];
              const collected = myLetters.includes(char);
              return `
                <span class="bonus-letter-chip ${collected ? 'collected' : ''}" style="width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; border-radius: 4px; background: ${collected ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.08)'}; color: ${collected ? '#000' : 'var(--text-dim)'}; transition: all 0.2s;">
                  ${char}
                </span>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Center Bomb & Syllable Area -->
        <div class="game-center-stage" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; position: relative;">
          <div id="bomb-mount-point" style="width: 100%; max-width: 280px; display: flex; justify-content: center;"></div>
        </div>

        <!-- Live Typing Mirror Bar -->
        <div id="live-typing-mirror" class="live-typing-bar" style="text-align: center; min-height: 28px; margin-bottom: 6px;">
          <span id="typing-text-display" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--accent-yellow); letter-spacing: 2px; text-transform: uppercase;">
            ${this.remoteTypingText}
          </span>
        </div>

        <!-- Recent Words Stream (horizontal pill list) -->
        <div class="recent-words-stream" id="recent-words-stream" style="display: flex; gap: 6px; justify-content: center; overflow-x: hidden; min-height: 26px; margin-bottom: 10px;">
          ${(this.roomState.recentWords || []).slice(0, 3).map(w => `
            <span style="background: rgba(255,255,255,0.07); color: var(--text-muted); font-size: 0.76rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05); text-transform: uppercase;">
              ${w}
            </span>
          `).join('')}
        </div>

        <!-- Bottom Word Input Area (Adjusted for Virtual Keyboard) -->
        <div class="game-input-container" style="padding-bottom: var(--keyboard-offset); transition: padding-bottom 0.15s ease-out;">
          <div id="turn-action-box">
            ${this.renderInputBox(isMyTurn, isSpectator)}
          </div>

          <!-- Bottom Reaction Bar -->
          <div class="game-reactions-tray" style="display: flex; justify-content: space-around; background: rgba(20, 16, 41, 0.95); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 5px 8px; margin-top: 10px;">
            ${REACTIONS.map(emoji => `
              <button type="button" class="btn-game-reaction" data-emoji="${emoji}" style="background: transparent; border: none; font-size: 1.35rem; cursor: pointer; outline: none; padding: 2px;">
                ${emoji}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    // Mount Bomb
    const bombMount = this.container.querySelector('#bomb-mount-point');
    if (bombMount) {
      this.bombView = new BombView(bombMount);
      this.bombView.render(this.roomState.currentSyllable || '...');
    }

    this.bindEvents();

    // If turn in progress on load, start fuse
    if (this.roomState.turnStartTime && this.roomState.fuseDurationMs) {
      this.bombView?.startFuse(this.roomState.turnStartTime, this.roomState.fuseDurationMs);
    }
  }

  renderPlayersList() {
    const activeToken = this.roomState.activePlayer?.sessionToken;

    return this.roomState.players.map(p => {
      const isTurn = p.sessionToken === activeToken;
      const isDead = !p.isAlive || p.lives <= 0;

      // Heart icons
      let heartsHtml = '';
      for (let i = 0; i < this.roomState.settings.lives; i++) {
        if (i < p.lives) {
          heartsHtml += `<span style="color: var(--accent-pink); font-size: 0.72rem;">❤️</span>`;
        } else {
          heartsHtml += `<span style="color: #4a4563; font-size: 0.72rem; opacity: 0.4;">🖤</span>`;
        }
      }

      return `
        <div class="game-player-chip ${isTurn ? 'turn-active-glow' : ''} ${isDead ? 'player-eliminated' : ''}" style="display: flex; flex-direction: column; align-items: center; min-width: 68px; padding: 6px 4px; background: ${isTurn ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)'}; border: 1.5px solid ${isTurn ? 'var(--primary-orange)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); opacity: ${isDead ? 0.35 : 1}; filter: ${isDead ? 'grayscale(0.9)' : 'none'}; transition: all 0.25s;">
          <div style="position: relative;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${p.color || '#333'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              ${isDead ? '💀' : p.avatar}
            </div>
            ${p.isHost ? `<span style="position: absolute; top: -6px; right: -6px; font-size: 0.85rem;">👑</span>` : ''}
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); margin-top: 4px; max-width: 62px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${p.name}
          </span>
          <div style="display: flex; gap: 1px; margin-top: 2px;">
            ${heartsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  renderInputBox(isMyTurn, isSpectator) {
    if (isSpectator) {
      return `
        <div class="spectator-card" style="background: rgba(26, 21, 53, 0.9); border: 1.5px dashed var(--accent-cyan); border-radius: var(--radius-md); padding: 14px; text-align: center;">
          <span style="font-size: 1.3rem;">👀</span>
          <strong style="display: block; font-size: 0.95rem; color: var(--accent-cyan); margin-top: 2px;">İzleyici Modundasın</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Sıradaki oyunda dahil olacaksın. Canlı izleyebilir ve emoji atabilirsin!</span>
        </div>
      `;
    }

    if (isMyTurn) {
      return `
        <form id="word-form" style="display: flex; gap: 8px; width: 100%;">
          <input
            type="text"
            id="word-input"
            class="input-field"
            placeholder="${this.roomState.currentSyllable} içeren kelime yaz..."
            maxlength="25"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-color: var(--primary-orange); box-shadow: 0 0 0 2px var(--primary-orange-glow); flex: 1;"
            autofocus
          />
          <button type="submit" id="btn-submit-word" class="btn btn-primary" style="min-width: 90px; font-size: 1rem;">
            GÖNDER 🔥
          </button>
        </form>
      `;
    } else {
      const activeName = this.roomState.activePlayer?.name || 'Rakip';
      return `
        <div class="waiting-turn-bar" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; text-align: center;">
          <span style="font-size: 0.92rem; color: var(--text-muted);">
            Sıra <strong style="color: var(--primary-orange); font-size: 1rem;">${activeName}</strong> oyuncusunda...
          </span>
        </div>
      `;
    }
  }

  bindEvents() {
    // Form submit
    const wordForm = this.container.querySelector('#word-form');
    const wordInput = this.container.querySelector('#word-input');

    if (wordForm && wordInput) {
      // Focus automatically
      setTimeout(() => wordInput.focus(), 50);

      wordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        sound.ensureContext();
        const word = (wordInput.value || '').trim();
        if (!word) return;

        const res = await socketService.submitWord(word);
        if (res?.success) {
          wordInput.value = '';
          socketService.sendTyping('');
        }
      });

      // Typing event sync
      wordInput.addEventListener('input', (e) => {
        const text = e.target.value.toUpperCase();
        const displayEl = this.container.querySelector('#typing-text-display');
        if (displayEl) displayEl.textContent = text;

        clearTimeout(this.typingDebounce);
        this.typingDebounce = setTimeout(() => {
          socketService.sendTyping(text);
        }, 80);
      });
    }

    // Reaction clicks
    this.container.querySelectorAll('.btn-game-reaction').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.ensureContext();
        const emoji = btn.dataset.emoji;
        socketService.sendEmoji(emoji);
        spawnFloatingEmoji(emoji);
      });
    });
  }

  // Handle incoming new turn
  onTurnStarted(data) {
    const { activePlayer, syllable, fuseDurationMs, turnStartTime } = data;
    this.activePlayerId = activePlayer.id;
    this.activePlayerToken = activePlayer.sessionToken;

    // Update state
    this.roomState.activePlayer = activePlayer;
    this.roomState.currentSyllable = syllable;
    this.roomState.fuseDurationMs = fuseDurationMs;
    this.roomState.turnStartTime = turnStartTime;
    this.remoteTypingText = '';

    // Update players header
    const header = this.container.querySelector('#game-players-header');
    if (header) header.innerHTML = this.renderPlayersList();

    // Update Bomb
    this.bombView?.setSyllable(syllable);
    this.bombView?.startFuse(turnStartTime, fuseDurationMs);

    // Update Input area
    const isSpectator = !this.currentPlayer.isAlive || this.currentPlayer.isSpectator;
    const isMyTurn = this.activePlayerToken === this.currentPlayer.sessionToken;
    const actionBox = this.container.querySelector('#turn-action-box');
    if (actionBox) {
      actionBox.innerHTML = this.renderInputBox(isMyTurn, isSpectator);
      this.bindEvents();
    }

    const typingEl = this.container.querySelector('#typing-text-display');
    if (typingEl) typingEl.textContent = '';

    // If it's my turn, vibrate and notify
    if (isMyTurn) {
      haptics.yourTurn();
      sound.playCountdownBeep(true);
      const input = this.container.querySelector('#word-input');
      if (input) {
        input.focus();
        input.placeholder = `"${syllable}" içeren kelime yaz!`;
      }
    }
  }

  // Remote typing sync
  onRemoteTyping(text) {
    this.remoteTypingText = text;
    const displayEl = this.container.querySelector('#typing-text-display');
    if (displayEl) {
      displayEl.textContent = text;
    }
  }

  // Word accepted
  onWordAccepted(data) {
    sound.playCorrect();
    haptics.success();

    // Show accepted toast
    this.showToast(`✅ "${data.word}" kabul edildi! (${data.timeSeconds}s)`, 'success');

    // Add to recent words
    const stream = this.container.querySelector('#recent-words-stream');
    if (stream) {
      const chip = document.createElement('span');
      chip.style.cssText = 'background: rgba(16, 185, 129, 0.2); color: var(--accent-green); font-size: 0.76rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--accent-green); text-transform: uppercase; animation: modalPop 0.2s ease-out;';
      chip.textContent = data.word;
      stream.insertBefore(chip, stream.firstChild);
      if (stream.children.length > 3) {
        stream.removeChild(stream.lastChild);
      }
    }

    if (data.bonusAwarded) {
      sound.playBonus();
      this.showToast(`⭐ Tebrikler! Özel harfleri tamamlayarak +1 Can kazandın!`, 'info');
    }
  }

  // Word rejected
  onWordRejected(data) {
    sound.playWrong();
    haptics.error();
    this.showToast(`❌ ${data.error}`, 'error');

    const input = this.container.querySelector('#word-input');
    if (input) {
      input.classList.remove('shake-screen');
      void input.offsetWidth;
      input.classList.add('shake-screen');
      setTimeout(() => input.classList.remove('shake-screen'), 600);
    }
  }

  // Bomb exploded
  onBombExploded(data) {
    sound.playExplosion();
    haptics.explosion();
    this.bombView?.triggerExplosionAnimation();

    const victimName = data.player.name;
    const isMe = data.player.id === this.currentPlayer.id;

    if (data.player.isEliminated) {
      this.showToast(`💥 BOMBA PATLADI! ${victimName} elendi!`, 'error');
    } else {
      this.showToast(`💥 BOMBA PATLADI! ${victimName} 1 can kaybetti!`, 'error');
    }

    if (isMe && data.player.isEliminated) {
      this.currentPlayer.isAlive = false;
      this.currentPlayer.isSpectator = true;
    }
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
    }, 2500);
  }

  cleanup() {
    this.bombView?.stop();
  }
}

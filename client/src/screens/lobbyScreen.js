import { socketService } from '../socket.js';
import { showSettingsModal } from './settingsModal.js';
import { showRulesModal } from './rulesModal.js';
import { spawnFloatingEmoji } from '../ui/emojiTray.js';
import { sound } from '../audio/soundEffects.js';
import { REACTIONS, GAME_CONSTANTS } from '@shared/constants.js';

export function renderLobbyScreen(container, options = {}) {
  const { roomState, currentPlayer, onLeave } = options;

  const isHost = currentPlayer.isHost;
  const connectedPlayers = roomState.players.filter(p => p.connected);
  const canStart = connectedPlayers.length >= GAME_CONSTANTS.MIN_PLAYERS;

  const currentUrl = `${window.location.origin}/?oda=${roomState.code}`;

  container.innerHTML = `
    <div class="lobby-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 16px; justify-content: space-between;">
      
      <!-- Top Room Code Card -->
      <div class="room-code-card" style="background: var(--bg-surface-elevated); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">
          Oda Kodu
        </span>
        <div class="room-code-display" style="font-family: var(--font-heading); font-size: 2.8rem; font-weight: 800; color: var(--accent-yellow); letter-spacing: 4px; margin: 4px 0 10px 0; text-shadow: 0 0 20px rgba(255, 183, 3, 0.4);">
          ${roomState.code}
        </div>

        <div style="display: flex; gap: 8px; justify-content: center;">
          <button id="btn-copy-code" class="btn btn-secondary btn-sm" style="flex: 1;">
            📋 Kodu Kopyala
          </button>
          <button id="btn-share-link" class="btn btn-secondary btn-sm" style="flex: 1;">
            🔗 Paylaş
          </button>
        </div>
      </div>

      <!-- Settings Overview Bar -->
      <div class="settings-summary-bar" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 8px 14px; margin: 10px 0;">
        <div class="settings-badges" style="display: flex; gap: 8px; font-size: 0.82rem; font-weight: 600;">
          <span style="background: rgba(255, 42, 109, 0.15); color: var(--accent-pink); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${roomState.settings.lives} ❤️
          </span>
          <span style="background: rgba(255, 183, 3, 0.15); color: var(--accent-yellow); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${GAME_CONSTANTS.SPEED_MODES[roomState.settings.speed]?.label || 'Normal'} ⚡
          </span>
          <span style="background: rgba(16, 185, 129, 0.15); color: var(--accent-green); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${roomState.settings.bonusLives ? 'Bonus Açık ⭐' : 'Bonus Kapalı'}
          </span>
        </div>

        ${isHost ? `
          <button id="btn-open-settings" class="btn btn-secondary btn-sm" style="min-height: 32px; padding: 0 10px; font-size: 0.82rem;">
            ⚙️ Ayarlar
          </button>
        ` : ''}
      </div>

      <!-- Player List Area -->
      <div class="lobby-players-wrapper" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px;">
          <span style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-main);">
            Oyuncular
          </span>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); background: rgba(0, 240, 255, 0.1); padding: 2px 10px; border-radius: var(--radius-full);">
            ${connectedPlayers.length} / ${GAME_CONSTANTS.MAX_PLAYERS}
          </span>
        </div>

        <!-- Scrollable Player List -->
        <div id="lobby-player-list" class="players-scroll-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
          ${connectedPlayers.map(p => `
            <div class="player-lobby-row" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 14px; animation: modalPop 0.25s ease-out;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="player-avatar-badge" style="width: 42px; height: 42px; background: ${p.color || '#333'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.2);">
                  ${p.avatar || '💣'}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 700; font-size: 0.98rem; color: var(--text-main);">
                      ${p.name}
                    </span>
                    ${p.sessionToken === currentPlayer.sessionToken ? `
                      <span style="font-size: 0.72rem; background: rgba(255,255,255,0.12); color: var(--text-muted); padding: 1px 6px; border-radius: 4px;">(Sen)</span>
                    ` : ''}
                    ${p.isHost ? `
                      <span title="Oda Yöneticisi" style="font-size: 1rem; filter: drop-shadow(0 0 6px gold);">👑</span>
                    ` : ''}
                  </div>
                  <span style="font-size: 0.78rem; color: var(--accent-green); font-weight: 600;">Hazır</span>
                </div>
              </div>

              <!-- Host kick action -->
              ${isHost && p.sessionToken !== currentPlayer.sessionToken ? `
                <button class="icon-btn btn-kick-player" data-token="${p.sessionToken}" data-name="${p.name}" title="Odadan At" style="width: 34px; height: 34px; font-size: 0.85rem; color: var(--accent-red); border-color: rgba(239, 68, 68, 0.3);">
                  🚫
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Emoji Floating Reaction Bar -->
      <div class="lobby-reactions-bar" style="display: flex; justify-content: space-around; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 6px 10px; margin-bottom: 14px;">
        ${REACTIONS.map(emoji => `
          <button type="button" class="btn-send-reaction" data-emoji="${emoji}" style="background: transparent; border: none; font-size: 1.45rem; cursor: pointer; transition: transform 0.15s; outline: none; padding: 2px 4px;">
            ${emoji}
          </button>
        `).join('')}
      </div>

      <!-- Bottom Host / Player Action -->
      <div class="lobby-bottom-actions">
        ${isHost ? `
          <button id="btn-start-game" class="btn btn-primary btn-block btn-lg" ${!canStart ? 'disabled' : ''}>
            ${canStart ? '🔥 Oyunu Başlat' : 'En az 2 oyuncu gerekli'}
          </button>
        ` : `
          <div class="waiting-host-card" style="background: var(--bg-surface); border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 14px; text-align: center;">
            <div style="font-size: 1.2rem; margin-bottom: 4px; animation: floatUp 2s infinite alternate ease-in-out;">⏳</div>
            <strong style="font-size: 0.95rem; color: var(--text-main); display: block;">Yönetici oyunu başlatmayı bekliyor...</strong>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Yönetici butona bastığında oyun 3-2-1 ile başlar.</span>
          </div>
        `}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <button id="btn-leave-room" class="btn btn-secondary btn-sm" style="color: var(--accent-red); background: transparent; border: none;">
            🚪 Odadan Ayrıl
          </button>
          <button id="btn-lobby-rules" class="btn btn-secondary btn-sm" style="color: var(--accent-yellow); background: transparent; border: none;">
            ❓ Kurallar
          </button>
        </div>
      </div>
    </div>
  `;

  // Copy code handler
  const btnCopy = container.querySelector('#btn-copy-code');
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      sound.ensureContext();
      try {
        await navigator.clipboard.writeText(roomState.code);
        btnCopy.textContent = '✅ Kopyalandı!';
        setTimeout(() => { btnCopy.textContent = '📋 Kodu Kopyala'; }, 1800);
      } catch (err) {
        btnCopy.textContent = roomState.code;
      }
    });
  }

  // Web Share link handler
  const btnShare = container.querySelector('#btn-share-link');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      sound.ensureContext();
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Kelime Bombası - Odaya Katıl!',
            text: `Kelime Bombası'nda odaya davetlisin! Kod: ${roomState.code}`,
            url: currentUrl
          });
        } catch (e) {
          // User cancelled
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(currentUrl);
        btnShare.textContent = '✅ Link Kopyalandı!';
        setTimeout(() => { btnShare.textContent = '🔗 Paylaş'; }, 1800);
      }
    });
  }

  // Settings modal trigger (Host only)
  container.querySelector('#btn-open-settings')?.addEventListener('click', () => {
    sound.ensureContext();
    showSettingsModal(roomState.settings, (updated) => {
      roomState.settings = updated;
    });
  });

  // Start game trigger (Host only)
  const btnStart = container.querySelector('#btn-start-game');
  if (btnStart && isHost) {
    btnStart.addEventListener('click', async () => {
      sound.ensureContext();
      btnStart.disabled = true;
      btnStart.textContent = 'Başlatılıyor...';
      const res = await socketService.startGame();
      if (!res?.success) {
        alert(res?.error || 'Oyun başlatılamadı.');
        btnStart.disabled = false;
        btnStart.textContent = '🔥 Oyunu Başlat';
      }
    });
  }

  // Kick player handlers (Host only)
  container.querySelectorAll('.btn-kick-player').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.ensureContext();
      const targetToken = btn.dataset.token;
      const targetName = btn.dataset.name;

      const modalContainer = document.getElementById('modal-container');
      if (!modalContainer) return;

      modalContainer.innerHTML = `
        <div class="modal-content" style="text-align: center;">
          <span style="font-size: 2.2rem;">⚠️</span>
          <h3 style="margin: 8px 0;">Oyuncuyu At?</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
            <strong>${targetName}</strong> adlı oyuncuyu odadan atmak istediğinize emin misiniz? Bu odaya tekrar giremeyecek.
          </p>
          <div style="display: flex; gap: 10px;">
            <button id="btn-cancel-kick" class="btn btn-secondary" style="flex: 1;">Vazgeç</button>
            <button id="btn-confirm-kick" class="btn btn-danger" style="flex: 1;">Odadan At 🚫</button>
          </div>
        </div>
      `;
      modalContainer.classList.remove('hidden');

      const closeKickModal = () => {
        modalContainer.classList.add('hidden');
        modalContainer.innerHTML = '';
      };

      document.getElementById('btn-cancel-kick')?.addEventListener('click', closeKickModal);
      document.getElementById('btn-confirm-kick')?.addEventListener('click', async () => {
        closeKickModal();
        await socketService.kickPlayer(targetToken);
      });
    });
  });

  // Reaction click handlers
  container.querySelectorAll('.btn-send-reaction').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sound.ensureContext();
      btn.style.transform = 'scale(1.4)';
      setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);

      const emoji = btn.dataset.emoji;
      socketService.sendEmoji(emoji);
      spawnFloatingEmoji(emoji);
    });
  });

  // Rules Modal
  container.querySelector('#btn-lobby-rules')?.addEventListener('click', () => {
    sound.ensureContext();
    showRulesModal();
  });

  // Leave room
  container.querySelector('#btn-leave-room')?.addEventListener('click', () => {
    sound.ensureContext();
    socketService.leaveRoom();
    if (onLeave) onLeave();
  });
}

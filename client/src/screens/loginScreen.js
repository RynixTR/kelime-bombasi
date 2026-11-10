import { socketService } from '../socket.js';
import { AVATARS } from '@shared/constants.js';
import { showRulesModal } from './rulesModal.js';
import { sound } from '../audio/soundEffects.js';

export function renderLoginScreen(container, options = {}) {
  const { onJoined, inviteCode, initialError } = options;

  let savedNickname = localStorage.getItem('kb_nickname') || '';
  let savedAvatarId = localStorage.getItem('kb_avatar') || 'bomb';
  let selectedAvatar = AVATARS.find(a => a.id === savedAvatarId) || AVATARS[0];

  const prefillRoomCode = (inviteCode || '').trim().toUpperCase();

  container.innerHTML = `
    <div class="login-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 20px; justify-content: space-between;">
      <!-- Hero Header -->
      <div class="login-hero" style="text-align: center; margin-top: 10px;">
        <div class="hero-bomb-icon" style="font-size: 3.5rem; margin-bottom: 8px; filter: drop-shadow(0 0 16px var(--primary-orange-glow)); animation: floatUp 3s infinite alternate ease-in-out;">
          💣
        </div>
        <h1 style="font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; color: var(--text-main);">
          Kelime <span style="color: var(--primary-orange);">Bombası</span>
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">
          Bomba elinde kalmasın, kelimeni bul ve devret! 🔥
        </p>
      </div>

      <!-- Main Input Card -->
      <div class="login-card" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); margin: 15px 0;">
        ${prefillRoomCode ? `
          <div class="invite-banner" style="background: rgba(0, 240, 255, 0.12); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 10px 14px; text-align: center; margin-bottom: 16px;">
            <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 700;">
              🎉 <strong>${prefillRoomCode}</strong> nolu odaya davetlisin!
            </span>
          </div>
        ` : ''}

        <!-- Nickname Input -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="input-nickname">Oyuncu Adın</label>
          <div style="position: relative;">
            <input
              type="text"
              id="input-nickname"
              class="input-field"
              placeholder="Adını yaz (ör: Can, Zeynep)"
              maxlength="14"
              value="${savedNickname}"
              autocomplete="nickname"
              autofocus
            />
          </div>
        </div>

        <!-- Avatar Chooser -->
        <div class="form-group" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="form-label">Avatarın</label>
            <span id="selected-avatar-label" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              ${selectedAvatar.label}
            </span>
          </div>
          <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 6px;">
            ${AVATARS.map(avatar => `
              <button
                type="button"
                class="avatar-option-btn ${avatar.id === selectedAvatar.id ? 'active-avatar' : ''}"
                data-id="${avatar.id}"
                style="min-height: 44px; background: ${avatar.id === selectedAvatar.id ? 'var(--primary-orange)' : 'var(--bg-surface)'}; border: 1.5px solid ${avatar.id === selectedAvatar.id ? '#fff' : 'var(--border-subtle)'}; border-radius: var(--radius-md); font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
              >
                ${avatar.emoji}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Error display area -->
        <div id="login-error-msg" class="login-error-box" style="display: ${initialError ? 'block' : 'none'}; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); color: #fca5a5; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; font-weight: 600; text-align: center; margin-bottom: 16px;">
          ${initialError || ''}
        </div>

        <!-- Action Buttons -->
        ${prefillRoomCode ? `
          <!-- If invited via link, primary action is to Join immediately -->
          <button id="btn-join-invite" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 10px;">
            🚀 Odaya Katıl
          </button>
          <button id="btn-create-instead" class="btn btn-secondary btn-block">
            Veya Yeni Oda Kur ➕
          </button>
        ` : `
          <!-- Normal Entry: Create or Join -->
          <button id="btn-create-room" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 14px;">
            👑 Oda Kur ve Başla
          </button>

          <div style="display: flex; align-items: center; gap: 12px; margin: 12px 0;">
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim);">VEYA</span>
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          </div>

          <div style="display: flex; gap: 8px;">
            <input
              type="text"
              id="input-room-code"
              class="input-field"
              placeholder="Oda Kodu (ör: ABCD)"
              maxlength="4"
              style="text-transform: uppercase; font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; letter-spacing: 2px; text-align: center; flex: 1;"
            />
            <button id="btn-join-room" class="btn btn-secondary" style="min-width: 90px;">
              Katıl 🚀
            </button>
          </div>
        `}
      </div>

      <!-- Footer / How to play -->
      <div class="login-footer" style="text-align: center; margin-bottom: 10px;">
        <button id="btn-open-rules" class="btn btn-secondary btn-sm" style="background: transparent; border: none; color: var(--accent-yellow); font-size: 0.9rem;">
          ❓ Nasıl Oynanır?
        </button>
      </div>
    </div>
  `;

  // Avatar Selection Handlers
  const avatarButtons = container.querySelectorAll('.avatar-option-btn');
  const avatarLabel = container.querySelector('#selected-avatar-label');

  avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.ensureContext();
      const id = btn.dataset.id;
      selectedAvatar = AVATARS.find(a => a.id === id) || AVATARS[0];
      localStorage.setItem('kb_avatar', id);

      avatarButtons.forEach(b => {
        b.style.background = 'var(--bg-surface)';
        b.style.borderColor = 'var(--border-subtle)';
      });
      btn.style.background = 'var(--primary-orange)';
      btn.style.borderColor = '#fff';

      if (avatarLabel) avatarLabel.textContent = selectedAvatar.label;
    });
  });

  const getNickname = () => {
    const input = container.querySelector('#input-nickname');
    const val = (input?.value || '').trim();
    if (val) {
      localStorage.setItem('kb_nickname', val);
    }
    return val;
  };

  const showError = (msg) => {
    const errBox = container.querySelector('#login-error-msg');
    if (errBox) {
      errBox.textContent = msg;
      errBox.style.display = 'block';
    }
  };

  // Create Room Click
  const btnCreate = container.querySelector('#btn-create-room');
  if (btnCreate) {
    btnCreate.addEventListener('click', async () => {
      sound.ensureContext();
      const name = getNickname();
      if (!name) {
        showError('Lütfen bir oyuncu adı giriniz.');
        return;
      }
      btnCreate.disabled = true;
      btnCreate.textContent = 'Oda Kuruluyor...';

      const res = await socketService.createRoom({
        name,
        avatar: selectedAvatar.emoji,
        color: selectedAvatar.color
      });

      if (res?.success) {
        onJoined(res.roomState, res.player);
      } else {
        showError(res?.error || 'Oda kurulamadı.');
        btnCreate.disabled = false;
        btnCreate.textContent = '👑 Oda Kur ve Başla';
      }
    });
  }

  // Join Room Click
  const btnJoin = container.querySelector('#btn-join-room');
  const inputRoomCode = container.querySelector('#input-room-code');
  if (btnJoin && inputRoomCode) {
    btnJoin.addEventListener('click', async () => {
      sound.ensureContext();
      const name = getNickname();
      const code = (inputRoomCode.value || '').trim().toUpperCase();

      if (!name) {
        showError('Lütfen bir oyuncu adı giriniz.');
        return;
      }
      if (!code || code.length !== 4) {
        showError('Lütfen 4 harfli geçerli bir oda kodu giriniz.');
        return;
      }

      btnJoin.disabled = true;
      btnJoin.textContent = '...';

      const res = await socketService.joinRoom(code, {
        name,
        avatar: selectedAvatar.emoji,
        color: selectedAvatar.color
      });

      if (res?.success) {
        onJoined(res.roomState, res.player);
      } else {
        showError(res?.error || 'Odaya katılamadı.');
        btnJoin.disabled = false;
        btnJoin.textContent = 'Katıl 🚀';
      }
    });

    // Enter key inside room code input
    inputRoomCode.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') btnJoin.click();
    });
  }

  // Join Invite Click (when prefilled)
  const btnJoinInvite = container.querySelector('#btn-join-invite');
  if (btnJoinInvite) {
    btnJoinInvite.addEventListener('click', async () => {
      sound.ensureContext();
      const name = getNickname();
      if (!name) {
        showError('Lütfen bir oyuncu adı giriniz.');
        return;
      }
      btnJoinInvite.disabled = true;
      btnJoinInvite.textContent = 'Katılınıyor...';

      const res = await socketService.joinRoom(prefillRoomCode, {
        name,
        avatar: selectedAvatar.emoji,
        color: selectedAvatar.color
      });

      if (res?.success) {
        onJoined(res.roomState, res.player);
      } else {
        showError(res?.error || 'Odaya katılamadı.');
        btnJoinInvite.disabled = false;
        btnJoinInvite.textContent = '🚀 Odaya Katıl';
      }
    });
  }

  const btnCreateInstead = container.querySelector('#btn-create-instead');
  if (btnCreateInstead) {
    btnCreateInstead.addEventListener('click', () => {
      renderLoginScreen(container, { onJoined, inviteCode: null });
    });
  }

  // Rules Modal Trigger
  container.querySelector('#btn-open-rules')?.addEventListener('click', () => {
    sound.ensureContext();
    showRulesModal();
  });
}

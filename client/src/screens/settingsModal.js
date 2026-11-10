import { socketService } from '../socket.js';
import { GAME_CONSTANTS } from '@shared/constants.js';

export function showSettingsModal(currentSettings, onSaved = () => {}) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  let localSettings = { ...currentSettings };

  modalContainer.innerHTML = `
    <div class="modal-content">
      <button class="modal-close-btn" id="btn-close-settings" aria-label="Kapat">&times;</button>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 2rem;">⚙️</span>
        <h2 style="font-size: 1.4rem; margin-top: 4px;">Oda Ayarları</h2>
      </div>

      <!-- Lives Selector -->
      <div class="form-group" style="margin-bottom: 18px;">
        <label class="form-label">Başlangıç Canı: <span id="lives-val" style="color: var(--accent-pink); font-size: 1.1rem; font-weight: 800;">${localSettings.lives} ❤️</span></label>
        <div style="display: flex; gap: 8px;">
          ${[1, 2, 3, 4, 5].map(num => `
            <button type="button" class="btn btn-secondary setting-live-btn ${localSettings.lives === num ? 'active-setting' : ''}" data-val="${num}" style="flex: 1; min-height: 44px; padding: 0;">
              ${num}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Speed / Difficulty Selector -->
      <div class="form-group" style="margin-bottom: 18px;">
        <label class="form-label">Hız Seviyesi</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${Object.entries(GAME_CONSTANTS.SPEED_MODES).map(([key, mode]) => `
            <label class="speed-option-card ${localSettings.speed === key ? 'active-speed' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1.5px solid ${localSettings.speed === key ? 'var(--primary-orange)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); cursor: pointer;">
              <div>
                <strong style="display: block; font-size: 0.95rem; color: var(--text-main);">${mode.label}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${mode.description}</span>
              </div>
              <input type="radio" name="speed_mode" value="${key}" ${localSettings.speed === key ? 'checked' : ''} style="accent-color: var(--primary-orange); width: 18px; height: 18px;" />
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Bonus Lives Toggle -->
      <div class="form-group" style="margin-bottom: 22px;">
        <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); cursor: pointer;">
          <div>
            <strong style="display: block; font-size: 0.95rem; color: var(--text-main);">Bonus Canlar ⭐</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Özel harfleri toplayan oyuncuya +1 can</span>
          </div>
          <input type="checkbox" id="bonus-lives-toggle" ${localSettings.bonusLives ? 'checked' : ''} style="accent-color: var(--accent-green); width: 20px; height: 20px;" />
        </label>
      </div>

      <button id="btn-save-settings" class="btn btn-primary btn-block">
        Ayarları Kaydet ✨
      </button>
    </div>
  `;

  modalContainer.classList.remove('hidden');

  // Handle lives clicks
  modalContainer.querySelectorAll('.setting-live-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localSettings.lives = parseInt(btn.dataset.val, 10);
      modalContainer.querySelectorAll('.setting-live-btn').forEach(b => b.classList.remove('active-setting'));
      btn.classList.add('active-setting');
      const valEl = document.getElementById('lives-val');
      if (valEl) valEl.textContent = `${localSettings.lives} ❤️`;
    });
  });

  // Handle speed change
  modalContainer.querySelectorAll('input[name="speed_mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      localSettings.speed = e.target.value;
      modalContainer.querySelectorAll('.speed-option-card').forEach(card => {
        card.style.borderColor = 'var(--border-subtle)';
      });
      radio.closest('.speed-option-card').style.borderColor = 'var(--primary-orange)';
    });
  });

  // Handle bonus toggle
  const bonusToggle = document.getElementById('bonus-lives-toggle');
  if (bonusToggle) {
    bonusToggle.addEventListener('change', (e) => {
      localSettings.bonusLives = e.target.checked;
    });
  }

  const close = () => {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
  };

  document.getElementById('btn-close-settings')?.addEventListener('click', close);

  document.getElementById('btn-save-settings')?.addEventListener('click', async () => {
    const res = await socketService.updateSettings(localSettings);
    if (res?.success) {
      onSaved(localSettings);
      close();
    }
  });
}

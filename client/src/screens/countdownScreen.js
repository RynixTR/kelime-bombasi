import { sound } from '../audio/soundEffects.js';
import { haptics } from '../ui/haptics.js';

export function renderCountdownScreen(container, count = 3) {
  container.innerHTML = `
    <div class="countdown-screen-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; padding: 20px;">
      <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-yellow); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
        Oyun Başlıyor!
      </div>

      <div id="countdown-number" style="font-family: var(--font-heading); font-size: 7.5rem; font-weight: 800; color: var(--primary-orange); text-shadow: 0 0 35px var(--primary-orange-glow); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); line-height: 1;">
        ${count}
      </div>

      <p style="color: var(--text-muted); font-size: 1rem; margin-top: 24px;">
        İlk hece hazırlanıyor... Nefesini tut! 💣
      </p>
    </div>
  `;

  sound.playCountdownBeep(count === 1);
  haptics.yourTurn();
}

export function updateCountdownTick(count) {
  const el = document.getElementById('countdown-number');
  if (el) {
    el.textContent = count > 0 ? count : 'BAŞLA! 🔥';
    el.style.animation = 'none';
    void el.offsetWidth; // reflow
    el.style.animation = 'modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    sound.playCountdownBeep(count <= 1);
    haptics.yourTurn();
  }
}

export function showRulesModal() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-content">
      <button class="modal-close-btn" id="btn-close-rules" aria-label="Kapat">&times;</button>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 2.5rem;">💣</span>
        <h2 style="font-size: 1.5rem; margin-top: 6px;">Nasıl Oynanır?</h2>
      </div>

      <div class="rules-steps" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px;">
        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--primary-orange); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">1</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Sırası gelen oyuncuya <strong>rastgele bir hece</strong> verilir (ör: <em>"KAR"</em>, <em>"TAN"</em>).
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-yellow); color: #000; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">2</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Bu heceyi <strong>İÇEREN</strong> geçerli bir Türkçe kelime yaz (ör: <em>karpuz</em>, <em>makarna</em>).
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-pink); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">3</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Doğru kelimeyle bomba sonrakine geçer. <strong>Fitil bitmeden</strong> yazamazsan bomba elinde patlar ve can kaybedersin!
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-green); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">4</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Bir oyunda kelimeler <strong>ikinci kez kullanılamaz</strong>. Son hayatta kalan şampiyon olur! 👑
          </p>
        </div>
      </div>

      <button id="btn-rules-got-it" class="btn btn-primary btn-block">
        Anladım, Hazırım! 🔥
      </button>
    </div>
  `;

  modalContainer.classList.remove('hidden');

  const close = () => {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
  };

  document.getElementById('btn-close-rules')?.addEventListener('click', close);
  document.getElementById('btn-rules-got-it')?.addEventListener('click', close);
}

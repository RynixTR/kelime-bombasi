import { socketService } from '../socket.js';
import { fireVictoryConfetti } from '../ui/confetti.js';
import { sound } from '../audio/soundEffects.js';

export function renderResultsScreen(container, options = {}) {
  const { resultsData, currentPlayer, onLeave } = options;
  const { winner, rankings = [], stats = {} } = resultsData;

  const isHost = currentPlayer.isHost;

  container.innerHTML = `
    <div class="results-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 16px; justify-content: space-between; overflow-y: auto;">
      
      <!-- Winner Celebration Podium -->
      <div class="winner-podium-card" style="text-align: center; margin: 10px 0 16px 0; background: var(--bg-surface-elevated); border: 2px solid var(--accent-yellow); border-radius: var(--radius-lg); padding: 20px; box-shadow: 0 10px 30px rgba(255, 183, 3, 0.25); animation: modalPop 0.4s ease-out;">
        <span style="font-size: 2.2rem; display: block; filter: drop-shadow(0 0 10px gold); margin-bottom: 4px;">👑</span>
        <div class="winner-avatar" style="width: 76px; height: 76px; border-radius: 50%; background: ${winner?.color || '#FF3B30'}; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto 10px auto; border: 3px solid #fff; box-shadow: 0 0 25px rgba(255, 183, 3, 0.6);">
          ${winner?.avatar || '🎉'}
        </div>
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-yellow); text-transform: uppercase; letter-spacing: 2px;">
          ŞAMPİYON
        </span>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 2px;">
          ${winner ? winner.name : 'Berabere!'}
        </h2>
      </div>

      <!-- Match Highlight Stats -->
      <div class="match-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">TOPLAM KELİME</span>
          <strong style="font-size: 1.25rem; color: var(--accent-cyan);">${stats.totalWords || 0}</strong>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">EN UZUN</span>
          <strong style="font-size: 0.95rem; color: var(--accent-green); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${stats.longestWord?.word || '-'}
          </strong>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${stats.longestWord?.player || ''}</span>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">EN HIZLI</span>
          <strong style="font-size: 1rem; color: var(--primary-orange); display: block;">
            ${stats.fastestAnswer?.timeSeconds && stats.fastestAnswer.timeSeconds < 900 ? `${stats.fastestAnswer.timeSeconds}s` : '-'}
          </strong>
          <span style="font-size: 0.7rem; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">
            ${stats.fastestAnswer?.player || ''}
          </span>
        </div>
      </div>

      <!-- Rankings Table -->
      <div class="leaderboard-section" style="flex: 1; margin-bottom: 16px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;">
          Sıralama
        </span>
        <div class="rankings-list" style="display: flex; flex-direction: column; gap: 6px;">
          ${rankings.map(r => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); border: 1px solid ${r.isWinner ? 'var(--accent-yellow)' : 'var(--border-subtle)'}; border-radius: var(--radius-md); padding: 8px 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; width: 22px; color: ${r.rank === 1 ? 'gold' : r.rank === 2 ? '#c0c0c0' : r.rank === 3 ? '#cd7f32' : 'var(--text-dim)'};">
                  #${r.rank}
                </span>
                <span style="font-size: 1.25rem;">${r.avatar}</span>
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  ${r.name}
                  ${r.id === currentPlayer.id ? '<span style="font-size: 0.72rem; color: var(--text-muted);">(Sen)</span>' : ''}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-pink);">
                  ${r.lives > 0 ? `${r.lives} ❤️` : '💀'}
                </span>
                <strong style="font-family: var(--font-heading); font-size: 1rem; color: var(--text-main);">
                  ${r.score} P
                </strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Actions -->
      <div class="results-actions" style="margin-top: 8px;">
        ${isHost ? `
          <button id="btn-play-again" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 10px;">
            🔄 Tekrar Oyna
          </button>
        ` : `
          <div style="text-align: center; font-size: 0.9rem; color: var(--text-muted); background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); margin-bottom: 10px; border: 1px dashed var(--border-subtle);">
            ⏳ Yöneticinin yeni oyunu başlatması bekleniyor...
          </div>
        `}

        <button id="btn-leave-results" class="btn btn-secondary btn-block">
          🚪 Lobiden Ayrıl
        </button>
      </div>

    </div>
  `;

  // Confetti and triumph sound!
  fireVictoryConfetti();
  sound.playVictory();

  // Play Again click (Host only)
  container.querySelector('#btn-play-again')?.addEventListener('click', async () => {
    sound.ensureContext();
    const btn = container.querySelector('#btn-play-again');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Başlatılıyor...';
    }
    await socketService.playAgain();
  });

  // Leave room click
  container.querySelector('#btn-leave-results')?.addEventListener('click', () => {
    sound.ensureContext();
    socketService.leaveRoom();
    if (onLeave) onLeave();
  });
}

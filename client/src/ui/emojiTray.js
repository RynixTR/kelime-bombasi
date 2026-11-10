// Floating Emoji Cannon Layer for Live Reactions

export function spawnFloatingEmoji(emoji, startXPercent = null) {
  const layer = document.getElementById('emoji-layer');
  if (!layer) return;

  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.textContent = emoji;

  // Random horizontal position around tap or center
  const posX = startXPercent !== null 
    ? Math.min(85, Math.max(15, startXPercent + (Math.random() * 14 - 7)))
    : Math.floor(Math.random() * 70) + 15;

  el.style.left = `${posX}%`;
  el.style.bottom = '80px';

  layer.appendChild(el);

  // Auto remove after animation completes
  setTimeout(() => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 2900);
}

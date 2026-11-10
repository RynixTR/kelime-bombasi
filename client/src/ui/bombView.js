// Dynamic SVG Bomb Component with realistic burning fuse and heat pulsation
import { sound } from '../audio/soundEffects.js';

export class BombView {
  constructor(containerEl) {
    this.container = containerEl;
    this.element = null;
    this.fusePath = null;
    this.sparkEl = null;
    this.syllableEl = null;
    this.fuseLength = 0;
    this.animationFrame = null;
    this.turnStartTime = 0;
    this.fuseDuration = 0;
    this.lastTickTime = 0;
  }

  render(syllable = '...') {
    this.container.innerHTML = `
      <div class="bomb-wrapper" id="bomb-wrapper">
        <svg class="bomb-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Bomb Body Gradient -->
            <radialGradient id="bombSurfaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#4a3b68" />
              <stop offset="45%" stop-color="#231b3e" />
              <stop offset="100%" stop-color="#0f0c1d" />
            </radialGradient>

            <!-- Hot Ember Glow on Critical -->
            <radialGradient id="bombCriticalGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ff7b00" />
              <stop offset="35%" stop-color="#d90429" />
              <stop offset="85%" stop-color="#4d0519" />
              <stop offset="100%" stop-color="#1a040b" />
            </radialGradient>

            <!-- Spark Gradient -->
            <radialGradient id="sparkFlame" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="30%" stop-color="#ffeb3b" />
              <stop offset="70%" stop-color="#ff3d00" />
              <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <filter id="bombGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Shadow underneath -->
          <ellipse cx="160" cy="290" rx="90" ry="18" fill="rgba(0,0,0,0.5)" filter="url(#bombGlow)" />

          <!-- Fuse Path (Starts from spark down into the bomb neck) -->
          <path id="svg-fuse-path"
            d="M 235 65 C 220 35, 175 40, 180 85 C 185 110, 170 120, 160 125"
            fill="none"
            stroke="#a3927d"
            stroke-width="7"
            stroke-linecap="round"
            stroke-dasharray="200"
            stroke-dashoffset="0"
          />

          <!-- Bomb Neck / Collar -->
          <rect x="145" y="118" width="30" height="20" rx="4" fill="#3b2d54" stroke="#5a4580" stroke-width="2" />

          <!-- Main Bomb Body Circle -->
          <circle id="svg-bomb-sphere" cx="160" cy="210" r="82" fill="url(#bombSurfaceGrad)" stroke="#ff4500" stroke-width="3" />

          <!-- Specular Highlight for 3D depth -->
          <ellipse cx="132" cy="178" rx="28" ry="16" transform="rotate(-30 132 178)" fill="rgba(255,255,255,0.18)" />

          <!-- Burning Spark & Particle Group -->
          <g id="svg-spark-group" class="spark-animated">
            <circle id="svg-spark-glow" cx="235" cy="65" r="22" fill="url(#sparkFlame)" filter="url(#bombGlow)" />
            <polygon points="235,42 240,58 256,58 243,68 248,84 235,74 222,84 227,68 214,58 230,58" fill="#fffb00" />
          </g>
        </svg>

        <!-- Dynamic Glowing Syllable Tag -->
        <div class="syllable-display-box" id="syllable-box">
          <span class="syllable-label">İÇEREN KELİME YAZ</span>
          <span class="syllable-text" id="syllable-text">${syllable}</span>
        </div>
      </div>
    `;

    this.element = this.container.querySelector('#bomb-wrapper');
    this.fusePath = this.container.querySelector('#svg-fuse-path');
    this.sparkEl = this.container.querySelector('#svg-spark-group');
    this.syllableEl = this.container.querySelector('#syllable-text');
    this.sphereEl = this.container.querySelector('#svg-bomb-sphere');

    if (this.fusePath) {
      this.fuseLength = this.fusePath.getTotalLength();
      this.fusePath.style.strokeDasharray = `${this.fuseLength}`;
      this.fusePath.style.strokeDashoffset = '0';
    }
  }

  setSyllable(syllable) {
    if (this.syllableEl) {
      this.syllableEl.textContent = syllable;
      this.syllableEl.classList.remove('syllable-bounce');
      void this.syllableEl.offsetWidth; // trigger reflow
      this.syllableEl.classList.add('syllable-bounce');
    }
  }

  startFuse(turnStartTime, fuseDurationMs) {
    this.turnStartTime = turnStartTime;
    this.fuseDuration = fuseDurationMs;
    this.lastTickTime = Date.now();

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const updateLoop = () => {
      const now = Date.now();
      const elapsed = now - this.turnStartTime;
      const progress = Math.min(1, Math.max(0, elapsed / this.fuseDuration));
      const remainingMs = Math.max(0, this.fuseDuration - elapsed);

      this.updateFuse(progress, remainingMs);

      // Play ticking sounds (frequency accelerates as remaining time decreases)
      const tickInterval = Math.max(200, 1000 * (1 - progress * 0.7));
      if (now - this.lastTickTime >= tickInterval) {
        sound.playTick(progress);
        this.lastTickTime = now;
      }

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(updateLoop);
      }
    };

    this.animationFrame = requestAnimationFrame(updateLoop);
  }

  updateFuse(progress, remainingMs) {
    if (!this.fusePath || !this.sparkEl) return;

    // Retract fuse path from spark point towards bomb neck
    const offset = this.fuseLength * progress;
    this.fusePath.style.strokeDashoffset = `${offset}`;

    // Position spark at burning tip
    try {
      const point = this.fusePath.getPointAtLength(offset);
      this.sparkEl.setAttribute('transform', `translate(${point.x - 235}, ${point.y - 65})`);
    } catch (e) {
      // Fallback
    }

    // Critical State: Under 4 seconds remaining
    const isCritical = remainingMs < 4000;
    if (isCritical) {
      this.element?.classList.remove('bomb-pulse-normal');
      this.element?.classList.add('bomb-pulse-critical');
      if (this.sphereEl) {
        this.sphereEl.setAttribute('fill', 'url(#bombCriticalGrad)');
        this.sphereEl.setAttribute('stroke', '#ff0033');
      }
    } else {
      this.element?.classList.remove('bomb-pulse-critical');
      this.element?.classList.add('bomb-pulse-normal');
      if (this.sphereEl) {
        this.sphereEl.setAttribute('fill', 'url(#bombSurfaceGrad)');
        this.sphereEl.setAttribute('stroke', '#ff4500');
      }
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  triggerExplosionAnimation() {
    this.stop();
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.classList.remove('shake-screen', 'flash-screen');
      void appEl.offsetWidth;
      appEl.classList.add('shake-screen', 'flash-screen');
      setTimeout(() => {
        appEl.classList.remove('shake-screen', 'flash-screen');
      }, 700);
    }
  }
}

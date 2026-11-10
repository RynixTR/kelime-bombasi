// Haptic feedback using HTML5 Vibration API (Android Chrome & supported browsers)

export const haptics = {
  success() {
    if ('vibrate' in navigator) {
      navigator.vibrate(45);
    }
  },

  error() {
    if ('vibrate' in navigator) {
      navigator.vibrate([40, 50, 40]);
    }
  },

  explosion() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 40, 250]);
    }
  },

  yourTurn() {
    if ('vibrate' in navigator) {
      navigator.vibrate([60, 60, 60]);
    }
  }
};

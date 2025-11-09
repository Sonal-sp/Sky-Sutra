// Responsive animation settings
window.APP_SETTINGS = (function(){
  const w = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent) || w < 700;
  return {
    isMobile,
    width: w,
    // particle count strategy: desktop > tablet > mobile
    getParticleCount(base=80){
      if (isMobile) return Math.max(20, Math.floor(base * 0.35));
      if (w < 1100) return Math.max(40, Math.floor(base * 0.6));
      return base;
    },
    prefersReducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
})();

// Example usage in your existing animation init:
const baseCount = 80;
const particleCount = window.APP_SETTINGS.getParticleCount(baseCount);
// create drops = Array.from({length: particleCount}, ...)

const page = document.querySelector('.pp-page');
const art = document.querySelector('.pp-art');
const pause = document.querySelector('#pause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

pause.addEventListener('click', () => {
  const paused = page.classList.toggle('pp-paused');
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? '▷ 继续播放' : 'Ⅱ 暂停片刻';
});

document.querySelector('#replay').addEventListener('click', () => {
  page.classList.remove('pp-paused');
  pause.setAttribute('aria-pressed', 'false');
  pause.textContent = 'Ⅱ 暂停片刻';
  for (const animation of art.getAnimations({ subtree: true })) {
    animation.currentTime = 0;
  }
});

art.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const bounds = art.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  art.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
});
art.addEventListener('pointerleave', () => { art.style.transform = ''; });

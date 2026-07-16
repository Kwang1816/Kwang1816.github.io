const items = document.querySelectorAll('.grid__item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
items.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(item);
});

const album = document.querySelector('[data-album]');
if (album) {
  const slides = [...album.querySelectorAll('.project-album__slide')];
  const prevBtn = album.querySelector('.project-album__btn--prev');
  const nextBtn = album.querySelector('.project-album__btn--next');
  const currentEl = album.querySelector('[data-album-current]');
  const totalEl = album.querySelector('[data-album-total]');
  let index = 0;
  let isAnimating = false;

  if (totalEl) totalEl.textContent = slides.length;

  slides.forEach(slide => {
    const img = slide.querySelector('img');
    if (!img) return;
    img.decoding = 'async';
    img.decode?.().catch(() => {});
  });

  function updateSlides() {
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (i === index) slide.classList.add('is-active');
      else if (i === prevIndex) slide.classList.add('is-prev');
      else if (i === nextIndex) slide.classList.add('is-next');
    });

    if (currentEl) currentEl.textContent = index + 1;
  }

  function endAnimation() {
    slides.forEach(slide => slide.classList.remove('is-animating'));
    isAnimating = false;
  }

  function goTo(nextIndex) {
    if (isAnimating || nextIndex === index) return;
    isAnimating = true;
    index = nextIndex;

    slides.forEach(slide => slide.classList.add('is-animating'));

    const target = slides[nextIndex];
    let finished = false;

    const onEnd = (e) => {
      if (e.target !== target || e.propertyName !== 'transform') return;
      if (finished) return;
      finished = true;
      target.removeEventListener('transitionend', onEnd);
      endAnimation();
    };

    target.addEventListener('transitionend', onEnd);
    requestAnimationFrame(() => updateSlides());

    window.setTimeout(() => {
      if (!finished) {
        finished = true;
        target.removeEventListener('transitionend', onEnd);
        endAnimation();
      }
    }, 500);
  }

  updateSlides();

  prevBtn?.addEventListener('click', () => {
    goTo((index - 1 + slides.length) % slides.length);
  });

  nextBtn?.addEventListener('click', () => {
    goTo((index + 1) % slides.length);
  });

  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i === (index - 1 + slides.length) % slides.length) goTo(i);
      if (i === (index + 1) % slides.length) goTo(i);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo((index - 1 + slides.length) % slides.length);
    if (e.key === 'ArrowRight') goTo((index + 1) % slides.length);
  });

  let touchStartX = 0;

  album.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  album.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goTo((index + 1) % slides.length);
    else goTo((index - 1 + slides.length) % slides.length);
  }, { passive: true });
}

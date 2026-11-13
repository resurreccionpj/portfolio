document.querySelectorAll('.carousel').forEach((car) => {
  const track = car.querySelector('.track');
  const slides = [...track.children];
  const count = car.querySelector('.car-count');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const current = () => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) return slides.length - 1;
    let best = 0;
    let gap = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft - track.scrollLeft);
      if (d < gap) { gap = d; best = i; }
    });
    return best;
  };

  const goTo = (i) => {
    const s = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: s.offsetLeft, behavior: calm ? 'auto' : 'smooth' });
  };

  const update = () => { count.textContent = `${current() + 1} of ${slides.length}`; };
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });

  // Step by one slide width. Stepping from the position keeps Previous working at the very end,
  // where several slides share the same snap point.
  const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  car.querySelectorAll('[data-car]').forEach((b) =>
    b.addEventListener('click', () => track.scrollBy({ left: Number(b.dataset.car) * step(), behavior: calm ? 'auto' : 'smooth' }))
  );

  // Mouse drag. Touch and trackpads already swipe natively.
  let down = false;
  let startX = 0;
  let startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.classList.add('drag');
  });
  addEventListener('pointermove', (e) => {
    if (down) track.scrollLeft = startLeft - (e.clientX - startX);
  });
  const release = () => {
    if (!down) return;
    down = false;
    track.classList.remove('drag');
    goTo(current());
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  update();
});

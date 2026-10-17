/* Accessible About carousel: prefers personal photos and falls back to the existing barbering photos. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AboutCarousel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function probeImage(doc, url) {
    return new Promise((resolve) => {
      const img = new doc.defaultView.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function discover(cfg, probe) {
    if (!cfg) return [];
    const check = probe || ((url) => Promise.resolve(true));
    const personal = await Promise.all((cfg.photos || []).map(async (photo) => (await check(photo.src)) ? photo : null));
    const available = personal.filter(Boolean);
    if (available.length) return available;
    const fallback = await Promise.all((cfg.fallbackPhotos || []).map(async (photo) => (await check(photo.src)) ? photo : null));
    return fallback.filter(Boolean);
  }

  function render(doc, carousel, photos) {
    const stage = carousel.querySelector('[data-carousel-stage]');
    const caption = carousel.querySelector('[data-carousel-caption]');
    const count = carousel.querySelector('[data-carousel-count]');
    const dots = carousel.querySelector('[data-carousel-dots]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const toggle = carousel.querySelector('[data-carousel-toggle]');
    stage.replaceChildren();
    dots.replaceChildren();
    if (!photos.length) {
      carousel.hidden = true;
      return null;
    }

    carousel.hidden = false;
    let active = 0;
    const slides = photos.map((photo, index) => {
      const slide = doc.createElement('div');
      slide.className = 'about-carousel-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (index + 1) + ' of ' + photos.length + ': ' + photo.caption);
      slide.setAttribute('aria-hidden', 'true');
      const img = doc.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = 960;
      img.height = 600;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      slide.appendChild(img);
      stage.appendChild(slide);

      const dot = doc.createElement('button');
      dot.type = 'button';
      dot.className = 'about-carousel-dot';
      dot.setAttribute('aria-label', 'Show photo ' + (index + 1) + ': ' + photo.caption);
      dot.setAttribute('aria-current', 'false');
      dot.addEventListener('click', () => show(index));
      dots.appendChild(dot);
      return { slide, dot, photo };
    });

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((item, i) => {
        const selected = i === active;
        item.slide.classList.toggle('is-active', selected);
        item.slide.setAttribute('aria-hidden', String(!selected));
        item.dot.setAttribute('aria-current', String(selected));
      });
      caption.textContent = slides[active].photo.caption;
      count.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }

    show(0);
    prev.addEventListener('click', () => show(active - 1));
    next.addEventListener('click', () => show(active + 1));

    const win = doc.defaultView;
    const reduced = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canAutoRotate = slides.length > 1 && !reduced;
    toggle.hidden = !canAutoRotate;
    let userPaused = false;
    let hovered = false;
    let focused = false;
    let visible = true;
    const updateToggle = () => {
      toggle.textContent = userPaused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', userPaused ? 'Resume automatic photo rotation' : 'Pause automatic photo rotation');
    };
    updateToggle();
    toggle.addEventListener('click', () => { userPaused = !userPaused; updateToggle(); });
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = (event) => { if (!carousel.contains(event.relatedTarget)) focused = false; };
    const onVisibility = () => { visible = !doc.hidden; };
    carousel.addEventListener('mouseenter', onEnter);
    carousel.addEventListener('mouseleave', onLeave);
    carousel.addEventListener('focusin', onFocusIn);
    carousel.addEventListener('focusout', onFocusOut);
    doc.addEventListener('visibilitychange', onVisibility);

    let observer;
    if (canAutoRotate && 'IntersectionObserver' in win) {
      observer = new win.IntersectionObserver((entries) => { visible = entries[0].isIntersecting; });
      observer.observe(carousel);
    }
    const intervalMs = Math.max(3000, Number(carousel.dataset.interval) || 5500);
    const timer = canAutoRotate ? win.setInterval(() => {
      if (!userPaused && !hovered && !focused && visible && !doc.hidden) show(active + 1);
    }, intervalMs) : null;

    return {
      slides: slides.map((item) => item.photo),
      show,
      destroy() {
        if (timer !== null) win.clearInterval(timer);
        if (observer) observer.disconnect();
        carousel.removeEventListener('mouseenter', onEnter);
        carousel.removeEventListener('mouseleave', onLeave);
        carousel.removeEventListener('focusin', onFocusIn);
        carousel.removeEventListener('focusout', onFocusOut);
        doc.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }

  async function init(doc, cfg, probe) {
    const carousel = doc.getElementById('about-carousel');
    if (!carousel) return null;
    const photos = await discover(cfg, probe || ((url) => probeImage(doc, url)));
    return render(doc, carousel, photos);
  }

  return { discover, render, init, probeImage };
});

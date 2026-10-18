/* Page behaviour: theme, mobile menu, smooth anchors, active nav, prices, project cards, dialog, contact form. */
(function () {
  const doc = document;
  const body = doc.body;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icons = () => { if (window.feather) window.feather.replace(); };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* storage unavailable */ } }
  };

  function setIcon(btn, name) {
    btn.innerHTML = '<i data-feather="' + name + '" aria-hidden="true"></i>';
    icons();
  }

  /* Theme */
  const themeBtn = doc.getElementById('theme-toggle');
  function applyTheme(light) {
    body.classList.toggle('light-mode', light);
    setIcon(themeBtn, light ? 'sun' : 'moon');
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#f7f5ef' : '#080808');
  }
  applyTheme(store.get('sir-william-theme') === 'light');
  themeBtn.addEventListener('click', () => {
    const light = !body.classList.contains('light-mode');
    store.set('sir-william-theme', light ? 'light' : 'dark');
    applyTheme(light);
  });

  /* Mobile menu */
  const menuBtn = doc.getElementById('mobile-menu-button');
  const menu = doc.getElementById('mobile-menu');
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    setIcon(menuBtn, open ? 'x' : 'menu');
  }
  menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
  doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { setMenu(false); menuBtn.focus(); } });

  /* Anchor navigation + service prefill */
  const serviceSelect = doc.getElementById('service');
  doc.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    if (anchor.dataset.service && serviceSelect) serviceSelect.value = anchor.dataset.service;
    const id = anchor.getAttribute('href');
    const target = id.length > 1 ? doc.querySelector(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (history.pushState) history.pushState(null, '', id);
    if (!menu.classList.contains('hidden')) setMenu(false);
    if (id === '#contact') {
      const first = doc.getElementById('name');
      setTimeout(() => first && first.focus({ preventScroll: true }), reduced ? 0 : 600);
    }
  });

  /* Active nav state (only for sections that exist in the nav) */
  const navLinks = [...doc.querySelectorAll('.nav-link')];
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const href = '#' + entry.target.id;
        if (!navLinks.some((l) => l.getAttribute('href') === href)) return;
        navLinks.forEach((l) => {
          const on = l.getAttribute('href') === href;
          l.classList.toggle('active', on);
          if (on) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -54% 0px', threshold: 0 });
    doc.querySelectorAll('main section[id]').forEach((s) => obs.observe(s));
  }

  /* Prices (from assets/content.js) */
  const content = window.SITE_CONTENT;
  function renderPrices(id, items) {
    const list = doc.getElementById(id);
    if (!content || !list) return;
    items.forEach((p) => {
      const row = doc.createElement('div'); row.className = 'price-row';
      const dt = doc.createElement('dt'); dt.textContent = p.label;
      if (p.hint) { const h = doc.createElement('span'); h.className = 'price-hint'; h.textContent = p.hint; dt.appendChild(h); }
      const dd = doc.createElement('dd'); dd.textContent = (p.prefix || '') + content.currency + p.amount;
      row.appendChild(dt); row.appendChild(dd); list.appendChild(row);
    });
  }
  if (content) renderPrices('price-list', content.prices);

  /* Projects + dialog */
  const dialog = doc.getElementById('project-dialog');
  const grid = doc.getElementById('projects-grid');
  if (content && grid && window.Projects) window.Projects.renderProjects(doc, grid, content.projects, dialog);
  if (dialog) {
    doc.getElementById('dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (dialog._trigger) dialog._trigger.focus(); });
  }

  /* Gallery: auto-discovers images/gallery/1.ext, 2.ext, ... */
  const photoDialog = doc.getElementById('photo-dialog');
  if (photoDialog) {
    doc.getElementById('photo-close').addEventListener('click', () => photoDialog.close());
    photoDialog.addEventListener('click', (e) => { if (e.target === photoDialog) photoDialog.close(); });
    photoDialog.addEventListener('close', () => { if (photoDialog._trigger) photoDialog._trigger.focus(); });
  }
  if (content && window.Gallery) window.Gallery.initGallery(doc, content.gallery).then(icons);
  if (content && window.AboutCarousel) window.AboutCarousel.init(doc, content.aboutPhotos);

  /* Contact form */
  if (window.Contact) window.Contact.initContactForm(doc, window.SITE_CONFIG, window.fetch ? window.fetch.bind(window) : undefined);

  icons();

  /* Decorative background: skipped on small screens, reduced motion and data-saver */
  const saveData = navigator.connection && navigator.connection.saveData;
  window.addEventListener('load', () => {
    if (!reduced && !saveData && window.innerWidth >= 768 && window.VANTA && window.VANTA.NET && window.THREE) {
      window.VANTA.NET({ el: '#vanta-bg', color: 0xd4af37, backgroundColor: 0x080808, points: 9, maxDistance: 22, spacing: 18 });
    }
  });
})();

/* Auto-discovering photo gallery: finds images/gallery/1.ext, 2.ext, ... and renders them. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Gallery = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function probeImage(doc, url) {
    return new Promise((resolve) => {
      const img = new doc.defaultView.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /* Tries each extension for photo n in parallel; stops at the first number with no file. */
  async function discover(opts) {
    const found = [];
    for (let n = 1; n <= opts.max; n++) {
      const hits = await Promise.all(opts.exts.map((e) => opts.probe(opts.folder + '/' + n + '.' + e)));
      const i = hits.indexOf(true);
      if (i === -1) break;
      found.push({ n, src: opts.folder + '/' + n + '.' + opts.exts[i] });
    }
    return found;
  }

  function render(doc, found, cfg, onOpen) {
    const list = doc.getElementById('gallery-list');
    list.replaceChildren();
    found.forEach((f) => {
      const alt = (cfg.alts && cfg.alts[f.n]) || 'Haircut by The Royals Barbers_CK (photo ' + f.n + ')';
      const li = doc.createElement('li');
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item';
      btn.setAttribute('aria-label', 'View photo ' + f.n + ' larger');
      const img = doc.createElement('img');
      img.src = f.src; img.alt = alt; img.width = 200; img.height = 200;
      img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async');
      btn.appendChild(img);
      btn.addEventListener('click', () => onOpen && onOpen(f.src, alt, btn));
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  async function initGallery(doc, cfg, probe) {
    const block = doc.getElementById('gallery-block');
    if (!block || !cfg) return [];
    const p = probe || ((url) => probeImage(doc, url));
    const found = await discover({ folder: cfg.folder, exts: cfg.exts, max: cfg.max, probe: p });
    if (!found.length) return found;            // nothing uploaded: the block stays hidden
    const dialog = doc.getElementById('photo-dialog');
    const large = doc.getElementById('photo-large');
    render(doc, found, cfg, (src, alt, trigger) => {
      if (!dialog) return;
      large.src = src; large.alt = alt; dialog._trigger = trigger;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    });
    block.hidden = false;
    return found;
  }

  return { discover, render, initGallery, probeImage };
});

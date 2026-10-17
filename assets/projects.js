/* Reusable project-card + details dialog renderer. All text is set via textContent (no HTML injection). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Projects = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function h(doc, tag, cls, text) {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function imageIcon(doc) {
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '34');
    svg.setAttribute('height', '34');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 16l5-5 4 4 3-3 6 6'].forEach((d) => {
      const p = doc.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    const c = doc.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', '9'); c.setAttribute('cy', '8.5'); c.setAttribute('r', '1.4');
    svg.appendChild(c);
    return svg;
  }

  function placeholder(doc, project) {
    const box = h(doc, 'div', 'shot-placeholder');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Screenshot of ' + project.codename + ' coming soon');
    box.appendChild(imageIcon(doc));
    box.appendChild(h(doc, 'strong', null, project.codename));
    box.appendChild(h(doc, 'span', 'shot-badge', 'Screenshot placeholder'));
    return box;
  }

  /* Screenshot container: shows the real image; any load failure swaps in the labelled placeholder. */
  function screenshot(doc, project) {
    const wrap = h(doc, 'div', 'shot');
    if (project.fit === 'contain') wrap.classList.add('shot-contain');
    const img = doc.createElement('img');
    img.src = project.image;
    img.alt = project.alt;
    img.width = 1400;
    img.height = 875;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.addEventListener('error', () => {
      // 1st failure of the local screenshot: try the online illustrative image (clearly labelled).
      if (project.fallbackImage && !wrap.dataset.fallback) {
        wrap.dataset.fallback = '1';
        wrap.classList.add('is-illustrative');
        img.alt = project.fallbackAlt || project.alt;
        img.src = project.fallbackImage;
        wrap.appendChild(h(doc, 'span', 'shot-illustrative', 'Illustrative image'));
        return;
      }
      wrap.classList.add('is-missing');
      wrap.replaceChildren(placeholder(doc, project));
    });
    wrap.appendChild(img);
    return wrap;
  }

  function createProjectCard(doc, project, onOpen) {
    const card = h(doc, 'article', 'project-card panel');
    card.dataset.projectId = project.id;
    card.appendChild(screenshot(doc, project));

    const body = h(doc, 'div', 'project-body');
    const top = h(doc, 'div', 'project-top');
    top.appendChild(h(doc, 'span', 'status status-' + project.tone, project.status));
    body.appendChild(top);
    body.appendChild(h(doc, 'p', 'project-code', project.codename));
    body.appendChild(h(doc, 'h3', 'project-title', project.title));
    body.appendChild(h(doc, 'p', 'project-summary', project.summary));

    const tags = h(doc, 'ul', 'tag-list');
    tags.setAttribute('aria-label', 'Technology for ' + project.codename);
    project.stack.forEach((t) => { const li = h(doc, 'li', 'tag', t); tags.appendChild(li); });
    body.appendChild(tags);

    const actions = h(doc, 'div', 'project-actions');
    const more = h(doc, 'button', 'btn btn-secondary btn-sm', 'View details');
    more.type = 'button';
    more.setAttribute('aria-haspopup', 'dialog');
    more.setAttribute('aria-label', 'View details for ' + project.codename);
    more.addEventListener('click', () => onOpen && onOpen(project, more));
    actions.appendChild(more);
    if (project.repoUrl) {
      const a = h(doc, 'a', 'btn btn-ghost btn-sm', 'View Repository');
      a.href = project.repoUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      actions.appendChild(a);
    }
    if (project.liveUrl) {
      const a = h(doc, 'a', 'btn btn-ghost btn-sm', 'View Project');
      a.href = project.liveUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      actions.appendChild(a);
    }
    body.appendChild(actions);
    if (!project.liveUrl) body.appendChild(h(doc, 'p', 'project-foot', 'No public live demo.'));
    card.appendChild(body);
    return card;
  }

  function list(doc, title, items) {
    const wrap = h(doc, 'div', 'dialog-block');
    wrap.appendChild(h(doc, 'h3', null, title));
    const ul = h(doc, 'ul', 'check-list');
    items.forEach((i) => ul.appendChild(h(doc, 'li', null, i)));
    wrap.appendChild(ul);
    return wrap;
  }

  function fillDialog(doc, dialog, project) {
    const body = dialog.querySelector('[data-dialog-body]');
    body.replaceChildren();
    body.appendChild(h(doc, 'span', 'status status-' + project.tone, project.status));
    const t = h(doc, 'h2', 'dialog-title', project.title);
    t.id = 'dialog-title';
    body.appendChild(t);
    body.appendChild(h(doc, 'p', 'project-code', project.codename));
    body.appendChild(h(doc, 'p', 'dialog-summary', project.summary));
    body.appendChild(list(doc, 'Areas of work', project.areas));
    if (project.built) body.appendChild(list(doc, 'Built so far', project.built));
    if (project.planned) body.appendChild(list(doc, 'Still planned', project.planned));
    const tags = h(doc, 'ul', 'tag-list');
    project.stack.forEach((s) => tags.appendChild(h(doc, 'li', 'tag', s)));
    body.appendChild(tags);
    if (project.note) body.appendChild(h(doc, 'p', 'dialog-note', project.note));
  }

  function renderProjects(doc, container, projects, dialog) {
    const open = (project, trigger) => {
      if (!dialog) return;
      fillDialog(doc, dialog, project);
      dialog._trigger = trigger;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    };
    container.replaceChildren();
    projects.forEach((p) => container.appendChild(createProjectCard(doc, p, open)));
  }

  return { createProjectCard, renderProjects, fillDialog, placeholder };
});

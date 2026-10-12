const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers');

const EP = 'https://formspree.io/f/abcdwxyz';
const res = (ok, status, body) => ({ ok, status, json: async () => body });
const tick = () => new Promise((r) => setTimeout(r, 0));

function boot(fetchImpl, endpoint) {
  const page = loadPage(fetchImpl, endpoint);
  page.w.Contact.initContactForm(page.doc, page.w.SITE_CONFIG, fetchImpl);
  return page;
}
function fill(doc, over) {
  const v = { name: 'Jane Doe', email: 'jane@example.com', phone: '', service: 'IT Support and Repairs', message: 'My laptop is very slow, please help.', ...over };
  Object.entries(v).forEach(([k, val]) => { doc.getElementById(k).value = val; });
}
const submit = (w, doc) => doc.getElementById('contact-form').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));

test('empty submit: inline errors, aria-invalid, focus on first field, nothing sent', async () => {
  let calls = 0;
  const { w, doc } = boot(async () => { calls++; return res(true, 200, { ok: true }); }, EP);
  submit(w, doc); await tick();
  ['name', 'email', 'service', 'message'].forEach((f) => {
    assert.equal(doc.getElementById(f).getAttribute('aria-invalid'), 'true', f);
    assert.equal(doc.getElementById(f + '-error').hidden, false, f);
  });
  assert.equal(doc.getElementById('phone').hasAttribute('aria-invalid'), false);
  assert.equal(doc.activeElement && doc.activeElement.id, 'name');
  assert.equal(calls, 0);
  assert.ok(!doc.getElementById('form-status').classList.contains('is-success'));
});
test('invalid email shows the email error only', async () => {
  const { w, doc } = boot(async () => res(true, 200, { ok: true }), EP);
  fill(doc, { email: 'not-an-email' });
  submit(w, doc); await tick();
  assert.equal(doc.getElementById('email').getAttribute('aria-invalid'), 'true');
  assert.equal(doc.getElementById('name').hasAttribute('aria-invalid'), false);
});
test('loading state: button disabled + busy label, duplicate submit ignored, then success resets form', async () => {
  let calls = 0, release;
  const gate = new Promise((r) => { release = r; });
  const { w, doc } = boot(async () => { calls++; await gate; return res(true, 200, { ok: true }); }, EP);
  fill(doc);
  submit(w, doc); await tick();
  const btn = doc.getElementById('submit-btn');
  assert.equal(btn.disabled, true);
  assert.equal(btn.getAttribute('aria-busy'), 'true');
  assert.match(btn.textContent, /Sending/);
  submit(w, doc); await tick();
  assert.equal(calls, 1, 'double submit must not send twice');
  assert.ok(!doc.getElementById('form-status').classList.contains('is-success'), 'no success while pending');
  release(); await tick(); await tick();
  const status = doc.getElementById('form-status');
  assert.ok(status.classList.contains('is-success'));
  assert.match(status.textContent, /submitted successfully/);
  assert.equal(btn.disabled, false);
  assert.equal(doc.getElementById('name').value, '');
  assert.equal(doc.getElementById('message').value, '');
});
test('provider failure: failure message, values preserved, never success', async () => {
  const { w, doc } = boot(async () => res(false, 500, { errors: [{ message: 'x' }] }), EP);
  fill(doc);
  submit(w, doc); await tick(); await tick();
  const status = doc.getElementById('form-status');
  assert.ok(status.classList.contains('is-error'));
  assert.ok(!status.classList.contains('is-success'));
  assert.match(status.textContent, /could not be submitted/);
  assert.ok(status.querySelector('a[href="mailto:liamroyalty9@gmail.com"]'));
  assert.ok(status.querySelector('a[href="https://wa.me/264817813918"]'));
  assert.equal(doc.getElementById('name').value, 'Jane Doe');
  assert.match(doc.getElementById('message').value, /laptop/);
  assert.equal(doc.getElementById('submit-btn').disabled, false);
});
test('network error: failure, values preserved', async () => {
  const { w, doc } = boot(async () => { throw new TypeError('Failed to fetch'); }, EP);
  fill(doc);
  submit(w, doc); await tick(); await tick();
  assert.ok(doc.getElementById('form-status').classList.contains('is-error'));
  assert.equal(doc.getElementById('email').value, 'jane@example.com');
});
test('shipped placeholder endpoint: nothing sent, honest not-activated message, no success', async () => {
  let calls = 0;
  const { w, doc } = boot(async () => { calls++; return res(true, 200, { ok: true }); });
  assert.match(w.SITE_CONFIG.formEndpoint, /YOUR_FORM_ID/);
  fill(doc);
  submit(w, doc); await tick(); await tick();
  const status = doc.getElementById('form-status');
  assert.equal(calls, 0);
  assert.ok(status.classList.contains('is-error'));
  assert.match(status.textContent, /nothing was sent/);
  assert.equal(doc.getElementById('name').value, 'Jane Doe');
});
test('honeypot filled: not sent, no success', async () => {
  let calls = 0;
  const { w, doc } = boot(async () => { calls++; return res(true, 200, { ok: true }); }, EP);
  fill(doc); doc.getElementById('_gotcha').value = 'spam';
  submit(w, doc); await tick(); await tick();
  assert.equal(calls, 0);
  assert.ok(!doc.getElementById('form-status').classList.contains('is-success'));
});

test('project cards: 7 rendered, alt text present, no dead buttons, missing image falls back to labelled placeholder', () => {
  const { w, doc } = loadPage();
  const grid = doc.getElementById('projects-grid');
  w.Projects.renderProjects(doc, grid, w.SITE_CONTENT.projects, doc.getElementById('project-dialog'));
  const cards = grid.querySelectorAll('.project-card');
  assert.equal(cards.length, 7);
  cards.forEach((c) => {
    assert.ok(c.querySelector('img').alt.length > 10);
    assert.equal(c.querySelectorAll('a[href]').length, 0, 'no repo/live links until real URLs are set');
    assert.ok(c.querySelector('.status').textContent.length > 0);
  });
  const card = grid.querySelector('[data-project-id="linux-server"]');
  card.querySelector('img').dispatchEvent(new w.Event('error'));
  assert.ok(card.querySelector('.shot-placeholder'));
  assert.match(card.querySelector('.shot-badge').textContent, /placeholder/i);
  assert.equal(card.querySelector('img'), null);
});
test('repo and live buttons only render when a real URL is configured', () => {
  const { w, doc } = loadPage();
  const p = { ...w.SITE_CONTENT.projects[0], repoUrl: 'https://github.com/example/repo', liveUrl: null };
  const card = w.Projects.createProjectCard(doc, p, () => {});
  const links = [...card.querySelectorAll('a')].map((a) => a.textContent);
  assert.deepEqual(links, ['View Repository']);
});
test('details dialog shows built vs planned for BarberSnap', () => {
  const { w, doc } = loadPage();
  const dialog = doc.getElementById('project-dialog');
  const grid = doc.getElementById('projects-grid');
  w.Projects.renderProjects(doc, grid, w.SITE_CONTENT.projects, dialog);
  grid.querySelector('[data-project-id="barbersnap"] button').click();
  assert.ok(dialog.hasAttribute('open'));
  const text = dialog.textContent;
  assert.match(text, /Built so far/);
  assert.match(text, /Still planned/);
  assert.match(text, /Hairline measurement/);
});

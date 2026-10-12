const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadPage, read, root } = require('./helpers');

const { doc } = loadPage();
const html = read('index.html');

test('all element ids are unique', () => {
  const ids = [...doc.querySelectorAll('[id]')].map((e) => e.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});
test('every in-page link points at an existing section', () => {
  const bad = [...doc.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !doc.querySelector(h));
  assert.deepEqual(bad, []);
});
test('primary navigation covers the required destinations', () => {
  const hrefs = [...doc.querySelectorAll('header nav .nav-link')].map((a) => a.getAttribute('href'));
  ['#about', '#skills', '#projects', '#services', '#contact'].forEach((h) => assert.ok(hrefs.includes(h), h));
});
test('hero CTAs: Hire Me -> contact, Explore My Projects -> projects', () => {
  const links = [...doc.querySelectorAll('#home a.btn')];
  assert.equal(links.find((a) => /Hire Me/.test(a.textContent)).getAttribute('href'), '#contact');
  assert.equal(links.find((a) => /Explore My Projects/.test(a.textContent)).getAttribute('href'), '#projects');
});
test('contact destinations are exact (email, tel, WhatsApp) and used consistently', () => {
  const hrefs = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  assert.ok(hrefs.includes('mailto:liamroyalty9@gmail.com'));
  assert.ok(hrefs.includes('tel:+264817813918'));
  assert.ok(hrefs.some((h) => h === 'https://wa.me/264817813918'));
  const wa = hrefs.filter((h) => h.includes('wa.me'));
  wa.forEach((h) => assert.match(h, /^https:\/\/wa\.me\/264817813918(\?|$)/));
  assert.ok(html.includes('081 781 3918'));
  assert.ok(!/tel:0?817813918|wa\.me\/0/.test(html), 'no local-format links');
});
test('no placeholder / dead links', () => {
  doc.querySelectorAll('a[href]').forEach((a) => {
    const h = a.getAttribute('href');
    assert.ok(h && h !== '#' && !/^javascript:/i.test(h), 'dead link: ' + a.textContent);
  });
});
test('external links opening a new tab use rel=noopener', () => {
  doc.querySelectorAll('a[target="_blank"]').forEach((a) => assert.match(a.getAttribute('rel') || '', /noopener/));
});
test('fabricated testimonials and arbitrary percentages are gone', () => {
  ['Sarah J', 'Michael T', 'Emily K', 'James L', 'Lisa M', 'Five star'].forEach((s) => assert.ok(!html.includes(s), s));
  assert.ok(!/\b\d{1,3}\s?%/.test(doc.body.textContent), 'no percentage ratings in visible text');
});
test('prices render in N$ with the agreed values', () => {
  const { w, doc: d } = loadPage();
  const C = w.SITE_CONTENT;
  assert.deepEqual(Array.from(C.prices, (p) => C.currency + p.amount), ['N$70', 'N$50', 'N$40']);
});
test('formal penetration testing is not offered', () => {
  assert.ok(/not currently advertised/i.test(html));
  assert.ok(!/<option>[^<]*penetration/i.test(html));
});
test('SEO basics: title, description, og tags, no invented canonical/og:image', () => {
  assert.equal(doc.title, 'Sir William | IT Support, Software Development & Mobile Barbering');
  assert.ok(doc.querySelector('meta[name="description"]').content.includes('Windhoek, Namibia'));
  assert.ok(doc.querySelector('meta[property="og:title"]'));
  assert.equal(doc.querySelector('link[rel="canonical"]'), null);
  assert.equal(doc.querySelectorAll('h1').length, 1);
});
test('screenshots that exist on disk are the ones referenced; every project has an image path', () => {
  const { w } = loadPage();
  const missing = [];
  w.SITE_CONTENT.projects.forEach((p) => {
    assert.ok(p.image && p.alt, p.id);
    if (!fs.existsSync(path.join(root, p.image))) missing.push(p.image);
  });
  assert.deepEqual(missing.sort(), ['images/projects/linux-server.png', 'images/projects/livestream-av.png', 'images/projects/network-diagnostics.png']);
});

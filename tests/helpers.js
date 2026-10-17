const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function loadPage(fetchImpl, endpoint) {
  const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', url: 'http://localhost/' });
  const w = dom.window;
  ['assets/config.js', 'assets/content.js', 'assets/validation.js', 'assets/contact.js', 'assets/projects.js', 'assets/gallery.js', 'assets/about-carousel.js'].forEach((f) => w.eval(read(f)));
  if (endpoint !== undefined) w.SITE_CONFIG.formEndpoint = endpoint;
  return { dom, w, doc: w.document };
}
module.exports = { loadPage, read, root };

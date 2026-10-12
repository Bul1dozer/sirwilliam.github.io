const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/contact.js');

const good = { name: 'Jane Doe', email: 'jane@example.com', phone: '', service: 'Other', message: 'Please call me about a project.' };
const EP = 'https://formspree.io/f/abcdwxyz';
const res = (ok, status, body) => ({ ok, status, json: async () => { if (body === undefined) throw new Error('no json'); return body; } });

test('endpoint placeholder counts as NOT configured and nothing is sent', async () => {
  let calls = 0;
  const r = await C.submitEnquiry(good, { endpoint: 'https://formspree.io/f/YOUR_FORM_ID', fetchImpl: async () => { calls++; return res(true, 200, { ok: true }); } });
  assert.deepEqual([r.ok, r.reason, calls], [false, 'not_configured', 0]);
});
test('accepted by provider -> ok:true, payload has all fields and reply-to', async () => {
  let sent;
  const r = await C.submitEnquiry(good, { endpoint: EP, fetchImpl: async (url, init) => { sent = { url, init }; return res(true, 200, { ok: true }); } });
  assert.equal(r.ok, true);
  const body = JSON.parse(sent.init.body);
  assert.equal(sent.url, EP);
  assert.equal(sent.init.method, 'POST');
  assert.equal(body.email, 'jane@example.com');
  assert.equal(body._replyto, 'jane@example.com');
  assert.equal(body.name, 'Jane Doe');
  assert.equal(body.service, 'Other');
  assert.equal(body.phone, 'Not provided');
  assert.ok(body.message.includes('project'));
});
test('provider HTTP errors never count as success', async () => {
  for (const status of [400, 422, 429, 500]) {
    const r = await C.submitEnquiry(good, { endpoint: EP, fetchImpl: async () => res(false, status, { errors: [{ message: 'x' }] }) });
    assert.equal(r.ok, false, 'status ' + status);
  }
});
test('HTTP 200 carrying an error payload is not success', async () => {
  const r = await C.submitEnquiry(good, { endpoint: EP, fetchImpl: async () => res(true, 200, { ok: false, errors: [{ message: 'bad' }] }) });
  assert.equal(r.ok, false);
});
test('network failure and timeout are failures', async () => {
  const r1 = await C.submitEnquiry(good, { endpoint: EP, fetchImpl: async () => { throw new TypeError('Failed to fetch'); } });
  assert.deepEqual([r1.ok, r1.reason], [false, 'network']);
  const r2 = await C.submitEnquiry(good, { endpoint: EP, timeoutMs: 20, fetchImpl: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('a'), { name: 'AbortError' })))) });
  assert.deepEqual([r2.ok, r2.reason], [false, 'timeout']);
});
test('invalid input and honeypot never reach the network', async () => {
  let calls = 0;
  const f = async () => { calls++; return res(true, 200, { ok: true }); };
  assert.equal((await C.submitEnquiry({ ...good, email: 'nope' }, { endpoint: EP, fetchImpl: f })).reason, 'invalid');
  assert.equal((await C.submitEnquiry(good, { endpoint: EP, fetchImpl: f, honeypot: 'bot' })).ok, false);
  assert.equal(calls, 0);
});

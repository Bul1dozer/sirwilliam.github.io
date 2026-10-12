const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../assets/validation.js');

const good = { name: 'Jane Doe', email: 'jane@example.com', phone: '', service: 'IT Support and Repairs', message: 'My laptop will not start.' };

test('valid enquiry passes (phone optional)', () => {
  assert.equal(V.validateEnquiry(good).valid, true);
});
test('empty fields are rejected with messages', () => {
  const r = V.validateEnquiry({});
  assert.equal(r.valid, false);
  ['name', 'email', 'service', 'message'].forEach((f) => assert.ok(r.errors[f], f + ' should have an error'));
  assert.equal(r.errors.phone, undefined);
});
test('invalid emails are rejected', () => {
  ['plain', 'a@b', 'a b@c.com', '@x.com', 'a@x.'].forEach((e) => assert.ok(V.validateField('email', e), e));
  assert.equal(V.validateField('email', 'ok@example.com'), '');
});
test('phone: optional, but must look like a phone number when given', () => {
  assert.equal(V.validateField('phone', ''), '');
  assert.equal(V.validateField('phone', '081 781 3918'), '');
  assert.equal(V.validateField('phone', '+264 81 781 3918'), '');
  assert.ok(V.validateField('phone', 'call me'));
  assert.ok(V.validateField('phone', '123'));
});
test('service must be one of the listed options; no penetration-testing option exists', () => {
  assert.ok(V.validateField('service', 'Penetration Testing'));
  assert.equal(V.SERVICES.length, 8);
  assert.ok(!V.SERVICES.some((s) => /penetration|pentest/i.test(s)));
});
test('length limits enforced', () => {
  assert.ok(V.validateField('message', 'short'));
  assert.ok(V.validateField('message', 'x'.repeat(2001)));
  assert.ok(V.validateField('name', 'x'.repeat(101)));
});

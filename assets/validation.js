/* Enquiry validation — shared by the browser form and the Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EnquiryValidation = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SERVICES = [
    'IT Support and Repairs',
    'Networking and Infrastructure',
    'Website and Application Development',
    'AV and Livestream Support',
    'Security-Focused IT Setup',
    'The Royals Barbers_CK — Haircut',
    'Other',
    'Multiple Services'
  ];

  const LIMITS = { nameMin: 2, nameMax: 100, emailMax: 254, phoneMax: 20, messageMin: 10, messageMax: 2000 };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^[+()\d][\d\s()+-]*$/;

  function clean(values) {
    const v = values || {};
    const t = (x) => (typeof x === 'string' ? x.trim() : '');
    return { name: t(v.name), email: t(v.email), phone: t(v.phone), service: t(v.service), message: t(v.message) };
  }

  function validateField(field, raw) {
    const v = clean({ [field]: raw })[field];
    switch (field) {
      case 'name':
        if (!v) return 'Please enter your full name.';
        if (v.length < LIMITS.nameMin) return 'Your name looks too short.';
        if (v.length > LIMITS.nameMax) return 'Please keep your name under ' + LIMITS.nameMax + ' characters.';
        return '';
      case 'email':
        if (!v) return 'Please enter your email address.';
        if (v.length > LIMITS.emailMax || !EMAIL_RE.test(v)) return 'Please enter a valid email address, for example name@example.com.';
        return '';
      case 'phone': {
        if (!v) return '';
        const digits = v.replace(/\D/g, '');
        if (v.length > LIMITS.phoneMax || !PHONE_RE.test(v) || digits.length < 7) return 'Please enter a valid phone number, or leave this blank.';
        return '';
      }
      case 'service':
        if (!v) return 'Please choose the service you need.';
        if (SERVICES.indexOf(v) === -1) return 'Please choose a service from the list.';
        return '';
      case 'message':
        if (!v) return 'Please tell me how I can help.';
        if (v.length < LIMITS.messageMin) return 'Please add a little more detail (at least ' + LIMITS.messageMin + ' characters).';
        if (v.length > LIMITS.messageMax) return 'Please keep your message under ' + LIMITS.messageMax + ' characters.';
        return '';
      default:
        return '';
    }
  }

  function validateEnquiry(values) {
    const cleaned = clean(values);
    const errors = {};
    ['name', 'email', 'phone', 'service', 'message'].forEach((f) => {
      const msg = validateField(f, cleaned[f]);
      if (msg) errors[f] = msg;
    });
    return { valid: Object.keys(errors).length === 0, errors, values: cleaned };
  }

  return { SERVICES, LIMITS, validateField, validateEnquiry, clean };
});

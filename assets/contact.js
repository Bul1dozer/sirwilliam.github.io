/* Contact form: delivery via a hosted form provider (Formspree) + accessible DOM wiring. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./validation.js'));
  else root.Contact = factory(root.EnquiryValidation);
})(typeof self !== 'undefined' ? self : this, function (V) {
  const MESSAGES = {
    success: 'Thank you for reaching out! Your enquiry has been submitted successfully. I will get back to you as soon as possible.',
    failure: 'Your message could not be submitted. Please try again or contact me directly by email or WhatsApp.',
    notConfigured: 'Online enquiries are not switched on for this site yet, so nothing was sent. Please contact me directly by email or WhatsApp.',
    fixErrors: 'Please correct the highlighted fields and try again.'
  };

  function isEndpointConfigured(endpoint) {
    return typeof endpoint === 'string' && /^https:\/\/[^\s]+$/.test(endpoint) && !/YOUR_FORM_ID/i.test(endpoint);
  }

  /*
   * Sends a validated enquiry. Resolves { ok:true } ONLY when the provider accepted it (HTTP 2xx and no
   * error payload). Every other path resolves { ok:false, reason } — never a false success.
   */
  async function submitEnquiry(values, opts) {
    const o = opts || {};
    const endpoint = o.endpoint;
    const doFetch = o.fetchImpl || (typeof fetch === 'function' ? fetch : null);
    const check = V.validateEnquiry(values);
    if (!check.valid) return { ok: false, reason: 'invalid', errors: check.errors };
    if (o.honeypot) return { ok: false, reason: 'spam' };
    if (!isEndpointConfigured(endpoint)) return { ok: false, reason: 'not_configured' };
    if (!doFetch) return { ok: false, reason: 'network' };

    const v = check.values;
    const payload = {
      name: v.name,
      email: v.email,
      _replyto: v.email,
      phone: v.phone || 'Not provided',
      service: v.service,
      message: v.message,
      _subject: 'Website enquiry: ' + v.service + ' — ' + v.name
    };

    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), o.timeoutMs || 15000) : null;
    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      });
      let body = null;
      try { body = await res.json(); } catch (_) { body = null; }
      const rejected = body && (body.ok === false || (Array.isArray(body.errors) && body.errors.length > 0));
      if (res.ok && !rejected) return { ok: true };
      return { ok: false, reason: 'provider', status: res.status };
    } catch (err) {
      return { ok: false, reason: err && err.name === 'AbortError' ? 'timeout' : 'network' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /* ---------- DOM wiring (browser / jsdom) ---------- */
  function initContactForm(doc, config, fetchImpl) {
    const form = doc.getElementById('contact-form');
    if (!form) return null;
    const status = doc.getElementById('form-status');
    const submitBtn = doc.getElementById('submit-btn');
    const submitLabel = submitBtn.querySelector('[data-label]');
    const fields = ['name', 'email', 'phone', 'service', 'message'];
    const contact = (config && config.contact) || {};
    let busy = false;

    const el = (f) => form.elements[f];
    const errEl = (f) => doc.getElementById(f + '-error');

    function setFieldError(f, msg) {
      const input = el(f), box = errEl(f);
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('field-invalid');
        box.textContent = msg;
        box.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        input.classList.remove('field-invalid');
        box.textContent = '';
        box.hidden = true;
      }
    }

    function clearStatus() {
      status.className = 'form-status';
      status.removeAttribute('data-state');
      status.textContent = '';
    }

    function showStatus(state, text, withLinks) {
      clearStatus();
      status.dataset.state = state;
      status.classList.add('is-' + state);
      const p = doc.createElement('p');
      p.textContent = text;
      status.appendChild(p);
      if (withLinks) {
        const row = doc.createElement('p');
        row.className = 'status-links';
        const mail = doc.createElement('a');
        mail.href = 'mailto:' + (contact.email || '');
        mail.textContent = 'Email ' + (contact.email || '');
        const wa = doc.createElement('a');
        wa.href = contact.whatsapp || '#';
        wa.target = '_blank';
        wa.rel = 'noopener';
        wa.textContent = 'WhatsApp ' + (contact.phoneDisplay || '');
        row.appendChild(mail);
        row.appendChild(wa);
        status.appendChild(row);
      }
    }

    function setBusy(on) {
      busy = on;
      submitBtn.disabled = on;
      submitBtn.setAttribute('aria-busy', String(on));
      if (submitLabel) submitLabel.textContent = on ? 'Sending…' : 'Send enquiry';
      form.classList.toggle('is-busy', on);
    }

    function values() {
      const out = {};
      fields.forEach((f) => { out[f] = el(f).value; });
      return out;
    }

    fields.forEach((f) => {
      el(f).addEventListener('blur', () => { if (el(f).value !== '' || el(f).hasAttribute('aria-invalid')) setFieldError(f, V.validateField(f, el(f).value)); });
      el(f).addEventListener('input', () => { if (el(f).hasAttribute('aria-invalid')) setFieldError(f, V.validateField(f, el(f).value)); });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      clearStatus();
      const check = V.validateEnquiry(values());
      fields.forEach((f) => setFieldError(f, check.errors[f] || ''));
      if (!check.valid) {
        showStatus('error', MESSAGES.fixErrors, false);
        const first = fields.find((f) => check.errors[f]);
        if (first) el(first).focus();
        return;
      }
      setBusy(true);
      showStatus('info', 'Sending your enquiry…', false);
      const honeypot = (form.elements._gotcha && form.elements._gotcha.value) || '';
      const result = await submitEnquiry(check.values, {
        endpoint: config && config.formEndpoint,
        fetchImpl,
        honeypot
      });
      setBusy(false);
      if (result.ok) {
        form.reset();
        fields.forEach((f) => setFieldError(f, ''));
        showStatus('success', MESSAGES.success, false);
      } else if (result.reason === 'not_configured') {
        showStatus('error', MESSAGES.notConfigured, true);
      } else {
        showStatus('error', MESSAGES.failure, true);
      }
    });

    return { submitEnquiry };
  }

  return { MESSAGES, isEndpointConfigured, submitEnquiry, initContactForm };
});

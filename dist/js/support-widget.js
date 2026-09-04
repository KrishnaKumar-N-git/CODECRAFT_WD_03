/**
 * SMK Motor Spare Parts — Customer Support Widget
 * Floating chat button + slide-up support panel
 */
(function () {
  'use strict';

  const PHONE = '+919080799320';
  const WA_LINK = 'https://wa.me/919080799320';
  const PHONE_DISPLAY = '+91 90807 99320';

  function createWidget() {
    // ── Inject HTML ──────────────────────────────────────────────
    const container = document.createElement('div');
    container.id = 'support-widget';
    container.innerHTML = `
      <!-- Floating trigger button -->
      <button id="support-widget-btn" class="sw-fab" title="Customer Support" aria-label="Open Support">
        <span class="sw-fab-icon sw-icon-chat">💬</span>
        <span class="sw-fab-icon sw-icon-close" style="display:none">✕</span>
        <span class="sw-badge" id="sw-badge" style="display:none">1</span>
      </button>

      <!-- Support Panel -->
      <div class="sw-panel" id="sw-panel" aria-hidden="true">
        <div class="sw-panel-header">
          <div class="sw-panel-brand">
            <div class="sw-logo">S</div>
            <div>
              <div class="sw-panel-title">SMK Motor Spare Parts</div>
              <div class="sw-panel-subtitle">We reply within 30 minutes</div>
            </div>
          </div>
          <button class="sw-close-btn" onclick="SupportWidget.close()" aria-label="Close">✕</button>
        </div>

        <!-- Quick actions -->
        <div class="sw-quick-actions">
          <a href="tel:${PHONE}" class="sw-action-btn sw-action-call">
            <span>📞</span><span>Call Us</span><span class="sw-action-sub">${PHONE_DISPLAY}</span>
          </a>
          <a href="${WA_LINK}" target="_blank" class="sw-action-btn sw-action-wa">
            <span>💬</span><span>WhatsApp</span><span class="sw-action-sub">Chat Now</span>
          </a>
        </div>

        <!-- Enquiry form -->
        <div class="sw-form-section">
          <div class="sw-form-title">📝 Send an Enquiry</div>
          <div id="sw-form-wrap">
            <div class="sw-field">
              <input class="sw-input" id="sw-name"    type="text"  placeholder="Your name *" maxlength="80">
            </div>
            <div class="sw-field">
              <input class="sw-input" id="sw-phone"   type="tel"   placeholder="Phone number *" maxlength="20">
            </div>
            <div class="sw-field">
              <input class="sw-input" id="sw-email"   type="email" placeholder="Email (optional)" maxlength="120">
            </div>
            <div class="sw-field">
              <textarea class="sw-input sw-textarea" id="sw-message" placeholder="How can we help you? *" maxlength="500"></textarea>
            </div>
            <button class="sw-submit-btn" id="sw-submit" onclick="SupportWidget.submit()">
              Send Enquiry →
            </button>
          </div>
          <div id="sw-success" class="sw-success" style="display:none">
            <div style="font-size:2rem;margin-bottom:8px">✅</div>
            <strong>Enquiry Received!</strong>
            <p>We'll contact you at your number shortly.</p>
            <button class="sw-submit-btn" onclick="SupportWidget.resetForm()" style="margin-top:12px;background:transparent;border:1px solid var(--sw-amber)">Send Another</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="sw-panel-footer">
          📍 Near Old Bus Stand, Aruppukottai – 626 101
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  function attachListeners() {
    document.getElementById('support-widget-btn').addEventListener('click', () => {
      window.SupportWidget.toggle();
    });
  }

  window.SupportWidget = {
    _open: false,

    open() {
      this._open = true;
      const panel = document.getElementById('sw-panel');
      const btn   = document.getElementById('support-widget-btn');
      panel.classList.add('sw-panel-open');
      panel.setAttribute('aria-hidden', 'false');
      btn.querySelector('.sw-icon-chat').style.display = 'none';
      btn.querySelector('.sw-icon-close').style.display = '';
      btn.classList.add('sw-fab-active');
      // Hide notification badge on open
      document.getElementById('sw-badge').style.display = 'none';
    },

    close() {
      this._open = false;
      const panel = document.getElementById('sw-panel');
      const btn   = document.getElementById('support-widget-btn');
      panel.classList.remove('sw-panel-open');
      panel.setAttribute('aria-hidden', 'true');
      btn.querySelector('.sw-icon-chat').style.display = '';
      btn.querySelector('.sw-icon-close').style.display = 'none';
      btn.classList.remove('sw-fab-active');
    },

    toggle() {
      this._open ? this.close() : this.open();
    },

    async submit() {
      const name    = document.getElementById('sw-name').value.trim();
      const phone   = document.getElementById('sw-phone').value.trim();
      const email   = document.getElementById('sw-email').value.trim();
      const message = document.getElementById('sw-message').value.trim();

      if (!name)    { this._shake('sw-name');    return; }
      if (!phone)   { this._shake('sw-phone');   return; }
      if (!message) { this._shake('sw-message'); return; }

      const btn = document.getElementById('sw-submit');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      try {
        await API.submitEnquiry({ name, phone, email, message });
        document.getElementById('sw-form-wrap').style.display = 'none';
        document.getElementById('sw-success').style.display = 'block';
      } catch (err) {
        btn.textContent = 'Send Enquiry →';
        btn.disabled = false;
        // Show error inline
        if (typeof Components !== 'undefined') {
          Components.toast('Failed to send enquiry. Please call us directly.', 'error');
        }
      }
    },

    resetForm() {
      document.getElementById('sw-form-wrap').style.display = 'block';
      document.getElementById('sw-success').style.display = 'none';
      ['sw-name','sw-phone','sw-email','sw-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const btn = document.getElementById('sw-submit');
      btn.disabled = false;
      btn.textContent = 'Send Enquiry →';
    },

    _shake(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('sw-shake');
      el.focus();
      setTimeout(() => el.classList.remove('sw-shake'), 500);
    },
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { createWidget(); attachListeners(); });
  } else {
    createWidget();
    attachListeners();
  }

  // Show badge after 8 seconds (one-time nudge)
  setTimeout(() => {
    const badge = document.getElementById('sw-badge');
    if (badge && !window.SupportWidget._open) badge.style.display = 'flex';
  }, 8000);
})();

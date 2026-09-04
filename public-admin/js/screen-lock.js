/**
 * ScreenLock — Admin Dashboard Security Module
 * Features:
 *  - Auto-locks after INACTIVITY_MS of no activity
 *  - Manual lock via navbar button
 *  - 4-digit PIN entry with keypad UI
 *  - "Forgot PIN?" flow: send OTP to registered mobile → verify → set new PIN
 */

const ScreenLock = (() => {
  const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes
  const PIN_KEY       = 'sl_pin';        // localStorage key
  const DEFAULT_PIN   = '1234';          // first-time default
  let   _timer        = null;
  let   _locked       = false;

  /* ── PIN helpers ─────────────────────────────────────── */
  function getPin()       { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }
  function savePin(pin)   { localStorage.setItem(PIN_KEY, pin); }

  /* ── Inactivity timer ────────────────────────────────── */
  function resetTimer() {
    if (_locked) return;
    clearTimeout(_timer);
    _timer = setTimeout(lock, INACTIVITY_MS);
  }

  function startWatching() {
    ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(evt =>
      document.addEventListener(evt, resetTimer, { passive: true })
    );
    resetTimer();
  }

  /* ── Lock / Unlock ───────────────────────────────────── */
  function lock() {
    if (!App.user) return;   // Don't lock if not logged in
    _locked = true;
    clearTimeout(_timer);
    const overlay = document.getElementById('screen-lock-overlay');
    if (overlay) {
      overlay.classList.add('active');
      showPinScreen();
    }
  }

  function unlock() {
    _locked = false;
    const overlay = document.getElementById('screen-lock-overlay');
    if (overlay) overlay.classList.remove('active');
    resetTimer();
  }

  /* ── PIN screen renderer ─────────────────────────────── */
  function showPinScreen() {
    const body = document.getElementById('lock-body');
    if (!body) return;
    body.innerHTML = `
      <div class="lock-avatar">${App.user ? App.user.name.charAt(0).toUpperCase() : '?'}</div>
      <div class="lock-name">${App.user ? App.user.name : 'Admin'}</div>
      <div class="lock-subtitle">Enter your PIN to continue</div>

      <div class="lock-dots" id="lock-dots">
        <span class="lock-dot" id="ld0"></span>
        <span class="lock-dot" id="ld1"></span>
        <span class="lock-dot" id="ld2"></span>
        <span class="lock-dot" id="ld3"></span>
      </div>

      <div class="lock-error" id="lock-error"></div>

      <div class="lock-keypad" id="lock-keypad">
        ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
          <button class="keypad-btn ${k===''?'keypad-empty':''}" data-key="${k}">${k}</button>
        `).join('')}
      </div>

      <button class="lock-forgot-link" id="btn-forgot-pin" onclick="ScreenLock.showOtpFlow()">
        🔑 Forgot PIN? Reset via OTP
      </button>
    `;
    _pinBuffer = '';
    bindKeypad();
  }

  let _pinBuffer = '';

  function bindKeypad() {
    const kp = document.getElementById('lock-keypad');
    if (!kp) return;
    kp.addEventListener('click', (e) => {
      const btn = e.target.closest('.keypad-btn');
      if (!btn || btn.classList.contains('keypad-empty')) return;
      const k = btn.dataset.key;
      if (k === '⌫') {
        _pinBuffer = _pinBuffer.slice(0, -1);
      } else if (_pinBuffer.length < 4) {
        _pinBuffer += k;
      }
      updateDots();
      if (_pinBuffer.length === 4) {
        checkPin();
      }
    });
  }

  function updateDots() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`ld${i}`);
      if (dot) dot.classList.toggle('filled', i < _pinBuffer.length);
    }
  }

  function checkPin() {
    if (_pinBuffer === getPin()) {
      // Correct!
      const dots = document.getElementById('lock-dots');
      if (dots) dots.classList.add('success-shake');
      setTimeout(unlock, 350);
    } else {
      // Wrong
      _pinBuffer = '';
      updateDots();
      const errEl = document.getElementById('lock-error');
      if (errEl) {
        errEl.textContent = 'Incorrect PIN. Try again.';
        errEl.classList.add('shake');
        setTimeout(() => { errEl.textContent = ''; errEl.classList.remove('shake'); }, 1500);
      }
      const dots = document.getElementById('lock-dots');
      if (dots) dots.classList.add('error-shake');
      setTimeout(() => { if (dots) dots.classList.remove('error-shake'); }, 500);
    }
  }

  /* ── OTP flow ────────────────────────────────────────── */
  async function showOtpFlow() {
    const body = document.getElementById('lock-body');
    if (!body) return;

    const phone = App.user ? (App.user.phone || '') : '';
    const maskedPhone = phone ? phone.replace(/(\d{2})\d{6}(\d{2})/, '$1xxxxxx$2') : 'registered mobile';

    body.innerHTML = `
      <div class="lock-back-btn" onclick="ScreenLock.backToPinScreen()">← Back to PIN</div>
      <div style="font-size:2.5rem;margin-bottom:12px">📱</div>
      <div class="lock-name">Reset PIN via OTP</div>
      <div class="lock-subtitle">We'll send a code to <strong>${maskedPhone}</strong></div>

      <div id="otp-step-1">
        <button class="lock-otp-btn" id="btn-send-otp" onclick="ScreenLock.sendOtp()">
          Send OTP →
        </button>
      </div>

      <div id="otp-step-2" style="display:none; width:100%">
        <div class="lock-subtitle" style="margin-bottom:16px">Enter the 6-digit code:</div>
        <input type="text" id="lock-otp-input" class="lock-otp-input" maxlength="6"
               inputmode="numeric" placeholder="• • • • • •" autocomplete="one-time-code">
        <div class="lock-subtitle" style="margin:16px 0 8px">New 4-digit PIN:</div>
        <input type="password" id="lock-new-pin-input" class="lock-otp-input" maxlength="4"
               inputmode="numeric" placeholder="• • • •">
        <button class="lock-otp-btn" style="margin-top:16px" id="btn-confirm-otp"
                onclick="ScreenLock.confirmOtp()">
          Verify & Set New PIN →
        </button>
      </div>

      <div id="otp-lock-error" class="lock-error" style="margin-top:12px"></div>
    `;
  }

  async function sendOtp() {
    const btn = document.getElementById('btn-send-otp');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const phone = App.user ? (App.user.phone || '') : '';
    if (!phone) {
      showOtpError('No phone number on your account.');
      btn.disabled = false; btn.textContent = 'Send OTP →';
      return;
    }

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (data.mock) {
        showOtpError(`📋 Mock Mode: ${data.message}`, 'info');
      }

      // Show step 2
      document.getElementById('otp-step-1').style.display = 'none';
      document.getElementById('otp-step-2').style.display = 'block';
      document.getElementById('lock-otp-input')?.focus();
    } catch (err) {
      showOtpError('Failed to send OTP. Try again.');
      btn.disabled = false; btn.textContent = 'Send OTP →';
    }
  }

  async function confirmOtp() {
    const btn = document.getElementById('btn-confirm-otp');
    const otpCode = document.getElementById('lock-otp-input')?.value.trim();
    const newPin  = document.getElementById('lock-new-pin-input')?.value.trim();
    const phone   = App.user ? (App.user.phone || '') : '';

    if (!otpCode || otpCode.length < 4) return showOtpError('Enter the full OTP code.');
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return showOtpError('PIN must be exactly 4 digits.');
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // OTP verified — save new PIN
      savePin(newPin);
      showOtpError('✅ PIN updated successfully!', 'success');
      setTimeout(() => showPinScreen(), 1500);
    } catch (err) {
      showOtpError(err.message || 'Verification failed.');
      if (btn) { btn.disabled = false; btn.textContent = 'Verify & Set New PIN →'; }
    }
  }

  function showOtpError(msg, type = 'error') {
    const el = document.getElementById('otp-lock-error');
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === 'success' ? 'var(--success)'
                   : type === 'info'    ? 'var(--copper-light)'
                   : 'var(--danger)';
  }

  function backToPinScreen() {
    showPinScreen();
  }

  /* ── Public API ──────────────────────────────────────── */
  return { lock, unlock, startWatching, showOtpFlow, sendOtp, confirmOtp, backToPinScreen, getPin, savePin };
})();

// Auto-start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ScreenLock.startWatching();
});

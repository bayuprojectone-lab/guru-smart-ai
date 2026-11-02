/* Enhancement UI login only; authentication handlers and IDs in app.js remain untouched. */
(function () {
  'use strict';
  function enhancePassword(inputId, label) {
    var input = document.getElementById(inputId);
    if (!input || input.dataset.gsPasswordEnhanced) return;
    input.dataset.gsPasswordEnhanced = '1';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'gs-password-toggle';
    toggle.setAttribute('aria-label', 'Tampilkan password');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.textContent = 'Lihat';
    toggle.addEventListener('click', function () {
      var visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      toggle.textContent = visible ? 'Sembunyikan' : 'Lihat';
      toggle.setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password');
      toggle.setAttribute('aria-pressed', String(visible));
      input.focus();
    });
    input.insertAdjacentElement('afterend', toggle);
  }
  function init() {
    enhancePassword('loginPassword', 'password login');
    enhancePassword('regPassword', 'password pendaftaran');
    var card = document.querySelector('#authScreen > div:first-child');
    if (card && !card.querySelector('.gs-login-chip')) {
      var chip = document.createElement('div');
      chip.className = 'gs-login-chip';
      chip.innerHTML = '<span class="gs-login-dot"></span> PORTAL SEKOLAH • CLOUD SECURE';
      var header = card.querySelector(':scope > div:first-child');
      if (header) header.insertAdjacentElement('afterend', chip);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

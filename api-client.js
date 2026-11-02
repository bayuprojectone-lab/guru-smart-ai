/* Client opsional untuk Worker API. Tidak menggantikan fungsi AI lama secara otomatis.
   Setelah Worker ter-deploy, set window.GURU_SMART_API_BASE sebelum file ini dimuat,
   misalnya: window.GURU_SMART_API_BASE = 'https://guru-smart-sibi-api.NAMA-AKUN.workers.dev'; */
(function () {
  'use strict';
  const base = String(window.GURU_SMART_API_BASE || '').replace(/\/$/, '');
  window.GuruSmartAPI = {
    configured: Boolean(base),
    baseUrl: base,
    async health() {
      if (!base) throw new Error('GURU_SMART_API_BASE belum dikonfigurasi');
      const response = await fetch(base + '/api/health');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pemeriksaan API gagal');
      return data;
    },
    async chat(messages, options = {}) {
      if (!base) throw new Error('GURU_SMART_API_BASE belum dikonfigurasi');
      const response = await fetch(base + '/api/ai/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, model: options.model, temperature: options.temperature, max_tokens: options.max_tokens })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Permintaan AI gagal');
      return data.text || '';
    }
  };
})();

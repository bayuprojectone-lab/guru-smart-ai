
/* ============================================================
   DETEKSI & RENDER MODE BUZZER DI HEAD (sangat awal)
   ============================================================
   Strategi FINAL:
   1. Deteksi buzzer mode INSTAN saat head di-parse
   2. Override initApp/renderContent agar app utama tidak jalan
   3. Tambah CSS untuk hide elemen app utama + style UI buzzer
   4. Tampilkan overlay booting INSTAN (sebelum DOM siap)
   5. Daftarkan DOMContentLoaded handler untuk:
      - Bersihkan body
      - Bangun UI buzzer dengan inline CSS (tidak butuh Tailwind)
      - Hapus overlay booting
      - Poll sb (Supabase) hingga tersedia, lalu connect realtime
   
   PENTING: Tidak menunggu event 'load' (yang butuh semua CDN selesai).
   DOMContentLoaded cukup untuk render UI. Supabase di-poll terpisah.
   ============================================================ */
(function(){
  try {
    var hash = window.location.hash || '';
    var search = window.location.search || '';
    var isQueryBuzzer = (new URLSearchParams(search)).get('buzzer') === '1';
    var isHashBuzzer = hash.indexOf('#join-') === 0;
    if (!isHashBuzzer && !isQueryBuzzer) return;
    
    window.__BUZZER_MODE__ = true;
    
    // Override fungsi aplikasi utama agar tidak bisa dipanggil
    window.initApp = function(){ console.log('[Buzzer] initApp diblokir'); };
    window.renderContent = function(){ console.log('[Buzzer] renderContent diblokir'); };
    window.checkSession = function(){ return Promise.resolve(false); };
    
    // Parse room & teams dari URL
    var room = '';
    var initialTeams = [];
    if (isQueryBuzzer) {
        room = (new URLSearchParams(search)).get('room') || '';
        try { initialTeams = JSON.parse((new URLSearchParams(search)).get('teams') || '[]'); } catch (e) { initialTeams = []; }
    } else {
        var joinParts = hash.substring(6).split('--teams-');
        try { room = decodeURIComponent(joinParts[0] || ''); } catch (e) { room = joinParts[0] || ''; }
        try { if (joinParts.length > 1) initialTeams = JSON.parse(decodeURIComponent(joinParts.slice(1).join('--teams-'))); } catch (e) { initialTeams = []; }
    }
    if (!Array.isArray(initialTeams)) initialTeams = [];
    window.__BUZZER_ROOM__ = room;
    window.__BUZZER_TEAMS__ = initialTeams;
    
    document.title = "Buzzer Kuis Siswa";
    
    // Inject CSS: hide app utama + style UI buzzer (inline, tidak butuh Tailwind)
    var s = document.createElement('style');
    s.id = '__buzzer_css';
    s.textContent = [
      '#authScreen,#appScreen,#modalContainer,#toast,#printArea{display:none!important}',
      '*{box-sizing:border-box}',
      'html,body{margin:0!important;padding:0!important;min-height:100%!important;width:100%!important;background:#0f172a!important;color:#fff!important;font-family:Inter,Arial,sans-serif!important}',
      '#__buzzer_boot{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:Inter,Arial,sans-serif;font-size:18px;z-index:2147483647}',
      '#__buzzer_boot .bb-inner{text-align:center;padding:20px}',
      '#__buzzer_boot .bb-icon{font-size:48px;margin-bottom:12px;animation:bbpulse 1.2s ease-in-out infinite}',
      '@keyframes bbpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.92)}}',
      '#studentApp{min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(14px,4vw,28px);padding-bottom:max(24px,env(safe-area-inset-bottom));text-align:center;background:#0f172a;color:#fff}',
      '#studentLogin,#studentBuzzer{width:100%;max-width:480px}',
      '#teamList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:100%}',
      '#buzzBtn{width:100%;min-height:clamp(230px,48vh,430px);padding:24px 12px;border:3px solid rgba(255,255,255,.25);border-radius:28px;box-shadow:0 12px 30px rgba(0,0,0,.35);color:#fff;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation}',
      '.bb-hidden{display:none!important}'
    ].join('\n');
    document.documentElement.appendChild(s);
    
    // Tampilkan overlay booting INSTAN (sebelum body ada)
    function showBoot(){
      if(document.getElementById('__buzzer_boot'))return;
      var boot=document.createElement('div');
      boot.id='__buzzer_boot';
      boot.innerHTML='<div class="bb-inner"><div class="bb-icon">🔔</div><div>Memuat Buzzer Kuis...</div></div>';
      document.documentElement.appendChild(boot);
    }
    showBoot();
    
    // Fungsi utama: render UI buzzer + connect Supabase
    window.__renderBuzzerUI = function() {
      try {
        // Bersihkan body
        ['authScreen','appScreen','modalContainer','toast','printArea'].forEach(function(id){
          var el = document.getElementById(id);
          if(el) el.remove();
        });
        while(document.body && document.body.firstChild){ document.body.removeChild(document.body.firstChild); }
        
        // Bangun UI buzzer
        var room = window.__BUZZER_ROOM__ || '';
        var initialTeams = window.__BUZZER_TEAMS__ || [];
        var safeRoom = String(room).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
        
        var appWrap = document.createElement('div');
        appWrap.id = 'studentApp';
        appWrap.innerHTML =
            '<div id="studentLogin">'
          +   '<h1 style="font-size:clamp(24px,6vw,32px);font-weight:800;color:#fff;margin:0 0 16px">🔔 Buzzer Online</h1>'
          +   '<p style="color:#cbd5e1;margin:0 0 32px">Pilih Nama Tim Kamu di bawah ini:</p>'
          +   '<div id="teamList"></div>'
          + '</div>'
          + '<div id="studentBuzzer" class="bb-hidden">'
          +   '<div id="buzzBtn" style="background:linear-gradient(135deg,#ef4444,#e11d48)">'
          +     '<span style="font-size:64px;margin-bottom:8px">🔔</span>'
          +     '<span style="font-size:clamp(30px,8vw,48px)">TEKAN</span>'
          +   '</div>'
          +   '<div id="buzzStatus" style="margin-top:24px;min-height:36px;color:#4ade80;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center"></div>'
          +   '<button id="changeTeamBtn" style="margin-top:32px;color:#94a3b8;font-size:14px;background:none;border:none;text-decoration:underline;cursor:pointer;padding:10px 18px">Ganti Tim</button>'
          + '</div>'
          + '<p style="color:#64748b;font-size:12px;margin-top:48px">Tersambung ke Room: <span style="color:#4ade80;font-family:monospace">' + safeRoom + '</span></p>';
        document.body.appendChild(appWrap);
        
        // Hapus overlay booting
        var boot = document.getElementById('__buzzer_boot');
        if(boot) boot.remove();
        
        // Render teams
        var colors = [
          'linear-gradient(135deg,#ec4899,#e11d48)',
          'linear-gradient(135deg,#22d3ee,#3b82f6)',
          'linear-gradient(135deg,#a855f7,#d946ef)',
          'linear-gradient(135deg,#fb923c,#ef4444)'
        ];
        window.__buzzerRenderTeams = function(teams) {
          var list = document.getElementById('teamList');
          if (!list) return;
          list.innerHTML = '';
          teams.forEach(function(t, i) {
            var col = colors[i % colors.length];
            var btn = document.createElement('button');
            btn.style.cssText = 'min-height:108px;width:100%;border:0;border-radius:18px;padding:18px 8px;font-size:clamp(16px,4vw,22px);line-height:1.25;overflow-wrap:anywhere;touch-action:manipulation;background:'+col+';color:#fff;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px';
            btn.innerHTML = '<span style="font-size:28px">🔔</span>' + t;
            btn.onclick = function() {
              if(typeof kls_unlockAudio === 'function') kls_unlockAudio();
              document.getElementById('studentLogin').classList.add('bb-hidden');
              document.getElementById('studentBuzzer').classList.remove('bb-hidden');
              var bigBtn = document.getElementById('buzzBtn');
              bigBtn.style.background = col;
              bigBtn.onclick = function() {
                if(typeof playBuzzerHorn === 'function') playBuzzerHorn();
                bigBtn.style.transform = 'scale(0.95)';
                setTimeout(function() { bigBtn.style.transform = ''; }, 200);
                var status = document.getElementById('buzzStatus');
                if(status) {
                  status.innerHTML = '✅ Sinyal Terkirim!';
                  setTimeout(function() { status.innerHTML = ''; }, 2000);
                }
                try {
                  if(window.__buzzerChannel) {
                    window.__buzzerChannel.send({ type: 'broadcast', event: 'buzz', payload: { team: t } });
                  }
                  if(typeof sb !== 'undefined' && sb && sb.from) {
                    sb.from('kuis_buzzer').insert([{ room: room, team: t, created_at: new Date().toISOString() }]).then(function(){}).catch(function(e){});
                  }
                } catch(err) { console.warn('Buzzer send error:', err); }
              };
            };
            list.appendChild(btn);
          });
        };
        
        if (initialTeams.length) window.__buzzerRenderTeams(initialTeams);
        else window.__buzzerRenderTeams(['GARUDA', 'ELANG', 'RAJAWALI', 'MERPATI']);
        
        var changeBtn = document.getElementById('changeTeamBtn');
        if(changeBtn){
          changeBtn.onclick = function() {
            document.getElementById('studentLogin').classList.remove('bb-hidden');
            document.getElementById('studentBuzzer').classList.add('bb-hidden');
          };
        }
        
        // Poll Supabase hingga tersedia, lalu connect realtime channel
        var pollCount = 0;
        var pollInterval = setInterval(function(){
          pollCount++;
          if (typeof sb !== 'undefined' && sb && sb.channel) {
            clearInterval(pollInterval);
            try {
              var ch = sb.channel(room, { config: { broadcast: { self: false } } })
                .on('broadcast', { event: 'sync' }, function(payload) {
                  if(payload && payload.message && payload.message.teams && window.__buzzerRenderTeams){
                    window.__buzzerRenderTeams(payload.message.teams);
                  }
                })
                .subscribe(function(status) {
                  if (status === 'SUBSCRIBED') {
                    ch.send({ type: 'broadcast', event: 'request_sync', payload: {} });
                  }
                });
              window.__buzzerChannel = ch;
            } catch(e) { console.warn('Buzzer channel error:', e); }
          } else if (pollCount > 60) {
            // 30 detik (60 x 500ms) tetap tidak ada sb — tampilkan warning kecil
            clearInterval(pollInterval);
            console.warn('Supabase tidak tersedia setelah 30s');
          }
        }, 500);
        
      } catch(err) {
        console.error('Buzzer render error:', err);
        // Tetap hapus overlay biar user tidak stuck di "Memuat"
        var boot = document.getElementById('__buzzer_boot');
        if(boot) boot.remove();
        // Tampilkan error ke user
        if(document.body){
          document.body.innerHTML = '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:Arial;padding:20px;text-align:center"><div><div style="font-size:48px;margin-bottom:12px">⚠️</div><h2 style="margin:0 0 12px">Gagal Memuat Buzzer</h2><p style="color:#cbd5e1;margin:0">Silakan refresh halaman atau pindai ulang QR Code.</p><p style="color:#64748b;font-size:12px;margin-top:16px">'+String(err.message||err)+'</p></div></div>';
        }
      }
    };
    
    // Daftarkan DOMContentLoaded untuk render UI sesegera mungkin
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.__renderBuzzerUI);
    } else if (document.readyState === 'interactive') {
      // DOM sudah parse, langsung render
      setTimeout(window.__renderBuzzerUI, 0);
    } else if (document.readyState === 'complete') {
      // Sudah complete, langsung render
      setTimeout(window.__renderBuzzerUI, 0);
    }
    
    // FALLBACK: jika setelah 3 detik UI belum ke-render, paksa render
    setTimeout(function(){
      if(!document.getElementById('studentApp') && typeof window.__renderBuzzerUI === 'function'){
        console.warn('Buzzer fallback render triggered');
        try { window.__renderBuzzerUI(); } catch(e){ console.error(e); }
      }
    }, 3000);
    
  } catch(e) { 
    console.warn('Buzzer early-detect error:', e); 
  }
})();

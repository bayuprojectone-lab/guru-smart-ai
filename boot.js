/* ============================================================
   GURU SMART SERTIFIKAT — js/boot.js
   Mesin akselerasi & deteksi lingkungan (boot cepat, deteksi HP, konfigurasi dasar).
   Dipindah utuh dari berkas satu-halaman (tanpa perubahan kode);
   dimuat di posisi yang sama sehingga urutan eksekusi tetap identik.
   ============================================================ */
/* ---- Blok asli #2 ---- */

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

;
/* ---- Blok asli #3 ---- */

/* ============================================================
   MESIN LOADING KILAT GURU SMART (v2)
   Mempercepat loading sampai terasa 0 detik TANPA mengubah
   fungsi/kode aplikasi lain sedikit pun:
   1. Splash "Memuat" tampil SEKETIKA (sebelum CSS/library siap)
   2. Library berat (Chart/Excel/QR/Scanner/AI/Tailwind) dimuat
      paralel tanpa memblokir tampilan (atribut defer)
   3. Aplikasi boot di akhir <body> — tidak menunggu window.onload
      (tidak menunggu font/gambar selesai)
   4. Jaring pengaman: grafik & QR tetap tergambar walau library
      belum sempat tiba (antrian otomatis, diputar saat siap)
   5. Pemasang format Excel ikut ditunda sampai library Excel siap
   TAMBAHAN v2 (anti-ngelag, tanpa menyentuh kode aplikasi):
   6. Tailwind dimuat ASINKRON — aplikasi menyala lebih awal;
      konfigurasi (darkMode class, font Inter) dipasang OTOMATIS
      begitu Tailwind siap sehingga tampilan tidak berubah
   7. Splash gagal-aman: bila jaringan lambat, splash hilang sendiri
      begitu layar aplikasi tampil (maks 2,5 dtk) — tidak ada lagi
      tampilan menunggu tanpa batas
   8. ANTI-LAG SCROLL: listener sentuh/gulir level window & dokumen
      otomatis PASIF (standar browser modern) agar guliran HP mulus;
      listener yang memang butuh preventDefault (mis. papan tulis)
      tetap dihormati 100%
   9. ANTI-LAG GAMBAR: gambar yang dibuat dinamis otomatis
      loading=lazy + decoding=async (kecuali di area cetak) supaya
      kuota hemat & halaman tidak tersendat saat memuat gambar
   ============================================================ */
(function(){
  if(window.__BUZZER_MODE__){return;} /* Mode buzzer punya jalur cepatnya sendiri */

  /* ---------- 1. SPLASH INSTAN ---------- */
  var st=document.createElement('style');
  st.textContent='@keyframes gsbootspin{to{transform:rotate(360deg)}}#__gs_boot{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e3a8a 0%,#4338ca 55%,#6d28d9 100%);color:#fff;font-family:Inter,Arial,sans-serif;transition:opacity .3s ease}';
  document.documentElement.appendChild(st);
  var sp=document.createElement('div');
  sp.id='__gs_boot';
  sp.innerHTML='<div style="text-align:center;padding:24px"><div style="width:76px;height:76px;margin:0 auto 18px;border-radius:22px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(0,0,0,.28)"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 8v6"/></svg></div><div style="font-size:26px;font-weight:900;letter-spacing:.5px">GURU SMART</div><div style="font-size:12px;opacity:.75;margin-top:4px">Sistem Manajemen Sekolah</div><div style="width:30px;height:30px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;margin:22px auto 0;animation:gsbootspin .8s linear infinite"></div></div>';
  document.documentElement.appendChild(sp);
  function hideSplash(){
    var el=document.getElementById('__gs_boot');
    if(!el||el.dataset.done)return;
    el.dataset.done='1';
    el.style.opacity='0';
    setTimeout(function(){try{el.remove();st.remove();}catch(e){}},350);
  }
  var t0=Date.now(),twAt=0;
  var splashIv=setInterval(function(){
    var hide=false;
    try{
      if(!twAt&&window.tailwind)twAt=Date.now();
      var as=document.getElementById('authScreen');
      var ap=document.getElementById('appScreen');
      var av=as&&!as.classList.contains('hidden');
      var pv=ap&&!ap.classList.contains('hidden');
      if(window.tailwind&&(av||pv)&&twAt&&Date.now()-twAt>=300)hide=true;
      /* v14 gagal-aman: layar sudah tampil > 1.5 dtk (jaringan lambat) -> splash hilang sendiri */
      if(!hide&&(av||pv)&&Date.now()-t0>1500)hide=true;
    }catch(e){hide=true;}
    if(Date.now()-t0>20000)hide=true; /* jaring pengaman: splash hilang maks 20 dtk */
    if(hide){clearInterval(splashIv);hideSplash();}
  },80);

  /* ---------- 2. JARING PENGAMAN CHART (antrian + putar ulang) ---------- */
  (function(){
    if(typeof window.Chart!=='undefined')return;
    var q=[];
    window.Chart=function(ctx,cfg){q.push([ctx,cfg]);return{destroy:function(){},update:function(){},resize:function(){},data:(cfg&&cfg.data)||{}};};
    window.Chart.__gsStub=true;
    window.__gsFlushChart=function(){
      var C=window.Chart;
      if(!C||C.__gsStub)return;
      var Q=q.splice(0,q.length);
      setTimeout(function(){for(var i=0;i<Q.length;i++){try{new C(Q[i][0],Q[i][1]);}catch(e){console.warn('Chart replay:',e);}}},0);
    };
  })();

  /* ---------- 3. JARING PENGAMAN QRCODE (antrian + putar ulang) ---------- */
  (function(){
    if(typeof window.QRCode!=='undefined')return;
    var q=[];
    window.QRCode=function(el,opts){q.push([el,opts]);return{};};
    window.QRCode.__gsStub=true;
    window.QRCode.CorrectLevel={L:1,M:0,Q:3,H:2};
    window.__gsFlushQR=function(){
      var C=window.QRCode;
      if(!C||C.__gsStub)return;
      var Q=q.splice(0,q.length);
      setTimeout(function(){for(var i=0;i<Q.length;i++){try{new C(Q[i][0],Q[i][1]);}catch(e){console.warn('QR replay:',e);}}},0);
    };
  })();

  /* ---------- 4. BOOT CEPAT (dipanggil dari akhir <body>) ---------- */
  window.__gsFastBoot=function(){
    if(window.__gsBooted)return;
    window.__gsBooted=true;
    if(window.__BUZZER_MODE__)return;
    try{
      /* v14 MASUK INSTAN: bila ada sesi tersimpan (gs_currentUser), aplikasi
         langsung ditampilkan tanpa menunggu Supabase - layar logo/login tidak
         muncul lagi setiap kali file dibuka. Validasi sesi tetap berjalan di
         belakang: online & sesi tidak valid -> kembali ke layar masuk. */
      var cached=null;
      try{cached=JSON.parse(localStorage.getItem('gs_currentUser')||'null');}catch(eC){cached=null;}
      var hasCache=!!(cached&&cached.id);
      if(hasCache&&typeof initApp==='function'&&typeof checkSession==='function'){
        window.currentUser=cached;
        try{initApp();window.__gsFastEntered=true;}
        catch(eF){window.__gsFastEntered=false;console.warn('Boot cepat v14:',eF);}
      }
      if(typeof checkSession==='function'&&typeof initApp==='function'){
        if(hasCache&&!navigator.onLine){
          console.log('[Boot v14] Offline: memakai sesi tersimpan, validasi Supabase dilewati');
        }else{
          Promise.resolve(checkSession()).then(function(ok){
            if(ok){if(!window.__gsFastEntered)initApp();}
            else if(window.__gsFastEntered){
              try{localStorage.removeItem('gs_currentUser');}catch(eR){}
              location.reload();
            }
          }).catch(function(e){console.warn('Boot cepat:',e);});
        }
      }
    }catch(e){console.warn('Boot cepat:',e);}
  };

  /* ---------- 5. PENGAWAS LIBRARY (Excel + flush chart/QR + config Tailwind) ---------- */
  var excelDone=false,twDone=false,tick=0;
  var libIv=setInterval(function(){
    tick++;
    try{
      /* v2: pasang konfigurasi Tailwind segera setelah Tailwind siap (defer) */
      if(!twDone&&window.tailwind&&window.__gsTwCfg){
        try{window.tailwind.config=window.__gsTwCfg;twDone=true;window.__gsTwCfgApplied=true;}catch(e){console.warn('Config Tailwind:',e);}
      }
      if(!excelDone&&window.XLSX&&typeof XLSX.writeFile==='function'){
        if(typeof window.__gsInstallExcelFormat==='function'){try{window.__gsInstallExcelFormat();}catch(e){console.warn('Format Excel:',e);}}
        excelDone=true;
      }
      if(window.Chart&&!window.Chart.__gsStub&&window.__gsFlushChart){window.__gsFlushChart();}
      if(window.QRCode&&!window.QRCode.__gsStub&&window.__gsFlushQR){window.__gsFlushQR();}
    }catch(e){console.warn('Pengawas library:',e);}
    if(tick>500)clearInterval(libIv); /* berhenti setelah 30 dtk */
  },60);

  /* ---------- 6. PAKET ANTI-LAG v2 (tambahan, tanpa ubah kode aplikasi) ---------- */
  try{
    /* 6a. Listener sentuh/gulir level window & dokumen otomatis PASIF.
       Guliran di HP jadi mulus (standar browser modern). Listener yang
       sengaja meminta passive:false (mis. papan tulis) TETAP dihormati. */
    var _gsAdd=EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener=function(type,fn,opts){
      try{
        if((this===window||this===document)&&(type==='touchstart'||type==='touchmove'||type==='wheel')){
          if(opts===undefined||opts===null||opts===true||opts===false){
            return _gsAdd.call(this,type,fn,{capture:!!opts,passive:true});
          }
          if(typeof opts==='object'&&opts.passive===undefined){
            var o2={};for(var k in opts){o2[k]=opts[k];}o2.passive=true;
            return _gsAdd.call(this,type,fn,o2);
          }
        }
      }catch(e){}
      return _gsAdd.call(this,type,fn,opts);
    };
  }catch(e){}
  try{
    /* 6b. Gambar dinamis otomatis hemat kuota (lazy+async).
       Area cetak (#printArea) dan gambar ber-tag khusus tidak disentuh. */
    var gsLazy=function(img){
      try{
        if(!img||img.nodeType!==1||img.tagName!=='IMG')return;
        if(img.getAttribute('loading'))return;
        if(img.hasAttribute('data-gs-nolazy'))return;
        if(img.closest&&img.closest('#printArea'))return;
        img.setAttribute('loading','lazy');
        img.setAttribute('decoding','async');
      }catch(e){}
    };
    var mo=new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){
        var add=ms[i].addedNodes;
        if(!add||!add.length)continue;
        for(var j=0;j<add.length;j++){
          var n=add[j];
          if(!n||n.nodeType!==1)continue;
          if(n.tagName==='IMG'){gsLazy(n);}
          else if(n.querySelectorAll){var ims=n.querySelectorAll('img');for(var q=0;q<ims.length;q++){gsLazy(ims[q]);}}
        }
      }
    });
    var gsStartLazy=function(){try{mo.observe(document.body,{childList:true,subtree:true});}catch(e){}};
    if(document.body){gsStartLazy();}
    else{document.addEventListener('DOMContentLoaded',gsStartLazy,{once:true});}
  }catch(e){}
})();

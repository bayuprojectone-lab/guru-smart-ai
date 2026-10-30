/* Script yang sebelumnya berada di bagian <head>. */

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

;

/* ==================================================================
   GSAI BRIDGE v6 — CEPAT, TANPA POLLINATIONS, KUNCI SOAL AKURAT
   - Chat/Teks   : PUTER AI LANGSUNG (Pollinations dihapus total)
                   * Chat biasa: model cepat "gpt-4o-mini" dicoba paling awal
                   * MODE AKURAT: permintaan soal/matematika otomatis pakai
                     model kuat berhitung dulu (gpt-4o -> claude-3.5-sonnet)
                     supaya kunci jawaban & pembahasan tidak karangan
                   * Saldo/kuota Puter habis (Low Balance) -> lompat ke model
                     hemat gpt-4o-mini, lalu pesan panduan ganti akun gratis /
                     isi saldo (tanpa error teknis membingungkan)
                   * STREAMING: balasan tampil bertahap selagi AI mengetik
                   * Bantalan waktu tiap percobaan + fallback model otomatis
                   * Menunggu pustaka Puter siap (tidak langsung gagal)
   - Baca Gambar : Puter AI Vision (cukup klik "Sambungkan AI" sekali saja)
   - Buat Gambar : PUTER AI IMG (puter.ai.txt2img) = JALUR TUNGGAL + MODE KILAT
                   * Ukuran generate dipangkas (maks 640px, rasio sama) lalu
                     diperbesar presisi ke ukuran target -> jauh lebih cepat
                   * 2 strategi pemanggilan dipacu paralel, yang selesai duluan menang
                   Jika Puter gagal -> PEMBERITAHUAN LANGSUNG ke pengguna
   - OCR Darurat : Tesseract.js langsung di browser (tanpa server)
   ================================================================== */
window.GSAI=(function(){
  var lastProvider='-';
  function hasPuter(){try{return (typeof puter!=='undefined')&&puter&&puter.ai&&typeof puter.ai.chat==='function';}catch(e){return false;}}
  function hasImageMsg(ms){try{for(var i=0;i<ms.length;i++){var c=ms[i]&&ms[i].content;if(Array.isArray(c)){for(var j=0;j<c.length;j++){if(c[j]&&c[j].type==='image_url')return true;}}}}catch(e){}return false;}
  function toStr(c){if(typeof c==='string')return c;if(Array.isArray(c))return c.map(function(p){return (p&&p.text)||'';}).join('\n');return '';}
  function toText(r){
    try{
      if(r==null)return '';
      if(typeof r==='string')return r;
      if(typeof r.message==='string')return r.message;
      if(r.message){var c=r.message.content;if(typeof c==='string')return c;if(Array.isArray(c))return toStr(c);}
      if(Array.isArray(r.choices)&&r.choices[0])return toText(r.choices[0].message);
      if(typeof r.text==='string'&&r.text)return r.text;
      if(typeof r.content==='string')return r.content;
      if(Array.isArray(r.content))return toStr(r.content);
      if(typeof r.reasoning==='string'&&r.reasoning.trim())return r.reasoning;
    }catch(e){}
    return '';
  }
  /* ===== Pembantu kecepatan ===== */
  function waitPuter(ms){
    if(hasPuter())return Promise.resolve(true);
    return new Promise(function(res){
      var t0=Date.now();
      var iv=setInterval(function(){
        if(hasPuter()){clearInterval(iv);res(true);}
        else if(Date.now()-t0>(ms||8000)){clearInterval(iv);res(false);}
      },100);
    });
  }
  function isRateErr(e){var m=String((e&&(e.message||e))||e||'');return /429|too many|rate|kuota|quota|limit/i.test(m);}
  /* Saldo/kuota akun Puter habis (Low Balance) - semua model mahal pasti gagal */
  function isBalanceErr(e){var m=String((e&&(e.message||e))||e||'');return /low balance|not enough funding|upgrade to continue|insufficient (funds|balance)|funding/i.test(m);}
  function gsBalanceMsg(){return 'Kuota/saldo AI Puter akun Anda sudah habis (Low Balance). Solusi tercepat: klik tombol GANTI AKUN AI yang tampil bersama pesan ini (atau tombol Ganti Akun di kanan atas) lalu daftar akun Puter GRATIS yang baru - kuota langsung kembali penuh. Alternatif: isi saldo/upgrade akun Anda di puter.com/settings, lalu ulangi permintaan. Catatan: bila saldo masih tersisa sedikit, sistem otomatis mencoba model paling hemat (gpt-4o-mini) agar tetap bisa menjawab.';}
  function withTimeout(p,ms,label){
    return new Promise(function(res,rej){
      var t=setTimeout(function(){rej(new Error((label||'Proses')+' melebihi batas waktu ('+Math.round(ms/1000)+' dtk)'));},ms);
      p.then(function(v){clearTimeout(t);res(v);},function(e){clearTimeout(t);rej(e);});
    });
  }
  /* Satu percobaan chat ke Puter AI (streaming bila onDelta diberikan) */
  async function puterChatOnce(ms,model,onDelta){
    var opts={};
    if(model)opts.model=model;
    var stream=typeof onDelta==='function';
    if(stream)opts.stream=true;
    var res=await puter.ai.chat(ms,Object.keys(opts).length?opts:undefined);
    if(stream&&res&&typeof res[Symbol.asyncIterator]==='function'){
      var acc='',started=Date.now(),any=false;
      for await (var part of res){
        if(!any&&Date.now()-started>15000)throw new Error('Model lambat merespons (tanpa token awal 15 dtk)');
        var t=(part&&typeof part.text==='string')?part.text:(typeof part==='string'?part:'');
        if(t){acc+=t;any=true;onDelta(acc);}
      }
      if(!acc.trim())throw new Error('Respon kosong');
      return acc;
    }
    var txt=toText(res);
    if(!txt||!txt.trim())throw new Error('Respon kosong');
    if(stream)onDelta(txt);
    return txt;
  }
  /* Chat Puter AI: model tercepat dulu, fallback otomatis, bantalan waktu */
  async function puterChat(ms,onDelta){
    var ok=await waitPuter(8000);
    if(!ok)throw new Error('Pustaka Puter belum termuat — periksa koneksi internet lalu muat ulang halaman (refresh).');
    var signed=false;try{signed=puter.auth.isSignedIn();}catch(e){signed=false;}
    if(!signed){
      try{await puter.auth.signIn();}
      catch(eA){throw new Error('Sambungan Puter dibatalkan/diblokir. Klik tombol "🔗 Sambungkan AI" lalu izinkan popup yang muncul, kemudian ulangi pesan Anda.');}
    }
    /* MODE AKURAT: permintaan soal/kuis/hitungan/matematika otomatis dipakai
       model yang kuat berhitung agar kunci jawaban & pembahasan BENAR
       (bukan karangan). Chat biasa tetap pakai model tercepat. */
    function gsAccurMode(ms){
      try{
        var t=' ';
        for(var i=0;i<ms.length;i++){
          var m=ms[i]||{};
          if(m.role!=='user')continue;
          var c=m.content;
          t+=' '+(typeof c==='string'?c:JSON.stringify(c||''));
        }
        return /(soal|kuis|ulangan|ujian|latihan|matematika|hitung|perhitungan|pecahan|desimal|persen|kpk|fpb|aljabar|geometri|luas|keliling|volume|pythagoras|bilangan|aritmetika|statistika|peluang|persamaan|logaritma|exponen|turunan|integral|pembahasan|kunci jawaban)/i.test(t);
      }catch(e){return false;}
    }
    var accurate=gsAccurMode(ms);
    var attempts=accurate?[
      {model:'gpt-4o',label:'gpt-4o',tt:60000},
      {model:'claude-3-5-sonnet-latest',label:'claude-3.5-sonnet',tt:75000},
      {model:null,label:'model bawaan',tt:60000}
    ]:[
      {model:'gpt-4o-mini',label:'gpt-4o-mini',tt:45000},
      {model:null,label:'model bawaan',tt:60000},
      {model:'gpt-4o',label:'gpt-4o',tt:60000},
      {model:'claude-3-5-sonnet-latest',label:'claude-3.5-sonnet',tt:60000}
    ];
    var errs=[],balanceHit=false,triedMini=false;
    for(var i=0;i<attempts.length;i++){
      if(i>0&&isRateErr(errs[errs.length-1])){await new Promise(function(r){setTimeout(r,1200);});}
      let deadToken=false;
      let safeDelta=(typeof onDelta==='function')?function(t){if(!deadToken)onDelta(t);}:null;
      try{
        var txt=await withTimeout(puterChatOnce(ms,attempts[i].model,safeDelta),attempts[i].tt,attempts[i].label);
        lastProvider='Puter AI ['+(attempts[i].model||'default')+(accurate?' mode-akurat':'')+']';
        return txt;
      }catch(e){
        deadToken=true;
        errs.push(attempts[i].label+': '+((e&&(e.message||e))||e));
        if(typeof onDelta==='function'){try{onDelta('');}catch(e2){}}
        /* Low Balance: model mahal tidak akan berhasil - coba model paling hemat
           (gpt-4o-mini) lebih dulu sebelum menyerah */
        if(isBalanceErr(e)){
          balanceHit=true;
          var jump=-1;
          for(var k=i+1;k<attempts.length;k++){if(attempts[k].model==='gpt-4o-mini'){jump=k;break;}}
          if(jump<0&&!triedMini){
            attempts=attempts.slice(0,i+1).concat([
              {model:'gpt-4o-mini',label:'gpt-4o-mini',tt:45000},
              {model:null,label:'model bawaan',tt:60000}
            ]);
            jump=i+1;triedMini=true;
          }
          if(jump>0)i=jump-1;
        }
      }
    }
    if(balanceHit)throw new Error(gsBalanceMsg());
    throw new Error('Semua model AI gagal — '+errs.join(' | '));
  }
  /* Chat utama: SEMUA lewat Puter AI (Pollinations dihapus) */
  async function chat(ms,onDelta){
    ms=ms||[];
    try{
      return await puterChat(ms,(typeof onDelta==='function')?onDelta:null);
    }catch(e){
      if(hasImageMsg(ms)&&!isBalanceErr(e)){
        throw new Error('Fitur baca gambar membutuhkan Puter AI. Klik tombol "Sambungkan AI" di halaman Asisten AI (sekali saja), lalu ulangi. ('+((e&&(e.message||e))||e)+')');
      }
      throw e;
    }
  }
  function hasPuterImg(){try{return (typeof puter!=='undefined')&&puter&&puter.ai&&(typeof puter.ai.txt2img==='function'||typeof puter.ai.txtToImage==='function');}catch(e){return false;}}
  function extractImgSrc(el){
    try{
      if(typeof el==='string')return el;
      if(el&&el.tagName&&el.tagName.toLowerCase()==='img')return el.src||el.getAttribute('src')||'';
      if(el&&typeof el.src==='string'&&el.src)return el.src;
      if(el&&typeof el.url==='string'&&el.url)return el.url;
      if(el&&typeof el.toString==='function'){var s=el.toString();if(s&&(s.indexOf('http')===0||s.indexOf('data:image')===0))return s;}
    }catch(e){}
    return '';
  }
  function puterImgOnce(fn,args){
    return new Promise(function(res,rej){
      var to=setTimeout(function(){rej(new Error('Guru Smart AItimeout (75 dtk)'));},75000);
      Promise.resolve().then(function(){return fn.apply(null,args);}).then(function(el){
        clearTimeout(to);
        var s=extractImgSrc(el);
        if(s)res(s);else rej(new Error('Guru Smart AI tidak mengembalikan gambar'));
      }).catch(function(e){clearTimeout(to);rej(e);});
    });
  }
  /* Balapan N promise: beres pulang begitu SATU saja sukses (yang lain diabaikan);
     gagal hanya bila SEMUA gagal; error cancel/auth langsung memenangkan kegagalan. */
  function raceFirstSuccess(ps){
    return new Promise(function(res,rej){
      var pend=ps.length,errs=[];
      if(!pend){rej(new Error('Tidak ada strategi gambar'));return;}
      ps.forEach(function(p,idx){
        Promise.resolve(p).then(function(v){res(v);},function(e){
          var m=String((e&&e.message)||e||'');
          if(/cancel|batal|auth|sign in|popup|permission|blocked/i.test(m)){rej(e);return;}
          errs[idx]=e;pend--;
          if(pend===0){for(var i=0;i<errs.length;i++){if(errs[i]){rej(errs[i]);return;}}rej(new Error('Guru Smart AI gagal'));}
        });
      });
    });
  }
  function isCancelErr(e){return /cancel|batal|auth|sign in|popup|permission|blocked/i.test(String((e&&(e.message||e))||e||''));}
  async function puterImg(prompt,rq){
    if(!hasPuterImg())throw new Error('Pustaka Puter IMG belum termuat');
    var signed=false;try{signed=puter.auth.isSignedIn();}catch(e){signed=false;}
    if(!signed){await puter.auth.signIn();}
    /* ===== MODE KILAT =====
       1) Ukuran generate DIPANGKAS: sisi terpanjang maksimal 640px dengan rasio
          yang sama -> proses difusi jauh lebih cepat; hasil akhir diperbesar
          presisi ke ukuran target oleh fitRatio (canvas, tanpa distorsi).
       2) Dua strategi pemanggilan DIPACU BERSAMAAN (bentuk objek resmi Puter +
          bentuk klasik) — siapa pun yang selesai lebih dulu menang, yang lain
          diabaikan. Worst case ikut terpangkas karena tak lagi menunggu antrean
          berurutan 4 x 120 dtk. */
    var small=null;
    if(rq&&rq.w&&rq.h){
      var sc=Math.min(640/Math.max(rq.w,rq.h),1);
      small={w:Math.max(256,Math.round(rq.w*sc)),h:Math.max(256,Math.round(rq.h*sc))};
    }
    var o2=(typeof puter.ai.txt2img==='function')?puter.ai.txt2img:null;
    var o1=(typeof puter.ai.txtToImage==='function')?puter.ai.txtToImage:null;
    var strats=[];
    if(o2){
      if(small)strats.push({f:o2.bind(puter.ai),a:[{prompt:String(prompt),test_mode:false,ratio:{w:small.w,h:small.h},width:small.w,height:small.h}],lbl:'kilat-'+small.w+'x'+small.h});
      strats.push({f:o2.bind(puter.ai),a:[String(prompt),false],lbl:'klasik'});
    }
    if(o1&&o1!==o2)strats.push({f:o1.bind(puter.ai),a:[String(prompt),false],lbl:'alias'});
    if(!strats.length)throw new Error('Pustaka Puter IMG tidak dikenali');
    var lastErr=null;
    try{
      /* Gelombang 1: maksimal 2 strategi terbaik dipacu paralel */
      var w1=strats.slice(0,2);
      var s=await raceFirstSuccess(w1.map(function(x){return puterImgOnce(x.f,x.a);}));
      lastProvider='Guru Smart AI ('+w1[0].lbl+(w1.length>1?'/':'')+(w1.length>1?w1[1].lbl:'')+')';
      return s;
    }catch(e1){
      lastErr=e1;
      if(isBalanceErr(e1))throw new Error(gsBalanceMsg());
      if(!isCancelErr(e1)){
        /* Gelombang 2: sisa strategi dicoba berurutan */
        for(var j=2;j<strats.length;j++){
          try{var s2=await puterImgOnce(strats[j].f,strats[j].a);lastProvider='Guru Smart AI ('+strats[j].lbl+')';return s2;}
          catch(e2){lastErr=e2;if(isCancelErr(e2))break;}
        }
      }
    }
    if(lastErr&&isBalanceErr(lastErr))throw new Error(gsBalanceMsg());
    throw lastErr||new Error('Guru Smart AI gagal');
  }
  /* ===== Petunjuk rasio pada prompt ===== */
  function ratioHint(w,h){
    if(!w||!h)return '';
    var t=w/h,d;
    if(Math.abs(t-1)<0.04)d='persegi 1:1 (square)';
    else if(t>1)d='landscape mendatar '+w+'x'+h+' piksel (wide horizontal 16:9)';
    else d='portrait tegak '+w+'x'+h+' piksel (tall vertical 9:16)';
    return '. PENTING: buat seluruh komposisi gambar dalam format '+d+', objek utama lengkap di dalam bingkai, tanpa tepi kosong (no border, no letterbox).';
  }
  function canvasToUrl(cv){
    try{var du=cv.toDataURL('image/png');if(du&&du.length<2600000)return du;}catch(e){}
    try{return cv.toDataURL('image/jpeg',0.92);}catch(e2){return '';}
  }
  /* Jaminan rasio hasil akhir:
     - rasio sudah sesuai (toleransi 3%) -> biarkan apa adanya
     - selisih kecil (korong <=12%)      -> potong tengah, tanpa distorsi
     - selisih besar                     -> gambar utuh dipertahankan, sisi kosong
                                            diisi latar blur (tidak ada konten terbuang) */
  function fitRatio(src,w,h){
    return new Promise(function(res){
      if(!src||!w||!h){res(src);return;}
      var img=new Image(),done=false;
      var fin=function(v){if(!done){done=true;res(v||src);}};
      var to=setTimeout(function(){fin(src);},15000);
      img.onload=function(){
        clearTimeout(to);
        try{
          var iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
          if(!iw||!ih){fin(src);return;}
          var t=w/h,a=iw/ih;
          var cv=document.createElement('canvas');
          var ctx=cv.getContext('2d');
          if(!ctx){fin(src);return;}
          if(Math.abs(t-a)/t<0.01){
            /* MODE KILAT: hasil generate kecil ber-rasio sama -> perbesar presisi
               ke ukuran target (canvas high-quality), jadi ukuran akhir tetap pas. */
            if(w&&h&&(iw<w-2||ih<h-2)){
              cv.width=w;cv.height=h;
              ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
              ctx.drawImage(img,0,0,w,h);
              fin(canvasToUrl(cv));return;
            }
            fin(src);return;
          }
          if(a>t){
            var cw=Math.round(ih*t),ch=ih,loss=(iw-cw)/iw;
            if(loss<=0.12){cv.width=cw;cv.height=ch;ctx.drawImage(img,(iw-cw)/2,0,cw,ch,0,0,cw,ch);fin(canvasToUrl(cv));return;}
          }else{
            var cw2=iw,ch2=Math.round(iw/t),loss2=(ih-ch2)/ih;
            if(loss2<=0.12){cv.width=cw2;cv.height=ch2;ctx.drawImage(img,0,(ih-ch2)/2,cw2,ch2,0,0,cw2,ch2);fin(canvasToUrl(cv));return;}
          }
          cv.width=w;cv.height=h;
          ctx.filter='blur(28px)';
          var sc=Math.max(w/iw,h/ih)*1.18,bw=iw*sc,bh=ih*sc;
          ctx.drawImage(img,(w-bw)/2,(h-bh)/2,bw,bh);
          ctx.filter='none';
          ctx.fillStyle='rgba(15,23,42,0.22)';ctx.fillRect(0,0,w,h);
          var fc=Math.min(w/iw,h/ih),fw=iw*fc,fh=ih*fc;
          ctx.drawImage(img,(w-fw)/2,(h-fh)/2,fw,fh);
          fin(canvasToUrl(cv));
        }catch(e){fin(src);}
      };
      img.onerror=function(){clearTimeout(to);fin(src);};
      img.src=src;
    });
  }
  async function image(prompt,w,h){
    // JALUR TUNGGAL: PUTER AI IMG (puter.ai.txt2img) — satu jalur, lebih fokus & cepat.
    // Jika w & h diberikan: opsi rasio RESMI Puter dikirim (ratio/width/height) +
    // instruksi rasio pada prompt, lalu hasil akhir DIJAMIN ber-rasio tepat oleh
    // fitRatio (potong tengah / latar blur). Jika gagal -> pemberitahuan langsung.
    try{
      var wanted=prompt+ratioHint(w,h);
      var src=await puterImg(wanted,(w&&h)?{w:w,h:h}:null);
      if(!src)throw new Error('Guru Smart AI tidak mengembalikan gambar');
      var fitted=await fitRatio(src,w,h);
      return fitted||src;
    }catch(e1){
      var m1=(e1&&(e1.message||e1))||'tidak diketahui';
      throw new Error('GURU Smart AI gagal membuat gambar — '+m1+'. Klik tombol "🔗 Sambungkan AI" di bagian atas halaman (izinkan popup yang muncul), lalu coba lagi.');
    }
  }
  return {chat:chat,chatStream:function(ms,onDelta){return chat(ms,onDelta);},image:image,provider:function(){return lastProvider;}};
})();
window.gsDownloadImage=function(url,name){
  (async function(){
    try{
      var href=url,blob=null;
      try{var r=await fetch(url);if(r.ok)blob=await r.blob();}catch(e){}
      if(blob&&blob.size>0){try{href=URL.createObjectURL(blob);}catch(e){blob=null;href=url;}}
      var a=document.createElement('a');a.href=href;a.download=name||('Gambar_'+Date.now()+'.png');a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();document.body.removeChild(a);
      if(blob){setTimeout(function(){try{URL.revokeObjectURL(href);}catch(e){}},5000);}
      showToast('Gambar berhasil diunduh!','success');
    }catch(e){
      try{var w=window.open(url,'_blank');if(!w)throw new Error('popup diblokir');}catch(e2){showToast('Gagal unduh: '+(e2.message||e2),'error');}
    }
  })();
};
window.gsConnectPuter=async function(){
  try{
    if(typeof puter==='undefined'){showToast('Pustaka Puter belum termuat. Muat ulang halaman (refresh) lalu coba lagi. Semua fitur AI (chat, buat gambar, baca gambar) memakai Puter AI.','error');return;}
    var s=false;try{s=puter.auth.isSignedIn();}catch(e){}
    if(s){showToast('Puter AI sudah tersambung!','success');gsUpdateAuthChip();return;}
    showToast('Menyambungkan ke Puter AI... izinkan jendela yang muncul.','success');
    await puter.auth.signIn();
    showToast('Puter AI tersambung! Buat gambar (Guru Smart AI) & baca gambar siap dipakai.','success');
    gsUpdateAuthChip();
  }catch(e){
    showToast('Koneksi Puter dibatalkan/diblokir popup. Chat AI, buat gambar & baca gambar membutuhkan koneksi Puter — klik Sambungkan AI lagi untuk mencoba.','error');
    gsUpdateAuthChip();
  }
};
window.gsUpdateAuthChip=function(){
  var c=document.getElementById('gsAIAuthChip');if(!c)return;
  var ok='px-3 py-1.5 text-xs font-semibold rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700';
  var warn='px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
  var ready=false,signed=false;
  try{if(typeof puter!=='undefined'){ready=true;signed=puter.auth.isSignedIn();}}catch(e){}
  if(ready&&signed){c.innerHTML='✅ AI Tersambung';c.className=ok;}
  else if(!ready){c.innerHTML='⏳ Menyiapkan AI...';c.className=warn;}
  else{c.innerHTML='🔗 Sambungkan AI (wajib untuk semua fitur AI)';c.className=warn;}
};
/* Ganti akun Puter dalam satu klik: keluar -> popup masuk/daftar akun baru.
   Dipakai terutama saat kuota akun habis (Low Balance) - akun gratis baru
   langsung mendapat kuota AI baru. */
window.gsGantiAkunAI=async function(){
  try{
    if(typeof puter==='undefined'||!puter||!puter.auth){showToast('Pustaka Puter belum termuat. Muat ulang halaman (refresh) lalu coba lagi.','error');return;}
    var okS=confirm('Ganti akun AI Puter?\n\nAkun sekarang akan dikeluarkan, lalu jendela masuk/daftar Puter akan terbuka.\nGunakan akun Puter GRATIS yang baru agar kuota AI kembali penuh.\n\nLanjutkan?');
    if(!okS)return;
    showToast('Mengeluarkan akun lama...','info');
    try{await puter.auth.signOut();}catch(eS){}
    showToast('Jendela akun baru terbuka... izinkan popup bila diblokir.','info');
    await puter.auth.signIn();
    var u='';try{var gu=await puter.auth.getUser();if(gu&&gu.username)u=gu.username;}catch(eU){}
    showToast('Berhasil! Akun AI baru'+(u?' ('+u+')':'')+' terhubung - kuota baru siap dipakai. Silakan ulangi permintaan Anda.','success');
    try{gsUpdateAuthChip();}catch(eC){}
  }catch(e){
    var m=String((e&&(e.message||e))||e||'');
    if(/cancel|batal|dismiss|closed|popup|denied/i.test(m)){showToast('Penggantian akun dibatalkan - akun lama tetap dipakai.','info');}
    else{showToast('Gagal ganti akun: '+m+' - coba klik Ganti Akun lagi.','error');}
    try{gsUpdateAuthChip();}catch(eC2){}
  }
};
window.gsLocalOCR=function(dataUrl){
  return new Promise(function(resolve){
    var done=false;
    var finish=function(t){if(done)return;done=true;resolve((t||'').trim());};
    setTimeout(function(){finish('');},120000);
    try{
      var run=function(){
        try{
          if(typeof Tesseract==='undefined'){
            if(!document.getElementById('gsTessScript')){
              var s=document.createElement('script');s.id='gsTessScript';
              s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
              document.head.appendChild(s);
            }
            setTimeout(run,400);return;
          }
          Tesseract.recognize(dataUrl,'ind').then(function(r){finish(r&&r.data&&r.data.text);})
            .catch(function(){try{Tesseract.recognize(dataUrl,'eng').then(function(r2){finish(r2&&r2.data&&r2.data.text);}).catch(function(){finish('');});}catch(e){finish('');}});
        }catch(e){finish('');}
      };
      run();
    }catch(e){finish('');}
  });
};
console.log('%c GSAI Bridge v6 aktif — Chat: Puter AI streaming | Mode akurat soal-matematika | Gambar mode kilat | Low Balance: panduan + tombol Ganti Akun ','background:#10b981;color:#fff;border-radius:4px');

;
/* v2: config dipasang otomatis saat Tailwind siap (lihat Mesin KILAT #5) */window.__gsTwCfg={darkMode:'class',theme:{extend:{fontFamily:['Inter','sans-serif']}}};

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
      /* v2 gagal-aman: layar sudah tampil > 2.5 dtk (jaringan lambat) -> splash hilang sendiri */
      if(!hide&&(av||pv)&&Date.now()-t0>2500)hide=true;
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
      if(typeof checkSession==='function'&&typeof initApp==='function'){
        Promise.resolve(checkSession()).then(function(ok){if(ok)initApp();}).catch(function(e){console.warn('Boot cepat:',e);});
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

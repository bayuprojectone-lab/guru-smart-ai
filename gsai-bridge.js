/* ============================================================
   GURU SMART SERTIFIKAT — js/gsai-bridge.js
   GSAI Bridge v6 - jembatan AI (Puter) untuk chat, soal, dan gambar.
   Dipindah utuh dari berkas satu-halaman (tanpa perubahan kode);
   dimuat di posisi yang sama sehingga urutan eksekusi tetap identik.
   ============================================================ */
/* ---- Blok asli #10 ---- */

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

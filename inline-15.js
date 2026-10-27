
/* ==================================================================
   STUDIO GAMBAR AI — Panel Generate Gambar di halaman Asisten AI
   - Tab baru: 🎨 Buat Gambar (di samping 💬 Chat & 🖌️ Papan Tulis)
   - Mesin tunggal: Puter AI IMG (puter.ai.txt2img)
   - TANPA mesin cadangan: jika Puter AI gagal -> pemberitahuan langsung
   - Gaya cepat, ide prompt, rasio ukuran, galeri tersimpan di perangkat
   - Tombol: Unduh, Buat Ulang, Pratinjau, Kirim ke Chat
   ================================================================== */
(function(){
  var GS_IMG_KEY='gsAIImageHistory_v1';
  var RATIOS={
    persegi:{w:1024,h:1024,label:'1:1 Persegi',note:'HD 1440×1440'},
    lanskap:{w:1280,h:720,label:'16:9 Lanskap',note:'HD 1920×1080'},
    potret:{w:720,h:1280,label:'9:16 Potret',note:'HD 1080×1920'}
  };
  var STYLES=[
    {id:'kartun',icon:'🧒',label:'Kartun Anak',text:'gaya kartun anak edukatif, ceria, warna-warni, ramah anak'},
    {id:'realistis',icon:'🖼️',label:'Realistis',text:'gaya fotografi realistis, detail tinggi, pencahayaan natural'},
    {id:'poster',icon:'📋',label:'Poster Sekolah',text:'desain poster sekolah rapi, menarik, teks besar mudah dibaca'},
    {id:'buku',icon:'📚',label:'Ilustrasi Buku',text:'ilustrasi buku pelajaran yang jelas, informatif, warna lembut'},
    {id:'anime',icon:'🎌',label:'Anime',text:'gaya anime Jepang, garis bersih, warna cerah'},
    {id:'info',icon:'📊',label:'Infografis',text:'infografis edukatif rapi dengan ikon, diagram, dan teks jelas'},
    {id:'air',icon:'🌈',label:'Cat Air',text:'gaya lukisan cat air (watercolor) yang lembut dan artistik'},
    {id:'komik',icon:'🎭',label:'Komik',text:'gaya panel komik dengan garis tegas dan ekspresi lucu'}
  ];
  var IDEAS=[
    'Poster antar kelas bertema luar angkasa dengan astronot dan roket, warna biru cerah',
    'Ilustrasi siklus air (evaporasi, kondensasi, presipitasi) untuk siswa kelas 5 SD',
    'Maskot buku yang sedang membaca dengan ekspresi gembira untuk perpustakaan sekolah',
    'Spanduk kegiatan manasik haji anak-anak, lucu, berwarna-warni, penuh balon',
    'Ilustrasi angka 1 sampai 10 dengan buah-buahan untuk pembelajaran anak TK',
    'Poster menjaga kebersihan lingkungan sekolah dengan karakter anak yang ceria'
  ];
  var ratio='persegi';
  var styleActive=null;
  var busy=false;
  var current=null; /* {url,prompt} */
  var history=[];

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function slug(s){return String(s||'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').substring(0,40);}

  function loadHistory(){
    var arr=[];
    try{arr=JSON.parse(localStorage.getItem(GS_IMG_KEY)||'[]');}catch(e){arr=[];}
    history=(Array.isArray(arr)?arr:[]).filter(function(x){return x&&x.url&&x.url.indexOf('blob:')!==0;}).slice(0,8);
  }
  function saveHistory(){
    try{localStorage.setItem(GS_IMG_KEY,JSON.stringify(history.slice(0,8)));}
    catch(e){
      history=history.slice(0,3);
      try{localStorage.setItem(GS_IMG_KEY,JSON.stringify(history));}catch(e2){}
    }
  }
  async function persistUrl(url){
    try{
      if(url&&url.indexOf('blob:')===0){
        var b=await (await fetch(url)).blob();
        var du=await new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result);};fr.onerror=function(){rej(new Error('gagal baca'));};fr.readAsDataURL(b);});
        if(du)return du;
      }
    }catch(e){}
    return url;
  }
  window.gsImgHistoryUrl=function(i){return (history[i]||{}).url||'';};
  window.gsImgHistoryName=function(i){var it=history[i]||{};return 'GambarAI_'+(slug(it.prompt)||String(Date.now()))+'.png';};

  function renderGallery(){
    var g=document.getElementById('gsImgGallery');if(!g)return;
    if(!history.length){
      g.innerHTML='<p class="col-span-full text-xs text-slate-400 dark:text-slate-500 text-center py-3">Belum ada gambar tersimpan. Setiap gambar yang Anda buat akan otomatis muncul di sini.</p>';
      return;
    }
    g.innerHTML='';
    history.forEach(function(it,i){
      var d=document.createElement('div');
      d.className='relative group';
      d.innerHTML='<img src="'+it.url+'" alt="Gambar '+(i+1)+'" title="'+esc(String(it.prompt||'')).substring(0,90)+'" class="w-full h-20 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all" onclick="gsImgViewHistory('+i+')">'
        +'<button title="Unduh" onclick="event.stopPropagation();gsDownloadImage(gsImgHistoryUrl('+i+'),gsImgHistoryName('+i+'))" class="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-md w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">⬇</button>';
      g.appendChild(d);
    });
  }

  function setProviderText(t){
    var pv=document.getElementById('gsImgProvider');
    if(pv)pv.textContent=t||'';
  }
  function showEmpty(){
    var r=document.getElementById('gsImgResult');if(!r)return;
    r.innerHTML='<div class="text-center py-10 px-4 w-full">'
      +'<div class="text-6xl mb-3 floating">🎨</div>'
      +'<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada gambar</p>'
      +'<p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Tulis prompt di panel kiri, pilih gaya &amp; ukuran, lalu klik tombol <b>Buat Gambar Sekarang</b>.</p>'
      +'</div>';
    setProviderText('');
  }
  function showLoading(){
    var r=document.getElementById('gsImgResult');if(!r)return;
    r.innerHTML='<div class="text-center py-12 px-4 w-full">'
      +'<div class="relative w-20 h-20 mb-4 mx-auto"><div class="absolute inset-0 rounded-full border-4 border-purple-200"></div><div class="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div></div>'
      +'<p class="text-slate-600 dark:text-slate-300 text-sm font-semibold">🎨 AI sedang menggambar...</p>'
      +'<p class="text-xs text-slate-400 mt-1">Mode kilat: biasanya 15–45 detik • jangan tutup atau pindah halaman</p>'
      +'<p class="text-[11px] text-slate-400 mt-3">Jika lama: pastikan popup tidak diblokir dan tetap di halaman ini (tanpa mesin cadangan).</p>'
      +'</div>';
  }
  function showResult(url,prompt,providerText){
    current={url:url,prompt:prompt};
    var r=document.getElementById('gsImgResult');if(!r)return;
    r.innerHTML='<div class="w-full space-y-3">'
      +'<div class="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-slate-600 shadow-lg bg-white">'
      +'<img src="'+url+'" alt="Hasil gambar AI" class="w-full h-auto block cursor-zoom-in" onclick="gsImgPreviewCurrent()">'
      +'</div>'
      +'<p class="text-xs text-slate-500 dark:text-slate-400 italic break-words"><b>Prompt:</b> '+esc(prompt)+'</p>'
      +'<div class="flex flex-wrap gap-2 justify-center">'
      +'<button onclick="gsImgDownloadCurrent()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">💾 Unduh</button>'
      +'<button onclick="gsGenerateImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">🔄 Buat Ulang</button>'
      +'<button onclick="gsImgSendToChatCurrent()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">💬 Kirim ke Chat</button>'
      +'</div></div>';
    setProviderText(providerText||'');
  }
  function showError(msg){
    var r=document.getElementById('gsImgResult');if(!r)return;
    r.innerHTML='<div class="text-center py-8 px-4 w-full">'
      +'<div class="text-5xl mb-3">😕</div>'
      +'<p class="text-red-600 dark:text-red-400 font-semibold mb-1">Guru Smart AI gagal membuat gambar</p>'
      +'<p class="text-xs text-slate-500 dark:text-slate-400 mb-3 break-words">'+esc(msg)+'</p>'
      +'<p class="text-xs text-amber-600 dark:text-amber-400 mb-4">Tips: klik tombol <b>🔗 Sambungkan AI</b> di atas (izinkan popup yang muncul), pastikan koneksi stabil, lalu coba lagi. Gambar hanya dibuat oleh Puter AI — tidak ada mesin cadangan.</p>'
      +'<button onclick="gsGenerateImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">🔄 Coba Lagi</button>'
      +'</div>';
  }

  function renderStyles(){
    var box=document.getElementById('gsImgStyles');if(!box)return;
    box.innerHTML='';
    STYLES.forEach(function(s){
      var b=document.createElement('button');
      var on=(styleActive===s.id);
      b.className='px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all '+(on
        ?'bg-purple-600 border-purple-600 text-white shadow'
        :'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:border-purple-400');
      b.textContent=s.icon+' '+s.label;
      b.title=s.text;
      b.onclick=function(){styleActive=(styleActive===s.id?null:s.id);renderStyles();};
      box.appendChild(b);
    });
  }
  function renderRatios(){
    var box=document.getElementById('gsImgRatios');if(!box)return;
    box.innerHTML='';
    Object.keys(RATIOS).forEach(function(k){
      var rr=RATIOS[k];
      var on=(ratio===k);
      var b=document.createElement('button');
      b.className='rounded-lg px-2 py-2 text-[11px] font-semibold border text-center leading-tight transition-all '+(on
        ?'bg-purple-600 border-purple-600 text-white shadow'
        :'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:border-purple-400');
      b.innerHTML=rr.label+'<br><span class="'+(on?'text-purple-100':'text-slate-400 dark:text-slate-500')+' font-normal">'+rr.note+'</span>';
      b.onclick=function(){ratio=k;renderRatios();};
      box.appendChild(b);
    });
  }
  function renderIdeas(){
    var box=document.getElementById('gsImgIdeas');if(!box)return;
    box.innerHTML='';
    IDEAS.forEach(function(t){
      var b=document.createElement('button');
      b.className='w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] text-slate-600 dark:text-slate-200 transition-colors';
      b.textContent='💡 '+t;
      b.onclick=function(){var ip=document.getElementById('gsImgPrompt');if(ip){ip.value=t;ip.focus();}};
      box.appendChild(b);
    });
  }

  /* ===== Aksi global (dipakai onclick di HTML panel) ===== */
  window.gsImgPreviewCurrent=function(){
    if(!current||!current.url){showToast('Belum ada gambar untuk dipratinjau.','error');return;}
    openModal('🖼️ Pratinjau Gambar',
      '<div class="text-center"><img src="'+current.url+'" alt="Pratinjau" class="max-w-full rounded-xl mx-auto" style="max-height:65vh;object-fit:contain"></div>'
      +'<p class="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 italic break-words">'+esc(current.prompt)+'</p>'
      +'<div class="flex justify-center mt-3"><button onclick="gsImgDownloadCurrent()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">💾 Unduh Gambar</button></div>');
  };
  window.gsImgDownloadCurrent=function(){
    if(!current||!current.url){showToast('Belum ada gambar untuk diunduh.','error');return;}
    gsDownloadImage(current.url,'GambarAI_'+(slug(current.prompt)||String(Date.now()))+'.png');
  };
  window.gsImgSendToChatCurrent=function(){
    if(!current||!current.url){showToast('Belum ada gambar.','error');return;}
    gsImgSendToChat(current.url,current.prompt);
  };
  window.gsImgSendToChat=function(src,prompt){
    try{
      var box=document.getElementById('aiMessages');
      if(!box){showToast('Panel chat tidak ditemukan.','error');return;}
      var ud=document.createElement('div');ud.className='flex justify-end fade-in';
      var meta=(prompt?'<div class="text-[11px] px-1 mb-1 opacity-90">'+esc(String(prompt).substring(0,160))+'</div>':'');
      ud.innerHTML='<div class="max-w-[80%] rounded-xl px-3 py-2 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1 px-1">🖼️ Gambar dari Studio Gambar</div>'+meta+'<img src="'+src+'" class="rounded-lg max-w-full h-auto mt-1"></div>';
      box.appendChild(ud);box.scrollTop=box.scrollHeight;
      if(typeof switchAITab==='function')switchAITab('chat');
      showToast('Gambar dikirim ke Chat AI!','success');
    }catch(e){showToast('Gagal kirim ke chat: '+(e.message||e),'error');}
  };
  window.gsImgViewHistory=function(i){
    var it=history[i];if(!it)return;
    showResult(it.url,it.prompt||'','Dari galeri');
  };
  window.gsImgClearHistory=function(){
    if(!history.length){showToast('Galeri masih kosong.','success');return;}
    history=[];saveHistory();renderGallery();showToast('Galeri gambar dibersihkan.','success');
  };
  window.gsImgClearPrompt=function(){
    var ip=document.getElementById('gsImgPrompt');if(ip)ip.value='';
    styleActive=null;renderStyles();
  };

  /* ===== Fungsi utama: generate gambar ===== */
  window.gsGenerateImage=async function(){
    if(busy){showToast('Masih ada proses berjalan. Mohon tunggu...','error');return;}
    var ip=document.getElementById('gsImgPrompt');
    var prompt=(ip&&ip.value?ip.value:'').trim();
    if(!prompt){showToast('Tulis dulu deskripsi gambar (prompt) Anda.','error');if(ip)ip.focus();return;}
    var sel=null;
    for(var i=0;i<STYLES.length;i++){if(STYLES[i].id===styleActive){sel=STYLES[i];break;}}
    var suffix=(sel&&sel.text)?sel.text:'';
    var fullPrompt=prompt+(suffix?', '+suffix:'');
    var dim=RATIOS[ratio]||RATIOS.persegi;
    /* v7: target HD - semua rasio dinaikkan ke tingkat HD (+-2 megapiksel) */
    var HD={persegi:{w:1440,h:1440},lanskap:{w:1920,h:1080},potret:{w:1080,h:1920}};
    var hd=HD[ratio]||HD.persegi;
    var HDQ=' KUALITAS WAJIB: resolusi tinggi (HD), sangat tajam dan jelas (sharp focus), detail kaya, tanpa blur, tanpa noise.';
    busy=true;
    var btn=document.getElementById('gsImgGenBtn');
    if(btn){btn.disabled=true;btn.classList.add('opacity-60','pointer-events-none');btn.innerHTML='⏳ Sedang Membuat...';}
    showLoading();
    try{
      var src=null;
      try{src=await window.gsImageHD(fullPrompt+HDQ,hd.w,hd.h,dim.w,dim.h);}catch(eP){console.warn('HD native studio gagal - lanjut jalur kilat:',eP);}
      if(!src){src=await GSAI.image(fullPrompt+HDQ,dim.w,dim.h);}
      if(!src)throw new Error('AI tidak mengembalikan gambar.');
      src=await window.gsHDRefine(src,hd.w,hd.h);
      showResult(src,fullPrompt,GSAI.provider());
      var purl=await persistUrl(src);
      history.unshift({url:purl,prompt:fullPrompt,ts:Date.now()});
      saveHistory();renderGallery();
      showToast('Gambar berhasil dibuat! ('+GSAI.provider()+')','success');
    }catch(err){
      console.error('Studio Gambar:',err);
      showError(err.message||String(err));
      showToast('Guru Smart AI gagal membuat gambar.','error');
    }finally{
      busy=false;
      if(btn){btn.disabled=false;btn.classList.remove('opacity-60','pointer-events-none');btn.innerHTML='🎨 Buat Gambar Sekarang';}
    }
  };

  /* ===== HTML panel ===== */
  var PANEL_HTML=
    '<div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 lg:p-5 bg-slate-50 dark:bg-slate-900">'
    +'<div class="grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">'
    /* KIRI: FORM */
    +'<div class="lg:col-span-2 space-y-3">'
      +'<div class="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700 shadow-sm space-y-3">'
        +'<div>'
          +'<h4 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">🎨 Studio Gambar AI</h4>'
          +'<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Akan Membuat Gambar Sesuai Prompt Anda.<b></b></p>'
        +'</div>'
        +'<div>'
          +'<div class="flex items-center justify-between mb-1">'
            +'<label class="block text-xs font-bold text-slate-600 dark:text-slate-300">✏️ Deskripsi Gambar (Prompt) <span class="text-red-500">*</span></label>'
            +'<button onclick="gsImgClearPrompt()" class="text-[10px] text-slate-400 hover:text-red-500 underline">bersihkan</button>'
          +'</div>'
          +'<textarea id="gsImgPrompt" rows="4" placeholder="Contoh: Poster antar kelas bertema luar angkasa, ada astronot dan roket, warna biru cerah..." class="w-full px-3 py-2 rounded-xl border dark:bg-slate-700 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 outline-none text-sm"></textarea>'
          +'<p class="text-[10px] text-slate-400 mt-1">Tips: tekan Ctrl+Enter untuk langsung membuat gambar.</p>'
        +'</div>'
        +'<div>'
          +'<label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">🎭 Gaya Cepat <span class="font-normal text-slate-400">(klik untuk pilih, klik lagi untuk lepas)</span></label>'
          +'<div id="gsImgStyles" class="flex flex-wrap gap-1.5"></div>'
        +'</div>'
        +'<div>'
          +'<label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">📐 Ukuran / Rasio</label>'
          +'<div id="gsImgRatios" class="grid grid-cols-3 gap-1.5"></div>'
          +'<p class="text-[10px] text-slate-400 mt-1"></p>'
        +'</div>'
        +'<button id="gsImgGenBtn" onclick="gsGenerateImage()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all">🎨 Buat Gambar Sekarang</button>'
        +'<p class="text-[11px] text-slate-400 text-center">Proses 15–60 detik. Gambar otomatis tersimpan ke galeri.</p>'
      +'</div>'
      +'<div class="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700 shadow-sm">'
        +'<p class="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">💡 Ide Prompt Praktis <span class="font-normal text-slate-400">(klik untuk pakai)</span></p>'
        +'<div id="gsImgIdeas" class="space-y-1.5"></div>'
      +'</div>'
    +'</div>'
    /* KANAN: HASIL + GALERI */
    +'<div class="lg:col-span-3 space-y-3">'
      +'<div class="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700 shadow-sm flex flex-col min-h-[340px]">'
        +'<div class="flex items-center justify-between mb-2 flex-none">'
          +'<h4 class="font-bold text-slate-800 dark:text-white text-sm">🖼️ Hasil Gambar</h4>'
          +'<span id="gsImgProvider" class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 max-w-[60%] truncate"></span>'
        +'</div>'
        +'<div id="gsImgResult" class="flex-1 flex flex-col items-center justify-center"></div>'
      +'</div>'
      +'<div class="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700 shadow-sm">'
        +'<div class="flex items-center justify-between mb-2">'
          +'<h4 class="font-bold text-slate-800 dark:text-white text-sm">🗄️ Galeri Gambar <span class="text-[10px] font-normal text-slate-400">(tersimpan di perangkat ini)</span></h4>'
          +'<button onclick="gsImgClearHistory()" class="text-[11px] text-red-500 hover:underline">Hapus Semua</button>'
        +'</div>'
        +'<div id="gsImgGallery" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"></div>'
      +'</div>'
    +'</div>'
    +'</div>'
  +'</div>';

  /* ===== Inisialisasi: sisipkan tab + panel ke halaman Asisten AI ===== */
  window.gsInitGambarPanel=function(){
    try{
      var papan=document.getElementById('aiPapanPanel');
      if(!papan||!papan.parentElement)return;
      /* 1) Tombol tab, disisipkan sebelum chip Sambungkan AI */
      var chip=document.getElementById('gsAIAuthChip');
      if(chip&&!document.getElementById('tabGambarAI')){
        var tb=document.createElement('button');
        tb.id='tabGambarAI';
        tb.setAttribute('onclick',"switchAITab('gambar')");
        tb.className='px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-300';
        tb.innerHTML='🎨 Buat Gambar';
        chip.parentNode.insertBefore(tb,chip);
      }
      /* 2) Panel, disisipkan setelah panel papan tulis */
      if(!document.getElementById('aiGambarPanel')){
        var wrap=document.createElement('div');
        wrap.id='aiGambarPanel';
        wrap.className='hidden flex-1 min-h-0 flex-col overflow-hidden';
        wrap.innerHTML=PANEL_HTML;
        papan.parentElement.appendChild(wrap);
      }
      loadHistory();
      showEmpty();
      renderStyles();renderRatios();renderIdeas();renderGallery();
      /* Ctrl/Cmd+Enter untuk generate cepat */
      var ta=document.getElementById('gsImgPrompt');
      if(ta&&!ta.__gsBound){ta.__gsBound=true;ta.addEventListener('keydown',function(ev){if((ev.ctrlKey||ev.metaKey)&&(ev.key==='Enter'||ev.keyCode===13)){ev.preventDefault();gsGenerateImage();}});}
    }catch(e){console.warn('Studio Gambar init:',e);}
  };
})();

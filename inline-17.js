
(function(){
"use strict";
/* ===== GURU SMART REMOT JARI v13 — MODE MUDAH UNTUK SEMUA =====
   ☝️ Telunjuk  = gerakkan kursor (halus, 60fps)
   ⏱️ TAHAN DIAM di atas tombol ±1 dtk = KLIK OTOMATIS (Mode Mudah, ring progres di kursor)
   ✊ Kepal tangan = klik cepat di titik yang terkunci
   🖐️ Telapak 3-5 jari = scroll gaya HP (seret + meluncur)
   ✌️ Dua jari tahan 0,8 dtk = kembali ke menu utama
   BARU di v13 (dibuat agar MUDAH digunakan):
   1. KLIK OTOMATIS (dwell click) — tidak perlu mengepal: tunjuk tombol, tahan diam, klik terjadi sendiri
   2. SOROT HIJAU pada tombol yang sedang ditunjuk + kursor membesar = jelas apa yang akan diklik
   3. PANDUAN BERGAMBAR muncul otomatis saat pertama kali dinyalakan (+ tombol "Cara Pakai" di panel)
   4. ATUR SENSITIVITAS kursor: Lembut / Sedang / Cepat (tersimpan otomatis di perangkat)
   5. Deteksi gestur lebih toleran (ambang 1.12) & lebih responsif (2 dari 3 frame)
   6. Dua jari lebih cepat (0,8 dtk) dengan indikator persen di status
   7. Tombol tersembunyi berdenyut halus supaya mudah ditemukan lagi
   v13.2: SCROLL DIPERBAIKI — sebelumnya menggulir "window" yang tidak pernah bisa
   discroll (aplikasi memakai layout fixed). Kini sistem mencari container asli yang
   benar-benar bisa digulir di bawah telapak (#content, pop-up, chat, dsb.),
   lalu menggulirnya; kalau mentok, guliran lanjut ke induknya (scroll chaining).
   v13.3: RASA SCROLL DIBENAHKAN — momentum basi saat telapak fokus ulang di-nol-kan
   (dulu: halaman bisa melompat sendiri), getaran tangan disaring zona-mati lembut
   (gerak pelan tetap jalan, tak patah-patah), kecepatan lebih tenang (pengali 2.6 +
   batas ±130px/frame), dan meluncur hanya bila lepasan benar-benar cepat.
   v13.4: KURSOR NG-LAG DIBERESKAN — dulu ada 2 filter yang menumpuk (EMA berat di
   deteksi 15fps + peluncuran kursor yang lambat) jadi total jeda ±250ms. Kini:
   (1) target AI menempel ke tangan dalam 1 tick (EMA ringan), (2) kecepatan target
   diukur lalu dipakai UNTUK MENERKA posisi di sela deteksi (PREDIKSI 60fps — jeda
   deteksi jadi tak terlihat), (3) peluncuran kursor dinormalisasi waktu (konsisten
   di layar 60/90/120Hz), (4) zona mati lembut — gerak pelan tetap bergerak, tidak
   lagi "macet lalu terlontar", (5) deteksi adaptif bisa PULIH ke cepat setelah
   perangkat sibuk, (6) kecepatan basi selalu di-nol-kan saat ganti gestur/klik.
   v13.5: KURSOR MACET-MACET DIBERESKAN — dua akar tersisa: (a) inferensi AI
   SINKRON membekukan thread utama 10-40ms tiap deteksi → animasi kursor ikut
   membeku lalu melompat. Kini inferensi pindah ke WEB WORKER (thread terpisah):
   thread utama bebas penuh, render kursor mulus 60fps; bila worker tak didukung,
   otomatis pulih ke jalur sinkron lama. (b) getaran di sekitar SATU ambang membuat
   kursor jalan-diam-jalan saat gerak pelan → kini HISTERESIS 2 ambang (mulai
   gerak butuh 0.005, berhenti baru di 0.0028) + zona mati nyaris nihil saat
   sedang bergerak, sehingga gerak pelan kontinu tanpa tersendat.
   v13.6: PATAH-PATAH TERSISA DIBERESKAN — (1) prediksi kursor tidak lagi MATI
   TOTAL setelah 180ms tanpa deteksi (dulu: kursor MEMBEKU lalu MELOMPAT saat
   perangkat sibuk — inilah patah-patah khas). Kini gerakan DILANJUTKAN dengan
   perlambatan halus di sela deteksi, dibatasi luncur 13% layar agar kursor
   tidak pernah jalan sendiri jauh. (2) Kecepatan prediksi dihitung dari
   gerakan tangan MENTAH — dulu dihitung dari target yang sudah di-clamp tepi
   layar sehingga kursor macet di tepi & lambat membalik arah. (3) Redaman
   prediksi saat gerak pelan dihapus — dulu prediksi justru mati di gerak
   paling pelan. (4) Worker AI kini mencoba 2 CDN berturut-turut (jsdelivr
   lalu unpkg) dengan batas waktu tiap tahap — kalau satu CDN diblokir jaringan
   (mis. sebagian jaringan di Indonesia), AI tetap jalan di worker dan layar
   tidak pernah dibekukan. (5) Jalur sinkron darurat tidak lagi menjalankan AI
   di dalam rAF (tidak menahan pantulan layar) + watchdog frame menggantung.
   (6) Kamera diminta 30fps & pompa deteksi lebih rapat (50/80/110ms).
   v13.7: KAMERA BISA DISEMBUNYIKAN saat Remot Jari aktif — tombol 🙈 di panel
   menyembunyikan pratinjau menjadi gelembung kecil (🖐️ + titik hijau berdenyut).
   Video TETAP dirender di luar layar (160x120, opacity .01) sehingga frame kamera
   terus mengalir ke AI di worker dan SEMUA gestur tetap jalan normal. Ketuk
   gelembung untuk menampilkan kamera lagi. Menggambar skeleton di kanvas dilewati
   saat tersembunyi supaya thread utama makin ringan.
   v13.8: IKON MATIKAN TIDAK TAMPIL di PC & HP — karakter power U+23FB tidak
   disediakan font kebanyakan perangkat (muncul kosong/kotak). Diganti ikon power
   SVG inline (stroke currentColor — tetap merah saat hover) yang pasti tampil di
   semua perangkat; tombol ikon panel kini flex-center agar SVG pas di tengah;
   ⏳ diberi variation selector emoji (FE0F) agar konsisten tampil berwarna. */
var CDNS=[
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14',
  'https://unpkg.com/@mediapipe/tasks-vision@0.10.14'
];
var MODEL_URL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
var DWELL_MS=1100,ARC_LEN=113.1,TWO_HOLD=800;
var G={
  on:false,starting:false,session:0,stream:null,landmarker:null,gpuMode:'',cdnRoot:'',
  raf:0,lastVideoTime:-1,cx:Math.round(window.innerWidth/2),cy:Math.round(window.innerHeight/2),
  sx:0.5,sy:0.5,hist:[],dHist:[],stable:'NONE',lastSeen:0,lastCursorAt:0,lockUntil:0,
  clickArmed:true,clickAt:0,menuAt:0,palmSince:0,closedSince:0,closedTarget:null,pinchSince:0,pinchFired:false,safeClick:true,calibrating:false,calStarted:0,calSamples:[],calLastUi:0,
  scrollLast:null,scrollY:0.5,scrollVel:0,coast:0,coastRAF:0,drawnHand:false,recycling:false,dPrev:0,
  scrollEl:null,pcx:0.5,pcy:0.5,
  tx:0.5,ty:0.5,tvx:0,tvy:0,tAt:0,rLast:0,targetActive:false,rrender:0,pMoving:false,
  amp:1.6,smoothMs:22,dwell:true,dwellEl:null,dwellStart:0,dwellCool:0,hoverOn:false,dwellFiredEl:null,
  camHidden:0,paused:false,area:{xmin:0,xmax:1,ymin:0,ymax:1}
};
try{var sa=parseFloat(localStorage.getItem('gsGestureAmp'));if(sa>=1.2&&sa<=2.2)G.amp=sa;}catch(e){}
try{G.dwell=localStorage.getItem('gsGestureDwell')!=='0';}catch(e){}
try{var ga=JSON.parse(localStorage.getItem('gsGestureArea')||'null');if(ga&&ga.xmin>=0&&ga.xmax<=1&&ga.ymin>=0&&ga.ymax<=1&&ga.xmax-ga.xmin>=0.1&&ga.ymax-ga.ymin>=0.1)G.area=ga;}catch(e){}
try{var gd=parseInt(localStorage.getItem('gsGestureDwellMs')||'1100',10);if(gd>=500&&gd<=2500)DWELL_MS=gd;}catch(e){}
try{var sm=parseInt(localStorage.getItem('gsGestureSmoothMs')||'22',10);if(sm>=8&&sm<=45)G.smoothMs=sm;}catch(e){}
var P={interval:60,lastPump:0,msSum:0,msN:0,detectErr:0,tier:0,lastLatency:0,avgLatency:0,frames:0,fps:0,fpsAt:0,diagAt:0};
function $(id){return document.getElementById(id);}
function toast(m,t){try{if(typeof showToast==='function')showToast(m,t||'info');}catch(e){}}
function setStatus(t,ok){
  var el=$('gsGestureStatus');
  if(el){
    if(el.innerText!==t)el.innerText=t;
    if(ok)el.classList.add('gs-ok');else el.classList.remove('gs-ok');
  }
}
function dist(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}
var BONES=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
function withTimeout(p,ms,msg){
  return Promise.race([p,new Promise(function(_,rej){setTimeout(function(){rej(new Error(msg));},ms);})]);
}
/* ---------- Muat mesin AI: 2 CDN -> GPU -> CPU ---------- */
async function loadEngine(){
  if(G.landmarker)return;
  var vision=null,lastErr=null;
  for(var i=0;i<CDNS.length&&!vision;i++){
    try{vision=await import(CDNS[i]+'/vision_bundle.mjs');G.cdnRoot=CDNS[i];}
    catch(e){lastErr=e;}
  }
  if(!vision)throw new Error('mesin AI gagal diunduh. Periksa koneksi internet lalu coba lagi.');
  var fileset=await withTimeout(vision.FilesetResolver.forVisionTasks(G.cdnRoot+'/wasm'),40000,'unduhan mesin AI lambat/terputus. Coba lagi.');
  var mk=function(d){return{baseOptions:{modelAssetPath:MODEL_URL,delegate:d},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:0.32,minHandPresenceConfidence:0.35,minTrackingConfidence:0.35};};
  try{G.landmarker=await vision.HandLandmarker.createFromOptions(fileset,mk('GPU'));G.gpuMode='GPU';}
  catch(e){G.landmarker=await vision.HandLandmarker.createFromOptions(fileset,mk('CPU'));G.gpuMode='CPU';}
  updateCamLabel(0);
}
async function recycleEngineCpu(){
  if(G.recycling)return;G.recycling=true;
  try{
    var vision=await import(G.cdnRoot+'/vision_bundle.mjs');
    var fileset=await vision.FilesetResolver.forVisionTasks(G.cdnRoot+'/wasm');
    var old=G.landmarker;
    G.landmarker=await vision.HandLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath:MODEL_URL,delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:0.32,minHandPresenceConfidence:0.35,minTrackingConfidence:0.35});
    G.gpuMode='CPU';P.detectErr=0;P.msSum=0;P.msN=0;
    try{if(old&&old.close)old.close();}catch(x){}
    updateCamLabel(0);setStatus('♻️ Mode CPU');
  }catch(e){}
  G.recycling=false;
}
/* v13.1: kamera = titik indikator kecil (tanpa teks); detail hanya di tooltip */
function camDot(state){
  var el=$('gsGestureCam'),lab=$('gsCamLabel'),panel=$('gsGesturePanel');if(!el)return;
  el.classList.remove('gs-cam-on','gs-cam-err');
  if(state==='on')el.classList.add('gs-cam-on');else if(state==='err')el.classList.add('gs-cam-err');
  if(lab)lab.textContent=state==='on'?'Kamera aktif':state==='err'?'Kamera error':(G.paused?'Kamera dijeda':'Kamera mati');
  if(panel)panel.classList.toggle('gs-paused',!!G.paused);
}
function updateCamLabel(avgMs){
  var el=$('gsGestureCam');if(!el)return;
  el.title='kamera: aktif'+(G.gpuMode?' · '+G.gpuMode:'')+(avgMs?(' '+Math.round(avgMs)+'ms'):'');
}
/* ---------- Kursor & klik sintetis ---------- */
function moveCursor(x,y){
  G.cx=Math.max(0,Math.min(window.innerWidth-2,x));
  G.cy=Math.max(0,Math.min(window.innerHeight-2,y));
  var el=$('gsGestureCursor');
  if(el){el.style.display='block';el.style.transform='translate3d('+G.cx+'px,'+G.cy+'px,0)';}
}
function hideCursor(){var el=$('gsGestureCursor');if(el)el.style.display='none';G.targetActive=false;}
/* ---------- v13.4/13.6: Render 60fps — kursor MENERKA & MELANJUTKAN target ----------
   Di sela deteksi, posisi target diekstrapolasi memakai kecepatan terukur (tvx,tvy).
   v13.6: ekstrapolasi TIDAK LAGI MATI TOTAL setelah 180ms — bila deteksi terlambat
   (perangkat sibuk / interval panjang), gerakan DILANJUTKAN dengan perlambatan
   halus (konstanta 240ms setelah 110ms segar), dibatasi luncur maksimum 13% lebar
   layar — tidak ada lagi "membeku lalu melompat" (patah-patah), dan tangan yang
   berhenti tetap menghentikan kursor (deteksi berikutnya men-nol-kan kecepatan).
   Peluncuran konstanta-waktu 40ms dinormalisasi dt — mulus di layar 60/90/120Hz. */
function glideF(age){ /* panjang luncur prediksi (detik-layar) menurut usia deteksi */
  return age<=110?age/1000:(110+240*(1-Math.exp(-(age-110)/240)))/1000;
}
function cursorStep(dt,now){
  if(!G.targetActive)return 0;
  var w=window.innerWidth,h=window.innerHeight;
  var age=now-(G.tAt||now);if(age<0)age=0;
  var gx=G.tvx*glideF(age),gy=G.tvy*glideF(age);
  var cap=0.13,m2=gx*gx+gy*gy;
  if(m2>cap*cap){var sc=cap/Math.sqrt(m2);gx*=sc;gy*=sc;} /* luncur dibatasi: kursor tak jalan sendiri jauh */
  var px=(G.tx+gx)*w,py=(G.ty+gy)*h;
  var dx=px-G.cx,dy=py-G.cy;
  if(dx*dx+dy*dy<0.4)return 0; /* sudah pas - berhenti, hemat CPU */
  var k=1-Math.exp(-dt/Math.max(8,Math.min(45,G.smoothMs||22))); /* dapat diatur: kecil=responsif, besar=lebih halus */
  G.cx+=dx*k;G.cy+=dy*k;
  if(G.cx<0)G.cx=0;else if(G.cx>w-2)G.cx=w-2;
  if(G.cy<0)G.cy=0;else if(G.cy>h-2)G.cy=h-2;
  var el=$('gsGestureCursor');
  if(el){el.style.display='block';el.style.transform='translate3d('+Math.round(G.cx)+'px,'+Math.round(G.cy)+'px,0)';}
  return 1;
}
function gsUpdateDiagnostics(force){
  var now=performance.now();
  if(!force&&now-(P.diagAt||0)<500)return;
  P.diagAt=now;
  var cam=$('gsDiagCam'),hand=$('gsDiagHand'),fps=$('gsDiagFps'),lat=$('gsDiagLatency'),engine=$('gsDiagEngine'),advice=$('gsDiagAdvice');
  if(!cam&&!hand&&!fps&&!lat&&!engine)return;
  if(cam)cam.textContent=!G.on?'Mati':G.paused?'Dijeda':(G.stream&&G.stream.active?'Aktif':'Menyiapkan…');
  var age=G.lastSeen?now-G.lastSeen:Infinity;
  if(hand)hand.textContent=age<500?'Terdeteksi':G.on&&!G.paused?'Belum terbaca':'Menunggu kamera';
  if(fps){
    if(!P.fpsAt)P.fpsAt=now;
    if(now-P.fpsAt>=1000){P.fps=Math.round(P.frames*1000/(now-P.fpsAt));P.frames=0;P.fpsAt=now;}
    fps.textContent=(P.fps||0)+' FPS';
  }
  if(lat)lat.textContent=P.avgLatency?Math.round(P.avgLatency)+' ms':'Mengukur…';
  if(engine){
    var mode=W.worker?(W.ready?'Worker '+(W.gpu||'AI'):'Worker memuat'):G.landmarker?'AI '+(G.gpuMode||'aktif'):'AI belum siap';
    engine.textContent=mode+' · interval '+P.interval+' ms'+(P.detectErr?' · error '+P.detectErr:'');
  }
  if(advice){
    var msg=!G.on?'Aktifkan Remot Jari untuk mulai diagnostik.':
      G.paused?'Kamera sedang dijeda; lanjutkan untuk membaca tangan.':
      !G.stream||!G.stream.active?'Kamera belum mengalir. Periksa izin kamera browser.':
      age>1500?'Tangan belum terbaca. Tambah pencahayaan, tampilkan telapak dan ujung telunjuk, lalu jaga tangan di dalam bingkai.':
      P.avgLatency>80?'Inferensi lambat. Tutup aplikasi berat, gunakan pencahayaan terang, dan coba mode kamera ringan.':
      'Kondisi baik. Jaga telunjuk terlihat dan gerakkan tangan di dalam area kalibrasi.';
    advice.textContent=msg;
  }
}
function renderLoop(){
  if(!G.on){G.rrender=0;return;}
  G.rrender=requestAnimationFrame(renderLoop);
  var now=performance.now(),dt=now-(G.rLast||now-16);G.rLast=now;gsUpdateDiagnostics(false);
  if(dt<4)dt=4;if(dt>100)dt=100;
  cursorStep(dt,now);
}
function doClick(mode){
  /* Semua jalur klik (dwell/kepalan) melewati gerbang keamanan yang sama. */
  mode=mode||'unknown';
  var now=performance.now(),raw=null,target=null;
  try{raw=document.elementFromPoint(G.cx,G.cy);target=clickable(raw);}catch(e){}
  if(!target){setStatus('🛡️ Arahkan ke tombol');dwellReset();return false;}
  if(target.disabled||target.getAttribute('aria-disabled')==='true'||target.hasAttribute('disabled')){
    setStatus('🛡️ Tombol dinonaktifkan');dwellReset();return false;
  }
  var rect=target.getBoundingClientRect();
  if(!rect||rect.width<2||rect.height<2||rect.right<0||rect.bottom<0||rect.left>window.innerWidth||rect.top>window.innerHeight){
    setStatus('🛡️ Target tidak terlihat');dwellReset();return false;
  }
  /* Target harus tetap sama selama jeda; melindungi dari tangan bergetar. */
  if(mode==='dwell'){
    if(G.dwellEl!==target||!G.dwellStart||now-G.dwellStart<DWELL_MS){setStatus('🛡️ Target berubah, tahan lagi');dwellReset();return false;}
  }else if(mode==='fist'){
    if(G.closedTarget!==target){G.closedTarget=target;G.closedSince=now;setStatus('🛡️ Target berubah, tahan…');return false;}
    var stableFor=now-(G.closedSince||now),required=G.safeClick?220:120;
    if(stableFor<required){setStatus('🛡️ Pastikan target stabil…');return false;}
  }else{
    setStatus('🛡️ Jalur klik tidak dikenal');return false;
  }
  var label=(target.textContent||target.getAttribute('aria-label')||target.getAttribute('title')||'elemen').replace(/\s+/g,' ').trim().slice(0,60)||'elemen';
  /* Tindakan destruktif memerlukan konfirmasi tambahan sebelum event dikirim. */
  var context=(label+' '+(target.getAttribute('aria-label')||'')+' '+(target.getAttribute('title')||'')+' '+(target.id||'')+' '+(target.getAttribute('name')||'')).toLowerCase();
  var destructive=/(hapus|delete|remove|reset|kosongkan|bersihkan|clear[-_ ]?(data|all|history|nilai)|hapus[-_ ]?(semua|nilai|data|riwayat)|nilai.*hapus|hapus.*nilai)/i.test(context);
  if(destructive){
    var ok=false;
    try{ok=window.confirm('KONFIRMASI TAMBAHAN — TINDAKAN BERISIKO\n\nTarget: '+label+'\n\nTindakan ini dapat menghapus atau mengubah data. Apakah Anda yakin ingin melanjutkan?');}catch(e){}
    if(!ok){setStatus('🛡️ Tindakan dibatalkan');G.clickArmed=false;G.closedSince=0;G.closedTarget=null;dwellReset();G.dwellCool=now+700;return false;}
  }
  var el=$('gsGestureCursor');
  if(el){el.classList.add('gs-gclick');setTimeout(function(){el.classList.remove('gs-gclick');},320);}
  /* Reset klik otomatis + cooldown; klik hanya dikirim sekali ke target yang tervalidasi. */
  G.dwellStart=0;G.dwellEl=null;setDwellArc(0);G.dwellCool=now+1200;
  try{
    var o={bubbles:true,cancelable:true,view:window,clientX:G.cx,clientY:G.cy};
    target.dispatchEvent(new MouseEvent('mousedown',o));
    target.dispatchEvent(new MouseEvent('mouseup',o));
    target.dispatchEvent(new MouseEvent('click',o));
    setStatus('✅ '+label.slice(0,18),true);
    return true;
  }catch(e){setStatus('⚠️ Tak bisa diklik');return false;}
}
/* ---------- v13.5: WORKER INFERENSI — thread utama bebas, kursor tak pernah beku ----------
   Dulu: detectForVideo() SINKRON membekukan thread utama 10-40ms tiap deteksi
   (render kursor ikut beku lalu melompat = macet-macet). Kini AI berjalan di
   Web Worker terpisah: frame kamera dikirim sebagai ImageBitmap (transfer, tanpa
   salin), worker mengembalikan landmark, thread utama hanya menggambar kursor.
   Bila worker gagal (browser lama/CSP), otomatis kembali ke jalur sinkron. */
var WSRC=[
"const CDNS="+JSON.stringify(CDNS)+";",
"const MODEL='"+MODEL_URL+"';",
"let engine=null,initing=false;",
"function to(p,ms){return Promise.race([p,new Promise(function(_,rj){setTimeout(function(){rj(new Error('timeout'));},ms);})]);}",
"async function tryCdn(root){",
" const v=await to(import(root+'/vision_bundle.mjs'),15000);",
" const fs=await to(v.FilesetResolver.forVisionTasks(root+'/wasm'),20000);",
" const mk=d=>({baseOptions:{modelAssetPath:MODEL,delegate:d},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:0.32,minHandPresenceConfidence:0.35,minTrackingConfidence:0.35});",
" try{const eng=await to(v.HandLandmarker.createFromOptions(fs,mk('GPU')),30000);return{eng:eng,gpu:'GPU'};}",
" catch(e1){const eng=await to(v.HandLandmarker.createFromOptions(fs,mk('CPU')),30000);return{eng:eng,gpu:'CPU'};}",
"}",
"async function init(){",
" if(engine||initing)return;initing=true;",
" // v13.6: coba SEMUA CDN satu per satu — kalau satu CDN diblokir jaringan",
" // (mis. jsdelivr di sebagian jaringan Indonesia), AI tetap jalan di worker",
" for(let i=0;i<CDNS.length&&!engine;i++){",
"  try{const r=await tryCdn(CDNS[i]);engine=r.eng;postMessage({t:'ready',gpu:r.gpu});}",
"  catch(e){}",
" }",
" if(!engine)postMessage({t:'fail',err:'semua CDN gagal'});",
" initing=false;",
"}",
"init();",
"self.onmessage=function(e){",
" const m=e.data||{};",
" if(m.t!=='frame')return;",
" if(!engine){try{if(m.bmp&&m.bmp.close)m.bmp.close();}catch(x){}return;}",
" try{",
"  const r=engine.detectForVideo(m.bmp,m.ts);",
"  const lm=(r&&r.landmarks&&r.landmarks[0])||null;",
"  postMessage({t:'res',lm:lm,ts:m.ts});",
" }catch(err){postMessage({t:'err',err:String(err&&err.message||err)});}",
" finally{try{if(m.bmp&&m.bmp.close)m.bmp.close();}catch(x2){}}",
"};"
].join("\n");
var W={worker:null,ready:false,gpu:'',fail:0,bad:0,inflight:false,inflightAt:0};
function gsWorkerStart(){
  if(W.worker||typeof Worker==='undefined'||typeof createImageBitmap==='undefined')return;
  try{
    var blob=new Blob([WSRC],{type:'text/javascript'});
    /* v13.5.1: worker KLASIK (bukan module) — module worker dari blob diblokir CORS
       pada halaman file://; dynamic import() di dalam worker klasik jalan di mana saja */
    W.worker=new Worker(URL.createObjectURL(blob));
    W.worker.onmessage=function(e){
      var m=e.data||{};
      if(m.t==='ready'){W.ready=true;W.gpu=m.gpu||'GPU';G.gpuMode=W.gpu;updateCamLabel(0);}
      else if(m.t==='fail'){gsWorkerKill();} /* v13.6: semua CDN gagal di worker -> langsung fallback sinkron, jangan tunggu 20 dtk */
      else if(m.t==='res'){
        W.inflight=false;W.bad=0;
        P.lastLatency=performance.now()-(m.ts||performance.now());
        P.avgLatency=P.msN?((P.avgLatency*0.85)+(P.lastLatency*0.15)):P.lastLatency;
        P.frames++;
        P.msSum+=P.lastLatency;P.msN++;
        if(P.msN>=30){var avg=P.msSum/P.msN;updateCamLabel(avg);pumpTier(avg);P.msSum=0;P.msN=0;}
        onResults({landmarks:m.lm?[m.lm]:[]},null,m.ts);
      }
      else if(m.t==='err'){W.inflight=false;W.bad++;if(W.bad>=5)gsWorkerKill();}
    };
    W.worker.onerror=function(){W.bad+=5;if(W.bad>=5)gsWorkerKill();};
  }catch(e){W.worker=null;}
}
function gsWorkerKill(){
  var ada=!!W.worker;
  try{if(W.worker)W.worker.terminate();}catch(e){}
  W.worker=null;W.ready=false;W.inflight=false;
  if(ada){ /* pindah mode: jam & hitungan gestur di-reset agar tak ada sisa epoch lama */
    G.dwellStart=0;G.dwellEl=null;G.dwellCool=0;G.lockUntil=0;G.clickAt=0;G.lastCursorAt=0;G.lastSeen=0;
    if(G.on&&!G.landmarker)gsEnsureSyncEngine();
  }
}
function gsWorkerWaitReady(ms){
  return new Promise(function(res){
    if(!W.worker)return res(false);
    var t0=performance.now();
    var iv=setInterval(function(){
      if(!G.on||!W.worker){clearInterval(iv);res(false);return;}
      if(W.ready){clearInterval(iv);res(true);return;}
      if(W.fail>=2||performance.now()-t0>ms){clearInterval(iv);res(false);return;}
    },120);
  });
}
var GSYNC={loading:false};
async function gsEnsureSyncEngine(){
  if(G.landmarker||GSYNC.loading)return;GSYNC.loading=true;
  try{setStatus('⏳️ Menyiapkan AI…');await withTimeout(loadEngine(),60000,'unduhan mesin AI lambat/terputus.');setStatus('✅ Aktif!',true);}
  catch(e){setStatus('⚠️ Mesin AI gagal');}
  GSYNC.loading=false;
}
/* ---------- Canvas: skeleton tangan di panel ---------- */
function drawSkeleton(lm){
  if(G.camHidden){G.drawnHand=false;return;} /* v13.7: kamera tersembunyi — tak ada yang digambar, hemat kerja */
  var canvas=$('gsGestureCanvas');if(!canvas)return;
  var ctx=null;try{ctx=canvas.getContext('2d');}catch(e){}
  if(!ctx)return;
  if(!lm){
    if(G.drawnHand){try{ctx.clearRect(0,0,canvas.width,canvas.height);}catch(e){}G.drawnHand=false;}
    return;
  }
  var v=$('gsGestureVideo');
  var vw=(v&&v.videoWidth)||320,vh=(v&&v.videoHeight)||240;
  var cw=200,ch=Math.max(100,Math.round(200*vh/vw));
  if(canvas.width!==cw)canvas.width=cw;
  if(canvas.height!==ch)canvas.height=ch;
  try{
    ctx.clearRect(0,0,cw,ch);
    ctx.save();ctx.translate(cw,0);ctx.scale(-1,1);
    ctx.lineWidth=3;ctx.strokeStyle='rgba(96,165,250,.95)';
    for(var i=0;i<BONES.length;i++){var a=lm[BONES[i][0]],b=lm[BONES[i][1]];if(!a||!b)continue;ctx.beginPath();ctx.moveTo(a.x*cw,a.y*ch);ctx.lineTo(b.x*cw,b.y*ch);ctx.stroke();}
    for(var j=0;j<lm.length;j++){var p=lm[j];ctx.beginPath();ctx.fillStyle=(j===8)?'#f59e0b':(j===4)?'#10b981':'#e0f2fe';ctx.arc(p.x*cw,p.y*ch,(j===8||j===4)?6:3.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    G.drawnHand=true;
  }catch(e){}
}
/* ---------- Klasifikasi SANTAI v13: ambang lebih toleran (1.12) ---------- */
function classify(lm){
  var handSize=dist(lm[0],lm[9])||0.001;
  var ext={
    index:dist(lm[0],lm[8])>dist(lm[0],lm[6])*1.08,
    mid:dist(lm[0],lm[12])>dist(lm[0],lm[10])*1.08,
    ring:dist(lm[0],lm[16])>dist(lm[0],lm[14])*1.08,
    pinky:dist(lm[0],lm[20])>dist(lm[0],lm[18])*1.08
  };
  var n=(ext.index?1:0)+(ext.mid?1:0)+(ext.ring?1:0)+(ext.pinky?1:0);
  /* Jepit ibu jari + telunjuk = klik kanan; ambang relatif ukuran tangan agar tahan beda jarak kamera. */
  if(dist(lm[4],lm[8])/handSize<0.22)return{raw:'PINCH',handSize:handSize};
  if(n>=3)return{raw:'PALM',handSize:handSize}; /* 3-5 jari terbuka = scroll (pose longgar, mudah ditahan) */
  if(ext.index&&ext.mid)return{raw:'TWO',handSize:handSize}; /* tepat 2 jari = menu (tahan) */
  if(ext.index)return{raw:'POINT',handSize:handSize};
  return{raw:'CLOSED',handSize:handSize};
}
/* ---------- SCROLL GAYA HP: seret + meluncur (momentum seperti layar sentuh) ---------- */
function gsCoastStop(){
  if(G.coastRAF){cancelAnimationFrame(G.coastRAF);G.coastRAF=0;}
  G.coast=0;
}
function gsCoastStep(){
  G.coastRAF=0;
  if(!G.on)return;
  var v=G.coast;if(!v)return;
  gsScrollBy(v); /* v13.2: gulir container asli, bukan window */
  G.coast=v*0.93; /* gesekan layar: meluncur lalu melambat halus seperti di HP */
  if(Math.abs(G.coast)<0.4){G.coast=0;return;}
  G.coastRAF=requestAnimationFrame(gsCoastStep);
}
function gsCoastFlick(){
  var conv=16.7/(P.interval||66); /* kecepatan px per-tik pompa -> px per-frame 60fps */
  var v=Math.max(-80,Math.min(80,G.scrollVel*conv*1.15));
  if(Math.abs(v)<5)return; /* lepasan pelan = berhenti betulan; hanya lepasan cepat yang meluncur (anti getar) */
  G.coast=v;
  G.coastRAF=requestAnimationFrame(gsCoastStep);
}
/* ---------- v13.2: SCROLL KE CONTAINER YANG BENAR ----------
   Aplikasi ini TIDAK scroll di window (#appScreen fixed overflow-hidden).
   Konten halaman digulir di #content, pop-up di #modalContent, chat di #aiMessages,
   dsb. Saat telapak menyeret: cari container paling dalam yang benar-benar bisa
   digulir di bawah posisi telapak, gulir dia; kalau mentok, lanjut ke induknya
   (scroll chaining) — persis seperti menggulir dengan jari di layar HP. */
function gsScrollable(el){
  try{
    if(!el||el.nodeType!==1)return false;
    var cs=getComputedStyle(el);
    if(cs.overflowY!=='auto'&&cs.overflowY!=='scroll')return false;
    return el.scrollHeight>el.clientHeight+4;
  }catch(e){return false;}
}
function gsHandPoint(){
  var x=(1-G.pcx)*window.innerWidth,y=G.pcy*window.innerHeight; /* cermin seperti kursor */
  return{x:Math.max(1,Math.min(window.innerWidth-1,x)),y:Math.max(1,Math.min(window.innerHeight-1,y))};
}
function gsInRect(el,p){
  try{var r=el.getBoundingClientRect();return p.x>=r.left-2&&p.x<=r.right+2&&p.y>=r.top-2&&p.y<=r.bottom+2;}
  catch(e){return true;}
}
function gsFindScroller(){
  var p=gsHandPoint(),el=null,guard=0;
  try{el=document.elementFromPoint(p.x,p.y);}catch(e){}
  while(el&&guard++<16){
    if(!el.id||!/^gs(Gesture|Hover|Dwell)/.test(el.id)){ /* lewati elemen milik remot jari */
      if(gsScrollable(el))return el;
    }
    el=el.parentElement;
  }
  var ids=['content','modalContent','aiMessages','navMenu'];
  for(var i=0;i<ids.length;i++){var c=document.getElementById(ids[i]);if(gsScrollable(c))return c;}
  var de=document.scrollingElement||document.documentElement;
  if(gsScrollable(de))return de;
  return document.getElementById('content')||de;
}
function gsScrollBy(dy){
  var p=gsHandPoint();
  if(!G.scrollEl||!gsScrollable(G.scrollEl)||!gsInRect(G.scrollEl,p)){G.scrollEl=gsFindScroller();}
  var el=G.scrollEl,guard=0,left=dy;
  while(el&&guard++<6&&Math.abs(left)>0.5){
    var before=0;try{before=el.scrollTop;}catch(e){}
    try{
      if(el===document.scrollingElement||el===document.documentElement||el===document.body)window.scrollBy(0,left);
      else el.scrollTop=before+left;
    }catch(e){break;}
    var after=0;try{after=el.scrollTop;}catch(e){}
    left-=after-before; /* sisa guliran yang belum terserap container ini */
    if(Math.abs(left)<=0.5)break;
    /* container mentok di ujung: sisa diteruskan ke induk yang masih bisa digulir (scroll chaining) */
    var par=el.parentElement,found=null,g2=0;
    while(par&&g2++<12){if(gsScrollable(par)){found=par;break;}par=par.parentElement;}
    if(!found||found===el)break;
    el=found;G.scrollEl=el;
  }
}
/* ---------- v13.3: INTI SCROLL TELAPAK (dipisah agar bisa diuji tanpa kamera) ----------
   Dipanggil tiap frame pompa (±15fps) selama telapak terbuka terdeteksi.
   - Rata-rata bergerak (EMA 0.45): getaran deteksi tersaring, gerakan tetap responsif
   - Zona mati LEMBUT: getaran di bawah 0.0028 = nol, gerak pelan tetap bergerak pelan
     (tidak lagi "macet lalu melompat" seperti versi sebelumnya)
   - Pengali 2.6 + batas ±130px/frame: sapuan penuh ±2 layar, lonjakan deteksi tak melompatkan halaman
   - Arah berbalik = momentum lama dibuang; meluncur hanya bila lepasan benar-benar cepat */
function palmScrollUpdate(pcY){
  var sdir=0;
  G.scrollY=G.scrollY*0.55+pcY*0.45;
  var dy=G.scrollLast-G.scrollY;
  var mag=Math.abs(dy)-0.0028; /* zona mati lembut: kurangi besaran, jangan buang gerakan */
  if(mag>0){
    var pxs=(dy>0?1:-1)*mag*window.innerHeight*2.6; /* SERET: konten mengikuti tangan gaya HP */
    pxs=Math.max(-130,Math.min(130,pxs));
    if(G.scrollVel*pxs<0)G.scrollVel=0; /* arah berbalik: momentum lama tidak dibawa */
    gsCoastStop();
    gsScrollBy(pxs);
    G.scrollVel=G.scrollVel*0.5+pxs*0.5; /* catat kecepatan untuk lepasan */
    sdir=pxs>=0?1:-1;
  }else{
    /* tangan diam = "lepas jari": konten meluncur sendiri lalu melambat (bila lepasannya cepat) */
    if(!G.coastRAF)gsCoastFlick();
    G.scrollVel*=0.4;
  }
  G.scrollLast=G.scrollY;
  return sdir;
}
/* ---------- v13: SOROT tombol yang ditunjuk + KLIK OTOMATIS (dwell) ---------- */
function clickable(el){
  try{
    if(!el||el.nodeType!==1)return null;
    return el.closest('button,a,[role="button"],[onclick],input,select,textarea,label,summary,.cursor-pointer');
  }catch(e){return null;}
}
function hoverBox(el){
  var hb=$('gsHoverBox');if(!hb)return;
  if(!el){
    if(G.hoverOn){G.hoverOn=false;hb.style.display='none';}
    var c=$('gsGestureCursor');if(c)c.classList.remove('gs-hover');
    return;
  }
  try{
    var r=el.getBoundingClientRect();
    if(!r||r.width<2||r.height<2){hoverBox(null);return;}
    var L=Math.max(0,r.left-4),T=Math.max(0,r.top-4);
    hb.style.display='block';
    hb.style.left=L+'px';hb.style.top=T+'px';
    hb.style.width=Math.min(window.innerWidth-L,r.width+8)+'px';
    hb.style.height=Math.min(window.innerHeight-T,r.height+8)+'px';
    G.hoverOn=true;
    var c2=$('gsGestureCursor');if(c2)c2.classList.add('gs-hover');
  }catch(e){}
}
function setDwellArc(pr){
  var a=$('gsDwellArc');if(!a)return;
  pr=Math.max(0,Math.min(1,pr||0));
  a.style.strokeDashoffset=String(ARC_LEN*(1-pr));
}
function dwellReset(){
  G.dwellEl=null;G.dwellStart=0;setDwellArc(0);
}
function dwellTick(now){
  if(!G.targetActive){hoverBox(null);dwellReset();return;}
  var el=null;try{el=document.elementFromPoint(G.cx,G.cy);}catch(e){}
  var click=clickable(el);
  if(!click){
    if(G.dwellEl||G.hoverOn)hoverBox(null);
    dwellReset();
    return;
  }
  hoverBox(click);
  if(G.dwellFiredEl&&click===G.dwellFiredEl){setDwellArc(0);return;} /* elemen ini baru diklik: pindah sorotan dulu agar tidak dobel */
  G.dwellFiredEl=null;
  if(!G.dwell){setDwellArc(0);return;} /* Mode Mudah mati: sorotan saja */
  if(now<(G.dwellCool||0)){setDwellArc(0);return;} /* baru saja klik: jeda dulu */
  if(G.dwellEl!==click){G.dwellEl=click;G.dwellStart=now;}
  var pr=(now-G.dwellStart)/DWELL_MS;
  if(pr>=1){
    G.cx=Math.round(G.tx*window.innerWidth);G.cy=Math.round(G.ty*window.innerHeight);
    G.tvx=0;G.tvy=0;
    if(doClick('dwell')){G.dwellFiredEl=click;G.lockUntil=now+500;}
    else {G.dwellStart=0;G.dwellEl=null;setDwellArc(0);}
  }else{
    setDwellArc(pr);
  }
}
/* ---------- v13.4/13.5: MESIN KURSOR RESPONSIF ----------
   - EMA ringan (alpha 0.7-0.9): target menempel ke tangan dalam 1 tick deteksi
     (dulu alpha 0.5-0.85 di deteksi 15fps = sumber lag terbesar)
   - v13.5 HISTERESIS 2 AMBANG — akar "macet-macet" saat gerak pelan adalah sp
     yang goyang di sekitar SATU ambang (kursor jalan-diam-jalan). Kini: mulai
     bergerak butuh sp>0.005 (getaran tak melampaui; gerak nyata mengumpulkan
     celah tiap tick sehingga tetap lolos), berhenti baru saat sp<0.0025, dan
     selama bergerak zona mati nyaris nihil (0.0012) → gerak pelan kontinu mulus
   - Kecepatan target (tvx,tvy) diukur tiap tick untuk prediksi 60fps di atas */
function pointMove(tx0,ty0,now){
  var ddx=tx0-G.sx,ddy=ty0-G.sy;
  var sp=Math.sqrt(ddx*ddx+ddy*ddy);
  if(!G.pMoving){
    if(sp<0.0028){G.tvx*=0.6;G.tvy*=0.6;G.tAt=now;return sp;} /* diam: getar tersaring, gerak nyata mengumpul celah */
    G.pMoving=true;
  }else if(sp<0.0014){G.pMoving=false;G.tvx=0;G.tvy=0;G.tAt=now;return sp;}
  var a=Math.min(0.94,0.78+sp*3),eff=Math.max(0,sp-0.0006)/sp;
  var nsx=G.sx+ddx*eff*a,nsy=G.sy+ddy*eff*a;
  var rx=(nsx-0.5)*G.amp+0.5,ry=(nsy-0.5)*G.amp+0.5; /* amp = sensitivitas pengguna */
  var dtP=now-(G.tAt||now-60);if(dtP<10)dtP=10;if(dtP>300)dtP=300;
  /* v13.6: kecepatan dari gerakan tangan MENTAH (tanpa clamp tepi) — dulu dihitung
     dari target yang sudah di-clamp, sehingga di tepi layar kecepatan selalu 0:
     kursor macet di tepi & lambat membalik arah */
  var vx=ddx*eff*a*G.amp/dtP*1000,vy=ddy*eff*a*G.amp/dtP*1000;
  if(vx>2.5)vx=2.5;else if(vx<-2.5)vx=-2.5; /* lompatan 1 tick tidak boleh mendominasi */
  if(vy>2.5)vy=2.5;else if(vy<-2.5)vy=-2.5;
  G.tvx=G.tvx*0.4+vx*0.6;G.tvy=G.tvy*0.4+vy*0.6;
  if(G.tvx>1.6)G.tvx=1.6;else if(G.tvx<-1.6)G.tvx=-1.6;
  if(G.tvy>1.6)G.tvy=1.6;else if(G.tvy<-1.6)G.tvy=-1.6;
  /* v13.6: redaman prediksi berbasis KECIPATAN TANGAN (bukan sp per-tick) — tangan
     benar-benar pelan/berhenti = prediksi diredam (berhenti pas, tak meluncur jauh),
     tapi deteksi jarang tak lagi membunuh prediksi (dulu: sp<0.008 per-tick) */
  if(sp/dtP*1000<0.15){G.tvx*=0.7;G.tvy*=0.7;}
  G.sx=nsx;G.sy=nsy;
  var ax=G.area||{xmin:0,xmax:1,ymin:0,ymax:1};G.tx=Math.max(0,Math.min(1,(rx-ax.xmin)/Math.max(.1,ax.xmax-ax.xmin)));G.ty=Math.max(0,Math.min(1,(ry-ax.ymin)/Math.max(.1,ax.ymax-ax.ymin))); /* area kalibrasi dinormalisasi ke seluruh layar */
  G.tAt=now;
  return sp;
}
/* ---------- Logika gestur ---------- */
function onResults(res,video,ts){
  var lm=(res&&res.landmarks&&res.landmarks[0])||null;
  drawSkeleton(lm);
  var now=ts||performance.now();
  if(!lm){
    if(now-G.lastSeen>350){
      hideCursor();hoverBox(null);dwellReset();G.dwellFiredEl=null; /* tangan hilang: boleh klik ulang elemen yang sama */
      G.scrollLast=null;G.scrollVel=0;G.tvx=0;G.tvy=0;G.pMoving=false;G.hist=[];G.dHist=[];G.stable='NONE';G.palmSince=0;G.dPrev=0;G.lockUntil=0;
      setStatus('🙋 Tampilkan tangan…');
    }
    return;
  }
  G.lastSeen=now;
  /* Kalibrasi otomatis: rekam posisi telunjuk selama 4 detik sambil pengguna menyapu area kerja. */
  if(G.calibrating){
    var rxCal=1-lm[8].x,ryCal=lm[8].y;
    G.calSamples.push({x:rxCal,y:ryCal});
    var elapsed=now-G.calStarted;
    var calUi=$('gsCalStatus');
    if(calUi&&now-(G.calLastUi||0)>250){G.calLastUi=now;calUi.textContent='Kalibrasi berjalan… '+Math.max(0,Math.ceil((4000-elapsed)/1000))+' dtk tersisa. Gerakkan telunjuk ke sudut area kerja.';}
    if(elapsed>=4000){
      G.calibrating=false;
      var xs=G.calSamples.map(function(q){return q.x;}),ys=G.calSamples.map(function(q){return q.y;});
      var xmin=Math.min.apply(null,xs),xmax=Math.max.apply(null,xs),ymin=Math.min.apply(null,ys),ymax=Math.max.apply(null,ys);
      /* Sedikit margin mencegah area hasil kalibrasi terlalu ketat. */
      xmin=Math.max(0,xmin-0.025);xmax=Math.min(1,xmax+0.025);ymin=Math.max(0,ymin-0.025);ymax=Math.min(1,ymax+0.025);
      if(G.calSamples.length>=12&&xmax-xmin>=0.18&&ymax-ymin>=0.18){
        G.area={xmin:xmin,xmax:xmax,ymin:ymin,ymax:ymax};
        try{localStorage.setItem('gsGestureArea',JSON.stringify(G.area));}catch(e){}
        if(calUi)calUi.textContent='Kalibrasi selesai ✓ Area gerak disimpan. Uji kursor; ulangi bila area terlalu sempit.';
        toast('Kalibrasi otomatis selesai dan disimpan.','success');
      }else{
        if(calUi)calUi.textContent='Kalibrasi belum cukup luas. Ulangi sambil gerakkan telunjuk ke empat sudut area kerja.';
        toast('Kalibrasi belum cukup luas. Coba lagi dengan gerakan lebih lebar.','info');
      }
      G.calSamples=[];G.hist=[];G.stable='NONE';G.sx=0.5;G.sy=0.5;G.tvx=0;G.tvy=0;hideCursor();
    }
    return;
  }
  var cls=classify(lm);
  G.hist.push(cls.raw);if(G.hist.length>3)G.hist.shift();
  var counts={};
  for(var i=0;i<G.hist.length;i++){counts[G.hist[i]]=(counts[G.hist[i]]||0)+1;}
  var best=G.stable,bc=0;
  for(var k in counts){if(counts[k]>bc){best=k;bc=counts[k];}}
  if(bc>=2)G.stable=best; /* v13: 2 dari 3 frame = lebih responsif */
  var gesture=G.stable;
  /* --- JEPIT IBU JARI + TELUNJUK: klik kanan sekali setelah tahan 350 ms --- */
  if(gesture==='PINCH'){
    G.scrollLast=null;gsCoastStop();G.dPrev=0;G.tvx=0;G.tvy=0;G.pMoving=false;dwellReset();hoverBox(null);
    if(!G.pinchSince)G.pinchSince=now;
    if(now-G.pinchSince>=350&&!G.pinchFired&&now-G.clickAt>900){
      var px=Math.round(G.cx),py=Math.round(G.cy),pt=null;
      try{pt=document.elementFromPoint(px,py);}catch(e){}
      var ptarget=clickable(pt)||pt;
      if(ptarget){
        try{var po={bubbles:true,cancelable:true,view:window,clientX:px,clientY:py,button:2,buttons:2};ptarget.dispatchEvent(new MouseEvent('mousedown',po));ptarget.dispatchEvent(new MouseEvent('mouseup',po));ptarget.dispatchEvent(new MouseEvent('contextmenu',po));setStatus('🖱️ Klik kanan',true);}catch(e){setStatus('⚠️ Klik kanan gagal');}
      }else setStatus('🤏 Jepit ditahan…');
      G.pinchFired=true;G.clickAt=now;G.lockUntil=now+500;
    }else setStatus('🤏 Klik kanan…');
    return;
  }else{G.pinchSince=0;G.pinchFired=false;}
  /* --- 3-5 JARI (TELAPAK TERBUKA): SCROLL naik/turun — sensitif & responsif --- */
  if(gesture==='PALM'){
    G.dPrev=0;G.palmSince=0;G.tvx=0;G.tvy=0;G.pMoving=false; /* v13.4/13.5: prediksi & state gerak tidak dibawa saat scroll */
    hideCursor();hoverBox(null);dwellReset();
    var pcX=(lm[0].x+lm[5].x+lm[9].x+lm[17].x)/4,pcY=(lm[0].y+lm[5].y+lm[9].y+lm[17].y)/4; /* pusat telapak - paling stabil */
    G.pcx=pcX;G.pcy=pcY; /* posisi telapak di layar: untuk memilih container scroll */
    if(G.scrollLast!=null){
      var sdir=palmScrollUpdate(pcY);
      setStatus(sdir>0?'🖐️ Scroll ▼':(sdir<0?'🖐️ Scroll ▲':'🖐️ Scroll'));
    }else{
      gsCoastStop(); /* pegang ulang scroll = peluncuran sebelumnya berhenti */
      G.scrollEl=null;G.scrollVel=0;G.scrollY=pcY;G.scrollLast=pcY; /* fokus ulang bersih: tanpa momentum basi, tanpa lompatan */
      setStatus('🖐️ Scroll');
    }
    return;
  }
  G.scrollLast=null;gsCoastStop(); /* gestur lain = "menyentuh layar": peluncuran berhenti seketika */
  /* --- TEPAT 2 JARI: TAHAN 0,8 dtk (v13) -> menu utama, ada indikator persen --- */
  if(gesture==='TWO'){
    G.dPrev=0;G.tvx=0;G.tvy=0;G.pMoving=false;
    hoverBox(null);dwellReset();
    if(!G.palmSince)G.palmSince=now;
    if(now-G.menuAt>2500){
      var pr=Math.min(1,(now-G.palmSince)/TWO_HOLD);
      if(pr>=1){
        G.menuAt=now;G.palmSince=0;hideCursor();hoverBox(null);G.lastCursorAt=0;
        try{
          var mc=$('modalContainer');
          if(mc&&!mc.classList.contains('hidden')&&typeof closeModal==='function')closeModal();
        }catch(e){}
        if(typeof navigate==='function'){navigate('dashboard');setStatus('🏠 Menu utama',true);}
      }else{
        setStatus('✌️ Menu… '+Math.round(pr*100)+'%');
      }
    }
    return;
  }
  G.palmSince=0;
  /* --- TELUNJUK: kursor + KLIK OTOMATIS saat diam di atas tombol (Mode Mudah) --- */
  if(gesture==='POINT'){
    /* Deteksi melipat: jarak ujung telunjuk ke pusat telapak DINORMALISASI ukuran tangan */
    var pcx=(lm[0].x+lm[5].x+lm[9].x+lm[17].x)/4,pcy=(lm[0].y+lm[5].y+lm[9].y+lm[17].y)/4;
    var hs=dist(lm[0],lm[9])||0.001;
    var dNow=Math.sqrt((lm[8].x-pcx)*(lm[8].x-pcx)+(lm[8].y-pcy)*(lm[8].y-pcy))/hs;
    G.dHist.push(dNow);if(G.dHist.length>4)G.dHist.shift();
    var dMax=0;for(var di=0;di<G.dHist.length;di++){if(G.dHist[di]>dMax)dMax=G.dHist[di];}
    var curling=(G.dHist.length>=2&&dNow<dMax*0.8)||(G.dPrev>0&&dNow<G.dPrev*0.85); /* mulai mengepal */
    G.dPrev=dNow;
    if(curling||now<(G.lockUntil||0)){
      if(curling){ /* KUNCI + JEPRET: kursor menempel di titik yang sudah pas — titik itulah yang diklik */
        G.cx=Math.round(G.tx*window.innerWidth);G.cy=Math.round(G.ty*window.innerHeight);
        G.tvx=0;G.tvy=0;
        var elc=$('gsGestureCursor');
        if(elc){elc.style.display='block';elc.style.transform='translate3d('+G.cx+'px,'+G.cy+'px,0)';}
      }
      G.lastCursorAt=now;return; /* kursor beku: tidak ikut gerak saat tangan mengepal / setelah klik */
    }
    var tx=1-lm[8].x,ty=lm[8].y;
    var sp=pointMove(tx,ty,now); /* v13.4/13.5: target + kecepatan + histeresis gerak */
    if(!G.pMoving){ /* diam: klik otomatis berjalan penuh */
      G.lastCursorAt=now;
      G.targetActive=true;G.clickArmed=true;
      setStatus('☝️ Tahan diam…');
      dwellTick(now);
      return;
    }
    if(sp>0.02)dwellReset(); /* gerak jelas: hitungan klik otomatis diulang; geser pelan di tombol sama = hitungan lanjut */
    var el=$('gsGestureCursor');
    if(el&&el.style.display!=='block'){ /* muncul lagi: langsung snap, bukan meluncur dari posisi lama */
      G.cx=Math.round(G.tx*window.innerWidth);G.cy=Math.round(G.ty*window.innerHeight);
      G.tvx=0;G.tvy=0; /* tanpa prediksi basi saat kursor baru muncul */
      el.style.display='block';el.style.transform='translate3d('+G.cx+'px,'+G.cy+'px,0)';
    }
    G.targetActive=true;
    G.lastCursorAt=now;
    setStatus(sp<0.01?'☝️ Tahan diam…':'☝️ Tunjuk');
    G.clickArmed=true;
    dwellTick(now);
    return;
  }
  /* --- KEPALAN: KLIK TEPAT di titik yang terkunci --- */
  if(gesture==='CLOSED'){
    hoverBox(null);dwellReset();G.tvx=0;G.tvy=0;G.pMoving=false;
    if(now-G.lastCursorAt<800){
      if(G.clickArmed&&now-G.clickAt>900){
        G.cx=Math.round(G.tx*window.innerWidth);G.cy=Math.round(G.ty*window.innerHeight);
        var elz=$('gsGestureCursor');
        if(elz){elz.style.display='block';elz.style.transform='translate3d('+G.cx+'px,'+G.cy+'px,0)'}
        var safeTarget=null;try{safeTarget=document.elementFromPoint(G.cx,G.cy);}catch(e){}
        safeTarget=clickable(safeTarget);
        if(G.safeClick){
          if(!safeTarget){G.closedSince=0;G.closedTarget=null;setStatus('🛡️ Arahkan ke tombol');return;}
          if(G.closedTarget!==safeTarget){G.closedTarget=safeTarget;G.closedSince=now;setStatus('🛡️ Pastikan target…');return;}
          if(now-G.closedSince<220){setStatus('🛡️ Konfirmasi klik…');return;}
        }
        if(doClick('fist')){G.clickArmed=false;G.clickAt=now;G.closedSince=0;G.closedTarget=null;G.lockUntil=now+500;}
      }
    }else{
      G.closedSince=0;G.closedTarget=null;setStatus('☝️ dulu, lalu ✊');
    }
    return;
  }else{G.closedSince=0;G.closedTarget=null;}
}
/* ---------- Pompa frame: worker dulu (bebas macet); fallback sinkron TIDAK MENAHAN layar ---------- */
function pumpTier(avg){
  if(avg>85){if(P.tier<2){P.tier=2;P.interval=110;}}
  else if(avg>45){if(P.tier<1){P.tier=1;P.interval=80;}}
  else if(avg<38&&P.tier>0){P.tier=0;P.interval=50;}
}
function pump(){
  if(!G.on)return;
  G.raf=requestAnimationFrame(pump);
  if(G.paused)return;
  var v=$('gsGestureVideo');
  if(!v||v.readyState<2)return;
  var now=performance.now();
  if(now-P.lastPump<P.interval)return;
  if(v.currentTime===G.lastVideoTime)return;
  if(W.worker){
    if(!W.ready)return; /* menunggu mesin worker siap */
    if(W.inflight){ /* v13.6: watchdog frame menggantung — deteksi tidak boleh mati selamanya */
      if(now-(W.inflightAt||now)>1200){W.inflight=false;W.bad++;if(W.bad>=5)gsWorkerKill();}
      return;
    }
    G.lastVideoTime=v.currentTime;
    P.lastPump=now;
    W.inflight=true;W.inflightAt=now;
    createImageBitmap(v,{resizeWidth:320,resizeHeight:240,resizeQuality:'low'}).then(function(bmp){
      if(!W.worker){try{bmp.close();}catch(e){}W.inflight=false;return;}
      W.worker.postMessage({t:'frame',bmp:bmp,ts:now},[bmp]);
    }).catch(function(){W.inflight=false;});
    return;
  }
  G.lastVideoTime=v.currentTime;
  P.lastPump=now;
  if(!G.landmarker){gsEnsureSyncEngine();return;}
  /* v13.6: jalur sinkron tidak menjalankan AI di dalam rAF — deteksi dipindah ke
     tugas terpisah (macrotask) supaya render kursor tetap bisa menggambar dulu;
     dulu AI memblokir pantulan layar 10-40ms tiap deteksi = layar patah-patah */
  setTimeout(syncDetect,0);
}
function syncDetect(){
  if(!G.on||W.worker)return;
  var v=$('gsGestureVideo');if(!v||v.readyState<2)return;
  var t0=performance.now(),res=null;
  try{res=G.landmarker.detectForVideo(v,performance.now());P.detectErr=0;}
  catch(e){
    P.detectErr++;
    if(P.detectErr>=3&&!G.recycling)recycleEngineCpu();
    return;
  }
  var dt=performance.now()-t0;
  P.lastLatency=dt;P.avgLatency=P.msN?((P.avgLatency*0.85)+(dt*0.15)):dt;P.frames++;
  P.msSum+=dt;P.msN++;
  if(P.msN>=30){
    var avg=P.msSum/P.msN;
    updateCamLabel(avg);
    pumpTier(avg);
    P.msSum=0;P.msN=0;
  }
  if(res)onResults(res,v);
}
/* ---------- Panduan bergambar (onboarding) ---------- */
function gsShowGuide(show){
  var g=$('gsGestureGuide');if(!g)return;
  if(show)g.classList.add('gs-show');else g.classList.remove('gs-show');
}
function gsShowGuideOnce(){
  var seen=false;
  try{seen=localStorage.getItem('gsGestureOnboard')==='1';}catch(e){}
  if(!seen)gsShowGuide(true);
}
/* ---------- Start / Stop ---------- */
async function start(){
  if(G.on||G.starting)return;
  if(typeof currentUser==='undefined'||!currentUser){toast('Login dulu untuk memakai Remot Jari.','error');return;}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('Kamera butuh HTTPS atau localhost.','error');return;}
  var sess=(G.session||0)+1;G.session=sess;
  G.starting=true;G.paused=false;
  $('gsGesturePanel').classList.add('gs-show');
  $('gsGestureBtn').classList.add('gs-on');
  var _bb=$('gsGestureBtn');if(_bb)_bb.classList.remove('gs-mini'); /* saat aktif: tombol tampil penuh */
  var _p0=$('gsGesturePanel');if(_p0)_p0.classList.remove('gs-cam-hidden');G.camHidden=0; /* v13.7: mulai segar — kamera tampil */
  camDot('');
  var camEl=$('gsGestureCam');if(camEl)camEl.title='kamera: menyambung…';
  try{
    setStatus('📷 Izin kamera…');
    G.stream=await withTimeout(
      navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:320},height:{ideal:240},frameRate:{ideal:30,max:30}},audio:false}),
      20000,'kamera tidak merespons. Tutup aplikasi lain yang memakai kamera lalu coba lagi.');
    if(sess!==G.session)return;
    var v=$('gsGestureVideo');v.srcObject=G.stream;
    try{await v.play();}catch(pe){}
    if(sess!==G.session)return;
    var wrap=document.querySelector('.gs-gvideo-wrap');
    var setAr=function(){var vw=v.videoWidth||320,vh=v.videoHeight||240;if(wrap)wrap.style.aspectRatio=vw+' / '+vh;};
    if(v.videoWidth){setAr();}else{v.addEventListener('loadedmetadata',setAr,{once:true});}
    if(camEl)camEl.title='kamera: aktif';
    camDot('on');
    setStatus('⏳️ Menyiapkan AI…');
    gsWorkerStart(); /* v13.5: AI di worker = thread utama bebas, kursor mulus */
    var wok=await gsWorkerWaitReady(20000);
    if(sess!==G.session)return;
    if(wok){G.gpuMode=W.gpu;}
    else{
      gsWorkerKill();
      await withTimeout(loadEngine(),60000,'unduhan mesin AI lambat/terputus. Periksa internet lalu coba lagi.');
      if(sess!==G.session)return;
    }
    G.on=true;G.starting=false;G.paused=false;syncPauseButton();camDot('on');
    G.lastVideoTime=-1;G.hist=[];G.stable='NONE';G.palmSince=0;G.scrollLast=null;G.scrollVel=0;G.scrollEl=null;G.pcx=0.5;G.pcy=0.5;gsCoastStop();G.drawnHand=false;G.dPrev=0;
    G.clickArmed=true;G.clickAt=0;G.lastCursorAt=0;G.dHist=[];G.lockUntil=0;
    G.dwellEl=null;G.dwellStart=0;G.dwellCool=0;G.dwellFiredEl=null;
    P.lastPump=0;P.interval=50;P.tier=0;P.msSum=0;P.msN=0;P.detectErr=0;
    G.tvx=0;G.tvy=0;G.tAt=0;G.rLast=0;G.pMoving=false;
    setStatus('✅ Aktif! Tunjuk & tahan diam',true);
    toast('Remot Jari aktif — Mode Mudah '+(G.dwell?'AKTIF':'nonaktif')+' · mesin '+G.gpuMode+'.','success');
    pump();renderLoop();
    try{gsShowGuideOnce();}catch(eG){}
  }catch(e){
    if(sess!==G.session)return;
    G.starting=false;
    var m=(e&&e.name==='NotAllowedError')?'izin kamera ditolak. Buka izin kamera di browser lalu coba lagi.':
      (e&&e.name==='NotFoundError')?'kamera tidak ditemukan.':
      (e&&e.name==='NotReadableError')?'kamera dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.':
      (e&&e.message)?e.message:'gagal menyiapkan kamera/mesin. Coba lagi.';
    stop();
    camDot('err');
    setStatus('⚠️ Gagal');
    toast('Remot Jari: '+m,'error');
  }
}
function stop(){
  G.session=(G.session||0)+1;
  G.on=false;G.starting=false;G.paused=false;syncPauseButton();
  if(G.raf){cancelAnimationFrame(G.raf);G.raf=0;}
  if(G.rrender){cancelAnimationFrame(G.rrender);G.rrender=0;}
  gsCoastStop();G.scrollEl=null;
  gsWorkerKill(); /* v13.5: matikan worker; pindah mode reset jam & hitungan gestur */
  G.targetActive=false;
  if(G.stream){try{G.stream.getTracks().forEach(function(t){t.stop();});}catch(e){}G.stream=null;}
  var v=$('gsGestureVideo');if(v)v.srcObject=null;
  var p=$('gsGesturePanel');if(p){p.classList.remove('gs-show');p.classList.remove('gs-cam-hidden');}
  G.camHidden=0; /* v13.7: matikan = kamera tampil lagi */
  var b=$('gsGestureBtn');if(b)b.classList.remove('gs-on');
  camDot('');
  var c=$('gsGestureCam');if(c)c.title='kamera: mati';
  var canvas=$('gsGestureCanvas');
  if(canvas){try{canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);}catch(e){}}
  G.drawnHand=false;P.detectErr=0;
  hideCursor();hoverBox(null);dwellReset();
  gsBtnMiniArm(); /* setelah mati: tombol mengembalikan diri tersembunyi */
}
window.gsGestureToggle=function(){
  if(btnWasMini){return;} /* tap pertama pada tombol tersembunyi hanya memunculkan, belum menyalakan */
  if(G.starting){stop();toast('Dibatalkan.','info');return;}
  if(G.on){stop();toast('Remot Jari dimatikan.','info');}
  else{start();}
};
/* ---------- v13: tombol auto-sembunyi — berdenyut halus agar mudah ditemukan ---------- */
var miniTimer=0,btnWasMini=false;
function gsBtnMiniArm(){
  if(miniTimer){clearTimeout(miniTimer);miniTimer=0;}
  miniTimer=setTimeout(function(){
    miniTimer=0;
    var b=$('gsGestureBtn');
    if(b&&!G.on&&!G.starting)b.classList.add('gs-mini');
  },5000);
}
function gsBtnWake(){
  var b=$('gsGestureBtn');if(!b)return;
  if(b.classList.contains('gs-mini')){
    b.classList.remove('gs-mini');
    btnWasMini=true;
    setTimeout(function(){btnWasMini=false;},350);
  }
  gsBtnMiniArm();
}
/* ---------- v13: kontrol panel — Mode Mudah, sensitivitas, panduan ---------- */
function syncDwellChip(){
  var c=$('gsDwellToggle');if(!c)return;
  c.innerText='Klik Otomatis: '+(G.dwell?'AKTIF':'MATI');
  if(G.dwell)c.classList.add('gs-active');else c.classList.remove('gs-active');
}
function syncAmpChips(){
  var chips=document.querySelectorAll('[data-amp]');
  for(var i=0;i<chips.length;i++){
    var v=parseFloat(chips[i].getAttribute('data-amp'));
    if(Math.abs(v-G.amp)<0.01)chips[i].classList.add('gs-active');
    else chips[i].classList.remove('gs-active');
  }
}
/* Stabilitas PRO: kalibrasi terpandu dan konfirmasi target untuk klik kepalan. */
var autoCalBtn=$('gsAutoCalibrate');
if(autoCalBtn)autoCalBtn.addEventListener('click',function(){
  if(!G.on||G.paused){toast('Aktifkan Remot Jari dan lanjutkan kamera sebelum kalibrasi.','info');return;}
  G.calibrating=true;G.calStarted=performance.now();G.calLastUi=0;G.calSamples=[];G.hist=[];G.stable='NONE';G.pinchSince=0;G.pinchFired=false;hideCursor();hoverBox(null);dwellReset();
  var el=$('gsCalStatus');if(el)el.textContent='Mulai! Selama 4 detik, gerakkan telunjuk ke empat sudut area kerja dengan gerakan lebar.';
  setStatus('🎯 Kalibrasi…');
});
var safeClickBtn=$('gsSafeClickToggle');
if(safeClickBtn){safeClickBtn.textContent=G.safeClick?'🛡️ Klik aman: ON':'🛡️ Klik aman: OFF';safeClickBtn.setAttribute('aria-pressed',G.safeClick?'true':'false');safeClickBtn.addEventListener('click',function(){G.safeClick=!G.safeClick;safeClickBtn.textContent=G.safeClick?'🛡️ Klik aman: ON':'🛡️ Klik aman: OFF';safeClickBtn.setAttribute('aria-pressed',G.safeClick?'true':'false');try{localStorage.setItem('gsGestureSafeClick',G.safeClick?'1':'0');}catch(e){}toast(G.safeClick?'Klik aman aktif: target harus stabil 220 ms.':'Klik aman dimatikan: klik kepalan lebih cepat.','info');});}
try{G.safeClick=localStorage.getItem('gsGestureSafeClick')!=='0';if(safeClickBtn){safeClickBtn.textContent=G.safeClick?'🛡️ Klik aman: ON':'🛡️ Klik aman: OFF';safeClickBtn.setAttribute('aria-pressed',G.safeClick?'true':'false');}}catch(e){}
var dt=$('gsDwellToggle');
if(dt)dt.addEventListener('click',function(){
  G.dwell=!G.dwell;
  try{localStorage.setItem('gsGestureDwell',G.dwell?'1':'0');}catch(e){}
  syncDwellChip();dwellReset();
  toast(G.dwell?'Mode Mudah AKTIF — tahan diam di tombol untuk klik otomatis.':'Mode Mudah dimatikan — klik dengan mengepal tangan.','info');
});
/* v13.1: chip sensitivitas kini ada di dalam panduan — delegasi di document */
document.addEventListener('click',function(ev){
  try{
    var t=ev.target;
    if(t&&t.getAttribute&&t.getAttribute('data-amp')){
      var v=parseFloat(t.getAttribute('data-amp'));
      if(v>=1.2&&v<=2.2){
        G.amp=v;
        try{localStorage.setItem('gsGestureAmp',String(v));}catch(e){}
        syncAmpChips();gsSyncTuneControls();
        toast('Sensitivitas kursor: '+t.innerText+' — gerakkan telunjuk untuk mencoba.','info');
      }
    }
  }catch(e){}
});
var gc=$('gsGuideClose');
if(gc)gc.addEventListener('click',function(){
  gsShowGuide(false);
  try{localStorage.setItem('gsGestureOnboard','1');}catch(e){}
});
var gh=$('gsGestureHelp');
if(gh)gh.addEventListener('click',function(){gsShowGuide(true);});
var btn=$('gsGestureBtn');
if(btn){btn.addEventListener('click',window.gsGestureToggle);btn.addEventListener('pointerdown',gsBtnWake);}
gsBtnMiniArm(); /* halaman baru dibuka: tombol mengecil sendiri setelah 5 detik */
var stp=$('gsGestureStop');
if(stp)stp.addEventListener('click',function(){stop();toast('DARURAT: kontrol gerakan dan kamera dimatikan.','info');});
/* ---------- v13.7: sembunyikan kamera — deteksi AI tetap jalan ---------- */
function gsSetCamHidden(hide){
  var p=$('gsGesturePanel');if(!p)return;
  if(hide&&!G.on&&!G.starting)return; /* hanya bermakna saat remot aktif */
  G.camHidden=hide?1:0;
  if(hide){
    p.classList.add('gs-cam-hidden');
    p.title='Kamera disembunyikan — Remot Jari tetap aktif. Ketuk untuk menampilkan lagi.';
  }else{
    p.classList.remove('gs-cam-hidden');
    p.title='';
  }
}
var hideBtn=$('gsGestureHide');
if(hideBtn)hideBtn.addEventListener('click',function(e){
  e.stopPropagation();
  gsSetCamHidden(true);
  toast('Kamera disembunyikan — Remot Jari tetap aktif. Ketuk gelembung 🖐️ untuk menampilkan lagi.','info');
});
function syncPauseButton(){
  var b=$('gsGesturePause');if(!b)return;
  b.textContent=G.paused?'▶️':'⏸️';b.title=G.paused?'Lanjutkan kamera':'Jeda kamera';
  b.setAttribute('aria-label',G.paused?'Lanjutkan kamera':'Jeda kamera');
  var lab=$('gsCamLabel');if(lab)lab.textContent=G.paused?'Kamera dijeda':G.on?'Kamera aktif':G.starting?'Menyambungkan…':'Kamera mati';
  var p=$('gsGesturePanel');if(p)p.classList.toggle('gs-paused',!!G.paused);
}
function gsToggleCameraPause(){
  if(!G.on||!G.stream){toast('Nyalakan Remot Jari terlebih dahulu.','info');return;}
  G.paused=!G.paused;
  try{G.stream.getVideoTracks().forEach(function(t){t.enabled=!G.paused;});}catch(e){}
  var v=$('gsGestureVideo');
  if(G.paused){try{if(v)v.pause();}catch(e){}hideCursor();hoverBox(null);dwellReset();setStatus('⏸️ Kamera dijeda');}
  else{try{if(v)v.play();}catch(e){}G.lastVideoTime=-1;setStatus('▶️ Kamera aktif');}
  syncPauseButton();camDot(G.paused?'': 'on');
  if(G.paused){var lab=$('gsCamLabel');if(lab)lab.textContent='Kamera dijeda';}
}
var pauseBtn=$('gsGesturePause');if(pauseBtn)pauseBtn.addEventListener('click',function(e){e.stopPropagation();gsToggleCameraPause();});
function gsSyncTuneControls(){
  var ar=$('gsAmpRange'),ao=$('gsAmpOut'),sr=$('gsSmoothRange'),so=$('gsSmoothOut');
  if(ar)ar.value=G.amp;if(ao)ao.textContent=Number(G.amp).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})+'×';
  if(sr)sr.value=G.smoothMs;if(so)so.textContent=G.smoothMs+' ms';
}
var ampRange=$('gsAmpRange');
if(ampRange)ampRange.addEventListener('input',function(){
  var v=Math.max(1.2,Math.min(2.2,+ampRange.value||1.6));G.amp=v;
  var o=$('gsAmpOut');if(o)o.textContent=v.toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})+'×';
  syncAmpChips();
});
if(ampRange)ampRange.addEventListener('change',function(){try{localStorage.setItem('gsGestureAmp',String(G.amp));}catch(e){}toast('Sensitivitas disimpan: '+G.amp.toFixed(2)+'×.','info');});
var smoothRange=$('gsSmoothRange');
if(smoothRange)smoothRange.addEventListener('input',function(){
  G.smoothMs=Math.max(8,Math.min(45,+smoothRange.value||22));var o=$('gsSmoothOut');if(o)o.textContent=G.smoothMs+' ms';
});
if(smoothRange)smoothRange.addEventListener('change',function(){try{localStorage.setItem('gsGestureSmoothMs',String(G.smoothMs));}catch(e){}G.tvx=0;G.tvy=0;toast('Kehalusan kursor disimpan: '+G.smoothMs+' ms.','info');});
var tuneReset=$('gsTuneReset');
if(tuneReset)tuneReset.addEventListener('click',function(){
  G.amp=1.6;G.smoothMs=22;G.area={xmin:0,xmax:1,ymin:0,ymax:1};DWELL_MS=1100;G.safeClick=true;
  var scb=$('gsSafeClickToggle');if(scb){scb.textContent='🛡️ Klik aman: ON';scb.setAttribute('aria-pressed','true');}
  try{localStorage.setItem('gsGestureAmp','1.6');localStorage.setItem('gsGestureSmoothMs','22');localStorage.setItem('gsGestureArea',JSON.stringify(G.area));localStorage.setItem('gsGestureDwellMs','1100');localStorage.setItem('gsGestureSafeClick','1');}catch(e){}
  gsSyncTuneControls();gsSyncAreaControls();syncAmpChips();G.tvx=0;G.tvy=0;toast('Pengaturan Remot Jari dikembalikan ke awal.','success');
});
var diagRefresh=$('gsDiagRefresh');if(diagRefresh)diagRefresh.addEventListener('click',function(){gsUpdateDiagnostics(true);toast('Status diagnostik diperbarui.','info');});
function gsSyncAreaControls(){
  var a=G.area||{xmin:0,xmax:1,ymin:0,ymax:1};
  [['gsAreaXMin',a.xmin*100],['gsAreaXMax',a.xmax*100],['gsAreaYMin',a.ymin*100],['gsAreaYMax',a.ymax*100]].forEach(function(pair){var el=$(pair[0]),out=$(pair[0]+'Out');if(el)el.value=Math.round(pair[1]);if(out)out.textContent=Math.round(pair[1])+'%';});
  var dr=$('gsDwellRange'),do_= $('gsDwellOut');if(dr)dr.value=DWELL_MS;if(do_)do_.textContent=(DWELL_MS/1000).toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1})+' dtk';
}
function gsReadAreaControls(){
  var xmin=+(($('gsAreaXMin')||{}).value||0)/100,xmax=+(($('gsAreaXMax')||{}).value||100)/100,ymin=+(($('gsAreaYMin')||{}).value||0)/100,ymax=+(($('gsAreaYMax')||{}).value||100)/100;
  if(xmax-xmin<.1||ymax-ymin<.1){toast('Area harus memiliki lebar dan tinggi minimal 10%.','error');gsSyncAreaControls();return false;}
  G.area={xmin:xmin,xmax:xmax,ymin:ymin,ymax:ymax};try{localStorage.setItem('gsGestureArea',JSON.stringify(G.area));}catch(e){};
  G.sx=.5;G.sy=.5;G.tx=.5;G.ty=.5;G.tvx=0;G.tvy=0;gsSyncAreaControls();toast('Area layar berhasil diterapkan.','success');return true;
}
['gsAreaXMin','gsAreaXMax','gsAreaYMin','gsAreaYMax'].forEach(function(id){var el=$(id);if(el)el.addEventListener('input',function(){var out=$(id+'Out');if(out)out.textContent=el.value+'%';});});
var areaApply=$('gsAreaApply');if(areaApply)areaApply.addEventListener('click',gsReadAreaControls);
var areaReset=$('gsAreaReset');if(areaReset)areaReset.addEventListener('click',function(){G.area={xmin:0,xmax:1,ymin:0,ymax:1};try{localStorage.setItem('gsGestureArea',JSON.stringify(G.area));}catch(e){}gsSyncAreaControls();G.sx=.5;G.sy=.5;G.tx=.5;G.ty=.5;toast('Area layar penuh dipulihkan.','success');});
var dwellRange=$('gsDwellRange');if(dwellRange){dwellRange.addEventListener('input',function(){DWELL_MS=+dwellRange.value;var out=$('gsDwellOut');if(out)out.textContent=(DWELL_MS/1000).toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1})+' dtk';});dwellRange.addEventListener('change',function(){try{localStorage.setItem('gsGestureDwellMs',String(DWELL_MS));}catch(e){}dwellReset();toast('Waktu klik otomatis: '+(DWELL_MS/1000).toLocaleString('id-ID')+' detik.','info');});}
gsSyncAreaControls();gsSyncTuneControls();syncPauseButton();gsUpdateDiagnostics(true);
var pnl=$('gsGesturePanel');
if(pnl)pnl.addEventListener('click',function(e){
  if(!G.camHidden)return;
  e.stopPropagation();
  gsSetCamHidden(false);
},true); /* capture: gelembung selalu memulihkan tampilan */
syncDwellChip();syncAmpChips();
window.__gsGestureV=15.0;
/* v15.0: kalibrasi otomatis, klik kepalan anti-salah klik, dan jepit untuk klik kanan. */
/* hook QA/debug: menguji mesin scroll, nuansa gerak, DAN kursor tanpa kamera */
window.__gsGestureQA={
  scrollBy:gsScrollBy,findScroller:gsFindScroller,scrollable:gsScrollable,
  reset:function(){G.scrollEl=null;},
  /* release: simulasi telapak lepas / ganti gestur (sama seperti jalur non-PALM) */
  release:function(){G.scrollLast=null;G.scrollVel=0;gsCoastStop();},
  setHand:function(x,y){G.pcx=x;G.pcy=y;},
  setOn:function(v){G.on=v?true:false;},
  state:function(){return{vel:Math.round(G.scrollVel),coast:Math.round(G.coast),el:(G.scrollEl&&(G.scrollEl.id||G.scrollEl.tagName))||'null'};},
  /* palmFrame: simulasi 1 frame telapak; frame pertama = fokus (tanpa gulir) */
  palmFrame:function(pcY){
    if(G.scrollLast==null){G.scrollVel=0;G.scrollY=pcY;G.scrollLast=pcY;return 0;}
    return palmScrollUpdate(pcY);
  },
  /* v13.4: uji kursor tanpa kamera — pointAt = 1 tick deteksi POINT, step = 1 frame render */
  pointAt:function(nx,ny,now){return pointMove(nx,ny,now==null?performance.now():now);},
  step:function(dt,now){return cursorStep(dt||16,now==null?performance.now():now);},
  cursor:function(){return{x:Math.round(G.cx),y:Math.round(G.cy),tx:+G.tx.toFixed(4),ty:+G.ty.toFixed(4),vx:+G.tvx.toFixed(3),vy:+G.tvy.toFixed(3),active:!!G.targetActive};},
  snap:function(){G.cx=Math.round(G.tx*window.innerWidth);G.cy=Math.round(G.ty*window.innerHeight);G.targetActive=true;var el=$('gsGestureCursor');if(el){el.style.display='block';el.style.transform='translate3d('+G.cx+'px,'+G.cy+'px,0)';}},
  setAmp:function(v){if(v>=1.2&&v<=2.2)G.amp=v;},
  /* v13.5: status worker + paksa state gerak (uji histeresis) */
  workerState:function(){return{on:!!W.worker,ready:W.ready,gpu:W.gpu,fail:W.fail,bad:W.bad,inflight:W.inflight,tier:P.tier,interval:P.interval};},
  setMoving:function(v){G.pMoving=v?true:false;},
  /* v13.7: uji sembunyikan kamera tanpa kamera */
  camHide:function(v){gsSetCamHidden(v?true:false);return G.camHidden;},
  diagnostics:function(){return{on:!!G.on,paused:!!G.paused,handSeen:!!G.lastSeen&&performance.now()-G.lastSeen<500,fps:P.fps,latencyMs:Math.round(P.avgLatency||0),intervalMs:P.interval,engine:W.worker?(W.ready?'worker':'worker-loading'):(G.landmarker?'sync':'not-ready'),sensitivity:G.amp,smoothingMs:G.smoothMs,area:G.area};},
  camState:function(){var p=$('gsGesturePanel'),v=$('gsGestureVideo');return{hidden:!!G.camHidden,paused:!!G.paused,area:G.area,dwellMs:DWELL_MS,panelCls:p?p.className:'',engine:!!G.on,videoPos:v?getComputedStyle(v).position:'',videoX:v?Math.round(v.getBoundingClientRect().left):0,miniShown:(function(){var m=$('gsCamMini');return m?getComputedStyle(m).display!=='none':false;})()};}
};
})();

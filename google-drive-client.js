/* GURU SMART AI PRO — Google Drive pribadi per akun guru. Backup LANGSUNG & otomatis
   ke Google Drive (tanpa antrean di jalur normal). Jika koneksi bermasalah, perubahan
   disimpan sementara di antrean retry dan dikirim ulang otomatis. */
(function(){
 'use strict';
 if(window.__GS_DRIVE_MODULE__)return;window.__GS_DRIVE_MODULE__=true;
 if(window.__BUZZER_MODE__)return;
 var API=(window.GURU_SMART_D1_API_URL||'https://bayuprojectone.guru-smart-ai-pro.workers.dev').replace(/\/+$/,'');
 var state={connected:false,email:'',busy:false,last:'Belum ada backup'};
 function el(id){return document.getElementById(id)}
 function toast(msg,type){if(typeof window.showToast==='function')window.showToast(msg,type||'info');else console.log('[GURU SMART DRIVE]',msg)}
 async function session(){if(!window.sb||!sb.auth)return null;var r=await sb.auth.getSession();return r&&r.data&&r.data.session||null;}
 async function api(path,method,body){var s=await session();if(!s)throw new Error('Silakan login terlebih dahulu.');var r=await fetch(API+path,{method:method||'GET',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});var j=await r.json().catch(function(){return{};});if(!r.ok)throw new Error(j.error||('Worker error '+r.status));return j;}
 function render(){var root=el('gsDriveWidget');if(!root)return;root.innerHTML='<div class="rounded-xl border border-sky-200 dark:border-slate-600 bg-sky-50/70 dark:bg-slate-900/50 p-4"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div class="font-bold text-slate-800 dark:text-white">Penyimpanan Google Drive</div><div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Backup pribadi berdasarkan akun guru yang sedang login</div></div><span id="gsDriveBadge" class="text-xs font-semibold rounded-full px-3 py-1 bg-amber-100 text-amber-800 w-fit">Memeriksa…</span></div><p id="gsDriveStatus" class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-3">Memeriksa koneksi…</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><button id="gsDriveConnect" type="button" class="px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">Hubungkan akun Google</button><button id="gsDriveBackup" type="button" class="px-3 py-2.5 rounded-lg border border-blue-200 bg-white dark:bg-slate-800 dark:text-white text-blue-700 text-sm font-semibold">Backup sekarang</button><button id="gsDriveRestore" type="button" class="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">♻️ Pulihkan Data</button></div><p class="text-xs text-slate-500 dark:text-slate-400 mt-3">Backup tersimpan langsung ke Google Drive setiap kali ada perubahan data. Jika koneksi bermasalah, perubahan disimpan sementara dan dikirim ulang otomatis.</p></div>';el('gsDriveConnect').onclick=connect;el('gsDriveBackup').onclick=backupLocal;el('gsDriveRestore').onclick=restoreDrive;updateStatus();}
 window.GSDriveMount=render;
 async function updateStatus(){try{var r=await api('/api/drive/status');state.connected=!!r.connected;state.email=r.email||'';var s=el('gsDriveStatus');if(s)s.innerHTML=state.connected?' <b style="color:#059669">● Terhubung</b><br>'+escapeHtml(state.email||'Akun Google')+'<br>Backup tersimpan: '+(r.backup_count||0)+'<br>Backup terakhir: '+escapeHtml(r.last_backup||'Belum ada'):'<b style="color:#d97706">● Belum terhubung</b><br>Hubungkan Google Drive pribadi untuk mengaktifkan backup otomatis.';var b=el('gsDriveConnect');if(b)b.textContent=state.connected?'Hubungkan ulang akun Google':'Hubungkan akun Google';var badge=el('gsDriveBadge');if(badge){badge.textContent=state.connected?'● Terhubung':'● Belum terhubung';badge.className='text-xs font-semibold rounded-full px-3 py-1 w-fit '+(state.connected?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800');}}catch(e){var s=el('gsDriveStatus');if(s)s.textContent=e.message;}}
 function renderButtonLabel(){var b=el('gsDriveToggle');if(b)b.innerHTML='<span style="font-size:19px">☁️</span><span>Google Drive <small style="display:block;font-size:10px;font-weight:500;opacity:.85">'+(state.connected?'Terhubung':'Belum terhubung')+'</small></span>';}
 function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 /* ===== OVERLAY PROGRESS 0-100% untuk Backup & Pulihkan Google Drive ===== */
 var prog={el:null};
 function gpDark(){return document.documentElement.classList.contains('dark');}
 function gpShow(title){
  gpHide(true);
  var d=gpDark();
  var bg=d?'#0f172a':'#ffffff', tx=d?'#f1f5f9':'#0f172a', sub=d?'#94a3b8':'#64748b', track=d?'#1e293b':'#e2e8f0', acc=d?'#60a5fa':'#2563eb';
  var wrap=document.createElement('div');
  wrap.id='gsDriveProgWrap';
  wrap.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);padding:20px';
  wrap.innerHTML='<div role="dialog" aria-modal="true" aria-label="'+escapeHtml(title)+'" style="width:100%;max-width:420px;background:'+bg+';color:'+tx+';border-radius:22px;padding:26px 26px 20px;box-shadow:0 24px 60px rgba(2,6,23,.35);font-family:inherit;text-align:center">'
   +'<div id="gsProgIcon" style="width:56px;height:56px;margin:0 auto 12px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:26px;box-shadow:0 8px 20px rgba(37,99,235,.35)">☁️</div>'
   +'<div id="gsProgTitle" style="font-size:16px;font-weight:800">'+escapeHtml(title)+'</div>'
   +'<div id="gsProgStage" style="font-size:13px;color:'+sub+';margin-top:6px;min-height:18px">Menyiapkan…</div>'
   +'<div id="gsProgPct" style="font-size:34px;font-weight:900;letter-spacing:-1px;margin:10px 0 12px;color:'+acc+'">0%</div>'
   +'<div style="height:12px;border-radius:999px;background:'+track+';overflow:hidden"><div id="gsProgBar" style="height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,#60a5fa,#2563eb);transition:width .35s ease"></div></div>'
   +'<div id="gsProgDetail" style="font-size:11px;color:'+sub+';margin-top:10px;min-height:14px;word-break:break-word"></div>'
   +'<div style="font-size:10px;color:'+sub+';margin-top:12px;opacity:.8">Jangan tutup halaman sampai proses selesai.</div></div>';
  document.body.appendChild(wrap);
  prog.el=wrap;
  window.__gsDriveProgressActive=true;
 }
 function gpSet(pct,stage,detail){
  if(!prog.el)return;
  var b=prog.el.querySelector('#gsProgBar'),p=prog.el.querySelector('#gsProgPct'),s=prog.el.querySelector('#gsProgStage'),dt=prog.el.querySelector('#gsProgDetail');
  if(pct!=null){
    pct=Math.max(0,Math.min(100,Math.round(pct)));
    if(b)b.style.width=pct+'%';
    if(p)p.textContent=pct+'%';
  }
  if(s&&stage!=null)s.textContent=stage;
  if(dt&&detail!=null)dt.textContent=detail||'';
 }
 function gpFinish(ok,msg){
  if(!prog.el){window.__gsDriveProgressActive=false;return;}
  if(ok){ gpSet(100,'Selesai!',''); } else { gpSet(null,'Gagal'+(msg?': '+msg:''),''); }
  var ic=prog.el.querySelector('#gsProgIcon');
  if(ic){ic.style.background=ok?'linear-gradient(135deg,#34d399,#059669)':'linear-gradient(135deg,#f87171,#dc2626)';ic.style.boxShadow=ok?'0 8px 20px rgba(5,150,105,.35)':'0 8px 20px rgba(220,38,38,.35)';ic.textContent=ok?'✓':'✕';}
  var wrap=prog.el;prog.el=null;
  setTimeout(function(){if(wrap&&wrap.parentNode)wrap.parentNode.removeChild(wrap);window.__gsDriveProgressActive=false;},ok?900:1400);
 }
 function gpHide(instant){
  var w=document.getElementById('gsDriveProgWrap');
  if(w&&w.parentNode)w.parentNode.removeChild(w);
  prog.el=null;
  window.__gsDriveProgressActive=false;
 }
 window.gsDriveProgress={show:gpShow,set:gpSet,done:function(){gpFinish(true);},fail:function(m){gpFinish(false,m);},hide:function(){gpHide(true);}};
 function connect(){var pop=window.open('about:blank','gsDriveOAuth','width=560,height=700');api('/api/drive/oauth/start').then(function(r){if(!r.url)throw new Error('URL Google OAuth tidak diterima.');if(pop)pop.location.href=r.url;else window.location.href=r.url;}).catch(function(e){if(pop)pop.close();toast(e.message,'error');});}
 window.addEventListener('message',function(e){if(e.data&&e.data.type==='GURU_SMART_DRIVE_CONNECTED'){updateStatus();toast('Google Drive berhasil dihubungkan.','success');flushQueue();}});window.addEventListener('online',function(){flushQueue();});document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')flushQueue();});
 var queueBusy=false,flushTimer=null;function queueKey(uid){return 'gs_drive_queue_'+uid;}
 function scheduleFlush(){if(flushTimer)return;flushTimer=setTimeout(function(){flushTimer=null;flushQueue();},4000);}
 /* flushQueue: kirim semua item di antrean retry. Tidak berhenti pada error pertama —
    item yang gagal dipertahankan untuk dicoba ulang, item berikutnya tetap diproses. */
 async function flushQueue(){if(queueBusy||!state.connected)return;queueBusy=true;try{var s=await session();if(!s)return;var key=queueKey(s.user.id),q=[];try{q=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}if(!q.length)return;var remaining=[];for(var i=0;i<q.length;i++){var item=q[i];try{await api('/api/drive/backup','POST',item);state.last=new Date().toLocaleString('id-ID');}catch(e){console.warn('[GURU DRIVE] Item antrean gagal kirim, dipertahankan untuk retry:',e.message);remaining.push(item);}}localStorage.setItem(key,JSON.stringify(remaining));if(remaining.length)scheduleFlush();}finally{queueBusy=false;}}
 /* sendEvent: KIRIM LANGSUNG ke Google Drive lewat /api/drive/backup. Tidak mendorong ke
    antrean kecuali jika kirim langsung gagal (koneksi/token bermasalah). Mengembalikan
    status {ok,direct} | {ok,queued} | {ok:false} supaya pemanggil bisa melaporkannya. */
 async function sendEvent(table,op,data,filters){if(!state.connected)return {ok:false};var payload={table:table,op:op,data:data,filters:filters||[],timestamp:new Date().toISOString()};var size=JSON.stringify(payload).length;if(size>3500000){console.warn('[GURU DRIVE] Perubahan terlalu besar untuk backup langsung:',table);return {ok:false};}var s;try{s=await session();}catch(e){return {ok:false};}if(!s)return {ok:false};
  try{await api('/api/drive/backup','POST',payload);state.last=new Date().toLocaleString('id-ID');return {ok:true,direct:true};}catch(e){console.warn('[GURU DRIVE] Kirim langsung gagal, masuk antrean retry:',e.message);}
  try{var key=queueKey(s.user.id),q=[];try{q=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}q.push(payload);if(q.length>300)q=q.slice(-300);localStorage.setItem(key,JSON.stringify(q));scheduleFlush();return {ok:true,queued:true};}catch(e){console.warn('[GURU DRIVE] Backup tertunda/gagal:',e.message);return {ok:false};}}
 function installQueryBackup(){if(!window.sb||!sb.from||sb.from.__gsDriveWrapped)return false;var original=sb.from.bind(sb);var wrapped=function(table){var q=original(table);var st={op:'select',values:null,filters:[]};var proxy=new Proxy(q,{get:function(target,prop){if(prop==='then')return function(resolve,reject){var write=['insert','upsert','update','delete'].includes(st.op);return target.then(function(result){if(write&&!window.__GS_DRIVE_SYNCING__){if(!result||!result.error){if(['insert','upsert'].includes(st.op))sendEvent(table,st.op,st.values,[]);else if(st.op==='update')sendEvent(table,'update',st.values,st.filters);else if(st.op==='delete')sendEvent(table,'delete',null,st.filters);}else if(canRestoreError(result.error)){sendEvent(table,st.op,st.values,st.filters);}}return result;}).catch(function(err){if(write&&!window.__GS_DRIVE_SYNCING__&&canRestoreError(err)){return sendEvent(table,st.op,st.values,st.filters).then(function(){throw err;});}throw err;}).then(resolve,reject);};var v=target[prop];if(typeof v!=='function')return v;return function(){var a=[].slice.call(arguments);if(['insert','upsert','update'].indexOf(String(prop))>=0){st.op=String(prop);st.values=a[0];}else if(prop==='delete')st.op='delete';else if(['eq','neq','gt','gte','lt','lte','is','in','contains','like','ilike'].includes(String(prop))&&a.length>1)st.filters.push({op:String(prop),column:a[0],value:a[1]});else if(prop==='match'&&a[0])Object.keys(a[0]).forEach(function(k){st.filters.push({op:'eq',column:k,value:a[0][k]});});var ret=v.apply(target,a);return ret===target?proxy:ret;};}});return proxy;};wrapped.__gsDriveWrapped=true;sb.from=wrapped;return true;}
 /* fetchTableRows: ambil baris tabel dari SUPABASE (sumber kebenaran). Jika Supabase
    tidak bisa diakses, fallback ke cache in-memory GS_KILAT.mem lalu localStorage gs_kilat_*.
    Tidak lagi bergantung pada cache lokal sebagai sumber utama (cache sering kosong
    karena GS_KILAT.save hanya dipanggil di beberapa tempat & dilewati jika >1,2 MB). */
 async function fetchTableRows(t,uid){
  if(window.sb&&sb.from){
   try{var q=sb.from(t.name).select('*');if(t.uid)q=q.eq('user_id',uid);var r=await q;if(r&&!r.error&&Array.isArray(r.data))return r.data;}catch(e){}
  }
  try{if(window.GS_KILAT&&GS_KILAT.load){var d=GS_KILAT.load(uid,t.name);if(Array.isArray(d))return d;}}catch(e){}
  try{var raw=localStorage.getItem('gs_kilat_'+uid+'_'+t.name);if(raw){var e2=JSON.parse(raw);if(e2&&Array.isArray(e2.d))return e2.d;}}catch(e){}
  return null;
 }
 async function backupLocal(){if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}if(window.__gsDriveProgressActive)return;gpShow('Backup ke Google Drive');gpSet(3,'Menyiapkan sesi…','');try{var sess=await session();if(!sess)throw new Error('Sesi login tidak ditemukan.');var uid=sess.user.id;
  /* Daftar tabel yang di-backup LANGSUNG dari Supabase. uid:true = filter per user_id;
     uid:false = data bersama (seperti school_profile). Tabel tanpa user_id yang error
     saat difilter akan dilewati (tidak mengambil semua baris → tidak bocor data user lain). */
  var TABLES=[{name:'school_profile',uid:false},{name:'students',uid:true},{name:'teachers',uid:true},{name:'classes',uid:true},{name:'subjects',uid:true},{name:'schedules',uid:true},{name:'piket',uid:true},{name:'attendance',uid:true},{name:'activity_attendance',uid:true},{name:'activity_records',uid:true},{name:'grades',uid:true},{name:'assignments',uid:true},{name:'materi',uid:true},{name:'sibi',uid:true},{name:'keuangan',uid:true},{name:'rapor',uid:true},{name:'kuis_kelas',uid:true},{name:'perangkat',uid:true},{name:'digital_rapor_shares',uid:true}];
  var total=TABLES.length,direct=0,queued=0,failed=0,skipped=0,rowsTotal=0;
  for(var i=0;i<total;i++){var t=TABLES[i];gpSet(3+80*(i/total),'Mengambil data dari Supabase & mengunggah ke Google Drive…',t.name+' ('+(i+1)+'/'+total+')');var rows=await fetchTableRows(t,uid);if(!rows||!rows.length){skipped++;continue;}rowsTotal+=rows.length;var r=await sendEvent(t.name,'snapshot',rows,[]);if(r&&r.ok){if(r.direct)direct++;else if(r.queued)queued++;}else failed++;}
  gpSet(90,'Memastikan tidak ada perubahan tertinggal…','');await flushQueue();var pending=0;try{pending=JSON.parse(localStorage.getItem(queueKey(uid))||'[]').length;}catch(e){}gpSet(96,'Memperbarui status…','');updateStatus();gpFinish(true);
  toast('Backup langsung ke Google Drive: '+direct+' tabel terkirim ('+rowsTotal+' baris)'+(queued?', '+queued+' masuk antrean retry':'')+(failed?', '+failed+' gagal':'')+(skipped?', '+skipped+' tabel kosong/dilewati':'')+(pending?'. '+pending+' perubahan sedang di-retry otomatis.':'. Tidak ada antrean tertinggal.'),'success');
 }catch(e){gpFinish(false);toast('Backup gagal: '+e.message,'error');}}
 async function restoreDrive(){
  if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}
  if(window.__gsDriveProgressActive)return;
  var sess=await session();if(!sess)throw new Error('Sesi login tidak ditemukan.');
  gpShow('Pemulihan Data dari Google Drive');gpSet(8,'Membaca backup Google Drive…','');
  try{
   var result=await api('/api/drive/restore');
   var tables=result&&result.tables&&typeof result.tables==='object'?result.tables:null;
   if(!tables)throw new Error('Format hasil restore tidak valid.');
   var names=Object.keys(tables),total=0;
   names.forEach(function(n){if(Array.isArray(tables[n]))total+=tables[n].length;});
   if(total===0){gpFinish(false,'Backup berisi 0 baris');toast('Pemulihan dibatalkan: backup Google Drive tidak berisi data. Cache lokal tidak diubah.','warning');return;}
   var msg='Pulihkan '+total+' baris dari '+names.length+' tabel? Data cache lokal tabel tersebut akan diganti.';
   if(!confirm(msg)){gpHide(true);return;}
   var prefix='gs_kilat_'+sess.user.id+'_',done=0;
   window.__GS_DRIVE_SYNCING__=true;
   try{
    names.forEach(function(name){var rows=tables[name];if(!Array.isArray(rows))return;
      var key=prefix+name;var old=null;try{old=JSON.parse(localStorage.getItem(key)||'null');}catch(e){}
      var envelope=(old&&typeof old==='object'&&!Array.isArray(old))?old:{};
      envelope.d=rows;envelope.updated_at=new Date().toISOString();
      localStorage.setItem(key,JSON.stringify(envelope));done+=rows.length;
      gpSet(15+80*(done/Math.max(total,1)),'Menulis data ke cache lokal…',name+' ('+rows.length+' baris)');
    });
   }finally{window.__GS_DRIVE_SYNCING__=false;}
   gpFinish(true);toast('Pemulihan selesai: '+total+' baris dari '+names.length+' tabel dipulihkan. Muat ulang halaman untuk melihat data.','success');
  }catch(e){window.__GS_DRIVE_SYNCING__=false;gpFinish(false,e.message);toast('Pemulihan gagal: '+e.message,'error');}
 }
 function applyFilters(rows,filters){return (rows||[]).filter(function(row){return (filters||[]).every(function(f){var a=row&&row[f.column],b=f.value;switch(f.op){case'eq':return String(a??'')===String(b??'');case'neq':return String(a??'')!==String(b??'');case'in':return Array.isArray(b)&&b.some(function(x){return String(x)===String(a);});case'is':return b===null?a==null:a===b;case'gt':return a>b;case'gte':return a>=b;case'lt':return a<b;case'lte':return a<=b;case'like':case'ilike':return new RegExp('^'+String(b).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$',f.op==='ilike'?'i':'').test(String(a??''));default:return true;}});});}
 function installStorageBackup(){if(!window.sb||!sb.storage||!sb.storage.from||sb.storage.from.__gsDriveWrapped)return false;var original=sb.storage.from.bind(sb.storage);var wrapped=function(bucket){var api=original(bucket);if(!api||!api.upload)return api;var up=api.upload.bind(api);api.upload=function(path,file,options){var p=up(path,file,options);return Promise.resolve(p).then(function(result){if(!result||!result.error){if(state.connected&&file&&typeof file.size==='number'){var form=new FormData();form.append('bucket',bucket);form.append('path',path);form.append('file',file,String(path).split('/').pop()||'file');var sess=session();sess.then(function(s){if(s)fetch(API+'/api/drive/file-backup',{method:'POST',headers:{Authorization:'Bearer '+s.access_token},body:form}).then(function(r){if(!r.ok)console.warn('[GURU DRIVE] Backup file storage gagal:',r.status);}).catch(function(e){console.warn('[GURU DRIVE] Backup file storage:',e.message);});});}}return result;});};return api;};wrapped.__gsDriveWrapped=true;sb.storage.from=wrapped;return true;}
 async function boot(){var tries=0;while(tries++<30){if(window.sb&&sb.auth)break;await new Promise(function(r){setTimeout(r,500);});}if(!window.sb||!sb.auth)return;var sess=await session().catch(function(){return null;});if(!sess)return;if(el('gsDriveWidget'))render();setInterval(flushQueue,30000);setInterval(function(){try{if(el('gsDriveWidget')&&!el('gsDriveBadge')&&!window.__gsDriveProgressActive)render();}catch(e){}},2000);var timer=setInterval(function(){if(installQueryBackup())clearInterval(timer);},500);var t3=setInterval(function(){if(installStorageBackup())clearInterval(t3);},500);try{sb.auth.onAuthStateChange(function(event,sessionNow){if(event==='SIGNED_OUT'){state.connected=false;var st=el('gsDriveStatus');if(st)st.textContent='Silakan login untuk menghubungkan Google Drive.';}else if(sessionNow&&['SIGNED_IN','TOKEN_REFRESHED'].includes(event)){if(el('gsDriveWidget'))render();else updateStatus();}});}catch(e){}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

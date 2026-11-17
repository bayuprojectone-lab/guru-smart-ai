/* GURU SMART AI PRO — Supabase utama, replikasi D1 otomatis, Google Drive pribadi per akun. */
(function(){
 'use strict';
 if(window.__GS_DRIVE_MODULE__)return;window.__GS_DRIVE_MODULE__=true;
 if(window.__BUZZER_MODE__)return;
 var API=(window.GURU_SMART_D1_API_URL||'https://bayuprojectone.guru-smart-ai-pro.workers.dev').replace(/\/+$/,'');
 var state={connected:false,email:'',busy:false,last:'Belum ada backup',d1Ready:false};
 function el(id){return document.getElementById(id)}
 function toast(msg,type){if(typeof window.showToast==='function')window.showToast(msg,type||'info');else console.log('[GURU SMART DRIVE]',msg)}
 async function session(){if(!window.sb||!sb.auth)return null;var r=await sb.auth.getSession();return r&&r.data&&r.data.session||null;}
 async function api(path,method,body){var s=await session();if(!s)throw new Error('Silakan login terlebih dahulu.');var r=await fetch(API+path,{method:method||'GET',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});var j=await r.json().catch(function(){return{};});if(!r.ok)throw new Error(j.error||('Worker error '+r.status));return j;}
 function render(){var root=el('gsDriveWidget');if(!root)return;root.innerHTML='<div class="rounded-xl border border-sky-200 dark:border-slate-600 bg-sky-50/70 dark:bg-slate-900/50 p-4"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div class="font-bold text-slate-800 dark:text-white">Penyimpanan Google Drive</div><div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Supabase utama • D1 tersinkron otomatis • Google Drive pribadi per akun</div></div><span id="gsDriveBadge" class="text-xs font-semibold rounded-full px-3 py-1 bg-amber-100 text-amber-800 w-fit">Memeriksa…</span></div><p id="gsDriveStatus" class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-3">Memeriksa koneksi…</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><button id="gsDriveConnect" type="button" class="px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">Hubungkan akun Google</button><button id="gsDriveBackup" type="button" class="px-3 py-2.5 rounded-lg border border-blue-200 bg-white dark:bg-slate-800 dark:text-white text-blue-700 text-sm font-semibold">Backup sekarang</button><button id="gsDriveRestore" type="button" class="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">♻️ Pulihkan Data</button></div><p class="text-xs text-slate-500 dark:text-slate-400 mt-3">Perubahan data otomatis dikirim ke D1 dan, jika Drive sudah terhubung, dicadangkan ke Google Drive akun ini. Antrean dicoba ulang saat koneksi pulih.</p></div>';el('gsDriveConnect').onclick=connect;el('gsDriveBackup').onclick=backupLocal;el('gsDriveRestore').onclick=restoreDrive;updateStatus();}
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
 window.addEventListener('message',function(e){if(e.data&&e.data.type==='GURU_SMART_DRIVE_CONNECTED'){updateStatus();toast('Google Drive berhasil dihubungkan.','success');flushQueue();}});window.addEventListener('online',function(){flushD1Queue();flushQueue();});
 /* Replikasi D1 terpisah dari Google Drive. Semua operasi sukses di Supabase
    masuk antrean D1 per user; antrean bertahan saat offline dan tidak dibuang. */
 var d1QueueBusy=false,driveQueueBusy=false;
 function queueKey(uid){return 'gs_drive_queue_'+uid;}
 function d1QueueKey(uid){return 'gs_d1_queue_'+uid;}
 function readQueue(key){try{var q=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(q)?q:[];}catch(e){return[];}}
 function writeQueue(key,q){try{localStorage.setItem(key,JSON.stringify(q));return true;}catch(e){console.warn('[GURU SYNC] Gagal menyimpan antrean lokal:',e.message);return false;}}
 async function flushD1Queue(){if(d1QueueBusy||!navigator.onLine)return;d1QueueBusy=true;try{var s=await session();if(!s)return;var key=d1QueueKey(s.user.id),q=readQueue(key);while(q.length){var item=q[0];try{var body={table:item.table,op:item.op,values:item.data,filters:item.filters||[],onConflict:item.onConflict||'id',returning:false};var r=await fetch(API+'/api/db/query',{method:'POST',headers:{Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'},body:JSON.stringify(body)});var j=await r.json().catch(function(){return{};});if(!r.ok||j.error)throw new Error(j.error&&j.error.message||j.error||('D1 HTTP '+r.status));q.shift();writeQueue(key,q);state.d1Ready=true;}catch(e){console.warn('[GURU D1] Antrean dipertahankan untuk dicoba ulang:',e.message);break;}}}finally{d1QueueBusy=false;}}
 async function sendD1Event(table,op,data,filters){try{var s=await session();if(!s)return;var payload={table:table,op:op,data:data,filters:filters||[],onConflict:'id',timestamp:new Date().toISOString()};if(JSON.stringify(payload).length>1800000){console.warn('[GURU D1] Perubahan terlalu besar, tidak dimasukkan ke antrean:',table);return;}var key=d1QueueKey(s.user.id),q=readQueue(key);q.push(payload);if(!writeQueue(key,q))return;await flushD1Queue();}catch(e){console.warn('[GURU D1] Sinkronisasi tertunda:',e.message);}}
 async function flushQueue(){if(driveQueueBusy||!state.connected||!navigator.onLine)return;driveQueueBusy=true;try{var s=await session();if(!s)return;var key=queueKey(s.user.id),q=readQueue(key);while(q.length){try{await api('/api/drive/backup','POST',q[0]);q.shift();writeQueue(key,q);state.last=new Date().toLocaleString('id-ID');}catch(e){console.warn('[GURU DRIVE] Antrean backup dipertahankan:',e.message);break;}}}finally{driveQueueBusy=false;}}
 async function sendEvent(table,op,data,filters){
  /* D1 selalu dicoba meskipun pengguna belum menghubungkan Drive. */
  await sendD1Event(table,op,data,filters);
  if(!state.connected)return;
  try{var payload={table:table,op:op,data:data,filters:filters||[],timestamp:new Date().toISOString()};var size=JSON.stringify(payload).length;if(size>3500000){console.warn('[GURU DRIVE] Perubahan terlalu besar untuk backup langsung:',table);return;}var s=await session();if(!s)return;var key=queueKey(s.user.id),q=readQueue(key);q.push(payload);writeQueue(key,q);await flushQueue();}catch(e){console.warn('[GURU DRIVE] Backup tertunda/gagal:',e.message);}
 }
 function installQueryBackup(){if(!window.sb||!sb.from||sb.from.__gsDriveWrapped)return false;var original=sb.from.bind(sb);var wrapped=function(table){var q=original(table);var st={op:'select',values:null,filters:[]};var proxy=new Proxy(q,{get:function(target,prop){if(prop==='then')return function(resolve,reject){var write=['insert','upsert','update','delete'].includes(st.op);return target.then(function(result){if(write&&!window.__GS_DRIVE_SYNCING__){if(!result||!result.error){if(['insert','upsert'].includes(st.op))sendEvent(table,st.op,st.values,[]);else if(st.op==='update')sendEvent(table,'update',st.values,st.filters);else if(st.op==='delete')sendEvent(table,'delete',null,st.filters);}else if(canRestoreError(result.error)){sendEvent(table,st.op,st.values,st.filters);}}return result;}).catch(function(err){if(write&&!window.__GS_DRIVE_SYNCING__&&canRestoreError(err)){return sendEvent(table,st.op,st.values,st.filters).then(function(){throw err;});}throw err;}).then(resolve,reject);};var v=target[prop];if(typeof v!=='function')return v;return function(){var a=[].slice.call(arguments);if(['insert','upsert','update'].indexOf(String(prop))>=0){st.op=String(prop);st.values=a[0];}else if(prop==='delete')st.op='delete';else if(['eq','neq','gt','gte','lt','lte','is','in','contains','like','ilike'].includes(String(prop))&&a.length>1)st.filters.push({op:String(prop),column:a[0],value:a[1]});else if(prop==='match'&&a[0])Object.keys(a[0]).forEach(function(k){st.filters.push({op:'eq',column:k,value:a[0][k]});});var ret=v.apply(target,a);return ret===target?proxy:ret;};}});return proxy;};wrapped.__gsDriveWrapped=true;sb.from=wrapped;return true;}
 async function backupLocal(){if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}if(window.__gsDriveProgressActive)return;gpShow('Backup ke Google Drive');gpSet(3,'Menyiapkan sesi…','');try{var sess=await session();if(!sess)throw new Error('Sesi login tidak ditemukan.');var prefix='gs_kilat_'+sess.user.id+'_';var tables=[];for(var i=0;i<localStorage.length;i++){var key=localStorage.key(i);if(!key||key.indexOf(prefix)!==0)continue;var item=null;try{item=JSON.parse(localStorage.getItem(key));}catch(e){}if(item&&Array.isArray(item.d))tables.push({table:key.slice(prefix.length),rows:item.d});}var total=tables.length;for(var t=0;t<total;t++){gpSet(3+77*(t/Math.max(total,1)),'Mengumpulkan & mengunggah tabel ke Drive…',tables[t].table+' ('+(t+1)+'/'+total+')');await sendEvent(tables[t].table,'snapshot',tables[t].rows,[]);}gpSet(86,'Memastikan antrean terkirim…','');var pending=0;try{pending=JSON.parse(localStorage.getItem(queueKey(sess.user.id))||'[]').length;}catch(e){}gpSet(94,'Memperbarui status…','');updateStatus();gpFinish(true);toast('Backup cache perangkat: '+total+' tabel diproses. '+(pending?pending+' perubahan masih mengantre dan akan dicoba ulang otomatis.':'Antrean sudah terkirim ke Google Drive.'),'success');}catch(e){gpFinish(false);toast('Backup gagal: '+e.message,'error');}}
 async function restoreDrive(){
  if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}
  if(window.__gsDriveProgressActive)return;
  var sess=await session();if(!sess){toast('Sesi login tidak ditemukan.','error');return;}
  if(!window.sb||!sb.from||!sb.storage){toast('Koneksi database Supabase belum siap.','error');return;}
  gpShow('Pemulihan Data Google Drive');gpSet(3,'Memeriksa backup Google Drive…','');
  var summary={tables:0,rows:0,files:0,filesSkipped:0,errors:[]};
  try{
   var result=await api('/api/drive/restore');
   var tables=result&&result.tables&&typeof result.tables==='object'?result.tables:null;
   if(!tables)throw new Error('Format hasil restore tidak valid.');
   var names=Object.keys(tables).filter(function(n){return /^[A-Za-z0-9_-]{1,64}$/.test(n);});
   var storageResult=await api('/api/drive/storage-list').catch(function(e){summary.errors.push('Daftar file lampiran: '+e.message);return {files:[]};});
   var files=storageResult&&Array.isArray(storageResult.files)?storageResult.files:[];
   if(storageResult&&storageResult.truncated)summary.errors.push('Daftar lampiran di Google Drive melebihi batas baca; sebagian file mungkin belum terdaftar.');
   var total=0;names.forEach(function(n){if(Array.isArray(tables[n]))total+=tables[n].length;});
   if(total===0&&files.length===0){gpFinish(false,'Tidak ada data backup');toast('Tidak ditemukan data tabel atau file lampiran pada Google Drive. Data aplikasi tidak diubah.','warning');return;}
   var warning=result.truncated?'\n\nBackup tabel cukup besar dan perlu dibaca per tabel agar tidak ada data yang terlewat.':'';
   var msg='Ditemukan '+total+' baris dari '+names.length+' tabel dan '+files.length+' file lampiran.\n\nData tabel akan dimasukkan ke Supabase hanya jika ID belum ada (data yang sudah ada tidak ditimpa). File lampiran yang sudah ada akan dilewati.'+warning+'\n\nLanjutkan pemulihan?';
   if(!confirm(msg)){gpHide(true);return;}
   window.__GS_DRIVE_SYNCING__=true;
   try{
    var tableNames=names;
    /* Bila batas pemrosesan server tercapai, ambil setiap tabel secara terpisah. */
    if(result.truncated){
     tableNames=[];
     for(var ni=0;ni<names.length;ni++){
      gpSet(5+10*(ni/Math.max(names.length,1)),'Membaca backup per tabel…',names[ni]);
      var one=await api('/api/drive/restore?table='+encodeURIComponent(names[ni]));
      if(one&&one.truncated)throw new Error('Backup tabel '+names[ni]+' melebihi batas baca. Belum ada data tabel yang dipulihkan; ulangi setelah backup dibagi menjadi beberapa snapshot.');
      if(one&&one.tables&&Array.isArray(one.tables[names[ni]])){tables[names[ni]]=one.tables[names[ni]];tableNames.push(names[ni]);}
     }
    }
    for(var ti=0;ti<tableNames.length;ti++){
     var table=tableNames[ti],rows=Array.isArray(tables[table])?tables[table]:[];
     if(!rows.length)continue;
     if(!/^[A-Za-z0-9_-]{1,64}$/.test(table)){summary.errors.push('Nama tabel tidak valid: '+table);continue;}
     var hasIds=rows.every(function(row){return row&&row.id!==undefined&&row.id!==null&&String(row.id)!=='';});
     try{
      for(var offset=0;offset<rows.length;offset+=100){
       var batch=rows.slice(offset,offset+100);
       gpSet(15+55*((ti+offset/Math.max(rows.length,1))/Math.max(tableNames.length,1)),'Memulihkan data ke Supabase…',table+' ('+Math.min(offset+batch.length,rows.length)+'/'+rows.length+')');
       var write=hasIds?sb.from(table).upsert(batch,{onConflict:'id',ignoreDuplicates:true}):sb.from(table).insert(batch);
       var wr=await write;
       if(wr&&wr.error)throw new Error(wr.error.message);
       summary.rows+=batch.length;
      }
      summary.tables++;
     }catch(tableErr){summary.errors.push('Tabel '+table+': '+tableErr.message);}
    }
    for(var fi=0;fi<files.length;fi++){
     var f=files[fi];
     gpSet(72+25*(fi/Math.max(files.length,1)),'Memulihkan file lampiran…',(fi+1)+'/'+files.length+' '+(f.name||f.path||''));
     if(!f||!f.id||!f.bucket||!f.path||String(f.path).split('/').some(function(part){return part==='..'||part==='.';})){summary.errors.push('Metadata file lampiran tidak valid.');continue;}
     try{
      /* Jangan menimpa file aktif yang sudah ada di Storage. */
      var existing=await sb.storage.from(f.bucket).download(f.path);
      if(existing&&!existing.error){summary.filesSkipped++;continue;}
      var fr=await fetch(API+'/api/drive/storage-file?id='+encodeURIComponent(f.id),{headers:{Authorization:'Bearer '+sess.access_token}});
      if(!fr.ok)throw new Error('Gagal mengunduh dari Drive ('+fr.status+').');
      var blob=await fr.blob();
      var up=await sb.storage.from(f.bucket).upload(f.path,blob,{upsert:false,contentType:f.mimeType||blob.type||'application/octet-stream'});
      if(up&&up.error){if(/already exists|duplicate|already_exists/i.test(up.error.message||'')){summary.filesSkipped++;continue;}throw new Error(up.error.message);}
      summary.files++;
     }catch(fileErr){summary.errors.push((f.path||f.name||'File')+': '+fileErr.message);}
    }
   }finally{window.__GS_DRIVE_SYNCING__=false;}
   gpSet(99,'Menyelesaikan pemulihan…','');
   if(summary.errors.length){gpFinish(false,summary.errors.length+' kendala');toast('Pemulihan sebagian selesai. '+summary.rows+' baris dikirim ke Supabase; '+summary.files+' file dipulihkan; '+summary.filesSkipped+' file dilewati. Kendala: '+summary.errors.slice(0,3).join(' | '),'warning');}
   else{gpFinish(true);toast('Pemulihan selesai: '+summary.rows+' baris dari '+summary.tables+' tabel masuk ke Supabase; '+summary.files+' file lampiran dipulihkan; '+summary.filesSkipped+' file yang sudah ada dilewati. Muat ulang aplikasi.','success');}
  }catch(e){window.__GS_DRIVE_SYNCING__=false;gpFinish(false,e.message);toast('Pemulihan gagal: '+e.message,'error');}
 }

 function applyFilters(rows,filters){return (rows||[]).filter(function(row){return (filters||[]).every(function(f){var a=row&&row[f.column],b=f.value;switch(f.op){case'eq':return String(a??'')===String(b??'');case'neq':return String(a??'')!==String(b??'');case'in':return Array.isArray(b)&&b.some(function(x){return String(x)===String(a);});case'is':return b===null?a==null:a===b;case'gt':return a>b;case'gte':return a>=b;case'lt':return a<b;case'lte':return a<=b;case'like':case'ilike':return new RegExp('^'+String(b).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$',f.op==='ilike'?'i':'').test(String(a??''));default:return true;}});});}
 function installStorageBackup(){if(!window.sb||!sb.storage||!sb.storage.from||sb.storage.from.__gsDriveWrapped)return false;var original=sb.storage.from.bind(sb.storage);var wrapped=function(bucket){var api=original(bucket);if(!api||!api.upload)return api;var up=api.upload.bind(api);api.upload=function(path,file,options){var p=up(path,file,options);return Promise.resolve(p).then(function(result){if(!result||!result.error){if(state.connected&&file&&typeof file.size==='number'){var form=new FormData();form.append('bucket',bucket);form.append('path',path);form.append('file',file,String(path).split('/').pop()||'file');var sess=session();sess.then(function(s){if(s)fetch(API+'/api/drive/file-backup',{method:'POST',headers:{Authorization:'Bearer '+s.access_token},body:form}).then(function(r){if(!r.ok)console.warn('[GURU DRIVE] Backup file storage gagal:',r.status);}).catch(function(e){console.warn('[GURU DRIVE] Backup file storage:',e.message);});});}}return result;});};return api;};wrapped.__gsDriveWrapped=true;sb.storage.from=wrapped;return true;}
 async function boot(){var tries=0;while(tries++<30){if(window.sb&&sb.auth)break;await new Promise(function(r){setTimeout(r,500);});}if(!window.sb||!sb.auth)return;var sess=await session().catch(function(){return null;});if(!sess)return;flushD1Queue();if(el('gsDriveWidget'))render();setInterval(flushD1Queue,12000);setInterval(flushQueue,30000);setInterval(function(){try{if(el('gsDriveWidget')&&!el('gsDriveBadge')&&!window.__gsDriveProgressActive)render();}catch(e){}},2000);var timer=setInterval(function(){if(installQueryBackup())clearInterval(timer);},500);var t3=setInterval(function(){if(installStorageBackup())clearInterval(t3);},500);try{sb.auth.onAuthStateChange(function(event,sessionNow){if(event==='SIGNED_OUT'){state.connected=false;var st=el('gsDriveStatus');if(st)st.textContent='Silakan login untuk menghubungkan Google Drive.';}else if(sessionNow&&['SIGNED_IN','TOKEN_REFRESHED'].includes(event)){if(el('gsDriveWidget'))render();else updateStatus();flushD1Queue();flushQueue();}});}catch(e){}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

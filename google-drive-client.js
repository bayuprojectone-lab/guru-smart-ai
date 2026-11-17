/* GURU SMART AI PRO — Google Drive pribadi per akun guru. Backup otomatis + manual. Pemulihan dari Drive AKTIF & setara dengan restore JSON: validasi daftar tabel, snapshot pengaman, cek RLS, impor via gsImportTable (remap ID activity_records), lalu ringkasan gsShowImportSummary. File lampiran tetap dipulihkan sebagai fase tambahan khusus Drive. */
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
 function render(){var root=el('gsDriveWidget');if(!root)return;root.innerHTML='<div class="rounded-xl border border-sky-200 dark:border-slate-600 bg-sky-50/70 dark:bg-slate-900/50 p-4"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div class="font-bold text-slate-800 dark:text-white">Penyimpanan Google Drive</div><div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Backup pribadi berdasarkan akun guru yang sedang login</div></div><span id="gsDriveBadge" class="text-xs font-semibold rounded-full px-3 py-1 bg-amber-100 text-amber-800 w-fit">Memeriksa…</span></div><p id="gsDriveStatus" class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-3">Memeriksa koneksi…</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><button id="gsDriveConnect" type="button" class="px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">Hubungkan akun Google</button><button id="gsDriveBackup" type="button" class="px-3 py-2.5 rounded-lg border border-blue-200 bg-white dark:bg-slate-800 dark:text-white text-blue-700 text-sm font-semibold">Backup sekarang</button><button id="gsDriveRestore" type="button" class="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">♻️ Pulihkan Data</button></div><p class="text-xs text-slate-500 dark:text-slate-400 mt-3">Backup otomatis berjalan setelah perubahan data berhasil disimpan dan akan dicoba ulang jika koneksi sedang bermasalah.</p></div>';el('gsDriveConnect').onclick=connect;el('gsDriveBackup').onclick=backupLocal;el('gsDriveRestore').onclick=restoreDrive;updateStatus();}
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
 window.addEventListener('message',function(e){if(e.data&&e.data.type==='GURU_SMART_DRIVE_CONNECTED'){updateStatus();toast('Google Drive berhasil dihubungkan.','success');flushQueue();}});window.addEventListener('online',function(){flushQueue();});
 var queueBusy=false;function queueKey(uid){return 'gs_drive_queue_'+uid;}async function flushQueue(){if(queueBusy||!state.connected)return;queueBusy=true;try{var s=await session();if(!s)return;var key=queueKey(s.user.id),q=[];try{q=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}while(q.length){try{await api('/api/drive/backup','POST',q[0]);q.shift();localStorage.setItem(key,JSON.stringify(q));state.last=new Date().toLocaleString('id-ID');}catch(e){console.warn('[GURU DRIVE] Antrean backup dipertahankan:',e.message);break;}}}finally{queueBusy=false;}}async function sendEvent(table,op,data,filters){if(!state.connected)return;try{var payload={table:table,op:op,data:data,filters:filters||[],timestamp:new Date().toISOString()};var size=JSON.stringify(payload).length;if(size>3500000){console.warn('[GURU DRIVE] Perubahan terlalu besar untuk backup langsung:',table);return;}var s=await session();if(!s)return;var key=queueKey(s.user.id),q=[];try{q=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}q.push(payload);if(q.length>300)q=q.slice(-300);localStorage.setItem(key,JSON.stringify(q));await flushQueue();}catch(e){console.warn('[GURU DRIVE] Backup tertunda/gagal:',e.message);}}
 function installQueryBackup(){if(!window.sb||!sb.from||sb.from.__gsDriveWrapped)return false;var original=sb.from.bind(sb);var wrapped=function(table){var q=original(table);var st={op:'select',values:null,filters:[]};var proxy=new Proxy(q,{get:function(target,prop){if(prop==='then')return function(resolve,reject){var write=['insert','upsert','update','delete'].includes(st.op);return target.then(function(result){if(write&&!window.__GS_DRIVE_SYNCING__){if(!result||!result.error){if(['insert','upsert'].includes(st.op))sendEvent(table,st.op,st.values,[]);else if(st.op==='update')sendEvent(table,'update',st.values,st.filters);else if(st.op==='delete')sendEvent(table,'delete',null,st.filters);}else if(canRestoreError(result.error)){sendEvent(table,st.op,st.values,st.filters);}}return result;}).catch(function(err){if(write&&!window.__GS_DRIVE_SYNCING__&&canRestoreError(err)){return sendEvent(table,st.op,st.values,st.filters).then(function(){throw err;});}throw err;}).then(resolve,reject);};var v=target[prop];if(typeof v!=='function')return v;return function(){var a=[].slice.call(arguments);if(['insert','upsert','update'].indexOf(String(prop))>=0){st.op=String(prop);st.values=a[0];}else if(prop==='delete')st.op='delete';else if(['eq','neq','gt','gte','lt','lte','is','in','contains','like','ilike'].includes(String(prop))&&a.length>1)st.filters.push({op:String(prop),column:a[0],value:a[1]});else if(prop==='match'&&a[0])Object.keys(a[0]).forEach(function(k){st.filters.push({op:'eq',column:k,value:a[0][k]});});var ret=v.apply(target,a);return ret===target?proxy:ret;};}});return proxy;};wrapped.__gsDriveWrapped=true;sb.from=wrapped;return true;}
 async function backupLocal(){if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}if(window.__gsDriveProgressActive)return;gpShow('Backup ke Google Drive');gpSet(3,'Menyiapkan sesi…','');try{var sess=await session();if(!sess)throw new Error('Sesi login tidak ditemukan.');var prefix='gs_kilat_'+sess.user.id+'_';var tables=[];for(var i=0;i<localStorage.length;i++){var key=localStorage.key(i);if(!key||key.indexOf(prefix)!==0)continue;var item=null;try{item=JSON.parse(localStorage.getItem(key));}catch(e){}if(item&&Array.isArray(item.d))tables.push({table:key.slice(prefix.length),rows:item.d});}var total=tables.length;for(var t=0;t<total;t++){gpSet(3+77*(t/Math.max(total,1)),'Mengumpulkan & mengunggah tabel ke Drive…',tables[t].table+' ('+(t+1)+'/'+total+')');await sendEvent(tables[t].table,'snapshot',tables[t].rows,[]);}gpSet(86,'Memastikan antrean terkirim…','');var pending=0;try{pending=JSON.parse(localStorage.getItem(queueKey(sess.user.id))||'[]').length;}catch(e){}gpSet(94,'Memperbarui status…','');updateStatus();gpFinish(true);toast('Backup cache perangkat: '+total+' tabel diproses. '+(pending?pending+' perubahan masih mengantre dan akan dicoba ulang otomatis.':'Antrean sudah terkirim ke Google Drive.'),'success');}catch(e){gpFinish(false);toast('Backup gagal: '+e.message,'error');}}
 async function restoreDrive(){
  if(!state.connected){toast('Hubungkan Google Drive terlebih dahulu.','warning');return;}
  if(window.__gsDriveProgressActive)return;
  var sess=await session();if(!sess){toast('Sesi login tidak ditemukan.','error');return;}
  if(!window.sb||!sb.from||!sb.storage){toast('Koneksi database Supabase belum siap.','error');return;}
  /* Pemulihan tabel kini melalui jalur yang SAMA dengan restore JSON:
     validasi daftar tabel (gsBackupTables), snapshot pengaman ke IndexedDB,
     cek RLS (gsRlsProbe), impor per tabel via gsImportTable (termasuk remap
     ID activity_records & students), verifikasi jumlah, lalu ringkasan
     gsShowImportSummary. File lampiran tetap dipulihkan sebagai fase
     tambahan khusus Google Drive (tidak menimpa file aktif yang sudah ada). */
  if(!window.gsImportTable||!window.gsRestoreProgress||!window.gsBuildBackupObject||!window.gsBackupTables||!window.gsShowImportSummary||!window.gsEnsureAuthSession||!window.gsRlsProbe||!window.gsAudit||!window.gsIdbSet||!window.gsBackupKey||typeof window.gsFormatBackupStatus!=='function'){toast('Komponen pemulihan aplikasi belum siap. Muat ulang halaman lalu coba lagi.','error');return;}
  var restoreProgressStarted=false,summary={tables:0,rows:0,files:0,filesSkipped:0,errors:[]};
  try{
   gpShow('Pemulihan Data Google Drive');gpSet(3,'Memeriksa backup Google Drive…','');
   var result=await api('/api/drive/restore');
   var tables=result&&result.tables&&typeof result.tables==='object'?result.tables:null;
   if(!tables)throw new Error('Format hasil restore tidak valid.');
   var allowed=window.gsBackupTables.slice();
   var names=Object.keys(tables).filter(function(n){return Array.isArray(tables[n]);});
   var unknown=names.filter(function(n){return allowed.indexOf(n)<0;});
   if(unknown.length)throw new Error('Backup Google Drive memuat tabel yang tidak dikenal: '+unknown.join(', ')+'. Pemulihan dihentikan untuk mencegah penulisan tak terduga.');
   names=names.filter(function(n){return allowed.indexOf(n)>=0;});
   var storageResult=await api('/api/drive/storage-list').catch(function(e){summary.errors.push('Daftar file lampiran: '+e.message);return {files:[]};});
   var files=storageResult&&Array.isArray(storageResult.files)?storageResult.files:[];
   if(storageResult&&storageResult.truncated)summary.errors.push('Daftar lampiran di Google Drive melebihi batas baca; sebagian file mungkin belum terdaftar.');
   /* Bila batas pemrosesan server tercapai, ambil setiap tabel secara terpisah. */
   if(result.truncated){
    for(var ni=0;ni<names.length;ni++){
     gpSet(5+7*(ni/Math.max(names.length,1)),'Membaca backup per tabel…',names[ni]);
     var one=await api('/api/drive/restore?table='+encodeURIComponent(names[ni]));
     if(one&&one.truncated)throw new Error('Backup tabel '+names[ni]+' melebihi batas baca. Belum ada data tabel yang dipulihkan; ulangi setelah backup dibagi menjadi beberapa snapshot.');
     if(one&&one.tables&&Array.isArray(one.tables[names[ni]]))tables[names[ni]]=one.tables[names[ni]];
    }
   }
   /* Validasi struktur baris seperti restore JSON. */
   var totalRows=0;
   names.forEach(function(t){if(!Array.isArray(tables[t]))throw new Error('Struktur tabel tidak valid: '+t);tables[t].forEach(function(row,idx){if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Baris tidak valid pada '+t+' nomor '+(idx+1));});totalRows+=tables[t].length;});
   if(totalRows===0&&files.length===0){gpFinish(false,'Tidak ada data backup');toast('Tidak ditemukan data tabel atau file lampiran pada Google Drive. Data aplikasi tidak diubah.','warning');return;}
   gpHide(true);
   var tableSummary=names.map(function(t){return t+': '+tables[t].length;}).join('\n');
   var okRestore=confirm('KONFIRMASI RESTORE DARI GOOGLE DRIVE\n\nSumber: '+(state.email||'Akun Google')+'\nTotal baris: '+totalRows+' dari '+names.length+' tabel\nFile lampiran: '+files.length+'\n\n'+tableSummary+'\n\nRestore akan melakukan upsert dan DAPAT MENIMPA data dengan ID sama pada akun Anda, persis seperti restore JSON. Buat backup terkini sebelum lanjut. Lanjutkan?');
   if(!okRestore){try{gsAudit('RESTORE_CANCELLED','backup','google-drive','Pengguna membatalkan setelah pratinjau');}catch(eA){}toast('Restore dibatalkan; tidak ada data yang diimpor.','info');return;}
   restoreProgressStarted=true;
   window.gsRestoreProgress(0,'Menyiapkan pemulihan dari Google Drive...','Memulai restore dengan aman.');
   toast('Membuat snapshot data saat ini sebelum restore…','info');
   try{
    var preRestore=await window.gsBuildBackupObject();preRestore._meta.backup_reason='sebelum-restore-drive';await window.gsIdbSet(window.gsBackupKey(),preRestore);localStorage.setItem('gs_backup_last_'+currentUser.id,new Date().toISOString());gsAudit('PRE_RESTORE_SNAPSHOT_SUCCESS','backup','google-drive',preRestore._meta.total_rows+' baris');gsFormatBackupStatus();
   }catch(preErr){try{gsAudit('PRE_RESTORE_SNAPSHOT_FAILED','backup','google-drive',preErr.message||String(preErr));}catch(eA){}throw new Error('Restore dihentikan karena snapshot pengaman sebelum restore gagal: '+(preErr.message||preErr)+'. Tidak ada data yang diimpor.');}
   window.gsRestoreProgress(5,'Membuat snapshot pengaman...','Menyimpan salinan data saat ini sebelum restore.');
   try{gsAudit('RESTORE_STARTED','backup','google-drive',totalRows+' baris; sumber '+(state.email||'Google Drive'));}catch(eA){}
   window.gsRestoreProgress(10,'Memeriksa izin database...','Memastikan sesi dan izin tulis tersedia.');
   toast('Memeriksa izin tulis database...','info');
   var probe=await window.gsRlsProbe();
   if(probe&&probe.blocked){try{closeModal();}catch(eC){}window.gsShowRlsHelp('school_profile',probe.msg,true);return;}
   var chk=await window.gsEnsureAuthSession();
   if(!chk.ok){try{closeModal();}catch(eC){}toast('Restore dibatalkan: '+chk.msg,'error');window.gsShowRlsHelp('',chk.msg,true);return;}
   var authCheck=await sb.from('users').select('id,role').eq('id',currentUser.id).maybeSingle();
   if(authCheck.error||!authCheck.data||authCheck.data.id!==currentUser.id)throw new Error('Akun tidak berhasil diverifikasi pada tabel users. Restore dihentikan.');
   var ORDER=['school_profile','teachers','subjects','classes','students','schedules','piket','attendance','grades','assignments','materi','keuangan','announcements','kurikulum','kuis_kelas','activity_attendance','activity_records'];
   names.sort(function(a,b){var ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);if(ia<0)ia=99;if(ib<0)ib=99;return ia-ib;});
   window.gsRestoreProgress(12,'Mengimpor data...','0 dari '+totalRows+' baris diproses.');
   toast('Mengimpor '+totalRows+' baris... mohon tunggu, jangan tutup halaman.','info');
   window.gsIdMap={};
   var results=[],importedTotal=0,failTables=0;
   for(var i=0;i<names.length;i++){
    var t=names[i],rows=tables[t];
    /* Pastikan relasi absensi kegiatan menunjuk ke ID kegiatan dan siswa yang
       benar, termasuk ketika backup dipulihkan ke akun/database lain dengan ID
       yang berbeda — sama persis dengan restore JSON. */
    if(t==='activity_records'&&Array.isArray(rows)){
     try{
      var srcActs=Array.isArray(tables.activity_attendance)?tables.activity_attendance:[];var destActsRes=await sb.from('activity_attendance').select('id,title,date').eq('user_id',currentUser.id);if(!destActsRes.error&&Array.isArray(destActsRes.data)){var destActs=destActsRes.data;srcActs.forEach(function(sa){if(!sa||!sa.id)return;if(destActs.some(function(da){return String(da.id)===String(sa.id);}))return;var matchAct=destActs.find(function(da){return String(da.title||'').trim().toLowerCase()===String(sa.title||'').trim().toLowerCase()&&String(da.date||'')===String(sa.date||'');});if(matchAct)window.gsIdMap[String(sa.id)]=matchAct.id;});}
     }catch(linkActErr){console.warn('Pemetaan ID kegiatan saat restore:',linkActErr);}
     try{
      var srcStudents=Array.isArray(tables.students)?tables.students:[];var destStudentsRes=await sb.from('students').select('id,nis,name').eq('user_id',currentUser.id);if(!destStudentsRes.error&&Array.isArray(destStudentsRes.data)){var destStudents=destStudentsRes.data;srcStudents.forEach(function(ss){if(!ss||!ss.id)return;if(destStudents.some(function(ds){return String(ds.id)===String(ss.id);}))return;var matchStudent=null;if(ss.nis!=null&&String(ss.nis).trim())matchStudent=destStudents.find(function(ds){return String(ds.nis||'').trim()===String(ss.nis).trim();});if(!matchStudent&&ss.name)matchStudent=destStudents.find(function(ds){return String(ds.name||'').trim().toLowerCase()===String(ss.name).trim().toLowerCase();});if(matchStudent)window.gsIdMap[String(ss.id)]=matchStudent.id;});}
     }catch(linkStudentErr){console.warn('Pemetaan ID siswa saat restore:',linkStudentErr);}
     rows=rows.map(function(rec){
      var x=Object.assign({},rec);
      if(x.act_id==null)x.act_id=x.activity_id!=null?x.activity_id:(x.kegiatan_id!=null?x.kegiatan_id:x.kegiatanId);
      if(x.student_id==null)x.student_id=x.siswa_id!=null?x.siswa_id:x.studentId;
      if(x.date==null)x.date=x.tanggal!=null?x.tanggal:x.tgl;
      if(x.status==null)x.status=x.kehadiran!=null?x.kehadiran:x.status_absensi;
      if(x.status!=null){var st=String(x.status).trim().toLowerCase();x.status=({'h':'Hadir','hadir':'Hadir','present':'Hadir','s':'Sakit','sakit':'Sakit','i':'Izin','izin':'Izin','a':'Alpa','alpa':'Alpa','alpha':'Alpa'}[st]||x.status);}
      return x;
     });
    }
    var r=rows.length?await window.gsImportTable(t,rows):{ok:0,fail:0,err:'',total:0};
    if(r.ok>0)importedTotal+=r.ok;
    if(r.fail>0)failTables++;
    results.push({t:t,ok:r.ok,fail:r.fail,err:r.err,rls:!!r.rls,blind:r.blind||0,remapped:r.remapped||0});
    var doneRows=0;for(var di=0;di<results.length;di++)doneRows+=results[di].ok+results[di].fail;
    var importPct=12+Math.round(((i+1)/Math.max(names.length,1))*58);
    window.gsRestoreProgress(importPct,'Mengimpor tabel '+(i+1)+' dari '+names.length+'...',t+' • '+doneRows+' dari '+totalRows+' baris telah diproses.');
   }
   /* Fase tambahan khusus Google Drive: pulihkan file lampiran dari Storage.
      Tidak menimpa file aktif yang sudah ada di Supabase Storage. */
   if(files.length){
    window.gsRestoreProgress(72,'Memulihkan file lampiran...','0 dari '+files.length+' file');
    window.__GS_DRIVE_SYNCING__=true;
    try{
     for(var fi=0;fi<files.length;fi++){
      var f=files[fi];
      var fpct=72+Math.round(((fi+1)/Math.max(files.length,1))*18);
      window.gsRestoreProgress(fpct,'Memulihkan file lampiran...',(fi+1)+'/'+files.length+' '+(f.name||f.path||''));
      if(!f||!f.id||!f.bucket||!f.path||String(f.path).split('/').some(function(part){return part==='..'||part==='.';})){summary.errors.push('Metadata file lampiran tidak valid.');continue;}
      try{
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
   }
   var verify=[];
   for(var v=0;v<names.length;v++){try{var c=await sb.from(names[v]).select('id',{count:'exact',head:true}).eq('user_id',currentUser.id);verify.push({t:names[v],count:(c&&c.count!=null)?c.count:'-'});}catch(ev){verify.push({t:names[v],count:'-'});}}
   window.gsRestoreProgress(93,'Memeriksa hasil restore...','Memastikan tabel data selesai diproses.');
   var anyRls=false,anyBlind=0,anyRemap=0;
   for(var rr=0;rr<results.length;rr++){if(results[rr].rls&&results[rr].fail>0)anyRls=true;anyBlind+=results[rr].blind||0;anyRemap+=results[rr].remapped||0;}
   var metaInfo='GURU SMART • Google Drive • '+(state.email||'Akun Google')+(result.truncated?' • (sebagian tabel dibaca per tabel)':'');
   window.gsRestoreProgress(100,'Pemulihan selesai','Restore selesai diproses. Menampilkan ringkasan hasil...');
   window.gsShowImportSummary(results,verify,importedTotal,failTables,metaInfo,anyRls,anyBlind,anyRemap);
   try{gsAudit(failTables===0&&anyBlind===0?'RESTORE_DRIVE_SUCCESS':'RESTORE_DRIVE_PARTIAL','backup','google-drive',importedTotal+' berhasil; '+failTables+' tabel bermasalah; '+anyBlind+' tidak terbaca; '+summary.files+' file; '+summary.filesSkipped+' dilewati');}catch(eA){}
   if(summary.files||summary.filesSkipped)toast('File lampiran: '+summary.files+' dipulihkan, '+summary.filesSkipped+' dilewati.'+(summary.errors.length?' Beberapa kendala lihat ringkasan.':''),'info');
   if(failTables===0&&anyBlind>0)toast('Data tersimpan tetapi '+anyBlind+' baris TIDAK TERBACA — lihat panduan di ringkasan restore.','error');
   else if(failTables===0)toast('Restore dari Google Drive berhasil: '+importedTotal+' baris! Klik Muat Ulang untuk menampilkan data.','success');
   else toast(failTables+' tabel gagal diimpor — lihat ringkasan restore.','error');
   try{navigate('dashboard');}catch(eN){}
  }catch(e){
   if(restoreProgressStarted){try{closeModal();}catch(eC){}}
   else{try{gpFinish(false,e&&e.message||String(e));}catch(eG){}}
   try{gsAudit('RESTORE_DRIVE_FAILED','backup','google-drive',e&&e.message||String(e));}catch(eA){}
   toast('Pemulihan gagal: '+(e&&e.message?e.message:e),'error');
  }finally{window.__GS_DRIVE_SYNCING__=false;}
 }

 function applyFilters(rows,filters){return (rows||[]).filter(function(row){return (filters||[]).every(function(f){var a=row&&row[f.column],b=f.value;switch(f.op){case'eq':return String(a??'')===String(b??'');case'neq':return String(a??'')!==String(b??'');case'in':return Array.isArray(b)&&b.some(function(x){return String(x)===String(a);});case'is':return b===null?a==null:a===b;case'gt':return a>b;case'gte':return a>=b;case'lt':return a<b;case'lte':return a<=b;case'like':case'ilike':return new RegExp('^'+String(b).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$',f.op==='ilike'?'i':'').test(String(a??''));default:return true;}});});}
 function installStorageBackup(){if(!window.sb||!sb.storage||!sb.storage.from||sb.storage.from.__gsDriveWrapped)return false;var original=sb.storage.from.bind(sb.storage);var wrapped=function(bucket){var api=original(bucket);if(!api||!api.upload)return api;var up=api.upload.bind(api);api.upload=function(path,file,options){var p=up(path,file,options);return Promise.resolve(p).then(function(result){if(!result||!result.error){if(state.connected&&file&&typeof file.size==='number'){var form=new FormData();form.append('bucket',bucket);form.append('path',path);form.append('file',file,String(path).split('/').pop()||'file');var sess=session();sess.then(function(s){if(s)fetch(API+'/api/drive/file-backup',{method:'POST',headers:{Authorization:'Bearer '+s.access_token},body:form}).then(function(r){if(!r.ok)console.warn('[GURU DRIVE] Backup file storage gagal:',r.status);}).catch(function(e){console.warn('[GURU DRIVE] Backup file storage:',e.message);});});}}return result;});};return api;};wrapped.__gsDriveWrapped=true;sb.storage.from=wrapped;return true;}
 async function boot(){var tries=0;while(tries++<30){if(window.sb&&sb.auth)break;await new Promise(function(r){setTimeout(r,500);});}if(!window.sb||!sb.auth)return;var sess=await session().catch(function(){return null;});if(!sess)return;if(el('gsDriveWidget'))render();setInterval(flushQueue,30000);setInterval(function(){try{if(el('gsDriveWidget')&&!el('gsDriveBadge')&&!window.__gsDriveProgressActive)render();}catch(e){}},2000);var timer=setInterval(function(){if(installQueryBackup())clearInterval(timer);},500);var t3=setInterval(function(){if(installStorageBackup())clearInterval(t3);},500);try{sb.auth.onAuthStateChange(function(event,sessionNow){if(event==='SIGNED_OUT'){state.connected=false;var st=el('gsDriveStatus');if(st)st.textContent='Silakan login untuk menghubungkan Google Drive.';}else if(sessionNow&&['SIGNED_IN','TOKEN_REFRESHED'].includes(event)){if(el('gsDriveWidget'))render();else updateStatus();}});}catch(e){}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

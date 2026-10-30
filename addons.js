/* ============================================================
   GURU SMART SERTIFIKAT — js/addons.js
   Add-on: analisis nilai & pemantauan koneksi Supabase.
   Dipindah utuh dari berkas satu-halaman (tanpa perubahan kode);
   dimuat di posisi yang sama sehingga urutan eksekusi tetap identik.
   ============================================================ */
/* ---- Blok asli #50 ---- */

/* GURU SMART add-on: analisis nilai. Tidak mengganti DB, tabel, atau alur menu lama. */
window.gsEscapeHTML = window.gsEscapeHTML || function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
async function renderAnalisisNilai(){
  var content=document.getElementById('content'); if(!content)return;
  content.innerHTML='<div class="p-8 text-center text-slate-500">Memuat analisis nilai…</div>';
  try{
    var rr=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('grades'),DB.get('subjects')]);
    var students=rr[0]||[],classes=rr[1]||[],grades=rr[2]||[],subjects=rr[3]||[];
    var esc=window.gsEscapeHTML;
    var classOptions='<option value="all">Semua kelas</option>'+classes.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name||'Kelas')+'</option>';}).join('');
    var subjectOptions='<option value="all">Semua mata pelajaran</option>'+subjects.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name||'Mapel')+'</option>';}).join('');
    content.innerHTML='<div class="space-y-5"><div class="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-5 text-white flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-xl font-bold">📊 Analisis Nilai Siswa</h2><p class="text-sm text-indigo-100">Ringkasan capaian, ketuntasan KKM, dan siswa yang perlu pendampingan</p></div><button onclick="renderRapor()" class="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">← Kembali ke Cetak Rapor</button></div><div class="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-slate-700"><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><label class="text-sm font-semibold">Filter kelas<select id="gsAnalysisClass" onchange="updateAnalisisNilai()" class="mt-1 w-full border rounded-lg p-2 dark:bg-slate-700 dark:text-white">'+classOptions+'</select></label><label class="text-sm font-semibold">Filter mata pelajaran<select id="gsAnalysisSubject" onchange="updateAnalisisNilai()" class="mt-1 w-full border rounded-lg p-2 dark:bg-slate-700 dark:text-white">'+subjectOptions+'</select></label></div></div><div id="gsAnalysisResults"></div></div>';
    window.__gsAnalysisData={students:students,classes:classes,grades:grades,subjects:subjects};
    updateAnalisisNilai();
  }catch(e){console.error('Analisis nilai gagal:',e);content.innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl"><p class="text-red-600 font-semibold">Analisis nilai belum dapat dimuat.</p><p class="text-sm mt-2">Periksa koneksi database dan coba lagi.</p><button onclick="renderRapor()" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">Kembali</button></div>';}
}
function updateAnalisisNilai(){
  var d=window.__gsAnalysisData;if(!d)return;
  var cls=document.getElementById('gsAnalysisClass')?.value||'all', sub=document.getElementById('gsAnalysisSubject')?.value||'all';
  var esc=window.gsEscapeHTML;
  var students=d.students.filter(function(s){return cls==='all'||String(s.class_id)===String(cls);});
  var sid=new Set(students.map(function(s){return String(s.id);}));
  var grades=d.grades.filter(function(g){return sid.has(String(g.student_id))&&(sub==='all'||String(g.subject_id)===String(sub))&&g.score!==null&&g.score!==''&&Number.isFinite(Number(g.score));});
  var values=grades.map(function(g){return Number(g.score);}),avg=values.length?values.reduce(function(a,b){return a+b;},0)/values.length:0;
  var selectedSubject=d.subjects.find(function(s){return String(s.id)===String(sub);});
  var hasKkm=selectedSubject&&selectedSubject.kkm!==null&&selectedSubject.kkm!==''&&Number.isFinite(Number(selectedSubject.kkm));
  var kkm=hasKkm?Number(selectedSubject.kkm):null;
  var pass=kkm===null?null:grades.filter(function(g){return Number(g.score)>=kkm;}).length;
  var distribution={A:0,B:0,C:0,D:0};
  values.forEach(function(v){distribution[v>=90?'A':v>=80?'B':v>=70?'C':'D']++;});
  var perStudent=students.map(function(st){var gs=grades.filter(function(g){return String(g.student_id)===String(st.id);});var a=gs.length?gs.reduce(function(t,g){return t+Number(g.score);},0)/gs.length:null;return {student:st,grades:gs,avg:a};}).sort(function(a,b){if(a.avg===null)return 1;if(b.avg===null)return -1;return a.avg-b.avg;});
  var noScores=perStudent.filter(function(x){return !x.grades.length;}).length;
  var low=perStudent.filter(function(x){return x.avg!==null&&(x.avg<75||(kkm!==null&&x.avg<kkm));});
  var rows=perStudent.map(function(x,i){var p=x.avg===null?'-':(x.avg>=90?'A':x.avg>=80?'B':x.avg>=70?'C':'D');var stClass=d.classes.find(function(c){return String(c.id)===String(x.student.class_id);});var subjName=selectedSubject?selectedSubject.name:'Semua mapel';var status=x.avg===null?'Belum ada nilai':(kkm===null?'KKM belum diatur':(x.avg>=kkm?'Tuntas':'Belum tuntas'));var statusClass=x.avg===null?'text-slate-500':(kkm===null?'text-blue-600':(x.avg>=kkm?'text-green-600':'text-red-600'));return '<tr class="border-t dark:border-slate-700"><td class="px-3 py-2">'+(i+1)+'</td><td class="px-3 py-2 font-semibold">'+esc(x.student.name||'-')+'</td><td class="px-3 py-2">'+esc(stClass?.name||'-')+'</td><td class="px-3 py-2 text-center font-bold">'+(x.avg===null?'-':x.avg.toFixed(1))+'</td><td class="px-3 py-2 text-center">'+p+'</td><td class="px-3 py-2 '+statusClass+' font-semibold">'+status+'</td></tr>';}).join('');
  var card=function(title,value,subtext){return '<div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><p class="text-xs text-slate-500">'+title+'</p><p class="text-2xl font-extrabold mt-1">'+value+'</p><p class="text-xs text-slate-500 mt-1">'+subtext+'</p></div>';};
  var recommendation=grades.length===0?'Belum ada nilai yang cocok dengan filter. Input nilai melalui menu Penilaian untuk memulai analisis.':(noScores?'Ada '+noScores+' siswa tanpa nilai pada filter ini. Periksa kelengkapan input nilai. ':'')+(low.length?'Periksa kembali '+low.length+' siswa dengan rata-rata rendah dan pertimbangkan remedial atau pendampingan.':'')+(kkm===null?' KKM belum tersedia untuk filter ini, sehingga ketuntasan KKM tidak dapat dihitung.':'');
  document.getElementById('gsAnalysisResults').innerHTML='<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">'+card('Siswa dalam filter',students.length,'termasuk yang belum memiliki nilai')+card('Data nilai',grades.length,'nilai valid yang dianalisis')+card('Rata-rata nilai',grades.length?avg.toFixed(1):'-','rata-rata seluruh entri nilai')+card('Ketuntasan KKM',kkm===null?'-':(grades.length?Math.round(pass/grades.length*100)+'%':'-'),kkm===null?'KKM tidak tersedia':pass+' dari '+grades.length+' entri nilai')+'</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><h3 class="font-bold mb-3">Distribusi predikat</h3>'+['A','B','C','D'].map(function(k){var pct=values.length?Math.round(distribution[k]/values.length*100):0;return '<div class="mb-3"><div class="flex justify-between text-sm mb-1"><span>Predikat '+k+'</span><span>'+distribution[k]+' ('+pct+'%)</span></div><div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-2 bg-indigo-500 rounded-full" style="width:'+pct+'%"></div></div></div>';}).join('')+'</div><div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><h3 class="font-bold mb-2">Saran tindak lanjut</h3><p class="text-sm text-slate-600 dark:text-slate-300">'+esc(recommendation||'Nilai telah tersedia. Tinjau hasil per siswa dan gunakan sebagai bahan refleksi pembelajaran.')+'</p><p class="text-xs text-slate-400 mt-3">Batas predikat mengikuti aturan yang sudah dipakai aplikasi: A ≥ 90, B ≥ 80, C ≥ 70, D &lt; 70. Status KKM hanya dihitung jika KKM mapel tersedia.</p></div></div><div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden"><div class="p-4 flex flex-wrap justify-between items-center gap-2"><h3 class="font-bold">Rekap per siswa</h3><button onclick="exportAnalisisNilaiCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-bold">⬇️ Ekspor Excel</button></div><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-slate-100 dark:bg-slate-700"><tr><th class="px-3 py-3">No</th><th class="px-3 py-3">Nama siswa</th><th class="px-3 py-3">Kelas</th><th class="px-3 py-3 text-center">Rata-rata</th><th class="px-3 py-3 text-center">Predikat</th><th class="px-3 py-3">Status</th></tr></thead><tbody>'+ (rows||'<tr><td colspan="6" class="p-6 text-center text-slate-500">Belum ada data siswa.</td></tr>')+'</tbody></table></div></div>';
}
async function exportAnalisisNilaiCSV(){
  var d=window.__gsAnalysisData;if(!d)return;
  if(!(await window.__gsEnsureXLSX())){showToast('Modul Excel perlu internet sekali untuk dimuat. Coba lagi saat online.','error');return;}
  var cls=document.getElementById('gsAnalysisClass')?.value||'all',sub=document.getElementById('gsAnalysisSubject')?.value||'all';
  var profResult=await DB.get('school_profile');
  var prof=(profResult&&profResult[0])||{};
  var selectedClass=d.classes.find(function(c){return String(c.id)===String(cls);});
  var selectedSubject=d.subjects.find(function(x){return String(x.id)===String(sub);});
  var classLabel=cls==='all'?'Semua kelas':(selectedClass?.name||'Semua kelas');
  var subjectLabel=sub==='all'?'Semua mata pelajaran':(selectedSubject?.name||'Semua mata pelajaran');
  /* Format laporan mengikuti pola Export Excel pada menu Data Siswa: kop, judul, filter, lalu tabel berkolom. */
  var aoa=[[''],['',prof.kop_line1||'NAMA SEKOLAH','','','','','','','']];
  if(prof.kop_line1b)aoa.push(['',prof.kop_line1b,'','','','','','','']);
  aoa.push(['',prof.kop_line2||prof.name||'','','','','','','','']);
  aoa.push(['',prof.kop_line3||'','','','','','','','']);
  aoa.push(['']);
  aoa.push(['ANALISIS NILAI SISWA']);
  aoa.push(['Kelas: '+classLabel+' | Mata Pelajaran: '+subjectLabel]);
  aoa.push(['']);
  aoa.push(['No','NIS','Nama Siswa','Kelas','Mata Pelajaran','Jumlah Nilai','Rata-rata','Predikat','Status KKM']);
  d.students.filter(function(st){return cls==='all'||String(st.class_id)===String(cls);}).forEach(function(st,i){
    var gs=d.grades.filter(function(g){return String(g.student_id)===String(st.id)&&(sub==='all'||String(g.subject_id)===String(sub))&&g.score!==null&&g.score!==''&&Number.isFinite(Number(g.score));});
    var a=gs.length?gs.reduce(function(t,g){return t+Number(g.score);},0)/gs.length:null;
    var kkm=selectedSubject&&selectedSubject.kkm!==null&&selectedSubject.kkm!==''&&Number.isFinite(Number(selectedSubject.kkm))?Number(selectedSubject.kkm):null;
    var studentClass=d.classes.find(function(c){return String(c.id)===String(st.class_id);});
    aoa.push([i+1,st.nis||'',st.name||'',studentClass?.name||'-',subjectLabel,gs.length,a===null?'':Number(a.toFixed(1)),a===null?'':(a>=90?'A':a>=80?'B':a>=70?'C':'D'),a===null?'Belum ada nilai':(kkm===null?'KKM belum diatur':(a>=kkm?'Tuntas':'Belum tuntas'))]);
  });
  var ws=XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges']=[{s:{r:1,c:1},e:{r:1,c:8}},{s:{r:2,c:1},e:{r:2,c:8}},{s:{r:3,c:1},e:{r:3,c:8}},{s:{r:4,c:1},e:{r:4,c:8}},{s:{r:6,c:0},e:{r:6,c:8}},{s:{r:7,c:0},e:{r:7,c:8}}];
  ws['!cols']=[{wch:6},{wch:16},{wch:28},{wch:18},{wch:25},{wch:14},{wch:14},{wch:12},{wch:22}];
  var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Analisis Nilai');
  XLSX.writeFile(wb,'Analisis_Nilai_Guru_Smart.xlsx');
  showToast('File Excel analisis nilai berhasil diunduh!','success');
}

;
/* ---- Blok asli #51 ---- */

/* Pemantauan koneksi dan layanan Supabase. Pemeriksaan berkala hanya membaca status; tidak mengubah data. */
(function(){
  var lastState='unknown', checking=false, lastFailureAt=null;
  function el(id){return document.getElementById(id);}
  function show(state,title,message){
    var b=el('gsServiceStatus'); if(!b)return;
    b.classList.remove('hidden');
    b.style.background=state==='offline'?'#991b1b':state==='database'?'#9a3412':'#b91c1c';
    el('gsServiceStatusIcon').textContent=state==='offline'?'📡':state==='database'?'🗄️':'⚠️';
    el('gsServiceStatusTitle').textContent=title;
    el('gsServiceStatusMessage').textContent=message;
    el('gsServiceStatusTime').textContent='Terakhir terdeteksi: '+new Date().toLocaleString('id-ID')+'. Data yang belum tersimpan mungkin perlu dikirim ulang setelah layanan pulih.';
    if(lastState!==state){
      try{if(typeof showToast==='function')showToast(title+' — '+message,'error');}catch(e){}
    }
    lastState=state;
  }
  function clear(){
    var b=el('gsServiceStatus');if(b)b.classList.add('hidden');
    if(lastState!=='ok'&&lastState!=='unknown'){
      try{if(typeof showToast==='function')showToast('Koneksi server dan database kembali normal. Periksa kembali data terakhir yang Anda simpan.','success');}catch(e){}
    }
    lastState='ok';lastFailureAt=null;
  }
  window.gsCheckServiceStatus=async function(manual){
    if(checking)return;checking=true;
    try{
      if(navigator.onLine===false){show('offline','Koneksi internet terputus','Periksa Wi-Fi atau jaringan internet perangkat. Aplikasi mungkin belum bisa membaca atau menyimpan data ke server.');return;}
      var controller=typeof AbortController!=='undefined'?new AbortController():null;
      var timer=setTimeout(function(){if(controller)controller.abort();},9000);
      var response;
      try{response=await fetch(SUPABASE_URL+'/auth/v1/health',{method:'GET',headers:{'apikey':SUPABASE_ANON_KEY},cache:'no-store',signal:controller?controller.signal:undefined});}
      finally{clearTimeout(timer);}
      if(!response||!response.ok){
        var code=response?response.status:0;
        if(code===401||code===403){show('database','Layanan server merespons, tetapi akses pemeriksaan ditolak','Periksa konfigurasi Supabase API key dan kebijakan akses. Jangan bagikan kata sandi atau kunci rahasia.');}
        else show('server','Server layanan sedang gangguan','Server autentikasi/database tidak merespons normal (HTTP '+(code||'tidak diketahui')+'). Tunggu sebentar lalu tekan “Coba lagi”.');
        return;
      }
      if(currentUser&&currentUser.id){
        var dbCheck=await Promise.race([
          sb.from('users').select('id').eq('id',currentUser.id).maybeSingle(),
          new Promise(function(_,reject){setTimeout(function(){reject(new Error('DB_TIMEOUT'));},9000);})
        ]);
        if(dbCheck&&dbCheck.error){
          var m=String(dbCheck.error.message||'').toLowerCase();
          if(m.includes('fetch')||m.includes('network')||m.includes('timeout')||m.includes('temporar')||m.includes('unavailable')){show('database','Database sedang tidak dapat dihubungi','Koneksi ke database gagal. Jangan ulangi penyimpanan berkali-kali; tunggu hingga pulih lalu periksa data.');return;}
          if(dbCheck.error.code==='PGRST205'||m.includes('could not find the table')){show('database','Tabel database tidak ditemukan','Server merespons, tetapi struktur tabel “users” bermasalah. Hubungi pengelola aplikasi; jangan melakukan restore berulang.');return;}
          if(dbCheck.error.code==='42501'||m.includes('permission')||m.includes('row-level security')||m.includes('rls')){show('database','Akses database ditolak','Server aktif, tetapi akun tidak memiliki izin yang diperlukan. Periksa sesi login dan kebijakan RLS.');return;}
          /* Error selain gangguan jaringan ditangani sebagai peringatan konfigurasi, bukan server mati. */
          show('database','Pemeriksaan database perlu perhatian','Server dapat dijangkau, tetapi pemeriksaan database gagal: '+(dbCheck.error.message||'kesalahan tidak diketahui')+'.');return;
        }
      }
      clear();
    }catch(e){
      var msg=String(e&&e.message||e||'');
      if(navigator.onLine===false||/failed to fetch|networkerror|load failed|aborterror|db_timeout|timeout/i.test(msg)){
        show('server','Server atau database tidak dapat dihubungi','Tidak ada respons dalam batas waktu pemeriksaan. Bisa jadi server sedang gangguan atau koneksi tidak stabil. Coba lagi beberapa saat.');
      }else{
        show('server','Pemeriksaan layanan gagal','Tidak dapat memastikan status layanan saat ini. Periksa koneksi, lalu tekan “Coba lagi”.');
      }
    }finally{checking=false;}
  };
  window.addEventListener('offline',function(){show('offline','Koneksi internet terputus','Periksa Wi-Fi atau jaringan internet perangkat. Data online mungkin belum tersimpan.');});
  window.addEventListener('online',function(){show('server','Koneksi internet kembali','Sedang memeriksa apakah server dan database sudah pulih…');window.gsCheckServiceStatus(false);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)window.gsCheckServiceStatus(false);});
  setTimeout(function(){window.gsCheckServiceStatus(false);},2500);
  setInterval(function(){if(!document.hidden)window.gsCheckServiceStatus(false);},60000);
})();

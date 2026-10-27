
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

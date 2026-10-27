
/* ==================================================================
   FOTO GURU — Upload & tampilkan foto di halaman Data Guru
   - Kolom Foto di tabel + avatar inisial jika belum ada foto
   - Upload via form Tambah/Edit Guru (otomatis dikompres, sisi maks 400px)
   - Klik foto di tabel = pratinjau • klik avatar kosong = tambah foto
   - Disimpan sebagai dataURL di kolom 'photo' (teks) tabel teachers
   ================================================================== */
(function(){
  var TCH_PLACEHOLDER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#e2e8f0"/><circle cx="50" cy="38" r="17" fill="#94a3b8"/><path d="M15 94c4-19 19-27 35-27s31 8 35 27z" fill="#94a3b8"/></svg>');
  window.TCH_PHOTO_PLACEHOLDER=TCH_PLACEHOLDER;
  window.gsTeacherInitials=function(n){var s=String(n||'').trim();if(!s)return '?';var p=s.split(/\s+/).slice(0,2);return p.map(function(w){return w.charAt(0).toUpperCase();}).join('')||'?';};
  function gsCompressImage(file,maxSide,quality){
    return new Promise(function(res,rej){
      if(!file){rej(new Error('Tidak ada file'));return;}
      if(file.type&&file.type.indexOf('image/')!==0){rej(new Error('File bukan gambar'));return;}
      var fr=new FileReader();
      fr.onload=function(){
        var img=new Image();
        img.onload=function(){
          try{
            var w=img.naturalWidth||img.width||1,h=img.naturalHeight||img.height||1;
            var sc=Math.min(1,(parseInt(maxSide,10)||400)/Math.max(w,h));
            var cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc));
            var cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
            var ctx=cv.getContext('2d');
            ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cw,ch);
            ctx.drawImage(img,0,0,cw,ch);
            var du=cv.toDataURL('image/jpeg',(typeof quality==='number'?quality:0.85));
            if(!du||du.indexOf('data:image')!==0){rej(new Error('Hasil kompresi kosong'));return;}
            res(du);
          }catch(e){rej(e);}
        };
        img.onerror=function(){rej(new Error('Format gambar tidak didukung browser'));};
        img.src=fr.result;
      };
      fr.onerror=function(){rej(new Error('Gagal membaca file'));};
      fr.readAsDataURL(file);
    });
  }
  window.gsCompressImage=gsCompressImage;
  window.tchPhotoPicked=async function(ev){
    var inp=ev&&ev.target;var f=inp&&inp.files&&inp.files[0];
    if(!f)return;
    var hid=document.getElementById('tch_photo'),pv=document.getElementById('tch_photo_preview');
    if(!hid||!pv){showToast('Formulir foto tidak ditemukan.','error');return;}
    try{
      showToast('Memproses foto...','info');
      var du=await gsCompressImage(f,400,0.85);
      hid.value=du;pv.src=du;
      showToast('Foto siap. Klik "Simpan" untuk menyimpan.','success');
    }catch(e){showToast('Gagal memproses foto: '+(e.message||e),'error');}
    finally{if(inp)inp.value='';}
  };
  window.tchPhotoClear=function(){
    var hid=document.getElementById('tch_photo'),pv=document.getElementById('tch_photo_preview');
    if(hid)hid.value='__GS_CLEAR__';
    if(pv)pv.src=TCH_PLACEHOLDER;
  };
  window.teacherPhotoAction=function(id){
    return DB.get('teachers').then(function(list){
      var t=null;for(var i=0;i<(list||[]).length;i++){if(list[i].id===id){t=list[i];break;}}
      if(!t)return;
      if(t.photo){
        openModal('📷 Foto Guru',
          '<div class="text-center">'
          +'<img src="'+t.photo+'" alt="Foto guru" class="max-w-full rounded-xl mx-auto shadow-md bg-slate-100 dark:bg-slate-700" style="max-height:60vh;object-fit:contain">'
          +'<p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-3">'+String(t.name||'')+(t.subject?' • '+String(t.subject):'')+'</p>'
          +'<div class="flex justify-center gap-2 mt-4"><button onclick="closeModal();teacherForm(\''+id+'\')" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">✏️ Ganti Foto</button></div>'
          +'</div>');
      }else{
        showToast('Guru ini belum punya foto. Unggah lewat formulir berikut.','info');
        teacherForm(id);
      }
    }).catch(function(e){showToast('Gagal memuat data guru: '+(e.message||e),'error');});
  };
  window.gsPhotoColumnHelp=function(){
    openModal('⚠️ Kolom "photo" Belum Ada',
      '<div class="text-sm text-slate-600 dark:text-slate-300 space-y-2">'
      +'<p>Fitur <b>Foto Guru</b> membutuhkan kolom <b>photo</b> (bertipe teks) pada tabel <b>teachers</b> di Supabase.</p>'
      +'<p class="font-semibold">Cara memperbaiki:</p>'
      +'<p>1. Buka <b>Supabase → SQL Editor</b>.</p>'
      +'<p>2. Jalankan SQL berikut:</p>'
      +'<pre class="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap">alter table teachers add column if not exists photo text;</pre>'
      +'<p>3. Muat ulang halaman, lalu ulangi unggah foto.</p>'
      +'</div>');
  };
})();

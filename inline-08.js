
/* ===== Panel Tutorial Lengkap Aplikasi (tampil di bawah panel Pengaturan) ===== */
window.gsAppTutorialHTML=function(){
  var D=function(t,b){return '<details class="group bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"><summary class="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-white cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg">'+t+'</summary><div class="px-4 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-300 space-y-2">'+b+'</div></details>';};
  var L=function(x){return '<p class="flex gap-2"><span class="text-blue-600 dark:text-blue-400 font-bold flex-none">•</span><span>'+x+'</span></p>';};
  var it='';
  it+=D('🚀 Mulai Cepat',
    L('Langkah 1 - Isi data induk lebih dulu: Data Guru, Data Siswa, Kelas, dan Mata Pelajaran. Semua fitur lain memakai data ini.')+
    L('Langkah 2 - Buka menu Pengaturan: lengkapi Profil Sekolah dan Kop Surat agar setiap dokumen cetak otomatis berkop sekolah Anda.')+
    L('Langkah 3 - Pastikan AI tersambung: buka menu Asisten AI Guru lalu klik tombol Sambungkan AI (izinkan popup yang muncul).')+
    L('Langkah 4 - Sudah siap! Buat dokumen di Perangkat Ajar, kuis di Kuis Kelas, catat absensi, dan lakukan Backup data secara berkala.'));
  it+=D('📊 Dashboard',
    L('Menampilkan ringkasan sekolah: jumlah guru, siswa, kelas, jadwal hari ini, dan akses cepat ke fitur utama.')+
    L('Klik kartu atau tombol aksi cepat untuk melompat ke menu terkait.'));
  it+=D('🤖 Asisten AI Guru + Studio Gambar',
    L('Ketik permintaan apa pun: membuat soal, menyusun naskah, ide kegiatan, hingga perbaikan teks. Mode Akurat otomatis dipakai untuk soal dan hitungan agar kunci jawaban benar.')+
    L('Bila sesi AI belum aktif, klik Sambungkan AI (izinkan popup). Tombol Ganti Akun AI dipakai bila kuota/saldo habis.')+
    L('Studio Gambar: tulis prompt, pilih gaya (Kartun Anak, Realistis, Poster, dll), pilih rasio (1:1, 16:9, 9:16), lalu buat. Hasil bisa diunduh; galeri menyimpan riwayat gambar.'));
  it+=D('📚 Perangkat Ajar (CP, TP, ATP, Modul, RPP, Prota, LKPD)',
    L('Pilih jenis dokumen, mata pelajaran, kelas, fase, dan topik, lalu klik Generate dengan AI - dokumen tersusun otomatis dengan tabel rapi.')+
    L('Buka dokumen yang sudah jadi, lalu klik tombol 🎨 Generate Gambar (9:16) untuk membuat ilustrasi potret HD 1080×1920 dari isi dokumen: hasil tampil UTUH tanpa terpotong, teks tajam, bisa diunduh atau dibuat ulang.')+
    L('Klik 🖨️ Cetak / PDF untuk mencetak dokumen lengkap dengan kop sekolah.'));
  it+=D('🛡️ Kuis Kelas',
    L('Buat kuis interaktif per kelas dengan bantuan AI: pilih kelas, topik, dan jumlah soal.')+
    L('Bagikan kuis ke siswa; jawaban terkumpul otomatis untuk diperiksa guru.'));
  it+=D('👥 Data Induk: Guru, Siswa, Kelas, Mata Pelajaran',
    L('Data Guru & Data Siswa: tambah, ubah, atau hapus lewat tombol di tabel; identitas dipakai di absensi, penilaian, dan rapor.')+
    L('Kelas: buat kelas dan tentukan wali kelas. Mata Pelajaran: daftar mapel (termasuk mapel daerah) yang dipakai jadwal, penilaian, dan perangkat ajar.'));
  it+=D('🗓️ Jadwal & Jadwal Piket',
    L('Jadwal: atur hari, jam, mata pelajaran, guru, dan kelas; tersedia tombol generate gambar poster jadwal yang ceria.')+
    L('Jadwal Piket: susun piket harian siswa per hari; bisa juga dibuatkan gambar poster piket otomatis.'));
  it+=D('✅ Absensi & Absensi Kegiatan',
    L('Absensi: catat kehadiran harian per kelas (hadir, sakit, izin, alfa); rekap tersimpan otomatis.')+
    L('Absensi Kegiatan: catat kehadiran untuk kegiatan atau acara khusus sekolah.'));
  it+=D('📝 Penilaian & Tugas',
    L('Penilaian: input nilai per kelas, mapel, dan komponen penilaian; data ini terhubung ke Cetak Rapor.')+
    L('Tugas: buat tugas, pantau pengumpulan, lalu beri nilai.'));
  it+=D('📁 Materi Ajar',
    L('Simpan materi bahan ajar per mata pelajaran; materi bisa dibuatkan dengan AI lalu dibagikan ke siswa.'));
  it+=D('💰 Keuangan SPP',
    L('Catat pembayaran SPP per siswa: tagihan, pelunasan, dan rekap keuangan per kelas maupun seluruh sekolah.'));
  it+=D('🧾 Cetak Rapor',
    L('Pilih kelas dan siswa; aplikasi merangkum nilai, absensi, dan identitas menjadi rapor siap cetak dengan kop sekolah.'));
  it+=D('⚙️ Pengaturan',
    L('Profil Sekolah: nama, alamat, kepala sekolah, dan NIP - dipakai di semua dokumen cetak.')+
    L('Pengaturan Akun: ganti foto profil Anda.')+
    L('Backup & Restore: unduh semua data (JSON) atau pulihkan dari file. Jadwal backup, riwayat, dan pemeriksaan keamanan akun tersedia di panel khusus.')+
    L('Kop Surat: logo kiri/kanan plus baris identitas sekolah dengan pratinjau langsung.'));
  return '<div class="bg-white dark:bg-slate-800 p-6 rounded-xl md:col-span-2 border-t-4 border-amber-600">'
    +'<h3 class="font-bold mb-2 text-slate-800 dark:text-white">📖 Tutorial Lengkap Aplikasi GURU Smart AI</h3>'
    +'<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Panduan singkat seluruh panel aplikasi - klik salah satu bagian di bawah untuk membuka panduannya.</p>'
    +'<div class="space-y-2">'+it+'</div>'
    +'<p class="text-xs text-slate-400 mt-4">Catatan: beberapa menu hanya tampil sesuai peran (admin/guru/siswa). Seluruh data tersimpan otomatis - lakukan Backup berkala di panel Backup, Riwayat & Keamanan.</p>'
    +'</div>';
};
async function renderSettings(){
  /* KILAT PENGATURAN: form digambar SEKETIKA tanpa menunggu jaringan; nilai profil
     diisi begitu data school_profile tiba. Perilaku & tampilan tetap sama. */
  var GS_PH='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">'+
  '<div class="bg-white dark:bg-slate-800 p-6 rounded-xl"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">Profil Sekolah</h3><div class="space-y-4">'+
  '<div><label class="block text-sm mb-1">Nama Sekolah</label><input type="text" id="p_name" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">Alamat</label><input type="text" id="p_address" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">Kepala Sekolah</label><input type="text" id="p_principal" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">NIP Kepala Sekolah</label><input type="text" id="p_principal_nip" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<button type="button" id="btnSaveProfil" disabled onclick="saveSchoolProfileData(window.__gsSetPid||\'\')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Simpan Profil</button></div></div>'+
  
  '<div class="bg-white dark:bg-slate-800 p-6 rounded-xl"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">Pengaturan Akun</h3><div class="flex flex-col items-center space-y-3">'+
  '<img id="prevAvatar" src="'+(currentUser.avatar_url||AI_IMG)+'" onerror="imgFallback(this)" class="w-24 h-24 rounded-xl object-cover bg-white shadow-md ring-2 ring-slate-100" style="background:#ffffff">'+
  '<input type="file" id="avatarFile" accept="image/*" class="text-sm block w-full text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">'+
  '<button id="btnUploadAvatar" onclick="uploadAvatar()" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition hover:bg-green-700"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload Foto</button></div></div>'+
  
  '<div class="bg-white dark:bg-slate-800 p-6 rounded-xl md:col-span-2 border-t-4 border-green-600"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">Backup & Restore Data (JSON)</h3><div class="flex flex-col sm:flex-row gap-4">'+
  '<button onclick="exportAllDataJSON()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex-1 flex items-center justify-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Download Semua Data</button>'+
  '<label class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex-1 text-center cursor-pointer flex items-center justify-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg> Restore Data (JSON)<input type="file" accept=".json" class="hidden" onchange="importAllDataJSON(event)"></label>'+
  '<button onclick="gsTestWriteAccess()" class="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold sm:flex-none">🔌 Uji Izin Tulis</button></div><p class="text-xs text-slate-500 mt-3">Gunakan fitur ini untuk memindahkan semua data ke akun lain atau sebagai backup. Bila restore ditolak database (RLS 42501), klik <b>Uji Izin Tulis</b> untuk diagnosis + SQL perbaikan.</p></div>'+
  '<div class="bg-white dark:bg-slate-800 p-6 rounded-xl md:col-span-2 border-t-4 border-indigo-600"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">Kop Surat</h3><div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">'+
  '<div class="lg:col-span-1 space-y-4">'+
  '<div><label class="block text-sm mb-1">Logo Kiri</label><div class="flex items-center gap-2"><img id="prevLogoLeft" src="'+GS_PH+'" onerror="this.style.display=\'none\'" class="w-16 h-16 object-contain border rounded-lg bg-slate-50"><input type="file" id="logoLeftFile" accept="image/*" class="text-xs"></div></div>'+
  '<div><label class="block text-sm mb-1">Logo Kanan</label><div class="flex items-center gap-2"><img id="prevLogoRight" src="'+GS_PH+'" onerror="this.style.display=\'none\'" class="w-16 h-16 object-contain border rounded-lg bg-slate-50"><input type="file" id="logoRightFile" accept="image/*" class="text-xs"></div></div>'+
  '<div><label class="block text-sm mb-1">Baris 1 A (Dinas/Yayasan)</label><input type="text" id="kop_line1" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">Baris 1 B (Kab/Kota)</label><input type="text" id="kop_line1b" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">Baris 2 (Nama Sekolah)</label><input type="text" id="kop_line2" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<div><label class="block text-sm mb-1">Baris 3 (Alamat/Telp/Email)</label><input type="text" id="kop_line3" value="" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div>'+
  '<button id="btnSaveKop" disabled onclick="saveKopData(window.__gsSetPid||\'\')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Simpan Kop</button></div>'+
  '<div class="lg:col-span-2"><p class="text-sm font-semibold mb-2">Pratinjau:</p><div class="border p-4 bg-white rounded-lg shadow-sm w-full" id="kopPreviewArea" style="aspect-ratio:3/1;"></div></div></div></div>'+window.gsAppTutorialHTML()+'</div>';
  
  document.getElementById('content').innerHTML = html;
  var be=document.getElementById('gsBackupEvery');if(be){be.value=localStorage.getItem('gs_backup_every_'+currentUser.id)||'360';gsFormatBackupStatus();}
  
  document.getElementById('logoLeftFile').addEventListener('change',function(e){previewFile(e,'prevLogoLeft');});
  document.getElementById('logoRightFile').addEventListener('change',function(e){previewFile(e,'prevLogoRight');});
  /* [BARU] PRATINJAU FOTO PROFIL INSTAN: foto langsung tampil di lingkaran pratinjau
     begitu dipilih, SEBELUM tombol Upload diklik. Tidak mengubah perilaku upload. */
  document.getElementById('avatarFile').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0];
    if(!f)return;
    if(!f.type||!f.type.startsWith('image/'))return;
    var rd=new FileReader();
    rd.onload=function(ev){
      var pv=document.getElementById('prevAvatar');
      if(pv){pv.src=ev.target.result;pv.style.display='block';}
    };
    rd.readAsDataURL(f);
  });
  document.getElementById('kop_line1').addEventListener('input',updateKopPreviewText);
  document.getElementById('kop_line1b').addEventListener('input',updateKopPreviewText);
  document.getElementById('kop_line2').addEventListener('input',updateKopPreviewText);
  document.getElementById('kop_line3').addEventListener('input',updateKopPreviewText);
  
  function gsFillProfile(p){
    var g=function(id){return document.getElementById(id);};
    if(!g('p_name'))return;
    g('p_name').value=p.name||'';
    g('p_address').value=p.address||'';
    g('p_principal').value=p.principal||'';
    g('p_principal_nip').value=p.principal_nip||'';
    var e1=g('kop_line1');if(e1)e1.value=p.kop_line1||p.name||'';
    var e2=g('kop_line1b');if(e2)e2.value=p.kop_line1b||'';
    var e3=g('kop_line2');if(e3)e3.value=p.kop_line2||p.address||'';
    var e4=g('kop_line3');if(e4)e4.value=p.kop_line3||'';
    var pl=g('prevLogoLeft');if(pl)pl.src=p.logo_left||GS_PH;
    var pr=g('prevLogoRight');if(pr)pr.src=p.logo_right||GS_PH;
    var bp=g('btnSaveProfil');if(bp)bp.disabled=false;
    var bk=g('btnSaveKop');if(bk)bk.disabled=false;
    updateKopPreview();
  }
  
  window.__gsSetPid='';
  var last=window.__gsSetLast;
  if(last){window.__gsSetPid=last.id||'';gsFillProfile(last);}else{updateKopPreview();}
  gsGetProfilSekolah().then(function(rows){var p=(rows&&rows[0])||{};window.__gsSetLast=p;window.__gsSetPid=p.id||'';gsFillProfile(p);}).catch(function(e){console.warn('Profil sekolah gagal dimuat:',e);});
}
function previewFile(event,imgId){var file=event.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){var url=e.target.result;var sm=document.getElementById(imgId);if(sm){sm.src=url;sm.style.display='block';}updateKopPreview();};reader.readAsDataURL(file);}
function gsKopPreviewBuild(){var area=document.getElementById('kopPreviewArea');if(!area)return;area.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:10px;border-bottom:3px double #000;padding-bottom:10px;margin-bottom:20px;font-family:Arial;"><div style="width:75px;height:75px;display:flex;align-items:center;justify-content:flex-start;"><img id="gsKopImgL" onerror="this.style.display=\'none\'" style="max-width:100%;max-height:75px;object-fit:contain;"></div><div style="text-align:center;flex:1;min-width:0;"><h2 id="gsKopL1" style="margin:0;font-size:18px;font-weight:bold;text-transform:uppercase;color:#000;line-height:1.4;"></h2><p id="gsKopL1b" style="margin:2px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;color:#000;line-height:1.4;display:none;"></p><p id="gsKopL2" style="margin:4px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;color:#000;line-height:1.4;"></p><p id="gsKopL3" style="margin:2px 0 0;font-size:12px;color:#000;line-height:1.4;"></p></div><div style="width:75px;height:75px;display:flex;align-items:center;justify-content:flex-end;"><img id="gsKopImgR" onerror="this.style.display=\'none\'" style="max-width:100%;max-height:75px;object-fit:contain;"></div></div>';}
function updateKopPreviewText(){var e1=document.getElementById('gsKopL1');if(!e1)return;var l1=document.getElementById('kop_line1')?.value||'NAMA DINAS';var l1b=document.getElementById('kop_line1b')?.value||'';var l2=document.getElementById('kop_line2')?.value||'Nama Sekolah';var l3=document.getElementById('kop_line3')?.value||'Alamat | Telp';e1.innerText=l1;var e1b=document.getElementById('gsKopL1b');if(e1b){e1b.innerText=l1b;e1b.style.display=l1b.trim()?'':'none';}var e2=document.getElementById('gsKopL2');if(e2)e2.innerText=l2;var e3=document.getElementById('gsKopL3');if(e3)e3.innerText=l3;}
function updateKopPreviewImgs(){var ls=document.getElementById('prevLogoLeft');var rs=document.getElementById('prevLogoRight');var l=document.getElementById('gsKopImgL');var r2=document.getElementById('gsKopImgR');if(l&&ls){if(l.getAttribute('src')!==ls.src)l.src=ls.src;l.style.display='';}if(r2&&rs){if(r2.getAttribute('src')!==rs.src)r2.src=rs.src;r2.style.display='';}}
function updateKopPreview(){var area=document.getElementById('kopPreviewArea');if(!area)return;if(!document.getElementById('gsKopL1'))gsKopPreviewBuild();updateKopPreviewText();updateKopPreviewImgs();}
function kopFileToDataURL(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=function(){reject(new Error('Tidak dapat membaca file logo.'));};reader.readAsDataURL(file);});}
async function saveKopData(profileId){
 var data={name:document.getElementById('p_name')?.value||'',address:document.getElementById('p_address')?.value||'',principal:document.getElementById('p_principal')?.value||'',principal_nip:document.getElementById('p_principal_nip')?.value||'',kop_line1:document.getElementById('kop_line1')?.value||'',kop_line1b:document.getElementById('kop_line1b')?.value||'',kop_line2:document.getElementById('kop_line2')?.value||'',kop_line3:document.getElementById('kop_line3')?.value||''};
 var lf=document.getElementById('logoLeftFile')?.files?.[0],rf=document.getElementById('logoRightFile')?.files?.[0];showToast('Menyimpan kop surat...','info');
 try{
  for(var item of [{file:lf,key:'logo_left',label:'Logo kiri'},{file:rf,key:'logo_right',label:'Logo kanan'}]){
   if(!item.file)continue;
   if(!item.file.type||!item.file.type.startsWith('image/')){showToast(item.label+' harus berupa gambar.','error');return;}
   if(item.file.size>2*1024*1024){showToast(item.label+' maksimal 2 MB. Pilih gambar yang lebih kecil.','error');return;}
   var savedUrl='';
   try{var ext=(item.file.name.split('.').pop()||'png').toLowerCase().replace(/[^a-z0-9]/g,'')||'png';var path='kop_'+(item.key==='logo_right'?'right':'left')+'_'+currentUser.id+'_'+Date.now()+'.'+ext;var up=await sb.storage.from('avatars').upload(path,item.file,{upsert:true,contentType:item.file.type||'image/png'});if(!up.error)savedUrl=sb.storage.from('avatars').getPublicUrl(up.data.path).data.publicUrl;else console.warn('Upload Storage ditolak, menggunakan data URL:',up.error.message);}catch(storageErr){console.warn('Storage logo gagal, menggunakan data URL:',storageErr);}
   if(!savedUrl)savedUrl=await kopFileToDataURL(item.file);
   data[item.key]=savedUrl;
  }
  var saved=await saveSchoolProfile(data,profileId||null);if(!saved)return;
  showToast('Kop surat dan logo berhasil disimpan.','success');await renderSettings();
 }catch(err){console.error('Simpan kop gagal:',err);showToast('Gagal menyimpan kop/logo: '+(err?.message||String(err)),'error');}
}
/* ===== CACHE PROFIL SEKOLAH & KOP (Task 33: anti lambat klik PDF/Word/Kunci) =====
   Sebelumnya SETIAP klik memanggil Supabase (DB.get school_profile) + memproses ulang logo
   Word (fetch + canvas + JPEG) -> terasa lama loading. Kini: profil di-cache 5 menit, HTML
   kop Word final di-cache per isi profil, dimuat di latar belakang (prewarm) saat jawaban AI
   muncul, dan cache dibatalkan (invalidate) setiap kali profil sekolah disimpan/diubah. */
var _gsProfilCache={data:null,ts:0};
var _gsKopWordCache={key:'',html:''};
function gsInvalidateProfilCache(){_gsProfilCache={data:null,ts:0};_gsKopWordCache={key:'',html:''};}
function gsGetProfilSekolah(force){var now=Date.now();if(!force&&_gsProfilCache.data&&_gsProfilCache.data.length&&now-_gsProfilCache.ts<300000)return Promise.resolve(_gsProfilCache.data);return DB.get('school_profile').then(function(rows){if(rows&&rows.length){_gsProfilCache={data:rows,ts:Date.now()};}return rows||[];});}
function gsPrewarmKop(){try{gsGetProfilSekolah().then(function(){try{var pw=gsKopHTMLForWord();if(pw&&pw.catch)pw.catch(function(){});}catch(ePW){}}).catch(function(){});}catch(ePP){}}
/* ===== AKHIR CACHE PROFIL & KOP ===== */
async function generateKopHTML(){var profile=(await gsGetProfilSekolah())[0]||{};if(!profile.kop_line1&&!profile.logo_left)return'';var l1=profile.kop_line1||profile.name||'NAMA SEKOLAH';var l1b=profile.kop_line1b||'';var l2=profile.kop_line2||profile.address||'Alamat Sekolah';var l3=profile.kop_line3||'Email | Telp';var ll=profile.logo_left?'<img src="'+profile.logo_left+'" style="max-width:80px;max-height:80px;object-fit:contain;">':'';var rl=profile.logo_right?'<img src="'+profile.logo_right+'" style="max-width:80px;max-height:80px;object-fit:contain;">':'';var l1bHTML=l1b.trim()?'<p style="margin:2px 0 0;font-size:20px;font-weight:bold;text-transform:uppercase;line-height:1.0;">'+l1b+'</p>':'';return'<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #000;padding-bottom:10px;margin-bottom:25px;font-family:Arial;"><div style="width:75px;height:75px;display:flex;align-items:center;justify-content:center;">'+ll+'</div><div style="text-align:center;flex:1;padding:0 20px;"><h2 style="margin:0;font-size:16px;font-weight:bold;text-transform:uppercase;line-height:1.0;">'+l1+'</h2>'+l1bHTML+'<p style="margin:4px 0 0;font-size:22px;font-weight:bold;text-transform:uppercase;line-height:1.2;">'+l2+'</p><p style="margin:2px 0 0;font-size:12px;line-height:1.0;">'+l3+'</p></div><div style="width:75px;height:75px;display:flex;align-items:center;justify-content:center;">'+rl+'</div></div>';}
async function renderBackupSecurity(){
  var html='<div class="max-w-6xl mx-auto space-y-6">'+
  '<div class="rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600"><div class="flex items-start gap-4"><div class="text-4xl">🛡️</div><div><h2 class="text-2xl font-extrabold">Jadwal Backup, Riwayat & Keamanan Akun</h2><p class="mt-2 text-sm text-blue-50">Panel khusus untuk mengatur backup lokal, memeriksa akses akun, dan meninjau riwayat aktivitas.</p></div></div></div>'+
  '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">'+
  '<section class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-indigo-600 shadow-sm"><h3 class="font-bold text-lg mb-2 text-slate-800 dark:text-white">⏱️ Jadwal Backup Otomatis</h3><p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Snapshot disimpan di browser/perangkat ini saat aplikasi terbuka. Agar data tetap aman jika perangkat rusak, unduh juga file JSON dan simpan di lokasi lain.</p><label class="block text-sm mb-1" for="gsBackupEvery">Frekuensi backup lokal</label><select id="gsBackupEvery" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option value="60">Setiap 1 jam</option><option value="360">Setiap 6 jam</option><option value="720">Setiap 12 jam</option><option value="1440">Setiap 24 jam</option></select><div class="flex flex-col sm:flex-row gap-2 mt-3"><button onclick="gsSaveBackupSchedule()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex-1">Simpan Jadwal</button><button onclick="gsBackupSnapshot(\'manual\')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex-1">Buat Backup Sekarang</button></div><button onclick="gsDownloadLocalSnapshot()" class="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Unduh Backup Lokal Terakhir</button><div id="gsBackupStatus" class="text-sm mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200">Memeriksa status backup…</div><p class="text-xs text-amber-700 dark:text-amber-300 mt-3">Catatan: backup terjadwal berjalan hanya ketika aplikasi/browser aktif. Backup otomatis di server memerlukan konfigurasi server terpisah.</p></section>'+
  '<section class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-blue-600 shadow-sm"><h3 class="font-bold text-lg mb-2 text-slate-800 dark:text-white">📜 Riwayat Aktivitas</h3><p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Lihat perubahan dan aktivitas yang tercatat pada browser/perangkat ini. Riwayat lokal bukan audit log server dan tidak otomatis tersinkron antarperangkat.</p><div class="space-y-3"><button onclick="gsShowAuditHistory()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-semibold">Lihat Riwayat Perubahan</button><button onclick="gsExportAuditHistory()" class="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-3 rounded-lg text-sm font-semibold">Ekspor Riwayat ke JSON</button></div><div class="mt-4 rounded-lg bg-blue-50 dark:bg-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300">Riwayat dibatasi hingga 500 aktivitas terakhir di browser ini.</div></section>'+
  '<section class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-600 shadow-sm lg:col-span-2"><h3 class="font-bold text-lg mb-2 text-slate-800 dark:text-white">🔐 Pemeriksaan Keamanan Akun</h3><p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Periksa sesi login, kecocokan profil akun, dan akses baca database sebelum melakukan pemulihan data atau perubahan penting.</p><div class="flex flex-col sm:flex-row gap-3"><button onclick="gsCheckAccountAccess()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-sm font-semibold">Periksa Akses Akun</button><button onclick="gsTestWriteAccess()" class="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-lg text-sm font-semibold">Uji Izin Tulis Database</button></div><p class="text-xs text-amber-700 dark:text-amber-300 mt-4">Hak akses tulis tetap ditentukan oleh kebijakan RLS Supabase. Jangan membagikan file backup karena dapat berisi data pribadi siswa dan sekolah.</p></section>'+
  '</div></div>';
  document.getElementById('content').innerHTML=html;
  var be=document.getElementById('gsBackupEvery');if(be){be.value=localStorage.getItem('gs_backup_every_'+currentUser.id)||'360';gsFormatBackupStatus();}
}

async function saveSchoolProfileData(profileId){var data={name:document.getElementById('p_name').value,address:document.getElementById('p_address').value,principal:document.getElementById('p_principal').value,principal_nip:document.getElementById('p_principal_nip').value};var s=await saveSchoolProfile(data,profileId||null);if(s)renderSettings();}
async function saveSchoolProfile(data,id){try{var result;if(id){result=await sb.from('school_profile').update(data).eq('id',id).eq('user_id',currentUser.id).select();}else{result=await sb.from('school_profile').insert([{...data,user_id:currentUser.id}]).select();}if(result.error){showToast('Gagal menyimpan profil: '+result.error.message,'error');return false;}if(!result.data||!result.data.length){showToast('Data tidak tersimpan. Kebijakan RLS tabel school_profile menolak perubahan atau profil tidak cocok dengan akun ini.','error');return false;}try{gsInvalidateProfilCache();}catch(eGIC1){}showToast('Profil disimpan!','success');return true;}catch(err){showToast('Gagal menyimpan profil: '+(err?.message||String(err)),'error');return false;}}
/* ===== BACKUP LOKAL, AUDIT LOKAL & PEMERIKSAAN AKSES ===== */
window.gsAudit=function(action,table,recordId,detail){
  try{
    var key='gs_audit_'+(currentUser&&currentUser.id||'anon');
    var arr=JSON.parse(localStorage.getItem(key)||'[]');
    arr.unshift({at:new Date().toISOString(),user_id:(currentUser&&currentUser.id)||'',email:(currentUser&&currentUser.email)||'',action:String(action||''),table:String(table||''),record_id:String(recordId||''),detail:String(detail||'').slice(0,240)});
    localStorage.setItem(key,JSON.stringify(arr.slice(0,500)));
  }catch(e){console.warn('Riwayat lokal tidak dapat disimpan:',e);}
};
window.gsAuditRead=function(){try{return JSON.parse(localStorage.getItem('gs_audit_'+(currentUser&&currentUser.id||'anon'))||'[]');}catch(e){return[];}};
window.gsShowAuditHistory=function(){
  var a=window.gsAuditRead();
  var body=a.slice(0,100).map(function(x){return '<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0;white-space:nowrap">'+gsImpEsc(new Date(x.at).toLocaleString())+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+gsImpEsc(x.action)+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0">'+gsImpEsc(x.table)+'</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;word-break:break-all">'+gsImpEsc(x.record_id)+'</td></tr>';}).join('');
  openModal('Riwayat Perubahan (Perangkat Ini)','<p class="text-xs text-slate-500 mb-3">Menampilkan maksimal 100 dari 500 aktivitas terakhir yang tercatat di browser ini.</p><div class="overflow-auto max-h-[55vh]"><table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px">Waktu</th><th style="text-align:left;padding:6px">Aksi</th><th style="text-align:left;padding:6px">Tabel</th><th style="text-align:left;padding:6px">ID</th></tr></thead><tbody>'+(body||'<tr><td colspan="4" style="padding:12px">Belum ada riwayat.</td></tr>')+'</tbody></table></div><button onclick="closeModal()" class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Tutup</button>');
};
window.gsExportAuditHistory=function(){var data=window.gsAuditRead();var blob=new Blob([JSON.stringify({_meta:{app:'GURU SMART AUDIT LOKAL',exported_at:new Date().toISOString(),user:(currentUser&&currentUser.email)||''},events:data},null,2)],{type:'application/json'});var u=URL.createObjectURL(blob);var a=document.createElement('a');a.href=u;a.download='Riwayat_Guru_Smart_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(u);},3000);window.gsAudit('AUDIT_EXPORT','local_audit','',data.length+' aktivitas');};
window.gsBackupTables=['students','teachers','classes','subjects','schedules','attendance','grades','assignments','materi','keuangan','announcements','activity_attendance','activity_records','kurikulum','kuis_kelas','piket','school_profile'];
window.gsBuildBackupObject=async function(){
  var chk=await window.gsEnsureAuthSession();if(!chk.ok)throw new Error(chk.msg);
  var access=await sb.from('users').select('id,role,is_premium').eq('id',currentUser.id).maybeSingle();
  if(access.error||!access.data||access.data.id!==currentUser.id)throw new Error('Akun tidak dapat diverifikasi di tabel users. Backup dibatalkan demi keamanan.');
  var d={_meta:{app:'GURU SMART',schema_version:2,exported_at:new Date().toISOString(),user:(currentUser.email||''),user_id:currentUser.id,counts:{}}};var total=0;
  for(var i=0;i<window.gsBackupTables.length;i++){var t=window.gsBackupTables[i];var r=await sb.from(t).select('*').eq('user_id',currentUser.id);if(r.error)throw new Error('Backup dihentikan: tabel '+t+' gagal dibaca ('+r.error.message+'). Tidak akan membuat backup parsial.');d[t]=r.data||[];d._meta.counts[t]=d[t].length;total+=d[t].length;}
  d._meta.total_rows=total;return d;
};
window.gsIdbOpen=function(){return new Promise(function(resolve,reject){if(!window.indexedDB){reject(new Error('IndexedDB tidak tersedia'));return;}var q=indexedDB.open('GuruSmartBackupDB',1);q.onupgradeneeded=function(){var db=q.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots');};q.onsuccess=function(){resolve(q.result);};q.onerror=function(){reject(q.error||new Error('Gagal membuka IndexedDB'));};});};
window.gsIdbSet=async function(k,v){var db=await gsIdbOpen();return new Promise(function(resolve,reject){var tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(v,k);tx.oncomplete=function(){db.close();resolve(true);};tx.onerror=function(){db.close();reject(tx.error||new Error('Gagal menyimpan snapshot'));};});};
window.gsIdbGet=async function(k){var db=await gsIdbOpen();return new Promise(function(resolve,reject){var tx=db.transaction('snapshots','readonly'),q=tx.objectStore('snapshots').get(k);q.onsuccess=function(){db.close();resolve(q.result||null);};q.onerror=function(){db.close();reject(q.error||new Error('Gagal membaca snapshot'));};});};
window.gsBackupKey=function(){return 'backup_'+(currentUser&&currentUser.id||'anon');};
window.gsFormatBackupStatus=function(){var el=document.getElementById('gsBackupStatus');if(!el)return;var id=currentUser&&currentUser.id||'';var last=localStorage.getItem('gs_backup_last_'+id);var every=Number(localStorage.getItem('gs_backup_every_'+id)||360);var next=last?new Date(new Date(last).getTime()+every*60000):null;el.textContent='Backup lokal terakhir: '+(last?new Date(last).toLocaleString():'Belum pernah')+' · Jadwal: setiap '+(every>=60?(every/60)+' jam':every+' menit')+(next?' · Berikutnya sekitar '+next.toLocaleString():' · Backup pertama akan dibuat saat jadwal dijalankan.')+' · Simpan juga file JSON di luar perangkat secara berkala.';};
window.gsSaveBackupSchedule=function(){var id=currentUser&&currentUser.id;if(!id)return showToast('Login diperlukan.','error');var sel=document.getElementById('gsBackupEvery');var mins=Number(sel&&sel.value||360);localStorage.setItem('gs_backup_every_'+id,String(mins));gsAudit('BACKUP_SCHEDULE_SET','settings','',mins+' menit');gsBackupSchedulerStart();gsFormatBackupStatus();showToast('Jadwal backup lokal disimpan. Pastikan aplikasi tetap terbuka agar berjalan.','success');};
window.gsBackupSnapshot=async function(reason){if(!currentUser||!currentUser.id)return;var now=Date.now();if(window.__gsBackupRunning)return;window.__gsBackupRunning=true;try{var data=await gsBuildBackupObject();data._meta.backup_reason=reason||'jadwal';await gsIdbSet(gsBackupKey(),data);var ts=new Date().toISOString();localStorage.setItem('gs_backup_last_'+currentUser.id,ts);gsAudit('BACKUP_LOCAL_SUCCESS','backup','',data._meta.total_rows+' baris; '+(reason||'jadwal'));gsFormatBackupStatus();if(reason==='manual')showToast('Snapshot backup lokal berhasil disimpan ('+data._meta.total_rows+' baris).','success');}catch(e){gsAudit('BACKUP_LOCAL_FAILED','backup','',e.message||String(e));if(reason==='manual')showToast('Backup gagal: '+(e.message||e),'error');else console.warn('Backup terjadwal gagal:',e);}finally{window.__gsBackupRunning=false;}};
window.gsBackupSchedulerStart=function(){if(window.__gsBackupTimer)clearInterval(window.__gsBackupTimer);if(!currentUser||!currentUser.id)return;var id=currentUser.id;var mins=Number(localStorage.getItem('gs_backup_every_'+id)||360);var last=localStorage.getItem('gs_backup_last_'+id);if(!last){window.gsBackupSnapshot('awal');}else if(Date.now()-new Date(last).getTime()>=mins*60000){window.gsBackupSnapshot('terjadwal');}window.__gsBackupTimer=setInterval(function(){if(document.visibilityState==='visible'){var l=localStorage.getItem('gs_backup_last_'+id);if(!l||Date.now()-new Date(l).getTime()>=mins*60000)window.gsBackupSnapshot('terjadwal');}},Math.max(60000,Math.min(mins*60000,300000)));window.addEventListener('focus',function(){var l=localStorage.getItem('gs_backup_last_'+id);if(!l||Date.now()-new Date(l).getTime()>=mins*60000)window.gsBackupSnapshot('terjadwal');});};
window.gsDownloadLocalSnapshot=async function(){try{var d=await gsIdbGet(gsBackupKey());if(!d){showToast('Belum ada snapshot. Buat snapshot sekarang dahulu.','info');await gsBackupSnapshot('manual');d=await gsIdbGet(gsBackupKey());}if(!d)throw new Error('Snapshot tidak tersedia.');var b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='Backup_Guru_Smart_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(u);},4000);gsAudit('BACKUP_DOWNLOAD','backup','',d._meta.total_rows+' baris');}catch(e){showToast('Gagal mengambil backup lokal: '+(e.message||e),'error');}};
window.gsCheckAccountAccess=async function(){showToast('Memeriksa akun, sesi, dan akses database…','info');try{var c=await window.gsEnsureAuthSession();if(!c.ok)throw new Error(c.msg);var auth=await sb.auth.getUser();var q=await sb.from('users').select('id,role,name').eq('id',auth.data.user.id).maybeSingle();if(q.error)throw new Error('Gagal membaca profil hak akses: '+q.error.message);if(!q.data||q.data.id!==auth.data.user.id)throw new Error('Profil akun tidak ditemukan atau tidak cocok.');var probe=await sb.from('students').select('id',{count:'exact',head:true}).eq('user_id',auth.data.user.id);if(probe.error)throw new Error('Akses baca data siswa ditolak: '+probe.error.message);currentUser.role=q.data.role||currentUser.role;gsAudit('ACCESS_CHECK_OK','users',auth.data.user.id,'role='+currentUser.role);openModal('Pemeriksaan Akses Akun','<div class="space-y-2 text-sm"><p class="text-emerald-700 font-bold">✓ Sesi Supabase valid</p><p>Identitas: '+gsImpEsc(auth.data.user.email||'')+'</p><p>ID akun: <code>'+gsImpEsc(auth.data.user.id)+'</code></p><p>Peran dari database: <b>'+gsImpEsc(currentUser.role)+'</b></p><p class="text-emerald-700">✓ Profil akun ditemukan dan pembacaan data sesuai akun berhasil.</p><p class="text-amber-700">Catatan: akses tulis per tabel tetap bergantung pada kebijakan RLS Supabase.</p></div><button onclick="closeModal()" class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Tutup</button>');}catch(e){gsAudit('ACCESS_CHECK_FAILED','users',currentUser&&currentUser.id||'',e.message||String(e));openModal('Pemeriksaan Akses Akun','<p class="text-red-600 font-semibold">Pemeriksaan gagal</p><p class="text-sm mt-2">'+gsImpEsc(e.message||String(e))+'</p><p class="text-sm mt-2">Jangan lanjutkan restore/hapus data sampai sesi dan kebijakan akses diperbaiki.</p><button onclick="closeModal()" class="mt-4 w-full bg-slate-600 text-white px-4 py-2 rounded-lg">Tutup</button>');}};
/* ===== AKHIR BACKUP & KEAMANAN ===== */

async function exportAllDataJSON(){
  try{
    showToast('Memeriksa akun dan mengumpulkan data backup…','info');
    var backupData=await window.gsBuildBackupObject();
    if(!backupData._meta.total_rows){showToast('Tidak ada data untuk diekspor. Tidak membuat file kosong.','error');return;}
    var dataStr=JSON.stringify(backupData,null,2);var blob=new Blob([dataStr],{type:'application/json'});var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='Backup_Guru_Smart_'+new Date().toISOString().split('T')[0]+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){try{URL.revokeObjectURL(url);}catch(e){}},4000);
    localStorage.setItem('gs_backup_last_'+currentUser.id,new Date().toISOString());
    try{await gsIdbSet(gsBackupKey(),backupData);}catch(eI){}
    gsAudit('BACKUP_DOWNLOAD_SUCCESS','backup','',backupData._meta.total_rows+' baris');gsFormatBackupStatus();
    showToast('Backup lengkap berhasil dibuat: '+backupData._meta.total_rows+' baris.','success');
  }catch(e){gsAudit('BACKUP_DOWNLOAD_FAILED','backup','',e.message||String(e));showToast('Backup dibatalkan agar tidak menghasilkan file parsial: '+(e.message||e),'error');}
}
window.gsIdMap={};
window.gsUuid=function(){
  try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();}catch(eU){}
  var b=new Uint8Array(16);
  if(window.crypto&&crypto.getRandomValues){crypto.getRandomValues(b);}else{for(var i0=0;i0<16;i0++)b[i0]=Math.floor(Math.random()*256);}
  b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;
  var h=[];for(var j0=0;j0<16;j0++)h.push((b[j0]+0x100).toString(16).slice(1));
  return h.slice(0,4).join('')+'-'+h.slice(4,6).join('')+'-'+h.slice(6,8).join('')+'-'+h.slice(8,10).join('')+'-'+h.slice(10,16).join('');
};
window.gsUpsertRowSmart=async function(t,row){
  var r1=await window.gsUpsertChunk(t,[row]);
  if(r1.ok)return{ok:true,returned:r1.returned,remapped:false};
  if(!r1.rls)return{ok:false,err:r1.err,rls:false};
  if(row.id){
    var nr=Object.assign({},row);delete nr.id;
    var r2=await window.gsUpsertChunk(t,[nr]);
    if(r2.ok){if(r2.first)window.gsIdMap[String(row.id)]=r2.first;return{ok:true,returned:r2.returned,remapped:true};}
    return{ok:false,err:r2.err,rls:true};
  }
  return{ok:false,err:r1.err,rls:true};
};
window.gsUpsertChunk=async function(t,rows){
  var cur=rows;
  for(var attempt=0;attempt<5;attempt++){
    var res=await sb.from(t).upsert(cur,{onConflict:'id'}).select();
    if(!res.error)return{ok:true,expected:cur.length,returned:(res.data&&res.data.length)||0,first:(res.data&&res.data[0]&&res.data[0].id)||null};
    var m=String(res.error.message||'');
    var mc=m.match(/Could not find the '([^']+)' column of '([^']+)'/i)||m.match(/column \"?([a-zA-Z0-9_]+)\"? of relation/i);
    if(mc&&mc[1]){var col=mc[1];cur=cur.map(function(r){var c=Object.assign({},r);delete c[col];return c;});continue;}
    var rls=String(res.error.code||'')==='42501'||/row-level security/i.test(m);
    return{ok:false,err:m+(res.error.code?' ['+res.error.code+']':''),rls:rls};
  }
  return{ok:false,err:'Tabel '+t+' menolak data (kolom tidak cocok setelah 5 percobaan).'};
};
window.gsImportTable=async function(t,rows){
  var clean=rows.map(function(r){
    if(!r||typeof r!=='object'||Array.isArray(r))return null;
    var c={};for(var k in r){if(k.charAt(0)!=='_')c[k]=r[k];}
    for(var k2 in c){if(k2!=='id'&&/_id$/.test(k2)&&c[k2]!=null&&window.gsIdMap[String(c[k2])])c[k2]=window.gsIdMap[String(c[k2])];}
    c.user_id=currentUser.id;return c;
  }).filter(function(x){return x;});
  var ok=0,fail=0,err='',anyRls=false,blind=0,remapped=0;
  var CHUNK=80;
  for(var i=0;i<clean.length;i+=CHUNK){
    var chunk=clean.slice(i,i+CHUNK);
    var at=await window.gsUpsertChunk(t,chunk);
    if(at.ok){ok+=chunk.length;if((at.returned||0)<chunk.length)blind+=chunk.length-(at.returned||0);continue;}
    if(at.rls)anyRls=true;
    if(!err)err=at.err;
    for(var j=0;j<chunk.length;j++){
      var one=await window.gsUpsertRowSmart(t,chunk[j]);
      if(one.ok){ok++;if(!(one.returned>0))blind++;if(one.remapped)remapped++;}
      else{fail++;if(one.rls)anyRls=true;if(one.err&&!err)err=one.err;}
    }
  }
  return{ok:ok,fail:fail,err:err,rls:anyRls,blind:blind,remapped:remapped,total:clean.length};
};
window.gsImpEsc=function(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
window.gsShowImportSummary=function(results,verify,importedTotal,failTables,metaInfo,rlsFlag,anyBlind,anyRemap){
  var rowsHtml='';
  results.forEach(function(r){
    var vrec='-';
    for(var i=0;i<verify.length;i++){if(verify[i].t===r.t){vrec=verify[i].count;break;}}
    var bad=r.fail>0;
    rowsHtml+='<tr>'
      +'<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;white-space:nowrap">'+window.gsImpEsc(r.t)+'</td>'
      +'<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">'+r.ok+'</td>'
      +'<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">'+(bad?'<span style="color:#dc2626;font-weight:800">'+r.fail+'</span>':'0')+'</td>'
      +'<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">'+vrec+'</td>'
      +'<td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#64748b">'+(bad?(r.rls?'<span style="color:#b45309;font-weight:700">Ditolak kebijakan RLS (42501) — lihat panduan di bawah.</span>':window.gsImpEsc(String(r.err||'').substring(0,140))):(r.blind>0?'<span style="color:#b45309;font-weight:700">'+r.blind+' baris tersimpan tetapi tidak terbaca — policy SELECT RLS bermasalah.</span>':(r.remapped>0?'<span style="color:#0369a1">'+r.remapped+' baris disimpan dengan ID baru (pemetaan otomatis).</span>':'')))+'</td>'
      +'</tr>';
  });
  var metaHtml=metaInfo?'<p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Info file: '+window.gsImpEsc(metaInfo)+'</p>':'';
  openModal('📥 Ringkasan Restore Data',
    '<div class="space-y-3">'
    +metaHtml
    +'<div class="bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">Total baris berhasil diimpor: <b>'+importedTotal+'</b>'+(failTables?' &bull; <b style="color:#dc2626">'+failTables+' tabel bermasalah</b>':' &bull; Semua tabel sukses ✅')+'</div>'
    +(anyBlind>0?'<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200"><b>⚠️ '+anyBlind+' baris TERSIMPAN tetapi TIDAK TERBACA kembali.</b> Inilah kenapa data tidak muncul: kebijakan SELECT (USING) RLS tabel belum benar — tulis lolos, baca ditolak. Salin &amp; jalankan SQL perbaikan di bawah, muat ulang halaman, lalu cek data.</div>':'')
    +(anyRemap>0?'<div class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg p-3 text-sm text-sky-800 dark:text-sky-200"><b>ℹ️ '+anyRemap+' baris disimpan dengan ID BARU.</b> ID lama pada file backup ternyata masih dipakai baris lama yang TIDAK terlihat oleh akun ini (sisa data akun sebelumnya) — karena itu upsert ditolak RLS. Solusi otomatis: baris disimpan sebagai baris baru dengan ID segar &amp; semua referensi antar tabel dipetakan ulang. Klik <b>Muat Ulang &amp; Tampilkan Data</b> untuk melihat hasilnya.</div>':'')
    +(!failTables&&!(anyBlind>0)&&importedTotal>0?'<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 text-sm text-emerald-800 dark:text-emerald-200"><b>✅ Data sudah tersimpan &amp; terbaca di database.</b> Klik tombol hijau <b>Muat Ulang &amp; Tampilkan Data</b> di bawah — semua halaman akan menampilkan data terbaru.</div>':'')
    +'<div class="overflow-x-auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr style="background:#f1f5f9">'
    +'<th style="padding:7px 10px;text-align:left">Tabel</th><th style="padding:7px 10px">Berhasil</th><th style="padding:7px 10px">Gagal</th><th style="padding:7px 10px">Isi DB Sekarang</th><th style="padding:7px 10px;text-align:left">Pesan Error</th>'
    +'</tr></thead><tbody>'+rowsHtml+'</tbody></table></div>'
    +'<p class="text-xs text-slate-500 dark:text-slate-400">"Isi DB Sekarang" = jumlah baris milik akun Anda yang TERBACA di database saat ini. Bila impor tertulis berhasil tapi angka ini 0, policy SELECT RLS tabel bermasalah atau tabel belum dibuat — gunakan SQL perbaikan di bawah. Bila angka sudah benar tetapi halaman aplikasi masih kosong, klik tombol <b>Muat Ulang &amp; Tampilkan Data</b>.</p>'
    +((rlsFlag||anyBlind>0)?window.gsRlsHelpHtml():'')
    +'<button onclick="location.reload()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-2">🔄 Muat Ulang &amp; Tampilkan Data</button>'
    +'<button onclick="closeModal()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Tutup</button>'
    +'</div>');
};
window.gsEnsureAuthSession=async function(){
  try{
    var s=await sb.auth.getSession();
    if(!s||!s.data||!s.data.session)return{ok:false,msg:'Sesi login Supabase tidak ditemukan. Silakan keluar (logout), login kembali, lalu restore ulang.'};
    try{await sb.auth.refreshSession();}catch(eR){}
    var gu=await sb.auth.getUser();
    if(gu&&gu.error)return{ok:false,msg:'Sesi login tidak valid (token kedaluwarsa): '+gu.error.message+'. Keluar lalu login ulang.'};
    if(!gu||!gu.data||!gu.data.user)return{ok:false,msg:'Sesi login tidak valid. Keluar (logout) lalu login ulang sebelum restore.'};
    if(currentUser&&gu.data.user.id&&currentUser.id!==gu.data.user.id)currentUser.id=gu.data.user.id;
    return{ok:true};
  }catch(e){return{ok:false,msg:'Gagal memeriksa sesi login: '+((e&&e.message)||e)};}
};
window.gsRlsProbe=async function(){
  try{
    if(!currentUser||!currentUser.id)return{blocked:false};
    var ins=await sb.from('school_profile').insert([{user_id:currentUser.id,name:'__GSPROBE__'+Date.now()}]).select('id');
    if(ins.error){
      var m=String(ins.error.message||'');
      if(String(ins.error.code||'')==='42501'||/row-level security/i.test(m))return{blocked:true,msg:m+(ins.error.code?' ['+ins.error.code+']':'')};
      return{blocked:false};
    }
    var pid=(ins.data&&ins.data[0]&&ins.data[0].id)||null;
    if(pid){try{await sb.from('school_profile').delete().eq('id',pid).eq('user_id',currentUser.id);}catch(eD){}}
    return{blocked:false};
  }catch(e){return{blocked:false};}
};
window.gsRlsSqlText=function(){
  var tabs=['school_profile','teachers','subjects','classes','students','schedules','attendance','grades','assignments','materi','keuangan','announcements','activity_attendance','activity_records','kurikulum','kuis_kelas','piket','users'];
  var sql='-- Perbaikan kebijakan RLS GURU SMART\n-- Jalankan di Supabase > SQL Editor. Bila ada tabel yang belum dibuat, jalankan per blok.\n-- Bila masih ditolak, hapus kebijakan lama lainnya di Authentication > Policies.\n\n';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i];var col=(t==='users')?'id':'user_id';
    sql+='alter table '+t+' enable row level security;\n';
    sql+='drop policy if exists "'+t+'_user_all" on '+t+';\n';
    sql+='create policy "'+t+'_user_all" on '+t+' for all to authenticated\n  using (auth.uid() = '+col+') with check (auth.uid() = '+col+');\n\n';
  }
  return sql;
};
window.gsRlsHelpHtml=function(){
  return '<div class="mt-3 border border-amber-300 dark:border-amber-600 rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">'
    +'<p class="font-bold text-amber-800 dark:text-amber-200 mb-1">Panduan memperbaiki penolakan RLS (42501):</p>'
    +'<ol class="list-decimal ml-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">'
    +'<li><b>Keluar (logout) lalu login kembali</b> — sesi/token kedaluwarsa membuat auth.uid() kosong, lalu restore ulang.</li>'
    +'<li><b>Perbaiki kebijakan tabel:</b> buka Supabase &rarr; SQL Editor, salin &amp; jalankan SQL di bawah, muat ulang halaman, lalu restore ulang.</li>'
    +'</ol>'
    +'<pre id="gsRlsSqlText" class="mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg overflow-auto text-[10px] leading-relaxed max-h-56 text-slate-700 dark:text-slate-200">'+window.gsImpEsc(window.gsRlsSqlText())+'</pre>'
    +'<button onclick="gsCopyRlsSql(this)" class="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">📋 Salin SQL Perbaikan</button>'
    +'</div>';
};
window.gsCopyRlsFallback=function(txt,done){try{var ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);done();}catch(e){showToast('Gagal menyalin. Silakan blok manual teks SQL di kotak.','error');}};
window.gsCopyRlsSql=function(btn){
  var el=document.getElementById('gsRlsSqlText');if(!el)return;
  var txt=el.textContent||'';
  var done=function(){if(btn){var old=btn.innerHTML;btn.innerHTML='✓ SQL tersalin!';setTimeout(function(){try{btn.innerHTML=old;}catch(eB){}},2500);}showToast('SQL perbaikan tersalin! Tempel di Supabase → SQL Editor → Run.','success');};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done).catch(function(){window.gsCopyRlsFallback(txt,done);});}
  else window.gsCopyRlsFallback(txt,done);
};
window.gsShowRlsHelp=function(t,msg,aborted){
  openModal('🔒 Restore Ditolak Keamanan Database (RLS)',
    '<div class="text-sm text-slate-600 dark:text-slate-300 space-y-2">'
    +(aborted?'<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-amber-800 dark:text-amber-200"><b>Proses restore dihentikan lebih awal.</b> Database pasti akan menolak semua baris, jadi tidak ada data yang diimpor. Perbaiki dulu penyebabnya di bawah.</div>':'')
    +'<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-200">'
    +(t?('Uji tulis pada tabel <b>'+window.gsImpEsc(t)+'</b> ditolak. '):'')
    +'Pesan database: <code class="text-xs">'+window.gsImpEsc(msg||'new row violates row-level security policy (USING expression)')+'</code></div>'
    +'<p>Ini <b>bukan berarti file backup rusak</b> — kebijakan Row Level Security (RLS) Supabase menolak penambahan baris. Setiap baris restore sudah otomatis diberi <code>user_id</code> akun Anda, jadi penyebabnya salah satu dari dua hal berikut:</p>'
    +window.gsRlsHelpHtml()
    +'<button onclick="closeModal()" class="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Tutup</button>'
    +'</div>');
};
window.gsTestWriteAccess=async function(){
  showToast('Memeriksa sesi & izin tulis database...','info');
  var chk=await window.gsEnsureAuthSession();
  if(!chk.ok){window.gsShowRlsHelp('',chk.msg,true);return;}
  var probe=await window.gsRlsProbe();
  if(probe&&probe.blocked){window.gsShowRlsHelp('school_profile',probe.msg,false);return;}
  showToast('Sesi login valid & izin tulis database NORMAL ✅ Silakan restore lagi. Bila tabel lain masih gagal, jalankan SQL perbaikan di panduan RLS.','success');
};
window.gsRestoreProgress=function(percent,message,detail){
  percent=Math.max(0,Math.min(100,Math.round(Number(percent)||0)));
  var safe=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var html='<div class="space-y-4">'+
    '<div class="flex items-center justify-between"><span class="text-sm font-semibold text-slate-700 dark:text-slate-200">'+safe(message||'Memulihkan data...')+'</span><strong class="text-xl text-blue-600" id="gsRestorePercent">'+percent+'%</strong></div>'+
    '<div class="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><div id="gsRestoreProgressBar" class="h-full rounded-full transition-all duration-300 bg-blue-600" style="width:'+percent+'%"></div></div>'+
    '<p class="text-xs text-slate-500 dark:text-slate-400" id="gsRestoreDetail">'+safe(detail||'Mohon jangan tutup halaman sampai proses selesai.')+'</p>'+
    '<p class="text-xs text-amber-700 dark:text-amber-300">Jangan muat ulang halaman atau memutus koneksi selama restore berlangsung.</p></div>';
  var container=document.getElementById('modalContainer');
  if(!container||container.classList.contains('hidden'))openModal('⏳ Memulihkan Data — Mohon Tunggu',html);
  else {
    document.getElementById('modalTitle').innerText='⏳ Memulihkan Data — Mohon Tunggu';
    var content=document.getElementById('modalContent');
    if(!document.getElementById('gsRestorePercent'))content.innerHTML=html;
    else {
      document.getElementById('gsRestorePercent').innerText=percent+'%';
      document.getElementById('gsRestoreProgressBar').style.width=percent+'%';
      document.getElementById('gsRestoreProgressBar').parentElement.setAttribute('aria-valuenow',String(percent));
      document.getElementById('gsRestoreDetail').innerText=detail||'Mohon jangan tutup halaman sampai proses selesai.';
      var label=content.querySelector('.flex.items-center span');if(label)label.innerText=message||'Memulihkan data...';
    }
  }
};
window.importAllDataJSON=function(event){
  var file=event.target.files[0];if(!file)return;
  var restoreProgressStarted=false;
  var reader=new FileReader();
  reader.onload=async function(e){
    try{
      var data=JSON.parse(e.target.result);
      if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('File bukan backup JSON GURU SMART yang valid.');
      var allowed=window.gsBackupTables.slice();
      if(data._meta&&data._meta.app&&String(data._meta.app).indexOf('GURU SMART')!==0)throw new Error('Nama aplikasi pada file backup tidak dikenali.');
      var tables=Object.keys(data).filter(function(k){return k.charAt(0)!=='_'&&Array.isArray(data[k]);});
      if(!tables.length)throw new Error('Tidak ada tabel data di file backup.');
      var unknown=tables.filter(function(t){return allowed.indexOf(t)<0;});
      if(unknown.length)throw new Error('File memuat tabel yang tidak dikenal: '+unknown.join(', ')+'. Restore dihentikan untuk mencegah penulisan tak terduga.');
      var totalRows=0;tables.forEach(function(t){if(!Array.isArray(data[t]))throw new Error('Struktur tabel tidak valid: '+t);data[t].forEach(function(row,idx){if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Baris tidak valid pada '+t+' nomor '+(idx+1));});totalRows+=(data[t]||[]).length;});
      if(!totalRows)throw new Error('File backup KOSONG (0 baris). Tidak ada data yang akan dipulihkan.');
      var meta=data._meta||{};
      var metaInfo=[meta.app,meta.exported_at?('diexport '+meta.exported_at):'',meta.user?('oleh '+meta.user):''].filter(Boolean).join(' • ');
      var chk=await window.gsEnsureAuthSession();
      if(!chk.ok){showToast('Restore dibatalkan: '+chk.msg,'error');window.gsShowRlsHelp('',chk.msg,true);return;}
      var authCheck=await sb.from('users').select('id,role').eq('id',currentUser.id).maybeSingle();
      if(authCheck.error||!authCheck.data||authCheck.data.id!==currentUser.id)throw new Error('Akun tidak berhasil diverifikasi pada tabel users. Restore dihentikan.');
      var tableSummary=tables.map(function(t){return t+': '+data[t].length;}).join('\n');
      var sourceUser=meta.user||meta.user_id||'tidak tercantum';
      var okRestore=confirm('KONFIRMASI RESTORE BACKUP\n\nFile: '+(file.name||'backup.json')+'\nSumber: '+sourceUser+'\nTotal baris: '+totalRows+'\n\n'+tableSummary+'\n\nRestore akan melakukan upsert dan dapat menimpa data yang memiliki ID sama pada akun Anda. Buat backup terkini sebelum lanjut. Lanjutkan?');
      if(!okRestore){gsAudit('RESTORE_CANCELLED','backup',file.name||'','Pengguna membatalkan setelah pratinjau');showToast('Restore dibatalkan; tidak ada data yang diimpor.','info');return;}
      restoreProgressStarted=true;window.gsRestoreProgress(0,'Menyiapkan pemulihan data...','Memulai restore dengan aman.');
      showToast('Membuat snapshot data saat ini sebelum restore…','info');
      try{var preRestore=await window.gsBuildBackupObject();preRestore._meta.backup_reason='sebelum-restore';await window.gsIdbSet(window.gsBackupKey(),preRestore);localStorage.setItem('gs_backup_last_'+currentUser.id,new Date().toISOString());gsAudit('PRE_RESTORE_SNAPSHOT_SUCCESS','backup',file.name||'',preRestore._meta.total_rows+' baris');gsFormatBackupStatus();}
      catch(preErr){gsAudit('PRE_RESTORE_SNAPSHOT_FAILED','backup',file.name||'',preErr.message||String(preErr));throw new Error('Restore dihentikan karena snapshot pengaman sebelum restore gagal: '+(preErr.message||preErr)+'. Tidak ada data yang diimpor.');}
      window.gsRestoreProgress(5,'Membuat snapshot pengaman...','Menyimpan salinan data saat ini sebelum restore.');
      gsAudit('RESTORE_STARTED','backup',file.name||'',totalRows+' baris; sumber '+sourceUser);
      window.gsRestoreProgress(10,'Memeriksa izin database...','Memastikan sesi dan izin tulis tersedia.');
      showToast('Memeriksa izin tulis database...','info');
      var probe=await window.gsRlsProbe();
      if(probe&&probe.blocked){closeModal();window.gsShowRlsHelp('school_profile',probe.msg,true);return;}
      var ORDER=['school_profile','teachers','subjects','classes','students','schedules','piket','attendance','grades','assignments','materi','keuangan','announcements','kurikulum','kuis_kelas','activity_attendance','activity_records'];
      tables.sort(function(a,b){var ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);if(ia<0)ia=99;if(ib<0)ib=99;return ia-ib;});
      window.gsRestoreProgress(12,'Mengimpor data...','0 dari '+totalRows+' baris diproses.');
      showToast('Mengimpor '+totalRows+' baris... mohon tunggu, jangan tutup halaman.','info');
      window.gsIdMap={};
      var results=[],importedTotal=0,failTables=0;
      for(var i=0;i<tables.length;i++){
        var t=tables[i];
        var rows=data[t];
        // Pastikan relasi absensi kegiatan menunjuk ke ID kegiatan dan siswa yang benar,
        // termasuk ketika backup dipulihkan ke akun/database lain dengan ID yang berbeda.
        if(t==='activity_records' && Array.isArray(rows)){
          try{
            var srcActs=Array.isArray(data.activity_attendance)?data.activity_attendance:[];
            var destActsRes=await sb.from('activity_attendance').select('id,title,date').eq('user_id',currentUser.id);
            if(!destActsRes.error && Array.isArray(destActsRes.data)){
              var destActs=destActsRes.data;
              srcActs.forEach(function(sa){
                if(!sa||!sa.id)return;
                if(destActs.some(function(da){return String(da.id)===String(sa.id);}))return;
                var matchAct=destActs.find(function(da){return String(da.title||'').trim().toLowerCase()===String(sa.title||'').trim().toLowerCase() && String(da.date||'')===String(sa.date||'');});
                if(matchAct)window.gsIdMap[String(sa.id)]=matchAct.id;
              });
            }
          }catch(linkActErr){console.warn('Pemetaan ID kegiatan saat restore:',linkActErr);}
          try{
            var srcStudents=Array.isArray(data.students)?data.students:[];
            var destStudentsRes=await sb.from('students').select('id,nis,name').eq('user_id',currentUser.id);
            if(!destStudentsRes.error && Array.isArray(destStudentsRes.data)){
              var destStudents=destStudentsRes.data;
              srcStudents.forEach(function(ss){
                if(!ss||!ss.id)return;
                if(destStudents.some(function(ds){return String(ds.id)===String(ss.id);}))return;
                var matchStudent=null;
                if(ss.nis!=null && String(ss.nis).trim())matchStudent=destStudents.find(function(ds){return String(ds.nis||'').trim()===String(ss.nis).trim();});
                if(!matchStudent && ss.name)matchStudent=destStudents.find(function(ds){return String(ds.name||'').trim().toLowerCase()===String(ss.name).trim().toLowerCase();});
                if(matchStudent)window.gsIdMap[String(ss.id)]=matchStudent.id;
              });
            }
          }catch(linkStudentErr){console.warn('Pemetaan ID siswa saat restore:',linkStudentErr);}
          // Normalisasi beberapa nama kolom dari backup versi lama.
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
        var importPct=12+Math.round(((i+1)/Math.max(tables.length,1))*68);
        window.gsRestoreProgress(importPct,'Mengimpor tabel '+(i+1)+' dari '+tables.length+'...','Tabel: '+t+' • '+doneRows+' dari '+totalRows+' baris telah diproses.');
      }
      var verify=[];
      for(var v=0;v<tables.length;v++){
        try{
          var c=await sb.from(tables[v]).select('id',{count:'exact',head:true}).eq('user_id',currentUser.id);
          verify.push({t:tables[v],count:(c&&c.count!=null)?c.count:'-'});
        }catch(ev){verify.push({t:tables[v],count:'-'});}
      }
      window.gsRestoreProgress(88,'Memeriksa hasil restore...','Memastikan tabel data selesai diproses.');
      var anyRls=false,anyBlind=0,anyRemap=0;
      for(var rr=0;rr<results.length;rr++){
        if(results[rr].rls&&results[rr].fail>0)anyRls=true;
        anyBlind+=results[rr].blind||0;
        anyRemap+=results[rr].remapped||0;
      }
      window.gsRestoreProgress(100,'Pemulihan selesai','Restore selesai diproses. Menampilkan ringkasan hasil...');
      window.gsShowImportSummary(results,verify,importedTotal,failTables,metaInfo,anyRls,anyBlind,anyRemap);
      gsAudit(failTables===0&&anyBlind===0?'RESTORE_SUCCESS':'RESTORE_PARTIAL','backup',file.name||'',importedTotal+' berhasil; '+failTables+' tabel bermasalah; '+anyBlind+' tidak terbaca');
      if(failTables===0&&anyBlind>0)showToast('Data tersimpan tetapi '+anyBlind+' baris TIDAK TERBACA — lihat panduan di ringkasan restore.','error');
      else if(failTables===0)showToast('Restore berhasil: '+importedTotal+' baris! Klik Muat Ulang untuk menampilkan data.','success');
      else showToast(failTables+' tabel gagal diimpor — lihat ringkasan restore.','error');
      try{navigate('dashboard');}catch(eN){}
    }catch(err){if(restoreProgressStarted){try{closeModal();}catch(closeErr){}}try{gsAudit('RESTORE_FAILED','backup',event&&event.target&&event.target.files&&event.target.files[0]&&event.target.files[0].name||'',err&&err.message||String(err));}catch(eA){}showToast('Gagal import: '+(err&&err.message?err.message:err),'error');}
    finally{try{event.target.value='';}catch(eR){}}
  };
  reader.readAsText(file);
};
async function uploadAvatar(){
  var fileInput = document.getElementById('avatarFile');
  var file = fileInput.files[0];
  var btn = document.getElementById('btnUploadAvatar');
  
  if(!file){
    showToast('Silakan pilih file foto terlebih dahulu!','error');
    return;
  }
  
  if(!file.type.startsWith('image/')){
    showToast('File harus berupa gambar.','error');
    return;
  }
  
  if(btn){
    btn.disabled = true;
    btn.innerText = 'Sedang Mengunggah...';
  }
  
  showToast('Mengunggah foto profil...','info');
  
  try {
    // Ambil ekstensi file asli agar tidak corrupt
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(ext.length > 4) ext = 'jpg'; // Fallback jika ekstensi aneh
    var fileName = 'user_'+currentUser.id+'_'+Date.now()+'.'+ext;
    
    var r = await sb.storage.from('avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
    if(r.error) throw r.error;
    
    var url = sb.storage.from('avatars').getPublicUrl(r.data.path).data.publicUrl;
    
    // Update tabel users
    var updRes = await sb.from('users').update({ avatar_url: url }).eq('id', currentUser.id);
    if(updRes.error) throw updRes.error;
    
    // Update local state & UI
    currentUser.avatar_url = url;
    localStorage.setItem('gs_currentUser', JSON.stringify(currentUser));
    
    var userAvatarEl = document.getElementById('userAvatar');
    if(userAvatarEl) userAvatarEl.src = url;
    
    var prevAvatarEl = document.getElementById('prevAvatar');
    if(prevAvatarEl) prevAvatarEl.src = url;
    
    showToast('Foto profil berhasil diperbarui!','success');
    fileInput.value = ''; // Reset input file
  } catch(err) {
    console.error('Upload Avatar Error:', err);
    showToast('Gagal upload: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    if(btn){
      btn.disabled = false;
      btn.innerText = 'Upload Foto';
    }
  }
}

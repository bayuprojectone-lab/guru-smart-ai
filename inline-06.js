
var kurikulumTypes=[
{id:'cp',label:'Capaian Pembelajaran (CP)',desc:'Kompetensi yang harus dicapai peserta didik',color:'from-blue-500 to-cyan-600',icon:'M13 10V3L4 14h7v7l9-11h-7z'},
{id:'tp',label:'Tujuan Pembelajaran (TP)',desc:'Tujuan spesifik dari setiap CP',color:'from-green-500 to-emerald-600',icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
{id:'atp',label:'Alur Tujuan Pembelajaran (ATP)',desc:'Urutan logis tujuan pembelajaran',color:'from-purple-500 to-pink-600',icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'},
{id:'modul',label:'Modul Ajar',desc:'Panduan lengkap untuk guru',color:'from-orange-500 to-red-600',icon:'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'},
{id:'rpp',label:'RPP (Rencana Pelaksanaan Pembelajaran)',desc:'Rencana kegiatan pembelajaran',color:'from-indigo-500 to-blue-700',icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
{id:'prota',label:'Program Tahunan',desc:'Program pembelajaran satu tahun',color:'from-teal-500 to-green-600',icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
{id:'lkpd',label:'LKPD (Lembar Kerja Peserta Didik)',desc:'Lembar kerja untuk siswa',color:'from-rose-500 to-pink-600',icon:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'}
];
async function renderDashboard(){
var results=await Promise.all([DB.get('students'),DB.get('teachers'),DB.get('classes'),DB.get('announcements'),DB.get('grades'),DB.get('keuangan')]);
var st=results[0],tc=results[1],cl=results[2],an=results[3],gr=results[4],kn=results[5];
var up=kn.filter(function(k){return k.status==='Belum Bayar';}).length;
var firstClass=cl[0]||null;
var classStudents=firstClass?st.filter(function(s){return s.class_id===firstClass.id;}):[];
var totalHadir=Math.round(classStudents.length*0.85);
var totalAbsen=classStudents.length-totalHadir;
var persentaseHadir=classStudents.length>0?Math.round((totalHadir/classStudents.length)*100):0;

// TAMBAHAN HARI, TANGGAL, DAN JAM
var days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var now=new Date();
var dayName=days[now.getDay()];
var dateStr=now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();

var html='<div class="space-y-6">';
html+='<div class="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-2xl shadow-xl overflow-hidden">';
html+='<div class="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -mr-20 -mt-20 z-0 pointer-events-none"></div>';
html+='<div class="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/10 rounded-full -ml-16 -mb-16 z-0 pointer-events-none"></div>';
html+='<div class="relative p-5 md:p-6 text-white z-10 flex flex-col md:flex-row items-center gap-5">';
html+='<div class="flex-1 w-full text-center md:text-left">';
html+='<div class="flex items-center gap-3 mb-3 justify-center md:justify-start">';
html+='<img src="'+AI_IMG+'" onerror="imgFallback(this)" alt="Guru Smart AI" class="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-white/30 bg-white/10">';
html+='<div class="text-left">';
html+='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[9px] font-semibold uppercase tracking-wider border border-white/20"><span class="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>AI Active</span>';
html+='<h2 class="text-lg md:text-xl font-extrabold leading-tight mt-1">Selamat Datang, '+currentUser.name+' 😊 👋 ✨</h2>';
html+='</div></div>';

// TAMPILAN HARI, TANGGAL, DAN JAM REAL-TIME
html+='<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 justify-center md:justify-start bg-white/10 backdrop-blur-sm px-4 py-2.0 rounded-xl border border-white/20 max-w-md mx-auto md:mx-0">';
html+='<div class="flex items-center gap-2 text-blue-100 text-xs md:text-sm">Hari ini<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span><b>'+dayName+'</b>, '+dateStr+'</span></div>';
html+='<div class="hidden sm:block w-px h-6 bg-white/20"></div>';
html+='<div class="flex items-center gap-2 text-white text-sm md:text-base font-semibold tracking-wider"><svg class="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span id="liveClockDashboard">00:00:00</span></div>';
html+='</div>';

html+='<p class="text-blue-100 text-xs md:text-sm leading-relaxed max-w-md mx-auto md:mx-0">"GURU SMART AI adalah asisten digital cerdas yang siap membantu guru merancang, menyusun, dan menyiapkan berbagai perangkat pembelajaran secara lebih mudah, cepat, dan efisien."</p>';
html+='<div class="mt-3 inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 italic text-[11px]">"Guru hebat lahir dari persiapan yang tepat, pembelajaran hebat dimulai dari langkah yang cerdas." 🎯</div>';
html+='</div>';
html+='<div class="w-full md:w-2/5 flex items-center justify-center">';
html+='<div class="relative">';
html+='<div class="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-90"></div>';
html+='<img src="'+TEACHER_IMG+'" onerror="imgFallback(this)" alt="Education" class="relative w-64 md:w-80 max-w-full h-auto object-contain drop-shadow-2xl floating">';
html+='</div></div>';
html+='</div>';
html+='<div class="bg-white/10 backdrop-blur-sm border-t border-white/10 px-5 py-2 text-center text-[10px] md:text-[11px] text-blue-100 font-medium tracking-wide">🌟 "Belajar Lebih Cerdas, Mengajar Lebih Mudah"</div>';
html+='</div>';

html+='<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
html+=statCard('Total Siswa',st.length,'from-blue-500 to-blue-700','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z','Aktif Terdaftar');
html+=statCard('Total Guru',tc.length,'from-emerald-500 to-emerald-700','M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z','Pengajar');
html+=statCard('Total Kelas',cl.length,'from-amber-500 to-orange-600','M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4','Unit Kelas');
html+=statCard('SPP Tunggakan',up,'from-rose-500 to-red-700','M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V6m0 2c-1.11 0-2.08.402-2.599 1M3 12h18M12 18v-1m0 1v-1','Belum Lunas');
html+='</div>';

// === PERANGKAT AJAR DIPINDAHKAN KE SINI (TEPAT DI BAWAH STAT CARD) ===
html+='<div id="perangkatAjarSection" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up">';
html+='<div class="flex justify-between items-center mb-4"><div><h3 class="font-bold text-slate-800 dark:text-white text-lg">📚 Perangkat Ajar Kurikulum</h3><p class="text-xs text-slate-500 mt-0.5">Buat dokumen kurikulum dengan AI - dokumen tersimpan dikelola di panel Perangkat Ajar</p></div></div>';
html+='<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">'+kurikulumTypes.map(function(t){return '<button onclick="generateKurikulum(\''+t.id+'\',\''+t.label+'\')" class="bg-gradient-to-br '+t.color+' p-5 rounded-xl text-white text-left shadow-md hover:scale-105 transition-transform"><svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="'+t.icon+'"></path></svg><h3 class="font-bold text-sm">'+t.label+'</h3><p class="text-xs opacity-90 mt-1">'+t.desc+'</p></button>';}).join('')+'</div>';
html+='<div class="flex justify-center pt-1"><button onclick="navigate(\'perangkat\')" class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 9h10"></path></svg>Dokumen Tersimpan - Lihat & Kelola Semua</button></div>';
html+='</div>';
// ==================================================================

html+='<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">';
html+='<div class="lg:col-span-2 space-y-6">';
html+='<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up">';
html+='<div class="flex justify-between items-center mb-5"><div><h3 class="font-bold text-slate-800 dark:text-white text-lg">Ringkasan Absensi Kelas</h3><p class="text-xs text-slate-500 mt-0.5">Rekap kehadiran siswa hari ini</p></div>'+(firstClass?'<select class="text-xs border border-slate-200 rounded-lg dark:bg-slate-700 dark:text-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"><option>'+firstClass.name+'</option></select>':'')+'</div>';
html+='<div class="grid grid-cols-3 gap-4 text-center">';
html+='<div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-green-100 dark:border-slate-600"><div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></div><p class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Hadir</p><h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">'+totalHadir+'</h4></div>';
html+='<div class="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-red-100 dark:border-slate-600"><div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></div><p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Tidak Hadir</p><h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">'+totalAbsen+'</h4></div>';
html+='<div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-blue-100 dark:border-slate-600"><div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div><p class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">% Kehadiran</p><h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">'+persentaseHadir+'%</h4></div>';
html+='</div><div class="mt-5"><div class="flex justify-between text-xs text-slate-500 mb-1.5"><span>Progress Kehadiran</span><span class="font-semibold">'+persentaseHadir+'%</span></div><div class="bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-700 shadow-sm" style="width: '+persentaseHadir+'%"></div></div></div></div>';
html+='<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up"><div class="flex justify-between items-center mb-4"><div><h3 class="font-bold text-slate-800 dark:text-white text-lg">Statistik Nilai Siswa</h3><p class="text-xs text-slate-500 mt-0.5">Rata-rata nilai per kategori</p></div><div class="flex items-center gap-2 text-xs text-slate-500"><span class="w-2 h-2 bg-blue-500 rounded-full"></span>Rata-rata</div></div><div class="h-56"><canvas id="chartGrades" height="100"></canvas></div></div></div>';
html+='<div class="space-y-6">';
html+='<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up"><div class="flex justify-between items-center mb-4"><div><h3 class="font-bold text-slate-800 dark:text-white text-lg">Aktivitas Terbaru</h3><p class="text-xs text-slate-500 mt-0.5">Pengumuman & info sekolah</p></div><button onclick="document.getElementById(\'annSection\').scrollIntoView({behavior:\'smooth\'})" class="text-xs text-blue-600 font-semibold hover:underline">Lihat Semua →</button></div><div class="space-y-3 max-h-80 overflow-y-auto modal-scroll pr-2">';
if(an.length){an.slice(0,5).forEach(function(a){html+='<div class="p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-700/50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow"><p class="font-semibold text-sm text-slate-800 dark:text-white">'+a.title+'</p><p class="text-xs text-slate-500 dark:text-slate-300 mt-1 line-clamp-2">'+a.content+'</p><p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'+formatDateID(a.date)+'</p></div>';});}else{html+='<div class="text-center py-8"><div class="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2"><svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><p class="text-sm text-slate-500">Belum ada aktivitas.</p></div>';}
html+='</div></div>';
html+='<div class="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden slide-up hidden md:block"><div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div><div class="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div><div class="relative z-10"><h3 class="font-bold text-lg mb-4">⚡ Menu Cepat</h3><div class="grid grid-cols-2 gap-3">';
html+='<button onclick="navigate(\'attendance\')" class="bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors p-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1.5 border border-white/10"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Absensi</button>';
html+='<button onclick="navigate(\'grades\')" class="bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors p-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1.5 border border-white/10"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>Input Nilai</button>';
html+='<button onclick="navigate(\'students\')" class="bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors p-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1.5 border border-white/10"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>Data Siswa</button>';
html+='<button onclick="navigate(\'ai\')" class="bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors p-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1.5 border border-white/10"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a7 7 0 00-7 7v3a7 7 0 0014 0V9a7 7 0 00-7-7zm-4 18h8M9 22h6"/></svg>Asisten AI</button>';
html+='</div></div></div></div></div>';
html+='<div id="annSection" class="mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up">';
html+='<div class="flex justify-between mb-4"><h3 class="font-bold text-slate-800 dark:text-white text-lg">📢 Pengumuman</h3><button onclick="annForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Buat Pengumuman</button></div>';
html+='<div id="annListContainer" class="space-y-4"></div>';
html+='</div>';
html+='<div class="mt-6 py-5 px-4 bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">';
html+='<div class="flex flex-col sm:flex-row items-center justify-between gap-3">';
html+='<div class="flex items-center gap-3"><div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-none"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div><div><p class="text-sm font-bold text-slate-800 dark:text-white">GURU SMART</p><p class="text-[10px] text-slate-500 dark:text-slate-400">Sistem Manajemen Sekolah Berbasis Cloud & AI</p></div></div>';
html+='<div class="text-center sm:text-right"><div class="flex items-center gap-2 justify-center sm:justify-end mb-0.5"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span><span class="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium">Powered By</span></div><p class="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">@Bayu_projectone</p><p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">© 2026 All Rights Reserved</p></div></div></div></div>';
document.getElementById('content').innerHTML=html;
var ctx=document.getElementById('chartGrades').getContext('2d');
var types=['Tugas','Ulangan Harian','PTS','PAS'];
var data=types.map(function(t){var tg=gr.filter(function(g){return g.type===t;});return tg.length?(tg.reduce(function(s,g){return s+g.score;},0)/tg.length).toFixed(1):0;});
var grad=ctx.createLinearGradient(0,0,0,200);grad.addColorStop(0,'rgba(99,102,241,0.8)');grad.addColorStop(1,'rgba(99,102,241,0.2)');
try{new Chart(ctx,{type:'bar',data:{labels:types,datasets:[{label:'Rata-rata Nilai',data:data,backgroundColor:grad,borderColor:'rgba(99,102,241,1)',borderWidth:2,borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(30,41,59,0.95)',padding:12,cornerRadius:8}},scales:{y:{beginAtZero:0,max:100,grid:{color:document.documentElement.classList.contains('dark')?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.05)',drawBorder:false},ticks:{color:document.documentElement.classList.contains('dark')?'#94a3b8':'#64748b',font:{size:11}}},x:{grid:{display:false},ticks:{color:document.documentElement.classList.contains('dark')?'#94a3b8':'#64748b',font:{size:11,weight:'600'}}}}}});}catch(e){console.error('Chart Error:',e);}
setTimeout(function(){loadAnnListDash();},100);

// PANGGIL FUNGSI JAM SAAT DASHBOARD DIRENDER
updateLiveClockDashboard();
}
// FUNGSI JAM DIGITAL BERJALAN
function updateLiveClockDashboard(){
var clockEl=document.getElementById('liveClockDashboard');
if(!clockEl)return;
var d=new Date();
var h=String(d.getHours()).padStart(2,'0');
var m=String(d.getMinutes()).padStart(2,'0');
var s=String(d.getSeconds()).padStart(2,'0');
clockEl.innerText=h+':'+m+':'+s;
}
// INTERVAL JALAN SETIAP 1 DETIK
if(window._liveClockInterval){clearInterval(window._liveClockInterval);}
window._liveClockInterval=setInterval(updateLiveClockDashboard,1000);
/* ===== PANEL PERANGKAT AJAR (dokumen kurikulum pindah dari dashboard) ===== */
async function renderPerangkat(){
  var html='<div class="space-y-6">';
  html+='<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 slide-up">';
  html+='<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4"><div><h3 class="font-bold text-slate-800 dark:text-white text-lg">📄 Dokumen Perangkat Ajar Kurikulum</h3><p class="text-xs text-slate-500 mt-0.5">Panel khusus semua dokumen kurikulum yang tersimpan</p></div><button onclick="navigate(\'dashboard\')" class="text-xs text-blue-600 font-semibold hover:underline self-start">← Kembali ke Dashboard</button></div>';
  html+='<div class="relative mb-4"><svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><input id="gsKurSearch" type="text" oninput="gsFilterKurikulum(this.value)" placeholder="Cari dokumen: judul, mapel, jenis, atau kelas..." class="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"></div>';
  html+='<div id="kurikulumTableContainer"></div>';
  html+='</div></div>';
  document.getElementById('content').innerHTML=html;
  setTimeout(function(){loadKurikulumTableDash();},50);
}
function gsFilterKurikulum(q){
  q=String(q==null?'':q).trim().toLowerCase();
  var tbody=document.querySelector('#kurikulumTableContainer tbody');
  if(!tbody)return;
  var rows=tbody.querySelectorAll('tr');
  for(var i=0;i<rows.length;i++){
    rows[i].style.display=(!q||rows[i].innerText.toLowerCase().indexOf(q)!==-1)?'':'none';
  }
}
/* ===== AKHIR PANEL PERANGKAT AJAR ===== */
async function loadKurikulumTableDash(){try{var results=await Promise.all([DB.get('subjects'),DB.get('kurikulum')]);var sub=results[0],kd=results[1];var c=document.getElementById('kurikulumTableContainer');if(!c)return;c.innerHTML='<h3 class="font-bold text-slate-800 dark:text-white mb-4">Dokumen Tersimpan</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase"><tr><th class="px-4 py-3">Jenis</th><th class="px-4 py-3">Mapel</th><th class="px-4 py-3">Judul</th><th class="px-4 py-3">Kelas</th><th class="px-4 py-3">Aksi</th></tr></thead><tbody class="divide-y dark:divide-slate-700">'+(kd.length?kd.map(function(k){var s=sub.find(function(x){return x.id===k.subject_id;});var tl=kurikulumTypes.find(function(x){return x.id===k.type;})?.label||k.type;return '<tr><td class="px-4 py-3"><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">'+tl+'</span></td><td class="px-4 py-3">'+(s?.name||'-')+'</td><td class="px-4 py-3 font-medium">'+k.title+'</td><td class="px-4 py-3">'+(k.class_name||'-')+'</td><td class="px-4 py-3 flex gap-2"><button onclick="viewKurikulum(\''+k.id+'\')" class="text-blue-500">Lihat</button><button onclick="printKurikulumDoc(\''+k.id+'\')" class="text-green-500">Cetak</button><button onclick="deleteData(\'kurikulum\',\''+k.id+'\',loadKurikulumTableDash)" class="text-red-500">Hapus</button></td></tr>';}).join(''):'<tr><td colspan="5" class="text-center py-4 text-slate-500">Belum ada dokumen.</td></tr>')+'</tbody></table></div>';}catch(e){console.error('Kurikulum Dash Error:',e);}}
async function loadAnnListDash(){try{var an=await DB.get('announcements');var c=document.getElementById('annListContainer');if(!c)return;c.innerHTML=(an.length?an.map(function(a){return '<div class="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"><div class="flex justify-between"><h4 class="font-bold text-slate-800 dark:text-white">'+a.title+'</h4><div class="flex gap-2"><button onclick="annForm(\''+a.id+'\')" class="text-xs text-blue-500">Edit</button><button onclick="deleteData(\'announcements\',\''+a.id+'\',loadAnnListDash)" class="text-xs text-red-500">Hapus</button></div></div><p class="text-xs text-slate-400 mt-1">'+formatDateID(a.date)+'</p><p class="text-sm mt-2 text-slate-700 dark:text-slate-300">'+a.content+'</p></div>';}).join(''):'<p class="text-sm text-slate-500 text-center py-4">Belum ada pengumuman.</p>');}catch(e){console.error('Ann Dash Error:',e);}}
function gsPreCleanMath(t){t=String(t==null?'':t);
t=t.replace(/\\left|\\right/g,'')
.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,'$1/$2')
.replace(/\\sqrt\s*\{([^{}]*)\}/g,'√$1')
.replace(/\\times/g,'×').replace(/\\div/g,'÷').replace(/\\pm/g,'±')
.replace(/\\leq|\\le/g,'≤').replace(/\\geq|\\ge/g,'≥').replace(/\\neq|\\ne/g,'≠')
.replace(/\\pi/g,'pi')
.replace(/\$\$([\s\S]*?)\$\$/g,'$1').replace(/\$([^$\n]*?)\$/g,'$1')
.replace(/\\\(([\s\S]*?)\\\)/g,'$1').replace(/\\\[([\s\S]*?)\\\]/g,'$1')
.replace(/\\/g,'');
return t;}
function gsEscapeHTML(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function gsMathPretty(s){s=String(s==null?'':s);
s=s.replace(/_{3,}/g,' ...... ').replace(/_/g,'');
s=gsEscapeHTML(s);
s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*\*/g,'');
s=s.replace(/([A-Za-z0-9\)])\^(\d+)/g,'$1<sup>$2</sup>');
s=s.replace(/\b(cm|m|km|dm|mm)(2|3)\b/g,'$1<sup>$2</sup>');
return s.replace(/\r?\n/g,'<br>');}
function formatSoalHTML(rawText){
var text=gsPreCleanMath(rawText);
var kunciSection='',kunciMap={};
var km=text.match(/\n?\**\s*(?:Kunci\s+Jawaban|Kunci|Jawaban)\s*\**\s*[:\-]?\s*\n([\s\S]+)$/i);
if(km){
var gh='';
km[1].split(/\r?\n/).forEach(function(l){
var ms=l.match(/(\d{1,3})\s*[.):\-]?\s*([A-Ea-e])(?![A-Za-z])/g)||[];
ms.forEach(function(tok){var m2=tok.match(/(\d{1,3})\s*[.):\-]?\s*([A-Ea-e])/);if(m2){kunciMap[m2[1]]=m2[2].toUpperCase();gh+='<span>'+m2[1]+'. '+m2[2].toUpperCase()+'</span>';}});
});
if(Object.keys(kunciMap).length){kunciSection='<div class="kunci-jawaban-section hide-on-print"><h3>📋 KUNCI JAWABAN</h3><div class="kunci-jawaban-grid">'+gh+'</div></div>';text=text.slice(0,km.index);}
}
var lines=text.split(/\r?\n/);
var reQ=/^\s*(?:\*\*)?\*?\s*(\d{1,3})\s*(?:\.(?!\d)|\))\s*(.*)$/;
var reO=/^\s*(?:\*\*)?\*?\s*([A-E])\s*[\.):\-]\s*(.+)$/;
var reO2=/^\s*(?:\*\*)?\*?\s*([A-E])\s{2,}(.+)$/;
var reJ=/^\s*(?:\*\*)?\*?\s*(?:Jawaban|Kunci(?:\s+Jawaban)?)\s*[:\-]?\s*\**\s*([A-Ea-e])(?![A-Za-z])/;
var reP=/^\s*(?:\*\*)?\*?\s*(?:Pembahasan|Penyelesaian|Cara\s+Mengerjakan|Langkah[-\s]?Pengerjaan|Jawab)\s*[:\-]?/i;
var blocks=[],cur=null,mode='idle',intro=[];
lines.forEach(function(L){
var mq=L.match(reQ);
if(mq){cur={num:mq[1],qlines:[],opts:[],correct:null,post:[]};blocks.push(cur);mode='q';if(mq[2].trim())cur.qlines.push(mq[2]);return;}
if(!cur){intro.push(L);return;}
var mj=L.match(reJ);
if(mj){cur.correct=mj[1].toUpperCase();mode='post';return;}
if(reP.test(L)){mode='post';var pm=L.replace(reP,'');if(pm.trim())cur.post.push(pm);return;}
if(mode==='post'){cur.post.push(L);return;}
var mo=L.match(reO)||L.match(reO2);
if(mo){var lbl=mo[1].toUpperCase(),expect=String.fromCharCode(65+cur.opts.length);
if(lbl===expect){cur.opts.push({label:lbl,text:mo[2]});mode='opt';return;}}
if(mode==='opt'&&cur.opts.length){cur.opts[cur.opts.length-1].text+='\n'+L;return;}
cur.qlines.push(L);
});
var hasQ=blocks.some(function(b){return b.opts.length>=2;});
if(hasQ){
var fh='';
var introTxt=intro.join('\n').trim();
if(introTxt)fh+=marked.parse(introTxt)+'\n';
var sh='<div class="soal-container">';
blocks.forEach(function(sb){
var qT=gsMathPretty(sb.qlines.join('\n').trim());
sh+='<div class="soal-item"><div class="soal-header"><span class="soal-number">'+sb.num+'.</span><span class="soal-text">'+(qT||'&nbsp;')+'</span></div><div class="soal-opts"><div class="opt-col">';
var half=Math.ceil(sb.opts.length/2);
sb.opts.forEach(function(opt,index){
if(index===half)sh+='</div><div class="opt-col">';
var isC=opt.label===sb.correct;
sh+='<div class="soal-opt '+(isC?'correct':'')+'"><span class="opt-label">'+opt.label+'.</span><span class="opt-text">'+gsMathPretty(opt.text)+'</span></div>';
});
sh+='</div></div>';
if(!sb.correct&&kunciMap[sb.num])sb.correct=kunciMap[sb.num];
if(sb.correct)sh+='<div class="soal-answer hide-on-print">Jawaban: <strong>'+sb.correct+'</strong></div>';
var pemb=sb.post.join('\n').trim();
if(pemb)sh+='<div class="soal-pembahasan hide-on-print"><b>💡 Pembahasan:</b><br>'+gsMathPretty(pemb)+'</div>';
sh+='</div>';
});
sh+='</div>';
return fh+sh+kunciSection;
}
return marked.parse(text)+kunciSection;
}
async function generateKurikulum(type,typeLabel){var results=await Promise.all([DB.get('subjects'),DB.get('classes')]);var sub=results[0],cls=results[1];if(cls.length===0){showToast('Tambah Kelas dulu! (Mapel boleh dipilih dari daftar kurikulum Indonesia atau diketik bebas)','error');return;}openModal('Buat '+typeLabel,'<form id="kurikulumForm" class="space-y-4"><div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">💡 AI akan membuatkan <strong>'+typeLabel+'</strong> secara otomatis.</div><div><label class="block text-sm mb-1">Mata Pelajaran</label><select id="kSubject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+window.gsMapelOptionsHTML(sub,'')+'</select><input type="text" id="kSubjectCustom" placeholder="atau ketik mapel lain (bebas): mis. Bahasa Sunda, Tahfidz, Robotika..." class="mt-2 w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-sm"></div><div><label class="block text-sm mb-1">Kelas</label><select id="kClass" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required>'+cls.map(function(c){return '<option value="'+c.id+'" data-name="'+c.name+'">'+c.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Topik / Materi</label><input type="text" id="kTopic" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Contoh: Ekosistem" required></div><div><label class="block text-sm mb-1">Fase</label><select id="kPhase" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option>Fase A</option><option>Fase B</option><option>Fase C</option><option>Fase D</option><option>Fase E</option><option>Fase F</option></select></div><button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold">⚡ Generate dengan AI</button></form>');document.getElementById('kurikulumForm').onsubmit=async function(e){e.preventDefault();var btn=document.querySelector('#kurikulumForm button[type="submit"]');btn.disabled=true;btn.innerText='AI Sedang Menyusun...';var sid=document.getElementById('kSubject').value;var cs=document.getElementById('kClass');var cn=cs.options[cs.selectedIndex].dataset.name;var tp=document.getElementById('kTopic').value;var ph=document.getElementById('kPhase').value;var _kSubCustom=(document.getElementById('kSubjectCustom')||{}).value||'';var sjName=_kSubCustom.trim();if(!sjName){if(String(sid).indexOf('nm:')===0){sjName=String(sid).slice(3);}else{var sj=sub.find(function(x){return x.id===sid;});sjName=sj?sj.name:'';}}var tblHint={cp:'| No | Capaian Pembelajaran | Elemen | Indikator |',tp:'| No | Tujuan Pembelajaran | Indikator | Alokasi Waktu |',atp:'| No | Tujuan Pembelajaran | Materi/Topik | Alokasi Waktu |',modul:'tabel informasi umum | Komponen | Keterangan |, tabel langkah pembelajaran | Tahap | Kegiatan | Waktu |, dan tabel penilaian | Aspek | Teknik | Instrumen |',rpp:'tabel identitas | Komponen | Keterangan |, tabel kegiatan | Tahap | Kegiatan Pembelajaran | Waktu |, dan tabel penilaian | Aspek | Teknik | Instrumen |',prota:'| Semester | Bulan/Minggu | Materi/Topik | JP |',lkpd:'tabel identitas | Komponen | Keterangan |, langkah kerja bernomor, dan tabel rubrik | Aspek | Skor | Deskripsi |'};var tblMain=tblHint[type]||'| No | Komponen | Keterangan |';var prompt='Buatkan '+typeLabel+' lengkap untuk mata pelajaran '+sjName+', kelas '+cn+', Fase '+ph+', topik: '+tp+'. Bila mapel ini tidak ada di data sekolah, tetap susun dokumennya sesuai Kurikulum Merdeka Indonesia. Bila mapel berupa bahasa daerah Nusantara (Jawa, Sunda, Betawi, Madura, Palembang, dll), susun dokumen dalam Bahasa Indonesia dengan istilah, kosakata, dan contoh bahasa daerah yang benar. Gunakan format markdown dan susun SEMUA bagian utama dalam bentuk TABEL markdown agar rapi, bukan paragraf atau daftar panjang.';try{var sys='Anda adalah ahli kurikulum pendidikan Indonesia. Buatkan '+typeLabel+' yang sesuai dengan Kurikulum Merdeka. Gunakan markdown. ATURAN FORMAT WAJIB agar rapi: tampilkan isi dalam TABEL markdown dengan sintaks pipa (baris format: | Kolom 1 | Kolom 2 |), jangan menulis paragraf panjang. Wajib ada: (1) tabel identitas | Komponen | Keterangan | berisi Satuan Pendidikan, Mata Pelajaran, Kelas/Fase, Semester, Alokasi Waktu; (2) tabel isi utama; (3) tabel penilaian | Aspek | Teknik | Instrumen | bila relevan. Struktur tabel utama untuk '+typeLabel+': '+tblMain+'. Awali setiap bagian dengan heading ## lalu tabel markdown di bawahnya. Isi setiap sel tabel harus singkat, jelas, dan tidak bertele-tele.';var res=await callAIWithAutoUpgrade([{role:'system',content:sys},{role:'user',content:prompt}]);var content=typeof res==='string'?res:(res?.message?.content||res?.text||'');if(!content)throw new Error('AI tidak memberikan respon.');var _sidSave=(String(sid).indexOf('nm:')===0||_kSubCustom.trim())?'':sid;await DB.insert('kurikulum',{type:type,title:typeLabel+' - '+tp,subject_id:_sidSave||null,class_name:cn,content:content});showToast('Dokumen berhasil dibuat!','success');closeModal();loadKurikulumTableDash();}catch(err){showToast('Error: '+err.message,'error');btn.disabled=false;btn.innerText='⚡ Coba Lagi';}};}
async function viewKurikulum(id){var doc=(await DB.get('kurikulum')).find(function(k){return k.id===id;});if(!doc)return;var tl=kurikulumTypes.find(function(t){return t.id===doc.type;})?.label||doc.type;var isLkpd=doc.type==='lkpd';var generateBtn='<button onclick="generateKurikulumImage(\''+doc.id+'\')" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm flex-1 flex items-center justify-center gap-2 shadow-md transition">🎨 Generate Gambar (9:16)</button>';openModal(tl,'<div class="ai-output text-gray-800 dark:text-white">'+marked.parse(doc.content)+'</div><div class="mt-4 flex gap-2 flex-wrap">'+generateBtn+'<button onclick="printKurikulumDoc(\''+doc.id+'\')" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex-1">🖨️ Cetak / PDF</button><button onclick="closeModal()" class="bg-slate-500 text-white px-4 py-2 rounded-lg text-sm">Tutup</button></div>');}
window.gsPortraitImage=function(promptText){
  return new Promise(function(res,rej){
    var fail=function(e){rej(e);};
    try{
      if(typeof puter==='undefined'||!puter||!puter.ai||typeof puter.ai.txt2img!=='function'){fail(new Error('Pustaka Puter belum siap'));return;}
      var go=function(){
        /* Tangga kualitas: coba HD 1080x1920 dulu, gagal -> 720x1280 (tetap 9:16) */
        var sizes=[{w:1080,h:1920},{w:720,h:1280}];
        var idx=0;
        var attempt=function(){
          var sz=sizes[idx];
          var myTo=setTimeout(function(){
            if(idx+1<sizes.length){idx++;attempt();}
            else{fail(new Error('Generate potret native melebihi batas waktu'));}
          },90000);
          Promise.resolve().then(function(){
            return puter.ai.txt2img(String(promptText),{ratio:{w:9,h:16},width:sz.w,height:sz.h,test_mode:false});
          }).then(function(el){
            clearTimeout(myTo);
            var s='';
            try{
              if(typeof el==='string')s=el;
              else if(el&&el.tagName&&String(el.tagName).toLowerCase()==='img')s=el.src||'';
              else if(el&&typeof el.src==='string')s=el.src;
              else if(el&&typeof el.url==='string')s=el.url;
            }catch(eE){}
            if(s)res(s);
            else if(idx+1<sizes.length){idx++;attempt();}
            else fail(new Error('Tidak ada gambar dari potret native'));
          }).catch(function(e){
            clearTimeout(myTo);
            if(idx+1<sizes.length){idx++;attempt();}
            else fail(e);
          });
        };
        attempt();
      };
      var signed=false;try{signed=puter.auth.isSignedIn();}catch(eA){}
      if(signed)go();
      else puter.auth.signIn().then(go).catch(function(eS){fail(eS);});
    }catch(e){fail(e);}
  });
};
window.gsForce9x16=function(src,W0,H0){
  return new Promise(function(res){
    if(!src||typeof src!=='string'||(src.indexOf('data:image')!==0&&src.indexOf('blob:')!==0&&src.indexOf('http')!==0)){res(src);return;}
    var img=new Image(),done=false;
    var fin=function(v){if(!done){done=true;res(v||src);}};
    var to=setTimeout(function(){fin(src);},15000);
    img.onload=function(){
      clearTimeout(to);
      try{
        var iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
        if(!iw||!ih){fin(src);return;}
        var W=(W0>0?Math.round(W0):1080),H=(H0>0?Math.round(H0):1920);
        var cv=document.createElement('canvas');cv.width=W;cv.height=H;
        var ctx=cv.getContext('2d');if(!ctx){fin(src);return;}
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        /* Latar ambilight: salinan blur diperbesar memenuhi kanvas 9:16 */
        ctx.filter='blur(36px)';
        var bs=Math.max(W/iw,H/ih)*1.35,bw=iw*bs,bh=ih*bs;
        ctx.drawImage(img,(W-bw)/2,(H-bh)/2,bw,bh);
        ctx.filter='none';
        ctx.fillStyle='rgba(15,23,42,0.15)';
        ctx.fillRect(0,0,W,H);
        /* Gambar UTUH di tengah (fit-contain) - DIJAMIN TANPA TERPOTONG */
        var fc=Math.min(W/iw,H/ih),fw=iw*fc,fh=ih*fc;
        if(iw*0.5>fw&&ih*0.5>fh){
          /* Downscale bertahap (per setengah) agar sumber besar tetap tajam */
          var sw=iw,sh=ih,srcImg=img;
          while(sw*0.5>fw&&sh*0.5>fh){
            var hc=document.createElement('canvas');
            hc.width=Math.max(1,Math.round(sw*0.5));hc.height=Math.max(1,Math.round(sh*0.5));
            var hx=hc.getContext('2d');if(!hx)break;
            hx.imageSmoothingEnabled=true;hx.imageSmoothingQuality='high';
            hx.drawImage(srcImg,0,0,hc.width,hc.height);
            srcImg=hc;sw=hc.width;sh=hc.height;
          }
          ctx.drawImage(srcImg,(W-fw)/2,(H-fh)/2,fw,fh);
        }else{
          ctx.drawImage(img,(W-fw)/2,(H-fh)/2,fw,fh);
        }
        /* Peruncingan halus (unsharp mask ringan K=0.35) - teks & detail lebih tegas */
        try{
          if(fw>=4&&fh>=4){
            var dxc=Math.round((W-fw)/2),dyc=Math.round((H-fh)/2),rwc=Math.round(fw),rhc=Math.round(fh);
            var sd=ctx.getImageData(dxc,dyc,rwc,rhc),px=sd.data,pw=sd.width,ph=sd.height;
            var op=new Uint8ClampedArray(px),K=0.35,srow4=pw*4;
            for(var sy=1;sy<ph-1;sy++){
              var srow=sy*pw;
              for(var sx=1;sx<pw-1;sx++){
                var si=(srow+sx)*4;
                op[si]=px[si]+K*(4*px[si]-px[si-4]-px[si+4]-px[si-srow4]-px[si+srow4]);
                op[si+1]=px[si+1]+K*(4*px[si+1]-px[si-4+1]-px[si+4+1]-px[si-srow4+1]-px[si+srow4+1]);
                op[si+2]=px[si+2]+K*(4*px[si+2]-px[si-4+2]-px[si+4+2]-px[si-srow4+2]-px[si+srow4+2]);
              }
            }
            ctx.putImageData(new ImageData(op,pw,ph),dxc,dyc);
          }
        }catch(eS){}
        var out='';
        try{var du=cv.toDataURL('image/png');if(du&&du.length<6000000)out=du;}catch(e){}
        if(!out){try{out=cv.toDataURL('image/jpeg',0.96);}catch(e2){}}
        fin(out||src);
      }catch(e){fin(src);}
    };
    img.onerror=function(){clearTimeout(to);fin(src);};
    img.src=src;
  });
};
/* ===== v7: HD UNIVERSAL - generator native Puter dengan tangga kualitas (dipakai Jadwal, Piket, Studio) ===== */
window.gsImageHD=function(promptText,W,H,rW,rH){
  return new Promise(function(res,rej){
    var fail=function(e){rej(e);};
    try{
      if(typeof puter==='undefined'||!puter||!puter.ai||typeof puter.ai.txt2img!=='function'){fail(new Error('Pustaka Puter belum siap'));return;}
      var gcd=function(a,b){a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){var t=a%b;a=b;b=t;}return a||1;};
      var gr=gcd(rW||W,rH||H);
      var ratio={w:Math.max(1,Math.round((rW||W)/gr)),h:Math.max(1,Math.round((rH||H)/gr))};
      var go=function(){
        /* Tangga kualitas: HD penuh dulu, gagal -> setengah ukuran (rasio sama) */
        var sizes=[{w:W,h:H},{w:Math.max(256,Math.round(W/2)),h:Math.max(256,Math.round(H/2))}];
        var idx=0;
        var attempt=function(){
          var sz=sizes[idx];
          var myTo=setTimeout(function(){
            if(idx+1<sizes.length){idx++;attempt();}
            else{fail(new Error('Generate HD native melebihi batas waktu'));}
          },90000);
          Promise.resolve().then(function(){
            return puter.ai.txt2img(String(promptText),{ratio:ratio,width:sz.w,height:sz.h,test_mode:false});
          }).then(function(el){
            clearTimeout(myTo);
            var s='';
            try{
              if(typeof el==='string')s=el;
              else if(el&&el.tagName&&String(el.tagName).toLowerCase()==='img')s=el.src||'';
              else if(el&&typeof el.src==='string')s=el.src;
              else if(el&&typeof el.url==='string')s=el.url;
            }catch(eE){}
            if(s)res(s);
            else if(idx+1<sizes.length){idx++;attempt();}
            else fail(new Error('Tidak ada gambar dari generator native'));
          }).catch(function(e){
            clearTimeout(myTo);
            if(idx+1<sizes.length){idx++;attempt();}
            else fail(e);
          });
        };
        attempt();
      };
      var signed=false;try{signed=puter.auth.isSignedIn();}catch(eA){}
      if(signed)go();
      else puter.auth.signIn().then(go).catch(function(eS){fail(eS);});
    }catch(e){fail(e);}
  });
};
/* ===== v7: Peruncingan HD universal - kanvas W x H, fit-contain UTUH + ambilight + unsharp (memakai mesin gsForce9x16) ===== */
window.gsHDRefine=function(src,W,H){return window.gsForce9x16(src,W||1080,H||1920);};
async function generateKurikulumImage(id){var doc=(await DB.get('kurikulum')).find(function(k){return k.id===id;});if(!doc){showToast('Dokumen tidak ditemukan.','error');return;}var tl=kurikulumTypes.find(function(t){return t.id===doc.type;})?.label||doc.type;var rawText=(doc.content||'').replace(/[#*`>_~]/g,'').replace(/\s+/g,' ').trim();var promptText='Buatkan ilustrasi gambar edukatif yang menarik dan berwarna-warni untuk '+tl+' dengan materi berikut: "'+rawText.substring(0,800)+'". Gunakan gaya kartun edukasi anak yang ramah, jelas, dan mudah dipahami siswa. TEKS WAJIB SANGAT TAJAM: semua tulisan pada gambar harus besar, tegas, lurus, sangat jelas terbaca (crisp sharp text), ejaan benar sesuai materi, tanpa huruf blur, berantakan, atau aneh; gunakan teks secukupnya saja (judul dan poin pendek) agar huruf tetap tajam. KUALITAS WAJIB: resolusi tinggi (HD), sangat tajam dan jelas (sharp focus), detail kaya, warna cerah seimbang, tanpa blur, tanpa noise. PENTING: gambar WAJIB berformat potret vertikal 9:16 (tinggi dua kali lebar), komposisi memanjang dari atas ke bawah, objek utama utuh di tengah bingkai, tanpa tepi kosong (no border, no letterbox).';openModal('🎨 Generate Gambar '+tl,'<div class="space-y-4"><div class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-purple-600"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">🎨 Info Generate Gambar</h3><div class="bg-purple-50 dark:bg-slate-700 p-4 rounded-lg text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-600 flex items-start gap-2"><svg class="w-5 h-5 flex-none mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg><span>GURU Smart AI akan membuatkan gambar otomatis berdasarkan isi '+tl+'. Tunggu sebentar ya, proses generate gambar mode kilat biasanya 15-45 detik. Format gambar: potret 9:16 HD (1080×1920), kualitas tajam dan jelas, gambar tampil UTUH tanpa terpotong.</span></div></div><div class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-amber-600"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">📖 Tutorial Generate Gambar</h3><ol class="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside text-left"><li>Tekan tombol <b>🎨 Generate Gambar (9:16)</b> yang ada di dokumen CP, TP, ATP, Modul, RPP, Prota, atau LKPD.</li><li>Tunggu 15-45 detik, AI akan membuatkan gambar otomatis dari isi dokumen.</li><li>Hasil tampil utuh potret 9:16 HD (1080×1920). Klik <b>💾 Unduh Gambar</b> untuk menyimpan ke perangkat.</li><li>Kurang pas? Klik <b>🔄 Buat Ulang</b> untuk versi baru. Bila gagal, klik Sambungkan AI di halaman Asisten AI, izinkan popup, lalu coba lagi.</li></ol><div class="mt-3 bg-amber-50 dark:bg-slate-700 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-slate-600">💡 Tips teks tajam: tulisan pada gambar dibuat besar, pendek, dan sedikit (judul + poin). Bila teks kurang jelas, langsung klik Buat Ulang karena setiap hasil berbeda.</div></div><div id="genImgLoading" class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-blue-600 flex flex-col items-center justify-center py-12"><div class="relative w-20 h-20 mb-4"><div class="absolute inset-0 rounded-full border-4 border-purple-200"></div><div class="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div></div><p class="text-slate-600 dark:text-slate-300 text-sm font-medium">🎨 GURU Smart AI sedang membuat gambar...</p><p class="text-xs text-slate-400 mt-1">Mohon tunggu, jangan tutup jendela ini</p></div><div id="genImgResult" class="hidden"></div><div id="genImgActions" class="hidden flex gap-2 mt-4 bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-indigo-600"><button id="genImgDownload" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">💾 Unduh Gambar</button><button onclick="generateKurikulumImage(\''+doc.id+'\')" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">🔄 Buat Ulang</button><button onclick="closeModal()" class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Tutup</button></div></div>');var loadingEl=document.getElementById('genImgLoading');var resultEl=document.getElementById('genImgResult');var actionsEl=document.getElementById('genImgActions');try{var imgSrc=null;try{imgSrc=await window.gsPortraitImage(promptText);}catch(eP){console.warn('Potret 9:16 native gagal - lanjut jalur biasa:',eP);}if(!imgSrc){imgSrc=await GSAI.image(promptText);}if(!imgSrc){throw new Error('AI tidak mengembalikan gambar.');}imgSrc=await window.gsForce9x16(imgSrc);loadingEl.classList.add('hidden');resultEl.classList.remove('hidden');resultEl.innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-green-600 space-y-3"><h3 class="font-bold mb-4 text-slate-800 dark:text-white">🖼️ Hasil Gambar (Potret 9:16 HD)</h3><div class="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-slate-600 shadow-lg"><img src="'+imgSrc+'" alt="Gambar '+tl+'" class="w-full h-auto block" style="display:block;"></div><p class="text-xs text-slate-500 dark:text-slate-400 text-center italic">Gambar dihasilkan AI berdasarkan isi '+tl+'</p></div>';actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');var dlBtn=document.getElementById('genImgDownload');if(dlBtn){dlBtn.onclick=function(){gsDownloadImage(imgSrc,'Gambar_'+tl.replace(/[^a-zA-Z0-9]/g,'_')+'_'+Date.now()+'.png');};}showToast('Gambar berhasil dibuat! ('+GSAI.provider()+')','success');}catch(err){console.error('Generate Image Error:',err);loadingEl.classList.add('hidden');resultEl.classList.remove('hidden');resultEl.innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border-red-500 text-center py-8"><div class="text-5xl mb-3">😕</div><p class="text-red-600 dark:text-red-400 font-semibold mb-1">Gagal membuat gambar</p><p class="text-xs text-slate-500 dark:text-slate-400 mb-4">'+(err.message||err)+'</p><p class="text-xs text-amber-600 mb-4">Tips: klik tombol Sambungkan AI di halaman Asisten AI, izinkan popup yang muncul, lalu coba lagi.</p><button onclick="generateKurikulumImage(\''+doc.id+'\')" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">🔄 Coba Lagi</button></div>';actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');showToast('Gagal: '+err.message,'error');}}
function printKurikulumDoc(id){DB.get('kurikulum').then(async function(docs){var doc=docs.find(function(k){return k.id===id;});if(!doc)return;var tl=kurikulumTypes.find(function(t){return t.id===doc.type;})?.label||doc.type;var hc=marked.parse(doc.content);var kh=await generateKopHTML();openPrintPreview('<div style="font-family:Times New Roman,Georgia,serif;color:#000;">'+kh+'<div class="ai-output" style="color:#000;"><h3 style="text-align:center;margin:10px 0 15px;">'+tl.toUpperCase()+'</h3>'+hc+'</div></div>');});}
async function renderTeachers(){
  var t=await DB.get('teachers');
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">DATA GURU</h3><p class="text-emerald-100 text-sm">Manajemen Data Guru & Staf Pengajar</p></div>'+
        '</div>'+
        '<button onclick="teacherForm()" class="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-emerald-50 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Tambah Guru</button>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="mb-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600">'+
          '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>'+
          '<input type="text" id="searchTeacher" onkeyup="filterTable(\'searchTeacher\',\'teacherTableBody\')" placeholder="Cari guru berdasarkan nama, NIP, atau mapel..." class="flex-1 bg-transparent text-sm outline-none dark:text-white">'+
        '</div>'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left whitespace-nowrap">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3 text-center">Foto</th>'+
                '<th class="px-3 py-3">NIP</th>'+
                '<th class="px-3 py-3">Nama Guru</th>'+
                '<th class="px-3 py-3 text-center">L/P</th>'+
                '<th class="px-3 py-3">Mata Pelajaran</th>'+
                '<th class="px-3 py-3">No. HP</th>'+
                '<th class="px-3 py-3">Email</th>'+
                '<th class="px-3 py-3">Tanggal Lahir</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody id="teacherTableBody" class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (t.length?t.map(function(x,i){
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3 text-center">'+
                    (x.photo
                      ?'<img src="'+x.photo+'" alt="Foto guru" title="Lihat foto" class="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shadow-sm mx-auto cursor-pointer hover:scale-110 transition-transform" onclick="teacherPhotoAction(\''+x.id+'\')">'
                      :'<button type="button" title="Belum ada foto — klik untuk menambahkan" onclick="teacherPhotoAction(\''+x.id+'\')" class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 text-white flex items-center justify-center text-xs font-bold mx-auto hover:from-emerald-400 hover:to-teal-500 hover:scale-110 transition-all">'+gsTeacherInitials(x.name)+'</button>')+
                  '</td>'+
                  '<td class="px-3 py-3 font-mono text-slate-600 dark:text-slate-300">'+x.nip+'</td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+x.name+'</td>'+
                  '<td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full '+(x.gender==='L'?'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300':'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300')+' text-xs font-bold">'+x.gender+'</span></td>'+
                  '<td class="px-3 py-3"><span class="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md text-xs font-medium">'+(x.subject||'-')+'</span></td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300">'+(x.phone||'-')+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300 text-xs">'+(x.email||'-')+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300">'+formatDateID(x.birthdate)+'</td>'+
                  '<td class="px-3 py-3">'+
                    '<div class="flex items-center justify-center gap-1.5">'+
                      '<button onclick="teacherForm(\''+x.id+'\')" class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition" title="Edit Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
                      '<button onclick="deleteData(\'teachers\',\''+x.id+'\',renderTeachers)" class="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition" title="Hapus Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg></button>'+
                    '</div>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="10" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg><p class="text-sm">Belum ada data guru. Klik "Tambah Guru" untuk memulai.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function teacherForm(id){var t=null;if(id){t=(await DB.get('teachers')).find(function(x){return x.id===id;});}openModal(id?'Edit Guru':'Tambah Guru','<form id="teacherForm" class="space-y-4"><div><label class="block text-sm mb-1">Foto Guru</label><div class="flex items-center gap-3"><img id="tch_photo_preview" src="'+(t&&t.photo?t.photo:TCH_PHOTO_PLACEHOLDER)+'" alt="Foto guru" class="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700"><div class="flex flex-col gap-1.5"><input type="file" id="tch_photo_file" accept="image/*" class="hidden" onchange="tchPhotoPicked(event)"><button type="button" onclick="document.getElementById(\'tch_photo_file\').click()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">📷 Pilih Foto</button><button type="button" onclick="tchPhotoClear()" class="bg-slate-200 dark:bg-slate-600 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-700 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold">🗑️ Hapus Foto</button></div></div><input type="hidden" id="tch_photo" value=""><p class="text-[10px] text-slate-400 mt-1">JPG/PNG/WEBP • otomatis dikecilkan (sisi maks 400px) agar hemat penyimpanan. Jika gagal simpan, kolom "photo" (teks) perlu ditambahkan di Supabase.</p></div><div><label class="block text-sm mb-1">NIP</label><input type="text" id="tch_nip" value="'+(t?.nip||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Nama</label><input type="text" id="tch_name" value="'+(t?.name||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Gender</label><select id="tch_gender" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option value="L" '+(t?.gender=='L'?'selected':'')+'>L</option><option value="P" '+(t?.gender=='P'?'selected':'')+'>P</option></select></div><div><label class="block text-sm mb-1">No HP</label><input type="text" id="tch_phone" value="'+(t?.phone||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Email</label><input type="email" id="tch_email" value="'+(t?.email||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Alamat</label><textarea id="tch_address" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(t?.address||'')+'</textarea></div><div><label class="block text-sm mb-1">Tanggal Lahir</label><input type="date" id="tch_birthdate" value="'+(t?.birthdate||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" style="color-scheme:light;"></div><div><label class="block text-sm mb-1">Mapel</label><input type="text" id="tch_subject" value="'+(t?.subject||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Simpan</button></form>');document.getElementById('teacherForm').onsubmit=async function(e){e.preventDefault();var p={nip:document.getElementById('tch_nip').value,name:document.getElementById('tch_name').value,gender:document.getElementById('tch_gender').value,phone:document.getElementById('tch_phone').value,email:document.getElementById('tch_email').value,address:document.getElementById('tch_address').value,birthdate:document.getElementById('tch_birthdate').value,subject:document.getElementById('tch_subject').value};var phv=(document.getElementById('tch_photo')||{}).value||'';if(phv.indexOf('data:image')===0){p.photo=phv;}else if(phv==='__GS_CLEAR__'&&t&&t.photo){p.photo='';}var res=id?await DB.update('teachers',id,p):await DB.insert('teachers',p);if(res){showToast('Data guru disimpan!','success');closeModal();renderTeachers();}else{if(p.photo!==undefined)gsPhotoColumnHelp();}};}
async function renderStudents(){
  var results=await Promise.all([DB.get('students'),DB.get('classes')]);
  var st=results[0],cl=results[1];
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">DATA SISWA</h3><p class="text-blue-100 text-sm">Manajemen Data Siswa Sekolah</p></div>'+
        '</div>'+
        '<div class="flex flex-wrap gap-2">'+
          '<button onclick="exportStudentsExcel()" class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Export Excel</button>'+
          '<button onclick="printAllStudentCards()" class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>Cetak Semua Kartu</button>'+
          '<button onclick="studentForm()" class="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-blue-50 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Tambah Siswa</button>'+
        '</div>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="mb-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600">'+
          '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>'+
          '<input type="text" id="searchStudent" onkeyup="filterTable(\'searchStudent\',\'studentTableBody\')" placeholder="Cari siswa berdasarkan nama atau NIS..." class="flex-1 bg-transparent text-sm outline-none dark:text-white">'+
        '</div>'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3">Foto</th>'+
                '<th class="px-3 py-3">NIS</th>'+
                '<th class="px-3 py-3">Nama Lengkap</th>'+
                '<th class="px-3 py-3">Kelas</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody id="studentTableBody" class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (st.length?st.map(function(s,i){
                var c=cl.find(function(x){return x.id===s.class_id;});
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3"><img src="'+(s.photo_url||'https://via.placeholder.com/40x40?text=No+Image')+'" class="w-10 h-10 object-cover rounded-lg bg-slate-200 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" onerror="this.src=\'https://via.placeholder.com/40x40?text=No+Image\'"></td>'+
                  '<td class="px-3 py-3 font-mono text-slate-600 dark:text-slate-300">'+s.nis+'</td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+s.name+'</td>'+
                  '<td class="px-3 py-3"><span class="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>'+(c?.name||'N/A')+'</span></td>'+
                  '<td class="px-3 py-3">'+
                    '<div class="flex items-center justify-center gap-1.5">'+
                      '<button onclick="printStudentCard(\''+s.id+'\')" class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition" title="Cetak Kartu Siswa"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10L10 3m0 0l7 7m-7-7v18"/></svg></button>'+
                      '<button onclick="studentForm(\''+s.id+'\')" class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition" title="Edit Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
                      '<button onclick="deleteData(\'students\',\''+s.id+'\',renderStudents)" class="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition" title="Hapus Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg></button>'+
                    '</div>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="6" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg><p class="text-sm">Belum ada data siswa. Klik "Tambah Siswa" untuk memulai.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function exportStudentsExcel(){var results=await Promise.all([DB.get('school_profile'),DB.get('students'),DB.get('classes')]);var prof=results[0][0]||{},st=results[1],cl=results[2];var aoa=[];aoa.push([""]);aoa.push(["",prof.kop_line1||"NAMA SEKOLAH","","","","","","",""]);if(prof.kop_line1b)aoa.push(["",prof.kop_line1b,"","","","","","",""]);aoa.push(["",prof.kop_line2||prof.name||"","","","","","","",""]);aoa.push(["",prof.kop_line3||"","","","","","","",""]);aoa.push([""]);aoa.push(["DATA SISWA"]);aoa.push([""]);var header=["No","NIS","Nama","Jenis Kelamin","Tempat Lahir","Tanggal Lahir","Alamat","Kelas","URL Foto"];aoa.push(header);st.forEach(function(s,i){var c=cl.find(function(x){return x.id===s.class_id;});aoa.push([i+1,s.nis,s.name,s.gender==='L'?'Laki-laki':'Perempuan',s.birthplace||'-',formatDateID(s.birthdate),s.address||'-',c?.name||'-',s.photo_url||'-']);});var ws=XLSX.utils.aoa_to_sheet(aoa);ws['!merges']=[{s:{r:1,c:1},e:{r:1,c:8}},{s:{r:2,c:1},e:{r:2,c:8}},{s:{r:3,c:1},e:{r:3,c:8}},{s:{r:4,c:1},e:{r:4,c:8}},{s:{r:6,c:0},e:{r:6,c:8}}];ws['!cols']=[{wch:5},{wch:15},{wch:25},{wch:15},{wch:15},{wch:15},{wch:30},{wch:15},{wch:50}];var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Data Siswa');XLSX.writeFile(wb,'Data_Siswa.xlsx');showToast('File Excel berhasil diunduh!','success');}
async function studentForm(id){
 var results=await Promise.all([DB.get('classes'),DB.get('students')]);
 var cl=results[0],s=null;
 if(id){s=results[1].find(function(x){return String(x.id)===String(id);})||null;}
 var placeholder='https://via.placeholder.com/100x100?text=Foto';
 openModal(id?'Edit Siswa':'Tambah Siswa','<form id="studentForm" class="space-y-4"><div class="flex flex-col items-center mb-4"><img id="stdPhotoPreview" src="'+(s?.photo_url||placeholder)+'" class="w-24 h-24 object-cover bg-slate-200 mb-3 border-2 border-dashed border-slate-300 rounded-lg"><input type="file" id="stdPhotoFile" accept="image/*" class="text-sm"><p class="text-xs text-slate-500 mt-1">Pilih foto dari galeri HP (maksimal 5 MB; JPG/PNG/WebP disarankan)</p><p id="stdPhotoStatus" class="text-xs text-slate-500 mt-1" role="status"></p></div><div><label class="block text-sm mb-1">NIS</label><input type="text" id="std_nis" value="'+(s?.nis||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Nama</label><input type="text" id="std_name" value="'+(s?.name||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Kelas</label><select id="std_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+cl.map(function(c){return '<option value="'+c.id+'" '+(s?.class_id==c.id?'selected':'')+'>'+c.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Jenis Kelamin</label><select id="std_gender" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option value="L" '+(s?.gender=='L'?'selected':'')+'>Laki-laki</option><option value="P" '+(s?.gender=='P'?'selected':'')+'>Perempuan</option></select></div><div><label class="block text-sm mb-1">Tempat Lahir</label><input type="text" id="std_birthplace" value="'+(s?.birthplace||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Tanggal Lahir</label><input type="date" id="std_birthdate" value="'+(s?.birthdate||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" style="color-scheme:light;"></div><div><label class="block text-sm mb-1">Alamat</label><textarea id="std_address" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(s?.address||'')+'</textarea></div><button id="stdSaveButton" type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Simpan</button></form>');
 var photoInput=document.getElementById('stdPhotoFile');
 var preview=document.getElementById('stdPhotoPreview');
 var status=document.getElementById('stdPhotoStatus');
 var saveButton=document.getElementById('stdSaveButton');
 var selectedPhoto=null;
 photoInput.addEventListener('change',function(e){
  var file=e.target.files&&e.target.files[0];
  if(!file)return;
  if(file.size>5*1024*1024){showToast('Ukuran foto maksimal 5 MB. Pilih foto yang lebih kecil.','error');photoInput.value='';selectedPhoto=null;return;}
  if(file.type&&!/^image\/(jpeg|png|webp|heic|heif|jpg)$/i.test(file.type)){showToast('Format foto tidak didukung. Pilih foto JPG, PNG, atau WebP.','error');photoInput.value='';selectedPhoto=null;return;}
  selectedPhoto=file;status.textContent='Foto dipilih: '+file.name;
  var reader=new FileReader();
  reader.onload=function(ev){if(ev.target&&ev.target.result)preview.src=ev.target.result;};
  reader.onerror=function(){status.textContent='Pratinjau tidak dapat dibuka. Coba foto JPG atau PNG.';};
  reader.readAsDataURL(file);
 });
 async function prepareStudentPhoto(file){
  var dataUrl=await new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=function(){reject(new Error('Foto tidak dapat dibaca dari galeri HP.'));};reader.readAsDataURL(file);});
  var img=await new Promise(function(resolve,reject){var image=new Image();image.onload=function(){resolve(image);};image.onerror=function(){reject(new Error('Browser tidak dapat membaca format foto ini. Simpan foto sebagai JPG atau PNG lalu pilih kembali.'));};image.src=dataUrl;});
  var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  var scale=Math.min(1,1600/Math.max(w,h));
  var canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
  var ctx=canvas.getContext('2d');if(!ctx)throw new Error('Browser HP tidak dapat memproses foto.');
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  var blob=await new Promise(function(resolve){canvas.toBlob(resolve,'image/jpeg',0.82);});
  if(!blob)throw new Error('Foto gagal dikompres. Coba foto JPG atau PNG lain.');
  return new File([blob],'foto-siswa-'+Date.now()+'.jpg',{type:'image/jpeg',lastModified:Date.now()});
 }
 document.getElementById('studentForm').onsubmit=async function(e){
  e.preventDefault();
  if(!currentUser||!currentUser.id){showToast('Sesi login berakhir. Silakan login kembali.','error');return;}
  saveButton.disabled=true;saveButton.textContent='Menyimpan...';
  try{
   var photoUrl=s?.photo_url||null;
   if(selectedPhoto){
    status.textContent='Mengompres dan mengunggah foto...';showToast('Menyiapkan foto siswa...','info');
    var uploadFile=await prepareStudentPhoto(selectedPhoto);
    var path=currentUser.id+'/student_'+Date.now()+'.jpg';
    var uploaded=null,lastUploadError=null;
    for(var attempt=0;attempt<2;attempt++){
     try{
      uploaded=await sb.storage.from('avatars').upload(path,uploadFile,{cacheControl:'3600',upsert:false,contentType:'image/jpeg'});
      if(!uploaded.error)break;
      lastUploadError=uploaded.error;
      if(attempt===0&&/failed to fetch|network|timeout|temporar/i.test(String(uploaded.error.message||''))){await new Promise(function(resolve){setTimeout(resolve,800);});continue;}
      throw uploaded.error;
     }catch(uploadErr){
      lastUploadError=uploadErr;
      if(attempt===0&&/failed to fetch|networkerror|network request failed|load failed|network|timeout|temporar/i.test(String(uploadErr&&uploadErr.message||uploadErr))){await new Promise(function(resolve){setTimeout(resolve,800);});continue;}
      throw uploadErr;
     }
    }
    if(!uploaded||uploaded.error)throw lastUploadError||new Error('Upload foto gagal.');
    photoUrl=sb.storage.from('avatars').getPublicUrl(uploaded.data.path).data.publicUrl;
    status.textContent='Foto berhasil diunggah. Menyimpan data siswa...';
   }
   var p={nis:document.getElementById('std_nis').value.trim(),name:document.getElementById('std_name').value.trim(),class_id:document.getElementById('std_class').value,gender:document.getElementById('std_gender').value,birthplace:document.getElementById('std_birthplace').value.trim(),birthdate:document.getElementById('std_birthdate').value,address:document.getElementById('std_address').value.trim(),photo_url:photoUrl};
   var saved=await saveData('students',p,id);
   if(!saved){saveButton.disabled=false;saveButton.textContent='Coba Simpan Lagi';return;}
   closeModal();await renderStudents();
  }catch(err){
   console.error('Simpan data/foto siswa:',err);
   var msg=String(err&&err.message||err||'Kesalahan tidak diketahui');
   if(/failed to fetch|networkerror|network request failed|load failed/i.test(msg))showToast('Gagal terhubung ke Supabase saat upload/menyimpan. Cek koneksi internet HP dan URL proyek Supabase. Jika berulang, periksa status Supabase serta izin bucket avatars.','error');
   else if(/row-level security|permission|unauthorized|not allowed/i.test(msg))showToast('Supabase menolak akses. Periksa Storage Policies/RLS untuk bucket avatars dan izin tabel students.','error');
   else showToast('Gagal menyimpan data siswa: '+msg,'error');
   saveButton.disabled=false;saveButton.textContent='Coba Simpan Lagi';
  }
 };
}
async function renderClasses(){
 var results=await Promise.all([DB.get('classes'),DB.get('students')]);
 var cl=results[0]||[],st=results[1]||[];
 var esc=function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');};
 var totalCls=cl.length,totalStu=st.length;
 var avgPer=totalCls?Math.round(totalStu/totalCls):0;
 var waliFilled=cl.filter(function(c){return String(c.homeroom||'').trim();}).length;
 var sorted=cl.slice().sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''),'id',{numeric:true});});
 var maxCnt=1;sorted.forEach(function(c){var n=st.filter(function(s){return s.class_id===c.id;}).length;if(n>maxCnt)maxCnt=n;});
 var avatars=['from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-violet-500 to-purple-600','from-rose-500 to-pink-600','from-amber-500 to-orange-600','from-cyan-500 to-sky-600','from-fuchsia-500 to-purple-600','from-lime-500 to-green-600'];
 window.gsFilterClassTable=function(q){
  q=String(q||'').toLowerCase().trim();var vis=0;
  var rows=document.querySelectorAll('#classTableBody tr.gs-cls-row');
  for(var i=0;i<rows.length;i++){var tr=rows[i];var hay=(tr.getAttribute('data-search')||'').toLowerCase();var show=!q||hay.indexOf(q)>=0;tr.style.display=show?'':'none';if(show)vis++;}
  var nr=document.getElementById('gsClsNoResult');if(nr)nr.style.display=vis?'none':'';
 };
 var icCap='<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>';
 var icUsers='<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>';
 var icChart='<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>';
 var icCheck='<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>';
 var statCard=function(label,val,iconBg,svg){return '<div class="stat-card bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3.5"><div class="p-2.5 rounded-xl shrink-0 '+iconBg+'">'+svg+'</div><div class="min-w-0"><p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">'+label+'</p><p class="text-2xl font-black text-slate-800 dark:text-white leading-tight">'+val+'</p></div></div>';};
 var rows=sorted.map(function(c,i){
  var cnt=st.filter(function(s){return s.class_id===c.id;}).length;
  var pct=Math.max(4,Math.round(cnt/maxCnt*100));
  var av=avatars[i%avatars.length];
  var init=(String(c.name||'?').trim().charAt(0).toUpperCase())||'?';
  var waliInit=String(c.homeroom||'').trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0).toUpperCase();}).join('');
  return '<tr class="gs-cls-row" data-search="'+esc((c.name||'')+' '+(c.homeroom||''))+'">'+
   '<td class="text-center text-slate-400 font-bold">'+(i+1)+'</td>'+
   '<td><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-gradient-to-br '+av+' text-white flex items-center justify-center font-black shadow-md shrink-0">'+esc(init)+'</div><div class="min-w-0"><p class="font-bold text-slate-800 dark:text-white truncate">'+esc(c.name||'-')+'</p><p class="text-[11px] text-slate-400 font-medium">Rombongan Belajar</p></div></div></td>'+
   '<td>'+(String(c.homeroom||'').trim()?'<div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">'+esc(waliInit||'?')+'</div><span class="text-slate-600 dark:text-slate-300 font-medium">'+esc(c.homeroom)+'</span></div>':'<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/70 dark:border-amber-800/50 px-2 py-1 rounded-md">Belum ada wali</span>')+'</td>'+
   '<td class="text-center"><span class="inline-flex items-center justify-center min-w-[2.4rem] px-2.5 py-1 rounded-lg text-xs font-black text-white bg-gradient-to-br '+av+' shadow-sm">'+cnt+'</span></td>'+
   '<td class="min-w-[150px]"><div class="flex items-center gap-2"><div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r '+av+' transition-all duration-700" style="width:'+pct+'%"></div></div><span class="text-[11px] font-bold text-slate-400 w-9 text-right">'+pct+'%</span></div></td>'+
   '<td><div class="flex items-center justify-center gap-1.5">'+
    '<button onclick="classForm(\''+c.id+'\')" title="Edit kelas" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white active:scale-90 transition shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg></button>'+
    '<button onclick="deleteData(\'classes\',\''+c.id+'\',renderClasses)" title="Hapus kelas" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white active:scale-90 transition shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg></button>'+
   '</div></td>'+
  '</tr>';
 }).join('');
 var noResultRow='<tr id="gsClsNoResult" style="display:none"><td colspan="6"><div class="py-10 px-6 text-center flex flex-col items-center gap-2"><svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg><span class="text-sm font-medium text-slate-500 dark:text-slate-400">Tidak ada kelas yang cocok dengan pencarian.</span></div></td></tr>';
 var emptyState='<tr><td colspan="6"><div class="py-14 px-6 text-center"><div class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-slate-700 dark:to-slate-700 flex items-center justify-center mb-4 text-indigo-500 dark:text-indigo-300">'+icCap+'</div><h4 class="font-bold text-slate-700 dark:text-slate-200 text-lg">Belum Ada Data Kelas</h4><p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Mulai bangun struktur kelas sekolah Anda. Tambahkan kelas pertama, tunjuk wali kelas, lalu distribusikan siswa ke dalamnya.</p><button onclick="classForm()" class="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>Tambah Kelas Pertama</button></div></td></tr>';
 document.getElementById('content').innerHTML=
  '<div class="space-y-5 fade-in">'+
   '<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-700 p-5 md:p-6 shadow-lg hero-pattern">'+
    '<div class="absolute -right-5 -bottom-9 opacity-10 pointer-events-none"><svg class="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v2.73L12 20l7-4.09v-2.73L12 17l-7-3.82z"/></svg></div>'+
    '<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">'+
     '<div class="flex items-center gap-3.5"><div class="bg-white/15 backdrop-blur p-3 rounded-2xl border border-white/20 text-white shadow-inner"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg></div><div><h3 class="text-white font-black text-xl md:text-2xl tracking-wide">MANAJEMEN KELAS</h3><p class="text-blue-100/90 text-sm mt-0.5">Kelola daftar kelas, wali kelas, dan distribusi siswa</p></div></div>'+
     '<button onclick="classForm()" class="inline-flex items-center justify-center gap-2 bg-white text-blue-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-50 hover:shadow-lg active:scale-[.98] transition w-full md:w-auto"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/></svg>Tambah Kelas</button>'+
    '</div>'+
   '</div>'+
   '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">'+
    statCard('Total Kelas',totalCls,'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300',icCap)+
    statCard('Total Siswa',totalStu,'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',icUsers)+
    statCard('Rata-rata / Kelas',avgPer,'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',icChart)+
    statCard('Wali Terisi',waliFilled+'/'+totalCls,'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300',icCheck)+
   '</div>'+
   '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">'+
    '<div class="px-4 md:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">'+
     '<div class="flex items-center gap-2"><h4 class="font-bold text-sm md:text-base text-slate-700 dark:text-slate-200">Daftar Kelas</h4><span class="text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">'+totalCls+' kelas</span></div>'+
     '<div class="relative sm:w-72"><svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><input type="text" placeholder="Cari nama kelas / wali kelas..." oninput="gsFilterClassTable(this.value)" class="cls-search-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"/></div>'+
    '</div>'+
    '<div class="overflow-x-auto">'+
     '<table class="gs-elegant-table text-sm text-left">'+
      '<thead><tr><th class="text-center">No</th><th>Kelas</th><th>Wali Kelas</th><th class="text-center">Jumlah Siswa</th><th>Distribusi Siswa</th><th class="text-center">Aksi</th></tr></thead>'+
      '<tbody id="classTableBody">'+(totalCls?rows+noResultRow:emptyState)+'</tbody>'+
      (totalCls?'<tfoot><tr><td colspan="3" class="font-black uppercase tracking-wider">Total</td><td class="text-center font-black">'+totalStu+' siswa</td><td colspan="2" class="text-right text-slate-400 dark:text-slate-500 font-semibold">Rata-rata '+avgPer+' siswa/kelas</td></tr></tfoot>':'')+
     '</table>'+
    '</div>'+
   '</div>'+
  '</div>';
}
async function classForm(id){
 var c=null;
 if(id){c=(await DB.get('classes')).find(function(x){return x.id===id;});}
 openModal(id?'Edit Kelas':'Tambah Kelas',
  '<form id="classForm" class="space-y-4">'+
   '<div class="rounded-2xl border border-indigo-100 dark:border-slate-600 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-slate-700/40 dark:to-slate-700/30 p-4 space-y-4">'+
    '<div><label for="cls_name" class="cls-form-label">Nama Kelas <span class="text-rose-500">*</span></label><div class="relative"><span class="cls-input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg></span><input type="text" id="cls_name" value="'+(c?.name||'')+'" placeholder="cth: VII-A" class="cls-form-input gs-has-icon" required></div></div>'+
    '<div><label for="cls_homeroom" class="cls-form-label">Wali Kelas</label><div class="relative"><span class="cls-input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg></span><input type="text" id="cls_homeroom" value="'+(c?.homeroom||'')+'" placeholder="cth: Budi Santoso, S.Pd." class="cls-form-input gs-has-icon"></div></div>'+
   '</div>'+
   '<div class="flex gap-2.5 pt-1">'+
    '<button type="button" onclick="closeModal()" class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[.98] transition">Batal</button>'+
    '<button type="submit" class="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg active:scale-[.98] transition">'+(id?'Simpan Perubahan':'Simpan Kelas')+'</button>'+
   '</div>'+
  '</form>');
 document.getElementById('classForm').onsubmit=async function(e){e.preventDefault();var p={name:document.getElementById('cls_name').value,homeroom:document.getElementById('cls_homeroom').value};await saveData('classes',p,id);closeModal();renderClasses();};
}
async function renderSubjects(){
  var sub=await DB.get('subjects');
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">MATA PELAJARAN</h3><p class="text-purple-100 text-sm">Daftar Mata Pelajaran Sekolah</p></div>'+
        '</div>'+
        '<button onclick="subjectForm()" class="bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-purple-50 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Tambah Mapel</button>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3">Kode</th>'+
                '<th class="px-3 py-3">Nama Mata Pelajaran</th>'+
                '<th class="px-3 py-3">Guru Pengampu</th>'+
                '<th class="px-3 py-3 text-center">KKM</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (sub.length?sub.map(function(s,i){
                var kkmStatus=s.kkm>=75?'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300':'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300';
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3"><span class="inline-flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-mono font-bold">'+s.code+'</span></td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+s.name+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">'+(s.teacher||'?').charAt(0).toUpperCase()+'</div><span>'+(s.teacher||'-')+'</span></div></td>'+
                  '<td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold '+kkmStatus+'">'+s.kkm+'</span></td>'+
                  '<td class="px-3 py-3">'+
                    '<div class="flex items-center justify-center gap-1.5">'+
                      '<button onclick="subjectForm(\''+s.id+'\')" class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition" title="Edit Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
                      '<button onclick="deleteData(\'subjects\',\''+s.id+'\',renderSubjects)" class="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition" title="Hapus Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg></button>'+
                    '</div>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="6" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg><p class="text-sm">Belum ada data mata pelajaran.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function subjectForm(id){var s=null;if(id){s=(await DB.get('subjects')).find(function(x){return x.id===id;});}openModal('Tambah Mapel','<form id="subjectForm" class="space-y-4"><div><label class="block text-sm mb-1">Kode</label><input type="text" id="sub_code" value="'+(s?.code||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Nama Mapel</label><input type="text" id="sub_name" value="'+(s?.name||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Guru Pengampu</label><input type="text" id="sub_teacher" value="'+(s?.teacher||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">KKM</label><input type="number" id="sub_kkm" value="'+(s?.kkm||75)+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Simpan</button></form>');document.getElementById('subjectForm').onsubmit=async function(e){e.preventDefault();var p={code:document.getElementById('sub_code').value,name:document.getElementById('sub_name').value,teacher:document.getElementById('sub_teacher').value,kkm:parseInt(document.getElementById('sub_kkm').value)};await saveData('subjects',p,id);closeModal();renderSubjects();};}
async function saveData(key,data,id){var result=null;if(id){result=await DB.update(key,id,data);}else{result=await DB.insert(key,data);}if(result){showToast('Data disimpan!','success');return true;}return false;}
async function deleteData(key,id,callback){var ok=confirm('KONFIRMASI PENGHAPUSAN\n\nTabel: '+String(key)+'\nID data: '+String(id)+'\n\nData yang dihapus tidak dapat dikembalikan kecuali tersedia backup. Lanjutkan?');if(!ok){try{gsAudit('DELETE_CANCELLED',key,id);}catch(e){}return;}var removed=await DB.remove(key,id);if(removed){try{gsAudit('DELETE_CONFIRMED',key,id);}catch(e){}}if(typeof callback==='function')callback();else if(typeof callback==='string'&&typeof window[callback]==='function'){window[callback]();}}
function filterTable(searchId,tbodyId){var input=document.getElementById(searchId).value.toLowerCase();var rows=document.getElementById(tbodyId).getElementsByTagName('tr');for(var i=0;i<rows.length;i++){rows[i].style.display=rows[i].innerText.toLowerCase().includes(input)?'':'none';}}
async function annForm(id){var a=null;if(id){a=(await DB.get('announcements')).find(function(x){return x.id===id;});}openModal('Buat Pengumuman','<form id="annForm" class="space-y-4"><div><label class="block text-sm mb-1">Judul</label><input type="text" id="an_title" value="'+(a?.title||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Isi</label><textarea id="an_content" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(a?.content||'')+'</textarea></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('annForm').onsubmit=async function(e){e.preventDefault();var p={title:document.getElementById('an_title').value,content:document.getElementById('an_content').value,date:new Date().toISOString().split('T')[0]};await saveData('announcements',p,id);closeModal();loadAnnListDash();};}

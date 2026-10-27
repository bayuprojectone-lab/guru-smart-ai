
// Efek Confetti Bintang saat Benar / Juara
function kls_confetti() {
    var colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
    for (var i = 0; i < 50; i++) {
        var conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.zIndex = '9999';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-20px';
        conf.style.width = '12px';
        conf.style.height = '12px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        conf.style.boxShadow = '0 0 10px ' + conf.style.backgroundColor;
        conf.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        conf.style.transition = 'top 2.5s ease-out, transform 2.5s ease-out, opacity 2.5s ease-out';
        document.body.appendChild(conf);
        setTimeout(function() {
            conf.style.top = '100vh';
            conf.style.transform = 'rotate(720deg) translateX(50px)';
            conf.style.opacity = '0';
        }, 50);
        setTimeout(function() { conf.remove(); }, 3000);
    }
}

// --- SISTEM AUDIO KUIS & YOUTUBE BACKSOUND ---
var kls_audioCtx = null;
var kls_ytPlayer = null;
var kls_ytApiLoaded = false;

function kls_loadYouTubeApi() {
    if (kls_ytApiLoaded) return;
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    kls_ytApiLoaded = true;
}

function kls_initYTPlayer() {
    if (!document.getElementById('kls-yt-player')) {
        var div = document.createElement('div');
        div.id = 'kls-yt-player';
        div.style.cssText = 'position:fixed; top:-9999px; left:-9999px; width:1px; height:1px; opacity:0;';
        document.body.appendChild(div);
    }

    window.onYouTubeIframeAPIReady = function() {
        kls_ytPlayer = new YT.Player('kls-yt-player', {
            videoId: 'c6xBncftsUU', 
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'loop': 1,
                'playlist': 'c6xBncftsUU', 
                'mute': 0
            },
            events: {
                'onReady': function(event) {
                    event.target.setVolume(30); 
                    event.target.playVideo();
                }
            }
        });
    };
}

function kls_unlockAudio() {
    if (!kls_audioCtx) kls_audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (kls_audioCtx.state === 'suspended') {
        kls_audioCtx.resume().catch(function(e){ console.error("Audio resume failed", e); });
    }
}

function playBuzzerHorn() {
    kls_unlockAudio();
    var ctx = kls_audioCtx;
    var freqs = [196.00, 261.63, 329.63, 392.00, 523.25];
    var masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 0.03);
    masterGain.gain.setValueAtTime(0.8, ctx.currentTime + 0.4);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    masterGain.connect(ctx.destination);
    freqs.forEach(function(f) {
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        var gain = ctx.createGain();
        gain.gain.value = 0.2;
        osc.detune.value = Math.random() * 10 - 5;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
    });
}

function playCorrectSound() {
    kls_unlockAudio(); 
    var ctx = kls_audioCtx;
    if(!ctx) return;
    var notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        var t = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.5, t + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
    });
}

function playWrongSound() {
    kls_unlockAudio(); 
    var ctx = kls_audioCtx;
    if(!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.4, ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
}

function playBgMusic() {
    if (!kls_ytPlayer) {
        kls_loadYouTubeApi();
        kls_initYTPlayer();
    } else {
        try {
            kls_ytPlayer.setVolume(30);
            kls_ytPlayer.playVideo();
        } catch(e) {}
    }
}

function stopBgMusic() {
    if (kls_ytPlayer) {
        try {
            kls_ytPlayer.pauseVideo();
        } catch(e) {}
    }
}

var kls_data = { soal: [], kelompok: [], skor: {}, soalIndex: 0, mode: 'Rebutan', timer: 15, intervalId: null, currentTeam: null, poin: 100, isBuzzed: false, isLocked: false, currentRoom: null, realtimeChannel: null, fallbackInterval: null, results: [], title: '', shuffle: true };

var kls_opt_colors = [
    { grad: 'from-rose-500 to-red-700', glow: 'shadow-[0_8px_30px_rgba(244,63,94,0.5)]', border: 'border-rose-400' },
    { grad: 'from-sky-500 to-blue-700', glow: 'shadow-[0_8px_30px_rgba(59,130,246,0.5)]', border: 'border-sky-400' },
    { grad: 'from-amber-400 to-orange-600', glow: 'shadow-[0_8px_30px_rgba(251,191,36,0.5)]', border: 'border-amber-400' },
    { grad: 'from-emerald-400 to-green-600', glow: 'shadow-[0_8px_30px_rgba(16,185,129,0.5)]', border: 'border-emerald-400' }
];

var kls_team_colors = [
    { grad: 'from-fuchsia-500 to-purple-700', glow: 'shadow-[0_8px_30px_rgba(217,70,239,0.4)]' },
    { grad: 'from-cyan-400 to-blue-600', glow: 'shadow-[0_8px_30px_rgba(34,211,238,0.4)]' },
    { grad: 'from-violet-500 to-indigo-700', glow: 'shadow-[0_8px_30px_rgba(139,92,246,0.4)]' },
    { grad: 'from-orange-400 to-rose-600', glow: 'shadow-[0_8px_30px_rgba(251,146,60,0.4)]' }
];

async function renderKuisKelas() {
    if (kls_data.fallbackInterval) clearInterval(kls_data.fallbackInterval);
    if (kls_data.realtimeChannel) kls_data.realtimeChannel.unsubscribe();
    stopBgMusic();

    var html = '';
    html += '<div class="space-y-6">';
    
    html += '<div class="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg overflow-hidden">';
    html += '  <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>';
    html += '  <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 pointer-events-none"></div>';
    html += '  <div class="relative flex flex-col md:flex-row justify-between items-center gap-4 text-white">';
    html += '    <div class="flex items-center gap-4">';
    html += '      <div class="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-md">';
    html += '        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>';
    html += '      </div>';
    html += '      <div>';
    html += '        <h2 class="text-xl font-bold tracking-wide">Modul Kuis Kelas</h2>';
    html += '        <p class="text-blue-100 text-sm">Buat kuis interaktif dengan mode Buzzer Multi-Device Real-time!</p>';
    html += '      </div>';
    html += '    </div>';
    html += '    <button onclick="kls_form()" class="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-lg shadow hover:bg-blue-50 transition flex items-center gap-2">';
    html += '      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>';
    html += '      Buat Kuis Baru';
    html += '    </button>';
    html += '  </div>';
    html += '</div>';

    html += '  <div id="kls_live_container" class="hidden"></div>';
    
    html += '  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">';
    html += '    <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> Daftar Kuis Tersimpan</h3>';
    html += '    <div id="kls_list" class="grid grid-cols-1 md:grid-cols-3 gap-4">Memuat data...</div>';
    html += '  </div>';
    html += '</div>';
    
    document.getElementById('content').innerHTML = html;
    await kls_loadList();
}

async function kls_loadList() {
    var box = document.getElementById('kls_list');
    if (!box) return;
    box.innerHTML = '<div class="col-span-full text-center py-10 text-slate-500"><span class="inline-block animate-spin mr-2">⟳</span> Memuat daftar kuis...</div>';

    try {
        if (!currentUser || !currentUser.id) {
            box.innerHTML = '<div class="col-span-full text-center py-8 text-amber-600 bg-amber-50 rounded-xl">Sesi pengguna belum aktif. Silakan keluar lalu masuk kembali.</div>';
            return;
        }

        // Ambil data kuis langsung agar pesan error database tidak tertelan oleh DB.get().
        var result = await sb.from('kuis_kelas')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (result.error) {
            console.error('Gagal memuat kuis kelas:', result.error);
            box.innerHTML = '<div class="col-span-full text-center py-8 px-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl"><b>Daftar kuis gagal dimuat.</b><p class="mt-2 text-sm">' +
                String(result.error.message || 'Periksa tabel kuis_kelas dan izin akses Supabase.').replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}) +
                '</p><button onclick="kls_loadList()" class="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">Coba Muat Ulang</button></div>';
            return;
        }

        var list = Array.isArray(result.data) ? result.data : [];
        if (!list.length) {
            box.innerHTML = '<div class="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg><p class="mt-2 text-slate-600 dark:text-slate-300 font-medium">Belum ada kuis tersimpan.</p><p class="mt-1 text-sm text-slate-500">Klik “Buat Kuis Baru” untuk membuat kuis pertama.</p></div>';
            return;
        }

        var esc = function(v) {
            return String(v == null ? '' : v).replace(/[&<>"]/g, function(c) {
                return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
            });
        };
        var html = '';
        list.forEach(function(k) {
            var qs = [];
            try {
                qs = Array.isArray(k.soal) ? k.soal : (typeof k.soal === 'string' ? JSON.parse(k.soal || '[]') : []);
                if (!Array.isArray(qs)) qs = [];
            } catch (parseErr) {
                console.warn('Format soal kuis tidak valid:', k.id, parseErr);
            }

            var id = String(k.id == null ? '' : k.id).replace(/'/g, "\\'");
            var title = esc(k.title || k.nama_kuis || 'Kuis tanpa judul');
            var mode = esc(k.mode || 'Rebutan');
            html += '<div class="group relative bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">';
            html += '<div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>';
            html += '<div class="relative z-10"><span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-md inline-block mb-3">' + mode + '</span>';
            html += '<h4 class="font-bold text-slate-800 dark:text-white text-lg break-words">' + title + '</h4>';
            html += '<p class="text-xs text-slate-500 dark:text-slate-400 mt-2">📝 ' + qs.length + ' soal</p></div>';
            html += '<div class="relative z-10 mt-5 flex gap-2">';
            html += '<button onclick="kls_start(\'' + id + '\')" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-2.5 rounded-lg flex items-center justify-center gap-1 shadow-md hover:from-green-600 hover:to-emerald-700">▶ Mulai</button>';
            html += '<button onclick="kls_form(\'' + id + '\')" title="Edit kuis" class="bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-white text-sm font-semibold px-3 py-2 rounded-lg">✎</button>';
            html += '<button onclick="deleteData(\'kuis_kelas\',\'' + id + '\',\'kls_loadList\')" title="Hapus kuis" class="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-3 py-2 rounded-lg">🗑</button>';
            html += '</div></div>';
        });
        box.innerHTML = html;
    } catch (e) {
        console.error('Error Kls LoadList:', e);
        var message = String(e && e.message ? e.message : e).replace(/[&<>"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});
        box.innerHTML = '<div class="col-span-full text-center py-8 px-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl"><b>Terjadi kesalahan saat menampilkan kuis.</b><p class="mt-2 text-sm">' + message + '</p><button onclick="kls_loadList()" class="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">Coba Muat Ulang</button></div>';
    }
}

async function kls_form(id) {
    var k = null;
    var sub = await DB.get('subjects');
    var cls = await DB.get('classes');
    if (id) {
        k = (await DB.get('kuis_kelas')).find(function(x) { return x.id === id; });
    }
    
    var subOpts = sub.map(function(s) { return '<option value="'+s.id+'" '+(k?.subject_id==s.id?'selected':'')+'>'+s.name+'</option>'; }).join('');
    var clsOpts = cls.map(function(c) { return '<option value="'+c.id+'" '+(k?.class_id==c.id?'selected':'')+'>'+c.name+'</option>'; }).join('');
    
    var formHtml = '<form id="kls_form_html" class="space-y-4">';
    formHtml += '<div class="bg-indigo-50 dark:bg-slate-700 p-3 rounded-lg text-sm text-indigo-600 dark:text-indigo-300 flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-none mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>Isi judul/materi, lalu AI akan membuatkan soal pilihan ganda sesuai jumlah yang diminta. Mapel BOLEH DILEWATI - biarkan pilihan "Otomatis" dan AI akan mendeteksi sendiri mata pelajaran dari judul materi. Atau pilih SEMUA mapel kurikulum Indonesia (PAUD-SD-SMP-SMA-SMK-Madrasah) plus Bahasa Daerah (Jawa, Sunda, Betawi, Palembang, dll) di daftar; bila tidak ada, ketik sendiri di kolom bawahnya.</span></div>';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Nama Kuis / Materi</label><input type="text" id="kls_title" value="'+(k?.title||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required></div>';
    formHtml += '<div class="grid grid-cols-2 gap-4">';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Mapel (opsional)</label><select id="kls_subject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"><option value="auto" '+(!k||!k.subject_id?'selected':'')+'>🤖 Otomatis - AI pilihkan mapel dari judul materi</option>'+window.gsMapelOptionsHTML(sub,k?.subject_id)+'</select><input type="text" id="kls_subject_custom" placeholder="atau ketik mapel lain (bebas): mis. Bahasa Sunda, Tahfidz, Robotika..." class="mt-2 w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"></div>';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Kelas</label><select id="kls_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">'+clsOpts+'</select></div>';
    formHtml += '</div>';
    formHtml += '<div class="grid grid-cols-2 gap-4">';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Jumlah Soal</label><input type="number" id="kls_jumlah" value="'+(k?.jumlah||5)+'" min="1" max="20" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required></div>';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Poin / Soal</label><input type="number" id="kls_poin" value="'+(k?.poin||100)+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"></div>';
    formHtml += '</div>';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Nama Siswa / Kelompok (pisahkan dengan koma)</label><input type="text" id="kls_kelompok" value="'+(k?.kelompok||'Siswa 1, Siswa 2, Siswa 3, Siswa 4')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"><p class="text-xs text-slate-500 mt-1">Untuk laporan per siswa, masukkan nama siswa satu per satu.</p></div>'; 
    formHtml += '<label class="flex items-center gap-3 rounded-lg border p-3 text-sm dark:border-slate-600"><input type="checkbox" id="kls_shuffle" '+((!k || k.shuffle!==false)?'checked':'')+'><span><b>Acak urutan soal</b><span class="block text-xs text-slate-500">Urutan diacak setiap permainan dimulai.</span></span></label>';
    formHtml += '<div class="grid grid-cols-2 gap-4">';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Mode Permainan</label><select id="kls_mode" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"><option '+(k?.mode=='Rebutan'?'selected':'')+'>🔔 Rebutan/Buzzer</option><option '+(k?.mode=='Cepat Tepat'?'selected':'')+'>⚡ Cepat Tepat</option><option '+(k?.mode=='Kelompok'?'selected':'')+'>👥 Kelompok</option><option '+(k?.mode=='Final'?'selected':'')+'>🏆 Final</option></select></div>';
    formHtml += '<div><label class="block text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">Waktu / Soal (detik)</label><input type="number" id="kls_waktu" value="'+(k?.waktu||15)+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"></div>';
    formHtml += '</div>';
    formHtml += '<button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:from-blue-700 hover:to-indigo-700 transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Generate & Simpan Kuis</button>';
    formHtml += '</form>';
        
    openModal(id ? 'Edit Kuis Kelas' : 'Buat Kuis Baru', formHtml);
    
    document.getElementById('kls_form_html').onsubmit = async function(e) {
        e.preventDefault();
        var btn = this.querySelector('button[type="submit"]');
        btn.disabled = true; 
        btn.innerText = 'AI Membuat Soal...';
        
        var title = document.getElementById('kls_title').value;
        var subId = document.getElementById('kls_subject').value;
        var clsId = document.getElementById('kls_class').value;
        var jumlah = document.getElementById('kls_jumlah').value;
        var kelompok = document.getElementById('kls_kelompok').value;
        var mode = document.getElementById('kls_mode').value;
        var waktu = document.getElementById('kls_waktu').value;
        var poin = document.getElementById('kls_poin').value;
        var shuffleQuestions = !!document.getElementById('kls_shuffle').checked;
        
        var subCustom = (document.getElementById('kls_subject_custom')||{}).value || '';
        var subName = '';
        if (subCustom.trim()) { subName = subCustom.trim(); subId = ''; }
        else if (String(subId) === 'auto') { subName = ''; subId = ''; }
        else if (String(subId).indexOf('nm:') === 0) { subName = String(subId).slice(3); subId = ''; }
        else { subName = sub.find(function(x){ return x.id === subId; })?.name || ''; }
        var mapelPart = subName ? ' untuk mata pelajaran ' + subName : ' (deteksi sendiri mata pelajaran yang paling sesuai dari judul materi ini)';
        var clsName = cls.find(function(x){ return x.id === clsId; })?.name || '';
        
        try {
            var sysPrompt = 'Anda adalah generator soal pilihan ganda. Balas HANYA dengan JSON Array murni tanpa teks pembuka, tanpa penjelasan, tanpa markdown. Format persis: [{"text":"Pertanyaan...","options":["A. Opsi1","B. Opsi2","C. Opsi3","D. Opsi4"],"answer":"A","explanation":"Pembahasan singkat mengapa jawaban benar"}] KUNCI WAJIB BENAR (anti karangan): hitung dulu setiap soal sampai pasti sebelum menyusun opsi; gunakan angka yang hasilnya rapi; kunci harus hasil perhitungan nyata; pengecoh masuk akal tetapi jelas berbeda dari kunci; hanya satu opsi benar. SEBARANG APA PUN mapel atau materi yang diminta (termasuk yang tidak ada di data sekolah), tetap buatkan soal berdasarkan pengetahuan kurikulum Indonesia sesuai jenjang kelas yang diminta. '+window.GS_SOAL_STANDAR;
            var res = await callAIWithAutoUpgrade([{role:'system',content:sysPrompt},{role:'user',content:'Buatkan '+jumlah+' soal pilihan ganda tentang '+title+mapelPart+(clsName?' kelas '+clsName:'')+'. Bila mapel ini tidak ada di data sekolah, tetap buatkan soalnya berdasarkan pengetahuan kurikulum Indonesia (Kurikulum Merdeka) sesuai jenjang kelas.'}]);
            var content = typeof res === 'string' ? res : (res?.message?.content || res?.text || '');
            var soalArr = gsParseSoalJSON(content);
            if (!soalArr || !soalArr.length) {
                var res2 = await callAIWithAutoUpgrade([{role:'system',content:sysPrompt},{role:'user',content:'Balas HANYA JSON Array berisi '+jumlah+' soal pilihan ganda tentang '+title+mapelPart+(clsName?' kelas '+clsName:'')+' sesuai kurikulum Indonesia. DILARANG menulis teks apa pun selain JSON Array.'}]);
                var content2 = typeof res2 === 'string' ? res2 : (res2?.message?.content || res2?.text || '');
                soalArr = gsParseSoalJSON(content2);
            }
            if (!soalArr || !soalArr.length) throw new Error('AI tidak mengembalikan soal dalam format JSON yang valid. Coba lagi.');
            
            var dataToSave = {
                title: title, subject_id: subId||null, class_id: clsId||null, jumlah: parseInt(jumlah),
                kelompok: kelompok, mode: mode, waktu: Math.max(5,parseInt(waktu)||15), poin: Math.max(1,parseInt(poin)||100), shuffle: shuffleQuestions,
                soal: JSON.stringify(soalArr)
            };
            
            var savedKuis = await saveData('kuis_kelas', dataToSave, id);
            if (!savedKuis) { btn.disabled = false; btn.innerText = '⚡ Generate & Simpan Kuis'; return; }
            closeModal();
            kls_loadList();
            showToast('Kuis berhasil dibuat!', 'success');
        } catch(err) {
            showToast('Gagal generate soal: ' + err.message, 'error');
            btn.disabled = false; 
            btn.innerText = '⚡ Generate & Simpan Kuis';
        }
    };
}

async function kls_start(id) {
    var k = (await DB.get('kuis_kelas')).find(function(x) { return x.id === id; });
    if (!k) return;
    
    kls_data.soal = JSON.parse(k.soal);
    kls_data.title = k.title || 'Kuis Kelas';
    kls_data.shuffle = k.shuffle !== false;
    if (kls_data.shuffle) { for (var si=kls_data.soal.length-1; si>0; si--) { var sj=Math.floor(Math.random()*(si+1)); var st=kls_data.soal[si]; kls_data.soal[si]=kls_data.soal[sj]; kls_data.soal[sj]=st; } }
    kls_data.results = [];
    kls_data.kelompok = k.kelompok.split(',').map(function(x){ return x.trim(); });
    kls_data.skor = {};
    kls_data.kelompok.forEach(function(t){ kls_data.skor[t] = 0; });
    kls_data.soalIndex = 0;
    kls_data.mode = k.mode;
    kls_data.timer = k.waktu;
    kls_data.poin = k.poin;
    kls_data.currentTeam = null;
    kls_data.isBuzzed = false;
    kls_data.isLocked = false;
    if(kls_data.intervalId) clearInterval(kls_data.intervalId); 
    
    kls_data.currentRoom = 'kls-' + Math.random().toString(36).substr(2, 6);
    await sb.from('kuis_buzzer').delete().eq('room', kls_data.currentRoom);
    
    if (kls_data.realtimeChannel) kls_data.realtimeChannel.unsubscribe();
    
    kls_data.realtimeChannel = sb.channel(kls_data.currentRoom, {
      config: { broadcast: { self: false } }
    })
      .on('broadcast', { event: 'buzz' }, function(payload) {
          if (payload && payload.message && payload.message.team) {
              if (kls_data.kelompok.includes(payload.message.team)) {
                  kls_buzz(payload.message.team); 
              }
          }
      })
      .on('broadcast', { event: 'request_sync' }, function(payload) {
          if (kls_data.realtimeChannel) {
              kls_data.realtimeChannel.send({
                  type: 'broadcast',
                  event: 'sync',
                  payload: { teams: kls_data.kelompok }
              });
          }
      })
      .subscribe();
      
    if (kls_data.fallbackInterval) clearInterval(kls_data.fallbackInterval);
    kls_data.fallbackInterval = setInterval(async function() {
        if (kls_data.isLocked || kls_data.isBuzzed || !kls_data.currentRoom) return;
        try {
            var res = await sb.from('kuis_buzzer').select('*').eq('room', kls_data.currentRoom).limit(1);
            if (res.data && res.data.length > 0) {
                var team = res.data[0].team;
                if (kls_data.kelompok.includes(team)) {
                    kls_buzz(team);
                    await sb.from('kuis_buzzer').delete().eq('room', kls_data.currentRoom);
                }
            }
        } catch(e) {}
    }, 200);
      
    kls_showJoinQR();
}

function kls_showJoinQR() {
    var hostUrl = window.location.origin + window.location.pathname;
    // Gunakan hash-route agar tidak bergantung pada server yang mungkin menghapus query string.
    // Hash ini ditangani langsung oleh halaman Buzzer dan tidak membuka menu aplikasi biasa.
    var joinRoom = String(kls_data.currentRoom || '');
    var joinTeams = Array.isArray(kls_data.kelompok) ? kls_data.kelompok : [];
    var joinUrl = hostUrl + '#join-' + encodeURIComponent(joinRoom) + '--teams-' + encodeURIComponent(JSON.stringify(joinTeams));
    var html = '<div id="kls-join-modal" class="fixed inset-0 bg-slate-900 bg-opacity-95 z-[90] flex items-center justify-center p-4">';
    html += '<div class="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full">';
    html += '  <h2 class="text-2xl font-bold text-slate-800 mb-2">🔔 Gabung ke Buzzer Kuis</h2>';
    html += '  <p class="text-slate-500 mb-6 text-sm">Setiap tim buka kamera HP mereka, scan QR Code di bawah, lalu tekan tombol Buzzer sesuai nama tim masing-masing.</p>';
    html += '  <div id="qrcode-kls" class="flex justify-center mb-6"></div>';
    html += '  <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">';
    html += '    <p class="text-xs text-slate-400">Atau buka link ini di HP Siswa:</p>';
    html += '    <p class="text-sm text-blue-600 font-bold break-all">' + joinUrl + '</p>';
    html += '  </div>';
    html += '  <button onclick="kls_closeJoinQR()" class="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold w-full hover:bg-blue-700 transition">Mulai Kuis (Semua Sudah Siap)</button>';
    html += '</div></div>';
    
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
    
    div.querySelector('button').addEventListener('click', function() {
        kls_unlockAudio();
        playBgMusic();
    });
    
    setTimeout(function() {
        try {
            var qrEl = document.getElementById('qrcode-kls');
            qrEl.innerHTML = '';
            new QRCode(qrEl, {
                text: joinUrl,
                width: 200, height: 200,
                colorDark: "#1e293b", colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch(e) { console.error('QR Error', e); }
    }, 100);
}

function kls_closeJoinQR() {
    var m = document.getElementById('kls-join-modal');
    if(m) m.remove();
    kls_renderLive();
}

function kls_renderLive() {
    var c = document.getElementById('kls_live_container');
    if(!c) return;
    c.classList.remove('hidden');
    c.scrollIntoView({behavior:'smooth', block: 'start'});
    
    var q = kls_data.soal[kls_data.soalIndex];
    var total = kls_data.soal.length;
    var progress = ((kls_data.soalIndex + 1) / total) * 100;
    var timer = kls_data.timer;
    
    var teamStyleMap = {};
    kls_data.kelompok.forEach(function(t, i){ teamStyleMap[t] = kls_team_colors[i % kls_team_colors.length]; });
    
    var html = '';
    html += '<style>@keyframes kls_shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } } @keyframes kls_bounce { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }</style>';
    
    html += '<div class="flex flex-col lg:flex-row gap-6">';
    
    // KOLOM KIRI (SOAL & JAWABAN) - LATAR MOTIF GRID ELEGAN
    html += '  <div class="flex-1 relative bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 min-h-[500px]" style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(circle at 20% 20%, rgba(167, 139, 250, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%); background-size: 40px 40px, 40px 40px, 100% 100%, 100% 100%;">';
    html += '    <div class="relative z-10 p-6 md:p-8 text-center bg-slate-900/50 backdrop-blur-md flex flex-col justify-start min-h-full">';
    html += '      <div class="flex justify-between items-center text-white mb-6 border-b border-white/10 pb-4">';
    html += '        <div class="flex items-center gap-3">';
    html += '          <div class="bg-white/10 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="filter: drop-shadow(0 0 5px rgba(251,191,36,0.7));"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19c0 1.1-.9 2-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h1.882a1 1 0 00.941-.665l3.47-9.353a1 1 0 011.4-.538l1.27.635a1 1 0 01.53.53v3.47a1 1 0 00.293.707l.707.707a1 1 0 001.414 0l1-1a1 1 0 011.414 0l1 1a1 1 0 00.707.293h.118a1 1 0 01.998.898l.011.102a1 1 0 01-.998 1.102H21a2 2 0 01-2-2v-7a2 2 0 00-2-2h-1.882a1 1 0 01-.941-.665l-1.47-3.97a1 1 0 00-.4-.538l-1.27-.635a1 1 0 00-1.4.538l-3.47 9.353z" /></svg></div>';
    html += '          <div>';
    html += '            <p class="text-[10px] uppercase tracking-widest text-slate-400">Pertanyaan Ke</p>';
    html += '            <h3 class="font-bold text-xl text-white">'+(kls_data.soalIndex + 1)+' / '+total+'</h3>';
    html += '          </div>';
    html += '        </div>';
    html += '        <div class="flex items-center gap-2">';
    html += '          <button onclick="kls_showJoinQR()" class="bg-indigo-500/80 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h2v-2m-2 0V8.82a2 2 0 012-2h.32a2 2 0 011.86 1.24L20 12M4 13V8.82a2 2 0 012-2h.32a2 2 0 011.86 1.24L8 12M4 13h2m6 0V9.82a2 2 0 012-2h.32a2 2 0 011.86 1.24L16 12M14 13h2" /></svg> Tampilkan QR Kuis</button>';
    html += '          <button onclick="kls_stop()" class="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">Akhiri Kuis</button>';
    html += '        </div>';
    html += '      </div>';
    
    html += '      <div class="bg-slate-800 h-2 w-full rounded-full mb-6"><div class="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500" style="width:'+progress+'%; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div></div>';
    
    html += '      <p class="text-xl md:text-2xl font-extrabold text-white mb-8 tracking-wide" style="text-shadow: 0 0 15px rgba(255,255,255,0.3);">'+q.text+'</p>';
    html += '      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">';
    
    q.options.forEach(function(opt, index) {
        var safeOpt = encodeURIComponent(opt);
        var col = kls_opt_colors[index % 4];
        var cursorStyle = kls_data.isBuzzed ? 'cursor-pointer hover:scale-[1.02] hover:brightness-110' : 'cursor-not-allowed opacity-50';
        var bgIdle = kls_data.isBuzzed ? 'bg-slate-800' : 'bg-slate-800/50';
        
        html += '        <div class="opt-card '+bgIdle+' p-4 rounded-xl border-2 '+col.border+' text-white text-left font-bold transition-all shadow-sm flex items-center gap-3 '+cursorStyle+' '+col.glow+'" data-opt="'+safeOpt+'" onclick="kls_answer(decodeURIComponent(this.dataset.opt))">';
        html += '          <span class="w-10 h-10 bg-gradient-to-br '+col.grad+' text-white flex items-center justify-center rounded-lg text-lg shadow-md">'+opt.substring(0,1)+'</span>';
        html += '          <span class="flex-1">'+opt.substring(3)+'</span>';
        html += '        </div>';
    });
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    
    // KOLOM KANAN (PANEL BUZZER MANUAL, TIMER, SKOR)
    html += '  <div class="lg:w-80 flex-none bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col" style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 40px 40px, 40px 40px;">';
    html += '    <div class="relative z-10 p-6 bg-slate-900/50 backdrop-blur-md flex flex-col justify-between flex-1">';
    
    html += '      <div class="flex flex-col items-center">';
    if (!kls_data.isBuzzed && !kls_data.isLocked) {
        html += '        <h4 class="text-slate-300 font-bold mb-4 text-lg text-center">🔔 Menunggu Buzzer dari HP / atau tekan manual:</h4>';
        html += '        <div class="flex flex-col gap-3 w-full">';
        kls_data.kelompok.forEach(function(t, i) {
            var style = teamStyleMap[t];
            html += '          <button onclick="kls_buzz(\''+t+'\')" class="bg-gradient-to-r '+style.grad+' text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition transform active:scale-95 '+style.glow+'">';
            html += '            <span class="text-xl">🔔</span>'+t;
            html += '          </button>';
        });
        html += '        </div>';
    } else if (kls_data.isBuzzed && !kls_data.isLocked) {
        var style = teamStyleMap[kls_data.currentTeam];
        html += '        <div class="bg-gradient-to-r '+style.grad+' border border-white/20 text-white px-4 py-4 rounded-2xl font-bold text-xl flex flex-col items-center gap-2 animate-pulse '+style.glow+'">';
        html += '          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        html += '          <span>GILIRAN</span><span>'+kls_data.currentTeam+'</span>';
        html += '        </div>';
    } else {
         html += '        <div class="bg-slate-800 border border-slate-700 text-slate-300 px-6 py-3 rounded-lg font-bold text-base flex items-center gap-2">';
         html += '          ⏳ Menunggu soal berikutnya...';
         html += '        </div>';
    }
    html += '      </div>';
    
    html += '      <div class="mt-6 flex flex-col items-center text-white">';
    html += '        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 5px rgba(239,68,68,0.7));"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    html += '        <div class="text-4xl font-mono font-bold bg-slate-800 px-4 py-1 rounded-xl border border-slate-700" style="text-shadow: 0 0 10px rgba(255,255,255,0.3);"><span id="kls_timer">'+timer+'</span> <span class="text-sm">detik</span></div>';
    html += '        <button onclick="kls_skip()" class="mt-4 text-xs text-slate-400 hover:text-red-500 underline">Lewati Soal Ini</button>';
    html += '      </div>';
    
    html += '      <div class="mt-6 pt-4 border-t border-white/10">';
    html += '        <h4 class="text-center text-white font-bold text-sm mb-4 flex items-center justify-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 5px rgba(251,191,36,0.7));"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2-888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> SKOR REAL-TIME</h4>';
    html += '        <div class="space-y-2" id="kls_scoreboard">'+kls_renderScore()+'</div>';
    html += '      </div>';
    
    html += '    </div>';
    html += '  </div>'; 
    html += '</div>'; 
    
    c.innerHTML = html;
    
    if (!kls_data.isBuzzed && !kls_data.isLocked) {
        kls_startTimer();
        playBgMusic(); 
    }
}

function kls_renderScore() {
    var sorted = Object.entries(kls_data.skor).sort(function(a, b) { return b[1] - a[1]; });
    var medals = ['🥇', '🥈', '🥉', '4️⃣'];
    var teamStyleMap = {};
    kls_data.kelompok.forEach(function(t, i){ teamStyleMap[t] = kls_team_colors[i % kls_team_colors.length]; });
    
    var html = '';
    sorted.forEach(function(s, i) {
        var style = teamStyleMap[s[0]] || { grad: 'from-slate-500 to-slate-600', glow: '' };
        var scaleUp = i===0 ? 'border-yellow-400' : 'border-slate-700';
        html += '<div class="flex justify-between items-center border-2 '+scaleUp+' p-2 rounded-lg bg-slate-800/80">';
        html += '  <span class="text-white text-sm font-bold flex items-center gap-2 truncate">';
        html += '    <span class="text-xl">'+medals[i]+'</span> '+s[0];
        html += '  </span>';
        html += '  <div class="flex-none ml-2">';
        html += '    <div class="bg-gradient-to-r '+style.grad+' text-white px-2 py-1 rounded-md font-bold text-sm '+style.glow+'">'+s[1]+'</div>';
        html += '  </div>';
        html += '</div>';
    });
    return html;
}

function kls_buzz(team) {
    if (kls_data.isLocked) return; 
    if (kls_data.isBuzzed) return; 
    if(kls_data.intervalId) clearInterval(kls_data.intervalId); 
    
    kls_unlockAudio();
    playBuzzerHorn(); 
    
    kls_data.currentTeam = team;
    kls_data.isBuzzed = true;
    kls_renderLive();
}

function kls_answer(opt) {
    if (!kls_data.isBuzzed) {
        showToast('Tekan Buzzer dulu!', 'error');
        return;
    }
    if (kls_data.isLocked) return; 
    
    kls_data.isLocked = true; 
    if(kls_data.intervalId) clearInterval(kls_data.intervalId);
    kls_unlockAudio();
    
    var q = kls_data.soal[kls_data.soalIndex];
    var correct = q.answer;
    var isCorrect = opt.indexOf(correct + '.') === 0 || opt.startsWith(correct + '.');
    var awarded = isCorrect ? kls_data.poin : -Math.floor(kls_data.poin / 2);
    kls_data.results.push({student:kls_data.currentTeam, question:kls_data.soalIndex+1, prompt:q.text||'', selected:opt, correctAnswer:(q.options||[]).find(function(x){return x.indexOf(correct+'.')===0||x.startsWith(correct+'.');})||correct, isCorrect:isCorrect, points:awarded, explanation:q.explanation||q.pembahasan||''});
    
    var teamStyleMap = {};
    kls_data.kelompok.forEach(function(t, i){ teamStyleMap[t] = kls_team_colors[i % kls_team_colors.length]; });
    
    document.querySelectorAll('#kls_live_container .opt-card').forEach(function(el) {
        var optText = decodeURIComponent(el.dataset.opt);
        var isThisCorrect = optText.indexOf(correct + '.') === 0 || optText.startsWith(correct + '.');
        
        el.removeAttribute('onclick'); 
        el.classList.remove('cursor-pointer', 'hover:scale-105', 'hover:brightness-110', 'opacity-50');
        el.classList.add('cursor-not-allowed');
        
        if(isThisCorrect) {
            el.className = 'opt-card bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-xl border-2 border-green-300 text-white font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.7)]';
            el.style.transform = 'scale(1.05)';
            el.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>';
        } else if (optText === opt) {
            el.className = 'opt-card bg-gradient-to-r from-red-500 to-rose-600 p-4 rounded-xl border-2 border-red-300 text-white font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.7)]';
            el.style.animation = 'kls_shake 0.4s ease-in-out';
            el.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>';
        } else {
            el.className = 'opt-card bg-slate-800 p-4 rounded-xl border-2 border-slate-700 text-slate-500 opacity-50 flex items-center gap-3';
        }
    });
    
    var badgeStyle = teamStyleMap[kls_data.currentTeam] || { grad: 'from-slate-700 to-slate-800', glow: '' };
    var scoreBadge = document.createElement('div');
    scoreBadge.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] text-white text-4xl font-extrabold py-4 px-8 rounded-2xl flex items-center gap-2 bg-gradient-to-br '+badgeStyle.grad+' '+badgeStyle.glow;
    
    if (isCorrect) {
        playCorrectSound(); 
        kls_data.skor[kls_data.currentTeam] += kls_data.poin;
        scoreBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg> +'+kls_data.poin;
        scoreBadge.style.animation = 'kls_bounce 0.5s ease-out';
        document.body.appendChild(scoreBadge);
        kls_confetti();
        showToast('🎉 BENAR! '+kls_data.currentTeam+' +'+kls_data.poin+' POIN', 'success');
    } else {
        playWrongSound(); 
        kls_data.skor[kls_data.currentTeam] -= Math.floor(kls_data.poin / 2);
        scoreBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg> -'+Math.floor(kls_data.poin / 2);
        scoreBadge.style.animation = 'kls_shake 0.4s ease-in-out';
        document.body.appendChild(scoreBadge);
        showToast('❌ SALAH! Jawaban benar ditandai hijau.', 'error');
    }
    
    setTimeout(function() {
        scoreBadge.style.transition = 'opacity 0.5s, transform 0.5s';
        scoreBadge.style.opacity = '0';
        if(isCorrect) scoreBadge.style.transform = 'translate(-50%, -150%) scale(0.8)';
        else scoreBadge.style.transform = 'translate(-50%, 50%) scale(0.8)';
        setTimeout(function() { scoreBadge.remove(); }, 500);
    }, 1500);
    
    kls_updateScore();
    var explain = document.createElement('div'); explain.className='mx-auto mt-5 max-w-3xl rounded-xl border border-cyan-300/40 bg-cyan-950/90 p-4 text-left text-white shadow-lg';
    var explainTitle=document.createElement('div'); explainTitle.className='font-extrabold text-cyan-300 mb-1'; explainTitle.textContent='📘 Pembahasan Jawaban'; explain.appendChild(explainTitle);
    var explainText=document.createElement('div'); explainText.className='text-sm leading-relaxed'; explainText.textContent=q.explanation||q.pembahasan||('Kunci jawaban: '+((q.options||[]).find(function(x){return x.indexOf(correct+'.')===0||x.startsWith(correct+'.');})||correct)); explain.appendChild(explainText);
    var explainNote=document.createElement('div'); explainNote.className='text-xs text-slate-300 mt-2'; explainNote.textContent='Soal berikutnya dimulai dalam 5 detik…'; explain.appendChild(explainNote); var liveCol=document.querySelector('#kls_live_container .flex-1.relative'); if(liveCol)liveCol.appendChild(explain);
    setTimeout(function() {
        kls_data.soalIndex++;
        kls_data.currentTeam = null;
        kls_data.isBuzzed = false;
        kls_data.isLocked = false;
        if (kls_data.soalIndex < kls_data.soal.length) {
            kls_renderLive();
        } else {
            kls_end();
        }
    }, 5000); 
}

function kls_skip() {
    if (confirm('Lewati soal ini? Tidak ada poin yang ditambahkan.')) {
        if(kls_data.intervalId) clearInterval(kls_data.intervalId);
        kls_data.isLocked = true;
        showToast('Soal dilewati.', 'info');
        setTimeout(function() {
            kls_data.soalIndex++;
            kls_data.currentTeam = null;
            kls_data.isBuzzed = false;
            kls_data.isLocked = false;
            if (kls_data.soalIndex < kls_data.soal.length) {
                kls_renderLive();
            } else {
                kls_end();
            }
        }, 500);
    }
}

function kls_startTimer() {
    if(kls_data.intervalId) clearInterval(kls_data.intervalId); 
    var timer = kls_data.timer;
    var timerEl = document.getElementById('kls_timer');
    if(timerEl) timerEl.innerText = timer;
    
    kls_data.intervalId = setInterval(function() {
        timer--;
        var el = document.getElementById('kls_timer');
        if (el) el.innerText = timer;
        
        if (timer <= 0) {
            clearInterval(kls_data.intervalId);
            kls_data.intervalId = null;
            showToast('⏳ Waktu habis!', 'error');
            kls_data.isLocked = true; 
            
            setTimeout(function() {
                kls_data.soalIndex++;
                kls_data.currentTeam = null;
                kls_data.isBuzzed = false;
                kls_data.isLocked = false;
                
                if (kls_data.soalIndex < kls_data.soal.length) {
                    kls_renderLive();
                } else {
                    kls_end();
                }
            }, 500);
        }
    }, 1000);
}

function kls_updateScore() {
    var el = document.getElementById('kls_scoreboard');
    if (el) {
        el.innerHTML = kls_renderScore();
        var divs = el.querySelectorAll('div');
        divs.forEach(function(d) {
            d.style.transition = 'all 0.5s ease';
            d.style.transform = 'scale(1.05)';
            setTimeout(function() { d.style.transform = 'scale(1)'; }, 500);
        });
    }
}

function kls_end() {
    if(kls_data.intervalId) clearInterval(kls_data.intervalId);
    if(kls_data.fallbackInterval) clearInterval(kls_data.fallbackInterval);
    stopBgMusic(); 
    kls_data.intervalId = null;
    kls_data.isLocked = false;
    kls_data.isBuzzed = false;
    if (kls_data.realtimeChannel) kls_data.realtimeChannel.unsubscribe();
    
    for(var i=0; i<5; i++) {
        setTimeout(kls_confetti, i * 300);
    }
    
    var sorted = Object.entries(kls_data.skor).sort(function(a, b) { return b[1] - a[1]; });
    var html = '<div class="bg-slate-950 p-8 rounded-3xl text-center shadow-2xl border border-white/10 overflow-hidden relative">';
    html += '  <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600" style="box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>';
    html += '  <div class="mb-6 mt-4">';
    html += '    <div class="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl mb-4" style="box-shadow: 0 0 25px rgba(251,191,36,0.6);"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>';
    html += '    <h2 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-orange-500 mt-2 tracking-wider" style="text-shadow: 0 0 20px rgba(251,191,36,0.4);">JUARA HARI INI</h2>';
    html += '    <p class="text-slate-300 mt-2 text-lg">Selamat kepada pemenang! 🎉</p>';
    html += '  </div>';
    html += '  <div class="space-y-4 max-w-md mx-auto">';
    
    var gold = 'border-yellow-400 bg-gradient-to-r from-yellow-500/20 to-amber-500/20';
    var silver = 'border-slate-300 bg-gradient-to-r from-slate-400/20 to-slate-300/20';
    var bronze = 'border-orange-300 bg-gradient-to-r from-orange-400/20 to-red-400/20';
    
    sorted.forEach(function(s, i) {
        var bg = i===0 ? gold : (i===1 ? silver : bronze);
        var medal = ['🥇','🥈','🥉'][i] || (i+1)+'️⃣';
        var scale = i===0 ? 'scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : '';
        var textGlow = i===0 ? 'text-yellow-400' : i===1 ? 'text-slate-200' : 'text-orange-400';
        html += '    <div class="flex justify-between items-center p-5 rounded-2xl border-2 '+bg+' '+scale+' transition-all">';
        html += '      <span class="font-bold text-xl text-white flex items-center gap-4"><span class="text-3xl">'+medal+'</span> '+s[0]+'</span>';
        html += '      <span class="font-bold text-3xl '+textGlow+'" style="text-shadow: 0 0 10px rgba(255,255,255,0.3);">'+s[1]+'</span>';
        html += '    </div>';
    });
    html += '  </div>';
    html += '<div class="max-w-5xl mx-auto mt-8 text-left bg-white rounded-2xl p-5 text-slate-800"><div class="flex flex-col md:flex-row justify-between gap-3 items-start md:items-center"><div><h3 class="font-extrabold text-xl">📊 Laporan Hasil Setiap Siswa</h3><p class="text-sm text-slate-500">Skor akhir dan jawaban yang tercatat selama kuis.</p></div><button onclick="kls_exportReport()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">⬇ Unduh Laporan CSV</button></div><div class="overflow-x-auto mt-4"><table class="w-full text-sm"><thead><tr class="border-b text-left"><th class="p-2">Nama Siswa/Kelompok</th><th class="p-2">Skor Akhir</th><th class="p-2">Dijawab</th><th class="p-2">Benar</th><th class="p-2">Salah</th></tr></thead><tbody>' + sorted.map(function(s){var rr=kls_data.results.filter(function(r){return r.student===s[0]});var ok=rr.filter(function(r){return r.isCorrect}).length;return '<tr class="border-b"><td class="p-2 font-semibold">'+String(s[0]).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})+'</td><td class="p-2">'+s[1]+'</td><td class="p-2">'+rr.length+'</td><td class="p-2 text-emerald-700">'+ok+'</td><td class="p-2 text-red-600">'+(rr.length-ok)+'</td></tr>'}).join('')+'</tbody></table></div></div>';
    html += '  <button onclick="document.getElementById(\'kls_live_container\').classList.add(\'hidden\')" class="mt-8 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Kembali ke Daftar Kuis</button>';
    html += '</div>';
    
    document.getElementById('kls_live_container').innerHTML = html;
    
    kls_unlockAudio();
    playCorrectSound();
    setTimeout(playCorrectSound, 500);
    setTimeout(playCorrectSound, 1000);
}

function kls_exportReport() {
    var rows = [['Kuis','Siswa/Kelompok','Nomor Soal','Pertanyaan','Jawaban Siswa','Kunci Jawaban','Hasil','Poin','Pembahasan']];
    (kls_data.results||[]).forEach(function(r){rows.push([kls_data.title||'',r.student,r.question,r.prompt,r.selected,r.correctAnswer,r.isCorrect?'Benar':'Salah',r.points,r.explanation||'']);});
    Object.keys(kls_data.skor||{}).forEach(function(student){if(!(kls_data.results||[]).some(function(r){return r.student===student;}))rows.push([kls_data.title||'',student,'','','','','Belum menjawab',kls_data.skor[student],'']);});
    var csv='\ufeff'+rows.map(function(row){return row.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(',');}).join('\r\n');
    var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='laporan-kuis-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
}

function kls_stop() {
    if (confirm('Akhiri kuis sekarang? Skor akan langsung dihitung.')) {
        if(kls_data.intervalId) clearInterval(kls_data.intervalId);
        if(kls_data.fallbackInterval) clearInterval(kls_data.fallbackInterval);
        kls_end();
    }
}
// Logika untuk Interface HP Siswa
// PENTING: Seluruh logika rendering buzzer sekarang ada di HEAD script
// (early-detect). Script ini hanya sebagai fallback pengaman: jika
// head script gagal render, coba render lagi di sini.
(function() {
    if (!window.__BUZZER_MODE__) return; // Bukan mode buzzer, skip
    // Jika UI buzzer sudah dirender oleh head script, tidak perlu apa-apa
    if (document.getElementById('studentApp')) return;
    // Head script gagal render — paksa render sekarang
    if (typeof window.__renderBuzzerUI === 'function') {
        try { window.__renderBuzzerUI(); } catch(e){ console.error('Buzzer fallback error:', e); }
    }
})();

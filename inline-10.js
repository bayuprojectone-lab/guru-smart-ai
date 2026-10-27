
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
// TAMBAHAN: Fungsi pemanggil Puter AI
async function callAIWithAutoUpgrade(messages) {
    try {
        // CEPAT: lewat GSAI Bridge — Puter AI langsung (tanpa Pollinations)
        var response = await GSAI.chat(messages);
        return response;
    } catch (error) {
        console.error("Puter AI Error:", error);
        showToast("Gagal terhubung ke AI: " + (error.message || "Unknown error"), "error");
        throw error; // Lempar kembali agar fungsi pemanggil tahu ada error
    }
}

// Streaming AI: balasan tampil bertahap selagi AI mengetik (terasa jauh lebih responsif)
async function callAIStream(messages,onDelta){
    if(window.GSAI&&typeof GSAI.chatStream==='function'){
        return await GSAI.chatStream(messages,onDelta);
    }
    var res=await GSAI.chat(messages);
    var t=typeof res==='string'?res:(res?.message?.content||res?.text||'');
    if(onDelta&&t){try{onDelta(t);}catch(e2){}}
    return t;
}

// Parser JSON soal tangguh: merapikan output AI yang dibungkus teks/markdown
function gsParseSoalJSON(raw){
    try{
        var t=String(raw||'').trim();
        if(!t)return null;
        t=t.replace(/```json/gi,'').replace(/```/g,'').trim();
        function tryParse(s){
            try{
                var a=JSON.parse(s);
                if(!Array.isArray(a))return null;
                var clean=[];
                for(var i=0;i<a.length;i++){
                    var it=a[i]||{};
                    var q=String(it.text||it.pertanyaan||it.question||'').trim();
                    var ops=it.options||it.opsi||it.pilihan;
                    if(!q||!Array.isArray(ops)||ops.length<2)continue;
                    var ans=String(it.answer||it.jawaban||it.kunci||'').trim().charAt(0).toUpperCase();
                    if(!ans||'ABCD'.indexOf(ans)<0)ans='A';
                    var cleanOps=ops.map(function(o,oi){
                        var s2=String(o==null?'':o).trim();
                        s2=s2.replace(/^\**\s*[A-Da-d][\.\):]\s*/,'').replace(/\*+/g,'').trim();
                        return String.fromCharCode(65+oi)+'. '+s2;
                    });
                    clean.push({text:q,options:cleanOps,answer:ans});
                }
                return clean.length?clean:null;
            }catch(e){return null;}
        }
        var r1=tryParse(t);
        if(r1)return r1;
        var s=t.indexOf('['),e2=t.lastIndexOf(']');
        if(s>=0&&e2>s){
            var cand=t.substring(s,e2+1).replace(/,\s*([\]}])/g,'$1');
            var r2=tryParse(cand);
            if(r2)return r2;
        }
        return null;
    }catch(e){return null;}
}

// HAPUS kata "async" yang menggantung di bawah ini!
var kls_team_colors = [
    { grad: 'from-fuchsia-500 to-purple-700', glow: 'shadow-[0_8px_30px_rgba(217,70,239,0.4)]' },
    { grad: 'from-cyan-400 to-blue-600', glow: 'shadow-[0_8px_30px_rgba(34,211,238,0.4)]' },
    { grad: 'from-violet-500 to-indigo-700', glow: 'shadow-[0_8px_30px_rgba(139,92,246,0.4)]' },
    { grad: 'from-orange-400 to-rose-600', glow: 'shadow-[0_8px_30px_rgba(251,146,60,0.4)]' }
];

/* ASISTEN AI diselaraskan dengan versi GURU SMART AI PRO 78 */
async function renderAI(){var isSignedIn=false;var ud=await sb.from('users').select('*').eq('id',currentUser.id).maybeSingle();if(ud.data){currentUser.is_premium=ud.data.is_premium;currentUser.payment_status=ud.data.payment_status;currentUser.payment_sender=ud.data.payment_sender;}var isPremium=currentUser.is_premium||false;try{isSignedIn=puter.auth.isSignedIn();}catch(e){isSignedIn=false;}if(!isPremium){var info='';if(currentUser.payment_status==='Menunggu Verifikasi'){info='<div class="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm"><strong>Menunggu Verifikasi</strong><br>Pembayaran Rp 25.000 atas nama <strong>'+(currentUser.payment_sender||'-')+'</strong> sedang ditinjau.</div>';}document.getElementById('content').innerHTML='<div class="flex items-center justify-center min-h-[80vh] p-4"><div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100 dark:border-slate-700"><img src="'+AI_IMG+'" onerror="imgFallback(this)" class="w-24 h-24 rounded-2xl mx-auto mb-5 object-cover shadow-md"><h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">Aktifkan Asisten AI</h3><p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Dapatkan akses <strong>AI GRATIS</strong> ke semua fitur AI, Chat AI, Kuis Kelas, Papan Tulis & Generate Gambar.</p><div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl mb-6 border border-slate-100 dark:border-slate-600"><p class="text-sm text-slate-600 dark:text-slate-300 mb-1">Biaya Aktivasi:</p><p class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-4">Rp 25.000</p><div class="border-t border-slate-200 dark:border-slate-600 pt-3 mt-3"><p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Via DANA:</p><p class="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider mt-1">081212514747</p><p class="text-xs font-semibold text-slate-500 mt-1">a.n BAYU PRATAMA</p></div></div>'+(currentUser.payment_status!=='Menunggu Verifikasi'?'<button onclick="confirmPaymentAI()" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Saya Sudah Bayar</button><p class="text-xs text-slate-400 mt-4">Transfer Rp 25.000 ke DANA di atas.</p>':'')+info+'</div></div>';return;}document.getElementById('content').innerHTML='<div class="flex flex-col flex-1 min-h-0 max-w-6xl w-full mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"><div class="p-3 flex-none border-b dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex-wrap gap-2"><div class="flex items-center gap-3"><img src="'+AI_IMG+'" onerror="imgFallback(this)" alt="GURU SMART AI" class="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-200"><div><h3 class="font-bold text-slate-800 dark:text-white">Asisten AI Guru</h3><p class="text-xs text-slate-500 dark:text-slate-400">Chat AI Cepat + Papan Tulis + Buat Gambar 🎨</p></div></div><div class="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex-wrap"><button id="tabChatAI" onclick="switchAITab(\'chat\')" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white">💬 Chat</button><button id="tabPapanAI" onclick="switchAITab(\'papan\')" class="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-300">🖌️ Papan Tulis</button><button id="gsAIAuthChip" onclick="gsConnectPuter()" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200">🔗 Sambungkan AI</button><button id="gsGantiAkunChip" onclick="gsGantiAkunAI()" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-200/70 text-slate-600 dark:bg-slate-600/60 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500" title="Ganti akun Puter - akun baru gratis = kuota AI baru">🔄 Ganti Akun</button><button onclick="gsClearAIHistory()" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60" title="Hapus semua riwayat chat AI akun ini (riwayat tersimpan otomatis di perangkat, terpisah untuk setiap akun)">🗑️ Riwayat</button></div></div><div id="aiChatPanel" class="flex flex-col flex-1 min-h-0"><div id="aiMessages" class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 bg-slate-50 dark:bg-slate-900"></div><div class="p-3 flex-none border-t dark:border-slate-700 bg-white dark:bg-slate-800"><div class="flex gap-2 items-end"><input type="file" id="aiImageInput" accept="image/*" class="hidden" onchange="handleAIImageUpload(event)"><button onclick="document.getElementById(\'aiImageInput\').click()" class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white p-2.5 rounded-xl flex-none" title="Upload Gambar"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button><button id="aiMicBtn" onclick="toggleVoiceInput()" class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white p-2.5 rounded-xl flex-none" title="Voice Input"><svg id="micIcon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg></button><textarea id="aiInput" rows="2" placeholder="Tulis perintah..." class="flex-1 px-4 py-2 rounded-xl border dark:bg-slate-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea><button id="aiSendBtn" onclick="sendAI()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1 text-sm flex-none"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9 2zm0 0v-8"/></svg><span class="hidden sm:inline">Kirim</span></button></div><div class="flex justify-end gap-2 mt-2 flex-wrap"><button onclick="openPromptSoalModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1">📋 Prompt Soal</button><button onclick="openSoalCameraModal()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.072 4h3.856a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Foto Soal</button><button onclick="uploadSoalImage()" class="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Galeri Soal</button><button id="aiWordBtn" onclick="exportToWord()" class="hidden bg-blue-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>Word</button><button id="aiPrintBtn" onclick="printAIResult(false)" class="hidden bg-slate-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>PDF</button><button id="aiPrintKeyBtn" onclick="printAIResult(true)" class="hidden bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Kunci</button></div></div></div><div id="aiPapanPanel" class="hidden flex-1 min-h-0 flex flex-col overflow-hidden p-3 bg-slate-100 dark:bg-slate-900"><div class="flex-none p-2 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 flex flex-wrap items-center gap-3"><div class="flex gap-1"><button onclick="wbSetTool(\'pen\')" id="wbToolPen" class="wb-tool-btn active bg-blue-600 text-white p-2 rounded-lg" title="Pena"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m0 0l-3.536 3.536m3.536-3.536L5 19V5h14z"/></svg></button><button onclick="wbSetTool(\'eraser\')" id="wbToolEraser" class="wb-tool-btn bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white p-2 rounded-lg" title="Penghapus"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg></button><button onclick="wbSetTool(\'line\')" id="wbToolLine" class="wb-tool-btn bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white p-2 rounded-lg" title="Garis"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19l14-14"/></svg></button><button onclick="wbSetTool(\'rect\')" id="wbToolRect" class="wb-tool-btn bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white p-2 rounded-lg" title="Kotak"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v16H4z"/></svg></button><button onclick="wbSetTool(\'circle\')" id="wbToolCircle" class="wb-tool-btn bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white p-2 rounded-lg" title="Lingkaran"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/></svg></button></div><div class="w-px h-8 bg-slate-300 dark:bg-slate-600"></div><div class="flex gap-1 items-center"><span class="text-xs text-slate-500 mr-1">Warna:</span><button onclick="wbSetColor(\'#1e3a8a\')" class="w-7 h-7 rounded-full border-2 border-white shadow" style="background:#1e3a8a"></button><button onclick="wbSetColor(\'#dc2626\')" class="w-7 h-7 rounded-full border-2 border-white shadow" style="background:#dc2626"></button><button onclick="wbSetColor(\'#16a34a\')" class="w-7 h-7 rounded-full border-2 border-white shadow" style="background:#16a34a"></button><button onclick="wbSetColor(\'#000000\')" class="w-7 h-7 rounded-full border-2 border-white shadow" style="background:#000000"></button><input type="color" id="wbColorPicker" value="#1e3a8a" onchange="wbSetColor(this.value)" class="w-8 h-8 rounded cursor-pointer border-0"></div><div class="w-px h-8 bg-slate-300 dark:bg-slate-600"></div><div class="flex gap-2 items-center"><span class="text-xs text-slate-500">Ukuran:</span><input type="range" id="wbSizeRange" min="1" max="30" value="3" onchange="wbSetSize(parseInt(this.value))" class="w-20 cursor-pointer"><span id="wbSizeLabel" class="text-xs font-bold text-slate-700 dark:text-white w-6">3</span></div><div class="w-px h-8 bg-slate-300 dark:bg-slate-600"></div><button onclick="wbUndo()" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1" title="Undo"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg></button><button onclick="wbClear()" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">🗑️ Hapus</button><button onclick="wbSaveImage()" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">💾 Simpan</button><button onclick="wbAskAI()" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-md ml-auto">🤖 Tanya AI</button></div><div class="flex-1 min-h-0 overflow-auto flex justify-center items-start"><canvas id="whiteboardCanvas" style="width:100%;max-width:1000px;height:auto;aspect-ratio:5/3;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);touch-action:none;"></canvas></div><div id="wbAIResponse" class="hidden mt-2 bg-white dark:bg-slate-800 rounded-lg border border-green-300 dark:border-green-700 p-4 max-h-[30vh] overflow-y-auto modal-scroll shadow-md"><div class="flex justify-between items-center mb-2"><h4 class="font-bold text-sm text-green-700 dark:text-green-400 flex items-center gap-2">🤖 Jawaban AI</h4><button onclick="document.getElementById(\'wbAIResponse\').classList.add(\'hidden\')" class="text-slate-400 hover:text-red-500 text-xs">✕ Tutup</button></div><div id="wbAIContent" class="ai-output text-gray-800 dark:text-white text-sm"></div></div></div></div>';loadAIChat();setupEnterKey();try{gsInitGambarPanel();}catch(eGSIG){console.warn('Studio Gambar init:',eGSIG);}setTimeout(function(){try{gsUpdateAuthChip();}catch(e){}},1200);}
window.switchAITab=function(tab){var tabs={chat:'tabChatAI',papan:'tabPapanAI',gambar:'tabGambarAI'};var panels={chat:'aiChatPanel',papan:'aiPapanPanel',gambar:'aiGambarPanel'};Object.keys(tabs).forEach(function(k){var btn=document.getElementById(tabs[k]);if(btn){btn.className='px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-300';}var panel=document.getElementById(panels[k]);if(panel){panel.classList.add('hidden');panel.classList.remove('flex');}});var activeBtn=document.getElementById(tabs[tab]);if(activeBtn){activeBtn.className='px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white';}var activePanel=document.getElementById(panels[tab]);if(activePanel){activePanel.classList.remove('hidden');activePanel.classList.add('flex');}if(tab==='papan'){setTimeout(function(){initWhiteboard();},200);}};
var wbCanvas=null,wbCtx=null,wbDrawing=false,wbLastX=0,wbLastY=0,wbStartX=0,wbStartY=0;var wbColor='#1e3a8a',wbSize=3,wbTool='pen',wbHistory=[],wbSnapshot=null;
function initWhiteboard(){wbCanvas=document.getElementById('whiteboardCanvas');if(!wbCanvas)return;var newCanvas=wbCanvas.cloneNode(false);wbCanvas.parentNode.replaceChild(newCanvas,wbCanvas);wbCanvas=newCanvas;wbCanvas.width=1000;wbCanvas.height=600;wbCtx=wbCanvas.getContext('2d');wbCtx.fillStyle='#ffffff';wbCtx.fillRect(0,0,1000,600);wbCtx.lineCap='round';wbCtx.lineJoin='round';wbSnapshot=wbCanvas.toDataURL();wbHistory=[];wbCanvas.addEventListener('mousedown',function(e){e.preventDefault();var p=wbGetPos(e);wbStartDraw(p.x,p.y);});wbCanvas.addEventListener('mousemove',function(e){var p=wbGetPos(e);wbDraw(p.x,p.y);});wbCanvas.addEventListener('mouseup',function(){wbStopDraw();});wbCanvas.addEventListener('mouseleave',function(){wbStopDraw();});wbCanvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];var p=wbGetPosTouch(t);wbStartDraw(p.x,p.y);},{passive:false});wbCanvas.addEventListener('touchmove',function(e){e.preventDefault();var t=e.touches[0];var p=wbGetPosTouch(t);wbDraw(p.x,p.y);},{passive:false});wbCanvas.addEventListener('touchend',function(e){e.preventDefault();wbStopDraw();},{passive:false});}
function wbGetPos(e){var rect=wbCanvas.getBoundingClientRect();var scaleX=wbCanvas.width/rect.width;var scaleY=wbCanvas.height/rect.height;return{x:(e.clientX-rect.left)*scaleX,y:(e.clientY-rect.top)*scaleY};}
function wbGetPosTouch(t){var rect=wbCanvas.getBoundingClientRect();var scaleX=wbCanvas.width/rect.width;var scaleY=wbCanvas.height/rect.height;return{x:(t.clientX-rect.left)*scaleX,y:(t.clientY-rect.top)*scaleY};}
function wbSaveState(){try{if(wbHistory.length>20)wbHistory.shift();wbHistory.push(wbCanvas.toDataURL());}catch(e){}}
function wbStartDraw(x,y){wbDrawing=true;wbLastX=x;wbLastY=y;wbStartX=x;wbStartY=y;wbSaveState();if(wbTool==='pen'||wbTool==='eraser'){wbCtx.beginPath();wbCtx.moveTo(x,y);wbCtx.lineTo(x+0.1,y+0.1);wbCtx.strokeStyle=wbTool==='eraser'?'#ffffff':wbColor;wbCtx.lineWidth=wbTool==='eraser'?wbSize*4:wbSize;wbCtx.stroke();}}
function wbDraw(x,y){if(!wbDrawing)return;if(wbTool==='pen'){wbCtx.strokeStyle=wbColor;wbCtx.lineWidth=wbSize;wbCtx.globalCompositeOperation='source-over';wbCtx.lineTo(x,y);wbCtx.stroke();}else if(wbTool==='eraser'){wbCtx.strokeStyle='#ffffff';wbCtx.lineWidth=wbSize*4;wbCtx.globalCompositeOperation='source-over';wbCtx.lineTo(x,y);wbCtx.stroke();}else if(wbTool==='line'||wbTool==='rect'||wbTool==='circle'){if(wbSnapshot){var img=new Image();img.onload=function(){wbCtx.clearRect(0,0,wbCanvas.width,wbCanvas.height);wbCtx.drawImage(img,0,0);drawShape(x,y);};img.src=wbSnapshot;}}wbLastX=x;wbLastY=y;}
function drawShape(x,y){wbCtx.strokeStyle=wbColor;wbCtx.lineWidth=wbSize;wbCtx.globalCompositeOperation='source-over';if(wbTool==='line'){wbCtx.beginPath();wbCtx.moveTo(wbStartX,wbStartY);wbCtx.lineTo(x,y);wbCtx.stroke();}else if(wbTool==='rect'){wbCtx.strokeRect(wbStartX,wbStartY,x-wbStartX,y-wbStartY);}else if(wbTool==='circle'){var rx=Math.abs(x-wbStartX)/2;var ry=Math.abs(y-wbStartY)/2;var cx=(wbStartX+x)/2;var cy=(wbStartY+y)/2;wbCtx.beginPath();wbCtx.ellipse(cx,cy,Math.max(1,rx),Math.max(1,ry),0,0,2*Math.PI);wbCtx.stroke();}}
function wbStopDraw(){if(!wbDrawing)return;wbDrawing=false;wbCtx.globalCompositeOperation='source-over';if(wbTool==='line'||wbTool==='rect'||wbTool==='circle'){wbSnapshot=wbCanvas.toDataURL();}}
window.wbSetTool=function(tool){wbTool=tool;document.querySelectorAll('.wb-tool-btn').forEach(function(b){b.classList.remove('active','bg-blue-600','text-white');b.classList.add('bg-slate-200','dark:bg-slate-600','text-slate-700','dark:text-white');});var btnMap={'pen':'wbToolPen','eraser':'wbToolEraser','line':'wbToolLine','rect':'wbToolRect','circle':'wbToolCircle'};var btn=document.getElementById(btnMap[tool]);if(btn){btn.classList.add('active','bg-blue-600','text-white');btn.classList.remove('bg-slate-200','dark:bg-slate-600','text-slate-700','dark:text-white');}if(wbCanvas)wbCanvas.style.cursor=tool==='eraser'?'cell':'crosshair';if((tool==='line'||tool==='rect'||tool==='circle')&&wbCanvas){wbSnapshot=wbCanvas.toDataURL();}};
window.wbSetColor=function(color){wbColor=color;var picker=document.getElementById('wbColorPicker');if(picker)picker.value=color;};
window.wbSetSize=function(size){wbSize=size;var lbl=document.getElementById('wbSizeLabel');if(lbl)lbl.innerText=size;};
window.wbClear=function(){if(!wbCtx||!confirm('Hapus semua tulisan di papan?'))return;wbSaveState();wbCtx.fillStyle='#ffffff';wbCtx.fillRect(0,0,wbCanvas.width,wbCanvas.height);wbSnapshot=wbCanvas.toDataURL();showToast('Papan dibersihkan!','success');};
window.wbUndo=function(){if(wbHistory.length===0){showToast('Tidak ada riwayat.','info');return;}var lastState=wbHistory.pop();var img=new Image();img.onload=function(){wbCtx.clearRect(0,0,wbCanvas.width,wbCanvas.height);wbCtx.drawImage(img,0,0);wbSnapshot=wbCanvas.toDataURL();};img.src=lastState;};
window.wbSaveImage=function(){if(!wbCanvas)return;var link=document.createElement('a');link.download='Papan_Tulis_'+new Date().toISOString().split('T')[0]+'.png';link.href=wbCanvas.toDataURL('image/png');link.click();showToast('Gambar tersimpan!','success');};
window.wbAskAI=async function(){if(!wbCanvas){showToast('Papan tulis belum siap.','error');return;}var dataUrl=wbCanvas.toDataURL('image/png');var respArea=document.getElementById('wbAIResponse');var respContent=document.getElementById('wbAIContent');if(respArea)respArea.classList.remove('hidden');if(respContent)respContent.innerHTML='<div class="flex items-center gap-2 text-green-600 font-medium"><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><span class="ml-2">AI sedang membaca papan tulis...</span></div>';if(respArea)respArea.scrollIntoView({behavior:'smooth'});try{var promptText='Anda adalah guru AI yang mahir membaca tulisan tangan di papan tulis. Tolong: 1) Baca seluruh teks/tulisan/gambar di papan tulis dengan akurat. 2) Jika soal matematika/pertanyaan, berikan jawaban dan pembahasan. 3) Jika rumus, jelaskan. 4) Jika catatan, rangkum dan tambahkan penjelasan. 5) Format markdown rapi.';var messages=[{role:'user',content:[{type:'text',text:promptText},{type:'image_url',image_url:{url:dataUrl}}]}];var res=null;try{res=await callAIWithAutoUpgrade(messages);}catch(eWB){var wbOcr=await gsLocalOCR(dataUrl);if(!wbOcr){throw eWB;}res=await callAIWithAutoUpgrade([{role:'user',content:'Berikut hasil OCR tulisan papan tulis (bisa jadi ada salah baca): "'+wbOcr+'". Tugasmu: 1) Perbaiki kesalahan OCR bila ada. 2) Jika berisi soal, jawab dengan pembahasan lengkap. 3) Jika rumus atau catatan, jelaskan dan rangkum. Format markdown rapi.'}]);}var extractedText=typeof res==='string'?res:(res?.message?.content||res?.text||'');if(!extractedText||!extractedText.trim()){throw new Error('AI tidak dapat membaca papan tulis.');}var formattedHTML=marked.parse(extractedText);if(respContent)respContent.innerHTML=formattedHTML;showToast('AI selesai menganalisis!','success');}catch(err){if(respContent)respContent.innerHTML='<p class="text-red-500">❌ Gagal: '+err.message+'</p>';showToast('Gagal: '+err.message,'error');}};

var tempOcrText='';
window.openSoalCameraModal=function(){soalCapturedDataUrl=null;tempOcrText='';openModal('📷 Pindai Soal (OCR Kamera)','<div class="space-y-5"><div class="bg-emerald-50 dark:bg-slate-700 p-4 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-600 flex items-start gap-2"><svg class="w-4 h-4 flex-none mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Arahkan kamera ke soal. AI akan mengekstrak teks (OCR) terlebih dahulu sebelum dikoreksi.</span></div><div class="relative camera-viewfinder aspect-video"><video id="soalVideo" autoplay playsinline class="w-full h-full object-cover"></video><div id="soalCameraPlaceholder" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-900"><svg class="w-10 h-10 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.072 4h3.856a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>Memulai kamera...</span></div><div class="viewfinder-corner tl"></div><div class="viewfinder-corner tr"></div><div class="viewfinder-corner bl"></div><div class="viewfinder-corner br"></div></div><div id="soalCapturedPreview" class="hidden space-y-4"><div class="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg"><img id="soalCapturedImg" class="w-full h-auto object-cover"><div class="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">CAPTURED</div></div><div class="space-y-2"><div class="flex justify-between items-center"><h4 class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Hasil OCR</h4><button onclick="retryOCR()" class="text-[10px] text-blue-600 hover:underline font-semibold">Muat Ulang</button></div><div class="ocr-result-panel p-3 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap" id="ocrTextDisplay"><div class="flex items-center text-blue-500 font-medium"><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><span class="ml-2">AI sedang membaca teks...</span></div></div></div></div><div class="flex flex-col sm:flex-row gap-2"><button id="soalCaptureBtn" onclick="captureSoalPhoto()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.072 4h3.856a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Ambil Foto & Pindai</button><button id="soalRetakeBtn" onclick="retakeSoalPhoto()" class="hidden flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl text-sm font-semibold items-center justify-center gap-2 shadow-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Ambil Ulang</button><button id="soalSendBtn" onclick="sendSoalToAI()" class="hidden flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold items-center justify-center gap-2 shadow-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Koreksi dengan AI</button></div><button onclick="closeSoalCamera()" class="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium">Tutup</button></div>');startSoalCamera();};
window.retryOCR=async function(){if(!soalCapturedDataUrl)return;var ocrDisplay=document.getElementById('ocrTextDisplay');if(ocrDisplay)ocrDisplay.innerHTML='<div class="flex items-center text-blue-500 font-medium"><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><div class="ocr-loading-dot"></div><span class="ml-2">AI sedang membaca teks...</span></div>';await performOCR();};
async function performOCR(){if(!soalCapturedDataUrl)return;try{var messages=[{role:'user',content:[{type:'text',text:"Baca semua teks yang ada pada gambar soal ini. Keluarkan murni teksnya saja tanpa kalimat pengantar."},{type:'image_url',image_url:{url:soalCapturedDataUrl}}]}];var res=null;try{res=await GSAI.chat(messages);}catch(eOCR){console.warn('OCR AI gagal, coba OCR lokal:',eOCR);res=await gsLocalOCR(soalCapturedDataUrl);}var extractedText=typeof res==='string'?res:(res?.message?.content||res?.text||'');tempOcrText=extractedText.trim();var ocrDisplay=document.getElementById('ocrTextDisplay');if(ocrDisplay){if(tempOcrText){ocrDisplay.innerHTML='<p class="text-slate-700 dark:text-slate-200">'+escapeHTML(tempOcrText)+'</p>';}else{ocrDisplay.innerHTML='<p class="text-amber-500 text-center italic">Tidak ada teks terdeteksi.</p>';}}}catch(err){console.error('OCR Error:',err);var ocrDisplay=document.getElementById('ocrTextDisplay');if(ocrDisplay)ocrDisplay.innerHTML='<p class="text-red-500 text-center italic">Gagal memindai teks. Anda tetap bisa melanjutkan ke Koreksi AI.</p>';}}
window.captureSoalPhoto=function(){var video=document.getElementById('soalVideo');if(!video||!soalCameraStream)return;var canvas=document.createElement('canvas');canvas.width=video.videoWidth||1280;canvas.height=video.videoHeight||720;var ctx=canvas.getContext('2d');ctx.drawImage(video,0,0,canvas.width,canvas.height);soalCapturedDataUrl=canvas.toDataURL('image/jpeg',0.9);var img=document.getElementById('soalCapturedImg');var preview=document.getElementById('soalCapturedPreview');if(img)img.src=soalCapturedDataUrl;if(preview)preview.classList.remove('hidden');document.getElementById('soalCaptureBtn').classList.add('hidden');document.getElementById('soalRetakeBtn').classList.remove('hidden');document.getElementById('soalRetakeBtn').classList.add('flex');document.getElementById('soalSendBtn').classList.remove('hidden');document.getElementById('soalSendBtn').classList.add('flex');stopSoalCameraStream();showToast('Foto berhasil diambil! Memproses OCR...','success');performOCR();};
window.retakeSoalPhoto=function(){soalCapturedDataUrl=null;tempOcrText='';var preview=document.getElementById('soalCapturedPreview');if(preview)preview.classList.add('hidden');document.getElementById('soalCaptureBtn').classList.remove('hidden');document.getElementById('soalCaptureBtn').classList.add('flex');document.getElementById('soalRetakeBtn').classList.add('hidden');document.getElementById('soalRetakeBtn').classList.remove('flex');document.getElementById('soalSendBtn').classList.add('hidden');document.getElementById('soalSendBtn').classList.remove('flex');startSoalCamera();};
window.sendSoalToAI=async function(){if(!soalCapturedDataUrl){showToast('Ambil foto dulu!','error');return;}closeModal();var btn=document.getElementById('aiSendBtn');btn.disabled=true;btn.innerText='Mengoreksi...';var box=document.getElementById('aiMessages');var ud=document.createElement('div');ud.className='flex justify-end fade-in';ud.innerHTML='<div class="max-w-[80%] rounded-xl px-2 py-2 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1 px-2">Foto Soal (Dari Kamera)</div><img src="'+soalCapturedDataUrl+'" class="rounded-lg max-w-full h-auto"></div>';box.appendChild(ud);gsLogChat({t:'u',k:'img',c:soalCapturedDataUrl,label:'Foto Soal (Dari Kamera)'});var td=document.createElement('div');td.id='typingIndicator';td.className='flex justify-start fade-in';td.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="animate-pulse text-emerald-600">🔍 AI sedang membaca & mengoreksi soal...</div></div>';box.appendChild(td);box.scrollTop=box.scrollHeight;try{var ocrContext=tempOcrText?"Berikut adalah teks hasil OCR dari gambar: \n"+tempOcrText+"\n\n":"";var promptText=ocrContext+"Berdasarkan teks dan gambar di atas, tolong: 1) Identifikasi soal dengan akurat. 2) Jika ini soal pilihan ganda, koreksi jawaban dan beri nilai. 3) Jika ini soal essay, berikan jawaban/pembahasan lengkap. 4) Tampilkan kunci jawaban di akhir. Format output markdown yang rapi.";var messages=[{role:'user',content:[{type:'text',text:promptText},{type:'image_url',image_url:{url:soalCapturedDataUrl}}]}];var res=null;try{res=await callAIWithAutoUpgrade(messages);}catch(eSS){var soalOcr=tempOcrText||await gsLocalOCR(soalCapturedDataUrl);if(!soalOcr){throw eSS;}res=await callAIWithAutoUpgrade([{role:'user',content:'Berikut teks hasil OCR foto soal siswa (bisa jadi ada salah baca): "'+soalOcr+'". Berdasarkan teks tersebut: 1) Identifikasi soal dengan akurat. 2) Jika pilihan ganda, koreksi jawaban dan beri nilai. 3) Jika essay, berikan jawaban/pembahasan lengkap. 4) Tampilkan kunci jawaban di akhir. Format output markdown rapi.'}]);}var extractedText=typeof res==='string'?res:(res?.message?.content||res?.text||'');document.getElementById('typingIndicator')?.remove();if(!extractedText||!extractedText.trim()){throw new Error("AI tidak dapat membaca soal.");}var formattedHTML=formatSoalHTML(extractedText);lastAIFormattedHTML=formattedHTML;gsLogChat({t:'a',k:'soal',c:extractedText,label:'📋 Hasil Koreksi & Pembahasan AI'});var ad=document.createElement('div');ad.className='flex justify-start fade-in';ad.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">📋 Hasil Koreksi & Pembahasan AI</div><div class="ai-output text-gray-800 dark:text-white">'+formattedHTML+'</div></div>';box.appendChild(ad);box.scrollTop=box.scrollHeight;['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('hidden');});try{gsPrewarmKop();}catch(ePW1){}showToast('Soal berhasil dikoreksi!','success');}catch(err){document.getElementById('typingIndicator')?.remove();showToast('Gagal mengoreksi: '+err.message,'error');}finally{btn.disabled=false;btn.innerText='Kirim';soalCapturedDataUrl=null;tempOcrText='';}};
function startSoalCamera(){var video=document.getElementById('soalVideo');var placeholder=document.getElementById('soalCameraPlaceholder');if(!video)return;navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}}).then(function(stream){soalCameraStream=stream;video.srcObject=stream;if(placeholder)placeholder.style.display='none';}).catch(function(err){console.error('Camera error:',err);if(placeholder)placeholder.innerHTML='<p class="text-red-400 text-xs px-4 text-center">❌ Kamera tidak dapat diakses.<br><span class="text-[10px] mt-1 block">'+err.message+'</span></p>';showToast('Gagal akses kamera','error');});}
window.closeSoalCamera=function(){stopSoalCameraStream();soalCapturedDataUrl=null;closeModal();};
function stopSoalCameraStream(){if(soalCameraStream){soalCameraStream.getTracks().forEach(function(track){track.stop();});soalCameraStream=null;var v=document.getElementById('soalVideo');if(v)v.srcObject=null;}}
window.uploadSoalImage=function(){var fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='image/*';fileInput.className='hidden';document.body.appendChild(fileInput);fileInput.click();fileInput.onchange=async function(event){var file=event.target.files[0];if(!file)return;document.body.removeChild(fileInput);var btn=document.getElementById('aiSendBtn');btn.disabled=true;btn.innerText='Mengoreksi...';var box=document.getElementById('aiMessages');var reader=new FileReader();reader.onload=async function(e){var imgUrl=e.target.result;var ud=document.createElement('div');ud.className='flex justify-end fade-in';ud.innerHTML='<div class="max-w-[80%] rounded-xl px-2 py-2 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1 px-2">Foto Soal (Galeri)</div><img src="'+imgUrl+'" class="rounded-lg max-w-full h-auto"></div>';box.appendChild(ud);gsLogChat({t:'u',k:'img',c:imgUrl,label:'Foto Soal (Galeri)'});var td=document.createElement('div');td.id='typingIndicator';td.className='flex justify-start fade-in';td.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="animate-pulse text-emerald-600">🔍 AI sedang membaca & mengoreksi soal...</div></div>';box.appendChild(td);box.scrollTop=box.scrollHeight;try{var messages=[{role:'user',content:[{type:'text',text:"Ini adalah foto soal / lembar jawaban siswa. Tolong: 1) Baca seluruh isi soal dengan akurat. 2) Jika pilihan ganda, koreksi jawaban dan beri nilai. 3) Jika essay, berikan jawaban/pembahasan. 4) Tampilkan kunci jawaban di akhir. Format output markdown rapi."},{type:'image_url',image_url:{url:imgUrl}}]}];var res=null;try{res=await callAIWithAutoUpgrade(messages);}catch(eUP){var upOcr=await gsLocalOCR(imgUrl);if(!upOcr){throw eUP;}res=await callAIWithAutoUpgrade([{role:'user',content:'Berikut teks hasil OCR foto soal / lembar jawaban siswa (bisa jadi ada salah baca): "'+upOcr+'". Berdasarkan teks tersebut: 1) Identifikasi soal dengan akurat. 2) Jika pilihan ganda, koreksi jawaban dan beri nilai. 3) Jika essay, berikan jawaban/pembahasan. 4) Tampilkan kunci jawaban di akhir. Format output markdown rapi.'}]);}var extractedText=typeof res==='string'?res:(res?.message?.content||res?.text||'');document.getElementById('typingIndicator')?.remove();if(!extractedText||!extractedText.trim()){throw new Error("AI tidak dapat membaca jawaban.");}var formattedHTML=formatSoalHTML(extractedText);lastAIFormattedHTML=formattedHTML;gsLogChat({t:'a',k:'soal',c:extractedText,label:'📋 Hasil Koreksi & Pembahasan AI'});var ad=document.createElement('div');ad.className='flex justify-start fade-in';ad.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">📋 Hasil Koreksi & Pembahasan AI</div><div class="ai-output text-gray-800 dark:text-white">'+formattedHTML+'</div></div>';box.appendChild(ad);box.scrollTop=box.scrollHeight;['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('hidden');});try{gsPrewarmKop();}catch(ePW1){}showToast('Soal berhasil dikoreksi!','success');}catch(err){document.getElementById('typingIndicator')?.remove();showToast('Gagal mengoreksi: '+err.message,'error');}finally{btn.disabled=false;btn.innerText='Kirim';}};reader.readAsDataURL(file);};};
var recognition=null;
function toggleVoiceInput(){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;var mb=document.getElementById('aiMicBtn');var ip=document.getElementById('aiInput');if(!SR){showToast('Browser tidak mendukung Voice.','error');return;}if(recognition&&recognition.isListening){recognition.stop();recognition.isListening=false;mb.classList.remove('bg-red-500','text-white','animate-pulse');mb.classList.add('bg-slate-200','dark:bg-slate-700','text-slate-600','dark:text-white');return;}recognition=new SR();recognition.lang='id-ID';recognition.interimResults=true;recognition.isListening=true;var ft='';var bt=ip.value?ip.value+' ':'';recognition.onstart=function(){mb.classList.add('bg-red-500','text-white','animate-pulse');mb.classList.remove('bg-slate-200','dark:bg-slate-700','text-slate-600','dark:text-white');showToast('Mendengarkan...','info');};recognition.onresult=function(e){var it='';for(var i=e.resultIndex;i<e.results.length;++i){if(e.results[i].isFinal){ft+=e.results[i][0].transcript;}else{it+=e.results[i][0].transcript;}}ip.value=bt+ft+it;ip.scrollTop=ip.scrollHeight;};recognition.onerror=function(e){showToast('Error: '+e.error,'error');recognition.isListening=false;mb.classList.remove('bg-red-500','text-white','animate-pulse');mb.classList.add('bg-slate-200','dark:bg-slate-700','text-slate-600','dark:text-white');};recognition.onend=function(){if(recognition.isListening){recognition.isListening=false;mb.classList.remove('bg-red-500','text-white','animate-pulse');mb.classList.add('bg-slate-200','dark:bg-slate-700','text-slate-600','dark:text-white');if(ip.value.trim()!==''){sendAI();}}};try{recognition.start();}catch(e){}}
async function confirmPaymentAI(){openModal('Konfirmasi Aktivasi AI','<form id="paymentConfirmForm" class="space-y-4"><div class="bg-yellow-50 dark:bg-slate-700 p-3 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 text-center border border-yellow-200"><strong>Perhatian:</strong> Transfer Rp 25.000 ke DANA <br><strong>081212514747 (BAYU PRATAMA)</strong>.<br>Masukkan nama pengirim di bawah ini & KIRIM Bukti Transfer Ke WA 0812 1251 4747.</div><div><label class="block text-sm mb-1">Nama Pengirim DANA</label><input type="text" id="dana_sender" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Nama Anda" required></div><button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold">Kirim Bukti Transfer</button></form>');document.getElementById('paymentConfirmForm').onsubmit=async function(e){e.preventDefault();var btn=document.querySelector('#paymentConfirmForm button[type="submit"]');btn.disabled=true;btn.innerText='Mengirim...';try{var sn=document.getElementById('dana_sender').value;await sb.from('users').update({is_premium:false,payment_sender:sn,payment_status:'Menunggu Verifikasi'}).eq('id',currentUser.id);currentUser.payment_sender=sn;currentUser.payment_status='Menunggu Verifikasi';showToast('Bukti terkirim! Tunggu verifikasi 1x24 Jam.','success');closeModal();renderAI();}catch(err){showToast('Gagal.','error');btn.disabled=false;btn.innerText='Kirim Bukti Transfer';}};}
function setupEnterKey(){var ip=document.getElementById('aiInput');if(!ip)return;ip.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAI();}});}
var _gsSchoolCtxCache={data:null,ts:0};
async function getSchoolContext(){var _now=Date.now();if(_gsSchoolCtxCache.data&&_now-_gsSchoolCtxCache.ts<120000)return _gsSchoolCtxCache.data;try{var st=await DB.get('students');var tc=await DB.get('teachers');var su=await DB.get('subjects');var _out='Total Siswa: '+st.length+', Total Guru: '+tc.length+', Mapel: '+(su.map(function(s){return s.name;}).join(', ')||'Belum ada');_gsSchoolCtxCache={data:_out,ts:_now};return _out;}catch(e){return"Data sekolah tidak dapat dibaca.";}}
/* ===== RIWAYAT CHAT AI DI LOCALSTORAGE (masing-masing per akun) =====
   Setiap akun memiliki riwayat chat sendiri: kunci memakai id user (gs_aiChatHistory_<id>).
   Dipulihkan otomatis saat halaman AI dibuka; tombol 🗑️ Riwayat menghapus riwayat akun aktif saja.
   Log tampilan (gsChatLog) terpisah dari konteks API (aiChatHistory) agar perilaku AI tidak berubah. */
var gsChatLog=[];
function gsAIHistKey(){return 'gs_aiChatHistory_'+((typeof currentUser!=='undefined'&&currentUser&&currentUser.id)?currentUser.id:'guest');}
function gsLoadAIHistory(){try{var raw=localStorage.getItem(gsAIHistKey());var arr=raw?JSON.parse(raw):[];gsChatLog=(Object.prototype.toString.call(arr)==='[object Array]')?arr:[];}catch(e){gsChatLog=[];}return gsChatLog;}
function gsSaveAIHistory(){try{var key=gsAIHistKey();function attempt(l){try{localStorage.setItem(key,JSON.stringify(l));return true;}catch(e){return false;}}
var log=gsChatLog.slice(-200);
if(attempt(log))return;
log=log.filter(function(m){return m&&m.k!=='img';});
if(attempt(log))return;
while(log.length>10){log=log.slice(Math.ceil(log.length/2));if(attempt(log))return;}
try{localStorage.removeItem(key);}catch(eR){}
console.warn('Riwayat chat AI tidak dapat disimpan: localStorage penuh.');}catch(e){}}
function gsLogChat(m){try{if(!m)return;gsChatLog.push(m);gsSaveAIHistory();}catch(e){}}
function gsAppendChatBubble(box,m){if(!box||!m)return;
if(m.t==='u'){
if(m.k==='img'){var d=document.createElement('div');d.className='flex justify-end fade-in';d.innerHTML='<div class="max-w-[80%] rounded-xl px-2 py-2 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1 px-2">'+escapeHTML(m.label||'Anda (Gambar)')+'</div><img src="'+m.c+'" class="rounded-lg max-w-full h-auto"></div>';box.appendChild(d);}
else{var d2=document.createElement('div');d2.className='flex justify-end fade-in';d2.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1">Anda</div><div class="whitespace-pre-wrap">'+escapeHTML(m.c)+'</div></div>';box.appendChild(d2);}
}else{var html='';
try{html=(m.k==='md')?marked.parse(m.c):formatSoalHTML(m.c);}catch(eF){html=escapeHTML(m.c||'');}
var d3=document.createElement('div');d3.className='flex justify-start fade-in';d3.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">'+escapeHTML(m.label||'Asisten AI')+'</div><div class="ai-output text-gray-800 dark:text-white">'+html+'</div></div>';box.appendChild(d3);}}
function gsRestoreAIHistory(){var b=document.getElementById('aiMessages');if(!b)return false;
var log=gsLoadAIHistory();if(!log.length)return false;
for(var i=0;i<log.length;i++){gsAppendChatBubble(b,log[i]);}
aiChatHistory=log.filter(function(m){return m&&m.k!=='img';}).slice(-10).map(function(m){return{role:(m.t==='u'?'user':'assistant'),content:m.c};});
var lastAI=null;for(var j=log.length-1;j>=0;j--){if(log[j]&&log[j].t==='a'){lastAI=log[j];break;}}
if(lastAI){try{lastAIFormattedHTML=(lastAI.k==='md')?marked.parse(lastAI.c):formatSoalHTML(lastAI.c);}catch(eF2){lastAIFormattedHTML='';}
var p=document.getElementById('aiPrintBtn'),w=document.getElementById('aiWordBtn'),k=document.getElementById('aiPrintKeyBtn');
if(p)p.classList.remove('hidden');if(w)w.classList.remove('hidden');if(k&&lastAI.k!=='md')k.classList.remove('hidden');}
b.scrollTop=b.scrollHeight;try{gsPrewarmKop();}catch(ePW3){}return true;}
window.gsClearAIHistory=function(){if(!confirm('Hapus semua riwayat chat AI akun ini di perangkat ini? Riwayat akun lain tidak terpengaruh.'))return;gsChatLog=[];aiChatHistory=[];lastAIFormattedHTML='';try{localStorage.removeItem(gsAIHistKey());}catch(e){}
['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.add('hidden');});
var b=document.getElementById('aiMessages');if(b){b.innerHTML='';loadAIChat();}
showToast('Riwayat chat AI dihapus.','success');};
/* ===== AKHIR RIWAYAT CHAT AI ===== */
var aiChatHistory=[];
function loadAIChat(){var b=document.getElementById('aiMessages');if(!b)return;if(gsRestoreAIHistory())return;if(aiChatHistory.length===0){var d=document.createElement('div');d.className='flex justify-start';d.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="whitespace-pre-wrap text-gray-800 dark:text-white">Halo! 👋 Saya Asisten Guru SMART Anda...\nApa yang ingin Anda lakukan hari ini? 😊 Tulis perintah Anda, atau klik tombol 📋 Prompt Soal untuk memakai prompt praktis buat soal siap pakai...</div></div>';b.appendChild(d);}}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var lastAIFormattedHTML='';
window.GS_MAPEL_INDONESIA=[
{g:'PAUD / TK',items:['Calistung (Membaca, Menulis, Berhitung)','Tema & Permainan Kreatif','Doa & Hafalan Harian','Menggambar & Mewarnai']},
{g:'SD / MI',items:['Pendidikan Pancasila','Pendidikan Agama Islam & Budi Pekerti','Bahasa Indonesia','Matematika','IPAS (Ilmu Pengetahuan Alam & Sosial)','IPA','IPS','PPKn','Seni Budaya (SBdP)','PJOK','Bahasa Inggris','Bahasa Arab','Bahasa Daerah (Muatan Lokal)','Prakarya','Tematik']},
{g:'SMP / MTs',items:['Pendidikan Pancasila','Bahasa Indonesia','Bahasa Inggris','Matematika','IPA','IPS','Informatika / TIK','Seni Budaya','PJOK','Prakarya','Bahasa Arab','Bahasa Daerah (Muatan Lokal)']},
{g:'SMA / MA',items:['Matematika (Wajib)','Matematika Tingkat Lanjut','Fisika','Kimia','Biologi','Geografi','Sejarah','Ekonomi','Sosiologi','Antropologi','Bahasa Indonesia','Bahasa Inggris','Bahasa Arab','Informatika','Seni Budaya','PJOK','Bahasa Jepang','Bahasa Mandarin','Bahasa Jerman','Bahasa Prancis']},
{g:'SMK',items:['Bahasa Indonesia','Bahasa Inggris','Matematika','Mata Pelajaran Kejuruan (Produktif)','Proyek Kreatif & Kewirausahaan','Pendidikan Pancasila','Sejarah','PJOK']},
{g:'Madrasah / Diniyah',items:['Akidah Akhlak','Fikih','SKI (Sejarah Kebudayaan Islam)','Al-Quran Hadis','Bahasa Arab','Tahfidz & Tajwid']},
{g:'Bahasa Daerah / Suku Nusantara',items:['Bahasa Jawa','Bahasa Sunda','Bahasa Betawi','Bahasa Madura','Bahasa Batak (Toba)','Bahasa Minangkabau','Bahasa Melayu','Bahasa Palembang','Bahasa Bali','Bahasa Sasak','Bahasa Bugis','Bahasa Makassar','Bahasa Toraja','Bahasa Dayak','Bahasa Banjar','Bahasa Aceh','Bahasa Lampung','Bahasa Nias','Bahasa Minahasa']},
{g:'Pendidikan Agama (semua jenjang)',items:['Pend. Agama Islam & Budi Pekerti','Pend. Agama Kristen & Budi Pekerti','Pend. Agama Katolik & Budi Pekerti','Pend. Agama Hindu & Budi Pekerti','Pend. Agama Buddha & Budi Pekerti','Pend. Agama Khonghucu & Budi Pekerti']}
];
window.gsMapelOptionsHTML=function(sub,selVal){var h='';var used={};if(Array.isArray(sub)&&sub.length){h+='<optgroup label="🏫 Mapel Sekolah Anda (Data Aplikasi)">'+sub.map(function(s){var nm=String(s.name||'');if(!nm||used[nm])return '';used[nm]=1;return '<option value="'+s.id+'" '+(selVal===s.id?'selected':'')+'>'+escapeHTML(nm)+'</option>';}).join('')+'</optgroup>';}h+='<optgroup label="🇮🇩 Seluruh Mapel Kurikulum Indonesia">';window.GS_MAPEL_INDONESIA.forEach(function(g){g.items.forEach(function(nm){if(used[nm])return;used[nm]=1;h+='<option value="nm:'+nm+'" '+(selVal==='nm:'+nm?'selected':'')+'>'+nm+'</option>';});});h+='</optgroup>';return h;};
window.GS_SOAL_STANDAR=' ATURAN SOAL MATEMATIKA (WAJIB - standar Indonesia): buat soal mengikuti standar penulisan dan kurikulum sekolah Indonesia (Kurikulum Merdeka, jenjang SD/MI, SMP/MTs, SMA/MA) dan sesuaikan kesulitan dengan jenjang yang diminta; kalimat perintah soal memakai kata kerja Indonesia yang lazim (tentukan, hitunglah, tulislah, sederhanakan, nyatakan, bandingkan). PENULISAN ANGKA: KOMA sebagai tanda desimal (contoh: 3,14; 0,5; 12,75) dan TITIK sebagai pemisah ribuan (contoh: 15.000 dan 1.250.000); perkalian ditulis dengan tanda x atau ×, pembagian dengan tanda : atau ÷, pecahan dalam bentuk a/b (contoh: 3/4), bilangan campuran ditulis 1 1/2; pangkat ditulis dengan tanda ^ (contoh: 2^3, x^2, 10^4), akar dengan tanda √ (contoh: √25 = 5), sudut memakai derajat (contoh: 90°); DILARANG memakai penulisan internasional (titik desimal atau koma ribuan) dan DILARANG memakai kode LaTeX (tanda dolar atau perintah seperti frac dan times) - tulis semua rumus sebagai teks biasa yang mudah dibaca siswa. ISTILAH KURIKULUM INDONESIA: gunakan istilah resmi sekolah Indonesia: keliling, luas, volume, luas permukaan, jumlah, selisih, hasil kali, hasil bagi, perbandingan, skala, KPK, FPB, bilangan bulat, pecahan, desimal, persen, aritmetika sosial, perbandingan senilai dan berbalik nilai, barisan dan deret, Teorema Pythagoras, PLSV, SPLDV, fungsi kuadrat, mean, median, modus, peluang, juring, tembereng, bangun datar, bangun ruang, serta satuan baku (cm, m, km, m2, cm2, cm3, liter, gram, kilogram, detik, menit, jam, derajat); konversi yang dipakai: 1 km = 1.000 m, 1 kg = 1.000 gram, 1 jam = 60 menit, 1 liter = 1.000 mL, 1 m2 = 10.000 cm2; nilai pi ditulis 22/7 bila jari-jari atau diameternya kelipatan 7, selain itu 3,14. KONTEKS SOAL CERITA: gunakan kehidupan sehari-hari dan sekolah di Indonesia - uang saku, jajan di kantin, harga di warung atau pasar, menabung, panen sawah, jarak rumah ke sekolah, tangki air, lomba antar kelas; mata uang Rupiah (Rp15.000) secara konsisten; nama tokoh memakai nama Indonesia yang lazim (Budi, Siti, Ahmad, Dewi, Rina, Pak Ahmad, Bu Sari); DILARANG memakai konteks negara asing (dolar, nama asing, iklim 4 musim). JENIS SOAL: pilihan ganda, isian, dan uraian; bila guru meminta soal AKM atau asesmen nasional, sertakan stimulus singkat (teks, tabel, atau data sederhana) lalu pertanyaan numerasi; sediakan campuran soal pemahaman dan penalaran (HOTS) untuk jenjang atas. PENYELESAIAN: setiap soal hitungan wajib disertai rumus yang digunakan, langkah pengerjaan yang runtut (untuk SD boleh memakai format Diketahui, Ditanya, Jawab), dan satuan pada jawaban akhir; kunci jawaban tetap ditulis Jawaban: X. FORMAT OUTPUT WAJIB agar susunan rapi: tulis nomor soal di awal baris (contoh: 1. ), setiap pilihan A-D di baris tersendiri, lalu baris Jawaban: X, lalu baris berawalan Pembahasan: berisi rumus dan langkah singkat 2-4 baris; tulis Pembahasan sebagai kalimat singkat TANPA penomoran di awal baris; DILARANG memakai tabel markdown, heading markdown, garis pemisah, atau tanda bintang di dalam soal, pilihan, Jawaban, dan Pembahasan; pilihan berupa hasil akhir dengan satuan (contoh: A. 40 cm), bukan langkah panjang. PROTOKOL AKURASI JAWABAN (WAJIB - kunci bukan karangan): urutan kerja yang benar adalah selesaikan dulu perhitungannya sampai dapat angka pasti, barulah susun soal, pilihan, dan kunci dari hasil hitungan itu. PEMBAHASAN WAJIB BERISI PERHITUNGAN NYATA: tulis rumus yang dipakai, lalu langkah angka baris demi baris (contoh: 12.000 x 4 = 48.000, lalu 48.000 + 5.000 = 53.000), dan akhiri dengan angka akhir bersatuan yang SAMA PERSIS dengan isi pilihan kunci; DILARANG menulis pembahasan umum tanpa angka (contoh terlarang: gunakan rumus luas persegi sehingga jawabannya sesuai pilihan C). COCOKKAN KUNCI: sebelum menulis baris Jawaban: X, pastikan huruf X adalah pilihan yang isinya benar-benar hasil perhitungan; jika pembahasan menghasilkan angka lain, perbaiki soal atau angkanya, jangan dipaksakan. PENGECOH MASUK AKAL: pilihan salah dibuat dari kesalahan khas siswa (lupa satu langkah, salah satuan, salah operasi, lupa dikali 2) namun HANYA SATU pilihan yang benar dan tidak boleh ada dua pilihan bernilai sama. ANGKA RAMAH HITUNG sesuai jenjang: SD memakai bilangan kecil atau uang kelipatan 500 dengan hasil bulat; hindari desimal panjang dan pembagian tak habis agar perhitungan mudah diverifikasi dan tidak mudah salah. VERIFIKASI ULANG: hitung ulang sekali lagi dari awal sebelum menulis jawaban; untuk soal terbalik (mencari nilai yang belum diketahui), uji jawaban dengan menyubstitusikannya kembali; pastikan hasil masuk akal (harga, panjang, berat, atau waktu tidak negatif dan tidak mustahil). ATURAN SOAL BAHASA ARAB (WAJIB - standar Indonesia): buat soal mengikuti bentuk soal Bahasa Arab yang UMUM DIPAKAI DI SEKOLAH & MADRASAH INDONESIA, mengacu buku Bahasa Arab Kemenag (Kurikulum Merdeka) untuk jenjang MI/SD, MTs/SMP, dan MA/SMA; DILARANG meniru gaya soal kurikulum Timur Tengah atau soal dengan pengantar bahasa Inggris; kalimat perintah soal ditulis dalam BAHASA INDONESIA, sedangkan materi/kontennya dalam Bahasa Arab. Jenis soal yang dipakai (sesuai kebiasaan di Indonesia): (1) arti atau padanan kata mufrodat, contoh: Arti dari kata اَلْمَدْرَسَةِ adalah ... ; (2) terjemahkan kalimat Arab ke Bahasa Indonesia atau sebaliknya; (3) melengkapi kalimat rumpang atau dialog muhadatsah sehari-hari; (4) menyusun kata acak menjadi kalimat yang benar; (5) menjodohkan kata Arab dengan artinya; (6) membaca teks Arab pendek (doa harian, hadits pendek, deskripsi keluarga/sekolah) lalu menjawab pertanyaan; (7) untuk jenjang MTs/MA: nahwu dan sharaf dasar (fiil madhi, fiil mudhari, isim, huruf jar, jumlah ismiyyah) dengan istilah dijelaskan dalam Bahasa Indonesia. Gunakan mufrodat standar Kemenag yang umum diajarkan: tema keluarga, sekolah, kelas, hari-hari, bulan Hijriah, angka 1 sampai 1000, warna, buah-buahan, makanan, dan kegiatan sehari-hari; nama tokoh memakai nama yang lazim di buku pelajaran Indonesia (Ahmad, Ali, Fatimah, Aisyah, Yunus, dan lainnya) dengan konteks lingkungan sekolah/madrasah di Indonesia. WAJIB: seluruh teks Arab ditulis dengan HARAKAT (tashkeel) LENGKAP pada setiap kata: fathah ( ـَ ), kasrah ( ـِ ), dhommah ( ـُ ), sukun ( ـْ ), tanwin ( ـً , ـٌ , ـٍ ), dan tasydid ( ـّ ); contoh penulisan yang benar: اَلْعِلْمُ نُوْرٌ وَالْجَهْلُ ظَلَامٌ dan اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ ; DILARANG menulis teks Arab tanpa harakat; sertakan arti dalam bahasa Indonesia dalam kurung setelah teks Arab yang panjang (lebih dari 3 kata), dan untuk soal percakapan/muhadatsah atau menu tulis per baris dengan format Arab lalu artinya; pilihan jawaban A-D dibuat konsisten dalam satu soal (semua berupa teks Arab, atau semua berupa arti Indonesia); kunci jawaban tetap ditulis Jawaban: X. ATURAN SOAL BAHASA DAERAH / SUKU NUSANTARA (WAJIB): bila mapel yang diminta adalah bahasa daerah Indonesia (Bahasa Jawa, Sunda, Betawi, Madura, Batak, Minangkabau, Melayu, Palembang, Bali, Sasak, Bugis, Makassar, Toraja, Dayak, Banjar, Aceh, Lampung, Nias, Minahasa, dan bahasa daerah lain) ATAU guru meminta soal dalam bahasa daerah tersebut, buatkan soal seperti pengajaran Muatan Lokal bahasa daerah di sekolah Indonesia (Kurikulum Merdeka); SEBARANG APA PUN bahasa daerahnya tetap dibuatkan soal, DILARANG menolak atau membalas dalam bahasa lain. BAHASA SOAL: isi soal, pilihan, dan jawaban ditulis dalam bahasa daerah yang diminta dengan ragam baku yang diajarkan di sekolah (Bahasa Jawa: ragam baku dengan unggah-ungguh ngoko, krama, dan krama inggil; Bahasa Sunda: ragam baku dengan undak usuk lemes, loma, sedeng, dan kasar; Bahasa Palembang (baso Palembang/Musi): ragam baku kré dalem (halus) dan kré rakyat (biasa) dengan partikel khas koh, wouh, dan mah; bahasa lain: ragam standar buku pelajaran daerah); kalimat perintah soal ditulis dalam bahasa daerahnya (contoh Bahasa Jawa: Wangsulana pitakon-pitakon ing ngisor iki kanthi patitis!, contoh Bahasa Sunda: Wangsulanana pananya di handap ieu ku luyu!), bila guru meminta instruksi berbahasa Indonesia tulis instruksi dalam bahasa Indonesia. BENTUK SOAL KHAS MUATAN LOKAL: padanan atau arti kosakata bahasa daerah ke Bahasa Indonesia dan sebaliknya; unggah-ungguh atau undak usuk (memilih ragam halus-lugu yang tepat untuk lawan bicara); menerjemahkan kalimat ke Bahasa Indonesia atau sebaliknya; melengkapi kalimat atau dialog sehari-hari yang rumpang; menyusun kata acak menjadi kalimat yang benar; paribasan, paribahasa, atau pepatah daerah beserta maknanya; teks atau wacana pendek bahasa daerah lalu menjawab pertanyaan; untuk Bahasa Jawa boleh menambah tembang macapat dan aksara Jawa; untuk Bahasa Sunda boleh menambah aksara Sunda. ATURAN AKSARA: bila soal memakai aksara daerah (aksara Jawa, aksara Sunda, aksara Bali, aksara Batak, lontara), tulis aksaranya lalu beri transkripsi Latin dalam kurung di sebelahnya (bentuk: [aksara] (transkripsi Latin)) agar dapat dibaca di semua perangkat. NAMA DAN KONTEKS: tokoh memakai nama daerah yang lazim (Jawa: Bagas, Sri, Pak Dhe; Sunda: Ujang, Enung, Kang Asep; Betawi: Bang Ipul, Njeng Aida), konteks kehidupan sekolah dan kampung setempat. KONSISTENSI BAHASA: dalam satu soal semua pilihan ditulis dalam bahasa yang sama; DILARANG mencampur bahasa Indonesia dan bahasa daerah secara acak kecuali terjemahan yang diminta soal. KUNCI TETAP FORMAT APLIKASI: baris kunci tetap ditulis dengan kata Jawaban: X (JANGAN diterjemahkan menjadi Wangsulan, Jawab, atau kata lain) agar tetap terbaca otomatis oleh aplikasi; Pembahasan ditulis dalam bahasa Indonesia dan menjelaskan makna atau alasan kunci.';
window.GS_PROMPT_SOAL=[
{t:'📝 Pilihan Ganda (Umum)',p:'Buatkan 10 soal pilihan ganda mata pelajaran [MAPEL] untuk kelas [KELAS] tentang materi [TOPIK]. Setiap soal punya 4 pilihan A-D, lalu baris Jawaban: X dan Pembahasan singkat. Sesuaikan dengan Kurikulum Merdeka jenjang kelas tersebut.'},
{t:'✍️ Essay / Uraian',p:'Buatkan 5 soal essay (uraian) mata pelajaran [MAPEL] kelas [KELAS] tentang [TOPIK], lengkap dengan kunci jawaban dan rubrik penilaian (skor per poin jawaban).'},
{t:'🔤 Isian Singkat',p:'Buatkan 10 soal isian singkat mata pelajaran [MAPEL] kelas [KELAS] tentang [TOPIK], sertakan kunci jawaban untuk setiap soal.'},
{t:'📊 Soal AKM / Asesmen Nasional',p:'Buatkan 5 paket soal AKM numerasi untuk kelas [KELAS]: setiap paket berisi stimulus singkat (teks, tabel, atau grafik sederhana) lalu 2-3 pertanyaan. Sertakan kunci jawaban dan pembahasan.'},
{t:'🧠 Soal HOTS (Penalaran)',p:'Buatkan 5 soal HOTS pilihan ganda mata pelajaran [MAPEL] kelas [KELAS] tentang [TOPIK] yang menuntut penalaran, bukan hafalan. Sertakan Jawaban: X dan pembahasan alur berpikirnya.'},
{t:'🧮 Soal Cerita Matematika',p:'Buatkan 5 soal cerita matematika kelas [KELAS] tentang [TOPIK]. Gunakan angka yang mudah dihitung, konteks kehidupan sehari-hari di Indonesia (Rupiah, jajan, menabung), sertakan Jawaban: X dan Pembahasan berisi langkah perhitungan.'},
{t:'🕌 Soal Bahasa Arab',p:'Buatkan 10 soal Bahasa Arab untuk kelas [KELAS] tema [TEMA] dengan bentuk soal khas Indonesia: arti mufrodat, menerjemahkan kalimat, dan melengkapi dialog muhadatsah. Teks Arab wajib berharakat lengkap disertai arti Indonesia, sertakan Jawaban: X.'},
{t:'🗣 Soal Bahasa Daerah (Jawa/Sunda/Betawi/Palembang dll)',p:'Buatkan 10 soal Bahasa [JAWA/SUNDA/BETAWI/MADURA/PALEMBANG/dll] untuk kelas [KELAS] tema [TEMA] dengan bentuk khas Muatan Lokal: arti atau padanan kosakata, unggah-ungguh/undak usuk, melengkapi dialog, dan paribasan beserta maknanya. Kalimat perintah ditulis dalam bahasa daerahnya, bila ada aksara sertakan transkripsi Latin dalam kurung, dan sertakan baris Jawaban: X.'},
{t:'📑 Paket Ulangan (PG + Essay)',p:'Buatkan soal ulangan harian mata pelajaran [MAPEL] kelas [KELAS] bab [TOPIK]: 5 soal pilihan ganda dan 3 soal essay, sertakan Jawaban dan Pembahasan. Tulis KUNCI JAWABAN ringkas di bagian paling akhir.'}
];
function openPromptSoalModal(){var h='<div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300 mb-3">Klik <b>Pakai Prompt</b> - prompt otomatis terisi di kotak chat. Cukup ganti bagian [KURUNG] (mapel, kelas, topik) lalu kirim.</div><div class="space-y-2 max-h-[55vh] overflow-y-auto pr-1">';window.GS_PROMPT_SOAL.forEach(function(it,i){h+='<div class="border dark:border-slate-600 rounded-lg p-3"><div class="font-semibold text-sm text-slate-800 dark:text-white">'+it.t+'</div><div class="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">'+it.p.replace(/\[/g,'<span class=\'text-blue-600 dark:text-blue-300 font-semibold\'>[').replace(/\]/g,']</span>')+'</div><button onclick="gsPakaiPrompt('+i+')" class="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Pakai Prompt</button></div>';});h+='</div>';openModal('📋 Prompt Praktis Buat Soal',h);}
function gsPakaiPrompt(i){var it=window.GS_PROMPT_SOAL[i];if(!it)return;var ip=document.getElementById('aiInput');if(!ip){showToast('Panel chat tidak aktif. Buka menu Chat AI dulu.','error');return;}ip.value=it.p;closeModal();ip.focus();showToast('Prompt terisi - ganti [MAPEL]/[KELAS]/[TOPIK] lalu kirim','info');}
async function sendAI(){var ip=document.getElementById('aiInput');if(!ip||!ip.value.trim())return;var prompt=ip.value.trim();ip.value='';if(aiChatHistory.length>10){aiChatHistory=aiChatHistory.slice(-10);}var btn=document.getElementById('aiSendBtn');btn.disabled=true;btn.innerText='Memproses...';['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.add('hidden');});var box=document.getElementById('aiMessages');var ud=document.createElement('div');ud.className='flex justify-end fade-in';ud.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1">Anda</div><div class="whitespace-pre-wrap">'+escapeHTML(prompt)+'</div></div>';box.appendChild(ud);var td=document.createElement('div');td.id='typingIndicator';td.className='flex justify-start fade-in';td.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="animate-pulse text-blue-600">Sedang mengetik...</div></div>';box.appendChild(td);box.scrollTop=box.scrollHeight;var liveBox=null,liveTextEl=null,lastPaint=0;function ensureLiveBox(){if(liveBox)return;document.getElementById('typingIndicator')?.remove();liveBox=document.createElement('div');liveBox.className='flex justify-start fade-in';liveBox.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="ai-output text-gray-800 dark:text-white whitespace-pre-wrap" id="gsLiveText"></div></div>';box.appendChild(liveBox);liveTextEl=document.getElementById('gsLiveText');box.scrollTop=box.scrollHeight;}function paintDelta(full){ensureLiveBox();var now=Date.now();if(now-lastPaint<50&&full)return;lastPaint=now;if(liveTextEl){liveTextEl.textContent=full;box.scrollTop=box.scrollHeight;}}try{var ctx=await getSchoolContext();var isGreeting=/^(hai|halo|hello|hi|tes|test|selamat\s+(pagi|siang|sore|malam)|assalamualaikum|p|woi|woy|apa\s+kabar)\b/i.test(prompt.trim())&&prompt.trim().length<30&&!/(buat|buatkan|soal|pelajaran|materi|rpp|modul|latihan|ujian|ulangan|pertanyaan|essay|pilihan\s*ganda)/i.test(prompt);var sys=isGreeting?'Anda adalah Asisten AI Profesional yang ramah, sopan, dan berwawasan global.':'Anda adalah Asisten AI Profesional yang sangat cerdas, berwawasan internasional, dan ahli dalam bidang pendidikan. Anda menguasai Kurikulum Merdeka dan seluruh mata pelajaran kurikulum Indonesia (PAUD/TK, SD/MI, SMP/MTs, SMA/MA, SMK, madrasah/diniyah) serta bahasa daerah Nusantara (Jawa, Sunda, Betawi, Madura, Batak, Minangkabau, Melayu, Palembang, Bali, Sasak, Bugis, Dayak, Banjar, Aceh, Lampung, dan lainnya); Anda TETAP membuat soal, latihan, atau pembahasan untuk mapel apa pun yang diminta meskipun mapel itu tidak ada di data sekolah pengguna - dilarang menolak dengan alasan data pelajaran belum ada. KERJA TELITI: untuk permintaan soal hitungan, kerjakan langkah demi langkah dan periksa ulang hasil sebelum menjawab; jangan pernah mengarang kunci jawaban; pembahasan harus menghasilkan angka yang sama dengan kunci. Data sekolah: '+ctx+'. Saat user meminta soal pilihan ganda, WAJIB gunakan format: 1. Pertanyaan? A. Pilihan A B. Pilihan B C. Pilihan C D. Pilihan D Jawaban: B. DILARANG memakai tanda bintang * atau ** (bold markdown) di dalam soal, pilihan, dan jawaban.'+window.GS_SOAL_STANDAR;aiChatHistory.push({role:'user',content:prompt});gsLogChat({t:'u',k:'text',c:prompt});var ans=await callAIStream([{role:'system',content:sys}].concat(aiChatHistory),paintDelta);if(!ans||ans.trim()===''){throw new Error("Respon AI kosong.");}aiChatHistory.push({role:'assistant',content:ans});gsLogChat({t:'a',k:'soal',c:ans});if(liveBox){liveBox.remove();liveBox=null;}document.getElementById('typingIndicator')?.remove();var fh=formatSoalHTML(ans);lastAIFormattedHTML=fh;var ad=document.createElement('div');ad.className='flex justify-start fade-in';ad.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="ai-output text-gray-800 dark:text-white">'+fh+'</div></div>';box.appendChild(ad);box.scrollTop=box.scrollHeight;['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('hidden');});try{gsPrewarmKop();}catch(ePW1){}}catch(e){if(liveBox){liveBox.remove();liveBox=null;}document.getElementById('typingIndicator')?.remove();if(/Low Balance|Kuota\/saldo/i.test((e&&e.message)||'')){var gd=document.createElement('div');gd.className='flex justify-start fade-in';gd.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-amber-50 border border-amber-300 shadow-sm"><div class="text-xs font-semibold text-amber-700 mb-1">⚠️ Kuota AI Puter habis (Low Balance)</div><div class="text-sm text-amber-900 whitespace-pre-wrap">'+escapeHTML(e.message)+'</div><div class="mt-2 text-xs text-amber-800">Klik tombol di bawah untuk langsung ganti ke akun Puter gratis yang baru; setelah tersambung, ulangi pesan Anda.</div><button onclick="gsGantiAkunAI()" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg">🔄 Ganti Akun AI Sekarang</button></div>';box.appendChild(gd);box.scrollTop=box.scrollHeight;}showToast('Error: '+e.message,'error');}finally{btn.disabled=false;btn.innerText='Kirim';}}
async function handleAIImageUpload(event){var file=event.target.files[0];if(!file)return;var btn=document.getElementById('aiSendBtn');btn.disabled=true;btn.innerText='Memproses Gambar...';var box=document.getElementById('aiMessages');var reader=new FileReader();reader.onload=async function(e){var iu=e.target.result;var ud=document.createElement('div');ud.className='flex justify-end fade-in';ud.innerHTML='<div class="max-w-[80%] rounded-xl px-2 py-2 bg-blue-600 text-white shadow-sm"><div class="text-xs opacity-70 mb-1 px-2">Anda (Gambar)</div><img src="'+iu+'" class="rounded-lg max-w-full h-auto"></div>';box.appendChild(ud);gsLogChat({t:'u',k:'img',c:iu,label:'Anda (Gambar)'});var td=document.createElement('div');td.id='typingIndicator';td.className='flex justify-start fade-in';td.innerHTML='<div class="max-w-[90%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI</div><div class="animate-pulse text-blue-600">Membaca teks (OCR)...</div></div>';box.appendChild(td);box.scrollTop=box.scrollHeight;try{var messages=[{role:'user',content:[{type:'text',text:"Baca semua teks di gambar ini."},{type:'image_url',image_url:{url:iu}}]}];var res=null;try{res=await GSAI.chat(messages);}catch(eOCR){console.warn('OCR AI gagal, coba OCR lokal:',eOCR);res=await gsLocalOCR(iu);}var et=typeof res==='string'?res:(res?.message?.content||res?.text||'');document.getElementById('typingIndicator')?.remove();if(!et||!et.trim()){throw new Error("Tidak ada teks terdeteksi.");}var fh=marked.parse(et);lastAIFormattedHTML=fh;gsLogChat({t:'a',k:'md',c:et,label:'Asisten AI (Teks hasil Scan)'});var ad=document.createElement('div');ad.className='flex justify-start fade-in';ad.innerHTML='<div class="max-w-[95%] rounded-xl px-4 py-3 bg-white shadow-sm"><div class="text-xs opacity-70 mb-1 text-gray-500 dark:text-slate-400">Asisten AI (Teks hasil Scan)</div><div class="ai-output text-gray-800 dark:text-white">'+fh+'</div></div>';box.appendChild(ad);box.scrollTop=box.scrollHeight;['aiPrintBtn','aiWordBtn'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('hidden');});try{gsPrewarmKop();}catch(ePW2){}showToast('Teks dipindai!','success');}catch(err){document.getElementById('typingIndicator')?.remove();showToast('Gagal: '+err.message,'error');}finally{btn.disabled=false;btn.innerText='Kirim';event.target.value='';}};reader.readAsDataURL(file);}
async function openPrintPreview(htmlContent){var pw=window.open('','_blank');if(!pw){showToast('Pop-up diblokir.','error');document.getElementById('printArea').innerHTML=htmlContent;window.print();return;}pw.document.write('<html lang="id"><head><title>Cetak</title><script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script><style>body{font-family:Times New Roman,Georgia,serif;margin:20px;color:#000}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}table,th,td{border:1px solid #000!important;border-collapse:collapse!important}.rapor-info-table,.rapor-info-table td,.rapor-info-table tr{border:none!important;background:transparent!important}.card-info-table,.card-info-table td,.card-info-table tr{border:none!important;background:transparent!important}.ai-output h1,.ai-output h2,.ai-output h3{font-weight:bold;margin-top:12px;margin-bottom:6px}.ai-output p{margin-bottom:8px}.ai-output ul,.ai-output ol{margin-left:20px;margin-bottom:8px}.ai-output table{width:100%;border-collapse:collapse;margin-bottom:8px}.ai-output th,.ai-output td{border:1px solid #000;padding:6px;text-align:left}.ai-output img{max-width:100%;height:auto;border-radius:8px;margin:10px 0;box-shadow:0 2px 5px rgba(0,0,0,.1)}.ai-output .soal-item{margin-bottom:18px;padding-bottom:15px;page-break-inside:avoid}.ai-output .soal-header{display:flex;align-items:flex-start;gap:6px;margin-bottom:8px}.ai-output .soal-number{font-weight:bold;min-width:28px}.ai-output .soal-text{font-size:14px;line-height:1.7;font-weight:500;flex:1}.ai-output .soal-opts{display:flex;gap:24px;margin:8px 0 8px 34px}.ai-output .opt-col{flex:1;display:flex;flex-direction:column;gap:4px}.ai-output .soal-opt{display:flex;align-items:flex-start;font-size:13px}.ai-output .soal-opt .opt-label{font-weight:bold;margin-right:6px;min-width:20px}.rapor-page{page-break-after:always;break-after:page}.rapor-page:last-child{page-break-after:auto;break-after:auto}@media print{body{margin:0}.no-print{display:none}}</style></head><body><div class="no-print" style="text-align:center;margin-bottom:20px;position:fixed;bottom:10px;left:0;width:100%"><button onclick="window.print()" style="padding:10px 20px;font-size:16px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer">🖨️ Cetak / PDF</button></div><div id="contentArea">'+htmlContent+'</div><script>var ca=document.getElementById("contentArea");var rt=ca.textContent;if(ca.children.length===0&&(rt.trim().startsWith("#")||rt.includes("**"))){ca.innerHTML=marked.parse(rt);}<\/script></body></html>');pw.document.close();pw.focus();setTimeout(function(){pw.print();},500);}
async function printAIResult(includeKey){if(!lastAIFormattedHTML)return;var gsBtnsPdf=['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].map(function(id){return document.getElementById(id);}).filter(Boolean);gsBtnsPdf.forEach(function(b){b.disabled=true;});showToast('Menyiapkan pratinjau PDF...','info');try{var ch=lastAIFormattedHTML;if(!includeKey){ch=ch.replace(/<div class="kunci-jawaban-section[^"]*"[^>]*>[\s\S]*?<\/div><\/div>/g,'');ch=ch.replace(/<div class="soal-answer[^"]*"[^>]*>[\s\S]*?<\/div>/g,'');ch=ch.replace(/class="soal-opt[^"]*correct[^"]*"/g,'class="soal-opt"');ch=ch.replace(/<div class="soal-pembahasan[^"]*"[^>]*>[\s\S]*?<\/div>/g,'');}else{ch=ch.replace(/hide-on-print/g,'');}
// LEMBAR SOAL STANDAR: judul + identitas Nama/Kelas + instruksi + pilihan satu per baris - persis contoh lembar
var td=document.createElement('div');td.innerHTML=ch;
var lem=gsLembarTransform(td);
// SOAL 2 KOLOM ALAMI (Task 31): PG mengalir mengisi halaman sebisanya (bisa 10/11/12
// soal tergantung panjang soal), sisanya OTOMATIS lanjut ke halaman 2 dst
gsSoalMulticolPDF(td);
if(!includeKey&&lem.footer)td.insertAdjacentHTML('beforeend',lem.footer);
var kh=await generateKopHTML();
openPrintPreview('<div style="font-family:Times New Roman,Georgia,serif;color:#000;padding:0;margin:0;width:100%">'+kh+lem.header+'<div class="ai-output" style="color:#000;margin:0;padding:0">'+td.innerHTML+'</div><style>@page{size:A4;margin:14mm 16mm 9mm 16mm}.ai-output .soal-item{margin-bottom:8px;padding-bottom:6px}.ai-output .soal-header{margin-bottom:4px}.ai-output .soal-text{font-size:12.5px;line-height:1.35;font-weight:400;text-align:justify}.ai-output .soal-text p{margin:0 0 2px 0}.ai-output .soal-opts{display:block;margin:3px 0 3px 34px}.ai-output .opt-col{display:block}.ai-output .soal-opt{display:flex;align-items:flex-start;font-size:12px;margin:1px 0;line-height:1.3;text-align:left}.ai-output .soal-opt .opt-label{text-transform:lowercase}.ai-output p{margin-bottom:3px;text-align:justify}.ai-output img{margin:6px 0;border-radius:0;box-shadow:none}.gs-soal-cols{column-count:2;column-gap:28px}.gs-soal-cols .soal-item{break-inside:avoid;page-break-inside:avoid}</style></div>');}finally{gsBtnsPdf.forEach(function(b){b.disabled=false;});}}
function gsWordLogoSrc(src,encMax){return new Promise(function(res){
if(!src)return res('');
function attempt(useCors){return new Promise(function(done){
var im;try{im=new Image();}catch(e){return done('');}
if(useCors)try{im.crossOrigin='anonymous';}catch(eC){}
im.onload=function(){
try{
var nw=im.naturalWidth||0,nh=im.naturalHeight||0;
if(!nw||!nh)return done(src);
var r=nw/nh,w,h;
if(r>=1){w=encMax;h=Math.max(1,Math.round(encMax/r));}
else{h=encMax;w=Math.max(1,Math.round(encMax*r));}
var cv=document.createElement('canvas');cv.width=w;cv.height=h;
var cx=cv.getContext('2d');
if(!cx)return done(src);
cx.fillStyle='#ffffff';cx.fillRect(0,0,w,h);
cx.drawImage(im,0,0,w,h);
var out='';
try{out=cv.toDataURL('image/jpeg',0.9);}catch(e){out='';}
done(out||src);
}catch(e){done(src);}
};
im.onerror=function(){done(useCors?'__GS_RETRY__':'');};
im.src=src;
});}
attempt(true).then(function(r1){if(r1==='__GS_RETRY__'){attempt(false).then(res);}else{res(r1);}});
});}
// Normalisasi logo kop utk Word: WebP/data URL raksasa/gambar remote -> JPEG inline kecil
// (kiri 200px, kanan 201px agar src kedua logo SELALU unik di mata Word)
function gsWordImgTag(src,max){return new Promise(function(res){if(!src)return res('');var im;try{im=new Image();}catch(e){return res('');}im.onload=function(){var r=(im.naturalHeight?(im.naturalWidth/im.naturalHeight):1)||1;var w,h;if(r>=1){w=max;h=Math.max(1,Math.round(max/r));}else{h=max;w=Math.max(1,Math.round(max*r));}res('<img src="'+src+'" width="'+w+'" height="'+h+'" style="border:none;">');};im.onerror=function(){res('');};im.src=src;});}
async function gsKopHTMLForWord(){var profile=(await gsGetProfilSekolah())[0]||{};var ck='';try{ck=JSON.stringify([profile.kop_line1,profile.kop_line1b,profile.kop_line2,profile.kop_line3,profile.name,profile.address,profile.logo_left,profile.logo_right]);}catch(eK){}if(ck&&_gsKopWordCache.key===ck&&_gsKopWordCache.html)return _gsKopWordCache.html;if(!profile.kop_line1&&!profile.logo_left)return '';var l1=profile.kop_line1||profile.name||'NAMA SEKOLAH';var l1b=profile.kop_line1b||'';var l2=profile.kop_line2||profile.address||'Alamat Sekolah';var l3=profile.kop_line3||'Email | Telp';var lSrc=await gsWordLogoSrc(profile.logo_left,200);var rSrc=await gsWordLogoSrc(profile.logo_right,201);var ll=await gsWordImgTag(lSrc,75);var rl=await gsWordImgTag(rSrc,75);// KOP WORD = PERSIS generateKopHTML (PDF): sel kiri/kanan 75px, tengah padding 20px,
// padding-bawah 10px sebelum garis double, margin-bawah 25px, margin antar baris teks
// (l1b 2px, l2 4px, l3 2px) & line-height identik PDF - beda ukuran px->pt KONVERSI EXACT.
var l1bHTML=l1b.trim()?'<div style="font-size:15pt;font-weight:bold;text-transform:uppercase;line-height:1.0;margin:2px 0 0;">'+l1b+'</div>':'';var out='<div style="border-bottom:3px double #000000;margin-bottom:25px;font-family:Arial,Helvetica,sans-serif;">'+'<table width="672" cellpadding="0" cellspacing="0" style="width:672px;border-collapse:collapse;table-layout:fixed;border-bottom:3px double #000000;font-family:Arial,Helvetica,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td width="75" style="width:75px;text-align:center;vertical-align:middle;border:none;padding:0cm 0cm 10px 0cm;">'+ll+'</td><td width="522" style="width:522px;text-align:center;vertical-align:middle;border:none;padding:0cm 20px 10px 20px;"><div style="font-size:12pt;font-weight:bold;text-transform:uppercase;line-height:1.0;">'+l1+'</div>'+l1bHTML+'<div style="font-size:16.5pt;font-weight:bold;text-transform:uppercase;line-height:1.2;margin:4px 0 0;">'+l2+'</div><div style="font-size:9pt;line-height:1.0;margin:2px 0 0;">'+l3+'</div></td><td width="75" style="width:75px;text-align:center;vertical-align:middle;border:none;padding:0cm 0cm 10px 0cm;">'+rl+'</td></tr></table></div>';_gsKopWordCache.key=ck;_gsKopWordCache.html=out;return out;}
// ===== LEMBAR SOAL STANDAR (persis contoh: judul - identitas Nama/Kelas - instruksi - soal - Nilai/Paraf) =====
function gsLembarPickIntro(introText){var lines=String(introText||'').split(/\r?\n/).map(function(l){return String(l).replace(/\s+/g,' ').trim();}).filter(function(l){return l;});
var keep=[];lines.forEach(function(l){
if(/(tanda silang|jawablah|isilah|petunjuk|pilihlah|kerjakan)/i.test(l))return;
if(/^(berikut|silakan|silahkan|ini adalah|semoga|good luck|selamat mengerjakan)\b/i.test(l))return;
keep.push(l);});
if(!keep.length)return{title:'LEMBAR LATIHAN SOAL',sub:[],body:false};
if(keep.length>3||keep.some(function(l){return l.length>90;}))return{title:'LEMBAR LATIHAN SOAL',sub:[],body:true};
var t=null,sub=keep;var w0=keep[0].split(' ');
if(keep[0].length<=60&&w0.length<=8&&/^(lembar|soal|latihan|ulangan|penilaian|ujian|kuis|evaluasi|tes)\b/i.test(keep[0])){t=keep[0].toUpperCase();sub=keep.slice(1);}
return{title:t||'LEMBAR LATIHAN SOAL',sub:sub,body:false};}
function gsLembarHeaderHTML(title,sub){var dots='..............................................................................................';var sh='';var arr=sub||[];
arr.forEach(function(l,i){sh+='<div style="text-align:center;font-weight:bold;font-size:12pt;margin:'+(i===0?'2px':'1px')+' 0 '+(i===arr.length-1?'8px':'1px')+' 0;">'+l+'</div>';});
return '<div style="text-align:center;margin:0 0 8px 0;"><div style="font-size:14pt;font-weight:bold;margin:0 0 3px 0;">'+(title||'LEMBAR LATIHAN SOAL')+'</div>'+sh+'</div>'
+'<table class="rapor-info-table" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;width:100%;margin:0 0 8px 0;">'
+'<tr><td width="110" style="width:110px;border:none;padding:2px 0;vertical-align:top;">Nama Lengkap</td><td width="14" style="width:14px;border:none;padding:2px 0;">:</td><td style="border:none;padding:2px 0;">'+dots+'</td></tr>'
+'<tr><td style="border:none;padding:2px 0;vertical-align:top;">Kelas</td><td style="border:none;padding:2px 0;">:</td><td style="border:none;padding:2px 0;">'+dots+'</td></tr></table>';}
function gsLembarFooterHTML(){function fc(w,extra){return '<td width="'+w+'" style="border:1px solid #000000;padding:6px;vertical-align:top;'+(extra||'')+'">';}
return '<table class="lembar-footer-table" width="100%" border="1" cellpadding="6" cellspacing="0" style="border:1px solid #000000;border-collapse:collapse;width:100%;margin-top:24px;table-layout:fixed;">'
+'<tr>'+fc('15%','font-weight:bold;')+'Nilai</td>'+fc('30%','font-weight:bold;')+'Catatan</td>'+fc('27%','font-weight:bold;')+'Paraf Guru</td>'+fc('28%','font-weight:bold;')+'Paraf Orang Tua</td></tr>'
+'<tr>'+fc('15%','height:60px;')+'&nbsp;</td>'+fc('30%','height:60px;')+'&nbsp;</td>'+fc('27%','height:60px;')+'&nbsp;</td>'+fc('28%','height:60px;')+'&nbsp;</td></tr></table>';}
function gsLembarTransform(td,forWord){
var cont=td.querySelector('.soal-container');
if(!cont){var nl=(td.textContent||'').match(/(^|\n)\s*\d{1,3}[.)]\s+\S/g)||[];
if(nl.length<2)return{header:'',footer:''};
return{header:forWord?gsLembarHeaderWordHTML('LEMBAR LATIHAN SOAL',[]):gsLembarHeaderHTML('LEMBAR LATIHAN SOAL',[]),footer:forWord?gsLembarFooterWordHTML():gsLembarFooterHTML()};}
var introEls=[];
Array.prototype.slice.call(td.children).forEach(function(el){
if(el===cont)return;
if(String(el.className).indexOf('kunci-jawaban-section')>=0)return;
introEls.push(el);});
var introText=introEls.map(function(el){return el.textContent||'';}).join('\n');
var pick=gsLembarPickIntro(introText);
if(!pick.body)introEls.forEach(function(el){if(el.parentNode)el.parentNode.removeChild(el);});
var header=forWord?gsLembarHeaderWordHTML(pick.title,pick.body?[]:pick.sub):gsLembarHeaderHTML(pick.title,pick.body?[]:pick.sub);
var subAll=((pick.body?introText:pick.sub.join(' '))||'').toLowerCase();
var firstPG=null,firstEssay=null;
Array.prototype.slice.call(td.querySelectorAll('.soal-item')).forEach(function(it){
if(it.querySelector('.soal-opt')){if(!firstPG)firstPG=it;}
else if(!firstEssay)firstEssay=it;});
function gsIns(anchor,txt){var d=document.createElement('div');d.innerHTML='<p style="margin:0 0 10px 0;">'+txt+'</p>';if(d.firstChild&&anchor.parentNode)anchor.parentNode.insertBefore(d.firstChild,anchor);}
if(firstPG&&subAll.indexOf('tanda silang')<0)gsIns(firstPG,'Berilah tanda silang (X) huruf a, b, c, atau d pada jawaban yang benar!');
if(firstEssay&&subAll.indexOf('jawablah')<0&&subAll.indexOf('isilah')<0)gsIns(firstEssay,'Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!');
return{header:header,footer:forWord?gsLembarFooterWordHTML():gsLembarFooterHTML()};}
// ==== WORD v29 KOP PALING ATAS (= PDF) ====
// Keluhan user: "di word kop suratnya ditarok paling atas persis seperti di pdf".
// Akar masalah (MS Office HTML/XML Reference, "Section break types"): Word mewakili
// section break dgn BR eksplisit SEBELUM <div class=SectionN> dan tipe break disimpan
// pd style BR tsb. v28 tidak punya BR di antara div Section -> MS Word pakai default
// OOXML (nextPage) -> Section1 (kop+judul+identitas) jadi halaman 1 sendiri, soal
// terdorong ke halaman 2 -> kop tidak nempel paling atas di halaman soal spt PDF.
// FIX 1: BR continuous section break eksplisit (BR clear=all + page-break-before:auto
// + mso-break-type:section-break, persis markup ekspor asli MS Word) di 1->2 dan
// 2->3; semua @page SectionN size+margin identik -> continuous sah, aliran kontinu:
// kop paling atas, soal 2 kolom langsung di bawahnya, jumlah halaman = PDF.
// FIX 2: garis double bawah kop pindah ke DIV pembungkus (meniru DOM PDF). Empiris
// harness: border level TABEL diabaikan LO saat sel border:none; border level SEL
// menaikkan kop +9.7pt di LO -> melewati ambang tipis balance kolom (16pt) -> kolom
// balance per halaman (4+4) bukan fill spt PDF (5+5). DIV border = biaya 0pt,
// dirender Word/WPS/LO, geometri garis = PDF (10px di bawah isi via padding sel).
// ==== WORD v28 BEBAS-TABEL ====
// Permintaan pengguna: (1) tampilan Word = persis PDF, (2) PDF 2 halaman -> Word
// 2 halaman, (3) HILANGKAN garis tabel di Word. Akar masalah: tabel layout
// Word-native (nomor|teks 322px, baris pilihan, tabel pasangan 672px, identitas,
// footer) tampil sebagai gridline abu-abu di MS Word dan memicu selisih halaman.
// Kini SEMUA tabel layout area soal DIHAPUS:
//  - Nomor/teks/pilihan/essay = PARAGRAF hanging-indent + tab stop (format asli
//    Word: margin-left + text-indent negatif + padding nbsp terukur) -> baris lanjutan
//    SELALU sejajar teks soal/pilihan di atasnya, di SEMUA pembaca, tanpa tabel.
//  - 2 kolom = SECTION Word native top-level berdampingan (@page Section2
//    mso-columns utk MS Word/WPS) + CSS column-count:2 (terbukti dirender LO):
//    pemaginan halaman dikerjakan engine sendiri secara kontinu -> jumlah
//    halaman mengikuti PDF secara alami (tidak ada lagi perkiraan kapasitas).
//  - Sisa tabel: kop (logo) + tabel markdown (bergaris = PDF). Identitas & footer
//    Nilai/Paraf jadi paragraf tab-stop -> tanpa garis sama sekali.
// PENGUKUR LEBAR di browser saat export (metrik Times New Roman = identik di
// Chrome/Word/WPS/LO karena Liberation Serif metric-compatible) -> padding nbsp
// deterministik di SEMUA pembaca TANPA tab (import tab LO terbukti tidak reliable:
// span mso-tab-count dilipat jadi spasi, deklarasi tab-stops diabaikan).
function gsWMeasure(text,fontCss){
var d=document.createElement('span');
d.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;margin:0;padding:0;border:none;font:'+fontCss;
d.innerHTML=text;document.body.appendChild(d);
var w=d.offsetWidth;document.body.removeChild(d);return w;}
function gsWPadNbsp(targetPx,text,fontCss){
var w=gsWMeasure(text,fontCss),sp=gsWMeasure('&nbsp;',fontCss);
var n=Math.round((targetPx-w)/sp);
return n>0?new Array(n+1).join('\u00a0'):'';}
// Nomor+teks soal -> paragraf hanging: nomor 12pt bold di 0px, teks 12.5px mulai
// 34px (padding nbsp terukur), baris lanjutan tetap 34px (= PDF). Segmen <p> dalam
// .soal-text jadi paragraf sendiri, jarak 2px (= PDF .soal-text p{margin:0 0 2px}).
function gsWHeaderParas(h,moreFollows){
function gsSegOk(s){return String(s).replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
var num=h.querySelector('.soal-number'),txt=h.querySelector('.soal-text');
var numHTML=num?'<b style="font-size:12pt;">'+num.innerHTML+'</b>':'';
var segs=[],buf='';
if(txt){Array.prototype.slice.call(txt.childNodes).forEach(function(n){
if(n.nodeType===1&&String(n.tagName).toLowerCase()==='p'){if(gsSegOk(buf))segs.push(buf);buf='';if(gsSegOk(n.innerHTML))segs.push(n.innerHTML);}
else{buf+=(n.outerHTML!=null?n.outerHTML:(n.textContent||''));}});
if(gsSegOk(buf))segs.push(buf);}
if(!segs.length)segs=[''];
var out='';
for(var i=0;i<segs.length;i++){
var first=(i===0),last=(i===segs.length-1);
var st='margin:0 0 '+(last?(moreFollows?'9px':'16px'):'2px')+' 34px;'
+(first?'text-indent:-34px;':'')
+'font-size:12.5px;line-height:12.7pt;mso-line-height-rule:exactly;text-align:justify;page-break-inside:avoid;'
+(moreFollows?'page-break-after:avoid;':'');
out+='<p style="'+st+'">'+(first?numHTML+gsWPadNbsp(34,numHTML,'bold 12pt "Times New Roman",Georgia,serif'):'')+segs[i]+'</p>';}
return out;}
// Pilihan -> paragraf hanging: label bold di 34px (indent -26px dari margin 60px),
// teks mulai 60px (padding nbsp 26px), baris lanjutan 60px (= PDF), 12px/11.7pt exact,
// jarak antar pilihan 1px (= PDF .soal-opt{margin:1px 0}), akhir soal 18px.
function gsWOptParas(opts){
var out='';
opts.forEach(function(o,i){
var last=(i===opts.length-1);
var lb=o.querySelector('.opt-label'),tx=o.querySelector('.opt-text');
var lbl=(lb?lb.innerHTML:'').toLowerCase();
var txt2=tx?tx.innerHTML:(lb?'':o.innerHTML);
var lblHTML=lbl?'<b>'+lbl+'</b>':'';
out+='<p style="margin:1px 0 '+(last?'18px':'1px')+' 60px;text-indent:-26px;font-size:12px;line-height:11.7pt;mso-line-height-rule:exactly;text-align:left;page-break-inside:avoid;'+(last?'':'page-break-after:avoid;')+'">'+lblHTML+(lbl?gsWPadNbsp(26,lblHTML,'bold 9pt "Times New Roman",Georgia,serif'):'')+txt2+'</p>';});
return out;}
// Item PG -> paragraf (header + pilihan + konten lain: gambar dll.)
function gsWSoalItemParas(it){
var h=it.querySelector('.soal-header'),od=it.querySelector('.soal-opts');
var other='';
Array.prototype.slice.call(it.children).forEach(function(c){if(c===h||c===od)return;other+=c.outerHTML;});
var opts=[];
if(od){od.querySelectorAll('.opt-col').forEach(function(col){col.querySelectorAll('.soal-opt').forEach(function(o){opts.push(o);});});
if(!opts.length)opts=Array.prototype.slice.call(od.querySelectorAll('.soal-opt'));}
var out='';
if(h)out+=gsWHeaderParas(h,opts.length>0||!!other);
out+=gsWOptParas(opts);
out+=other;
if(!out)out='<div>'+it.innerHTML+'</div>';
return out;}
// Item essay (tanpa pilihan) -> paragraf + konten lain (gambar maks 620px)
function gsWEssayItemParas(it){
var h=it.querySelector('.soal-header'),od=it.querySelector('.soal-opts');
var other='';
Array.prototype.slice.call(it.children).forEach(function(c){if(c===h||c===od)return;other+=c.outerHTML;});
var out=h?gsWHeaderParas(h,!!other):'';
out+=other;
if(!out)out='<div>'+it.innerHTML+'</div>';
return out;}
// Identitas Word = paragraf tab-stop (label 0px, ':' 110px=82.5pt, titik-titik
// 124px=93pt) - TANPA tabel -> tanpa garis. Judul/sub tetap paragraf tengah (= PDF).
function gsLembarHeaderWordHTML(title,sub){
var dots='..............................................................................................';
var sh='';var arr=sub||[];
arr.forEach(function(l,i){sh+='<div style="text-align:center;font-weight:bold;font-size:12pt;margin:'+(i===0?'2px':'1px')+' 0 '+(i===arr.length-1?'8px':'1px')+' 0;">'+l+'</div>';});
var fi='12pt "Times New Roman",Georgia,serif';
return '<div style="text-align:center;margin:0 0 8px 0;"><div style="font-size:14pt;font-weight:bold;margin:0 0 3px 0;">'+(title||'LEMBAR LATIHAN SOAL')+'</div>'+sh+'</div>'
+'<p style="margin:2px 0;font-size:12pt;">Nama Lengkap'+gsWPadNbsp(110,'Nama Lengkap',fi)+': '+dots+'</p>'
+'<p style="margin:2px 0 8px 0;font-size:12pt;">Kelas'+gsWPadNbsp(110,'Kelas',fi)+': '+dots+'</p>';}
// Footer Nilai/Paraf Word = TABEL bergaris hitam 1px ("kasih tabel") persis PDF:
// kolom fixed [101|202|181|188]px (= 15/30/27/28% dari 672px), label bold 12pt,
// baris kosong 60px utk area tanda tangan. Tanpa class khusus agar konverter tabel
// Word (border=1 + hitam 1px + padding 6px) memprosesnya seperti tabel markdown;
// lebar td eksplisit + table-layout:fixed = geometri kolom exact di semua pembaca.
function gsLembarFooterWordHTML(){
function fc(w,extra){return '<td width="'+w+'" style="width:'+w+'px;border:1px solid #000000;padding:6px;vertical-align:top;'+(extra||'')+'">';}
return '<table width="672" border="1" cellpadding="0" cellspacing="0" style="width:672px;border:1px solid #000000;border-collapse:collapse;table-layout:fixed;margin-top:24px;mso-table-lspace:0pt;mso-table-rspace:0pt;">'
+'<tr>'+fc(101,'font-weight:bold;font-size:12pt;')+'Nilai</td>'+fc(202,'font-weight:bold;font-size:12pt;')+'Catatan</td>'+fc(181,'font-weight:bold;font-size:12pt;')+'Paraf Guru</td>'+fc(188,'font-weight:bold;font-size:12pt;')+'Paraf Orang Tua</td></tr>'
+'<tr>'+fc(101,'height:60px;')+'&nbsp;</td>'+fc(202,'height:60px;')+'&nbsp;</td>'+fc(181,'height:60px;')+'&nbsp;</td>'+fc(188,'height:60px;')+'&nbsp;</td></tr></table>';}

// SUSUNAN SOAL 2 KOLOM (Task 34): PDF memakai CSS multicol (Chrome mengisi halaman
// sendiri); WORD memakai TABEL per halaman berkapasitas terukur nyata (adaptif
// 10/11/12+ soal - semangat Task 31) agar RAPI & urutan baca benar di SEMUA pembaca
// Word (desktop/HP/WPS/Docs). Latar: section kolom native Word dari Task 31 ternyata
// rapuh - div section tak tertutup membuat section kedua bersarang di section pertama
// (Word tidak pernah menyimpan section bersarang -> setelan kolomnya ditolak) dan
// banyak pembaca Word mengabaikan setelan kolom section sama sekali -> pengguna
// melaporkan "tampilan Word ngacak tidak rapi seperti PDF".
// KOP HANYA DI HALAMAN PERTAMA (permintaan pengguna, Task 29): tabel blok berada
// SETELAH kop+judul+identitas; pemisah antar blok hanya memecah halaman tanpa kop ulang.
// PEMILIH SOAL PG (dipakai PDF & Word): .soal-item ber-opsi di luar kunci jawaban + kecilkan gambar
function gsSoalPick(td){
var items=[];
td.querySelectorAll('.soal-item').forEach(function(it){
if(it.closest&&it.closest('.kunci-jawaban-section'))return;
if(it.querySelector('.soal-opt'))items.push(it);});
items.forEach(function(it){it.querySelectorAll('img').forEach(function(im){
var w=parseInt(im.getAttribute('width')||'0',10)||0;
if(w>280){var h2=parseInt(im.getAttribute('height')||'0',10)||0;
im.setAttribute('width','280');im.setAttribute('height',String(h2>0?Math.max(20,Math.round(h2*280/w)):200));}
im.style.maxWidth='100%';});});
return items;}
// PDF: wadah CSS multicol (column-count:2) - Chrome mengisi & memecah halaman sendiri
function gsSoalMulticolPDF(td){
var items=gsSoalPick(td);
if(items.length<2)return;
var out='<div class="gs-soal-cols">';items.forEach(function(it){out+=it.outerHTML;});out+='</div>';
items[0].insertAdjacentHTML('beforebegin',out);
items.forEach(function(it){if(it.parentNode)it.parentNode.removeChild(it);});}
// WORD (Task 34): SOAL 2 KOLOM = TABEL per halaman berkapasitas TERUKUR (bukan lagi
// section kolom native Word dari Task 31 yang tampil ACAK di banyak pembaca Word: div
// section yang tak tertutup membuat section kolom bersarang sehingga setelan kolomnya
// ditolak, dan Word HP/WPS/Google Docs mengabaikan setelan kolom section sama sekali).
// Tabel Word-native tampil
// IDENTIK di semua pembaca. Tiap halaman = 1 tabel 2 kolom sel: kiri = paruh pertama
// soal, kanan = paruh kedua (urutan baca kiri atas-bawah lalu kanan, persis PDF).
// Kapasitas diukur NYATA di browser (tinggi tiap soal pada lebar kolom 322px + kepala
// halaman 1) -> halaman tetap terisi adaptif 10/11/12+ soal (semangat Task 31) dengan
// slack 3% agar Word tidak meluber; tiap blok dipaksa mulai halaman baru sehingga
// urutan soal SELALU benar walau estimasi meleset (hanya menyisakan ruang kosong kecil).
// KOP HANYA DI HALAMAN PERTAMA (Task 29): blok berada setelah kop, pemisah tanpa kop ulang.
// Konversi 1 soal -> TABEL Word-native keep-together (T27 anti soal hilang saat
// print + T30 exact-pt): nomor di kolom tetap 34px, teks soal di sel sendiri -> baris
// lanjutan soal panjang SELALU sejajar teks soal di atasnya (bukan lurus ke tepi nomor)
// di SEMUA pembaca Word (desktop/HP/WPS/Docs); label pilihan di 34px, teks pilihan
// sejajar 66px (persis PDF). Semua tabel TANPA garis.
function gsSplitDataUrl(u){var m=String(u||'').match(/^data:([^;,]+)(;[^,]*)?,(.*)$/);if(!m||String(m[2]||'').indexOf('base64')<0)return null;return{mime:m[1],b64:m[3].replace(/\s+/g,'')};}
function gsB64Utf8(s){try{return btoa(unescape(encodeURIComponent(String(s))));}catch(e){try{return Buffer.from(String(s),'utf8').toString('base64');}catch(e2){return '';}}}
function gsB64Chunk(b64){return String(b64||'').replace(/(.{76})/g,'$1\r\n');}
function gsBuildMHTML(html,parts){var B='----=_NextPart_GURUSMART';var out='MIME-Version: 1.0\r\nContent-Type: multipart/related; type="text/html"; boundary="'+B+'"\r\n\r\n';out+='--'+B+'\r\nContent-Location: file:///C:/GURUSMART/doc.htm\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n'+gsB64Chunk(gsB64Utf8(html))+'\r\n';(parts||[]).forEach(function(p){out+='--'+B+'\r\nContent-Location: file:///C:/GURUSMART/'+p.name+'\r\nContent-Type: '+p.type+'\r\nContent-Transfer-Encoding: base64\r\n\r\n'+gsB64Chunk(p.b64)+'\r\n';});out+='--'+B+'--\r\n';return out;}
// Format MHTML = format asli Word; gambar disematkan sebagai part MIME sehingga logo
// kop & gambar soal SELALU tampil (data URI base64 saja sering menjadi red-X di Word).
async function exportToWord(){
if(!lastAIFormattedHTML){showToast('Tidak ada teks.','error');return;}
var gsBtnsW=['aiPrintBtn','aiWordBtn','aiPrintKeyBtn'].map(function(id){return document.getElementById(id);}).filter(Boolean);gsBtnsW.forEach(function(b){b.disabled=true;});showToast('Menyiapkan file Word...','info');try{
var td=document.createElement('div');
td.innerHTML=lastAIFormattedHTML;
td.querySelectorAll('.kunci-jawaban-section,.soal-answer,.soal-pembahasan').forEach(function(el){el.remove();});
td.querySelectorAll('.soal-opt.correct').forEach(function(el){el.classList.remove('correct');});
// TUNGGU gambar selesai termuat (data URL pada node lepas) agar naturalWidth terbaca
await Promise.all(Array.prototype.slice.call(td.querySelectorAll('img')).map(function(img){
if(img.complete)return null;
return Promise.race([new Promise(function(rI){img.onload=rI;img.onerror=rI;}),new Promise(function(rI){setTimeout(rI,1500);})]);
})).catch(function(eI){});
// GAMBAR: Word mengabaikan max-width -> set width/height EKSPLISIT (maks 620px, rasio terjaga)
td.querySelectorAll('img').forEach(function(img){
var nw=img.naturalWidth||0,nh=img.naturalHeight||0;
img.removeAttribute('width');img.removeAttribute('height');
if(nw>620){img.setAttribute('width','620');img.setAttribute('height',String(Math.max(40,Math.round(nh*620/nw))));}
else if(nw>0){img.setAttribute('width',String(nw));img.setAttribute('height',String(nh));}
img.style.maxWidth='100%';img.style.height='auto';});
// LEMBAR (judul+identitas+instruksi) varian WORD: identitas & footer PARAGRAF
// (tanpa tabel -> tanpa garis). Instruksi otomatis tetap disisipkan sama PDF.
var lem=gsLembarTransform(td,true);
// PILIH soal PG (dipakai PDF & Word) + kecilkan gambar dalam soal (maks 280px = PDF)
var gsItems=gsSoalPick(td);
// FLATTEN .soal-container: section div Word harus top-level, marker split tidak
// boleh berada di dalam div pembungkus (HTML terpotong di tengah tag = rusak).
var gsCont=td.querySelector('.soal-container');
if(gsCont){while(gsCont.firstChild)gsCont.parentNode.insertBefore(gsCont.firstChild,gsCont);gsCont.parentNode.removeChild(gsCont);}
// MARKER: posisi blok soal 2 kolom = tepat sebelum soal PG pertama (sama PDF multicol)
if(gsItems.length)gsItems[0].insertAdjacentHTML('beforebegin','<!--GURUSMART-SEC2-->');
// SOAL PG -> PARAGRAF hanging (dikumpulkan utk section 2 kolom)
var gsPG='';
gsItems.forEach(function(it){gsPG+=gsWSoalItemParas(it);if(it.parentNode)it.parentNode.removeChild(it);});
// SISA .soal-item (essay) -> paragraf di tempat (section 1 kolom, sama PDF)
Array.prototype.slice.call(td.querySelectorAll('.soal-item')).forEach(function(it){
it.insertAdjacentHTML('beforebegin',gsWEssayItemParas(it));
if(it.parentNode)it.parentNode.removeChild(it);});
// TABEL MARKDOWN = PERSIS PDF: bergaris hitam 1px + padding 6px + rata kiri
td.querySelectorAll('.rapor-info-table,.lembar-footer-table,.card-info-table').forEach(function(tb){tb.setAttribute('border','0');});
td.querySelectorAll('table').forEach(function(tb){if(tb.getAttribute('border')==='0')return;tb.setAttribute('border','1');tb.setAttribute('cellspacing','0');tb.setAttribute('cellpadding','0');tb.style.border='1px solid #000000';tb.style.borderCollapse='collapse';tb.style.width='100%';});
td.querySelectorAll('th,td').forEach(function(c){if(String(c.style.border).indexOf('none')===0)return;c.style.border='1px solid #000000';c.style.padding='6px';c.style.verticalAlign='top';c.style.textAlign='left';});
// KOP + JUDUL/IDENTITAS dimasukkan ke td agar logo ikut diproses jadi part MIME
if(lem.header)td.insertAdjacentHTML('afterbegin',lem.header);
var kopHTML=await gsKopHTMLForWord();
if(kopHTML)td.insertAdjacentHTML('afterbegin',kopHTML);
// GAMBAR -> PART MIME: logo kop & gambar soal disematkan sebagai berkas nyata
var gsParts=[];var gsSeq=0;
var gsImgs=[];td.querySelectorAll('img').forEach(function(im){gsImgs.push(im);});
for(var gi=0;gi<gsImgs.length;gi++){
var im=gsImgs[gi];var s=im.getAttribute('src')||'';
if(!s)continue;
var sp=gsSplitDataUrl(s);
if(!sp){var nn=await gsWordLogoSrc(s,800);if(nn&&String(nn).indexOf('data:')===0)sp=gsSplitDataUrl(nn);}
if(sp&&sp.b64){gsSeq++;var ext2=sp.mime==='image/png'?'png':(sp.mime==='image/gif'?'gif':'jpg');var fname='doc_files/image'+(gsSeq<10?'0'+gsSeq:gsSeq)+'.'+ext2;gsParts.push({name:fname,type:sp.mime,b64:sp.b64});im.setAttribute('src',fname);}
}
// SUSUN SECTION top-level BERDAMPINGAN (tanpa nesting - syarat section Word):
// Section1 = kop+judul+identitas+intro (1 kolom) -> Section2 = soal PG 2 kolom
// (@page mso-columns utk MS Word/WPS; column-count:2 utk LibreOffice) ->
// Section3 = essay + footer Nilai/Paraf (1 kolom). Section berdampingan = continuous
// break: pemaginan halaman oleh engine Word sendiri -> jumlah halaman = PDF
// (PDF 2 halaman -> Word 2 halaman), tanpa tabel, tanpa garis.
var gsAll=td.innerHTML,gsMark='<!--GURUSMART-SEC2-->',gsIdx=gsAll.indexOf(gsMark);
var gsPre=gsIdx>=0?gsAll.slice(0,gsIdx):gsAll;
var gsPost=gsIdx>=0?gsAll.slice(gsIdx+gsMark.length):'';
var AO='<div class="ai-output" style="color:#000;margin:0;padding:0;width:100%">';
var gsBody;
if(gsItems.length>=2){
// LO butuh atribut id pada div agar membuat SECTION baru (penutup region kolom
// sebelumnya - terbukti empiris); MS Word memakai class+@page mso-columns.
gsBody='<div class="Section1" id="GSSection1" style="column-count:1;">'+AO+gsPre+'</div></div>'
+'<br clear=all style="page-break-before:auto;mso-break-type:section-break">'
+'<div class="Section2" id="GSSection2" dir="ltr" gutter="28" style="column-count:2;column-gap:28px;">'+AO+gsPG+'</div></div>'
+'<br clear=all style="page-break-before:auto;mso-break-type:section-break">'
+'<div class="Section3" id="GSSection3" dir="ltr" gutter="0" style="column-count:1;">'+AO+gsPost+(lem.footer||'')+'</div></div>';
}else{
gsBody='<div class="Section1" id="GSSection1" style="column-count:1;">'+AO+gsPre+gsPG+gsPost+(lem.footer||'')+'</div></div>';
}
var gsCss='@page{size:21cm 29.7cm;margin:1.4cm 1.6cm 0.9cm 1.6cm}'
+'@page Section1{size:21cm 29.7cm;margin:1.4cm 1.6cm 0.9cm 1.6cm;mso-header-margin:0cm;mso-footer-margin:0cm}'
+'@page Section2{size:21cm 29.7cm;margin:1.4cm 1.6cm 0.9cm 1.6cm;mso-columns:2 even 21.0pt;mso-header-margin:0cm;mso-footer-margin:0cm}'
+'@page Section3{size:21cm 29.7cm;margin:1.4cm 1.6cm 0.9cm 1.6cm;mso-header-margin:0cm;mso-footer-margin:0cm}'
+'div.Section1{page:Section1}div.Section2{page:Section2}div.Section3{page:Section3}'
+'p.MsoNormal,li.MsoNormal,div.MsoNormal{margin:0cm 0cm 0cm 0cm;font-size:12pt;font-family:"Times New Roman",Georgia,serif;line-height:115%;mso-line-height-rule:auto}'
+'body{font-family:Times New Roman,Georgia,serif;font-size:12pt;color:#000;line-height:115%}'
+'h1,h2,h3{color:#000;font-weight:bold;margin:12px 0 6px 0}'
+'.ai-output table{width:100%;border-collapse:collapse;margin-bottom:8px}'
+'.ai-output img{margin:6px 0}'
+'.ai-output p{margin:1em 0 3px 0;text-align:justify}';
var header='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Soal - GURU SMART</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]--><style>'+gsCss+'</style></head><body>'+gsBody+'</body></html>';
var blob;
if(gsParts.length){blob=new Blob([gsBuildMHTML(header,gsParts)],{type:'application/msword'});}
else{blob=new Blob(['\ufeff',header],{type:'application/msword'});}
var url=URL.createObjectURL(blob);
var fd=document.createElement('a');fd.href=url;fd.download='Soal_Guru_Smart.doc';document.body.appendChild(fd);fd.click();document.body.removeChild(fd);URL.revokeObjectURL(url);
showToast('Diekspor ke Word!','success');}finally{gsBtnsW.forEach(function(b){b.disabled=false;});}}


async function renderSchedules(){
    var classes=await DB.get('classes');
    var sc=await DB.get('schedules');
    var days=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    // Cache data jadwal untuk fitur ketik & edit langsung di tabel
    window.__scItems={};window.__scEditing=false;window.__scAll=(sc||[]);
    (sc||[]).forEach(function(x){if(x&&x.id!=null)window.__scItems[String(x.id)]=x;});
    var selId=window.__scClassSel||'';
    var selObj=null;
    for(var ci=0;ci<classes.length;ci++){if(classes[ci].id===selId)selObj=classes[ci];}
    if(!selObj){selObj=classes[0]||null;selId=selObj?selObj.id:'';window.__scClassSel=selId;}
    var html='<div class="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm">';
    html+='<div class="flex justify-between mb-4 flex-wrap gap-2 items-center"><h3 class="font-semibold text-slate-800 dark:text-white">Jadwal Pelajaran</h3><div class="flex gap-2 flex-wrap items-center"><label class="text-sm font-medium text-slate-500 dark:text-slate-300">Kelas:</label><select id="sc_class_sel" onchange="scSelectClass(this.value)" class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white">'+classes.map(function(c){return '<option value="'+c.id+'" '+(c.id===selId?'selected':'')+'>'+pkEsc(c.name)+'</option>';}).join('')+'</select><button onclick="generateScheduleImage()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>🎨 Generate Gambar Jadwal</button><button onclick="scheduleForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Tambah Jadwal</button></div></div>';
    if(!classes.length){html+='<div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 p-3 rounded-lg text-sm mb-4">Tip: Tambahkan data Kelas dulu di menu Kelas agar jadwal tersimpan per kelas. Sementara itu Anda tetap bisa mengetik langsung di tabel di bawah.</div>';}
    var slots=gsGetScheduleSlots();
    var customStarts=gsGetCustomSlots().map(function(s){return s.start;});
    var headRow='<tr><th class="px-3 py-3 border dark:border-slate-600 text-center whitespace-nowrap" style="min-width:96px">Jam</th>'+days.map(function(d){return '<th class="px-3 py-3 border dark:border-slate-600 text-center" style="min-width:150px">'+d+'</th>';}).join('')+'</tr>';
    var bodyRows=slots.map(function(slot){
        var skey=String(slot.start).replace(/'/g,"\\'"),ekey=String(slot.end||'').replace(/'/g,"\\'"),label=String(slot.label||slot.start);
        var row='<tr><td class="px-3 py-2 border dark:border-slate-600 font-semibold text-center align-middle whitespace-nowrap text-xs" style="color:#334155">'+pkEsc(label)+(customStarts.indexOf(slot.start)>-1?'<button onclick="scRemoveSlot(\''+skey+'\')" class="ml-1 text-slate-300 hover:text-red-500 text-[10px] transition" title="Hapus baris jam ini">✕</button>':'')+'</td>';
        row+=days.map(function(day){
            var dkey=String(day).replace(/'/g,"\\'"),ckey=String(selId).replace(/'/g,"\\'");
            var s=sc.find(function(x){return x.day===day&&x.start_time===slot.start&&(!selId||x.class_id===selId||!x.class_id);});
            if(s){
                var sid=String(s.id==null?'':s.id).replace(/'/g,"\\'");
                return '<td class="px-1 py-1 border dark:border-slate-600 align-top"><div class="group relative" style="min-height:54px"><span class="block pr-5 pl-1 py-1.5 cursor-pointer rounded text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition" style="color:#1e293b" title="Klik untuk mengedit" onclick="scStartEdit(\''+sid+'\',this)"><b class="text-slate-800 dark:text-slate-100">'+pkEsc(s.subject)+'</b>'+(s.teacher?'<br><span class="text-blue-500 dark:text-blue-300">'+pkEsc(s.teacher)+'</span>':'')+'</span><button onclick="deleteData(\'schedules\',\''+sid+'\',renderSchedules)" class="absolute top-0.5 right-0.5 px-1 text-slate-300 hover:text-red-500 text-xs transition" title="Hapus">✕</button></div></td>';
            }
            return '<td class="px-1 py-1 border dark:border-slate-600"><div class="flex items-center" style="min-height:54px"><input type="text" class="sc-input w-full px-2 py-2 text-xs bg-transparent outline-none placeholder-slate-300 dark:placeholder-slate-500 rounded focus:bg-blue-50 dark:focus:bg-slate-700 dark:text-white" placeholder="Ketik mapel..." data-day="'+dkey+'" data-start="'+skey+'" data-end="'+ekey+'" data-class="'+ckey+'" onkeydown="scQuickKey(event,this)" onblur="scQuickBlur(this)"></div></td>';
        }).join('');
        return row+'</tr>';
    }).join('');
    var addRow='<tr><td colspan="7" class="px-2 py-1 border dark:border-slate-600"><div class="flex items-center"><span class="text-center text-base font-bold flex-none px-2" style="width:44px;color:#94a3b8">+</span><input type="text" id="sc_slot_input" class="flex-1 px-2 py-2 text-xs bg-transparent outline-none placeholder-slate-400 dark:placeholder-slate-500 rounded focus:bg-blue-50 dark:focus:bg-slate-700 dark:text-white" placeholder="Tambah baris jam pelajaran di sini (contoh: 13:00-14:30), tekan Enter" onkeydown="scAddSlotKey(event,this)"></div></td></tr>';
    html+='<div class="overflow-x-auto"><table class="w-full text-sm text-left border-collapse"><thead class="bg-slate-50 dark:bg-slate-700">'+headRow+'</thead><tbody>'+bodyRows+addRow+'</tbody></table></div>';
    html+='<p class="text-xs text-slate-400 mt-4">💡 <b>Ketik mapel langsung di sel kosong tabel (format: Mapel | Guru, contoh: Matematika | Pak Budi), tekan Enter untuk menyimpan</b> — tanpa perlu buka form Tambah Jadwal. Panah ↑/↓ untuk pindah baris. Klik mapel untuk mengedit langsung, klik ✕ untuk menghapus. Tambah baris jam baru lewat kolom "+" di dasar tabel.</p>';
    html+='</div>';
    document.getElementById('content').innerHTML=html;
}
// ===== KETIK JADWAL PELAJARAN LANGSUNG DI TABEL (seperti Jadwal Piket) =====
// Daftar baris jam: 3 jam bawaan + jam tambahan buatan pengguna (disimpan di localStorage)
function gsBaseScheduleSlots(){return [{start:'07:30',end:'09:00',label:'07:30-09:00'},{start:'09:15',end:'10:45',label:'09:15-10:45'},{start:'11:00',end:'12:30',label:'11:00-12:30'}];}
function gsGetCustomSlots(){try{return JSON.parse(localStorage.getItem('gs_sc_slots')||'[]')||[];}catch(e){return [];}}
function gsSaveCustomSlots(arr){try{localStorage.setItem('gs_sc_slots',JSON.stringify(arr||[]));}catch(e){}}
function gsGetScheduleSlots(){var c=gsGetCustomSlots().filter(function(s){return s&&s.start;});return gsBaseScheduleSlots().concat(c);}
// Ganti kelas yang ditampilkan pada tabel jadwal
function scSelectClass(v){window.__scClassSel=v;renderSchedules();}
// Navigasi & simpan cepat pada sel kosong tabel jadwal
function scQuickKey(e,el){
    if(e.key==='Enter'){e.preventDefault();scQuickAdd(el);}
    else if(e.key==='Escape'){el.value='';}
    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        var day=el.getAttribute('data-day')||'',start=el.getAttribute('data-start')||'';
        var slots=gsGetScheduleSlots();
        var si=-1;for(var q=0;q<slots.length;q++){if(slots[q].start===start){si=q;break;}}
        if(si<0)return;
        var dir=(e.key==='ArrowDown')?1:-1;
        for(var t=si+dir;t>=0&&t<slots.length;t+=dir){
            var tgt=document.querySelector('.sc-input[data-day="'+day+'"][data-start="'+slots[t].start+'"]');
            if(tgt){e.preventDefault();tgt.focus();return;}
        }
    }
}
// Blur dengan isi -> simpan juga (kecuali sedang diproses / dinonaktifkan)
function scQuickBlur(el){if(el.disabled)return;var d=el.getAttribute('data-day');if((el.value||'').trim()&&d){scQuickAdd(el);}}
// Tekan Enter pada sel kosong -> simpan jadwal baru tanpa modal
async function scQuickAdd(el){
    var raw=(el.value||'').trim();
    if(!raw)return;
    var day=el.getAttribute('data-day')||'',start=el.getAttribute('data-start')||'',end=el.getAttribute('data-end')||'',classId=el.getAttribute('data-class')||'';
    var subject=raw,teacher='';
    var sep=raw.indexOf('|');
    if(sep>-1){subject=raw.substring(0,sep).trim();teacher=raw.substring(sep+1).trim();}
    if(!subject){el.value='';showToast('Mapel tidak boleh kosong!','error');return;}
    var td=el.closest('td');
    var tb=el.closest('tbody');
    var list=tb?Array.prototype.slice.call(tb.querySelectorAll('.sc-input')):[];
    var idx=list.indexOf(el);
    if(el.getAttribute('data-sc-busy')==='1')return;
    el.setAttribute('data-sc-busy','1');
    el.disabled=true;el.classList.add('opacity-50');
    var res=null,upd=false;
    var ex=(window.__scAll||[]).find(function(x){return x.day===day&&x.start_time===start&&String(x.class_id||'')===String(classId||'');});
    if(ex){upd=true;res=await DB.update('schedules',ex.id,{subject:subject,teacher:teacher});}
    else{res=await DB.insert('schedules',{day:day,start_time:start,end_time:end,class_id:classId,subject:subject,teacher:teacher});}
    el.disabled=false;el.classList.remove('opacity-50');
    el.removeAttribute('data-sc-busy');
    if(!res||!res.length){showToast('Gagal menyimpan jadwal.','error');return;}
    var it=res[0];
    if(window.__scItems)window.__scItems[String(it.id)]=it;
    if(!window.__scAll)window.__scAll=[];
    if(upd){var au=window.__scAll.find(function(x){return String(x.id)===String(ex.id);});if(au){au.subject=subject;au.teacher=teacher;}}
    else{window.__scAll.push(it);}
    el.value='';
    if(td){var div=document.createElement('div');div.className='group relative';div.style.minHeight='54px';div.innerHTML=scCellInner(it);td.innerHTML='';td.appendChild(div);}
    showToast(upd?'Jadwal diperbarui!':'Jadwal ditambahkan!','success');
    var nxt=(idx>-1&&list[idx+1])?list[idx+1]:null;
    if(nxt){try{nxt.focus();}catch(e2){}}
}
// Tampilan sel terisi (mapel + guru + tombol hapus)
function scCellInner(it){
    var sid=String(it.id==null?'':it.id).replace(/'/g,"\\'");
    return '<span class="block pr-5 pl-1 py-1.5 cursor-pointer rounded text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition" style="color:#1e293b" title="Klik untuk mengedit" onclick="scStartEdit(\''+sid+'\',this)"><b class="text-slate-800 dark:text-slate-100">'+pkEsc(it.subject)+'</b>'+(it.teacher?'<br><span class="text-blue-500 dark:text-blue-300">'+pkEsc(it.teacher)+'</span>':'')+'</span><button onclick="deleteData(\'schedules\',\''+sid+'\',renderSchedules)" class="absolute top-0.5 right-0.5 px-1 text-slate-300 hover:text-red-500 text-xs transition" title="Hapus">✕</button>';
}
// Klik mapel di tabel -> edit langsung (Enter=simpan, Esc=batal)
function scStartEdit(id,span){
    if(window.__scEditing)return;
    var it=(window.__scItems||{})[String(id)];
    if(!it)return;
    var cellDiv=span.parentElement;if(!cellDiv)return;
    window.__scEditing=true;
    var delBtn=cellDiv.querySelector('button');
    var cur=String(it.subject==null?'':it.subject);
    if(it.teacher)cur+=' | '+String(it.teacher);
    var inp=document.createElement('input');
    inp.type='text';inp.value=cur;
    inp.className='w-full px-2 py-1.5 border border-blue-400 rounded text-xs bg-white dark:bg-slate-700 dark:text-white text-slate-700 focus:outline-none';
    span.style.display='none';if(delBtn)delBtn.style.display='none';
    cellDiv.insertBefore(inp,span);
    inp.focus();inp.select();
    var finished=false;
    async function scCommitEdit(){
        if(finished)return;finished=true;window.__scEditing=false;
        var v=(inp.value||'').trim();
        if(!v||v===cur){inp.remove();span.style.display='';if(delBtn)delBtn.style.display='';return;}
        var subject=v,teacher='';
        var s2=v.indexOf('|');
        if(s2>-1){subject=v.substring(0,s2).trim();teacher=v.substring(s2+1).trim();}
        if(!subject){inp.remove();span.style.display='';if(delBtn)delBtn.style.display='';showToast('Mapel tidak boleh kosong!','error');return;}
        var ok=await DB.update('schedules',id,{subject:subject,teacher:teacher});
        if(ok){
            it.subject=subject;it.teacher=teacher;
            span.innerHTML='<b class="text-slate-800 dark:text-slate-100">'+pkEsc(subject)+'</b>'+(teacher?'<br><span class="text-blue-500 dark:text-blue-300">'+pkEsc(teacher)+'</span>':'');
            if(window.__scAll){var au=window.__scAll.find(function(x){return String(x.id)===String(id);});if(au){au.subject=subject;au.teacher=teacher;}}
            showToast('Jadwal diperbarui!','success');
        }else{showToast('Gagal memperbarui jadwal.','error');}
        inp.remove();span.style.display='';if(delBtn)delBtn.style.display='';
    }
    inp.onkeydown=function(e){
        if(e.key==='Enter'){e.preventDefault();scCommitEdit();}
        else if(e.key==='Escape'){
            if(finished)return;finished=true;window.__scEditing=false;
            inp.onblur=null;
            inp.remove();span.style.display='';if(delBtn)delBtn.style.display='';
        }
    };
    inp.onblur=scCommitEdit;
}
// Enter pada kolom "+" di dasar tabel -> tambah baris jam pelajaran baru
function scAddSlotKey(e,el){
    if(e.key!=='Enter')return;
    e.preventDefault();
    var raw=(el.value||'').trim();
    if(!raw)return;
    var start='',end='',m=raw.match(/^(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})$/);
    if(m){start=(m[1].length<2?'0':'')+m[1]+':'+m[2];end=(m[3].length<2?'0':'')+m[3]+':'+m[4];}
    else{m=raw.match(/^(\d{1,2})[:.](\d{2})$/);if(m){start=(m[1].length<2?'0':'')+m[1]+':'+m[2];end='';}}
    if(!start||(+m[1]>23)||(+m[3]>23)||(m[2]&&+m[2]>59)||(m[4]&&+m[4]>59)){showToast('Format jam tidak valid! Contoh: 13:00-14:30','error');return;}
    var slots=gsGetScheduleSlots();
    if(slots.find(function(s){return s.start===start;})){showToast('Baris jam itu sudah ada!','error');return;}
    var custom=gsGetCustomSlots();custom.push({start:start,end:end,label:end?start+'-'+end:start});gsSaveCustomSlots(custom);
    el.value='';
    showToast('Baris jam ditambahkan!','success');
    renderSchedules().then(function(){
        var inp=document.querySelector('.sc-input[data-start="'+start+'"]');
        if(inp){try{inp.focus();}catch(e2){}}
    });
}
// Hapus baris jam tambahan (hanya untuk jam buatan pengguna)
function scRemoveSlot(start){
    gsSaveCustomSlots(gsGetCustomSlots().filter(function(s){return s.start!==start;}));
    renderSchedules();
}
async function generateScheduleImage(){var results=await Promise.all([DB.get('schedules'),DB.get('classes')]);var sc=results[0],classes=results[1];var days=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];var selId2=window.__scClassSel||'';if(selId2){sc=sc.filter(function(x){return x.class_id===selId2||!x.class_id;});}var clsObj=null;for(var gci=0;gci<classes.length;gci++){if(classes[gci].id===selId2)clsObj=classes[gci];}var timeSlots=gsGetScheduleSlots().map(function(s){return s.label;});var scheduleText='JADWAL PELAJARAN SEKOLAH MINGGUAN'+(clsObj?' KELAS '+clsObj.name:'')+'. ';var hasData=false;timeSlots.forEach(function(time){var startTime=time.split('-')[0];scheduleText+='Pada jam '+time+': ';days.forEach(function(day){var s=sc.find(function(x){return x.day===day&&x.start_time===startTime;});if(s){hasData=true;scheduleText+=day+' '+s.subject+'('+s.teacher+'), ';}else{scheduleText+=day+' kosong, ';}});scheduleText+='. ';});if(!hasData){showToast('Belum ada jadwal pelajaran. Tambahkan jadwal dulu!','error');return;}var promptText='Buatkan gambar poster jadwal pelajaran sekolah mingguan yang menarik dan berwarna-warni untuk siswa. Tampilkan jadwal berikut dalam bentuk tabel poster yang ramah anak dengan ilustrasi buku, pensil, dan elemen sekolah: '+scheduleText.substring(0,700)+' Gunakan gaya ilustrasi VEKTOR FLAT (flat vector art, clean professional illustration) yang RAPI, JELAS, dan PROFESIONAL: garis bersih dan tegas, bentuk geometris rapi, tata letak tabel tertata simetris dan teratur, palet warna cerah yang harmonis, tanpa noise dan tanpa coretan acak. TEKS WAJIB SANGAT TAJAM: semua tulisan pada tabel jadwal harus besar, tegas, lurus, sangat jelas terbaca (crisp sharp text), ejaan benar, tanpa huruf blur atau berantakan; gunakan teks secukupnya (judul dan isi tabel) agar huruf tetap tajam. KUALITAS WAJIB: resolusi tinggi (HD), sangat tajam dan jelas (sharp focus), detail kaya, warna cerah seimbang, tanpa blur, tanpa noise. PENTING: gambar WAJIB berformat landscape 4:3 (lebar lebih besar dari tinggi, rasio 4 banding 3), tabel jadwal tampil UTUH di tengah bingkai, tanpa tepi kosong (no border, no letterbox).';openModal('🎨 Generate Gambar Jadwal','<div class="space-y-4"><div class="bg-purple-50 dark:bg-slate-700 p-4 rounded-lg text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-600 flex items-start gap-2"><svg class="w-5 h-5 flex-none mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg><span>Guru Smart AI akan membuatkan gambar poster jadwal pelajaran otomatis berdasarkan data jadwal sekolah Anda. Tunggu sebentar ya, proses generate gambar mode kilat biasanya 15-45 detik. Format gambar: landscape 4:3 HD (1600×1200), gaya vektor rapi dan jelas, hasil bagus dan profesional, gambar tampil UTUH tanpa terpotong.</span></div><div id="schedImgLoading" class="flex flex-col items-center justify-center py-12"><div class="relative w-20 h-20 mb-4"><div class="absolute inset-0 rounded-full border-4 border-purple-200"></div><div class="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div></div><p class="text-slate-600 dark:text-slate-300 text-sm font-medium">🎨 GURU Smart AI sedang membuat gambar jadwal...</p><p class="text-xs text-slate-400 mt-1">Mohon tunggu, jangan tutup jendela ini</p></div><div id="schedImgResult" class="hidden"></div><div id="schedImgActions" class="hidden flex gap-2 mt-4"><button id="schedImgDownload" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">💾 Unduh Gambar</button><button onclick="generateScheduleImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">🔄 Buat Ulang</button><button onclick="closeModal()" class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Tutup</button></div></div>');var loadingEl=document.getElementById('schedImgLoading');var resultEl=document.getElementById('schedImgResult');var actionsEl=document.getElementById('schedImgActions');try{var imgSrc=null;try{imgSrc=await window.gsImageHD(promptText,1600,1200,4,3);}catch(eP){console.warn('HD native jadwal gagal - lanjut jalur kilat:',eP);}if(!imgSrc){imgSrc=await GSAI.image(promptText);}if(!imgSrc){throw new Error('AI tidak mengembalikan gambar.');}imgSrc=await window.gsHDRefine(imgSrc,1600,1200);loadingEl.classList.add('hidden');resultEl.classList.remove('hidden');resultEl.innerHTML='<div class="space-y-3"><div class="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-slate-600 shadow-lg"><img src="'+imgSrc+'" alt="Gambar Jadwal Sekolah" class="w-full h-auto block" style="display:block;"></div><p class="text-xs text-slate-500 dark:text-slate-400 text-center italic">Gambar poster jadwal pelajaran HD 4:3 (1600×1200) dihasilkan oleh AI</p></div>';actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');var dlBtn=document.getElementById('schedImgDownload');if(dlBtn){dlBtn.onclick=function(){gsDownloadImage(imgSrc,'Gambar_Jadwal_Sekolah_'+Date.now()+'.png');};}showToast('Gambar jadwal berhasil dibuat! ('+GSAI.provider()+')','success');}catch(err){console.error('Generate Schedule Image Error:',err);loadingEl.classList.add('hidden');resultEl.classList.remove('hidden');resultEl.innerHTML='<div class="text-center py-8"><div class="text-5xl mb-3">😕</div><p class="text-red-600 dark:text-red-400 font-semibold mb-1">Gagal membuat gambar jadwal</p><p class="text-xs text-slate-500 dark:text-slate-400 mb-4">'+(err.message||err)+'</p><p class="text-xs text-amber-600 mb-4">Tips: klik tombol Sambungkan AI di halaman Asisten AI, izinkan popup yang muncul, lalu coba lagi.</p><button onclick="generateScheduleImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">🔄 Coba Lagi</button></div>';actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');showToast('Gagal: '+err.message,'error');}}
async function scheduleForm(id){var cl=await DB.get('classes');openModal('Tambah Jadwal','<form id="scheduleForm" class="space-y-4"><div><label class="block text-sm mb-1">Hari</label><select id="sc_day" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option>Senin</option><option>Selasa</option><option>Rabu</option><option>Kamis</option><option>Jumat</option><option>Sabtu</option></select></div><div><label class="block text-sm mb-1">Jam Mulai</label><input type="text" id="sc_start" value="07:30" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Jam Selesai</label><input type="text" id="sc_end" value="09:00" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Kelas</label><select id="sc_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+cl.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Mapel</label><input type="text" id="sc_subject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Guru</label><input type="text" id="sc_teacher" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Simpan</button></form>');document.getElementById('scheduleForm').onsubmit=async function(e){e.preventDefault();var p={day:document.getElementById('sc_day').value,start_time:document.getElementById('sc_start').value,end_time:document.getElementById('sc_end').value,class_id:document.getElementById('sc_class').value,subject:document.getElementById('sc_subject').value,teacher:document.getElementById('sc_teacher').value};await saveData('schedules',p,id);closeModal();renderSchedules();};}

// ===== JADWAL PIKET (per kelas, Senin-Sabtu, bisa generate gambar seperti Jadwal Pelajaran) =====
var piketDays=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
function pkEsc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
async function renderPiket(){
    var classes=await DB.get('classes');
    var pk=[];var tblError='';
    if(currentUser&&currentUser.id){
        var r=await sb.from('piket').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
        if(r.error){tblError=r.error.message||'Tabel piket belum dibuat.';}
        else{pk=r.data||[];}
    }
    // Cache data piket untuk fitur ketik & edit langsung di tabel
    window.__pkItems={};window.__pkEditing=false;
    (pk||[]).forEach(function(x){if(x&&x.id!=null)window.__pkItems[String(x.id)]=x;});
    var selId=window.__pkClassSel||'';
    var selObj=null;
    for(var ci=0;ci<classes.length;ci++){if(classes[ci].id===selId)selObj=classes[ci];}
    if(!selObj){selObj=classes[0]||null;selId=selObj?selObj.id:'';window.__pkClassSel=selId;}
    var now=new Date();var yy=now.getFullYear();var tp=(now.getMonth()>=6?yy+'/'+(yy+1):(yy-1)+'/'+yy);
    var dayColors=['#1e40af','#16a34a','#ea780c','#7e22ce','#dc2626','#f59e0b'];
    var calIcon='<svg viewBox="0 0 24 24" style="width:22px;height:22px;flex:none" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"></rect><path d="M8 3v4M16 3v4M3 10h18"></path><circle cx="8" cy="14.5" r="0.7" fill="#ffffff" stroke="none"></circle><circle cx="12" cy="14.5" r="0.7" fill="#ffffff" stroke="none"></circle><circle cx="16" cy="14.5" r="0.7" fill="#ffffff" stroke="none"></circle></svg>';
    var icoBroom='<svg viewBox="0 0 48 48" style="width:46px;height:46px" fill="none" stroke="#1e3a8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M37 5L22 27"></path><path d="M22 27l-8 4-9 14c5 3 13 1 16-4l1-14z"></path><path d="M9 39l10-4M7 43l12-5"></path></svg>';
    var icoBucket='<svg viewBox="0 0 48 48" style="width:40px;height:40px" fill="none" stroke="#1e3a8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="24" cy="13" rx="12" ry="4"></ellipse><path d="M12.5 14l2.5 24c0 3 18 3 18 0l2.5-24"></path><path d="M14 11c0-7 20-7 20 0"></path></svg>';
    var icoSponge='<svg viewBox="0 0 48 48" style="width:46px;height:46px" fill="none" stroke="#1e3a8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="15" width="34" height="19" rx="6" transform="rotate(-7 24 24)"></rect><circle cx="17" cy="25" r="1.2" fill="#1e3a8a" stroke="none"></circle><circle cx="24" cy="23" r="1.2" fill="#1e3a8a" stroke="none"></circle><circle cx="31" cy="21" r="1.2" fill="#1e3a8a" stroke="none"></circle><circle cx="21" cy="30" r="1.2" fill="#1e3a8a" stroke="none"></circle><circle cx="29" cy="28" r="1.2" fill="#1e3a8a" stroke="none"></circle></svg>';
    var icoSpray='<svg viewBox="0 0 48 48" style="width:40px;height:40px" fill="none" stroke="#1e3a8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h9v-5h3l3 4h-4"></path><path d="M19 17c-2 2-3 4-3 7v15c0 2 1 3 3 3h9c2 0 3-1 3-3V24c0-3-1-5-3-7"></path><path d="M37 8h5M37 12h5M38 16h4"></path></svg>';
    var html='<div class="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm">';
    html+='<div class="flex justify-between mb-4 flex-wrap gap-2 items-center"><h3 class="font-semibold text-slate-800 dark:text-white">Jadwal Piket Kelas</h3><div class="flex gap-2 flex-wrap items-center"><label class="text-sm font-medium text-slate-500 dark:text-slate-300">Kelas:</label><select id="pk_class_sel" onchange="pkSelectClass(this.value)" class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white">'+classes.map(function(c){return '<option value="'+c.id+'" '+(c.id===selId?'selected':'')+'>'+pkEsc(c.name)+'</option>';}).join('')+'</select><button onclick="generatePiketImage()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md transition"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>🎨 Generate Gambar Piket</button><button onclick="piketForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Tambah Piket</button></div></div>';
    if(tblError){
        html+='<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 p-4 rounded-lg text-sm mb-4"><b>Tabel piket belum dibuat di database Supabase.</b><p class="mt-1">Buka dashboard Supabase → SQL Editor → jalankan SQL berikut, lalu muat ulang halaman ini:</p><pre class="mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg overflow-x-auto text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">create table if not exists piket (\n  id uuid primary key default gen_random_uuid(),\n  user_id uuid not null,\n  day text not null,\n  class_id uuid,\n  student_name text,\n  task text,\n  created_at timestamptz default now()\n);\nalter table piket enable row level security;\ncreate policy "piket_user_all" on piket for all\n  using (auth.uid() = user_id)\n  with check (auth.uid() = user_id);</pre><p class="mt-2 text-xs">Pesan error database: '+pkEsc(tblError)+'</p></div>';
    }
    if(classes.length===0){html+='<div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 p-3 rounded-lg text-sm mb-4">Tambahkan data Kelas dulu di menu Kelas, lalu tambahkan siswa piket per hari.</div>';}
    html+='<div class="relative text-center mt-1 mb-6 px-2">'
        +'<div class="hidden md:flex items-end gap-1 absolute left-3 top-0">'+icoBroom+icoBucket+'</div>'
        +'<div class="hidden md:flex items-end gap-1 absolute right-3 top-0">'+icoSponge+icoSpray+'</div>'
        +'<span class="hidden sm:inline absolute" style="left:27%;top:-4px;color:#fbbf24;font-size:18px">✦</span>'
        +'<span class="hidden sm:inline absolute" style="right:28%;top:12px;color:#fbbf24;font-size:13px">✦</span>'
        +'<h2 class="text-3xl md:text-4xl font-black" style="color:#1e3a8a;letter-spacing:.02em">JADWAL PIKET KELAS</h2>'
        +'<div class="flex items-center justify-center gap-2 mt-2">'
        +'<span style="display:inline-block;height:3px;width:88px;background:#1e3a8a;border-radius:99px"></span>'
        +'<span class="flex gap-1.5"><span class="w-2 h-2 rounded-full inline-block" style="background:#1e3a8a"></span><span class="w-2 h-2 rounded-full inline-block" style="background:#1e3a8a"></span><span class="w-2 h-2 rounded-full inline-block" style="background:#1e3a8a"></span></span>'
        +'<span style="display:inline-block;height:3px;width:88px;background:#1e3a8a;border-radius:99px"></span>'
        +'</div>'
        +'<p class="mt-2 text-lg md:text-xl font-bold" style="color:#334155">Tahun Pelajaran '+tp+'</p>'
        +'</div>';
    var selPk=pk.filter(function(x){return !selId||(x.class_id===selId);});
    var counts=piketDays.map(function(day){return selPk.filter(function(x){return x.day===day;}).length;});
    var maxRows=Math.max.apply(null,counts.concat([5]));
    var cardsHtml=piketDays.map(function(day,di){
        var col=dayColors[di%dayColors.length];
        var items=selPk.filter(function(x){return x.day===day;});
        var rows=items.map(function(it,idx){
            var sid=String(it.id==null?'':it.id).replace(/'/g,"\\'");
            return '<div class="pk-item flex items-center" style="border-bottom:1px solid #e8edf3;min-height:42px">'
                +'<div class="pk-no text-center text-sm font-semibold flex-none" style="width:52px;color:#334155">'+(idx+1)+'</div>'
                +'<span class="pk-edit flex-1 pl-1 pr-1 py-1.5 cursor-pointer text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition" style="color:#1e293b" title="Klik untuk mengedit nama" onclick="pkStartEdit(\''+sid+'\',this)"><b>'+pkEsc(it.student_name)+'</b>'+(it.task?'<br><span class="text-[10px] font-normal" style="color:#a855f7">🧹 '+pkEsc(it.task)+'</span>':'')+'</span>'
                +'<button onclick="deleteData(\'piket\',\''+sid+'\',\'renderPiket\')" class="pk-del flex-none px-2 text-slate-300 hover:text-red-500 text-sm transition" title="Hapus">✕</button>'
                +'</div>';
        }).join('');
        var dkey=String(day).replace(/'/g,"\\'");
        var cid=String(selId).replace(/'/g,"\\'");
        for(var f=items.length;f<maxRows;f++){
            rows+='<div class="pk-filler flex items-center" style="border-bottom:1px solid #eef2f7;min-height:42px"><div class="pk-fno text-center text-sm font-semibold flex-none" style="width:52px;color:#94a3b8">'+(f+1)+'</div><input type="text" class="pk-input flex-1 pl-1 pr-2 py-2 text-sm bg-transparent outline-none placeholder-slate-300 rounded focus:bg-blue-50 dark:focus:bg-slate-700" style="color:#1e293b" placeholder="Ketik nama siswa..." data-day="'+dkey+'" data-class="'+cid+'" onkeydown="pkQuickKey(event,\''+dkey+'\',\''+cid+'\',this)" onblur="pkQuickBlur(this)"></div>';
        }
        var typeRow='<div class="flex items-center" style="border-top:2px solid #e5e9f0;min-height:42px">'
            +'<div class="text-center text-base font-bold flex-none" style="width:52px;color:#94a3b8">+</div>'
            +'<input type="text" class="pk-input pk-add-input flex-1 pl-1 pr-2 py-2 text-sm bg-transparent outline-none placeholder-slate-400" style="color:#1e293b" placeholder="Tambah nama lain di sini, tekan Enter" data-day="'+dkey+'" data-class="'+cid+'" onblur="pkQuickBlur(this)" onkeydown="pkQuickKey(event,\''+dkey+'\',\''+cid+'\',this)">'
            +'</div>';
        return '<div class="pk-card rounded-xl overflow-hidden shadow-md flex flex-col" style="background:#ffffff;border:1px solid #e5e9f0">'
            +'<div class="flex items-center justify-center gap-2.5 py-3 px-3" style="background:'+col+'">'+calIcon+'<span class="text-white font-extrabold text-xl" style="letter-spacing:.09em">'+day.toUpperCase()+'</span></div>'
            +'<div class="flex text-[13px] font-bold" style="border-bottom:2px solid #e5e9f0;color:#0f172a"><div class="py-2 text-center flex-none" style="width:52px">No</div><div class="py-2 flex-1 text-center" style="padding-right:44px">Nama Siswa</div></div>'
            +'<div data-pk-list class="flex-1">'+rows+'</div>'
            +typeRow
            +'</div>';
    }).join('');
    html+='<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">'+(classes.length?cardsHtml:'')+'</div>';
    html+='<p class="text-xs text-slate-400 mt-4">💡 <b>Ketik nama siswa langsung di baris kosong tabel (No | Nama Siswa) pada kartu hari, atau di kolom "+" di dasar kartu, tekan Enter untuk menyimpan</b> — tanpa perlu buka form Tambah Piket. Panah ↑/↓ untuk pindah baris. Klik nama siswa untuk mengedit langsung, klik ✕ untuk menghapus.</p>';
    html+='</div>';
    document.getElementById('content').innerHTML=html;
}
// ===== KETIK NAMA SISWA LANGSUNG DI TABEL PIKET =====
// Ganti kelas yang ditampilkan pada poster
function pkSelectClass(v){window.__pkClassSel=v;renderPiket();}
// Penomoran ulang baris siswa pada satu kartu hari
function pkRenumber(listWrap){
    var n=1;var kids=listWrap.children;
    for(var i=0;i<kids.length;i++){
        var el=kids[i];
        if(el.classList&&el.classList.contains('pk-item')){
            var no=el.querySelector('.pk-no');
            if(no)no.textContent=n;
            n++;
        }else if(el.classList&&el.classList.contains('pk-filler')){
            var fno=el.querySelector('.pk-fno');
            if(fno)fno.textContent=n;
            n++;
        }else if(el.classList&&el.classList.contains('pk-empty')){
            el.remove();
        }
    }
}
// Tekan Enter pada kolom ketik -> simpan siswa piket baru tanpa modal
function pkQuickKey(e,day,classId,el){
    if(e.key==='Enter'){e.preventDefault();pkQuickAdd(day,classId,el);}
    else if(e.key==='Escape'){el.value='';}
    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        var card=el.closest('.pk-card');if(!card)return;
        var list=Array.prototype.slice.call(card.querySelectorAll('.pk-input'));
        var i=list.indexOf(el);if(i<0)return;
        var nxt=(e.key==='ArrowDown')?list[i+1]:list[i-1];
        if(nxt){e.preventDefault();nxt.focus();}
    }
}
// Blur dengan isi -> simpan juga (kecuali sedang diproses / dinonaktifkan)
function pkQuickBlur(el){if(el.disabled)return;var d=el.getAttribute('data-day'),c=el.getAttribute('data-class');if((el.value||'').trim()&&d){pkQuickAdd(d,c,el);}}
async function pkQuickAdd(day,classId,el){
    var raw=(el.value||'').trim();
    if(!raw)return;
    var student=raw,task='';
    var sep=raw.indexOf('|');
    if(sep>-1){student=raw.substring(0,sep).trim();task=raw.substring(sep+1).trim();}
    if(!student){el.value='';return;}
    var fillerRow=el.closest('.pk-filler');
    if(el.getAttribute('data-pk-busy')==='1')return;
    el.setAttribute('data-pk-busy','1');
    el.disabled=true;el.classList.add('opacity-50');
    var res=await DB.insert('piket',{day:day,class_id:classId,student_name:student,task:task});
    el.disabled=false;el.classList.remove('opacity-50');
    if(!res||!res.length){el.removeAttribute('data-pk-busy');return;}
    var it=res[0];
    var sid=String(it.id==null?'':it.id).replace(/'/g,"\\'");
    if(window.__pkItems)window.__pkItems[String(it.id)]=it;
    el.value='';
    el.removeAttribute('data-pk-busy');
    var card=el.closest('.pk-card');
    var listWrap=card?card.querySelector('[data-pk-list]'):null;
    if(!listWrap){el.value='';renderPiket();return;}
    var rowDiv=document.createElement('div');
    rowDiv.className='pk-item flex items-center';
    rowDiv.style.borderBottom='1px solid #e8edf3';
    rowDiv.style.minHeight='42px';
    rowDiv.innerHTML='<div class="pk-no text-center text-sm font-semibold flex-none" style="width:52px;color:#334155"></div><span class="pk-edit flex-1 pl-1 pr-1 py-1.5 cursor-pointer text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition" style="color:#1e293b" title="Klik untuk mengedit nama" onclick="pkStartEdit(\''+sid+'\',this)"><b>'+pkEsc(it.student_name||'')+'</b>'+(it.task?'<br><span class="text-[10px] font-normal" style="color:#a855f7">🧹 '+pkEsc(it.task)+'</span>':'')+'</span><button onclick="deleteData(\'piket\',\''+sid+'\',\'renderPiket\')" class="pk-del flex-none px-2 text-slate-300 hover:text-red-500 text-sm transition" title="Hapus">✕</button>';
    var focusEl=null;
    if(fillerRow){
        listWrap.replaceChild(rowDiv,fillerRow);
        var nfs=listWrap.querySelectorAll('.pk-filler .pk-input');
        if(nfs.length){focusEl=nfs[0];}
        else{var addInp=card.querySelector('.pk-add-input');if(addInp)focusEl=addInp;}
    }else{
        var filler=listWrap.querySelector('.pk-filler');
        if(filler){listWrap.insertBefore(rowDiv,filler);}else{listWrap.appendChild(rowDiv);}
        var fs2=listWrap.querySelectorAll('.pk-filler');
        if(fs2.length){fs2[fs2.length-1].remove();}
        focusEl=el;
    }
    pkRenumber(listWrap);
    if(focusEl){try{focusEl.focus();}catch(e2){}}
    showToast('Siswa piket ditambahkan!','success');
}
// Klik nama siswa di tabel -> edit langsung (Enter=simpan, Esc=batal)
function pkStartEdit(id,nameSpan){
    if(window.__pkEditing)return;
    var it=(window.__pkItems||{})[String(id)];
    if(!it)return;
    var rowDiv=nameSpan.closest('.pk-item');
    if(!rowDiv)return;
    window.__pkEditing=true;
    var cur=String(it.student_name==null?'':it.student_name);
    if(it.task)cur+=' | '+String(it.task);
    var inp=document.createElement('input');
    inp.type='text';
    inp.value=cur;
    inp.className='w-full px-2 py-1 border border-blue-400 rounded text-xs bg-white dark:bg-slate-700 dark:text-white text-slate-700 focus:outline-none';
    nameSpan.style.display='none';
    rowDiv.insertBefore(inp,nameSpan);
    inp.focus();inp.select();
    var finished=false;
    async function pkCommitEdit(){
        if(finished)return;finished=true;window.__pkEditing=false;
        var v=(inp.value||'').trim();
        if(!v||v===cur){inp.remove();nameSpan.style.display='';return;}
        var student=v,task='';
        var s2=v.indexOf('|');
        if(s2>-1){student=v.substring(0,s2).trim();task=v.substring(s2+1).trim();}
        if(!student){inp.remove();nameSpan.style.display='';showToast('Nama siswa tidak boleh kosong!','error');return;}
        var ok=await DB.update('piket',id,{student_name:student,task:task});
        if(ok){
            it.student_name=student;it.task=task;
            nameSpan.innerHTML='<b>'+pkEsc(student)+'</b>'+(task?'<br><span class="text-[10px] font-normal" style="color:#a855f7">🧹 '+pkEsc(task)+'</span>':'');
            showToast('Nama piket diperbarui!','success');
        }else{
            showToast('Gagal memperbarui nama piket.','error');
        }
        inp.remove();nameSpan.style.display='';
    }
    inp.onkeydown=function(e){
        if(e.key==='Enter'){e.preventDefault();pkCommitEdit();}
        else if(e.key==='Escape'){
            if(finished)return;finished=true;window.__pkEditing=false;
            inp.onblur=null;
            inp.remove();nameSpan.style.display='';
        }
    };
    inp.onblur=pkCommitEdit;
}
async function piketForm(id){
    var cl=await DB.get('classes');
    if(!cl.length){showToast('Tambahkan Kelas dulu di menu Kelas!','error');return;}
    var p=null;
    if(id){p=(await DB.get('piket')).find(function(x){return x.id===id;});}
    openModal(id?'Edit Piket':'Tambah Piket','<form id="piketForm" class="space-y-4"><div><label class="block text-sm mb-1">Hari</label><select id="pk_day" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+piketDays.map(function(d){return '<option '+(p&&p.day===d?'selected':'')+'>'+d+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Kelas</label><select id="pk_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+cl.map(function(c){return '<option value="'+c.id+'" '+(p&&p.class_id===c.id?'selected':'')+'>'+pkEsc(c.name)+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Nama Siswa Piket</label><input type="text" id="pk_student" value="'+(p?pkEsc(p.student_name):'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Tugas Piket (opsional)</label><input type="text" id="pk_task" value="'+(p?pkEsc(p.task):'')+'" placeholder="Contoh: Menyapu lantai" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Simpan</button></form>');
    document.getElementById('piketForm').onsubmit=async function(e){
        e.preventDefault();
        var params={day:document.getElementById('pk_day').value,class_id:document.getElementById('pk_class').value,student_name:document.getElementById('pk_student').value,task:document.getElementById('pk_task').value};
        var ok=await saveData('piket',params,id);
        if(!ok)return;
        closeModal();
        renderPiket();
    };
}
async function generatePiketImage(){
    var results=await Promise.all([DB.get('classes'),DB.get('piket')]);
    var classes=results[0],pk=results[1];
    if(!pk.length){showToast('Belum ada jadwal piket. Tambahkan piket dulu!','error');return;}
    var selId2=window.__pkClassSel||'';
    if(selId2){pk=pk.filter(function(x){return x.class_id===selId2;});}
    if(!pk.length){showToast('Belum ada jadwal piket untuk kelas yang dipilih. Tambahkan piket dulu!','error');return;}
    var clsName='';
    classes.forEach(function(c){if(c.id===selId2)clsName=c.name||'';});
    var piketText='JADWAL PIKET KELAS'+(clsName?' '+clsName:'')+' MINGGUAN. ';var hasData=false;
    piketDays.forEach(function(day){
        var dayItems=pk.filter(function(x){return x.day===day;});
        if(!dayItems.length)return;
        hasData=true;piketText+='Hari '+day+': ';
        classes.forEach(function(c){
            var items=dayItems.filter(function(x){return x.class_id===c.id;});
            if(items.length){piketText+='Kelas '+(c.name||'')+' piket: '+items.map(function(i){return (i.student_name||'')+(i.task?' - tugas '+(i.task):'');}).join(', ')+'; ';}
        });
        piketText+='. ';
    });
    if(!hasData){showToast('Belum ada jadwal piket. Tambahkan piket dulu!','error');return;}
    var promptText='Buatkan gambar poster jadwal piket kelas mingguan yang menarik, berwarna-warni, dan ramah anak untuk sekolah. Tampilkan daftar piket berikut dalam bentuk tabel poster yang rapi, sertakan ilustrasi alat kebersihan seperti sapu, pel, dan tempat sampah: '+piketText.substring(0,700)+' Gunakan gaya ilustrasi VEKTOR FLAT (flat vector art, clean professional illustration) yang RAPI, JELAS, dan PROFESIONAL: garis bersih dan tegas, bentuk geometris rapi, tata letak daftar tertata simetris dan teratur, palet warna cerah yang harmonis, tanpa noise dan tanpa coretan acak. TEKS WAJIB SANGAT TAJAM: semua tulisan pada poster piket harus besar, tegas, lurus, sangat jelas terbaca (crisp sharp text), ejaan benar, tanpa huruf blur atau berantakan; gunakan teks secukupnya (judul dan daftar nama) agar huruf tetap tajam. KUALITAS WAJIB: resolusi tinggi (HD), sangat tajam dan jelas (sharp focus), detail kaya, warna cerah seimbang, tanpa blur, tanpa noise. PENTING: gambar WAJIB berformat landscape 4:3 (lebar lebih besar dari tinggi, rasio 4 banding 3), daftar piket tampil UTUH di tengah bingkai, tanpa tepi kosong (no border, no letterbox).';
    openModal('🎨 Generate Gambar Piket','<div class="space-y-4"><div class="bg-purple-50 dark:bg-slate-700 p-4 rounded-lg text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-600 flex items-start gap-2"><svg class="w-5 h-5 flex-none mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg><span>Guru Smart AI akan membuatkan gambar poster jadwal piket otomatis berdasarkan data piket sekolah Anda. Tunggu sebentar ya, proses generate gambar mode kilat biasanya 15-45 detik. Format gambar: landscape 4:3 HD (1600×1200), gaya vektor rapi dan jelas, hasil bagus dan profesional, gambar tampil UTUH tanpa terpotong.</span></div><div id="pkImgLoading" class="flex flex-col items-center justify-center py-12"><div class="relative w-20 h-20 mb-4"><div class="absolute inset-0 rounded-full border-4 border-purple-200"></div><div class="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div></div><p class="text-slate-600 dark:text-slate-300 text-sm font-medium">🎨 GURU Smart AI sedang membuat gambar piket...</p><p class="text-xs text-slate-400 mt-1">Mohon tunggu, jangan tutup jendela ini</p></div><div id="pkImgResult" class="hidden"></div><div id="pkImgActions" class="hidden flex gap-2 mt-4"><button id="pkImgDownload" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">💾 Unduh Gambar</button><button onclick="generatePiketImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold flex items-center justify-center gap-2">🔄 Buat Ulang</button><button onclick="closeModal()" class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Tutup</button></div></div>');
    var loadingEl=document.getElementById('pkImgLoading');
    var resultEl=document.getElementById('pkImgResult');
    var actionsEl=document.getElementById('pkImgActions');
    try{
        var imgSrc=null;
        try{imgSrc=await window.gsImageHD(promptText,1600,1200,4,3);}catch(eP){console.warn('HD native piket gagal - lanjut jalur kilat:',eP);}
        if(!imgSrc){imgSrc=await GSAI.image(promptText);}
        if(!imgSrc){throw new Error('AI tidak mengembalikan gambar.');}
        imgSrc=await window.gsHDRefine(imgSrc,1600,1200);
        loadingEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        resultEl.innerHTML='<div class="space-y-3"><div class="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-slate-600 shadow-lg"><img src="'+imgSrc+'" alt="Gambar Jadwal Piket" class="w-full h-auto block" style="display:block;"></div><p class="text-xs text-slate-500 dark:text-slate-400 text-center italic">Gambar poster jadwal piket HD 4:3 (1600×1200) dihasilkan oleh AI</p></div>';
        actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');
        var dlBtn=document.getElementById('pkImgDownload');
        if(dlBtn){dlBtn.onclick=function(){gsDownloadImage(imgSrc,'Gambar_Jadwal_Piket_'+Date.now()+'.png');};}
        showToast('Gambar piket berhasil dibuat! ('+GSAI.provider()+')','success');
    }catch(err){
        console.error('Generate Piket Image Error:',err);
        loadingEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        resultEl.innerHTML='<div class="text-center py-8"><div class="text-5xl mb-3">😕</div><p class="text-red-600 dark:text-red-400 font-semibold mb-1">Gagal membuat gambar piket</p><p class="text-xs text-slate-500 dark:text-slate-400 mb-4">'+(err.message||err)+'</p><p class="text-xs text-amber-600 mb-4">Tips: klik tombol Sambungkan AI di halaman Asisten AI, izinkan popup yang muncul, lalu coba lagi.</p><button onclick="generatePiketImage()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">🔄 Coba Lagi</button></div>';
        actionsEl.classList.remove('hidden');actionsEl.classList.add('flex');
        showToast('Gagal: '+err.message,'error');
    }
}

async function renderAttendance(){var results=await Promise.all([DB.get('students'),DB.get('classes')]);var allStudents=results[0],classes=results[1];var today=new Date().toISOString().split('T')[0];var selClass=document.getElementById('att_class')?.value||(classes[0]?.id||'');var students=selClass?allStudents.filter(function(s){return s.class_id===selClass;}):allStudents;var dateVal=document.getElementById('att_date')?.value||today;var dp=dateVal.split('-');currentDaysInMonth=new Date(parseInt(dp[0]),parseInt(dp[1]),0).getDate();var dh='';for(var i=1;i<=currentDaysInMonth;i++){dh+='<th class="day-header px-2 py-1 cursor-pointer hover:bg-blue-100 text-slate-700" data-day="'+i+'" style="font-size:10px;min-width:24px;">'+i+'</th>';}var html='<div class="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm">';html+='<div class="flex flex-col md:flex-row justify-between mb-4 gap-4"><div><h3 class="text-xl font-bold text-slate-800 dark:text-white">Absensi Bulanan</h3><p class="text-xs text-slate-500 mt-1">Pilih status, lalu klik sel tanggal.</p></div>';html+='<div class="flex flex-wrap gap-2 items-center"><select id="att_class" onchange="renderAttendance()" class="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-slate-800 text-sm">';classes.forEach(function(c){html+='<option value="'+c.id+'" '+(c.id===selClass?'selected':'')+'>'+c.name+'</option>';});html+='</select><input type="date" id="att_date" value="'+today+'" onchange="renderAttendance()" class="px-3 py-2 border rounded-lg dark:bg-slate-700 text-slate-800 text-sm" style="color-scheme:light;">';html+='<button onclick="startNativeScanner()" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Scan QR</button>';html+='<button onclick="exportAttendanceExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Export Excel</button>';html+='<button onclick="printAttendance()" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Cetak</button></div></div>';html+='<div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">';html+='<div class="flex items-center gap-3 text-xs"><span class="font-medium text-slate-700">Pilih Status:</span><select id="att_status_global" class="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-slate-800 text-sm"><option value="H">Hadir (H)</option><option value="S">Sakit (S)</option><option value="I">Izin (I)</option><option value="A">Alpa (A)</option><option value="">Hapus</option></select></div>';html+='<button onclick="saveAttendance()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold">Simpan Absensi</button></div>';html+='<div class="overflow-x-auto pb-2"><table class="att-table border-collapse" style="width:100%;min-width:800px;"><thead><tr class="bg-slate-100 dark:bg-slate-700"><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-xs">No</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-xs text-left min-w-[150px]">Nama</th><th colspan="'+currentDaysInMonth+'" class="px-2 py-2 border dark:border-slate-600 text-xs">Tanggal</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-green-600 text-xs">H</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-blue-600 text-xs">S</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-yellow-600 text-xs">I</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-red-600 text-xs">A</th></tr><tr class="bg-slate-50 dark:bg-slate-800">'+dh+'</tr></thead><tbody id="attTableBody"></tbody></table></div></div>';document.getElementById('content').innerHTML=html;var tbody=document.getElementById('attTableBody');if(students.length>0){var rh='';for(var i=0;i<students.length;i++){var s=students[i];var td='';for(var d=1;d<=currentDaysInMonth;d++){td+='<td id="att_'+s.id+'_'+d+'" data-student="'+s.id+'" data-day="'+d+'" class="border dark:border-slate-600 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium att-cell" style="min-width:24px;height:24px;"></td>';}rh+='<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td class="px-2 py-1 border dark:border-slate-600 text-xs text-center">'+(i+1)+'</td><td class="px-2 py-1 border dark:border-slate-600 text-xs font-semibold text-left">'+s.name+'</td>'+td+'<td id="recap_h_'+s.id+'" class="px-2 py-1 border dark:border-slate-600 text-green-600 font-bold text-xs">0</td><td id="recap_s_'+s.id+'" class="px-2 py-1 border dark:border-slate-600 text-blue-600 font-bold text-xs">0</td><td id="recap_i_'+s.id+'" class="px-2 py-1 border dark:border-slate-600 text-yellow-600 font-bold text-xs">0</td><td id="recap_a_'+s.id+'" class="px-2 py-1 border dark:border-slate-600 text-red-600 font-bold text-xs">0</td></tr>';}tbody.innerHTML=rh;}else{tbody.innerHTML='<tr><td colspan="'+(currentDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Belum ada data siswa.</td></tr>';}await loadAttendanceData();}
document.addEventListener('click',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('att-cell')){var sid=e.target.getAttribute('data-student');var day=parseInt(e.target.getAttribute('data-day'));var se=document.getElementById('att_status_global');if(!se)return;var st=se.value;e.target.innerText=st;e.target.classList.remove('bg-green-100','bg-blue-100','bg-yellow-100','bg-red-100','text-green-700','text-blue-700','text-yellow-700','text-red-700');if(st==='H')e.target.classList.add('bg-green-100','text-green-700');else if(st==='S')e.target.classList.add('bg-blue-100','text-blue-700');else if(st==='I')e.target.classList.add('bg-yellow-100','text-yellow-700');else if(st==='A')e.target.classList.add('bg-red-100','text-red-700');updateRecap();}if(e.target&&e.target.classList&&e.target.classList.contains('day-header')){var day=parseInt(e.target.getAttribute('data-day'));var di=document.getElementById('att_date');if(di){var cd=di.value||new Date().toISOString().split('T')[0];var p=cd.split('-');di.value=p[0]+'-'+p[1]+'-'+String(day).padStart(2,'0');loadAttendanceData();}}if(e.target&&e.target.classList&&e.target.classList.contains('act-att-cell')){var se2=document.getElementById('act_att_status_global');if(!se2)return;var sv=se2.value;var code2=sv==='Hadir'?'H':sv==='Sakit'?'S':sv==='Izin'?'I':sv==='Alpa'?'A':'';e.target.innerText=code2;e.target.classList.remove('bg-green-100','bg-blue-100','bg-yellow-100','bg-red-100','text-green-700','text-blue-700','text-yellow-700','text-red-700');if(code2==='H')e.target.classList.add('bg-green-100','text-green-700');else if(code2==='S')e.target.classList.add('bg-blue-100','text-blue-700');else if(code2==='I')e.target.classList.add('bg-yellow-100','text-yellow-700');else if(code2==='A')e.target.classList.add('bg-red-100','text-red-700');if(typeof updateActRecap==='function')updateActRecap();}if(e.target&&e.target.classList&&e.target.classList.contains('act-day-header')){var dayA=parseInt(e.target.getAttribute('data-day'),10);var diA=document.getElementById('act_att_date');if(diA){var cdA=diA.value||currentActSelectedDate||new Date().toISOString().split('T')[0];var pA=cdA.split('-');diA.value=pA[0]+'-'+pA[1]+'-'+String(dayA).padStart(2,'0');currentActSelectedDate=diA.value;if(currentActId&&typeof loadActAttendanceData==='function')loadActAttendanceData(currentActId);}}});
async function loadAttendanceData(){var di=document.getElementById('att_date');if(!di)return;var dv=di.value||new Date().toISOString().split('T')[0];var m=dv.substring(0,7);document.querySelectorAll('.day-header').forEach(function(h){h.classList.remove('bg-blue-600','text-white');});var sd=parseInt(dv.split('-')[2],10);var sh=document.querySelector('.day-header[data-day="'+sd+'"]');if(sh)sh.classList.add('bg-blue-600','text-white');try{var r=await sb.from('attendance').select('*').eq('user_id',currentUser.id).gte('date',m+'-01').lte('date',m+'-'+String(currentDaysInMonth).padStart(2,'0'));if(r.error){console.error('Load:',r.error);return;}document.querySelectorAll('.att-cell').forEach(function(c){c.innerText='';c.classList.remove('bg-green-100','bg-blue-100','bg-yellow-100','bg-red-100','text-green-700','text-blue-700','text-yellow-700','text-red-700');});if(r.data&&r.data.length>0){r.data.forEach(function(a){var d=parseInt(a.date.split('-')[2],10);var c=document.getElementById('att_'+a.student_id+'_'+d);if(c){c.innerText=a.status;if(a.status==='H')c.classList.add('bg-green-100','text-green-700');else if(a.status==='S')c.classList.add('bg-blue-100','text-blue-700');else if(a.status==='I')c.classList.add('bg-yellow-100','text-yellow-700');else if(a.status==='A')c.classList.add('bg-red-100','text-red-700');}});}}catch(err){console.error('Load:',err);}updateRecap();}
function updateRecap(){document.querySelectorAll('tr').forEach(function(r){var im=r.querySelector('td[id^="att_"]');if(im){var sid=im.id.split('_')[1];var h=0,s=0,i=0,a=0;r.querySelectorAll('td[id^="att_"]').forEach(function(c){var v=c.innerText.trim()||'';if(v==='H')h++;else if(v==='S')s++;else if(v==='I')i++;else if(v==='A')a++;});var rh=document.getElementById('recap_h_'+sid);if(rh)rh.innerText=h;var rs=document.getElementById('recap_s_'+sid);if(rs)rs.innerText=s;var ri=document.getElementById('recap_i_'+sid);if(ri)ri.innerText=i;var ra=document.getElementById('recap_a_'+sid);if(ra)ra.innerText=a;}});}
async function saveAttendance(){var dv=document.getElementById('att_date').value;if(!dv){showToast('Pilih tanggal!','error');return;}var m=dv.substring(0,7);var all=await DB.get('students');var sc=document.getElementById('att_class').value;var sts=sc?all.filter(function(s){return s.class_id===sc;}):all;if(sts.length===0){showToast('Tidak ada siswa.','info');return;}var sids=sts.map(function(s){return s.id;});var rows=[];for(var i=0;i<sts.length;i++){var s=sts[i];for(var d=1;d<=currentDaysInMonth;d++){var c=document.getElementById('att_'+s.id+'_'+d);var st=c?.innerText.trim()||'';if(st==='H'||st==='S'||st==='I'||st==='A'){rows.push({user_id:currentUser.id,student_id:s.id,date:m+'-'+String(d).padStart(2,'0'),status:st,subject:'Umum'});}}}showToast('Menyimpan...','info');try{if(sids.length>0){var dr=await sb.from('attendance').delete().eq('user_id',currentUser.id).in('student_id',sids).gte('date',m+'-01').lte('date',m+'-'+String(currentDaysInMonth).padStart(2,'0'));if(dr.error)console.error('Del:',dr.error);}if(rows.length>0){var ir=await sb.from('attendance').insert(rows);if(ir.error)throw ir.error;}showToast('Absensi tersimpan!','success');}catch(err){console.error('Save:',err);showToast('Gagal: '+(err.message||'Unknown'),'error');}await loadAttendanceData();}
async function exportAttendanceExcel(){var results=await Promise.all([DB.get('school_profile'),DB.get('students'),DB.get('classes')]);var prof=results[0][0]||{},all=results[1],cl=results[2];var dv=document.getElementById('att_date').value;var cv=document.getElementById('att_class').value;var c=cl.find(function(x){return x.id===cv;});var sts=cv?all.filter(function(s){return s.class_id===cv;}):all;if(sts.length===0){showToast('Tidak ada siswa untuk diekspor.','error');return;}var ms=dv?new Date(dv).toLocaleDateString('id-ID',{month:'long',year:'numeric'}):'-';var aoa=[];aoa.push([""]);aoa.push(["",prof.kop_line1||"NAMA SEKOLAH","","","",""]);if(prof.kop_line1b)aoa.push(["",prof.kop_line1b,"","",""]);aoa.push(["",prof.kop_line2||prof.name||"","","",""]);aoa.push(["",prof.kop_line3||"","","",""]);aoa.push([""]);aoa.push(["DAFTAR HADIR SISWA"]);aoa.push(["Kelas: "+(c?.name||'Semua')+" | Bulan: "+ms]);aoa.push([""]);var header=["No","NIS","Nama"];for(var d=1;d<=currentDaysInMonth;d++)header.push("Tgl "+d);header.push("Total H","Total S","Total I","Total A");aoa.push(header);for(var i=0;i<sts.length;i++){var s=sts[i];var row=[i+1,s.nis,s.name];var h=0,sk=0,iz=0,al=0;for(var d=1;d<=currentDaysInMonth;d++){var cell=document.getElementById('att_'+s.id+'_'+d);var v=cell?.innerText.trim()||'';row.push(v);if(v==='H')h++;else if(v==='S')sk++;else if(v==='I')iz++;else if(v==='A')al++;}row.push(h,sk,iz,al);aoa.push(row);}var ws=XLSX.utils.aoa_to_sheet(aoa);var lastCol=3+currentDaysInMonth+3;ws['!merges']=[{s:{r:1,c:1},e:{r:1,c:lastCol}},{s:{r:2,c:1},e:{r:2,c:lastCol}},{s:{r:3,c:1},e:{r:3,c:lastCol}},{s:{r:4,c:1},e:{r:4,c:lastCol}},{s:{r:6,c:0},e:{r:6,c:lastCol}},{s:{r:7,c:0},e:{r:7,c:lastCol}}];ws['!cols']=[{wch:5},{wch:15},{wch:25}];for(var d=1;d<=currentDaysInMonth;d++)ws['!cols'].push({wch:5});var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Absensi');XLSX.writeFile(wb,'Absensi_'+dv+'.xlsx');showToast('File Excel berhasil diunduh!','success');}
async function printAttendance(){
  var results=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('school_profile')]);
  var all=results[0],cls=results[1],prof=results[2][0]||{};
  var dv=document.getElementById('att_date').value;
  var cv=document.getElementById('att_class').value;
  var cl=cls.find(function(c){return c.id===cv;});
  var ms=dv?new Date(dv).toLocaleDateString('id-ID',{month:'long',year:'numeric'}):'-';
  var sts=cv?all.filter(function(s){return s.class_id===cv;}):all;

  // Ambil nama wali kelas dari data kelas; fallback ke currentUser jika kosong
  var waliKelasNama = (cl && cl.homeroom && cl.homeroom.trim()) ? cl.homeroom : currentUser.name;

  var dh='';
  for(var d=1;d<=currentDaysInMonth;d++){
    dh+='<th style="font-size:8px;padding:2px;border:1px solid #000;width:12px;">'+d+'</th>';
  }
  var rh='';
  for(var i=0;i<sts.length;i++){
    var s=sts[i];
    var td='';
    var h=0,sk=0,iz=0,al=0;
    for(var d=1;d<=currentDaysInMonth;d++){
      var c=document.getElementById('att_'+s.id+'_'+d);
      var v=c?.innerText.trim()||'';
      var col=v==='H'?'green':v==='A'?'red':v===''?'transparent':'orange';
      td+='<td style="font-size:8px;padding:2px;border:1px solid #000;color:'+col+';font-weight:bold;text-align:center;">'+v+'</td>';
      if(v==='H')h++;
      else if(v==='S')sk++;
      else if(v==='I')iz++;
      else if(v==='A')al++;
    }
    rh+='<tr><td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;">'+(i+1)+'</td>'+
        '<td style="padding:4px;border:1px solid #000;font-size:10px;">'+s.name+'</td>'+
        td+
        '<td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:green;font-weight:bold;">'+h+'</td>'+
        '<td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:blue;font-weight:bold;">'+sk+'</td>'+
        '<td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:orange;font-weight:bold;">'+iz+'</td>'+
        '<td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:red;font-weight:bold;">'+al+'</td></tr>';
  }
  var kh=await generateKopHTML();
  openPrintPreview(
    '<div style="font-family:Arial;color:#000;">'+kh+
    '<h3 style="text-align:center;margin:20px 0 5px;">DAFTAR HADIR SISWA</h3>'+
    '<p style="text-align:center;margin:0 0 15px;font-size:12px;">Kelas: '+(cl?.name||'Semua')+' | Bulan: '+ms+'</p>'+
    '<table style="width:100%;border-collapse:collapse;font-size:10px;">'+
      '<thead><tr style="background:#eee;">'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;">No</th>'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;">Nama</th>'+
        '<th colspan="'+currentDaysInMonth+'" style="border:1px solid #000;padding:4px;">Tanggal</th>'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;color:green;">H</th>'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;color:blue;">S</th>'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;color:orange;">I</th>'+
        '<th rowspan="2" style="padding:5px;border:1px solid #000;color:red;">A</th>'+
      '</tr><tr style="background:#eee;">'+dh+'</tr></thead>'+
      '<tbody>'+rh+'</tbody>'+
    '</table>'+
    '<div style="display:flex;justify-content:space-between;margin-top:40px;font-size:12px;">'+
      '<div style="text-align:center;">'+
        '<p>Mengetahui,</p>'+
        '<p>Kepala Sekolah</p><br><br><br>'+
        '<p style="font-weight:bold;text-decoration:underline;">'+(prof.principal||'-')+'</p>'+
        '<p>NIP. '+(prof.principal_nip||'-')+'</p>'+
      '</div>'+
      '<div style="text-align:center;">'+
        '<p>'+new Date().toLocaleDateString('id-ID',{dateStyle:'long'})+'</p>'+
        '<p>Wali Kelas</p><br><br><br>'+
        '<p style="font-weight:bold;text-decoration:underline;">'+waliKelasNama+'</p>'+
        // Tampilkan nama kelas di bawah wali kelas untuk kejelasan
        '<p style="font-size:10px;">Kelas '+(cl?.name||'-')+'</p>'+
      '</div>'+
    '</div></div>'
  );
}
function playBeep(){try{var ctx=new(window.AudioContext||window.webkitAudioContext)();var osc=ctx.createOscillator();var gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type='sine';osc.frequency.value=900;gain.gain.setValueAtTime(1,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.3);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.3);}catch(e){}}
var scannerStarting=false;
var scannerLastText='';
var scannerLastAt=0;
var scannerProcessing=false;
async function startScanCamera(){
  var reader=document.getElementById('qr-reader');
  var status=document.getElementById('qr-status');
  if(!reader)return;
  if(typeof Html5Qrcode==='undefined'){
    if(status)status.innerText='Mesin pembaca QR tidak termuat. Periksa internet lalu muat ulang halaman.';
    return;
  }
  if(scannerStarting)return;
  scannerStarting=true;
  try{
    if(html5QrCode){
      try{await html5QrCode.stop();}catch(e){}
      try{html5QrCode.clear();}catch(e){}
      html5QrCode=null;
    }
    reader.style.width='100%';
    reader.style.maxWidth='100%';
    reader.style.minHeight='320px';
    reader.style.position='relative';
    scannerLastText='';
    scannerLastAt=0;
    scannerProcessing=false;
    html5QrCode=new Html5Qrcode('qr-reader',{verbose:false});
    var onScanSuccess=async function(decodedText){
      var now=Date.now();
      if(!decodedText || scannerProcessing || (decodedText===scannerLastText && now-scannerLastAt<0))return;
      scannerProcessing=true;
      scannerLastText=decodedText;scannerLastAt=now;
      var liveStatus=document.getElementById('qr-status');
      if(liveStatus)liveStatus.innerText='QR terdeteksi. Mengambil screenshot otomatis dan memverifikasi hasil...';
      /* Ambil snapshot otomatis dari frame kamera saat QR terdeteksi. Hasil dekode
         Html5Qrcode dipakai sebagai hasil utama agar proses tetap cepat dan stabil. */
      try{
        var scanVideo=reader.querySelector('video');
        if(!scanVideo){var scanVideos=reader.getElementsByTagName('video');scanVideo=scanVideos&&scanVideos.length?scanVideos[0]:null;}
        if(scanVideo){
          /* Tunggu frame kamera yang benar-benar siap, agar canvas tidak kosong. */
          if(!(scanVideo.videoWidth>0 && scanVideo.videoHeight>0)){
            await new Promise(function(resolve){var done=false;var finish=function(){if(done)return;done=true;resolve();};scanVideo.addEventListener('loadeddata',finish,{once:true});setTimeout(finish,500);});
          }
          if(scanVideo.videoWidth>0 && scanVideo.videoHeight>0){
            /* Tunggu satu frame baru lalu ambil gambar asli dari video kamera. */
            await new Promise(function(resolve){requestAnimationFrame(function(){resolve();});});
            var snapCanvas=document.createElement('canvas');
            snapCanvas.width=scanVideo.videoWidth;
            snapCanvas.height=scanVideo.videoHeight;
            var snapCtx=snapCanvas.getContext('2d',{willReadFrequently:true});
            if(!snapCtx)throw new Error('Canvas screenshot tidak tersedia');
            snapCtx.drawImage(scanVideo,0,0,snapCanvas.width,snapCanvas.height);
            window.lastQrScanScreenshot=snapCanvas.toDataURL('image/jpeg',0.96);
            window.lastQrScanText=decodedText;
            window.lastQrScanAt=new Date().toISOString();
            window.lastQrScanImage=snapCanvas;
            /* Screenshot hanya disimpan sementara di memori halaman; jangan unduh ke perangkat.
               Baca ulang QR dari gambar snapshot secara otomatis bila browser mendukungnya. */
            if('BarcodeDetector' in window){
              try{
                var qrDetector=new BarcodeDetector({formats:['qr_code']});
                var foundCodes=await qrDetector.detect(snapCanvas);
                if(foundCodes && foundCodes.length){
                  var matchedCode=foundCodes.find(function(item){return item.rawValue===decodedText;}) || foundCodes[0];
                  if(matchedCode && matchedCode.rawValue)decodedText=matchedCode.rawValue;
                }
              }catch(snapshotVerifyError){console.debug('Pembacaan ulang snapshot tidak tersedia; memakai hasil pembaca QR utama.',snapshotVerifyError);}
            }
          }else{throw new Error('Video kamera belum menghasilkan frame');}
        }else{throw new Error('Elemen video kamera tidak ditemukan');}
      }catch(snapshotError){console.warn('Screenshot otomatis tidak tersedia; tetap memakai hasil QR yang terdeteksi.',snapshotError);}
      if(liveStatus)liveStatus.innerText='QR berhasil difoto sementara dan dibaca otomatis. Memproses data...';
      await stopCameraStream();
      if(window.currentActId){await processActQRResult(window.currentActId,decodedText);}
      else{await processQRResult(decodedText);}
      scannerProcessing=false;
    };
    var config={
      /* Tingkatkan peluang membaca QR kecil: frame lebih sering dan area pemindaian lebih luas. */
      fps:30,
      qrbox:function(viewWidth,viewHeight){
        var side=Math.floor(Math.min(viewWidth*0.90,viewHeight*0.90,720));
        side=Math.max(100,side);
        return {width:Math.min(side,viewWidth),height:Math.min(side,viewHeight)};
      },
      aspectRatio:1,
      disableFlip:false,
      formatsToSupport:[Html5QrcodeSupportedFormats.QR_CODE],
      experimentalFeatures:{useBarCodeDetectorIfSupported:true},
      videoConstraints:{
        facingMode:'environment',
        width:{ideal:1920},
        height:{ideal:1080},
        frameRate:{ideal:30,max:30}
      }
    };
    /* BUKA KAMERA INSTAN (0 detik loading): saat tombol Scan diklik, stream kamera
       langsung diminta tanpa menunggu enumerasi getCameras() terlebih dahulu,
       karena getCameras() bisa memblokir beberapa detik sebelum kamera tampil.
       Pemilihan kamera spesifik (webcam PC / kamera belakang HP) tetap dijaga
       sebagai fallback otomatis hanya bila pembukaan cepat gagal. */
    var isMobileDevice=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
    var scanFailure=null;
    var started=false;
    /* Fase cepat: langsung buka kamera (HP utamakan kamera belakang, PC utamakan webcam). */
    var fastFacing=isMobileDevice?'environment':'user';
    var fastOptions=[config,
      Object.assign({},config,{videoConstraints:{facingMode:{ideal:fastFacing},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:24}}}),
      Object.assign({},config,{videoConstraints:{facingMode:{ideal:fastFacing}}})
    ];
    for(var fi=0;fi<fastOptions.length&&!started;fi++){
      try{
        await html5QrCode.start({facingMode:fastFacing},fastOptions[fi],onScanSuccess,function(){/* Terus pindai sampai QR terbaca. */});
        started=true;
      }catch(startErr){scanFailure=startErr;console.warn('Percobaan cepat membuka kamera gagal; mencoba konfigurasi lain.',startErr);}
    }
    /* Fallback (hanya bila cara cepat gagal): daftar kamera diambil seperti semula
       agar webcam PC / kamera belakang HP tetap terpilih dengan benar. */
    if(!started){
      var cameraConfig={facingMode:{ideal:fastFacing}};
      var cameras=[];
      try{
        cameras=await Html5Qrcode.getCameras();
        if(cameras&&cameras.length){
          var backCamera=cameras.find(function(c){return /back|rear|environment|belakang|traseira/i.test(c.label||'');});
          var frontCamera=cameras.find(function(c){return /front|user|integrated|webcam|facetime|hd camera/i.test(c.label||'');});
          cameraConfig=(isMobileDevice?(backCamera||cameras[0]):(frontCamera||cameras[0])).id;
        }
      }catch(cameraListError){console.warn('Daftar kamera tidak tersedia; memakai kamera default.',cameraListError);}
      var startOptions=[config,
        Object.assign({},config,{videoConstraints:{width:{ideal:1280},height:{ideal:720},frameRate:{ideal:24}}}),
        Object.assign({},config,{videoConstraints:{}})
      ];
      var cameraOptions=cameras.length?[cameraConfig,{facingMode:fastFacing},cameras[0].id]:[cameraConfig,{facingMode:'user'},{facingMode:'environment'}];
      for(var ci=0;ci<cameraOptions.length&&!started;ci++){
        for(var si=0;si<startOptions.length&&!started;si++){
          try{
            await html5QrCode.start(cameraOptions[ci],startOptions[si],onScanSuccess,function(){/* Terus pindai sampai QR terbaca. */});
            started=true;
          }catch(startErr){scanFailure=startErr;console.warn('Percobaan membuka kamera gagal; mencoba konfigurasi lain.',startErr);}
        }
      }
    }
    if(!started)throw scanFailure||new Error('Tidak ada kamera yang berhasil dibuka');
    var video=reader.querySelector('video');
    if(video){
      /* Minta fokus otomatis berkelanjutan jika didukung kamera/browser. */
      try{
        var videoTrack=video.srcObject&&video.srcObject.getVideoTracks?video.srcObject.getVideoTracks()[0]:null;
        if(videoTrack&&videoTrack.applyConstraints){
          var supported=videoTrack.getCapabilities?videoTrack.getCapabilities():{};
          var focusConstraints={};
          if(supported.focusMode&&supported.focusMode.indexOf('continuous')!==-1)focusConstraints.focusMode='continuous';
          if(supported.zoom&&supported.zoom.max>1)focusConstraints.zoom=Math.min(supported.zoom.max,1.5);
          if(Object.keys(focusConstraints).length)await videoTrack.applyConstraints({advanced:[focusConstraints]});
        }
      }catch(focusError){console.warn('Fokus/zoom otomatis tidak didukung kamera ini.',focusError);}
      video.setAttribute('playsinline','true');
      video.setAttribute('autoplay','true');
      video.setAttribute('webkit-playsinline','true');
      video.muted=true;
      video.style.display='block';
      video.style.width='100%';
      video.style.height='100%';
      video.style.minHeight='320px';
      video.style.objectFit='contain';
    }
    var liveStatus=document.getElementById('qr-status');
    if(liveStatus)liveStatus.innerText='Kamera aktif. Arahkan QR ke bingkai dan tahan stabil; di PC pastikan webcam tidak sedang dipakai aplikasi lain. Scanner akan membaca otomatis saat QR terlihat jelas.';
  }catch(e){
    console.error('Scanner QR gagal:',e);
    var msg=(e&&e.name==='NotAllowedError')?'Izin kamera ditolak. Izinkan kamera di pengaturan browser.':
      (e&&e.name==='NotFoundError')?'Kamera tidak ditemukan pada perangkat ini.':
      (e&&e.name==='NotReadableError')?'Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.':
      'Kamera gagal dibuka. Pastikan halaman HTTPS dan izin kamera aktif.';
    var liveStatus=document.getElementById('qr-status');
    if(liveStatus)liveStatus.innerText=msg;
    if(html5QrCode){try{await html5QrCode.clear();}catch(ignore){}html5QrCode=null;}
  }finally{scannerStarting=false;}
}
async function stopCameraStream(){
  var scanner=html5QrCode;
  if(!scanner)return;
  html5QrCode=null;
  try{await scanner.stop();}catch(e){}
  try{scanner.clear();}catch(e){}
}
function closeScannerModal(){
  stopCameraStream();
  document.querySelectorAll('#qr-reader video').forEach(function(v){
    if(v.srcObject){v.srcObject.getTracks().forEach(function(track){track.stop();});v.srcObject=null;}
  });
  window.currentActId=null;
  closeModal();
}
async function startNativeScanner(){var d=document.getElementById('att_date')?.value;if(!d){showToast('Pilih tanggal!','error');return;}openModal('Scan QR Siswa',`<div class="flex flex-col items-center space-y-4">
<div class="w-full max-w-lg p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
  <div id="qr-reader" class="relative w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center" style="min-height:320px;height:min(78vw,430px);aspect-ratio:1/1;max-height:52dvh;">
    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events:none"></div>
    <div class="absolute top-0 left-0 w-14 h-14 border-t-4 border-l-4 border-white rounded-tl-lg m-2 z-10"></div>
    <div class="absolute top-0 right-0 w-14 h-14 border-t-4 border-r-4 border-white rounded-tr-lg m-2 z-10"></div>
    <div class="absolute bottom-0 left-0 w-14 h-14 border-b-4 border-l-4 border-white rounded-bl-lg m-2 z-10"></div>
    <div class="absolute bottom-0 right-0 w-14 h-14 border-b-4 border-r-4 border-white rounded-br-lg m-2 z-10"></div>
    <div class="text-center text-slate-500 text-sm z-0"><svg class="animate-pulse w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg><span id="qr-status">Memulai kamera...</span></div>
  </div>
</div>
<div id="scan-result" class="w-full text-center min-h-[40px]"></div>
<div class="w-full border-t dark:border-slate-700 pt-4"><p class="text-xs text-slate-500 text-center mb-2">Atau input NIS manual:</p><div class="flex gap-2"><input type="text" id="manual-nis-input" placeholder="Masukkan NIS Siswa" class="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-sm"><button onclick="manualInputNIS()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Cari</button></div></div>
<button onclick="closeScannerModal()" class="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Tutup Scanner</button>
</div>`);startScanCamera();}
window.manualInputNIS=function(){var v=document.getElementById('manual-nis-input').value.trim();if(v){processQRResult(v);}else{showToast('NIS kosong!','error');}};
async function processQRResult(t){var sts=await DB.get('students');var n=t;try{var p=JSON.parse(t);if(p.nis)n=p.nis;}catch(e){}var std=sts.find(function(s){return s.nis===n||s.nis===t;});if(std){playBeep();var dv=document.getElementById('att_date').value;var day=new Date(dv).getDate();var c=document.getElementById('att_'+std.id+'_'+day);if(c){c.innerText='H';c.classList.remove('bg-blue-100','bg-yellow-100','bg-red-100','text-blue-700','text-yellow-700','text-red-700');c.classList.add('bg-green-100','text-green-700');updateRecap();var result=document.getElementById('scan-result');if(result){result.innerHTML='<div class="bg-green-100 text-green-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>✅ '+std.name+' berhasil absen!</div>';}try{var er=await sb.from('attendance').select('id').eq('student_id',std.id).eq('date',dv).eq('user_id',currentUser.id).maybeSingle();if(er.data)await sb.from('attendance').update({status:'H'}).eq('id',er.data.id).eq('user_id',currentUser.id);else await sb.from('attendance').insert([{user_id:currentUser.id,student_id:std.id,date:dv,status:'H',subject:'Umum'}]);}catch(e){console.error('Scan:',e);}setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},1000);}else{var result=document.getElementById('scan-result');if(result)result.innerHTML='<div class="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold">❌ Siswa tidak ada di tabel kelas.</div>';setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},2000);}}else{var result=document.getElementById('scan-result');if(result)result.innerHTML='<div class="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold">❌ QR tidak dikenal: '+t+'</div>';setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},2000);}}
var currentActId=null;var currentActDaysInMonth=31;var currentActSelectedDate=null;
async function renderActivityAttendance(){var results=await Promise.all([DB.get('activity_attendance'),DB.get('students'),DB.get('classes')]);var acts=results[0],st=results[1],cl=results[2];currentActSelectedDate=null;if(acts.length===0){document.getElementById('content').innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm text-center py-10"><h3 class="font-bold text-slate-800 dark:text-white text-lg mb-2">Belum ada kegiatan</h3><p class="text-sm text-slate-500 mb-4">Silakan buat kegiatan baru untuk memulai absensi.</p><button onclick="activityForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Buat Kegiatan</button></div>';return;}var firstAct=acts[0];await activityAttendanceForm(firstAct.id,acts,st);}
async function activityForm(id){var a=null;if(id){a=(await DB.get('activity_attendance')).find(function(x){return x.id===id;});}openModal(id?'Edit Kegiatan':'Buat Kegiatan','<form id="actForm" class="space-y-4"><div><label class="block text-sm mb-1">Nama Kegiatan</label><input type="text" id="act_title" value="'+(a?.title||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Tanggal</label><input type="date" id="act_date" value="'+(a?.date||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" style="color-scheme:light;" required></div><div><label class="block text-sm mb-1">Deskripsi</label><textarea id="act_desc" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(a?.description||'')+'</textarea></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('actForm').onsubmit=async function(e){e.preventDefault();var p={title:document.getElementById('act_title').value,date:document.getElementById('act_date').value,description:document.getElementById('act_desc').value};await saveData('activity_attendance',p,id);closeModal();renderActivityAttendance();};}
async function activityAttendanceForm(actId,actsPre,stPre){currentActId=actId;var allActs=(actsPre&&actsPre.length)?actsPre:await DB.get('activity_attendance');var act=allActs.find(function(x){return x.id===actId;});if(!act&&actsPre&&actsPre.length){allActs=await DB.get('activity_attendance');act=allActs.find(function(x){return x.id===actId;});}if(!act)return;var actDate=act.date||new Date().toISOString().split('T')[0];if(!currentActSelectedDate)currentActSelectedDate=actDate;var selDate=currentActSelectedDate;var dp=selDate.split('-');currentActDaysInMonth=new Date(parseInt(dp[0]),parseInt(dp[1]),0).getDate();var dh='';for(var d=1;d<=currentActDaysInMonth;d++){dh+='<th class="act-day-header px-2 py-1 cursor-pointer hover:bg-blue-100 text-slate-700" data-day="'+d+'" style="font-size:10px;min-width:24px;">'+d+'</th>';}var html='<div class="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm">';html+='<div class="mb-4 flex justify-between items-center flex-wrap gap-3"><button onclick="renderActivityList()" class="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Lihat Daftar Kegiatan</button><button onclick="activityForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Buat Kegiatan Baru</button></div>';html+='<div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-md mb-4"><div class="flex items-center gap-2 mb-1"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4 h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg><h3 class="text-xl font-bold">'+act.title+'</h3></div><p class="text-sm opacity-90">Tanggal Kegiatan: '+formatDateID(act.date)+'</p>'+(act.description?'<p class="text-xs opacity-75 mt-1">'+act.description+'</p>':'')+'</div>';html+='<div class="flex flex-col md:flex-row justify-between mb-4 gap-4"><div><select id="act_selector" onchange="if(this.value)activityAttendanceForm(this.value)" class="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-slate-800 text-sm">'+allActs.map(function(a){return '<option value="'+a.id+'" '+(a.id===actId?'selected':'')+'>'+a.title+'</option>';}).join('')+'</select></div><div class="flex flex-wrap gap-2 items-center"><input type="date" id="act_att_date" value="'+selDate+'" onchange="currentActSelectedDate=this.value;loadActAttendanceData(currentActId)" class="px-3 py-2 border rounded-lg dark:bg-slate-700 text-slate-800 text-sm" style="color-scheme:light;"><button onclick="startActScanner(\''+actId+'\')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Scan QR</button><button onclick="exportActAttendanceExcel(\''+actId+'\')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Export Excel</button><button onclick="printActAttendance(\''+actId+'\')" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">Cetak</button></div></div>';html+='<div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4"><div class="flex items-center gap-3 text-xs"><span class="font-medium text-slate-700">Pilih Status:</span><select id="act_att_status_global" class="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-slate-800 text-sm"><option value="Hadir">Hadir (H)</option><option value="Sakit">Sakit (S)</option><option value="Izin">Izin (I)</option><option value="Alpa">Alpa (A)</option><option value="">Hapus</option></select></div><div class="flex gap-2"><button onclick="openAddActStudentModal()" class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Tambah Manual</button><button onclick="saveActivityAttendance(\''+actId+'\')" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold">Simpan Absensi</button></div></div>';html+='<div class="overflow-x-auto pb-2"><table class="att-table border-collapse" style="width:100%;min-width:800px;"><thead><tr class="bg-slate-100 dark:bg-slate-700"><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-xs">No</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-xs text-left min-w-[150px]">Nama</th><th colspan="'+currentActDaysInMonth+'" class="px-2 py-2 border dark:border-slate-600 text-xs">Tanggal</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-green-600 text-xs">H</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-blue-600 text-xs">S</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-yellow-600 text-xs">I</th><th rowspan="2" class="px-2 py-2 border dark:border-slate-600 text-red-600 text-xs">A</th></tr><tr class="bg-slate-50 dark:bg-slate-800">'+dh+'</tr></thead><tbody id="actAttTableBody"><tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Memuat data...</td></tr></tbody></table></div></div>';document.getElementById('content').innerHTML=html;await loadActAttendanceData(actId,stPre);}
window.addActStudentRow=function(studentId,studentName,showMsg){var tbody=document.getElementById('actAttTableBody');if(!tbody)return;if(document.getElementById('act_att_'+studentId+'_1'))return;var emptyRow=tbody.querySelector('td[colspan]');if(emptyRow)emptyRow.parentElement.remove();var i=tbody.rows.length;var td='';for(var d=1;d<=currentActDaysInMonth;d++){td+='<td id="act_att_'+studentId+'_'+d+'" data-student="'+studentId+'" data-day="'+d+'" class="border dark:border-slate-600 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium act-att-cell" style="min-width:24px;height:24px;"></td>';}var rh='<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50" data-student-row="'+studentId+'"><td class="px-2 py-1 border dark:border-slate-600 text-xs text-center">'+(i+1)+'</td><td class="px-2 py-1 border dark:border-slate-600 text-xs font-semibold text-left"><div class="flex items-center justify-between"><span>'+studentName+'</span><button onclick="removeActStudentRow(\''+studentId+'\')" class="text-red-500 text-[10px] flex-none ml-2">✕</button></div></td>'+td+'<td id="act_recap_h_'+studentId+'" class="px-2 py-1 border dark:border-slate-600 text-green-600 font-bold text-xs">0</td><td id="act_recap_s_'+studentId+'" class="px-2 py-1 border dark:border-slate-600 text-blue-600 font-bold text-xs">0</td><td id="act_recap_i_'+studentId+'" class="px-2 py-1 border dark:border-slate-600 text-yellow-600 font-bold text-xs">0</td><td id="act_recap_a_'+studentId+'" class="px-2 py-1 border dark:border-slate-600 text-red-600 font-bold text-xs">0</td></tr>';tbody.insertAdjacentHTML('beforeend',rh);if(showMsg)showToast(studentName+' ditambahkan!','success');};
window.removeActStudentRow=function(studentId){var row=document.querySelector('tr[data-student-row="'+studentId+'"]');if(row)row.remove();var tbody=document.getElementById('actAttTableBody');if(tbody&&tbody.children.length===0){tbody.innerHTML='<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Belum ada data. Scan QR atau tambah manual.</td></tr>';}updateActRecap();};
async function openAddActStudentModal(){var allStudents=await DB.get('students');var html='<div class="space-y-2 max-h-60 overflow-y-auto modal-scroll">';var available=false;if(allStudents.length===0){html+='<p class="text-center text-slate-500 text-sm py-4">Belum ada data siswa.</p>';}else{allStudents.forEach(function(s){if(!document.getElementById('act_att_'+s.id+'_1')){available=true;html+='<div onclick="addActStudentRow(\''+s.id+'\', this.getAttribute(\'data-name\'), true); closeModal();" data-name="'+s.name.replace(/"/g,'&quot;')+'" class="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm cursor-pointer">'+s.name+'</div>';}});if(!available){html+='<p class="text-center text-slate-500 text-sm py-4">Semua siswa sudah ada di tabel.</p>';}}html+='</div>';openModal('Tambah Siswa Manual',html);}
async function renderActivityList(){var results=await Promise.all([DB.get('activity_attendance'),DB.get('students')]);var acts=results[0],st=results[1];document.getElementById('content').innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"><div class="flex justify-between mb-4"><h3 class="font-bold text-slate-800 dark:text-white">Daftar Hadir Kegiatan</h3><button onclick="activityForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Buat Kegiatan</button></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4">'+(acts.length?acts.map(function(a){return '<div class="p-4 border dark:border-slate-700 rounded-lg"><h4 class="font-bold text-slate-800 dark:text-white">'+a.title+'</h4><p class="text-xs text-slate-500 mt-1">Tanggal: '+formatDateID(a.date)+'</p><p class="text-sm mt-2 text-slate-600 dark:text-slate-300">'+(a.description||'')+'</p><div class="mt-3 flex gap-2"><button onclick="activityAttendanceForm(\''+a.id+'\')" class="flex-1 text-xs bg-green-100 text-green-600 px-3 py-1 rounded">Buka Absensi</button><button onclick="activityForm(\''+a.id+'\')" class="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded">Edit</button><button onclick="deleteData(\'activity_attendance\',\''+a.id+'\',renderActivityList)" class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded">Hapus</button></div></div>';}).join(''):'<div class="col-span-3 text-center py-8 text-slate-500">Belum ada kegiatan.</div>')+'</div></div>';}
async function loadActAttendanceData(actId,stPre){var di=document.getElementById('act_att_date');if(!di)return;var dv=di.value||currentActSelectedDate||new Date().toISOString().split('T')[0];var m=dv.substring(0,7);document.querySelectorAll('.act-day-header').forEach(function(h){h.classList.remove('bg-blue-600','text-white');});var sd=parseInt(dv.split('-')[2],10);var sh=document.querySelector('.act-day-header[data-day="'+sd+'"]');if(sh)sh.classList.add('bg-blue-600','text-white');var tbody=document.getElementById('actAttTableBody');if(!tbody)return;tbody.innerHTML='<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Memuat data...</td></tr>';var gsBuild=function(stMap,order,sMap){var rows='';for(var ri=0;ri<order.length;ri++){var sid=order[ri];var cnt={H:0,S:0,I:0,A:0};var cells='';for(var d=1;d<=currentActDaysInMonth;d++){var code=(stMap[sid]&&stMap[sid][d])||'';if(code&&cnt[code]!==undefined)cnt[code]++;cells+='<td id="act_att_'+sid+'_'+d+'" data-student="'+sid+'" data-day="'+d+'" class="border dark:border-slate-600 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium act-att-cell'+(code==='H'?' bg-green-100 text-green-700':code==='S'?' bg-blue-100 text-blue-700':code==='I'?' bg-yellow-100 text-yellow-700':code==='A'?' bg-red-100 text-red-700':'')+'" style="min-width:24px;height:24px;">'+code+'</td>';}rows+='<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50" data-student-row="'+sid+'"><td class="px-2 py-1 border dark:border-slate-600 text-xs text-center">'+(ri+1)+'</td><td class="px-2 py-1 border dark:border-slate-600 text-xs font-semibold text-left"><div class="flex items-center justify-between"><span>'+(sMap[sid]||'')+'</span><button onclick="removeActStudentRow(\''+sid+'\')" class="text-red-500 text-[10px] flex-none ml-2">&#10005;</button></div></td>'+cells+'<td id="act_recap_h_'+sid+'" class="px-2 py-1 border dark:border-slate-600 text-green-600 font-bold text-xs">'+cnt.H+'</td><td id="act_recap_s_'+sid+'" class="px-2 py-1 border dark:border-slate-600 text-blue-600 font-bold text-xs">'+cnt.S+'</td><td id="act_recap_i_'+sid+'" class="px-2 py-1 border dark:border-slate-600 text-yellow-600 font-bold text-xs">'+cnt.I+'</td><td id="act_recap_a_'+sid+'" class="px-2 py-1 border dark:border-slate-600 text-red-600 font-bold text-xs">'+cnt.A+'</td></tr>';}tbody.innerHTML=rows||'<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Belum ada data. Scan QR atau tambah manual.</td></tr>';};try{var r=await sb.from('activity_records').select('student_id, date, status').eq('act_id',actId).eq('user_id',currentUser.id).gte('date',m+'-01').lte('date',m+'-'+String(currentActDaysInMonth).padStart(2,'0'));var recs=null,missDate=false;if(r.error){console.error('Load Act:',r.error);if(String(r.error.message).toLowerCase().includes('date')||String(r.error.message).toLowerCase().includes('column')){missDate=true;var r2=await sb.from('activity_records').select('*').eq('act_id',actId).eq('user_id',currentUser.id);recs=r2.data||[];}}else{recs=r.data||[];}
if(recs===null){tbody.innerHTML='<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Gagal memuat data.</td></tr>';return;}
if(recs.length===0){tbody.innerHTML='<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Belum ada data. Scan QR atau tambah manual.</td></tr>';return;}
var neededIds=[...new Set(recs.map(function(x){return x.student_id;}))];var studentMap={};if(stPre&&stPre.length){stPre.forEach(function(s2){studentMap[s2.id]=s2.name;});}else{var sRes=await sb.from('students').select('id, name').eq('user_id',currentUser.id).in('id',neededIds);if(sRes.data)sRes.data.forEach(function(s3){studentMap[s3.id]=s3.name;});}
var stMap={},order=[];var dd=missDate?parseInt((currentActSelectedDate||m+'-01').split('-')[2],10):null;recs.forEach(function(a){if(!missDate&&!a.date)return;if(!studentMap[a.student_id])return;if(!stMap[a.student_id]){stMap[a.student_id]={};order.push(a.student_id);}var d=missDate?dd:parseInt(a.date.split('-')[2],10);var st=a.status;var code=st==='Hadir'?'H':st==='Sakit'?'S':st==='Izin'?'I':st==='Alpa'?'A':'';if(d>=1&&d<=currentActDaysInMonth)stMap[a.student_id][d]=code;});gsBuild(stMap,order,studentMap);}catch(err){console.error('Load Act:',err);tbody.innerHTML='<tr><td colspan="'+(currentActDaysInMonth+5)+'" class="text-center py-4 text-slate-500">Gagal memuat data.</td></tr>';}}
function updateActRecap(){document.querySelectorAll('#actAttTableBody tr').forEach(function(r){var firstCell=r.querySelector('td[id^="act_att_"]');if(firstCell){var parts=firstCell.id.split('_');var sid=parts[2];var h=0,s=0,i=0,a=0;r.querySelectorAll('td[id^="act_att_"]').forEach(function(c){var v=c.innerText.trim()||'';if(v==='H')h++;else if(v==='S')s++;else if(v==='I')i++;else if(v==='A')a++;});var rh=document.getElementById('act_recap_h_'+sid);if(rh)rh.innerText=h;var rs=document.getElementById('act_recap_s_'+sid);if(rs)rs.innerText=s;var ri=document.getElementById('act_recap_i_'+sid);if(ri)ri.innerText=i;var ra=document.getElementById('act_recap_a_'+sid);if(ra)ra.innerText=a;}});}
async function saveActivityAttendance(actId){var di=document.getElementById('act_att_date');if(!di){showToast('Pilih tanggal!','error');return;}var dv=di.value;if(!dv){showToast('Pilih tanggal!','error');return;}var m=dv.substring(0,7);var tbody=document.getElementById('actAttTableBody');if(!tbody){showToast('Tabel tidak ditemukan.','error');return;}var rows=tbody.querySelectorAll('tr[data-student-row]');if(rows.length===0){showToast('Tidak ada siswa di tabel. Tidak ada yang disimpan.','info');return;}var rowsData=[];rows.forEach(function(r){var sid=r.getAttribute('data-student-row');for(var d=1;d<=currentActDaysInMonth;d++){var c=document.getElementById('act_att_'+sid+'_'+d);var code=c?.innerText.trim()||'';var status='';if(code==='H')status='Hadir';else if(code==='S')status='Sakit';else if(code==='I')status='Izin';else if(code==='A')status='Alpa';if(status){rowsData.push({user_id:currentUser.id,act_id:actId,student_id:sid,status:status,date:m+'-'+String(d).padStart(2,'0')});}}});showToast('Menyimpan...','info');try{var dr=await sb.from('activity_records').delete().eq('act_id',actId).eq('user_id',currentUser.id).gte('date',m+'-01').lte('date',m+'-'+String(currentActDaysInMonth).padStart(2,'0'));if(dr.error){if(String(dr.error.message).toLowerCase().includes('date')||String(dr.error.message).toLowerCase().includes('column')){var dr2=await sb.from('activity_records').delete().eq('act_id',actId).eq('user_id',currentUser.id);}}if(rowsData.length>0){var ir=await sb.from('activity_records').insert(rowsData);if(ir.error)throw ir.error;}showToast('Absensi tersimpan!','success');}catch(err){console.error('Save:',err);showToast('Gagal: '+(err.message||'Unknown'),'error');}await loadActAttendanceData(actId);}
async function startActScanner(actId){openModal('Scan QR Kegiatan',`<div class="flex flex-col items-center space-y-4">
<div class="w-full max-w-lg p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
  <div id="qr-reader" class="relative w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center" style="min-height:320px;height:min(78vw,430px);aspect-ratio:1/1;max-height:52dvh;">
    <div class="absolute top-0 left-0 w-14 h-14 border-t-4 border-l-4 border-white rounded-tl-lg m-2 z-10"></div>
    <div class="absolute top-0 right-0 w-14 h-14 border-t-4 border-r-4 border-white rounded-tr-lg m-2 z-10"></div>
    <div class="absolute bottom-0 left-0 w-14 h-14 border-b-4 border-l-4 border-white rounded-bl-lg m-2 z-10"></div>
    <div class="absolute bottom-0 right-0 w-14 h-14 border-b-4 border-r-4 border-white rounded-br-lg m-2 z-10"></div>
    <div class="text-center text-slate-500 text-sm z-0"><svg class="animate-pulse w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg><span id="qr-status">Memulai kamera...</span></div>
  </div>
</div>
<div id="scan-result" class="w-full text-center min-h-[40px]"></div>
<div class="w-full border-t dark:border-slate-700 pt-4"><p class="text-xs text-slate-500 text-center mb-2">Atau input NIS manual:</p><div class="flex gap-2"><input type="text" id="manual-nis-input" placeholder="Masukkan NIS Siswa" class="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white text-sm"><button onclick="manualInputActNIS('`+actId+`')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Cari</button></div></div>
<button onclick="closeScannerModal()" class="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white px-6 py-2.5 rounded-lg text-sm font-semibold">Tutup Scanner</button>
</div>`);window.currentActId=actId;startScanCamera();}
window.manualInputActNIS=async function(actId){var v=document.getElementById('manual-nis-input').value.trim();if(v){processActQRResult(actId,v);}else{showToast('NIS kosong!','error');}};
async function processActQRResult(actId,text){var n=text;try{var p=JSON.parse(text);if(p.nis)n=p.nis;}catch(e){}var stdRes=await sb.from('students').select('*').eq('user_id',currentUser.id).eq('nis',n).maybeSingle();var std=stdRes.data;if(std){playBeep();var dv=currentActSelectedDate||new Date().toISOString().split('T')[0];try{var recs=await sb.from('activity_records').select('*').eq('act_id',actId).eq('student_id',std.id).eq('user_id',currentUser.id).eq('date',dv).maybeSingle();if(recs.data){await sb.from('activity_records').update({status:'Hadir'}).eq('id',recs.data.id).eq('user_id',currentUser.id);}else{var insRes=await sb.from('activity_records').insert([{user_id:currentUser.id,act_id:actId,student_id:std.id,status:'Hadir',date:dv}]);if(insRes.error&&String(insRes.error.message).toLowerCase().includes('date')){await sb.from('activity_records').insert([{user_id:currentUser.id,act_id:actId,student_id:std.id,status:'Hadir'}]);}}if(!document.getElementById('act_att_'+std.id+'_1')){window.addActStudentRow(std.id,std.name,true);}var day=parseInt(dv.split('-')[2],10);var c=document.getElementById('act_att_'+std.id+'_'+day);if(c){c.innerText='H';c.classList.remove('bg-blue-100','bg-yellow-100','bg-red-100','text-blue-700','text-yellow-700','text-red-700');c.classList.add('bg-green-100','text-green-700');updateActRecap();}var result=document.getElementById('scan-result');if(result){result.innerHTML='<div class="bg-green-100 text-green-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>✅ '+std.name+' berhasil absen!</div>';}setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},1000);}catch(e){console.error('Act Scan:',e);var result=document.getElementById('scan-result');if(result){result.innerHTML='<div class="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold">❌ Gagal menyimpan absensi kegiatan.</div>';}setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},2000);}}else{var result=document.getElementById('scan-result');if(result){result.innerHTML='<div class="bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold">❌ QR tidak dikenal: '+text+'</div>';}setTimeout(function(){var r=document.getElementById('scan-result');if(r)r.innerHTML='';startScanCamera();},2000);}}
async function exportActAttendanceExcel(actId){var results=await Promise.all([DB.get('activity_attendance'),DB.get('students'),DB.get('classes'),DB.get('school_profile')]);var act=results[0].find(function(a){return a.id===actId;});var allStudents=results[1],cl=results[2],prof=results[3][0]||{};var dv=currentActSelectedDate||(act&&act.date)||new Date().toISOString().split('T')[0];var dp2=dv.split('-');var daysInMonth=new Date(parseInt(dp2[0]),parseInt(dp2[1]),0).getDate();var ms=new Date(dv).toLocaleDateString('id-ID',{month:'long',year:'numeric'});var recMap={};try{var recs=await sb.from('activity_records').select('*').eq('act_id',actId).eq('user_id',currentUser.id).gte('date',dp2[0]+'-'+dp2[1]+'-01').lte('date',dp2[0]+'-'+dp2[1]+'-'+String(daysInMonth).padStart(2,'0'));if(recs.data){recs.data.forEach(function(r){if(r.date){var d=parseInt(r.date.split('-')[2],10);recMap[r.student_id+'_'+d]=r.status;}});}}catch(e){console.error('Export Act:',e);}var tbody=document.getElementById('actAttTableBody');if(!tbody)return;var rows=tbody.querySelectorAll('tr[data-student-row]');if(rows.length===0){showToast('Tidak ada siswa di tabel untuk diekspor.','error');return;}var aoa=[];aoa.push([""]);aoa.push(["",prof.kop_line1||"NAMA SEKOLAH","","","",""]);if(prof.kop_line1b)aoa.push(["",prof.kop_line1b,"","",""]);aoa.push(["",prof.kop_line2||prof.name||"","","",""]);aoa.push(["",prof.kop_line3||"","","",""]);aoa.push([""]);aoa.push(["DAFTAR HADIR KEGIATAN"]);aoa.push(["Judul: "+(act?.title||'-'),"Tanggal: "+formatDateID(act?.date),"Bulan: "+ms]);aoa.push([""]);var header=["No","NIS","Nama"];for(var d=1;d<=daysInMonth;d++)header.push("Tgl "+d);header.push("Total H","Total S","Total I","Total A");aoa.push(header);var cnt=1;rows.forEach(function(rowTr){var sid=rowTr.getAttribute('data-student-row');var s=allStudents.find(function(x){return x.id===sid;});if(!s)return;var c=cl.find(function(x){return x.id===s.class_id;});var row=[cnt++,s.nis,s.name];var h=0,sk=0,iz=0,al=0;for(var d=1;d<=daysInMonth;d++){var status=recMap[s.id+'_'+d]||'';var code=status==='Hadir'?'H':status==='Sakit'?'S':status==='Izin'?'I':status==='Alpa'?'A':'';row.push(code);if(code==='H')h++;else if(code==='S')sk++;else if(code==='I')iz++;else if(code==='A')al++;}row.push(h,sk,iz,al);aoa.push(row);});var ws=XLSX.utils.aoa_to_sheet(aoa);var lastCol=3+daysInMonth+3;ws['!merges']=[{s:{r:1,c:1},e:{r:1,c:lastCol}},{s:{r:2,c:1},e:{r:2,c:lastCol}},{s:{r:3,c:1},e:{r:3,c:lastCol}},{s:{r:4,c:1},e:{r:4,c:lastCol}},{s:{r:6,c:0},e:{r:6,c:lastCol}},{s:{r:7,c:0},e:{r:7,c:lastCol}}];ws['!cols']=[{wch:5},{wch:15},{wch:25}];for(var d=1;d<=daysInMonth;d++)ws['!cols'].push({wch:5});var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Absensi Kegiatan');XLSX.writeFile(wb,'Absensi_Kegiatan_'+(act?.title||'')+'.xlsx');showToast('File Excel berhasil diunduh!','success');}
async function printActAttendance(actId){var results=await Promise.all([DB.get('activity_attendance'),DB.get('students'),DB.get('classes'),DB.get('school_profile')]);var act=results[0].find(function(a){return a.id===actId;});var allStudents=results[1],cl=results[2],prof=results[3][0]||{};var dv=currentActSelectedDate||(act&&act.date)||new Date().toISOString().split('T')[0];var dp2=dv.split('-');var daysInMonth=new Date(parseInt(dp2[0]),parseInt(dp2[1]),0).getDate();var ms=new Date(dv).toLocaleDateString('id-ID',{month:'long',year:'numeric'});var recMap={};try{var recs=await sb.from('activity_records').select('*').eq('act_id',actId).eq('user_id',currentUser.id).gte('date',dp2[0]+'-'+dp2[1]+'-01').lte('date',dp2[0]+'-'+dp2[1]+'-'+String(daysInMonth).padStart(2,'0'));if(recs.data){recs.data.forEach(function(r){if(r.date){var d=parseInt(r.date.split('-')[2],10);recMap[r.student_id+'_'+d]=r.status;}});}}catch(e){console.error('Print Act:',e);}var tbody=document.getElementById('actAttTableBody');if(!tbody)return;var rows=tbody.querySelectorAll('tr[data-student-row]');if(rows.length===0){showToast('Tidak ada siswa di tabel untuk dicetak.','error');return;}var dh='';for(var d=1;d<=daysInMonth;d++){dh+='<th style="font-size:8px;padding:2px;border:1px solid #000;width:12px;">'+d+'</th>';}var rh='';var no=1;rows.forEach(function(rowTr){var sid=rowTr.getAttribute('data-student-row');var s=allStudents.find(function(x){return x.id===sid;});if(!s)return;var c=cl.find(function(x){return x.id===s.class_id;});var td='';var h=0,sk=0,iz=0,al=0;for(var d=1;d<=daysInMonth;d++){var status=recMap[s.id+'_'+d]||'';var code=status==='Hadir'?'H':status==='Sakit'?'S':status==='Izin'?'I':status==='Alpa'?'A':'';var col=code==='H'?'green':code==='A'?'red':code===''?'transparent':'orange';td+='<td style="font-size:8px;padding:2px;border:1px solid #000;color:'+col+';font-weight:bold;text-align:center;">'+code+'</td>';if(code==='H')h++;else if(code==='S')sk++;else if(code==='I')iz++;else if(code==='A')al++;}rh+='<tr><td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;">'+(no++)+'</td><td style="padding:4px;border:1px solid #000;font-size:10px;">'+s.name+'</td>'+td+'<td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:green;font-weight:bold;">'+h+'</td><td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:blue;font-weight:bold;">'+sk+'</td><td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:orange;font-weight:bold;">'+iz+'</td><td style="padding:4px;border:1px solid #000;text-align:center;font-size:10px;color:red;font-weight:bold;">'+al+'</td></tr>';});var kh=await generateKopHTML();openPrintPreview('<div style="font-family:Arial;color:#000;">'+kh+'<h3 style="text-align:center;margin:20px 0 5px;">DAFTAR HADIR KEGIATAN</h3><p style="text-align:center;margin:0 0 5px;font-size:12px;font-weight:bold;">'+(act?.title||'-')+'</p><p style="text-align:center;margin:0 0 15px;font-size:12px;">Tanggal: '+formatDateID(act?.date)+' | Bulan: '+ms+'</p><table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr style="background:#eee;"><th rowspan="2" style="padding:5px;border:1px solid #000;">No</th><th rowspan="2" style="padding:5px;border:1px solid #000;">Nama</th><th colspan="'+daysInMonth+'" style="border:1px solid #000;padding:4px;">Tanggal</th><th rowspan="2" style="padding:5px;border:1px solid #000;color:green;">H</th><th rowspan="2" style="padding:5px;border:1px solid #000;color:blue;">S</th><th rowspan="2" style="padding:5px;border:1px solid #000;color:orange;">I</th><th rowspan="2" style="padding:5px;border:1px solid #000;color:red;">A</th></tr><tr style="background:#eee;">'+dh+'</tr></thead><tbody>'+rh+'</tbody></table></div>');}
async function renderGrades(){
  var results=await Promise.all([DB.get('students'),DB.get('subjects'),DB.get('grades')]);
  var st=results[0],sub=results[1],gr=results[2];
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-orange-600 to-amber-600 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">PENILAIAN SISWA</h3><p class="text-orange-100 text-sm">Daftar Nilai & Hasil Belajar Siswa</p></div>'+
        '</div>'+
        '<button onclick="gradeForm()" class="bg-white text-orange-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-orange-50 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Input Nilai</button>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3">Nama Siswa</th>'+
                '<th class="px-3 py-3">Mata Pelajaran</th>'+
                '<th class="px-3 py-3">Jenis Penilaian</th>'+
                '<th class="px-3 py-3 text-center">Nilai</th>'+
                '<th class="px-3 py-3 text-center">Predikat</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (gr.length?gr.map(function(g,i){
                var sd=st.find(function(x){return x.id===g.student_id;});
                var su=sub.find(function(x){return x.id===g.subject_id;});
                var predikat=g.score>=90?'A':g.score>=80?'B':g.score>=70?'C':'D';
                var predikatColor=g.score>=90?'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300':g.score>=80?'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300':g.score>=70?'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300':'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
                var typeIcon=g.type==='Tugas'?'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2':g.type==='PTS'?'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z':g.type==='PAS'?'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z':'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+(sd?.name||'-')+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300">'+(su?.name||'-')+'</td>'+
                  '<td class="px-3 py-3"><span class="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-md text-xs font-medium"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="'+typeIcon+'"/></svg>'+g.type+'</span></td>'+
                  '<td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-base font-extrabold '+(g.score>=75?'text-green-600 dark:text-green-400':'text-red-600 dark:text-red-400')+'">'+g.score+'</span></td>'+
                  '<td class="px-3 py-3 text-center"><span class="inline-flex items-center justify-center w-8 h-8 rounded-full '+predikatColor+' text-sm font-extrabold">'+predikat+'</span></td>'+
                  '<td class="px-3 py-3">'+
                    '<div class="flex items-center justify-center gap-1.5">'+
                      '<button onclick="gradeForm(\''+g.id+'\')" class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition" title="Edit Nilai"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
                      '<button onclick="deleteData(\'grades\',\''+g.id+'\',renderGrades)" class="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition" title="Hapus Nilai"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg></button>'+
                    '</div>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="7" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg><p class="text-sm">Belum ada nilai. Klik "Input Nilai" untuk memulai.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function gradeForm(id){var results=await Promise.all([DB.get('students'),DB.get('subjects'),DB.get('grades')]);var st=results[0],sub=results[1];var g=null;if(id){g=results[2].find(function(x){return x.id===id;});}openModal('Input Nilai','<form id="gradeForm" class="space-y-4"><div><label class="block text-sm mb-1">Siswa</label><select id="g_student" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+st.map(function(s){return '<option value="'+s.id+'" '+(g?.student_id==s.id?'selected':'')+'>'+s.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Mapel</label><select id="g_subject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+sub.map(function(s){return '<option value="'+s.id+'" '+(g?.subject_id==s.id?'selected':'')+'>'+s.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Tipe</label><select id="g_type" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option '+(g?.type=='Tugas'?'selected':'')+'>Tugas</option><option '+(g?.type=='Ulangan Harian'?'selected':'')+'>Ulangan Harian</option><option '+(g?.type=='PTS'?'selected':'')+'>PTS</option><option '+(g?.type=='PAS'?'selected':'')+'>PAS</option></select></div><div><label class="block text-sm mb-1">Nilai</label><input type="number" id="g_score" value="'+(g?.score||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('gradeForm').onsubmit=async function(e){e.preventDefault();var p={student_id:document.getElementById('g_student').value,subject_id:document.getElementById('g_subject').value,type:document.getElementById('g_type').value,score:parseInt(document.getElementById('g_score').value)};await saveData('grades',p,id);closeModal();renderGrades();};}
async function renderAssignments(){var as=await DB.get('assignments');document.getElementById('content').innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl"><div class="flex justify-between mb-4"><h3 class="font-bold text-slate-800 dark:text-white">Daftar Tugas</h3><button onclick="assignmentForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Buat Tugas</button></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4">'+(as.length?as.map(function(a){return '<div class="p-4 border dark:border-slate-700 rounded-lg"><h4 class="font-bold text-slate-800 dark:text-white">'+a.title+'</h4><p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Deadline: '+formatDateID(a.deadline)+'</p><p class="text-sm mt-2 text-slate-700 dark:text-slate-300">'+a.description+'</p><div class="mt-3 flex gap-2"><button onclick="assignmentForm(\''+a.id+'\')" class="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded">Edit</button><button onclick="deleteData(\'assignments\',\''+a.id+'\',renderAssignments)" class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded">Hapus</button></div></div>';}).join(''):'<div class="col-span-3 text-center py-8 text-slate-500">Belum ada tugas.</div>')+'</div></div>';}
async function assignmentForm(id){var results=await Promise.all([DB.get('classes'),DB.get('subjects'),DB.get('assignments')]);var cl=results[0],sub=results[1];var a=null;if(id){a=results[2].find(function(x){return x.id===id;});}openModal('Buat Tugas','<form id="assignmentForm" class="space-y-4"><div><label class="block text-sm mb-1">Judul</label><input type="text" id="a_title" value="'+(a?.title||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Deskripsi</label><textarea id="a_desc" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(a?.description||'')+'</textarea></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm mb-1">Mapel</label><select id="a_subject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+sub.map(function(s){return '<option value="'+s.id+'" '+(a?.subject_id==s.id?'selected':'')+'>'+s.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Kelas</label><select id="a_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+cl.map(function(c){return '<option value="'+c.id+'" '+(a?.class_id==c.id?'selected':'')+'>'+c.name+'</option>';}).join('')+'</select></div></div><div><label class="block text-sm mb-1">Deadline</label><input type="date" id="a_deadline" value="'+(a?.deadline||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" style="color-scheme:light;"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('assignmentForm').onsubmit=async function(e){e.preventDefault();var p={title:document.getElementById('a_title').value,description:document.getElementById('a_desc').value,subject_id:document.getElementById('a_subject').value,class_id:document.getElementById('a_class').value,deadline:document.getElementById('a_deadline').value};await saveData('assignments',p,id);closeModal();renderAssignments();};}
async function renderMateri(){var results=await Promise.all([DB.get('materi'),DB.get('subjects'),DB.get('classes')]);var mt=results[0],sub=results[1],cl=results[2];document.getElementById('content').innerHTML='<div class="bg-white dark:bg-slate-800 p-6 rounded-xl"><div class="flex justify-between mb-4"><h3 class="font-bold text-slate-800 dark:text-white">Materi Pembelajaran</h3><button onclick="materiForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Tambah Materi</button></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4">'+(mt.length?mt.map(function(m){var su=sub.find(function(x){return x.id===m.subject_id;});var c=cl.find(function(x){return x.id===m.class_id;});return '<div class="p-4 border dark:border-slate-700 rounded-lg"><h4 class="font-bold text-slate-800 dark:text-white">'+m.title+'</h4><p class="text-xs text-slate-500 dark:text-slate-400 mt-1">'+(su?.name||'')+' | '+(c?.name||'')+'</p><p class="text-sm mt-2 text-slate-700 dark:text-slate-300">'+m.description+'</p><a href="'+m.link+'" target="_blank" class="mt-3 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded inline-block">Buka Materi</a><div class="mt-3 flex gap-2"><button onclick="materiForm(\''+m.id+'\')" class="text-xs text-blue-500">Edit</button><button onclick="deleteData(\'materi\',\''+m.id+'\',renderMateri)" class="text-xs text-red-500">Hapus</button></div></div>';}).join(''):'<div class="col-span-3 text-center py-8 text-slate-500">Belum ada materi.</div>')+'</div></div>';}
async function materiForm(id){var results=await Promise.all([DB.get('classes'),DB.get('subjects'),DB.get('materi')]);var cl=results[0],sub=results[1];var m=null;if(id){m=results[2].find(function(x){return x.id===id;});}openModal('Tambah Materi','<form id="materiForm" class="space-y-4"><div><label class="block text-sm mb-1">Judul</label><input type="text" id="m_title" value="'+(m?.title||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" required></div><div><label class="block text-sm mb-1">Deskripsi</label><textarea id="m_desc" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+(m?.description||'')+'</textarea></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm mb-1">Mapel</label><select id="m_subject" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+sub.map(function(s){return '<option value="'+s.id+'" '+(m?.subject_id==s.id?'selected':'')+'>'+s.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Kelas</label><select id="m_class" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+cl.map(function(c){return '<option value="'+c.id+'" '+(m?.class_id==c.id?'selected':'')+'>'+c.name+'</option>';}).join('')+'</select></div></div><div><label class="block text-sm mb-1">Link</label><input type="url" id="m_link" value="'+(m?.link||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('materiForm').onsubmit=async function(e){e.preventDefault();var p={title:document.getElementById('m_title').value,description:document.getElementById('m_desc').value,subject_id:document.getElementById('m_subject').value,class_id:document.getElementById('m_class').value,link:document.getElementById('m_link').value};await saveData('materi',p,id);closeModal();renderMateri();};}
async function renderKeuangan(){
  var results=await Promise.all([DB.get('keuangan'),DB.get('students')]);
  var kn=results[0],st=results[1];
  var ts=kn.length;
  var lc=kn.filter(function(k){return k.status==='Lunas';}).length;
  var bc=kn.filter(function(k){return k.status!=='Lunas';}).length;
  var tp=kn.filter(function(k){return k.status==='Lunas';}).reduce(function(s,k){return s+(k.amount||0);},0);
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">'+statCard('Total Tagihan SPP',ts,'from-blue-500 to-indigo-700','M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z','Tagihan')+statCard('SPP Lunas',lc,'from-green-500 to-emerald-700','M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z','Pembayaran')+statCard('SPP Belum Lunas',bc,'from-red-500 to-rose-700','M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z','Tunggakan')+statCard('Total Pemasukan','Rp '+tp.toLocaleString('id-ID'),'from-amber-500 to-orange-600','M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V6m0 2c-1.11 0-2.08.402-2.599 1M3 12h18M12 18v-1m0 1v-1','Total')+'</div>'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-cyan-600 to-blue-700 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V6m0 2c-1.11 0-2.08.402-2.599 1M3 12h18M12 18v-1m0 1v-1"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">KEUANGAN SPP</h3><p class="text-cyan-100 text-sm">Pembayaran SPP & Keuangan Siswa</p></div>'+
        '</div>'+
        '<button onclick="keuanganForm()" class="bg-white text-cyan-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-cyan-50 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Catat Pembayaran</button>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left whitespace-nowrap">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3">Nama Siswa</th>'+
                '<th class="px-3 py-3">Bulan</th>'+
                '<th class="px-3 py-3 text-right">Jumlah</th>'+
                '<th class="px-3 py-3">Jatuh Tempo</th>'+
                '<th class="px-3 py-3 text-center">Status</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (kn.length?kn.map(function(k,i){
                var sd=st.find(function(x){return x.id===k.student_id;});
                var isLunas=k.status==='Lunas';
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+(sd?.name||'-')+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300"><span class="inline-flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'+k.month+'</span></td>'+
                  '<td class="px-3 py-3 text-right font-bold text-slate-800 dark:text-white">Rp '+(k.amount||0).toLocaleString('id-ID')+'</td>'+
                  '<td class="px-3 py-3 text-slate-600 dark:text-slate-300">'+formatDateID(k.duedate)+'</td>'+
                  '<td class="px-3 py-3 text-center">'+(isLunas?'<span class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-md text-xs font-semibold"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Lunas</span>':'<span class="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-md text-xs font-semibold"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Belum Bayar</span>')+'</td>'+
                  '<td class="px-3 py-3">'+
                    '<div class="flex items-center justify-center gap-1.5">'+
                      (k.status!=='Lunas'?'<button onclick="confirmPayment(\''+k.id+'\')" class="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition" title="Lunasi Pembayaran"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></button>':'')+
                      '<button onclick="keuanganForm(\''+k.id+'\')" class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition" title="Edit Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>'+
                      '<button onclick="deleteData(\'keuangan\',\''+k.id+'\',renderKeuangan)" class="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition" title="Hapus Data"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg></button>'+
                    '</div>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="7" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V6m0 2c-1.11 0-2.08.402-2.599 1M3 12h18M12 18v-1m0 1v-1"/></svg><p class="text-sm">Belum ada data pembayaran SPP.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function keuanganForm(id){var results=await Promise.all([DB.get('students'),DB.get('keuangan')]);var st=results[0];var k=null;if(id){k=results[1].find(function(x){return x.id===id;});}openModal('Catat SPP','<form id="keuanganForm" class="space-y-4"><div><label class="block text-sm mb-1">Siswa</label><select id="k_student" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">'+st.map(function(s){return '<option value="'+s.id+'" '+(k?.student_id==s.id?'selected':'')+'>'+s.name+'</option>';}).join('')+'</select></div><div><label class="block text-sm mb-1">Bulan</label><input type="text" id="k_month" value="'+(k?.month||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" placeholder="Contoh: Agustus 2024"></div><div><label class="block text-sm mb-1">Jumlah Tagihan</label><input type="number" id="k_amount" value="'+(k?.amount||150000)+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"></div><div><label class="block text-sm mb-1">Tanggal Jatuh Tempo</label><input type="date" id="k_duedate" value="'+(k?.duedate||'')+'" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" style="color-scheme:light;"></div><div><label class="block text-sm mb-1">Status</label><select id="k_status" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"><option '+(k?.status=='Belum Bayar'?'selected':'')+'>Belum Bayar</option><option '+(k?.status=='Lunas'?'selected':'')+'>Lunas</option></select></div><button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Simpan</button></form>');document.getElementById('keuanganForm').onsubmit=async function(e){e.preventDefault();var av=document.getElementById('k_amount').value;var p={student_id:document.getElementById('k_student').value,month:document.getElementById('k_month').value,amount:av?parseInt(av):0,duedate:document.getElementById('k_duedate').value,status:document.getElementById('k_status').value};await saveData('keuangan',p,id);closeModal();renderKeuangan();};}
async function confirmPayment(id){await DB.update('keuangan',id,{status:'Lunas'});showToast('Lunas!','success');renderKeuangan();}
async function renderRapor(){
  var st=await DB.get('students');
  document.getElementById('content').innerHTML='<div class="space-y-6">'+
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden slide-up">'+
      '<div class="bg-gradient-to-r from-indigo-600 to-purple-700 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">'+
        '<div class="flex items-center gap-3 text-white">'+
          '<div class="bg-white/20 p-2.5 rounded-xl"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>'+
          '<div><h3 class="font-bold text-xl">CETAK RAPOR</h3><p class="text-indigo-100 text-sm">Pilih Siswa untuk Mencetak Rapor</p></div>'+
        '</div>'+
        '<div class="flex flex-wrap items-center gap-2"><div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg><span class="font-semibold">'+st.length+'</span> Siswa Terdaftar</div><button onclick="renderAnalisisNilai()" class="bg-white hover:bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow transition">📊 Analisis Nilai</button><button onclick="printAllRapor()" '+(st.length?'':'disabled')+' class="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition">🖨️ Cetak Semua Rapor</button></div>'+
      '</div>'+
      '<div class="p-5">'+
        '<div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">'+
          '<table class="w-full text-sm text-left">'+
            '<thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">'+
              '<tr>'+
                '<th class="px-3 py-3 text-center">No</th>'+
                '<th class="px-3 py-3">NIS</th>'+
                '<th class="px-3 py-3">Nama Siswa</th>'+
                '<th class="px-3 py-3 text-center">Aksi</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody class="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">'+
              (st.length?st.map(function(s,i){
                return '<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">'+
                  '<td class="px-3 py-3 text-center text-slate-500 font-medium">'+(i+1)+'</td>'+
                  '<td class="px-3 py-3 font-mono text-slate-600 dark:text-slate-300">'+s.nis+'</td>'+
                  '<td class="px-3 py-3 font-semibold text-slate-800 dark:text-white">'+s.name+'</td>'+
                  '<td class="px-3 py-3 text-center">'+
                    '<button onclick="printRapor(\''+s.id+'\')" class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>Cetak Rapor</button>'+
                  '</td>'+
                '</tr>';
              }).join(''):'<tr><td colspan="4" class="text-center py-12 text-slate-500"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg><p class="text-sm">Belum ada data siswa.</p></div></td></tr>')+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}
async function buildRaporHTML(studentId,results){
  var student=(results[0]||[]).find(function(s){return String(s.id)===String(studentId);});
  if(!student)return '';
  var classes=(results[1]||[]).find(function(c){return String(c.id)===String(student.class_id);});
  var grades=(results[2]||[]).filter(function(g){return String(g.student_id)===String(studentId)&&g.score!==null&&g.score!==''&&Number.isFinite(Number(g.score));});
  var subjects=results[3]||[], profile=(results[4]||[])[0]||{};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var gradeRows='', totalScore=0,totalSubjects=0,passed=0,below=[];
  subjects.forEach(function(sub){
    var sg=grades.filter(function(g){return String(g.subject_id)===String(sub.id);});
    if(!sg.length)return;
    var avg=sg.reduce(function(sum,g){return sum+Number(g.score);},0)/sg.length;
    var rounded=Math.round(avg*10)/10, kkm=Number(sub.kkm), hasKkm=sub.kkm!==null&&sub.kkm!==''&&Number.isFinite(kkm);
    var predikat=rounded>=90?'A':rounded>=80?'B':rounded>=70?'C':'D';
    var tuntas=!hasKkm||rounded>=kkm;
    if(tuntas)passed++; else below.push({name:sub.name,score:rounded,kkm:kkm});
    gradeRows+='<tr><td style="padding:8px;border:1px solid #000;">'+esc(sub.name)+'</td><td style="padding:8px;border:1px solid #000;text-align:center;">'+(hasKkm?esc(sub.kkm):'-')+'</td><td style="padding:8px;border:1px solid #000;text-align:center;">'+rounded+'</td><td style="padding:8px;border:1px solid #000;text-align:center;">'+predikat+'</td><td style="padding:8px;border:1px solid #000;text-align:center;color:'+(tuntas?'#166534':'#b91c1c')+';font-weight:bold;">'+(tuntas?'Tuntas':'Perlu bimbingan')+'</td></tr>';
    totalScore+=avg;totalSubjects++;
  });
  var finalAvg=totalSubjects?(totalScore/totalSubjects).toFixed(1):'0.0';
  var overallPred=Number(finalAvg)>=90?'A':Number(finalAvg)>=80?'B':Number(finalAvg)>=70?'C':'D';
  var note=totalSubjects===0?'Belum cukup data nilai untuk membuat catatan capaian.':below.length===0?'Hasil belajar pada seluruh mata pelajaran yang memiliki KKM telah mencapai batas ketuntasan. Pertahankan konsistensi belajar.':'Perlu pendampingan pada mata pelajaran: '+below.map(function(x){return esc(x.name)+' ('+x.score+', KKM '+x.kkm+')';}).join(', ')+'. Guru dapat memberi umpan balik dan latihan tambahan sesuai kebutuhan siswa.';
  var kopHTML=await generateKopHTML();
  var dateStr=new Date().toLocaleDateString('id-ID',{dateStyle:'long'});
  return '<div class="rapor-page" style="font-family:Arial;color:#000;page-break-after:always;break-after:page;">'+kopHTML+
    '<h3 style="text-align:center;margin:20px 0;">RAPOR SISWA</h3>'+
    '<table class="rapor-info-table" style="width:100%;margin-bottom:20px;"><tr><td style="width:100px;">Nama</td><td style="width:200px;">: '+esc(student.name||'-')+'</td><td style="width:100px;">Kelas</td><td>: '+esc(classes?.name||'-')+'</td></tr><tr><td>NIS</td><td>: '+esc(student.nis||'-')+'</td><td>Semester</td><td>: '+esc(profile.semester||'-')+'</td></tr></table>'+
    '<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#eee;"><th style="padding:8px;border:1px solid #000;">Mapel</th><th style="padding:8px;border:1px solid #000;">KKM</th><th style="padding:8px;border:1px solid #000;">Nilai Rata-rata</th><th style="padding:8px;border:1px solid #000;">Predikat</th><th style="padding:8px;border:1px solid #000;">Ketuntasan</th></tr></thead><tbody>'+(gradeRows||'<tr><td colspan="5" style="text-align:center;padding:10px;border:1px solid #000;">Belum ada nilai</td></tr>')+'</tbody><tfoot><tr><td colspan="2" style="padding:8px;border:1px solid #000;text-align:right;">Rata-rata semua mapel:</td><td style="padding:8px;border:1px solid #000;text-align:center;font-weight:bold;">'+finalAvg+'</td><td style="padding:8px;border:1px solid #000;text-align:center;font-weight:bold;">'+overallPred+'</td><td style="padding:8px;border:1px solid #000;text-align:center;">'+passed+'/'+totalSubjects+' tuntas</td></tr></tfoot></table>'+
    '<div style="margin-top:18px;padding:12px;border:1px solid #777;break-inside:avoid;"><strong>Catatan capaian belajar otomatis</strong><p style="margin:8px 0 0;line-height:1.5;">'+note+'</p><p style="font-size:10px;margin:8px 0 0;color:#444;">Catatan dibuat berdasarkan rata-rata nilai yang tersimpan dan KKM mata pelajaran jika tersedia. Guru tetap perlu meninjau sebelum rapor disahkan.</p></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:40px;font-size:12px;break-inside:avoid;"><div style="text-align:center;width:45%;"><p>Mengetahui,</p><p>Kepala Sekolah</p><br><br><br><p style="font-weight:bold;text-decoration:underline;">'+esc(profile.principal||'-')+'</p><p>NIP. '+esc(profile.principal_nip||'-')+'</p></div><div style="text-align:center;width:45%;"><p>'+esc(dateStr)+'</p><p>Wali Kelas</p><br><br><br><p style="font-weight:bold;text-decoration:underline;">'+esc(classes?.homeroom||currentUser.name||'-')+'</p></div></div></div>';
}

async function printRapor(studentId){try{var results=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('grades'),DB.get('subjects'),DB.get('school_profile')]);var html=await buildRaporHTML(studentId,results);if(!html){showToast('Data siswa tidak ditemukan.','error');return;}html=html.replace('page-break-after:always;break-after:page;','page-break-after:auto;break-after:auto;');openPrintPreview(html);}catch(e){console.error('Cetak rapor gagal:',e);showToast('Gagal menyiapkan rapor.','error');}}
async function printAllRapor(){try{var results=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('grades'),DB.get('subjects'),DB.get('school_profile')]);var students=results[0]||[];if(!students.length){showToast('Belum ada data siswa untuk dicetak.','error');return;}var pages=[];for(var i=0;i<students.length;i++){var page=await buildRaporHTML(students[i].id,results);if(page)pages.push(page);}if(!pages.length){showToast('Rapor tidak dapat dibuat.','error');return;}openPrintPreview(pages.join(''));}catch(e){console.error('Cetak semua rapor gagal:',e);showToast('Gagal menyiapkan semua rapor.','error');}}

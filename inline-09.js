
// Helper QR kartu: menempatkan logo kecil di tengah QR dengan latar putih agar mudah dipindai.
function addSchoolLogoToCardQR(qrTarget,logoUrl){
 if(!qrTarget||!logoUrl)return;
 var finish=function(){
  if(!qrTarget.isConnected)return;
  var existing=qrTarget.querySelector('img.qr-school-logo');
  if(existing)existing.remove();
  var logo=document.createElement('img');
  logo.className='qr-school-logo';logo.alt='Logo sekolah pada QR';logo.src=logoUrl;
  logo.onerror=function(){logo.remove();};
  qrTarget.appendChild(logo);
 };
 // QRCode.js membuat canvas atau img secara sinkron.
 if(qrTarget.querySelector('canvas,img'))finish();
 else setTimeout(finish,150);
}
function validateCardImageFile(file){
 if(!file)return false;
 if(!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type||'')){
  showToast('Gunakan gambar PNG, JPG, atau WebP.','error');return false;
 }
 if(file.size>5*1024*1024){
  showToast('Ukuran gambar maksimal 5 MB.','error');return false;
 }
 return true;
}
/* ===== [BARU] OTOMATIS TRANSPARANKAN LATAR TTD & STEMPEL =====
   Format apa pun (JPG/JPEG/PNG/WebP) dibaca lewat canvas: semua piksel
   putih / mendekati putih dibuat TRANSPARAN 100% (dengan gradasi halus di
   tepi agar tidak ada kotak putih tersisa), sementara tinta/teks/garis TTD
   dan stempel tetap solid sehingga terlihat jelas di atas kartu maupun rapor.
   Hasil akhir selalu PNG agar transparansi tersimpan. Jika proses gagal
   (browser lama dsb.), gambar asli dipakai apa adanya — tidak merusak upload. */
function gsAutoTransparanTTD(dataUrl){
 return new Promise(function(resolve){
  var img=new Image(),done=false;
  var finish=function(v){if(!done){done=true;resolve(v||dataUrl);}};
  var to=setTimeout(function(){finish(dataUrl);},15000);
  img.onload=function(){
   clearTimeout(to);
   try{
    var iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;
    var sc=Math.min(1,1000/Math.max(iw,ih)); /* sisi maks 1000px agar ringan & cepat */
    var w=Math.max(1,Math.round(iw*sc)),h=Math.max(1,Math.round(ih*sc));
    var cv=document.createElement('canvas');cv.width=w;cv.height=h;
    var ctx=cv.getContext('2d',{willReadFrequently:true});
    if(!ctx){finish(dataUrl);return;}
    ctx.drawImage(img,0,0,w,h);
    var d=ctx.getImageData(0,0,w,h),px=d.data,i,r,g,b,mn,a;
    for(i=0;i<px.length;i+=4){
     r=px[i];g=px[i+1];b=px[i+2];
     if(px[i+3]<250)continue; /* piksel sudah transparan: biarkan (idempoten) */
     mn=Math.min(r,g,b); /* 255 = putih murni, makin kecil makin jauh dari putih */
     if(mn>=245)a=0;                                /* latar putih -> transparan 100% */
     else if(mn>=200)a=Math.round((245-mn)/45*255); /* tepi/sisa noise JPG -> pudar halus */
     else a=255;                                    /* tinta/teks/garis -> tetap solid */
     if(a<255){
      px[i+3]=a;
      if(a===0){px[i]=0;px[i+1]=0;px[i+2]=0;}
     }
    }
    ctx.putImageData(d,0,0);
    finish(cv.toDataURL('image/png'));
   }catch(e){finish(dataUrl);}
  };
  img.onerror=function(){clearTimeout(to);finish(dataUrl);};
  img.crossOrigin='anonymous';img.src=dataUrl;
 });
}
/* Ubah data URL menjadi Blob agar bisa diunggah ke Storage sebagai PNG */
function gsDataTTDBlob(dataUrl){
 try{
  var p=dataUrl.split(','),mime=(p[0].match(/:(.*?);/)||[])[1]||'image/png',bin=atob(p[1]),n=bin.length,arr=new Uint8Array(n);
  while(n--)arr[n]=bin.charCodeAt(n);
  return new Blob([arr],{type:mime});
 }catch(e){return null;}
}
async function printStudentCard(id){var results=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('school_profile')]);var s=results[0].find(function(x){return String(x.id)===String(id);});if(!s){showToast('Data siswa tidak ditemukan.','error');return;}var cl=results[1].find(function(c){return String(c.id)===String(s.class_id);})||{},prof=results[2][0]||{};var ls=prof.principal_sign||'';var stamp=prof.principal_stamp||'';var ll=prof.logo_left||'';var qid='cardPreviewQR_'+String(s.id).replace(/[^a-zA-Z0-9_-]/g,'');openModal('Cetak Kartu Siswa','<div class="space-y-2"><div class="grid grid-cols-3 gap-2"><div class="min-w-0"><label class="block text-[10px] mb-1 font-semibold truncate">Logo Sekolah</label><label class="flex items-center justify-center w-full h-7 px-1 text-[9px] font-medium text-indigo-700 bg-indigo-50 rounded cursor-pointer border border-indigo-200"><span>+ Logo</span><input type="file" id="cardLogoInput" accept="image/*" class="hidden"></label><p id="cardLogoName" class="text-[8px] text-slate-400 mt-0.5 truncate">'+(ll?'Tersimpan':'Belum ada')+'</p></div><div class="min-w-0"><label class="block text-[10px] mb-1 font-semibold truncate">TTD Kepala Sekolah</label><label class="flex items-center justify-center w-full h-7 px-1 text-[9px] font-medium text-green-700 bg-green-50 rounded cursor-pointer border border-green-200"><span>+ TTD</span><input type="file" id="cardSignInput" accept="image/*" class="hidden"></label><p id="cardSignName" class="text-[8px] text-slate-400 mt-0.5 truncate">'+(ls?'Tersimpan':'Belum ada')+'</p></div><div class="min-w-0"><label class="block text-[10px] mb-1 font-semibold truncate">Stempel</label><label class="flex items-center justify-center w-full h-7 px-1 text-[9px] font-medium text-rose-700 bg-rose-50 rounded cursor-pointer border border-rose-200"><span>+ Stempel</span><input type="file" id="cardStampInput" accept="image/*" class="hidden"></label><p id="cardStampName" class="text-[8px] text-slate-400 mt-0.5 truncate">'+((prof.principal_stamp)?'Tersimpan':'Belum ada')+'</p></div><div class="col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-1.5"><div class="flex items-center gap-2"><label for="cardColorInput" class="text-[10px] font-semibold text-slate-700 whitespace-nowrap">Warna utama</label><input type="color" id="cardColorInput" value="#00a65a" title="Warna utama kartu" class="w-8 h-7 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"><label for="cardGradientInput" class="text-[10px] font-semibold text-slate-700 whitespace-nowrap ml-1">Gradasi</label><input type="color" id="cardGradientInput" value="#8bc943" title="Warna kedua gradasi" class="w-8 h-7 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"><label for="cardLineColorInput" class="text-[10px] font-semibold text-slate-700 whitespace-nowrap ml-1">Garis</label><input type="color" id="cardLineColorInput" value="#16804a" title="Warna garis tepi kartu dan garis judul" class="w-8 h-7 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"><label for="cardTitleColorInput" class="text-[10px] font-semibold text-slate-700 whitespace-nowrap ml-1">Judul</label><input type="color" id="cardTitleColorInput" value="#16804a" title="Warna teks KARTU PELAJAR" class="w-8 h-7 p-0.5 rounded cursor-pointer border border-slate-300 shrink-0"><span class="text-[9px] text-slate-500">Pratinjau langsung</span></div><div id="cardColorPresets" class="flex flex-wrap gap-1.5 mt-2"><button type="button" title="Hijau" data-card-color="#00a65a" style="background:#00a65a;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button><button type="button" title="Biru" data-card-color="#2563eb" style="background:#2563eb;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button><button type="button" title="Merah" data-card-color="#dc2626" style="background:#dc2626;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button><button type="button" title="Ungu" data-card-color="#7c3aed" style="background:#7c3aed;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button><button type="button" title="Navy" data-card-color="#123c69" style="background:#123c69;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button><button type="button" title="Oranye" data-card-color="#ea580c" style="background:#ea580c;width:17px;height:17px;border-radius:50%;border:1px solid #64748b"></button></div></div></div><div class="mt-3 mb-3 flex gap-2 sticky top-0 z-10 bg-white dark:bg-slate-800 py-2"><button onclick="printCardNow(\''+s.id+'\')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex-1 font-semibold">🖨️ Cetak Kartu</button><button onclick="closeModal()" class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Tutup</button></div><div id="printableCard" class="student-card-face" style="margin:0 auto;flex-shrink:0"><div class="student-card-front-head">'+(ll?'<img id="cardLogo" src="'+ll+'" alt="Logo sekolah">':'<div id="cardLogo" style="width:12mm;height:12mm;background:#fff;color:#1e3a8a;display:flex;align-items:center;justify-content:center;border-radius:2mm;font-size:5pt">LOGO</div>')+'<div><div style="font-size:9pt">'+(prof.name||'NAMA SEKOLAH')+'</div><div>'+(prof.address||prof.school_address||'')+'</div></div></div><div class="student-card-front-body">'+(s.photo_url?'<img class="student-card-front-photo" src="'+s.photo_url+'" alt="Foto siswa">':'<div class="student-card-front-photo" style="display:flex;align-items:center;justify-content:center;text-align:center;font-size:6pt">FOTO SISWA</div>')+'<div class="student-card-front-info"><strong class="student-card-identity-title">KARTU PELAJAR</strong><div class="student-card-data-row"><span>Nama Siswa</span><b>: '+s.name+'</b></div><div class="student-card-data-row"><span>NIS / NISN</span><b>: '+(s.nis||s.nisn||'-')+'</b></div><div class="student-card-data-row"><span>Tanggal Lahir</span><b>: '+(s.birthplace||'-')+', '+formatDateID(s.birthdate)+'</b></div><div class="student-card-data-row"><span>Alamat</span><b>: '+(s.address||'-')+'</b></div></div><div class="student-card-bottom"><div id="'+qid+'" class="student-card-front-qr"></div><div class="student-card-sign">Kepala Sekolah<div class="student-card-sign-assets">'+(ls?'<img id="cardSign" src="'+ls+'" alt="Tanda tangan">':'<span id="cardSign" style="width:12mm;height:7mm"></span>')+(stamp?'<img id="cardStamp" class="student-card-stamp" src="'+stamp+'" alt="Stempel sekolah">':'<span id="cardStamp" style="display:none"></span>')+'</div><div style="border-top:.3mm solid #333;padding-top:1mm;font-weight:bold">'+(prof.principal||'-')+'</div><div>NIP. '+(prof.principal_nip||'-')+'</div></div></div></div></div></div>');try{var qrTarget=document.getElementById(qid);if(qrTarget&&typeof QRCode!=="undefined"){qrTarget.innerHTML="";new QRCode(qrTarget,{text:JSON.stringify({jenis:"KARTU PELAJAR",nama:s.name||"",nis:s.nis||s.nisn||"",kelas:(cl&&cl.name)||""}),width:180,height:180,correctLevel:QRCode.CorrectLevel.M});var previewLogo=document.getElementById("cardLogo");if(previewLogo&&previewLogo.src)addSchoolLogoToCardQR(qrTarget,previewLogo.src);}}catch(qrError){console.error("QR pratinjau kartu:",qrError);}var previewCard=document.getElementById("printableCard");var colorInput=document.getElementById("cardColorInput");var gradientInput=document.getElementById("cardGradientInput");var lineColorInput=document.getElementById("cardLineColorInput");var titleColorInput=document.getElementById("cardTitleColorInput");var savedCardColor=localStorage.getItem("guruSmartStudentCardColor")||"#00a65a";var savedGradientColor=localStorage.getItem("guruSmartStudentCardGradient")||"#8bc943";var savedLineColor=localStorage.getItem("guruSmartStudentCardLineColor")||"#16804a";var savedTitleColor=localStorage.getItem("guruSmartStudentCardTitleColor")||"#16804a";function applyStudentCardColors(){if(!previewCard)return;var main=(colorInput&&colorInput.value)||savedCardColor||"#00a65a";var grad=(gradientInput&&gradientInput.value)||savedGradientColor||"#8bc943";[previewCard].concat(Array.from(document.querySelectorAll("#printArea .student-card-face"))).forEach(function(face){face.style.setProperty("--card-color",main,"important");face.style.setProperty("--card-gradient-end",grad,"important");var line=(lineColorInput&&lineColorInput.value)||savedLineColor;var title=(titleColorInput&&titleColorInput.value)||savedTitleColor;face.style.setProperty("--card-line-color",line,"important");face.style.setProperty("--card-title-color",title,"important");face.style.borderColor=line;face.querySelectorAll(".student-card-front-head:after").forEach(function(el){el.style.setProperty("background",line,"important");});face.querySelectorAll(".student-card-identity-title").forEach(function(el){el.style.setProperty("color",title,"important");el.style.setProperty("border-color",line,"important");});face.querySelectorAll(".student-card-front-photo").forEach(function(el){el.style.setProperty("border-color",line,"important");el.style.setProperty("-webkit-print-color-adjust","exact");el.style.setProperty("print-color-adjust","exact");});face.style.background="linear-gradient(135deg,#fff 0%,color-mix(in srgb, "+main+" 7%, white) 100%)";face.querySelectorAll(".student-card-front-head").forEach(function(el){el.style.setProperty("background","linear-gradient(105deg,"+main+" 0%,"+grad+" 52%,"+main+" 100%)","important");});face.querySelectorAll(".student-card-back").forEach(function(el){el.style.setProperty("--card-color",main,"important");el.style.setProperty("--card-gradient-end",grad,"important");el.style.setProperty("background","linear-gradient(135deg,#fff 0%,color-mix(in srgb, "+main+" 7%, white) 100%)","important");});face.querySelectorAll(".student-card-back-title").forEach(function(el){el.style.setProperty("background","linear-gradient(100deg,"+main+" 0%,"+grad+" 100%)","important");});face.querySelectorAll(".student-card-back-footer").forEach(function(el){el.style.setProperty("background","linear-gradient(100deg,"+main+" 0%,"+grad+" 100%)","important");});face.querySelectorAll(".student-card-back-logo").forEach(function(el){el.style.borderColor=main;});});}if(colorInput){colorInput.value=savedCardColor;colorInput.addEventListener("input",function(){localStorage.setItem("guruSmartStudentCardColor",this.value);applyStudentCardColors();});}if(gradientInput){gradientInput.value=savedGradientColor;gradientInput.addEventListener("input",function(){localStorage.setItem("guruSmartStudentCardGradient",this.value);applyStudentCardColors();});}if(lineColorInput){lineColorInput.value=savedLineColor;lineColorInput.addEventListener("input",function(){localStorage.setItem("guruSmartStudentCardLineColor",this.value);applyStudentCardColors();});}if(titleColorInput){titleColorInput.value=savedTitleColor;titleColorInput.addEventListener("input",function(){localStorage.setItem("guruSmartStudentCardTitleColor",this.value);applyStudentCardColors();});}applyStudentCardColors();var colorPresets=document.getElementById("cardColorPresets");if(colorPresets){colorPresets.addEventListener("click",function(ev){var btn=ev.target.closest("[data-card-color]");if(!btn)return;var chosen=btn.getAttribute("data-card-color");if(colorInput)colorInput.value=chosen;localStorage.setItem("guruSmartStudentCardColor",chosen);applyStudentCardColors();});}document.getElementById('cardLogoInput').addEventListener('change',async function(e){var f=e.target.files[0];if(!f)return;if(!validateCardImageFile(f)){e.target.value='';return;}showToast('Upload logo...','info');var ext=f.name.split('.').pop();var r=await sb.storage.from('avatars').upload('logo_'+currentUser.id+'_'+Date.now()+'.'+ext,f);if(r.error){showToast('Gagal: '+r.error.message,'error');return;}var url=sb.storage.from('avatars').getPublicUrl(r.data.path).data.publicUrl;var pd=(await DB.get('school_profile'))[0]||{};if(pd.id)await sb.from('school_profile').update({logo_left:url}).eq('id',pd.id).eq('user_id',currentUser.id);else await sb.from('school_profile').insert([{logo_left:url,user_id:currentUser.id}]).select();document.getElementById('cardLogoName').innerText='Tersimpan';var img=document.getElementById('cardLogo');if(img.tagName==='DIV'){var el=document.createElement('img');el.id='cardLogo';el.src=url;el.alt='Logo sekolah';el.style.cssText='width:12mm;height:12mm;object-fit:contain;background:#fff;border-radius:2mm';img.replaceWith(el);}else{img.src=url;img.style.display='block';}try{gsInvalidateProfilCache();}catch(eGIC2){}showToast('Logo disimpan!','success');});document.getElementById('cardSignInput').addEventListener('change',async function(e){var f=e.target.files[0];if(!f)return;if(!validateCardImageFile(f)){e.target.value='';return;}showToast('Memproses TTD: latar dibuat transparan otomatis...','info');var ttdData=await new Promise(function(res,rej){var rd=new FileReader();rd.onload=function(ev){res(ev.target.result);};rd.onerror=function(){rej(new Error('Gagal membaca file TTD.'));};rd.readAsDataURL(f);});var ttdPng=await gsAutoTransparanTTD(ttdData);var ttdBlob=gsDataTTDBlob(ttdPng);if(!ttdBlob){showToast('Gagal memproses TTD.','error');return;}var r=await sb.storage.from('avatars').upload('sign_'+currentUser.id+'_'+Date.now()+'.png',ttdBlob,{contentType:'image/png',cacheControl:'3600',upsert:false});if(r.error){showToast('Gagal: '+r.error.message,'error');return;}var url=sb.storage.from('avatars').getPublicUrl(r.data.path).data.publicUrl;var pd=(await DB.get('school_profile'))[0]||{};if(pd.id)await sb.from('school_profile').update({principal_sign:url}).eq('id',pd.id).eq('user_id',currentUser.id);else await sb.from('school_profile').insert([{principal_sign:url,user_id:currentUser.id}]).select();document.getElementById('cardSignName').innerText='Tersimpan';var img=document.getElementById('cardSign');if(img.tagName==='SPAN'){var el=document.createElement('img');el.id='cardSign';el.src=url;el.alt='Tanda tangan';img.replaceWith(el);}else{img.src=url;img.style.display='block';}showToast('TTD disimpan!','success');});document.getElementById('cardStampInput').addEventListener('change',async function(e){var f=e.target.files[0];if(!f)return;if(!validateCardImageFile(f)){e.target.value='';return;}showToast('Memproses stempel: latar dibuat transparan otomatis...','info');var stpData=await new Promise(function(res,rej){var rd=new FileReader();rd.onload=function(ev){res(ev.target.result);};rd.onerror=function(){rej(new Error('Gagal membaca file stempel.'));};rd.readAsDataURL(f);});var stpPng=await gsAutoTransparanTTD(stpData);var stpBlob=gsDataTTDBlob(stpPng);if(!stpBlob){showToast('Gagal memproses stempel.','error');return;}var r=await sb.storage.from('avatars').upload('stamp_'+currentUser.id+'_'+Date.now()+'.png',stpBlob,{contentType:'image/png',cacheControl:'3600',upsert:false});if(r.error){showToast('Gagal: '+r.error.message,'error');return;}var url=sb.storage.from('avatars').getPublicUrl(r.data.path).data.publicUrl;var pd=(await DB.get('school_profile'))[0]||{};if(pd.id){var upd=await sb.from('school_profile').update({principal_stamp:url}).eq('id',pd.id).eq('user_id',currentUser.id);if(upd.error){showToast('Gagal menyimpan stempel: '+upd.error.message,'error');return;}}else{var ins=await sb.from('school_profile').insert([{principal_stamp:url,user_id:currentUser.id}]).select();if(ins.error){showToast('Gagal menyimpan stempel: '+ins.error.message,'error');return;}}document.getElementById('cardStampName').innerText='Tersimpan';var img=document.getElementById('cardStamp');if(img.tagName==='SPAN'){var el=document.createElement('img');el.id='cardStamp';el.className='student-card-stamp';el.src=url;el.alt='Stempel sekolah';img.replaceWith(el);}else{img.src=url;img.style.display='block';}showToast('Stempel disimpan!','success');});}
window.printCardNow=async function(studentId){
 var results=await Promise.all([DB.get('students'),DB.get('classes'),DB.get('school_profile')]);
 var s=results[0].find(function(x){return String(x.id)===String(studentId);});
 if(!s){showToast('Data siswa tidak ditemukan.','error');return;}
 var prof=results[2][0]||{},cls=results[1].find(function(c){return c.id===s.class_id;})||{};
 var logo=prof.logo_left||'',sign=prof.principal_sign||'',stamp=prof.principal_stamp||'',qid='cardPrintQR_'+String(s.id).replace(/[^a-zA-Z0-9_-]/g,'');
 var safe=function(v){return String(v==null||v===''?'-':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
 var school=safe(prof.name||'NAMA SEKOLAH'),address=safe(prof.address||prof.school_address||''),name=safe(s.name),nis=safe(s.nis||s.nisn),birthplace=safe(s.birthplace||'-'),birthdate=safe(formatDateID(s.birthdate)),gender=safe(s.gender||'-'),className=safe(cls.name||'-'),principal=safe(prof.principal||'-'),nip=safe(prof.principal_nip||'-');
 var front='<article class="student-card-face"><div class="student-card-front-head">'+(logo?'<img src="'+logo+'" alt="Logo sekolah">':'<div style="width:12mm;height:12mm;background:#fff;color:#1e3a8a;display:flex;align-items:center;justify-content:center;border-radius:2mm;font-size:5pt">LOGO</div>')+'<div><div style="font-size:9pt">'+school+'</div><div>'+address+'</div></div></div><div class="student-card-front-body">'+(s.photo_url?'<img class="student-card-front-photo" src="'+s.photo_url+'" alt="Foto siswa">':'<div class="student-card-front-photo" style="display:flex;align-items:center;justify-content:center;text-align:center;font-size:6pt">FOTO SISWA</div>')+'<div class="student-card-front-info"><strong class="student-card-identity-title">KARTU PELAJAR</strong><div class="student-card-data-row"><span>Nama Siswa</span><b>: '+name+'</b></div><div class="student-card-data-row"><span>NIS / NISN</span><b>: '+nis+'</b></div><div class="student-card-data-row"><span>Tanggal Lahir</span><b>: '+birthplace+', '+birthdate+'</b></div><div class="student-card-data-row"><span>Alamat</span><b>: '+safe(s.address||'-')+'</b></div></div><div class="student-card-bottom"><div id="'+qid+'" class="student-card-front-qr"></div><div class="student-card-sign">Kepala Sekolah<div class="student-card-sign-assets">'+(sign?'<img src="'+sign+'" alt="Tanda tangan">':'<span style="width:12mm;height:7mm"></span>')+(stamp?'<img class="student-card-stamp" src="'+stamp+'" alt="Stempel sekolah">':'')+'</div><div style="border-top:.3mm solid #333;padding-top:1mm;font-weight:bold">'+principal+'</div><div>NIP. '+nip+'</div></div></div></div></article>';
 var back='<article class="student-card-face student-card-back"><div class="student-card-back-title">KARTU PELAJAR</div><div class="student-card-back-content">'+(logo?'<img class="student-card-back-logo" src="'+logo+'" alt="Logo sekolah">':'<div class="student-card-back-logo" style="display:flex;align-items:center;justify-content:center;text-align:center">LOGO SEKOLAH</div>')+'<div class="student-card-back-rules"><b>KETENTUAN</b><div>• Kartu berlaku selama pemilik masih terdaftar sebagai siswa '+school+'.</div><div>• Kartu tidak boleh dipindah tangankan.</div><div>• Jika kartu hilang, hubungi pihak sekolah.</div><div style="margin-top:2mm">Alamat: '+address+'</div></div></div><div class="student-card-back-footer">'+school+(address?'<br><span style="font-weight:normal">'+address+'</span>':'')+'</div></article>';
 document.getElementById('printArea').style.setProperty('--card-color',localStorage.getItem('guruSmartStudentCardColor')||'#00a65a');document.getElementById('printArea').style.setProperty('--card-gradient-end',localStorage.getItem('guruSmartStudentCardGradient')||'#8bc943');document.getElementById('printArea').style.setProperty('--card-line-color',localStorage.getItem('guruSmartStudentCardLineColor')||'#16804a');document.getElementById('printArea').style.setProperty('--card-title-color',localStorage.getItem('guruSmartStudentCardTitleColor')||'#16804a');document.getElementById('printArea').innerHTML='<div class="student-card-pair">'+front+back+'</div>';applyExactStudentCardPrintColors(document.getElementById('printArea'));
 try{var qrEl=document.getElementById(qid);new QRCode(qrEl,{text:JSON.stringify({jenis:'KARTU PELAJAR',sekolah:prof.name||'',nama:s.name||'',nis:s.nis||s.nisn||'',kelas:cls.name||''}),width:180,height:180,correctLevel:QRCode.CorrectLevel.M});addSchoolLogoToCardQR(qrEl,logo);}catch(e){console.error('QR kartu:',e);}
 var imgs=[...document.querySelectorAll('#printArea img')];await Promise.all(imgs.map(function(im){if(im.complete)return Promise.resolve();return new Promise(function(resolve){im.onload=resolve;im.onerror=resolve;setTimeout(resolve,2500);});}));
 showToast('Agar warna tercetak sesuai, aktifkan Grafik latar belakang / Background graphics pada pengaturan cetak.','info');
 window.print();setTimeout(function(){document.getElementById('printArea').innerHTML='';},500);
};
window.printAllStudentCards = async function() {
  // Tampilkan loading indicator agar user tahu proses sedang berjalan
  showToast('Menyiapkan semua kartu siswa, mohon tunggu...', 'info');
  
  try {
    var results = await Promise.all([DB.get('students'), DB.get('classes'), DB.get('school_profile')]);
    var sts = results[0] || [], classes = results[1] || [], prof = (results[2] && results[2][0]) ? results[2][0] : {};
    
    if (!sts.length) {
      showToast('Belum ada siswa! Tambahkan data siswa terlebih dahulu.', 'error');
      return;
    }
    
    // Cek apakah library QRCode tersedia
    if (typeof QRCode === 'undefined') {
      showToast('Library QR Code belum dimuat. Periksa koneksi internet lalu muat ulang halaman.', 'error');
      return;
    }
    
    // Cek apakah printArea element tersedia
    var printAreaEl = document.getElementById('printArea');
    if (!printAreaEl) {
      showToast('Area cetak tidak ditemukan.', 'error');
      return;
    }
    
    var safe = function(v) {
      return String(v == null || v === '' ? '-' : v).replace(/[&<>"']/g, function(c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    };
    
    var logo = prof.logo_left || '', sign = prof.principal_sign || '', stamp = prof.principal_stamp || '', html = '', qids = [];
    
    sts.forEach(function(s, i) {
      var cls = classes.find(function(c) { return c.id === s.class_id; }) || {}, qid = 'allCardQR_' + i;
      qids.push({id: qid, s: s, cls: cls});
      
      var school = safe(prof.name || 'NAMA SEKOLAH'), address = safe(prof.address || prof.school_address || ''), name = safe(s.name), nis = safe(s.nis || s.nisn), birthplace = safe(s.birthplace || '-'), birthdate = safe(formatDateID(s.birthdate)), gender = safe(s.gender || '-'), className = safe(cls.name || '-'), principal = safe(prof.principal || '-'), nip = safe(prof.principal_nip || '-');
      
      html += '<div class="student-card-pair">' +
        '<article class="student-card-face">' +
          '<div class="student-card-front-head">' + (logo ? '<img src="'+logo+'" alt="Logo sekolah">' : '<div style="width:12mm;height:12mm;background:#fff;color:#1e3a8a;display:flex;align-items:center;justify-content:center;border-radius:2mm;font-size:5pt">LOGO</div>') +
            '<div><div style="font-size:9pt">'+school+'</div><div>'+address+'</div></div>' +
          '</div>' +
          '<div class="student-card-front-body">' + (s.photo_url ? '<img class="student-card-front-photo" src="'+s.photo_url+'" alt="Foto siswa">' : '<div class="student-card-front-photo" style="display:flex;align-items:center;justify-content:center;text-align:center;font-size:6pt">FOTO SISWA</div>') +
            '<div class="student-card-front-info">' +
              '<strong class="student-card-identity-title">KARTU PELAJAR</strong>' +
              '<div class="student-card-data-row"><span>Nama Siswa</span><b>: '+name+'</b></div>' +
              '<div class="student-card-data-row"><span>NIS / NISN</span><b>: '+nis+'</b></div>' +
              '<div class="student-card-data-row"><span>Tanggal Lahir</span><b>: '+birthplace+', '+birthdate+'</b></div>' +
              '<div class="student-card-data-row"><span>Alamat</span><b>: '+safe(s.address||'-')+'</b></div>' +
            '</div>' +
            '<div class="student-card-bottom">' +
              '<div id="'+qid+'" class="student-card-front-qr"></div>' +
              '<div class="student-card-sign">Kepala Sekolah<div class="student-card-sign-assets">'+(sign?'<img src="'+sign+'" alt="Tanda tangan">':'<span style="width:12mm;height:7mm"></span>')+(stamp?'<img class="student-card-stamp" src="'+stamp+'" alt="Stempel sekolah">':'')+'</div><div style="border-top:.3mm solid #333;padding-top:1mm;font-weight:bold">'+principal+'</div><div>NIP. '+nip+'</div></div>' +
            '</div>' +
          '</div>' +
        '</article>' +
        '<article class="student-card-face student-card-back">' +
          '<div class="student-card-back-title">KARTU PELAJAR</div>' +
          '<div class="student-card-back-content">' + (logo ? '<img class="student-card-back-logo" src="'+logo+'" alt="Logo sekolah">' : '<div class="student-card-back-logo" style="display:flex;align-items:center;justify-content:center;text-align:center">LOGO SEKOLAH</div>') +
            '<div class="student-card-back-rules"><b>KETENTUAN</b>' +
              '<div>• Kartu berlaku selama pemilik masih terdaftar sebagai siswa '+school+'.</div>' +
              '<div>• Kartu tidak boleh dipindahtangankan.</div>' +
              '<div>• Jika kartu hilang, hubungi pihak sekolah.</div>' +
              '<div style="margin-top:2mm">Alamat: '+address+'</div>' +
            '</div>' +
          '</div>' +
          '<div class="student-card-back-footer">'+school+(address?'<br><span style="font-weight:normal">'+address+'</span>':'')+'</div>' +
        '</article>' +
      '</div>';
    });
    
    printAreaEl.style.setProperty('--card-color', localStorage.getItem('guruSmartStudentCardColor') || '#00a65a');
    printAreaEl.style.setProperty('--card-gradient-end', localStorage.getItem('guruSmartStudentCardGradient') || '#8bc943');
    printAreaEl.style.setProperty('--card-line-color', localStorage.getItem('guruSmartStudentCardLineColor') || '#16804a');
    printAreaEl.style.setProperty('--card-title-color', localStorage.getItem('guruSmartStudentCardTitleColor') || '#16804a');
    printAreaEl.innerHTML = html;
    
    applyExactStudentCardPrintColors(printAreaEl);
    
    // Generate QR Codes satu per satu (lebih stabil daripada paralel untuk jumlah siswa banyak)
    for (var qi = 0; qi < qids.length; qi++) {
      var q = qids[qi];
      try {
        var qrEl = document.getElementById(q.id);
        if (qrEl) {
          qrEl.innerHTML = '';
          new QRCode(qrEl, {
            text: JSON.stringify({jenis:'KARTU PELAJAR', sekolah:prof.name||'', nama:q.s.name||'', nis:q.s.nis||q.s.nisn||'', kelas:q.cls.name||''}),
            width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M
          });
          addSchoolLogoToCardQR(qrEl, logo);
        }
      } catch(e) { 
        console.error('QR Error untuk siswa ke-' + (qi+1) + ':', e); 
      }
    }
    
    // Tunggu semua gambar termuat sebelum mencetak
    var imgs = Array.prototype.slice.call(document.querySelectorAll('#printArea img'));
    await Promise.all(imgs.map(function(im) {
      if(im.complete) return Promise.resolve();
      return new Promise(function(resolve) {
        im.onload = resolve;
        im.onerror = resolve;
        setTimeout(resolve, 3000); // timeout lebih lama untuk banyak gambar
      });
    }));
    
    // Beri waktu tambahan untuk render DOM dan QR Code sebelum print
    await new Promise(function(resolve){ setTimeout(resolve, 400); });
    
    showToast('Agar warna tercetak sesuai, aktifkan "Grafik latar belakang / Background graphics" pada pengaturan cetak.', 'info');
    
    // Pakai onafterprint untuk clear printArea setelah print benar-benar selesai
    // Ini mencegah printArea ter-clear sebelum print preview selesai render
    var cleanupDone = false;
    function cleanup() {
      if (cleanupDone) return;
      cleanupDone = true;
      try {
        var pa = document.getElementById('printArea');
        if (pa) pa.innerHTML = '';
      } catch(e) {}
      window.onafterprint = null;
    }
    
    window.onafterprint = cleanup;
    
    // Fallback clear setelah 60 detik kalau onafterprint tidak dipicu
    setTimeout(cleanup, 60000);
    
    // Trigger print
    setTimeout(function() {
      window.print();
    }, 100);
    
  } catch(err) {
    console.error('printAllStudentCards Error:', err);
    showToast('Gagal mencetak semua kartu: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    // Pastikan printArea di-clear walau gagal
    try {
      var pa = document.getElementById('printArea');
      if (pa) pa.innerHTML = '';
    } catch(e) {}
  }
};

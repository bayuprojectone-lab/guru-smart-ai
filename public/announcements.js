/* GURU SMART AI — Pemberitahuan & Pengumuman
   Data disimpan di Cloudflare D1 melalui Worker. Hak pemilik divalidasi ulang di server. */
(function(){
  "use strict";
  var OWNER = "bayuprojectone@gmail.com";
  var API = (window.GURU_SMART_D1_API_URL || "https://bayuprojectone.guru-smart-ai-pro.workers.dev").replace(/\/+$/,"") + "/api/announcements";
  var started = false, session = null, canManage = false, items = [];
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function date(s){try{return new Date(s.replace(" ","T")+"Z").toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});}catch(_){return s||"";}}
  function styles(){
    if(document.getElementById("gsAnnouncementStyles"))return;
    var st=document.createElement("style");st.id="gsAnnouncementStyles";st.textContent=
      "#gsAnnFab{position:fixed;right:18px;bottom:88px;z-index:99970;border:0;border-radius:999px;padding:13px 17px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font:700 14px Inter,Arial;box-shadow:0 8px 24px #1e40af55;cursor:pointer}"+
      "#gsAnnFab .gs-ann-count{display:inline-flex;min-width:19px;height:19px;align-items:center;justify-content:center;margin-left:6px;border-radius:99px;background:#ef4444;color:#fff;font-size:11px}"+
      "#gsAnnOverlay{position:fixed;inset:0;z-index:99990;background:#0f172a88;display:none;align-items:center;justify-content:center;padding:16px}"+
      "#gsAnnPanel{width:min(680px,100%);max-height:88vh;overflow:auto;background:#fff;color:#172033;border-radius:20px;padding:22px;box-shadow:0 25px 80px #0004;font:14px/1.5 Inter,Arial}"+
      "#gsAnnPanel h2{font-size:21px;margin:0 0 6px}#gsAnnPanel .muted{color:#64748b;font-size:12px}"+
      "#gsAnnPanel input,#gsAnnPanel textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px;margin:6px 0 12px;font:inherit;color:#172033}"+
      "#gsAnnPanel textarea{min-height:110px;resize:vertical}#gsAnnPanel button{border:0;border-radius:9px;padding:9px 13px;margin:3px;font-weight:700;cursor:pointer}"+
      ".gs-ann-primary{background:#2563eb;color:white}.gs-ann-secondary{background:#e2e8f0;color:#1e293b}.gs-ann-danger{background:#fee2e2;color:#991b1b}"+
      ".gs-ann-item{border:1px solid #e2e8f0;border-radius:13px;padding:14px;margin:12px 0}.gs-ann-item h3{margin:0 0 4px;font-size:16px}.gs-ann-body{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0}"+
      ".gs-ann-actions{display:flex;flex-wrap:wrap;gap:5px;justify-content:flex-end}"+
      "@media(max-width:520px){#gsAnnFab{right:12px;bottom:78px;padding:11px 13px}#gsAnnPanel{padding:16px;max-height:92vh}}";
    document.head.appendChild(st);
  }
  function mount(){
    if(document.getElementById("gsAnnFab"))return;
    styles();
    var b=document.createElement("button");b.id="gsAnnFab";b.type="button";b.innerHTML="🔔 Pengumuman";b.onclick=openPanel;document.body.appendChild(b);
    var o=document.createElement("div");o.id="gsAnnOverlay";o.innerHTML='<section id="gsAnnPanel" role="dialog" aria-modal="true" aria-label="Pemberitahuan dan pengumuman"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><h2>🔔 Pemberitahuan &amp; Pengumuman</h2><div class="muted">Informasi resmi GURU SMART AI</div></div><button class="gs-ann-secondary" id="gsAnnClose">Tutup ✕</button></div><div id="gsAnnAdmin"></div><div id="gsAnnList">Memuat pengumuman...</div></section>';
    o.addEventListener("click",function(e){if(e.target===o)closePanel();});document.body.appendChild(o);
    document.getElementById("gsAnnClose").onclick=closePanel;
  }
  function closePanel(){var o=document.getElementById("gsAnnOverlay");if(o)o.style.display="none";}
  async function api(method,body){
    var token=session&&session.access_token;if(!token)throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
    var r=await fetch(API,{method:method,headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
    var d=await r.json().catch(function(){return {};});if(!r.ok)throw new Error(d.error||("HTTP "+r.status));return d;
  }
  function render(){
    var admin=document.getElementById("gsAnnAdmin"),list=document.getElementById("gsAnnList");if(!admin||!list)return;
    admin.innerHTML=canManage?'<div style="background:#eff6ff;border-radius:12px;padding:13px;margin:15px 0"><strong>Kelola pengumuman — pemilik aplikasi</strong><form id="gsAnnForm"><input id="gsAnnTitle" maxlength="160" placeholder="Judul pengumuman" required><textarea id="gsAnnBody" maxlength="10000" placeholder="Tulis isi pengumuman..." required></textarea><input type="hidden" id="gsAnnEditId"><div class="gs-ann-actions"><button class="gs-ann-secondary" type="button" id="gsAnnCancel" style="display:none">Batal edit</button><button class="gs-ann-primary" type="submit">＋ Terbitkan</button></div></form></div>':'';
    if(canManage){
      document.getElementById("gsAnnForm").onsubmit=save;
      document.getElementById("gsAnnCancel").onclick=function(){document.getElementById("gsAnnForm").reset();document.getElementById("gsAnnEditId").value="";this.style.display="none";};
    }
    if(!items.length){list.innerHTML='<div class="gs-ann-item">Belum ada pengumuman.</div>';return;}
    list.innerHTML=items.map(function(x){return '<article class="gs-ann-item"><h3>'+esc(x.title)+'</h3><div class="muted">'+esc(date(x.created_at))+'</div><div class="gs-ann-body">'+esc(x.body)+'</div>'+(canManage?'<div class="gs-ann-actions"><button class="gs-ann-secondary" data-edit="'+esc(x.id)+'">Edit</button><button class="gs-ann-danger" data-del="'+esc(x.id)+'">Hapus</button></div>':'')+'</article>';}).join("");
    if(canManage){
      list.querySelectorAll("[data-edit]").forEach(function(b){b.onclick=function(){var x=items.find(function(a){return a.id===b.dataset.edit;});if(!x)return;document.getElementById("gsAnnTitle").value=x.title;document.getElementById("gsAnnBody").value=x.body;document.getElementById("gsAnnEditId").value=x.id;document.getElementById("gsAnnCancel").style.display="inline-block";document.getElementById("gsAnnTitle").focus();};});
      list.querySelectorAll("[data-del]").forEach(function(b){b.onclick=async function(){var x=items.find(function(a){return a.id===b.dataset.del;});if(!x||!confirm('Hapus pengumuman "'+x.title+'"?'))return;try{await api("POST",{action:"delete",id:x.id});await load();}catch(e){alert(e.message);}};});
    }
  }
  async function save(e){
    e.preventDefault();var title=document.getElementById("gsAnnTitle").value.trim(),body=document.getElementById("gsAnnBody").value.trim(),id=document.getElementById("gsAnnEditId").value;
    try{await api("POST",{action:id?"update":"create",id:id,title:title,body:body});e.target.reset();document.getElementById("gsAnnEditId").value="";document.getElementById("gsAnnCancel").style.display="none";await load();}catch(err){alert(err.message);}
  }
  async function load(){
    var list=document.getElementById("gsAnnList");if(list)list.textContent="Memuat pengumuman...";
    try{var d=await api("GET");items=Array.isArray(d.announcements)?d.announcements:[];canManage=!!d.can_manage;render();var b=document.getElementById("gsAnnFab");if(b)b.innerHTML="🔔 Pengumuman"+(items.length?'<span class="gs-ann-count">'+Math.min(items.length,99)+'</span>':"");}
    catch(e){if(list)list.textContent=e.message;}
  }
  function openPanel(){var o=document.getElementById("gsAnnOverlay");if(o)o.style.display="flex";load();}
  async function init(){
    if(started||!window.sb||!window.sb.auth)return;
    started=true;
    try{
      var r=await window.sb.auth.getSession();session=r.data&&r.data.session;
      if(session)mount();
      window.sb.auth.onAuthStateChange(function(_event,s){
        session=s;
        if(s){mount();if(document.getElementById("gsAnnOverlay")&&document.getElementById("gsAnnOverlay").style.display==="flex")load();}
        else{var b=document.getElementById("gsAnnFab"),o=document.getElementById("gsAnnOverlay");if(b)b.remove();if(o)o.remove();}
      });
    }catch(e){console.warn("[Pengumuman]",e);}
  }
  var tries=0;var timer=setInterval(function(){tries++;if(window.sb){clearInterval(timer);init();}else if(tries>80)clearInterval(timer);},500);
})();

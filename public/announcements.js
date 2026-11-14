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
      ".gs-ann-header-tools{display:flex;align-items:center;gap:10px;flex:none;min-width:0} .gs-ann-header-tools>*{flex:none}"+
      "#gsAnnFab{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;flex:none;min-height:42px;border:1px solid #a5b4fc;border-radius:14px;padding:0 14px;background:linear-gradient(125deg,#7c3aed 0%,#2563eb 48%,#06b6d4 100%);color:#fff;font:800 13px Inter,Arial,sans-serif;letter-spacing:.15px;box-shadow:0 7px 18px #4f46e544,inset 0 1px 0 #ffffff55;cursor:pointer;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease}"+
      "#gsAnnFab:hover{background:linear-gradient(135deg,#eff6ff,#e0e7ff);border-color:#818cf8;box-shadow:0 5px 16px #4338ca20}#gsAnnFab:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}"+
      "#gsAnnFab svg{width:20px;height:20px;flex:none;filter:drop-shadow(0 1px 2px #17255455)}#gsAnnFab .gs-ann-count{display:inline-flex;min-width:18px;height:18px;align-items:center;justify-content:center;margin-left:1px;padding:0 4px;border-radius:99px;background:#dc2626;color:#fff;font-size:10px;font-weight:800}"+
      "#gsAnnOverlay{position:fixed;inset:0;z-index:99990;background:rgba(15,23,42,.68);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:16px}"+
      "#gsAnnPanel{width:min(700px,100%);max-height:88vh;overflow:auto;background:linear-gradient(145deg,#f5f3ff 0%,#eff6ff 48%,#ecfeff 100%);color:#172033;border:1px solid #dbe4f0;border-radius:22px;padding:24px;box-shadow:0 28px 90px #02061755;font:14px/1.6 Inter,Arial,sans-serif}"+
      "#gsAnnPanel h2{font-size:21px;margin:0 0 6px}#gsAnnPanel .muted{color:#64748b;font-size:12px}"+
      "#gsAnnPanel input,#gsAnnPanel textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px;margin:6px 0 12px;font:inherit;color:#172033}"+
      "#gsAnnPanel textarea{min-height:110px;resize:vertical}#gsAnnPanel button{border:0;border-radius:9px;padding:9px 13px;margin:3px;font-weight:700;cursor:pointer}"+
      ".gs-ann-primary{background:#2563eb;color:white}.gs-ann-secondary{background:#e2e8f0;color:#1e293b}.gs-ann-danger{background:#fee2e2;color:#991b1b}"+
      ".gs-ann-item{border:1px solid #e2e8f0;border-radius:13px;padding:14px;margin:12px 0}.gs-ann-item h3{margin:0 0 4px;font-size:16px}.gs-ann-body{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0}"+
      ".gs-ann-actions{display:flex;flex-wrap:wrap;gap:5px;justify-content:flex-end}"+
      "#gsAnnPanel{border:1px solid #dbe4f0}#gsAnnPanel>div:first-child{padding-bottom:17px;border-bottom:1px solid #e5eaf2;margin-bottom:14px}#gsAnnPanel h2{font-size:21px;font-weight:850;letter-spacing:-.45px;color:#101c3b}#gsAnnPanel .muted{color:#64748b}#gsAnnPanel input:focus,#gsAnnPanel textarea:focus{outline:3px solid #dbeafe;border-color:#6366f1}#gsAnnPanel .gs-ann-item{background:linear-gradient(145deg,#fff 0%,#f5f3ff 50%,#effaff 100%);border:1px solid #c7d2fe;border-left:5px solid #6366f1;border-radius:15px;box-shadow:0 8px 22px #4f46e51a;padding:16px}#gsAnnPanel .gs-ann-item h3{font-weight:800;color:#172554;letter-spacing:-.2px}#gsAnnPanel .gs-ann-primary{background:linear-gradient(135deg,#3157d5,#5142b8);box-shadow:0 4px 12px #3730a333}#gsAnnPanel .gs-ann-secondary{border:1px solid #dbe3ef;background:#f8fafc}#gsAnnPanel .gs-ann-danger{border:1px solid #fecaca}"+
      "@media(max-width:640px){.gs-ann-header-tools{gap:7px;position:static!important;float:none!important;transform:none!important;flex-wrap:wrap;max-width:100%;justify-content:flex-end}#gsAnnFab{position:static!important;inset:auto!important;float:none!important;transform:none!important;order:-1;white-space:nowrap;width:38px;min-width:38px;min-height:38px;padding:0;font-size:0;gap:0;border-radius:12px}#gsAnnFab svg{width:20px;height:20px}#gsAnnFab span:not(.gs-ann-count){display:none}#gsAnnFab .gs-ann-count{font-size:10px;margin-left:0}#gsAnnPanel{padding:17px;border-radius:18px;max-height:92vh}#gsAnnPanel h2{font-size:18px}}";
    document.head.appendChild(st);
  }
  function mount(){
    if(document.getElementById("gsAnnFab"))return;
    styles();
    var b=document.createElement("button");b.id="gsAnnFab";b.type="button";b.setAttribute("aria-label","Buka pemberitahuan dan pengumuman");b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg><span>Pengumuman</span>';b.onclick=openPanel;var themeBtn=document.querySelector('header button[onclick*="toggleDarkMode"]')||document.querySelector('button[onclick*="toggleDarkMode"]');var tools=themeBtn&&themeBtn.parentNode;if(!tools){var header=document.querySelector("main header");tools=header&&header.lastElementChild;}if(tools){tools.classList.add("gs-ann-header-tools");tools.insertBefore(b,themeBtn&&themeBtn.parentNode===tools?themeBtn:tools.firstChild);}
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
    try{var d=await api("GET");items=Array.isArray(d.announcements)?d.announcements:[];canManage=!!d.can_manage;render();var b=document.getElementById("gsAnnFab");if(b){var count=b.querySelector(".gs-ann-count");if(count)count.remove();if(items.length){var badge=document.createElement("span");badge.className="gs-ann-count";badge.textContent=Math.min(items.length,99);b.appendChild(badge);}}}
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

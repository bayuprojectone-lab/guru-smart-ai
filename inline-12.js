
// Terapkan warna yang dipilih langsung ke elemen kartu sebelum print/PDF.
// Inline !important menjaga warna tidak ditimpa aturan CSS lama di halaman utama.
function applyExactStudentCardPrintColors(root){
 if(!root)return;
 var main=localStorage.getItem('guruSmartStudentCardColor')||'#00a65a';
 var grad=localStorage.getItem('guruSmartStudentCardGradient')||'#8bc943';
 var line=localStorage.getItem('guruSmartStudentCardLineColor')||'#16804a';
 var title=localStorage.getItem('guruSmartStudentCardTitleColor')||'#16804a';
 var set=function(el,p,v){if(el)el.style.setProperty(p,v,'important');};
 root.querySelectorAll('.student-card-face').forEach(function(card){
  set(card,'--card-color',main);set(card,'--card-gradient-end',grad);set(card,'--card-line-color',line);set(card,'--card-title-color',title);
  set(card,'border-color',line);set(card,'-webkit-print-color-adjust','exact');set(card,'print-color-adjust','exact');
  if(card.classList.contains('student-card-back')){
   set(card,'background-color','#ffffff');
   set(card,'background-image','linear-gradient(135deg,#ffffff 0%,#ffffff 72%,'+main+'12 100%)');
  }
 });
 root.querySelectorAll('.student-card-front-head').forEach(function(el){set(el,'background','linear-gradient(105deg,'+main+' 0%,'+grad+' 52%,'+main+' 100%)');set(el,'border-bottom-color',line);set(el,'-webkit-print-color-adjust','exact');set(el,'print-color-adjust','exact');});
 root.querySelectorAll('.student-card-front-head:after').forEach(function(el){set(el,'background',line);});
 root.querySelectorAll('.student-card-identity-title').forEach(function(el){set(el,'color',title);set(el,'border-color',line);});root.querySelectorAll('.student-card-front-photo').forEach(function(el){set(el,'border-color',line);set(el,'-webkit-print-color-adjust','exact');set(el,'print-color-adjust','exact');});
 root.querySelectorAll('.student-card-back-title').forEach(function(el){set(el,'background','linear-gradient(100deg,'+main+' 0%,'+grad+' 100%)');set(el,'color','#ffffff');});
 root.querySelectorAll('.student-card-back-footer').forEach(function(el){set(el,'background','linear-gradient(100deg,'+main+' 0%,'+grad+' 100%)');set(el,'border-top-color',line);set(el,'color','#ffffff');});
 root.querySelectorAll('.student-card-back-logo').forEach(function(el){set(el,'border-color',line);});
 root.querySelectorAll('.student-card-face,.student-card-face *').forEach(function(el){set(el,'-webkit-print-color-adjust','exact');set(el,'print-color-adjust','exact');});
}

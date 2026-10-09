(function(){
'use strict';
if(window.__FP_SHABBAT_V1__)return;window.__FP_SHABBAT_V1__=true;
var pageId='fp-shabbat-page',className='fp-shabbat-closed',timer,observer,originalTitle=document.title;
var pageUrl='/?shabbat=closed',wasClosed=false;
var timeFmt=new Intl.DateTimeFormat('he-IL',{timeZone:'Asia/Jerusalem',weekday:'long',day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
var markup='<main id="fp-shabbat-page" dir="rtl" role="main" aria-labelledby="fp-shabbat-title" tabindex="-1"><section class="fp-shabbat-card"><div class="fp-shabbat-brand">פלאש <span>פלוס</span></div><div class="fp-shabbat-line"></div><p class="fp-shabbat-eyebrow">עוצרים לכבוד שבת</p><h1 id="fp-shabbat-title">שבת שלום!</h1><p id="fp-shabbat-message">האתר סגור בשבת וייפתח שוב במוצאי שבת.</p><p id="fp-shabbat-reopen" aria-live="polite"></p><p class="fp-shabbat-note">נשמח לעמוד לשירותכם לאחר צאת השבת</p><a id="fp-shabbat-return" href="/" hidden>חזרה לאתר</a></section></main>';
var css='html.fp-shabbat-closed,html.fp-shabbat-closed body{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#081426!important}html.fp-shabbat-closed body>*:not(#fp-shabbat-page){display:none!important}#fp-shabbat-page{box-sizing:border-box!important;position:fixed!important;inset:0!important;z-index:2147483647!important;display:grid!important;place-items:center!important;overflow:auto!important;padding:32px 20px!important;direction:rtl!important;text-align:center!important;background:radial-gradient(ellipse at 50% 0,#213d5e 0,transparent 65%),#081426!important;color:#fff!important;font-family:Heebo,Assistant,Arial,sans-serif!important}#fp-shabbat-page *{box-sizing:border-box!important}.fp-shabbat-card{max-width:640px!important;width:100%!important;padding:48px 24px!important}.fp-shabbat-brand{font-size:38px!important;font-weight:900!important;letter-spacing:-1px!important}.fp-shabbat-brand span{color:#f8c453!important}.fp-shabbat-line{width:52px!important;height:3px!important;margin:30px auto!important;background:#f8c453!important;border-radius:8px!important}.fp-shabbat-eyebrow{color:#f8c453!important;font-size:15px!important;letter-spacing:1px!important;margin:0 0 18px!important}#fp-shabbat-title{font-size:clamp(40px,7vw,64px)!important;font-weight:800!important;line-height:1.15!important;margin:0 0 24px!important;color:white!important}#fp-shabbat-message{font-size:clamp(19px,3.2vw,24px)!important;line-height:1.8!important;margin:0!important;color:#e6eef7!important}#fp-shabbat-reopen{font-size:16px!important;line-height:1.8!important;color:#f8c453!important;margin:24px 0!important}.fp-shabbat-note{font-size:15px!important;line-height:1.8!important;color:#a9b8cd!important;margin:0!important}#fp-shabbat-return{display:inline-block!important;margin-top:28px!important;padding:13px 26px!important;border-radius:10px!important;background:#f8c453!important;color:#081426!important;font-size:17px!important;font-weight:800!important;text-decoration:none!important}#fp-shabbat-return[hidden]{display:none!important}';
var style=document.createElement('style');style.id='fp-shabbat-css';style.textContent=css;document.head.appendChild(style);
function safePath(value){try{var u=new URL(value,location.origin);return u.origin===location.origin&&u.search.indexOf('shabbat=closed')<0?u.pathname+u.search+u.hash:'/'}catch(_){return '/'}}
function returnPath(){try{return safePath(sessionStorage.getItem('fp-shabbat-return')||'/')}catch(_){return '/'}}
function ensure(){if(!document.body)return null;var p=document.getElementById(pageId);if(!p){document.body.insertAdjacentHTML('beforeend',markup);p=document.getElementById(pageId)}return p}
function setInert(active){if(!document.body)return;Array.from(document.body.children).forEach(function(el){if(el.id===pageId)return;if(active&&!el.hasAttribute('inert')){el.setAttribute('inert','');el.setAttribute('data-fp-shabbat-inert','1')}else if(!active&&el.hasAttribute('data-fp-shabbat-inert')){el.removeAttribute('inert');el.removeAttribute('data-fp-shabbat-inert')}})}
function isPage(){return new URLSearchParams(location.search).get('shabbat')==='closed'}
function routeToPage(){if(isPage())return;try{sessionStorage.setItem('fp-shabbat-return',safePath(location.href))}catch(_){};history.replaceState(null,'',pageUrl)}
function check(){
 clearTimeout(timer);var s=window.FlashPlusShabbat.state(),show=s.closed||isPage();
 if(s.closed){document.documentElement.classList.add(className);routeToPage();wasClosed=true}
 if(show){
  document.documentElement.classList.add(className);var p=ensure();setInert(true);
  if(p){
   document.title=s.closed?'שבת שלום | פלאש פלוס':'פלאש פלוס | האתר פתוח';
   document.getElementById('fp-shabbat-title').textContent=s.closed?'שבת שלום!':'שבוע טוב!';
   document.getElementById('fp-shabbat-message').textContent=s.closed?'האתר סגור בשבת וייפתח שוב במוצאי שבת.':'האתר פתוח כעת. נשמח לעמוד לשירותכם.';
   document.getElementById('fp-shabbat-reopen').textContent=s.closed?'פתיחה מחדש: '+timeFmt.format(new Date(s.end)):'הסגירה הבאה: '+timeFmt.format(new Date(s.start));
   var a=document.getElementById('fp-shabbat-return');a.hidden=s.closed;a.href=returnPath();
  }
 }else{document.documentElement.classList.remove(className);setInert(false);var old=document.getElementById(pageId);if(old){old.remove();if(originalTitle)document.title=originalTitle}}
 if(!s.closed&&wasClosed){wasClosed=false;location.replace(returnPath());return}
 timer=setTimeout(check,Math.min(60000,Math.max(250,s.next-Date.now())));
}
function guard(e){if(window.FlashPlusShabbat.state().closed){e.preventDefault();e.stopImmediatePropagation();check()}}
document.addEventListener('click',guard,true);document.addEventListener('submit',guard,true);
['pageshow','popstate','visibilitychange'].forEach(function(n){addEventListener(n,check)});
function ready(){check();observer=new MutationObserver(function(){if(window.FlashPlusShabbat.state().closed){document.documentElement.classList.add(className);ensure();setInert(true)}});observer.observe(document.body,{childList:true})}
check();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

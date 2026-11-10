/* 로컬 관리자 저장소
   Claude 밖(내 컴퓨터, Netlify, ChatGPT 미리보기 등)에서 주소 끝에 #admin을 붙여 열면 site.js가 이 파일을 불러옵니다.
   관리 화면에서 바꾼 내용은 이 브라우저의 localStorage에만 저장됩니다.
   고객 사이트에 반영하려면 관리 화면의 "content.js 내보내기"로 받은 파일을 사이트 폴더의 content.js와 바꿔 주세요. */
(function(){
'use strict';
const KEY='maketgwam.local.v1';
let mem=null,persist=true;
const copy=v=>JSON.parse(JSON.stringify(v));
function load(){
  if(mem)return mem;
  try{const t=localStorage.getItem(KEY);mem=t?JSON.parse(t):null}catch(e){persist=false;mem=null}
  if(!mem||typeof mem.docs!=='object'||!mem.docs)mem={docs:{},seeded:false};
  return mem;
}
function save(){
  if(!persist)return;
  try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){persist=false}
}
function seed(){
  const m=load();if(m.seeded)return;
  const C=(typeof SITE_CONTENT!=='undefined'&&SITE_CONTENT)||window.SITE_CONTENT||{};
  (C.products||[]).forEach(p=>{if(p&&p.id)m.docs['products/'+p.id]=copy(p)});
  (C.portfolio||[]).forEach((w,i)=>{if(!w)return;const id=String(w.id||('work-'+(i+1)));const d=copy(w);delete d.id;m.docs['portfolio/'+id]=d});
  if(C.brand)m.docs['settings/brand']=copy(C.brand);
  m.seeded=true;save();
}
const subs=new Set();
function notify(){subs.forEach(f=>{try{f()}catch(e){}})}
const meta={fromCache:false,hasPendingWrites:false};
function snapDoc(path){const d=load().docs[path];return {id:path.split('/').pop(),exists:!!d,data:()=>d?copy(d):undefined,metadata:meta}}
function collDocs(path){
  const pre=path+'/',n=path.split('/').length+1;
  return Object.keys(load().docs).filter(k=>k.startsWith(pre)&&k.split('/').length===n).sort().map(snapDoc);
}
function merge(a,b){
  for(const k of Object.keys(b)){
    const v=b[k];
    if(v&&typeof v==='object'&&v.__delete__===true){delete a[k];continue}
    if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))a[k]=merge(a[k],v);
    else a[k]=v;
  }
  return a;
}
function qsnap(path){const docs=collDocs(path);return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta}}
function doc(path){
  return {
    id:path.split('/').pop(),path,
    get:async()=>snapDoc(path),
    set:async d=>{load().docs[path]=copy(d);save();notify()},
    update:async d=>{const m=load();if(!m.docs[path])throw {code:'invalid_argument',message:'문서가 없어요.'};m.docs[path]=merge(m.docs[path],copy(d));save();notify()},
    delete:async()=>{delete load().docs[path];save();notify()},
    onSnapshot(next){const f=()=>next(snapDoc(path));subs.add(f);setTimeout(f,0);return()=>subs.delete(f)},
    collection:p=>coll(path+'/'+p)
  };
}
function coll(path){
  const q={
    path,
    doc:id=>doc(path+'/'+(id||Math.random().toString(36).slice(2,12))),
    add:async d=>{const r=q.doc();await r.set(d);return r},
    get:async()=>qsnap(path),
    onSnapshot(next){const f=()=>next(qsnap(path));subs.add(f);setTimeout(f,0);return()=>subs.delete(f)},
    where(){return q},orderBy(){return q},limit(){return q}
  };
  return q;
}
seed();
window.addEventListener('storage',e=>{if(e.key===KEY){mem=null;notify()}});
window.__localStore={
  reset(){try{localStorage.removeItem(KEY)}catch(e){}mem=null;seed();notify()},
  persistent:()=>{load();return persist}
};
const user={canEdit:async()=>true,isOwner:async()=>true,can:async()=>true,id:async()=>'local',me:async()=>({id:'local',name:'관리자'}),profiles:async()=>({})};
window.__localClaude={use:async n=>n==='db'?{doc,collection:coll}:n==='user'?user:null};
})();

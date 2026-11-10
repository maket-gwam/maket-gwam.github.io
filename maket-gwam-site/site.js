'use strict';

const CATS=['브랜드 협업','공모전 출품작','오리지널'];
const CAT_LINES={'브랜드 협업':'브랜드와 함께 만든 콘텐츠입니다','공모전 출품작':'공모전마다 한 편씩, 실력을 쌓고 있습니다','오리지널':'모형곰이 직접 기획한 이야기입니다'};
const PCATS=['캐릭터','AI 숏폼','기획','패키지'];
const DEF_PIMG={'char-basic':'img/bear-multi.webp','char-face':'img/bears-collage.webp','short-15':'img/kikaboni.webp','short-30':'img/highlight.webp','short-3pack':'img/hwaseong-short.webp','plan-set':'img/110.webp','starter':'img/hwaseong-cf.webp'};
const DEF_THUMB={kikaboni:'img/kikaboni.webp',highlight:'img/highlight.webp','110':'img/110.webp',hwaseong:'img/hwaseong-cf.webp',volunteers:'img/volunteer.webp'};
const isUrl=u=>/^https?:\/\//i.test(u||'');
const isMail=u=>/^mailto:[^@\s]+@[^@\s]+$/i.test(u||'');
const mailAddr=u=>String(u||'').replace(/^mailto:/i,'');
const isInsta=c=>/instagram\.com/i.test(c.url||'');
const won=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const pct=(a,b)=>a>0&&b>0&&b<a?Math.round((a-b)/a*100):0;
const IC={
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  insta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  all:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  '캐릭터':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="13.5" r="7"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>',
  'AI 숏폼':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/></svg>',
  '기획':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
  '패키지':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v9"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
const SNAP=SITE_CONTENT;
const DEFAULT_BRAND=SITE_CONTENT.brand;
const S={
  db:null,canEdit:false,dbMissing:false,mode:'public',preview:false,
  projects:[],projLoaded:false,portfolio:[],folioLoaded:false,products:[],prodLoaded:false,brand:clone(DEFAULT_BRAND),slow:false,loadError:'',
  page:'dashboard',filter:'all',query:'',sort:'deadline',
  draft:null,original:null,openedAt:'',tab:'기본 정보',saving:false,
  pdraft:null,poriginal:null,
  brandDraft:null,brandSaving:false,
  media:[],assets:null,uploading:'',
  pub:{cat:'전체',q:'',tab:'story',workCat:'전체',sheet:null,banner:0,scrollTo:''}
};
let toastTimer=null;
const LEGACY_IMAGES={"img/110.jpg":"img/110.webp","img/bear-multi.png":"img/bear-multi.webp","img/bears-collage.jpg":"img/bears-collage.webp","img/eundun.jpg":"img/eundun.webp","img/highlight.jpg":"img/highlight.webp","img/hwaseong-cf.jpg":"img/hwaseong-cf.webp","img/hwaseong-short.jpg":"img/hwaseong-short.webp","img/kikaboni.jpg":"img/kikaboni.webp","img/nupda.jpg":"img/nupda.webp","img/storybook.jpg":"img/storybook.webp","img/volunteer.jpg":"img/volunteer.webp","img/youtube-banner.jpg":"img/youtube-banner.webp"};
function refSrc(r){if(!r)return '';r=LEGACY_IMAGES[r]||r;if(/^img\/[^\/\\<>"'?#]+\.(jpe?g|png|gif|webp|svg|mp4|webm)$/i.test(r))return r;const m=/^asset:([A-Za-z0-9_-]{8,64})$/.exec(r);return m?'/_blob/'+m[1]:''}

function ed(k){return S.preview&&S.editMode?' data-edit="'+esc(k)+'"':''}
const FONTS={
  system:{label:'기본 (기기 글꼴)'},
  gowoon:{label:'그리운X국한박 고운',family:'Griun Gowoon',file:'fonts/griun-gowoon.woff2'},
  yuntaeng:{label:'온글잎 윤탱체',family:'Ownglyph Yuntaeng',file:'fonts/ownglyph-yuntaeng.woff2'}
};
const SYS_STACK='"Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
function fontStack(k){const f=FONTS[k];return f&&f.family?'"'+f.family+'",'+SYS_STACK:SYS_STACK}
function fontFace(k){const f=FONTS[k];return f&&f.file?'@font-face{font-family:"'+f.family+'";src:url("'+f.file+'") format("woff2");font-display:swap}':''}
let fontKey='';
function applyFonts(b){
  const d=FONTS[b.fontDisplay]?b.fontDisplay:'system',t=FONTS[b.fontBody]?b.fontBody:'system',k=d+'|'+t;
  if(k===fontKey)return;fontKey=k;
  let el=document.getElementById('brand-fonts');
  if(!el){el=document.createElement('style');el.id='brand-fonts';document.head.append(el)}
  el.textContent=[...new Set([d,t])].map(fontFace).join('')+':root{--font-display:'+fontStack(d)+';--font-body:'+fontStack(t)+'}'+
    (d!=='system'?'h1,h2,h3,h4,.slide b,.top .logo b,.shop-foot b,.kpi strong{font-weight:400;letter-spacing:0}':'');
}
function pic(src,cls,label,alt){const u=refSrc(src);return u?'<img class="'+(cls||'')+'" src="'+esc(u)+'" alt="'+esc(alt||'')+'" loading="lazy" decoding="async">':'<div class="ph '+(cls||'')+'">'+esc(label)+'</div>'}

function clone(v){return JSON.parse(JSON.stringify(v))}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function uid(){return (crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9-]/g,'')}

function catIdx(c){const i=CATS.indexOf(c);return i<0?1:i}

function normProduct(raw){
  const p=raw||{};
  return {id:String(p.id||uid()),name:String(p.name||''),category:PCATS.includes(p.category)?p.category:'캐릭터',price:Math.max(0,Number(p.price)||0),sale:Math.max(0,Number(p.sale)||0),desc:String(p.desc||''),includes:String(p.includes||''),image:String(p.image||DEF_PIMG[p.id]||''),example:p.example!==false,featured:!!p.featured,order:Number(p.order)||0,updatedAt:String(p.updatedAt||'')};
}

function mergeBrand(b){
  const out=Object.assign(clone(DEFAULT_BRAND),b?clone(b):{});
  ['banners','contacts','workflow','notices','reviews','toolOptions'].forEach(k=>{if(!Array.isArray(out[k]))out[k]=clone(DEFAULT_BRAND[k])});
  if(!out.catIcons||typeof out.catIcons!=='object')out.catIcons={};
  out.footer=Object.assign({company:'',ceo:'',phone:'',bizno:''},out.footer||{});
  return out;
}

function toast(t){const el=document.getElementById('toast');el.innerHTML='<div class="toast" role="status">'+esc(t)+'</div>';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.innerHTML=''},3400)}

async function copyText(t,msg){try{await navigator.clipboard.writeText(t);if(msg)toast(msg)}catch(e){if(msg)toast('복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요.')}}

function bear(cls){return '<svg class="'+(cls||'')+'" viewBox="0 0 60 60" aria-hidden="true"><circle cx="15" cy="15" r="10" fill="#FBF6EC"/><circle cx="15" cy="15" r="5" fill="#F0BE99"/><circle cx="45" cy="15" r="10" fill="#FBF6EC"/><circle cx="45" cy="15" r="5" fill="#F0BE99"/><rect x="8" y="11" width="44" height="40" rx="21" fill="#FBF6EC"/><ellipse cx="30" cy="38" rx="10" ry="7.5" fill="#FBF6EC"/><circle cx="22" cy="29" r="2.2" fill="#253653"/><circle cx="38" cy="29" r="2.2" fill="#253653"/><ellipse cx="30" cy="35.5" rx="3.6" ry="2.6" fill="#253653"/><path d="M19 50l11 4-11 4zm22 0l-11 4 11 4z" fill="#B8352C"/><circle cx="30" cy="54" r="2.4" fill="#B8352C"/></svg>'}

function keepFocus(fn){
  const a=document.activeElement,id=a&&a.id,s=a&&('selectionStart' in a)?a.selectionStart:null,e=a&&('selectionEnd' in a)?a.selectionEnd:null;
  fn();
  if(id){const n=document.getElementById(id);if(n&&n!==document.activeElement){n.focus({preventScroll:true});try{if(s!=null)n.setSelectionRange(s,e)}catch(_){}}}
}

function render(){
  const pub=!(S.mode==='admin'&&!S.preview);
  applyFonts(S.brand);
  document.body.classList.toggle('pubmode',pub);
  document.body.classList.toggle('editing',!!(S.preview&&S.editMode));
  keepFocus(()=>{document.getElementById('root').innerHTML=pub?renderPublic():renderAdmin()});
  if(pub)afterPublic();
}

function mainContacts(){return (S.brand.contacts||[]).filter(c=>isUrl(c.url))}

function productCard(p){
  const d=pct(p.price,p.sale);
  return '<button class="gcard" data-act="sheet-product" data-id="'+esc(p.id)+'"'+ed('product:'+p.id)+'>'+pic(p.image,'gimg','상품 사진')+'<div class="gb"><div>'+(p.example?'<span class="tag-ex">예시</span>':'')+'</div><b>'+esc(p.name)+'</b><p>'+esc(p.desc)+'</p><div class="price">'+(d?'<s class="num">'+won(p.price)+'</s><em class="num">'+d+'%</em>':'')+'<strong class="num">'+won(p.sale||p.price)+'</strong></div></div></button>';
}

function workCard(w){
  const spec=[w.length,w.ratio].filter(Boolean).join(' · ');
  return '<button class="wcard" data-act="sheet-work" data-id="'+esc(w.id)+'"'+ed('work:'+w.id)+'>'+pic(w.thumb||DEF_THUMB[w.id],'wimg','썸네일')+'<div><span class="pill cat'+catIdx(w.category)+'">'+esc(w.category)+'</span>'+(refSrc(w.video)?' <span class="pill s5">▶ 영상</span>':'')+'<b>'+esc(w.name)+'</b><p>'+esc(w.summary||w.purpose||'')+'</p><p style="margin-top:2px">'+esc([w.format,spec].filter(Boolean).join(' · '))+'</p></div></button>';
}

function renderPublic(){
  const b=S.brand,P=S.pub,contacts=mainContacts(),main=contacts[0];
  const products=S.products.slice().sort((a,b)=>a.order-b.order);
  const works=S.portfolio.slice().sort((a,b)=>String(b.releasedAt||'').localeCompare(String(a.releasedAt||''))||String(a.name||'').localeCompare(String(b.name||''),'ko'));
  const q=P.q.trim().toLowerCase();
  let body='';
  if(q){
    const pr=products.filter(p=>[p.name,p.desc,p.category].join(' ').toLowerCase().includes(q));
    const wr=works.filter(w=>[w.name,w.summary,w.format,w.category,(w.tools||[]).join(' ')].join(' ').toLowerCase().includes(q));
    body='<section class="sec"><div class="sec-h"><h2>“'+esc(P.q.trim())+'” 검색 결과</h2><button class="btn ghost sm" data-act="pq-clear">지우기</button></div>'+
      (pr.length?'<div class="grid">'+pr.map(productCard).join('')+'</div>':'')+
      (wr.length?'<div style="margin-top:14px">'+wr.map(workCard).join('')+'</div>':'')+
      (!pr.length&&!wr.length?'<div class="empty">찾는 작업이 없나요? 아래 상담 버튼으로 편하게 물어봐 주세요.</div>':'')+'</section>';
  }else{
    const banners=(b.banners||[]).filter(x=>x.title);
    const featured=products.filter(p=>p.featured);
    const shown=P.cat==='전체'?products:products.filter(p=>p.category===P.cat);
    body=(banners.length?'<section class="roll" aria-roledescription="carousel" aria-label="배너"><div class="track" id="track">'+banners.map((x,i)=>'<button class="slide" data-act="banner" data-i="'+i+'"'+ed('banner:'+(x.id||i))+' aria-label="'+(i+1)+'/'+banners.length+' '+esc(x.title)+'"><div><small>'+esc(x.eyebrow)+'</small><b>'+esc(x.title)+'</b><p>'+esc(x.sub)+'</p></div>'+pic(x.image,'simg','이미지')+'</button>').join('')+'</div><div class="dots" id="dots">'+banners.map((x,i)=>'<button data-act="dot" data-i="'+i+'" aria-label="'+(i+1)+'번 배너"'+(i===P.banner?' class="on"':'')+'></button>').join('')+'</div></section>':'')+
    (featured.length?'<section class="sec"><div class="sec-h"><div><h2>'+esc(b.featureTitle)+'</h2><p>'+esc(b.featureSub)+'</p></div></div><div class="feature">'+featured.map(p=>{const d=pct(p.price,p.sale);return '<button class="fitem" data-act="sheet-product" data-id="'+esc(p.id)+'"'+ed('product:'+p.id)+'>'+pic(p.image,'fimg','사진')+'<div>'+(p.example?'<span class="tag-ex">예시</span>':'')+'<b>'+esc(p.name)+'</b><p>'+esc(p.desc)+'</p><div class="price">'+(d?'<s class="num">'+won(p.price)+'</s><em class="num">'+d+'%</em>':'')+'<strong class="num">'+won(p.sale||p.price)+'</strong></div></div></button>'}).join('')+'</div></section>':'')+
    '<section class="sec" id="products"><div class="sec-h"><h2>'+(P.cat==='전체'?'전체 상품':esc(P.cat))+'</h2><p class="num">'+shown.length+'개</p></div>'+
    (!S.prodLoaded&&!S.dbMissing?'<div class="empty">'+(S.slow?'상품을 아직 불러오지 못했어요.':'상품을 불러오는 중입니다…')+'</div>':shown.length?'<div class="grid">'+shown.map(productCard).join('')+'</div>':'<div class="empty">'+(S.dbMissing?'상품 목록은 Claude에 로그인한 상태에서 볼 수 있어요. 아래 상담 버튼으로 문의해 주세요.':'준비 중인 상품이에요. 상담으로 먼저 문의해 주세요.')+'</div>')+'</section>'+
    renderBrandTabs(works);
  }
  const f=b.footer||{};
  return (S.preview?'<div class="preview-bar">'+(S.editMode?'바꾸고 싶은 사진·아이콘을 눌러 주세요.':'고객이 보는 화면을 미리 보고 있어요.')+'<button data-act="edit-toggle">'+(S.editMode?'바꾸기 끝내기':'✎ 눌러서 바꾸기')+'</button><button data-act="font-open">글꼴</button><button data-act="unpreview">관리 화면으로</button></div>':'')+
  '<div class="shop">'+(b.util?'<div class="util">'+esc(b.util)+'</div>':'')+
  '<header class="top"><a class="logo" href="#top" data-act="totop"'+ed('logo')+'>'+(refSrc(b.logo)?pic(b.logo,'limg','로고','모형곰'):bear('brand-mark'))+'<span><b>모형곰</b><small class="en">maket.gwam</small></span></a><div class="icons">'+headerIcons(contacts)+'</div></header>'+
  '<div class="search">'+IC.search+'<input id="pq" type="search" placeholder="어떤 작업이 필요하세요?" aria-label="상품과 샘플 검색" value="'+esc(P.q)+'"></div>'+
  '<nav class="cats" aria-label="상품 카테고리">'+['전체'].concat(PCATS).map(c=>'<button class="cat'+(P.cat===c&&!q?' on':'')+'" data-act="pcat" data-cat="'+esc(c)+'"'+ed('cat:'+c)+'><span>'+(refSrc(b.catIcons&&b.catIcons[c])?'<img class="catimg" src="'+esc(refSrc(b.catIcons[c]))+'" alt="">':(IC[c]||IC.all))+'</span>'+esc(c)+'</button>').join('')+'</nav>'+
  body+
  '<footer class="shop-foot"><b>모형곰</b> <span class="en">maket.gwam</span><p>'+esc(b.tagline)+'</p><dl>'+[['상호',f.company],['대표자',f.ceo],['연락처',f.phone],['사업자번호',f.bizno]].map(([l,v])=>'<dt>'+l+'</dt><dd>'+esc(v||'')+'</dd>').join('')+'</dl><div class="flinks">'+contacts.map(c=>'<a href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+esc(c.label||c.url)+' ↗</a>').join('')+'</div>'+(b.contacts||[]).filter(c=>isMail(c.url)).map(c=>'<p style="margin-bottom:8px">'+esc(c.label||'이메일')+' <b style="font-family:var(--font-body);font-size:12px;color:var(--ink)">'+esc(mailAddr(c.url))+'</b> <button class="btn ghost sm" data-act="copy-mail" data-v="'+esc(mailAddr(c.url))+'">주소 복사</button></p>').join('')+'<p>© 모형곰 (maket.gwam)</p></footer>'+
  '<div class="cta">'+(contacts[1]?'<a class="btn" href="'+esc(contacts[1].url)+'" target="_blank" rel="noopener noreferrer">'+esc(contacts[1].label)+'</a>':'')+(main?'<a class="btn primary" href="'+esc(main.url)+'" target="_blank" rel="noopener noreferrer" style="flex-direction:column;gap:0;line-height:1.25">상담 신청하기<small style="font-size:11px;font-weight:400;opacity:.9">'+esc(main.label)+'</small></a>':'<span class="btn">연락처를 준비하고 있어요</span>')+'</div></div>';
}

function headerIcons(contacts){
  const ig=contacts.find(isInsta),chat=contacts.find(c=>!isInsta(c));
  return (ig?'<a class="icon-btn" href="'+esc(ig.url)+'" target="_blank" rel="noopener noreferrer" aria-label="인스타그램">'+IC.insta+'</a>':'')+
    (chat?'<a class="icon-btn" href="'+esc(chat.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(chat.label||'문의')+'">'+IC.chat+'</a>':'');
}

function renderBrandTabs(works){
  const b=S.brand,P=S.pub;
  const tabs=[['story','이야기'],['process','작업 과정'],['works','샘플'],['reviews','후기'],['notices','공지']];
  let pane='';
  if(P.tab==='story'){
    const tc={};works.forEach(w=>(w.tools||[]).forEach(t=>{tc[t]=(tc[t]||0)+1}));
    const top=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]);
    pane='<div class="story">'+(refSrc(b.storyImage)?'<div'+ed('story')+'>'+pic(b.storyImage,'storyimg','','')+'</div>':S.preview&&S.editMode?'<div class="ph" style="height:150px;margin-bottom:14px"'+ed('story')+'>대표 브랜드 사진</div>':'')+'<h2 style="font-size:24px;color:var(--navy);margin-bottom:8px">'+esc(b.tagline)+'</h2><p>'+esc(b.intro)+'</p>'+
    (S.folioLoaded&&works.length?'<div class="kpis"><div class="kpi"><strong class="num">'+works.length+'</strong><span>공개 샘플</span></div><div class="kpi"><strong class="num">'+works.filter(w=>w.category==='공모전 출품작').length+'</strong><span>공모전 출품</span></div><div class="kpi"><strong class="num">'+works.filter(w=>w.category==='브랜드 협업').length+'</strong><span>브랜드 협업</span></div></div>'+(top.length?'<p class="hint" style="margin-bottom:6px">주로 쓰는 도구</p><div class="chipset">'+top.map(t=>'<span class="tchip">'+esc(t)+'</span>').join('')+'</div>':''):'')+'</div>';
  }else if(P.tab==='process'){
    pane='<ol class="steps">'+(b.workflow||[]).filter(w=>w.title).map((w,i)=>'<li><span class="num">'+(i+1)+'</span><div><b>'+esc(w.title)+'</b><p>'+esc(w.desc)+'</p></div></li>').join('')+'</ol>';
  }else if(P.tab==='works'){
    const list=P.workCat==='전체'?works:works.filter(w=>w.category===P.workCat);
    pane='<div class="chips">'+['전체'].concat(CATS).map(c=>'<button class="chip'+(P.workCat===c?' on':'')+'" data-act="wcat" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div>'+
    (P.workCat!=='전체'?'<p class="hint" style="margin:-4px 0 10px">'+esc(CAT_LINES[P.workCat])+'</p>':'')+
    (S.dbMissing?'<div class="empty">샘플 목록은 Claude에 로그인한 상태에서 볼 수 있어요. 상담으로 포트폴리오를 요청해 주셔도 됩니다.</div>':!S.folioLoaded?'<div class="empty">샘플을 불러오는 중입니다…</div>':list.length?list.map(workCard).join(''):'<div class="empty">곧 새로운 샘플로 찾아뵙겠습니다.</div>');
  }else if(P.tab==='reviews'){
    const rv=(b.reviews||[]).filter(r=>r.text).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    pane=rv.length?rv.map(r=>'<article class="review"><b>'+esc(r.author||'고객')+'</b>'+(r.product?' <span class="pill">'+esc(r.product)+'</span>':'')+'<p>'+esc(r.text)+'</p><small class="num">'+esc(r.date||'')+'</small></article>').join(''):'<div class="empty">첫 후기를 기다리고 있어요. 작업 후 남겨 주시는 후기가 큰 힘이 됩니다.</div>';
  }else{
    const ns=(b.notices||[]).filter(n=>n.title).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    pane=ns.length?ns.map(n=>'<details class="nitem"><summary><span>'+esc(n.title)+'</span><small class="num">'+esc(n.date||'')+'</small></summary><p>'+esc(n.body)+'</p></details>').join(''):'<div class="empty">등록된 공지가 없어요.</div>';
  }
  return '<div class="btabs" id="btabs" role="tablist">'+tabs.map(([k,l])=>'<button role="tab" aria-selected="'+(P.tab===k)+'" class="'+(P.tab===k?'on':'')+'" data-act="ptab" data-tab="'+k+'">'+l+'</button>').join('')+'</div><div class="tabpane">'+pane+'</div>';
}

function afterPublic(){
  const tr=document.getElementById('track');
  if(tr)tr.scrollLeft=S.pub.banner*tr.clientWidth;
  if(S.pub.scrollTo){const el=document.getElementById(S.pub.scrollTo);S.pub.scrollTo='';if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
}

function setDots(i){const d=document.getElementById('dots');if(!d)return;[...d.children].forEach((b,j)=>b.classList.toggle('on',j===i))}

function goBanner(i,smooth){
  const tr=document.getElementById('track');if(!tr)return;
  const n=tr.children.length;S.pub.banner=((i%n)+n)%n;
  tr.scrollTo({left:S.pub.banner*tr.clientWidth,behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});setDots(S.pub.banner);
}

function renderModal(){
  const el=document.getElementById('modal');
  const sc=el.querySelector('.dbody,.sheet-b');const top=sc?sc.scrollTop:0;
  keepFocus(()=>{el.innerHTML=S.draft?projectModal():S.pdraft?productModal():S.pub.sheet?publicSheet():''});
  const nb=el.querySelector('.dbody,.sheet-b');if(nb)nb.scrollTop=top;
}

function publicSheet(){
  const sh=S.pub.sheet,contacts=mainContacts(),main=contacts[0];
  let body='',foot='';
  if(sh.type==='product'){
    const p=S.products.find(x=>x.id===sh.id);if(!p)return '';
    const d=pct(p.price,p.sale),inc=p.includes.split('\n').map(x=>x.trim()).filter(Boolean);
    body=(refSrc(p.image)?'<div class="bigwrap">'+pic(p.image,'bigimg','',p.name)+'</div>':'<div class="ph bigph">상품 사진</div>')+(p.example?'<span class="tag-ex">예시</span> ':'')+'<span class="pill">'+esc(p.category)+'</span><h2 id="sh-title">'+esc(p.name)+'</h2><p class="muted">'+esc(p.desc)+'</p><div class="price" style="margin:10px 0">'+(d?'<s class="num">'+won(p.price)+'</s><em class="num" style="font-size:20px">'+d+'%</em>':'')+'<strong class="num" style="font-size:22px">'+won(p.sale||p.price)+'</strong></div>'+
    (inc.length?'<h3>포함 내용</h3><ul class="incl">'+inc.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
    '<p class="hint" style="margin-top:12px">상담하기를 누르면 문의 문구가 복사돼요. 대화창에 붙여 넣어 보내 주세요.</p>';
    foot=main?'<a class="btn primary" href="'+esc(main.url)+'" target="_blank" rel="noopener noreferrer" data-act="ask-product" data-id="'+esc(p.id)+'">이 상품으로 상담하기</a>':'';
  }else{
    const w=S.portfolio.find(x=>x.id===sh.id);if(!w)return '';
    const specs=[['길이',w.length],['비율',w.ratio],['컷 수',w.cuts?w.cuts+'컷':''],['제작 기간',w.duration]].filter(x=>x[1]);
    const links=(w.links||[]).filter(l=>isUrl(l.url));
    const th=w.thumb||DEF_THUMB[w.id];body=(refSrc(w.video)?'<video class="bigvid" controls playsinline preload="metadata" src="'+esc(refSrc(w.video))+'"'+(refSrc(th)?' poster="'+esc(refSrc(th))+'"':'')+'></video>':refSrc(th)?'<div class="bigwrap">'+pic(th,'bigimg','',w.name)+'</div>':'<div class="ph bigph">썸네일</div>')+'<span class="pill cat'+catIdx(w.category)+'">'+esc(w.category)+(w.collab?' · '+esc(w.collab):'')+'</span> <span class="pill s0">'+esc(w.format)+'</span><h2 id="sh-title">'+esc(w.name)+'</h2><p>'+esc(w.summary||w.purpose||'')+'</p>'+
    (specs.length?'<div class="specs">'+specs.map(([l,v])=>'<div class="spec"><span>'+l+'</span><b class="num">'+esc(v)+'</b></div>').join('')+'</div>':'')+
    (w.roles&&w.roles.length?'<h3>내 역할</h3><div class="chipset">'+w.roles.map(r=>'<span class="tchip">'+esc(r)+'</span>').join('')+'</div>':'')+
    (w.tools&&w.tools.length?'<h3>사용 도구</h3><div class="chipset">'+w.tools.map(r=>'<span class="tchip">'+esc(r)+'</span>').join('')+'</div>':'')+
    (w.process&&w.process.length?'<h3>제작 과정</h3><ol class="steps">'+w.process.map((x,i)=>'<li><span class="num">'+(i+1)+'</span><div><b>'+esc(x)+'</b></div></li>').join('')+'</ol>':'')+
    (w.result?'<h3>결과</h3><p>'+esc(w.result)+'</p>':'')+
    (w.intro?'<h3>샘플 소개</h3><p style="white-space:pre-line">'+esc(w.intro)+'</p>':'')+
    '<h3>제작 장면</h3><div class="thumbs"><div class="ph">스토리보드</div><div class="ph">장면 컷</div><div class="ph">장면 컷</div></div>';
    foot=(links.length?links.map((l,i)=>'<a class="btn'+(i===0?' primary':'')+'" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+esc(l.label||'샘플 보기')+' ↗</a>').join(''):'')+(main&&!links.length?'<a class="btn primary" href="'+esc(main.url)+'" target="_blank" rel="noopener noreferrer">비슷한 작업 문의하기</a>':'');
  }
  return '<div class="sheet-back" data-act="backdrop"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-title"><div class="sheet-h"><span class="eyebrow">'+(sh.type==='product'?'상품 정보':'제작 기록')+'</span><button class="icon-btn" data-act="close" aria-label="닫기">'+IC.x+'</button></div><div class="sheet-b">'+body+'</div>'+(foot?'<div class="sheet-f">'+foot+'</div>':'')+'</section></div>';
}

function bannerAction(a){
  const P=S.pub;
  if(a.startsWith('cat:')){P.cat=a.slice(4);P.scrollTo='products'}
  else if(a.startsWith('tab:')){P.tab=a.slice(4);P.scrollTo='btabs'}
  render();
}
document.addEventListener('click',async ev=>{
  const t=ev.target.closest('[data-act]');if(!t)return;
  const act=t.dataset.act,id=t.dataset.id,list=t.dataset.list;
  if(act==='backdrop'){if(ev.target===t)closeModal();return}
  if(act==='ask-product'){const p=S.products.find(x=>x.id===id);if(p)copyText('안녕하세요, 모형곰 “'+p.name+'” 상품 상담 원합니다.','문의 문구를 복사했어요. 대화창에 붙여 넣어 주세요.');return}
  if(['totop','pcat','pq-clear','banner'].includes(act))clearTimeout(searchTimer);
  if(act==='totop'){ev.preventDefault();S.pub.cat='전체';S.pub.q='';render();window.scrollTo({top:0});return}
  ev.stopPropagation();
  switch(act){
    case 'close':closeModal();break;
    case 'copy-mail':copyText(t.dataset.v,'이메일 주소를 복사했어요.');break;
    case 'pcat':S.pub.cat=t.dataset.cat;S.pub.q='';render();break;
    case 'pq-clear':S.pub.q='';render();break;
    case 'banner':{const b=(S.brand.banners||[]).filter(x=>x.title)[+t.dataset.i];if(b)bannerAction(b.action||'');break}
    case 'dot':goBanner(+t.dataset.i,true);break;
    case 'ptab':S.pub.tab=t.dataset.tab;render();break;
    case 'wcat':S.pub.workCat=t.dataset.cat;render();break;
    case 'sheet-product':S.pub.sheet={type:'product',id};renderModal();break;
    case 'sheet-work':S.pub.sheet={type:'work',id};renderModal();break;
  }
});

document.addEventListener('scroll',ev=>{
  const t=ev.target;
  if(t&&t.id==='track'){const i=Math.round(t.scrollLeft/Math.max(1,t.clientWidth));if(i!==S.pub.banner){S.pub.banner=i;setDots(i)}}
},true);


let searchTimer=null;
document.addEventListener('input',ev=>{
  if(ev.target.id==='pq'&&!ev.isComposing){
    clearTimeout(searchTimer);
    const query=ev.target.value;
    searchTimer=setTimeout(()=>{S.pub.q=query;render()},160);
  }
});
document.addEventListener('compositionend',ev=>{
  if(ev.target.id==='pq')ev.target.dispatchEvent(new Event('input',{bubbles:true}));
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&document.getElementById('modal').innerHTML&&!document.getElementById('dialog').innerHTML)closeModal();
});
document.addEventListener('error',ev=>{
  const t=ev.target;
  if(t&&t.tagName==='IMG'){t.style.visibility='hidden';t.setAttribute('aria-hidden','true')}
},true);
function closeModal(){
  if(S.draft||S.pdraft)return closeAdminModal();
  S.pub.sheet=null;renderModal();
}
function loadAdmin(){
  return Promise.all([
    new Promise((resolve,reject)=>{
      const link=document.createElement('link');link.rel='stylesheet';link.href='admin.css';
      link.onload=resolve;link.onerror=reject;document.head.append(link);
    }),
    new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='admin.js';
      script.onload=resolve;script.onerror=reject;document.head.append(script);
    })
  ]);
}
S.products=SNAP.products.map(normProduct);S.prodLoaded=true;
S.portfolio=(SNAP.portfolio||[]).map(clone);S.folioLoaded=true;
S.brand=mergeBrand(SNAP.brand);

/* ---------- 시작 ---------- */
render();
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s)})}
window.addEventListener('hashchange',()=>{if(/^#admin$/i.test(location.hash)&&!S.canEdit)location.reload()});
(async function init(){
  let c=window.claude;
  if((!c||typeof c.use!=='function')&&/^#admin$/i.test(location.hash)){
    try{await loadScript('local-store.js');c=window.__localClaude;S.local=true}catch(e){toast('local-store.js 파일을 찾지 못했어요. 사이트 폴더에 함께 있는지 확인해 주세요.')}
  }
  if(!c||typeof c.use!=='function'){S.dbMissing=!SNAP;S.folioLoaded=true;S.prodLoaded=true;render();return}
  const [user,db]=await Promise.all([c.use('user').catch(()=>null),c.use('db').catch(()=>null)]);
  S.db=db;
  try{S.canEdit=!!(user&&await user.canEdit())}catch(_){S.canEdit=false}
  if(!db){S.dbMissing=!SNAP;S.folioLoaded=true;S.prodLoaded=true;S.canEdit=false}
  if(S.canEdit){
    try{await loadAdmin();S.assets=await c.use('assets').catch(()=>null)}catch(e){S.canEdit=false;toast('관리 화면을 불러오지 못했어요. 새로고침해 주세요.')}
  }
  S.mode=S.canEdit?'admin':'public';
  render();
  if(!db)return;
  const timer=setTimeout(()=>{S.slow=true;render()},10000);
  const settle=()=>{if((S.projLoaded||!S.canEdit)&&S.folioLoaded&&S.prodLoaded){clearTimeout(timer);S.slow=false}};
  db.doc('settings/brand').onSnapshot(snap=>{
    S.brand=mergeBrand(snap.exists?snap.data():null);
    if(S.page!=='brand')S.brandDraft=null;
    render();
  },()=>{});
  db.collection('portfolio').onSnapshot(snap=>{
    S.portfolio=snap.docs.map(d=>Object.assign({id:d.id},clone(d.data())));
    if(!snap.metadata.fromCache){S.liveFolio=true}
    if(!snap.metadata.fromCache||snap.size)S.folioLoaded=true;
    if(!snap.metadata.fromCache)settle();
    render();if(S.pub.sheet)renderModal();
  },()=>{S.folioLoaded=true;settle();render()});
  db.collection('products').onSnapshot(snap=>{
    S.products=snap.docs.map(d=>normProduct(Object.assign({id:d.id},clone(d.data()))));
    if(!snap.metadata.fromCache){S.liveProd=true}
    if(!snap.metadata.fromCache||snap.size)S.prodLoaded=true;
    if(!snap.metadata.fromCache)settle();
    render();if(S.pub.sheet)renderModal();
  },()=>{S.prodLoaded=true;settle();render()});
  if(S.canEdit){
    db.collection('media').onSnapshot(snap=>{S.media=snap.docs.map(d=>Object.assign({id:d.id},clone(d.data()))).filter(m=>m.assetId||m.path);render();if(S.draft||S.pdraft)renderModal()},()=>{});
    db.collection('projects').onSnapshot(snap=>{
      S.projects=snap.docs.map(d=>normalize(Object.assign({id:d.id},clone(d.data()))));
      if(!snap.metadata.fromCache||snap.size)S.projLoaded=true;
      if(!snap.metadata.fromCache)settle();
      render();
    },()=>{S.projLoaded=true;S.loadError='프로젝트를 불러오지 못했어요. 페이지를 다시 열어 주세요.';settle();render()});
  }
})();

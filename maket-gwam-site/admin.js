'use strict';

const STAGES=['아이디어','기획','제작 중','검토','제출 완료','완료'];
const COLLABS=['제품 협찬','유료 의뢰','공동 제작'];
const FORMATS=['숏폼','CF·광고','정책·공익 영상','캐릭터','롱폼','기타'];
const ROLES=['기획','시나리오','캐릭터 디자인','이미지 생성','영상 생성','편집','자막','사운드·음악','내레이션'];
const IMAGES=[
  ['img/bears-collage.webp','곰 캐릭터 모음'],['img/bear-multi.webp','이것저것 하는 곰 (투명 배경)'],['img/kikaboni.webp','키카보니'],['img/highlight.webp','하이라이트TV 공모전'],
  ['img/110.webp','110 우린 여기 있어'],['img/hwaseong-cf.webp','화성시 CF'],['img/hwaseong-short.webp','화성 숏폼'],['img/volunteer.webp','자원봉사'],
  ['img/eundun.webp','은둔 01 커버'],['img/nupda.webp','넾다 세일'],['img/storybook.webp','동화책'],['img/youtube-banner.webp','유튜브 배너 (곰의 바다)'],
  ['img/logo-icon.webp','로고: 원형 아이콘'],['img/logo-main.webp','로고: 기본형'],['img/logo-creative.webp','로고: 크리에이티브형'],['img/logo-signature.webp','로고: 시그니처형'],
  ['img/icon-square.webp','아이콘: 네이비 곰'],['img/icon-goggles.webp','아이콘: 고글 곰'],['img/icon-play.webp','아이콘: 재생'],['img/icon-clapper.webp','아이콘: 클래퍼'],['img/icon-camera.webp','아이콘: 카메라'],
  ['img/bear-video.webp','곰: 영상·편집'],['img/bear-plan.webp','곰: 기획·디자인'],['img/bear-market.webp','곰: 마케팅·운영'],['img/bear-story.webp','곰: 스토리·콘텐츠']
];
const CAT_COLORS=['#B8352C','#253653','#6E58B0'];
const FIELDS=[['name','프로젝트명'],['category','작업 구분'],['collab','협업 형태'],['format','형식'],['stage','현재 단계'],['deadline','마감일'],['purpose','목적'],['message','핵심 메시지'],['tools','사용 도구'],['memo','수정 메모'],['submitted','제출 여부'],['public','고객 화면 공개'],['scenes','장면 구성'],['tasks','체크리스트'],['summary','한 줄 요약'],['portfolio','샘플 소개'],['roles','내 역할'],['length','길이'],['ratio','비율'],['duration','제작 기간'],['process','제작 과정'],['result','결과'],['releasedAt','출품·납품일'],['links','링크'],['thumb','썸네일'],['video','영상']];
const TPL={
  scenes:()=>({title:'',caption:'',music:'',edit:''}),tasks:()=>({text:'',done:false}),process:()=>({text:''}),links:()=>({label:'',url:''}),
  banners:()=>({eyebrow:'',title:'',sub:'',action:'tab:works',image:''}),contacts:()=>({label:'',url:''}),workflow:()=>({title:'',desc:''}),
  notices:()=>({date:todaySeoul(),title:'',body:''}),reviews:()=>({author:'',product:'',text:'',date:todaySeoul()})
};
const isActive=p=>!['완료','제출 완료'].includes(p.stage);
const isNear=p=>isActive(p)&&p.deadline&&dday(p.deadline)<=7;
const splitTools=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const uniq=a=>[...new Set(a)];
const QUICK=[['all','전체'],['active','진행 중'],['near','마감 임박'],['submitted','제출 완료'],['public','공개 중']];
const UP_TYPES={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',mp4:'video/mp4',webm:'video/webm'};

function mediaRef(m){return m.path||'asset:'+m.assetId}
function mediaSrc(m){return m.path||'/_blob/'+m.assetId}
function mediaOpts(kind){return S.media.filter(m=>m.kind===kind).map(m=>[mediaRef(m),'내 '+(kind==='video'?'영상':'파일')+': '+(m.name||'이름 없음')])}

function imageOpts(){return mediaOpts('image').concat(IMAGES.map(([v,l])=>[v,'기본: '+l]))}

function mediaLabel(v,kind){
  if(!v||v==='none')return kind==='video'?'영상 없음':'사진 없음';
  const m=S.media.find(x=>mediaRef(x)===v);if(m)return m.name||'내 파일';
  const b=IMAGES.find(x=>x[0]===v);return b?b[1]:v;
}
function pickThumb(v,kind){
  const src=kind==='video'?'':refSrc(v);
  return (src?'<img src="'+esc(src)+'" alt="">':'<span class="imgpick-ph">'+(kind==='video'&&v&&v!=='none'?'영상':'없음')+'</span>')+'<span class="imgpick-name">'+esc(mediaLabel(v,kind))+'</span><em>바꾸기</em>';
}
function imgSelect(id,attrs,val,kind){
  kind=kind||'image';
  const opts=kind==='video'?mediaOpts('video'):imageOpts();
  if(val&&val!=='none'&&!opts.some(o=>o[0]===val))opts.unshift([val,'(지금 선택된 파일)']);
  return '<div class="imgpick"><button type="button" class="imgpick-btn" data-act="pick-field" data-for="'+id+'" data-kind="'+kind+'">'+pickThumb(val,kind)+'</button><select class="hidden" id="'+id+'" '+attrs+' tabindex="-1" aria-hidden="true"><option value="none">없음</option>'+opts.map(([v,l])=>'<option value="'+esc(v)+'"'+(v===val?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';
}

function todaySeoul(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}

function dday(d){if(!d)return null;return Math.round((Date.parse(d+'T00:00:00Z')-Date.parse(todaySeoul()+'T00:00:00Z'))/86400000)}

function shortDate(d){return d?d.replace(/-/g,'. '):'마감일 미정'}

function ddayLabel(d){const n=dday(d);if(n==null)return '';return n===0?'D-day':n>0?'D-'+n:'D+'+(-n)}

function stageIdx(s){const i=STAGES.indexOf(s);return i<0?0:i}

function errMsg(e){
  const c=e&&e.code;
  if(c==='quota_exceeded')return '저장 공간이 가득 찼어요. 휴지통의 프로젝트를 영구 삭제한 뒤 다시 시도해 주세요.';
  if(c==='invalid_argument')return '저장 권한이 없거나 내용이 너무 커요. 편집 권한이 있는 계정으로 열었는지 확인해 주세요.';
  if(c==='resource_exhausted')return '요청이 너무 많아요. 잠시 뒤 다시 저장해 주세요.';
  return '저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.';
}

function histValue(v){
  if(typeof v==='boolean')return v?'예':'아니요';
  if(Array.isArray(v)){
    if(!v.length)return '없음';
    return v.map(x=>typeof x==='string'?x:'url' in x?(x.label||'링크')+': '+x.url:'done' in x?(x.done?'완료':'할 일')+': '+x.text:'title' in x?(x.title||'')+'\n자막: '+(x.caption||'')+'\n음악: '+(x.music||'')+'\n편집: '+(x.edit||''):x.text||'').join('\n');
  }
  return String(v||'미입력');
}

function legacyCat(t){return t==='브랜드 콘텐츠'?'브랜드 협업':t==='롱폼'?'오리지널':'공모전 출품작'}

function legacyFormat(t){return ({'정책영상':'정책·공익 영상','자원봉사 영상':'정책·공익 영상','브랜드 콘텐츠':'숏폼','롱폼':'롱폼','공모전':'숏폼'})[t]||(FORMATS.includes(t)?t:'기타')}

function arr(v,f){return Array.isArray(v)?v.map(f):[]}

function normalize(raw){
  const p=raw||{};
  let links=arr(p.links,l=>({id:String(l.id||uid()),label:String(l.label||''),url:String(l.url||'')}));
  if(!links.length&&isUrl(p.file))links=[{id:uid(),label:'최종 파일',url:String(p.file)}];
  return {
    id:String(p.id||uid()).replace(/[^a-zA-Z0-9_\-.~:@+]/g,'-').slice(0,120),
    name:String(p.name||''),
    category:CATS.includes(p.category)?p.category:legacyCat(p.type),
    collab:COLLABS.includes(p.collab)?p.collab:'',
    format:FORMATS.includes(p.format)?p.format:legacyFormat(p.type),
    purpose:String(p.purpose||''),message:String(p.message||''),
    stage:STAGES.includes(p.stage)?p.stage:'아이디어',deadline:/^\d{4}-\d{2}-\d{2}$/.test(p.deadline||'')?p.deadline:'',
    submitted:!!p.submitted,public:!!p.public,tools:String(p.tools||''),memo:String(p.memo||''),
    scenes:arr(p.scenes,s=>({id:String(s.id||uid()),title:String(s.title||''),caption:String(s.caption||''),music:String(s.music||''),edit:String(s.edit||'')})),
    tasks:arr(p.tasks,t=>({id:String(t.id||uid()),text:String(t.text||''),done:!!t.done})),
    history:Array.isArray(p.history)?p.history.slice(0,80):[],
    summary:String(p.summary||''),portfolio:String(p.portfolio||''),
    roles:arr(p.roles,String).filter(r=>r),length:String(p.length||''),ratio:String(p.ratio||''),duration:String(p.duration||''),
    process:arr(p.process,x=>({id:String(x.id||uid()),text:String(typeof x==='string'?x:x.text||'')})),
    result:String(p.result||''),releasedAt:/^\d{4}-\d{2}-\d{2}$/.test(p.releasedAt||'')?p.releasedAt:'',links,thumb:String(p.thumb||DEF_THUMB[p.id]||''),video:String(p.video||''),
    deletedAt:String(p.deletedAt||''),updatedAt:String(p.updatedAt||'')
  };
}

function blank(){return normalize({id:uid(),category:'공모전 출품작',format:'숏폼',stage:'아이디어'})}

function ask(msg,ok,danger){
  return new Promise(res=>{
    const el=document.getElementById('dialog');
    el.innerHTML='<div class="dialog-back"><div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-msg"><p id="dlg-msg">'+esc(msg)+'</p><div><button class="btn" id="dlg-no">취소</button><button class="btn '+(danger?'danger':'primary')+'" id="dlg-ok">'+esc(ok||'확인')+'</button></div></div></div>';
    const done=v=>{el.innerHTML='';res(v)};
    document.getElementById('dlg-no').onclick=()=>done(false);
    document.getElementById('dlg-ok').onclick=()=>done(true);
    document.getElementById('dlg-ok').focus();
  });
}

function renderAdmin(){
  const live=S.projects.filter(p=>!p.deletedAt),trash=S.projects.filter(p=>p.deletedAt);
  const nav=[['dashboard','대시보드'],['projects','프로젝트',live.length],['portfolio','포트폴리오'],['products','상품 관리',S.products.length],['media','사진·영상',S.media.length],['trash','휴지통',trash.length],['brand','브랜드 설정']];
  const titles={dashboard:['오늘의 작업실','아이디어부터 마지막 컷까지, 오늘의 작업을 이어가세요.'],projects:['모든 프로젝트','기획부터 완성까지 흩어진 작업을 한눈에 봅니다.'],portfolio:['포트폴리오','완료한 작업을 모으고, 고객 화면에 보일 샘플을 고릅니다.'],products:['상품 관리','고객 화면의 상품 카드와 기획전을 관리합니다.'],trash:['휴지통','삭제한 작업을 보관합니다. 언제든 다시 복원할 수 있어요.'],media:['사진·영상','직접 찍거나 만든 사진, 아이콘, 영상을 올리고 관리합니다.'],brand:['브랜드 설정','고객 화면의 배너, 소개, 공지, 후기, 연락처를 고칩니다.']};
  const [t,sub]=titles[S.page];
  let body='';
  const waiting=msg=>'<div class="empty">'+(S.loadError?esc(S.loadError):S.slow?'데이터를 아직 불러오지 못했어요. 연결이 느리거나 끊겼을 수 있어요.':msg)+'</div>';
  if(S.page==='brand')body=renderBrandForm();
  else if(S.page==='media')body=renderMedia();
  else if(S.page==='products')body=S.prodLoaded?renderProductsAdmin():waiting('상품을 불러오는 중입니다…');
  else if(!S.projLoaded)body=waiting('프로젝트를 불러오는 중입니다…');
  else if(S.page==='dashboard')body=renderDashboard(live);
  else if(S.page==='projects')body=renderTable(live,false);
  else if(S.page==='trash')body=renderTable(trash,true);
  else if(S.page==='portfolio')body=renderFolioAdmin(live);
  const action=S.page==='brand'||S.page==='media'?'':S.page==='products'?'<button class="btn primary" data-act="pnew">+ 새 상품</button>':'<button class="btn primary" data-act="new">+ 새 프로젝트</button>';
  return '<div class="app"><aside class="side"><button class="brand" data-act="nav" data-page="dashboard">'+bear()+'<span><b>모형곰</b><small>maket.gwam</small></span></button>'+
    '<nav class="nav" aria-label="관리 메뉴">'+nav.map(([k,l,c])=>'<button class="'+(S.page===k?'on':'')+'" data-act="nav" data-page="'+k+'"><span>'+l+'</span>'+(c!=null?'<span class="cnt num">'+c+'</span>':'')+'</button>').join('')+'</nav>'+
    '<button class="btn" data-act="preview">고객 화면 보기</button>'+
    '<div class="side-note"><b>좋은 발견을,<br>끌리는 콘텐츠로.</b>이 관리 화면은 편집 권한이 있는 사람에게만 보여요.</div></aside>'+
    '<main class="main"><div class="head"><div><div class="eyebrow" style="text-transform:none;letter-spacing:.08em">maket.gwam studio</div><h1>'+t+'</h1><p>'+sub+'</p></div>'+action+'</div>'+snapNote()+body+'</main></div>';
}

function renderDashboard(live){
  const ongoing=live.filter(isActive),near=live.filter(isNear).sort((a,b)=>a.deadline.localeCompare(b.deadline)),submitted=live.filter(p=>p.submitted),pub=live.filter(p=>p.public);
  const stat=(f,label,n,sub,warn)=>'<button class="stat'+(warn&&n?' warn':'')+'" data-act="filter-go" data-filter="'+f+'"><span>'+label+'</span><strong class="num">'+n+'</strong><small>'+sub+'</small></button>';
  const counts=CATS.map((c,i)=>({t:c,n:live.filter(p=>p.category===c).length,c:CAT_COLORS[i]}));
  return '<section class="welcome"><div><h2>차근차근, 하나의 작품으로.</h2><p>지금 <b class="num">'+ongoing.length+'개</b>의 이야기가 만들어지고 있어요.'+(near.length?' 마감이 가까운 작업이 <b class="num">'+near.length+'개</b> 있어요.':'')+'</p></div>'+bear('bigbear')+'</section>'+
  '<section class="stats">'+stat('active','진행 중',ongoing.length,'제출·완료 전 작업')+stat('near','마감 임박',near.length,'7일 이내, 지난 마감 포함',true)+stat('submitted','제출 완료',submitted.length,'제출 여부를 체크한 작업')+stat('public','고객 화면 공개',pub.length,'샘플 탭에 노출 중')+'</section>'+
  '<div class="grid2"><section class="panel"><div class="panel-h"><div><h3>진행 중인 프로젝트</h3><p>다음 장면을 기다리는 작업들</p></div><button class="btn ghost" data-act="filter-go" data-filter="active">전체 보기 →</button></div>'+
  (ongoing.length?'<div class="cards">'+ongoing.sort((a,b)=>(a.deadline||'9999').localeCompare(b.deadline||'9999')).slice(0,6).map((p,i)=>'<button class="pcard" data-act="open" data-id="'+esc(p.id)+'"><div class="pcover c'+(i%3)+'"><small>'+esc(p.category)+'</small><b>'+esc(p.name)+'</b></div><div class="pbody"><div class="row"><span class="pill s'+stageIdx(p.stage)+'">'+esc(p.stage)+'</span><span class="muted" style="font-size:12px">'+esc(p.format)+'</span></div><p>'+esc(p.purpose||p.message||'목적을 적어 보세요.')+'</p><footer><span class="'+(isNear(p)?'late':'')+'">'+shortDate(p.deadline)+(p.deadline?' · '+ddayLabel(p.deadline):'')+'</span><span class="num">✓ '+p.tasks.filter(t=>t.done).length+'/'+p.tasks.length+'</span></footer></div></button>').join('')+'</div>':'<div class="empty">진행 중인 작업이 없어요. 새 프로젝트를 추가해 보세요.</div>')+
  '</section><section class="panel"><div class="panel-h"><div><h3>작업 구분</h3><p>전체 <b class="num">'+live.length+'</b>개</p></div></div><div class="typebar">'+counts.filter(x=>x.n).map(x=>'<span style="flex:'+x.n+';background:'+x.c+'" title="'+esc(x.t)+'"></span>').join('')+'</div>'+
  counts.map(x=>'<div class="trow"><span><i style="background:'+x.c+'"></i>'+esc(x.t)+'</span><b class="num">'+x.n+'</b></div>').join('')+'</section></div>'+
  '<section class="strip'+(near.length?'':' ok')+'"><div><b>'+(near.length?'다가오는 마감일을 확인하세요.':'7일 안에 다가오는 마감이 없어요.')+'</b><p>'+(near.length?near.map(p=>esc(p.name)+' ('+ddayLabel(p.deadline)+')').join(' · '):'마감일은 프로젝트의 기본 정보에서 정할 수 있어요.')+'</p></div><button class="btn ghost" data-act="nav" data-page="projects">프로젝트 관리 →</button></section>';
}

function applyFilter(list){
  const f=S.filter,q=S.query.trim().toLowerCase();
  return list.filter(p=>{
    if(f==='active'&&!isActive(p))return false;
    if(f==='near'&&!isNear(p))return false;
    if(f==='submitted'&&!p.submitted)return false;
    if(f==='public'&&!p.public)return false;
    if(f.startsWith('cat:')&&p.category!==f.slice(4))return false;
    if(f.startsWith('stage:')&&p.stage!==f.slice(6))return false;
    return !q||[p.name,p.category,p.format,p.message,p.purpose,p.tools,p.summary].join(' ').toLowerCase().includes(q);
  }).sort((a,b)=>S.sort==='name'?a.name.localeCompare(b.name,'ko'):S.sort==='updated'?(b.updatedAt||'').localeCompare(a.updatedAt||''):((a.submitted?1:0)-(b.submitted?1:0))||(a.deadline||'9999').localeCompare(b.deadline||'9999')||a.name.localeCompare(b.name,'ko'));
}

function renderTable(list,trash){
  const rows=applyFilter(list);
  const chip=(k,l)=>'<button class="chip'+(S.filter===k?' on':'')+'" data-act="filter" data-filter="'+esc(k)+'">'+esc(l)+'</button>';
  const chips=trash?'':'<div class="chips" role="group" aria-label="필터">'+QUICK.map(([k,l])=>chip(k,l)).join('')+'<span class="chip sep">|</span>'+CATS.map(c=>chip('cat:'+c,c)).join('')+'<span class="chip sep">|</span>'+STAGES.map(s=>chip('stage:'+s,s)).join('')+'</div>';
  return '<div class="tools"><input class="input" id="q" type="search" placeholder="프로젝트명, 메시지, 도구 검색" aria-label="프로젝트 검색" value="'+esc(S.query)+'"><select class="input" id="sort" aria-label="정렬"><option value="deadline"'+(S.sort==='deadline'?' selected':'')+'>미제출 먼저 · 마감일 빠른 순</option><option value="updated"'+(S.sort==='updated'?' selected':'')+'>최근 수정 순</option><option value="name"'+(S.sort==='name'?' selected':'')+'>이름 순</option></select></div>'+chips+
  '<div class="tablewrap"><table><thead><tr><th>프로젝트</th><th>작업 구분</th><th>단계</th><th>마감일</th><th>제출</th><th>고객 화면</th><th></th></tr></thead><tbody>'+
  rows.map(p=>'<tr data-act="open" data-id="'+esc(p.id)+'"><td><button class="pname" data-act="open" data-id="'+esc(p.id)+'">'+esc(p.name||'(이름 없음)')+'</button><small>'+esc(p.format)+(p.collab&&p.category==='브랜드 협업'?' · '+esc(p.collab):'')+'</small></td><td><span class="pill cat'+catIdx(p.category)+'">'+esc(p.category)+'</span></td><td><span class="pill s'+stageIdx(p.stage)+'">'+esc(p.stage)+'</span></td><td class="num '+(isNear(p)&&!trash?'late':'muted')+'">'+shortDate(p.deadline)+(p.deadline&&isActive(p)?' <small>'+ddayLabel(p.deadline)+'</small>':'')+'</td><td>'+(p.submitted?'✓ 제출':'<span class="muted">미제출</span>')+'</td><td><span class="dot'+(p.public?' on':'')+'"></span>'+(p.public?'공개':'비공개')+'</td><td style="text-align:right;white-space:nowrap">'+(trash?'<button class="btn sm" data-act="restore" data-id="'+esc(p.id)+'">복원</button> <button class="btn sm danger" data-act="purge" data-id="'+esc(p.id)+'">영구 삭제</button>':'<span class="muted">›</span>')+'</td></tr>').join('')+
  '</tbody></table>'+(rows.length?'':'<div class="empty">'+(trash?'휴지통이 비어 있어요.':'조건에 맞는 프로젝트가 없어요.')+'</div>')+'</div>';
}

function folioText(p){
  const spec=[p.length,p.ratio,p.duration&&'제작 '+p.duration].filter(Boolean).join(' · ');
  return [p.name,p.category+(p.collab&&p.category==='브랜드 협업'?' · '+p.collab:'')+' | '+p.format,p.summary||p.message,spec,p.roles.length?'역할: '+p.roles.join(', '):'','사용 도구: '+(p.tools||'미입력'),p.portfolio].concat(p.links.filter(l=>isUrl(l.url)).map(l=>(l.label||'링크')+': '+l.url)).filter(Boolean).join('\n');
}

function renderFolioAdmin(live){
  const rel=p=>p.releasedAt||((p.submitted||p.stage==='완료')?p.deadline:'')||'';
  const done=live.filter(p=>p.stage==='완료'||p.public).sort((a,b)=>rel(b).localeCompare(rel(a))||a.name.localeCompare(b.name,'ko'));
  return '<div class="banner-note">완료했거나 공개로 표시한 작업이 모여요. <b>공개</b>한 작업만 고객 화면의 샘플 탭에 보입니다. 메모, 장면별 내용, 체크리스트는 공개되지 않아요.</div>'+
  (done.length?'<div class="folio">'+done.map(p=>'<article class="fcard"><div class="fcover"><small>'+esc(p.category)+' · '+esc(p.format)+'</small><b>'+esc(p.name)+'</b></div><div class="fbody"><div><span class="pill '+(p.public?'s5':'s0')+'">'+(p.public?'고객 화면 공개':'비공개')+'</span> <span class="muted" style="font-size:12px">출품·납품 '+(rel(p)?esc(rel(p).replace(/-/g,'. ')):'날짜 없음')+'</span></div><p>'+esc(p.summary||p.purpose||'제작 기록에 한 줄 요약을 적어 보세요.')+'</p><div class="acts"><button class="btn sm" data-act="open-folio" data-id="'+esc(p.id)+'">제작 기록 편집</button><button class="btn sm" data-act="toggle-public" data-id="'+esc(p.id)+'">'+(p.public?'비공개로':'공개하기')+'</button><button class="btn ghost sm" data-act="copy-folio" data-id="'+esc(p.id)+'">카드 복사</button></div></div></article>').join('')+'</div>':'<div class="empty">아직 완료한 작업이 없어요.</div>');
}

function renderProductsAdmin(){
  const list=S.products.slice().sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'ko'));
  return '<div class="banner-note">“예시” 표시가 켜진 상품은 고객 화면에 예시 배지가 붙어요. 실제 판매 가격이 정해지면 끄세요. <b>기획전</b>을 켠 상품은 “'+esc(S.brand.featureTitle)+'” 칸에 나와요.</div>'+
  (list.length?'<div class="listedit">'+list.map(p=>'<button class="prow" data-act="popen" data-id="'+esc(p.id)+'">'+pic(p.image,'rimg','사진')+'<div><b>'+esc(p.name)+'</b> '+(p.example?'<span class="tag-ex">예시</span> ':'')+(p.featured?'<span class="pill s4">기획전</span>':'')+'<small>'+esc(p.category)+' · '+esc(p.desc)+'</small></div><div class="price" style="justify-content:flex-end;text-align:right"><s class="num">'+won(p.price)+'</s>'+(pct(p.price,p.sale)?'<em class="num">'+pct(p.price,p.sale)+'%</em>':'')+'<strong class="num">'+won(p.sale||p.price)+'</strong></div></button>').join('')+'</div>':'<div class="empty">상품이 없어요. 새 상품을 추가해 보세요.</div>');
}

function listRows(list,key,cols,opts){
  opts=opts||{};
  return '<div class="listedit">'+list.map(it=>'<div class="lrow" style="grid-template-columns:'+cols.map(c=>c.w||'1fr').join(' ')+' auto">'+cols.map(c=>{
    const id='bl-'+key+'-'+c.k+'-'+esc(it.id),attrs='id="'+id+'" data-bl="'+key+'" data-item="'+esc(it.id)+'" data-key="'+c.k+'" aria-label="'+esc(c.l)+'" placeholder="'+esc(c.ph||c.l)+'"';
    if(c.type==='textarea')return '<textarea class="input" rows="2" '+attrs+'>'+esc(it[c.k])+'</textarea>';
    if(c.type==='image')return imgSelect(id,'data-bl="'+key+'" data-item="'+esc(it.id)+'" data-key="'+c.k+'"',it[c.k]||'none');
    if(c.type==='select')return '<select class="input" '+attrs+'>'+c.options.map(([v,l])=>'<option value="'+esc(v)+'"'+(it[c.k]===v?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';
    return '<input class="input" type="'+(c.type||'text')+'" '+attrs+' value="'+esc(it[c.k])+'">';
  }).join('')+'<button class="btn ghost" data-act="bl-del" data-list="'+key+'" data-id="'+esc(it.id)+'" aria-label="삭제">삭제</button></div>').join('')+'<div><button class="btn sm" data-act="bl-add" data-list="'+key+'">+ '+esc(opts.add||'추가')+'</button></div></div>';
}

function renderBrandForm(){
  if(!S.brandDraft)S.brandDraft=clone(S.brand);
  const b=S.brandDraft,f=b.footer;
  const actions=[['cat:캐릭터','상품: 캐릭터'],['cat:AI 숏폼','상품: AI 숏폼'],['cat:기획','상품: 기획'],['cat:패키지','상품: 패키지'],['tab:story','탭: 이야기'],['tab:process','탭: 작업 과정'],['tab:works','탭: 샘플'],['tab:reviews','탭: 후기']];
  const fi=(k,l,ph,wide,area)=>'<label class="field'+(wide?' wide':'')+'" for="b-'+k+'">'+l+(area?'<textarea id="b-'+k+'" data-brand="'+k+'" rows="4">'+esc(b[k])+'</textarea>':'<input id="b-'+k+'" data-brand="'+k+'" placeholder="'+esc(ph||'')+'" value="'+esc(b[k])+'">')+'</label>';
  return '<section class="panel sect"><h3>상단 · 소개</h3><p>고객 화면 맨 위 유틸바와 “이야기” 탭에 들어가는 문구예요.</p><div class="form">'+fi('util','유틸바 한 줄','오픈 특가 진행 중',true)+'<label class="field" for="b-logo">로고'+imgSelect('b-logo','data-brand="logo"',b.logo)+'</label><label class="field" for="b-story">이야기 탭 이미지'+imgSelect('b-story','data-brand="storyImage"',b.storyImage)+'</label>'+fi('tagline','슬로건','',true)+fi('intro','브랜드 소개','',true,true)+fi('featureTitle','기획전 제목')+fi('featureSub','기획전 설명')+'</div></section>'+
  '<section class="panel sect"><h3>글꼴</h3><p>제목과 본문 글꼴을 골라요. 고른 뒤 아래 “브랜드 설정 저장”을 눌러야 반영돼요. 고객 화면 미리보기의 “글꼴” 버튼으로 바로 바꿀 수도 있어요.</p>'+fontRows(b,'bfont')+'</section>'+
  '<section class="panel sect"><h3>카테고리 아이콘</h3><p>“사진·영상”에 올린 아이콘(PNG·SVG, 정사각형 추천)을 고르면 기본 아이콘 대신 보여요.</p><div class="form">'+['전체'].concat(PCATS).map((c,i)=>'<label class="field" for="ci-'+i+'">'+esc(c)+imgSelect('ci-'+i,'data-caticon="'+esc(c)+'"',(b.catIcons||{})[c]||'none')+'</label>').join('')+'</div></section>'+
  '<section class="panel sect"><h3>롤링 배너</h3><p>배너를 누르면 이동할 곳을 고를 수 있어요. 이미지는 나중에 넣을 수 있게 자리만 잡혀 있어요.</p>'+listRows(b.banners,'banners',[{k:'eyebrow',l:'작은 글씨',w:'110px'},{k:'title',l:'제목',w:'1.4fr'},{k:'sub',l:'설명',w:'1.6fr',type:'textarea'},{k:'action',l:'누르면 이동',w:'140px',type:'select',options:actions},{k:'image',l:'이미지',w:'190px',type:'image'}],{add:'배너 추가'})+'</section>'+
  '<section class="panel sect"><h3>자주 쓰는 AI 도구</h3><p>프로젝트의 “사용 도구”에서 칩으로 고를 목록이에요. 쉼표로 구분해 적어 주세요.</p><label class="field" for="b-tools"><input id="b-tools" data-brand="toolText" value="'+esc(b.toolText!=null?b.toolText:b.toolOptions.join(', '))+'"></label></section>'+
  '<section class="panel sect"><h3>연락처</h3><p>맨 위 연락처가 하단 “상담 신청하기” 버튼과 상단 말풍선 아이콘이 돼요. 두 번째 연락처는 하단 보조 버튼이 돼요. 이메일 주소는 푸터에 글자와 복사 버튼으로 보여요.</p>'+listRows(b.contacts,'contacts',[{k:'label',l:'이름',ph:'예: 카카오톡 오픈채팅',w:'180px'},{k:'url',l:'주소',ph:'https:// 또는 이메일'}],{add:'연락처 추가'})+'</section>'+
  '<section class="panel sect"><h3>작업 과정</h3><p>“작업 과정” 탭에 순서대로 보여요.</p>'+listRows(b.workflow,'workflow',[{k:'title',l:'단계',w:'160px'},{k:'desc',l:'설명'}],{add:'단계 추가'})+'</section>'+
  '<section class="panel sect"><h3>공지사항</h3><p>최근 날짜가 위로 와요.</p>'+listRows(b.notices,'notices',[{k:'date',l:'날짜',type:'date',w:'150px'},{k:'title',l:'제목'},{k:'body',l:'내용',type:'textarea',w:'1.4fr'}],{add:'공지 추가'})+'</section>'+
  '<section class="panel sect"><h3>후기</h3><p>실제로 받은 후기만 올려 주세요. 이름은 “김○○”처럼 가려 주시는 게 좋아요.</p>'+listRows(b.reviews,'reviews',[{k:'author',l:'작성자',w:'110px'},{k:'product',l:'이용 상품',w:'140px'},{k:'text',l:'후기 내용',type:'textarea',w:'1.6fr'},{k:'date',l:'날짜',type:'date',w:'150px'}],{add:'후기 추가'})+'</section>'+
  '<section class="panel sect"><h3>푸터 정보</h3><p>비워 둔 칸은 고객 화면에서도 빈칸으로 보여요.</p><div class="form">'+[['company','상호'],['ceo','대표자'],['phone','연락처'],['bizno','사업자번호']].map(([k,l])=>'<label class="field" for="ft-'+k+'">'+l+'<input id="ft-'+k+'" data-footer="'+k+'" value="'+esc(f[k])+'"></label>').join('')+'</div></section>'+
  '<div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:28px;position:sticky;bottom:12px"><button class="btn" data-act="brand-reset">되돌리기</button><button class="btn primary" data-act="brand-save"'+(S.brandSaving?' disabled':'')+'>'+(S.brandSaving?'저장 중…':'브랜드 설정 저장')+'</button></div>'+
  '<section class="panel sect"><h3>데이터 옮기기</h3><p>이전 마켓곰 운영실에서 “내보내기”로 받은 JSON 파일을 가져오거나, 지금 프로젝트 전체를 JSON으로 복사할 수 있어요. 같은 ID의 프로젝트는 건너뜁니다.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn" for="import-file">JSON 파일 가져오기<input id="import-file" type="file" accept="application/json,.json" class="hidden"></label><button class="btn" data-act="export">전체 JSON 복사</button></div></section>';
}

function chipsField(list,selected,act,extraId){
  return '<div class="chipset">'+list.map(x=>'<button type="button" class="tchip'+(selected.includes(x)?' on':'')+'" data-act="'+act+'" data-v="'+esc(x)+'" aria-pressed="'+selected.includes(x)+'">'+esc(x)+'</button>').join('')+(extraId?'<input class="input tchip-add" id="'+extraId+'" placeholder="+ 직접 추가 후 Enter" aria-label="직접 추가">':'')+'</div>';
}

function dlRows(key,render){return S.draft[key].map((it,i)=>render(it,i)).join('')}

function projectModal(){
  const d=S.draft,exists=S.projects.some(p=>p.id===d.id),trashed=!!d.deletedAt;
  const tabs=['기본 정보','장면 구성','체크리스트','제작 기록','수정 이력'];
  const sel=(id,f,opts,val)=>'<select id="'+id+'" data-f="'+f+'">'+opts.map(o=>'<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';
  let body='';
  if(S.tab==='기본 정보'){
    const tools=splitTools(d.tools),opts=uniq(S.brand.toolOptions.concat(tools));
    body='<div class="form"><label class="field wide" for="f-name">프로젝트명 *<input id="f-name" data-f="name" maxlength="200" placeholder="어떤 이야기를 만들까요?" value="'+esc(d.name)+'"></label>'+
    '<label class="field" for="f-category">작업 구분'+sel('f-category','category',CATS,d.category)+'</label>'+
    (d.category==='브랜드 협업'?'<label class="field" for="f-collab">협업 형태<select id="f-collab" data-f="collab"><option value="">선택 안 함</option>'+COLLABS.map(o=>'<option'+(o===d.collab?' selected':'')+'>'+o+'</option>').join('')+'</select></label>':'<div class="field"><span>&nbsp;</span><span class="hint">'+esc(CAT_LINES[d.category])+'</span></div>')+
    '<label class="field" for="f-format">형식'+sel('f-format','format',FORMATS,d.format)+'</label>'+
    '<label class="field" for="f-stage">현재 단계'+sel('f-stage','stage',STAGES,d.stage)+'</label>'+
    '<label class="field" for="f-deadline">마감일<input id="f-deadline" type="date" data-f="deadline" value="'+esc(d.deadline)+'"></label>'+
    '<div class="field wide"><span>사용 도구 <span class="hint">(눌러서 고르기)</span></span>'+chipsField(opts,tools,'tool','tool-new')+'</div>'+
    '<label class="field wide" for="f-purpose">목적<textarea id="f-purpose" data-f="purpose" placeholder="작업의 목적, 길이, 규격 등을 기록하세요.">'+esc(d.purpose)+'</textarea></label>'+
    '<label class="field wide" for="f-message">핵심 메시지<textarea id="f-message" data-f="message" placeholder="이 콘텐츠가 전할 한 문장">'+esc(d.message)+'</textarea></label>'+
    '<label class="field wide" for="f-memo">수정 메모 <span class="hint">(고객 화면에 보이지 않아요)</span><textarea id="f-memo" data-f="memo" rows="4" placeholder="수정할 내용, 확인할 사항을 자유롭게 남기세요.">'+esc(d.memo)+'</textarea></label>'+
    '<div class="wide checks"><label for="f-submitted"><input id="f-submitted" type="checkbox" data-f="submitted"'+(d.submitted?' checked':'')+'> 제출 완료</label><label for="f-public"><input id="f-public" type="checkbox" data-f="public"'+(d.public?' checked':'')+'> 고객 화면에 공개</label></div></div>';
  }else if(S.tab==='장면 구성'){
    body='<div class="intro"><div><h3>한 장면씩, 이야기를 쌓아가세요.</h3><p>장면별 내용은 본인만 봐요. 고객 화면에는 컷 수만 보여요.</p></div><button class="btn" data-act="dl-add" data-list="scenes">+ 장면 추가</button></div>'+
    (d.scenes.length?dlRows('scenes',(s,i)=>'<div class="scene"><div class="sh"><span>SCENE '+String(i+1).padStart(2,'0')+'</span><span style="display:flex;gap:4px"><button class="btn ghost" data-act="dl-up" data-list="scenes" data-id="'+esc(s.id)+'" aria-label="위로"'+(i?'':' disabled')+'>↑</button><button class="btn ghost" data-act="dl-del" data-list="scenes" data-id="'+esc(s.id)+'">삭제</button></span></div>'+[['title','장면 구성'],['caption','자막'],['music','음악·효과음'],['edit','편집 메모']].map(([k,l])=>'<label class="field" for="sc-'+k+'-'+esc(s.id)+'">'+l+'<textarea id="sc-'+k+'-'+esc(s.id)+'" data-dl="scenes" data-item="'+esc(s.id)+'" data-key="'+k+'">'+esc(s[k])+'</textarea></label>').join('')+'</div>'):'<div class="empty">첫 장면을 추가해 보세요.</div>');
  }else if(S.tab==='체크리스트'){
    const dn=d.tasks.filter(t=>t.done).length;
    body='<div class="intro"><div><h3>다음 할 일</h3><p>위에서부터 차례로, 하나씩 완료해 보세요.</p></div><b class="num">'+dn+' / '+d.tasks.length+'</b></div><div class="bar"><span style="width:'+(d.tasks.length?dn/d.tasks.length*100:0)+'%"></span></div>'+
    dlRows('tasks',t=>'<div class="task"><input type="checkbox" id="tk-d-'+esc(t.id)+'" data-dl="tasks" data-item="'+esc(t.id)+'" data-key="done" aria-label="완료"'+(t.done?' checked':'')+'><input type="text" class="input'+(t.done?' done':'')+'" id="tk-t-'+esc(t.id)+'" data-dl="tasks" data-item="'+esc(t.id)+'" data-key="text" aria-label="할 일 내용" value="'+esc(t.text)+'"><button class="btn ghost" data-act="dl-del" data-list="tasks" data-id="'+esc(t.id)+'" aria-label="할 일 삭제">✕</button></div>')+
    '<button class="btn" data-act="dl-add" data-list="tasks">+ 할 일 추가</button>';
  }else if(S.tab==='제작 기록'){
    body='<div class="intro"><div><h3>영상과 함께, 만든 과정을 보여 주세요</h3><p>공개로 표시하면 이 탭의 내용이 고객 화면 “샘플” 탭에 보여요.</p></div></div>'+
    '<div class="form"><label class="field wide" for="f-thumb">썸네일'+imgSelect('f-thumb','data-f="thumb"',d.thumb)+'</label><label class="field wide" for="f-video">영상 <span class="hint">(“사진·영상”에 올린 MP4. 유튜브·인스타 영상은 아래 샘플 링크에 넣어 주세요)</span>'+imgSelect('f-video','data-f="video"',d.video,'video')+'</label><label class="field wide" for="f-summary">한 줄 요약<input id="f-summary" data-f="summary" maxlength="80" placeholder="예: 티백커피 한 잔으로 바뀌는 5분의 일상" value="'+esc(d.summary)+'"></label>'+
    '<div class="field wide"><span>내 역할</span>'+chipsField(uniq(ROLES.concat(d.roles)),d.roles,'role','role-new')+'</div>'+
    '<label class="field" for="f-length">길이<input id="f-length" data-f="length" placeholder="예: 28.8초" value="'+esc(d.length)+'"></label>'+
    '<label class="field" for="f-ratio">비율<input id="f-ratio" data-f="ratio" placeholder="예: 9:16" value="'+esc(d.ratio)+'" list="ratios"><datalist id="ratios"><option value="9:16"><option value="16:9"><option value="1:1"><option value="4:5"></datalist></label>'+
    '<label class="field" for="f-released">출품·납품일 <span class="hint">(샘플 순서 기준. 비우면 제출·완료한 작업의 마감일 사용)</span><input id="f-released" type="date" data-f="releasedAt" value="'+esc(d.releasedAt)+'"></label>'+
    '<label class="field" for="f-duration">제작 기간<input id="f-duration" data-f="duration" placeholder="예: 5일" value="'+esc(d.duration)+'"></label>'+
    '<div class="field"><span>컷 수</span><span style="font-size:15px;color:var(--ink)" class="num">'+d.scenes.length+'컷 <span class="hint">(장면 구성에서 자동)</span></span></div>'+
    '<label class="field wide" for="f-result">결과 <span class="hint">(있는 것만: 제출 완료, 수상, 조회수 등)</span><input id="f-result" data-f="result" value="'+esc(d.result)+'"></label>'+
    '<label class="field wide" for="f-portfolio">샘플 소개<textarea id="f-portfolio" data-f="portfolio" rows="4" placeholder="작업 의도와 나의 역할을 존댓말로 소개해 주세요.">'+esc(d.portfolio)+'</textarea></label></div>'+
    '<h4 class="subh">제작 과정</h4>'+dlRows('process',(x,i)=>'<div class="mini-row"><b class="num">'+(i+1)+'</b><input class="input" id="pr-'+esc(x.id)+'" data-dl="process" data-item="'+esc(x.id)+'" data-key="text" placeholder="예: 캐릭터 고정 이미지 생성" aria-label="'+(i+1)+'단계" value="'+esc(x.text)+'"><button class="btn ghost" data-act="dl-del" data-list="process" data-id="'+esc(x.id)+'" aria-label="단계 삭제">✕</button></div>')+'<button class="btn sm" data-act="dl-add" data-list="process">+ 단계 추가</button>'+
    '<h4 class="subh">샘플 링크</h4><p class="hint" style="margin-bottom:8px">유튜브, 인스타 릴스, 드라이브 등. 드라이브는 공유를 “링크가 있는 모든 사용자”로 바꿔야 고객이 열 수 있어요.</p>'+dlRows('links',l=>'<div class="link-row"><input class="input" id="ln-l-'+esc(l.id)+'" data-dl="links" data-item="'+esc(l.id)+'" data-key="label" placeholder="예: 유튜브 쇼츠" aria-label="링크 이름" value="'+esc(l.label)+'"><input class="input" type="url" id="ln-u-'+esc(l.id)+'" data-dl="links" data-item="'+esc(l.id)+'" data-key="url" placeholder="https://" aria-label="링크 주소" value="'+esc(l.url)+'"><button class="btn ghost" data-act="dl-del" data-list="links" data-id="'+esc(l.id)+'" aria-label="링크 삭제">✕</button></div>')+'<button class="btn sm" data-act="dl-add" data-list="links">+ 링크 추가</button>'+
    '<div class="checks" style="margin:18px 0 10px"><label for="f-public2"><input id="f-public2" type="checkbox" data-f="public"'+(d.public?' checked':'')+'> 고객 화면에 공개</label></div>'+
    '<div class="notice">공개하면 프로젝트명, 작업 구분, 형식, 목적, 그리고 이 탭의 내용이 링크를 받은 사람에게 보여요. 수정 메모, 장면별 내용, 체크리스트는 보이지 않아요.</div>'+
    '<div style="margin-top:12px"><button class="btn sm" data-act="copy-draft">카드 내용 복사</button></div>';
  }else{
    body='<div class="intro"><div><h3>작업의 발자국</h3><p>저장할 때 바뀐 항목과 시간이 자동으로 기록됩니다.</p></div></div>'+
    (d.history.length?d.history.map(h=>'<div class="hist"><span></span><div><b>'+esc(h.text)+'</b><p class="num">'+esc(new Date(h.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+'</p>'+(h.changes&&h.changes.length?'<details><summary>바뀐 내용 보기</summary>'+h.changes.map(c=>'<div><strong>'+esc(c.field)+'</strong><br><small>이전</small><pre>'+esc(c.before)+'</pre><small>변경 후</small><pre>'+esc(c.after)+'</pre></div>').join('')+'</details>':'')+'</div></div>').join(''):'<div class="empty">아직 저장된 수정 이력이 없어요.</div>');
  }
  return '<div class="backdrop" data-act="backdrop"><section class="detail" role="dialog" aria-modal="true" aria-labelledby="d-title"><header class="dh"><div><div class="eyebrow">'+(trashed?'휴지통에 있는 프로젝트':'PROJECT WORKSPACE')+'</div><h2 id="d-title">'+esc(d.name||'새 프로젝트')+'</h2></div><button class="btn ghost" data-act="close" aria-label="닫기">✕</button></header>'+
  '<div class="tabs" role="tablist">'+tabs.map(t=>'<button role="tab" aria-selected="'+(S.tab===t)+'" class="'+(S.tab===t?'on':'')+'" data-act="tab" data-tab="'+t+'">'+t+'</button>').join('')+'</div>'+
  '<div class="dbody"'+(S.saving?' inert':'')+'>'+body+'</div>'+
  '<footer class="df"><span class="note">저장하면 모든 기기에 바로 반영돼요.</span>'+(exists?'<button class="btn danger" data-act="'+(trashed?'restore':'trash')+'" data-id="'+esc(d.id)+'"'+(S.saving?' disabled':'')+'>'+(trashed?'복원':'휴지통으로')+'</button>':'')+(trashed?'':'<button class="btn primary" data-act="save"'+(S.saving?' disabled':'')+'>'+(S.saving?'저장 중…':'변경 사항 저장')+'</button>')+'</footer></section></div>';
}

function productModal(){
  const p=S.pdraft,exists=S.products.some(x=>x.id===p.id),d=pct(p.price,p.sale);
  return '<div class="backdrop" data-act="backdrop"><section class="detail" role="dialog" aria-modal="true" aria-labelledby="pd-title"><header class="dh"><div><div class="eyebrow">PRODUCT</div><h2 id="pd-title">'+esc(p.name||'새 상품')+'</h2></div><button class="btn ghost" data-act="close" aria-label="닫기">✕</button></header>'+
  '<div class="dbody"'+(S.saving?' inert':'')+'><div class="form"><label class="field wide" for="pf-name">상품명 *<input id="pf-name" data-pf="name" value="'+esc(p.name)+'"></label>'+
  '<label class="field" for="pf-category">카테고리<select id="pf-category" data-pf="category">'+PCATS.map(c=>'<option'+(c===p.category?' selected':'')+'>'+c+'</option>').join('')+'</select></label>'+
  '<label class="field" for="pf-order">노출 순서<input id="pf-order" type="number" data-pf="order" value="'+esc(p.order)+'"></label>'+
  '<label class="field" for="pf-price">정가 (원)<input id="pf-price" type="number" min="0" step="1000" data-pf="price" value="'+esc(p.price)+'"></label>'+
  '<label class="field" for="pf-sale">할인가 (원) <span class="hint" id="pf-discount-hint">'+(d?d+'% 할인':'비우면 정가만 표시')+'</span><input id="pf-sale" type="number" min="0" step="1000" data-pf="sale" value="'+esc(p.sale||'')+'"></label>'+
  '<label class="field wide" for="pf-image">상품 사진'+imgSelect('pf-image','data-pf="image"',p.image)+'</label>'+
  '<label class="field wide" for="pf-desc">짧은 설명<input id="pf-desc" data-pf="desc" maxlength="80" value="'+esc(p.desc)+'"></label>'+
  '<label class="field wide" for="pf-includes">포함 내용 <span class="hint">(한 줄에 하나씩: 작업 기간, 수정 횟수, 전달 파일 등)</span><textarea id="pf-includes" data-pf="includes" rows="5">'+esc(p.includes)+'</textarea></label>'+
  '<div class="wide checks"><label for="pf-example"><input id="pf-example" type="checkbox" data-pf="example"'+(p.example?' checked':'')+'> 예시 표시</label><label for="pf-featured"><input id="pf-featured" type="checkbox" data-pf="featured"'+(p.featured?' checked':'')+'> 기획전에 노출</label></div></div></div>'+
  '<footer class="df"><span class="note">상품 사진은 나중에 넣을 수 있게 자리만 잡혀 있어요.</span>'+(exists?'<button class="btn danger" data-act="pdel"'+(S.saving?' disabled':'')+'>삭제</button>':'')+'<button class="btn primary" data-act="psave"'+(S.saving?' disabled':'')+'>'+(S.saving?'저장 중…':'상품 저장')+'</button></footer></section></div>';
}

function folioDoc(p){
  return {name:p.name,category:p.category,collab:p.category==='브랜드 협업'?p.collab:'',format:p.format,purpose:p.purpose,summary:p.summary||p.message,intro:p.portfolio,
    roles:p.roles,length:p.length,ratio:p.ratio,duration:p.duration,cuts:p.scenes.length,tools:splitTools(p.tools),process:p.process.map(x=>x.text).filter(Boolean),
    result:p.result,links:p.links.filter(l=>isUrl(l.url)).map(l=>({label:l.label,url:l.url})),thumb:p.thumb,video:p.video,releasedAt:p.releasedAt||((p.submitted||p.stage==='완료')?p.deadline:'')||'',order:(p.updatedAt||'').slice(0,10),updatedAt:p.updatedAt||new Date().toISOString()};
}

async function syncFolio(p){const ref=S.db.doc('portfolio/'+p.id);if(p.public&&!p.deletedAt&&p.name)await ref.set(folioDoc(p));else await ref.delete()}

async function writeProject(p){await S.db.doc('projects/'+p.id).set(p);await syncFolio(p)}

function openProject(id,tab){const p=S.projects.find(x=>x.id===id);if(!p)return;S.draft=clone(p);S.original=clone(p);S.openedAt=p.updatedAt||'';S.tab=tab||'기본 정보';renderModal()}

function isDirty(){return (S.draft&&JSON.stringify(S.draft)!==JSON.stringify(S.original))||(S.pdraft&&JSON.stringify(S.pdraft)!==JSON.stringify(S.poriginal))}

async function save(){
  if(!S.draft||S.saving||!S.db)return;
  const d=S.draft;
  if(!d.name.trim()){S.tab='기본 정보';renderModal();toast('프로젝트명을 입력해 주세요.');const n=document.getElementById('f-name');if(n)n.focus();return}
  const badLink=d.links.find(l=>l.url&&!isUrl(l.url));
  if(badLink){S.tab='제작 기록';renderModal();toast('링크 주소는 https://로 시작해야 해요.');return}
  const prev=S.projects.find(p=>p.id===d.id);
  const changes=FIELDS.filter(([k])=>JSON.stringify(prev?prev[k]:undefined)!==JSON.stringify(d[k])).map(([k,l])=>({field:l,before:histValue(prev?prev[k]:''),after:histValue(d[k])}));
  if(prev&&!changes.length){toast('바뀐 내용이 없어요.');return}
  S.saving=true;renderModal();
  try{
    if(prev){
      const snap=await S.db.doc('projects/'+d.id).get();const cur=snap.exists?snap.data():null;
      if(cur&&(cur.updatedAt||'')!==S.openedAt){
        S.saving=false;renderModal();
        if(!(await ask('다른 기기에서 이 프로젝트가 먼저 수정됐어요. 지금 내용으로 덮어쓸까요?','덮어쓰기',true)))return;
        S.saving=true;renderModal();
      }
    }
    const now=new Date().toISOString();
    const p=normalize(Object.assign(clone(d),{updatedAt:now}));
    p.history=[{at:now,text:prev?changes.map(c=>c.field).join(' · ')+' 수정':'새 프로젝트 추가',changes:prev?changes:[]}].concat(d.history).slice(0,80);
    await writeProject(p);
    S.draft=clone(p);S.original=clone(p);S.openedAt=now;
    toast(p.public?'저장했어요. 고객 화면에도 반영됐어요.':'프로젝트를 저장했어요.');
  }catch(e){toast(errMsg(e))}
  finally{S.saving=false;renderModal()}
}

async function moveTrash(id,restore){
  const p=S.projects.find(x=>x.id===id);if(!p||S.saving)return;
  if(!restore&&!(await ask('“'+p.name+'”을(를) 휴지통으로 옮길까요? 공개 중이었다면 고객 화면에서도 내려가요.','휴지통으로',true)))return;
  S.saving=true;renderModal();
  try{
    const now=new Date().toISOString();
    const u=normalize(Object.assign(clone(p),{deletedAt:restore?'':now,updatedAt:now}));
    u.history=[{at:now,text:restore?'휴지통에서 복원':'휴지통으로 이동'}].concat(p.history).slice(0,80);
    await writeProject(u);S.draft=null;S.original=null;
    toast(restore?'프로젝트를 복원했어요.':'휴지통으로 옮겼어요. 휴지통에서 복원할 수 있어요.');
  }catch(e){toast(errMsg(e))}
  finally{S.saving=false;renderModal()}
}

async function purge(id){
  const p=S.projects.find(x=>x.id===id);if(!p)return;
  if(!(await ask('“'+p.name+'”을(를) 영구 삭제할까요? 되돌릴 수 없어요.','영구 삭제',true)))return;
  try{await S.db.doc('projects/'+id).delete();await S.db.doc('portfolio/'+id).delete();toast('영구 삭제했어요.')}catch(e){toast(errMsg(e))}
}

async function togglePublic(id){
  const p=S.projects.find(x=>x.id===id);if(!p)return;
  const now=new Date().toISOString();
  const u=normalize(Object.assign(clone(p),{public:!p.public,updatedAt:now}));
  u.history=[{at:now,text:u.public?'고객 화면에 공개':'고객 화면에서 내림',changes:[{field:'고객 화면 공개',before:histValue(p.public),after:histValue(u.public)}]}].concat(p.history).slice(0,80);
  try{await writeProject(u);toast(u.public?'고객 화면에 공개했어요.':'고객 화면에서 내렸어요.')}catch(e){toast(errMsg(e))}
}

async function saveProduct(){
  if(!S.pdraft||S.saving)return;
  const p=normProduct(S.pdraft);
  if(!p.name.trim()){toast('상품명을 입력해 주세요.');return}
  if(p.sale&&p.price&&p.sale>p.price){toast('할인가가 정가보다 높아요. 가격을 확인해 주세요.');return}
  S.saving=true;renderModal();
  try{p.updatedAt=new Date().toISOString();await S.db.doc('products/'+p.id).set(p);S.pdraft=clone(p);S.poriginal=clone(p);toast('상품을 저장했어요.')}catch(e){toast(errMsg(e))}
  finally{S.saving=false;renderModal()}
}

async function deleteProduct(){
  const p=S.pdraft;if(!p)return;
  if(!(await ask('“'+p.name+'” 상품을 삭제할까요?','삭제',true)))return;
  try{await S.db.doc('products/'+p.id).delete();S.pdraft=null;S.poriginal=null;renderModal();toast('상품을 삭제했어요.')}catch(e){toast(errMsg(e))}
}

async function saveBrand(){
  if(!S.db||S.brandSaving)return;
  const b=clone(S.brandDraft);
  if(b.toolText!=null){b.toolOptions=uniq(splitTools(b.toolText));delete b.toolText}
  b.contacts=b.contacts.filter(c=>c.label.trim()||c.url.trim()).map(c=>Object.assign(c,{url:/^[^@\s:/]+@[^@\s]+\.[^@\s]+$/.test(c.url.trim())?'mailto:'+c.url.trim():c.url.trim()}));
  const bad=b.contacts.find(c=>c.url&&!isUrl(c.url)&&!isMail(c.url));
  if(bad){toast('“'+(bad.label||bad.url)+'” 주소는 https://로 시작하거나 이메일 주소여야 해요.');return}
  b.banners=b.banners.filter(x=>x.title.trim());b.workflow=b.workflow.filter(x=>x.title.trim());b.notices=b.notices.filter(x=>x.title.trim());b.reviews=b.reviews.filter(x=>x.text.trim());
  S.brandSaving=true;render();
  try{await S.db.doc('settings/brand').set(Object.assign(b,{updatedAt:new Date().toISOString()}));S.brandDraft=null;toast('브랜드 설정을 저장했어요.')}catch(e){toast(errMsg(e))}
  finally{S.brandSaving=false;render()}
}

async function importJson(file){
  let list;
  try{list=JSON.parse(await file.text())}catch(e){toast('JSON 파일을 읽지 못했어요. 내보내기로 받은 파일인지 확인해 주세요.');return}
  if(!Array.isArray(list)){toast('프로젝트 목록 형식이 아니에요.');return}
  const have=new Set(S.projects.map(p=>p.id));
  const add=list.map(normalize).filter(p=>p.name&&!have.has(p.id));
  const skipped=list.length-add.length;
  if(!add.length){toast('새로 가져올 프로젝트가 없어요. ('+skipped+'개 건너뜀)');return}
  if(!(await ask(add.length+'개 프로젝트를 가져올까요?'+(skipped?' 이미 있거나 이름이 없는 '+skipped+'개는 건너뜁니다.':''),'가져오기')))return;
  let ok=0;
  for(const p of add){try{if(!p.updatedAt)p.updatedAt=new Date().toISOString();await writeProject(p);ok++}catch(e){toast(errMsg(e));break}}
  toast(ok+'개 프로젝트를 가져왔어요.');
}

function toggleIn(list,v){const i=list.indexOf(v);if(i<0)list.push(v);else list.splice(i,1);return list}

function renderMedia(){
  if(!S.assets&&!S.local)return '<div class="empty">사진·영상 올리기는 편집 권한이 있는 계정으로, Claude에 로그인한 상태에서 쓸 수 있어요.</div>';
  const items=S.media.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  return '<div class="banner-note">사진(PNG·JPG·GIF·WEBP·SVG)과 영상(MP4·WEBM)을 올릴 수 있어요. 파일 하나당 20MB까지(SVG는 2MB). 올린 파일은 상품 사진, 샘플 썸네일·영상, 배너, 로고, 카테고리 아이콘에서 “내 파일”로 고를 수 있어요. 이름은 여기서 바꿀 수 있어요.</div>'+
  (S.local?'<div class="banner-note">로컬 관리자 모드에서는 파일을 직접 올리지 않아요. 사이트 폴더의 <b>img</b> 폴더에 파일을 넣은 뒤, 아래에 파일 이름을 등록하면 사진·영상 목록에서 고를 수 있어요.</div><div class="form" style="max-width:640px"><label class="field" for="media-path">img 폴더 안 파일 이름<input id="media-path" placeholder="예: new-logo.webp"></label><label class="field" for="media-name">표시 이름<input id="media-name" placeholder="예: 새 로고"></label></div><div style="margin:10px 0 4px"><button class="btn primary" data-act="mreg">파일 등록</button></div>':'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="btn primary" for="media-file">+ 사진·영상 올리기<input id="media-file" type="file" multiple accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,video/mp4,video/webm" class="hidden"></label>'+(S.uploading?'<span class="hint">'+esc(S.uploading)+'</span>':'')+'</div>')+
  (items.length?'<div class="mgrid">'+items.map(m=>'<div class="mitem">'+(m.kind==='video'?'<video src="'+esc(mediaSrc(m))+'" preload="metadata" muted playsinline controls></video>':'<img src="'+esc(mediaSrc(m))+'" alt="" loading="lazy">')+'<input class="input" id="mn-'+esc(m.id)+'" data-media="'+esc(m.id)+'" value="'+esc(m.name)+'" aria-label="파일 이름" maxlength="60"><div class="mrow"><small class="num">'+(m.kind==='video'?'영상':'사진')+' · '+(m.path?esc(m.path):m.sizeBytes>1048576?(m.sizeBytes/1048576).toFixed(1)+'MB':Math.max(1,Math.round((m.sizeBytes||0)/1024))+'KB')+'</small><button class="btn ghost sm danger" data-act="mdel" data-id="'+esc(m.id)+'">삭제</button></div></div>').join('')+'</div>':'<div class="empty" style="margin-top:14px">아직 올린 파일이 없어요.</div>');
}

function assetErr(e,n){const c=e&&e.code;if(c==='too_large')return '“'+n+'”이(가) 너무 커요. 20MB 이하로 줄여 주세요.';if(c==='unsupported_type')return '“'+n+'”은(는) 올릴 수 없는 형식이에요.';if(c==='quota_or_state')return '저장 공간이 가득 찼어요. 쓰지 않는 파일을 삭제해 주세요.';if(c==='rate_limited')return '너무 빨리 올리고 있어요. 잠시 뒤 다시 시도해 주세요.';if(c==='upstream_auth')return '로그인 상태를 확인하고 페이지를 새로 열어 주세요.';return '“'+n+'”을(를) 처리하지 못했어요. 다시 시도해 주세요.'}

async function uploadMedia(files){
  if(!S.assets||!S.db)return [];
  let ok=0;const refs=[];
  for(const f of files){
    const ext=(f.name.split('.').pop()||'').toLowerCase(),type=UP_TYPES[ext]||(Object.values(UP_TYPES).includes(f.type)?f.type:'');
    if(!type){toast('“'+f.name+'”은(는) 올릴 수 없는 형식이에요. PNG·JPG·GIF·WEBP·SVG·MP4·WEBM만 돼요.');continue}
    const max=type==='image/svg+xml'?2:20;
    if(f.size>max*1048576){toast('“'+f.name+'”이(가) '+max+'MB보다 커요. 줄인 뒤 다시 올려 주세요.');continue}
    S.uploading='올리는 중… '+f.name;render();
    try{
      const r=await S.assets.upload(f,{type});
      await S.db.doc('media/'+r.id).set({assetId:r.id,name:f.name.replace(/\.[^.]+$/,'').slice(0,60),kind:type.startsWith('video/')?'video':'image',contentType:r.contentType,sizeBytes:r.sizeBytes,createdAt:new Date().toISOString()});
      ok++;refs.push('asset:'+r.id);
    }catch(e){toast(assetErr(e,f.name))}
  }
  S.uploading='';render();
  if(ok)toast(ok+'개 파일을 올렸어요. 이제 사진·영상 목록에서 고를 수 있어요.');
  return refs;
}

async function renameMedia(id,name){
  const m=S.media.find(x=>x.id===id);if(!m||m.name===name)return;
  try{await S.db.doc('media/'+id).update({name:String(name).slice(0,60)})}catch(e){toast(errMsg(e))}
}

async function deleteMedia(id){
  const m=S.media.find(x=>x.id===id);if(!m||(!S.assets&&!m.path))return;
  const ref=mediaRef(m);
  const used=S.products.some(p=>p.image===ref)||S.projects.some(p=>p.thumb===ref||p.video===ref)||JSON.stringify(S.brand).includes(ref);
  if(!(await ask((used?'이 파일은 지금 상품·샘플·배너 등에서 쓰이고 있어요. 삭제하면 그 자리는 비어 보여요. ':'')+'“'+(m.name||'파일')+'”을(를) 삭제할까요? 되돌릴 수 없어요.','삭제',true)))return;
  try{if(!m.path)await S.assets.delete(m.assetId);await S.db.doc('media/'+id).delete();toast('삭제했어요.')}catch(e){toast(assetErr(e,m.name||'파일'))}
}

function stable(v){
  if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
  if(v&&typeof v==='object')return '{'+Object.keys(v).filter(k=>k!=='updatedAt'&&k!=='toolText').sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  return JSON.stringify(v);
}

function pubSig(products,portfolio,brand){
  const byId=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;
  return stable({p:products.map(normProduct).sort(byId),w:portfolio.slice().sort(byId),b:brand});
}

function snapStale(){
  if(!SNAP||!S.canEdit||!S.liveProd||!S.liveFolio)return false;
  return pubSig(S.products,S.portfolio,S.brand)!==pubSig(SNAP.products,SNAP.portfolio||[],mergeBrand(SNAP.brand));
}

function snapNote(){
  const btns='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn sm primary" data-act="export-content">content.js '+(S.local?'내보내기':'복사')+'</button><button class="btn sm" data-act="export-projects">프로젝트 백업 '+(S.local?'내보내기':'복사')+'</button>'+(S.local?'<button class="btn sm danger" data-act="local-reset">처음 상태로 되돌리기</button>':'')+'</div>';
  if(S.local)return '<div class="banner-note"><b>로컬 관리자 모드</b> · 바꾼 내용은 이 브라우저에만 저장돼요'+(window.__localStore&&!window.__localStore.persistent()?' (지금은 저장이 안 되는 환경이라 창을 닫으면 사라져요. 꼭 내보내기를 해 두세요)':'')+'. 고객 사이트에 반영하려면 <b>content.js 내보내기</b>로 받은 파일을 사이트 폴더의 content.js와 바꾼 뒤 다시 올려 주세요. 프로젝트(마감일·메모)는 content.js에 들어가지 않으니 <b>프로젝트 백업</b>으로 따로 보관하세요.'+btns+'</div>';
  if(!snapStale())return '';
  return '<div class="banner-note" style="border-color:var(--sale);color:var(--sale)"><b>로그인하지 않은 방문자에게는 아직 이전 내용이 보여요.</b> 아래 버튼으로 content.js를 복사해 사이트 폴더의 content.js에 붙여 넣거나, Claude에게 “공개 화면 업데이트해 줘”라고 말해 주세요. (마지막 반영: '+esc(new Date(SNAP.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))+')'+btns+'</div>';
}

function contentJs(){
  const brand=clone(S.brand);delete brand.toolText;delete brand.updatedAt;
  const products=S.products.slice().sort((a,b)=>a.order-b.order).map(clone);
  const portfolio=S.portfolio.slice().sort((a,b)=>(a.id<b.id?-1:1)).map(clone);
  const obj={at:new Date().toISOString(),products,portfolio,brand};
  return '/* Shared public content. Edit copy, products, contacts and banners here. */\nconst SITE_CONTENT = '+JSON.stringify(obj,null,2).replace(/</g,'\\u003c')+';\n';
}
function saveText(name,text,type){
  try{const b=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return true}catch(e){return false}
}
function exportContent(){
  const t=contentJs(),n=(t.match(/asset:[A-Za-z0-9_-]+/g)||[]).length;
  const warn=n?' Claude에서 올린 파일 '+n+'개는 사이트 폴더에서는 보이지 않으니 img 폴더 파일로 바꿔 주세요.':'';
  if(S.local&&saveText('content.js',t,'text/javascript')){toast('content.js를 내려받았어요. 사이트 폴더의 content.js와 바꿔 주세요.'+warn);return}
  copyText(t,'content.js 내용을 복사했어요. 사이트 폴더의 content.js를 열어 전체를 바꿔 붙여 넣으세요.'+warn);
}
function exportProjects(){
  const t=JSON.stringify(S.projects,null,2);
  if(S.local&&saveText('projects-backup.json',t,'application/json')){toast('프로젝트 백업 파일을 내려받았어요. 공개 사이트 폴더에는 올리지 마세요.');return}
  copyText(t,'프로젝트 백업 JSON을 복사했어요. 공개 사이트 폴더에는 올리지 마세요.');
}
async function registerMedia(){
  const pEl=document.getElementById('media-path'),nEl=document.getElementById('media-name');
  const f=String(pEl&&pEl.value||'').trim().replace(/^\.?\/?img\//i,'');
  if(!/^[^\/\\<>"'?#]+\.(jpe?g|png|gif|webp|svg|mp4|webm)$/i.test(f)){toast('img 폴더 안 파일 이름을 확장자까지 적어 주세요. 예: new-logo.webp');return}
  const kind=/\.(mp4|webm)$/i.test(f)?'video':'image';
  try{await S.db.doc('media/p-'+Date.now().toString(36)).set({path:'img/'+f,name:String(nEl&&nEl.value||'').trim().slice(0,60)||f,kind,createdAt:new Date().toISOString(),sizeBytes:0});if(pEl)pEl.value='';if(nEl)nEl.value='';toast('등록했어요. 사진 목록에서 고를 수 있어요.')}catch(e){toast(errMsg(e))}
}

async function closeAdminModal(){
  if(S.saving)return;
  if(S.pub.sheet&&!S.draft&&!S.pdraft){S.pub.sheet=null;renderModal();return}
  if(isDirty()&&!(await ask('저장하지 않은 변경 사항이 있어요. 닫을까요?','닫기',true)))return;
  S.draft=null;S.original=null;S.pdraft=null;S.poriginal=null;renderModal();
}
(function(){const st=document.createElement('style');st.textContent=Object.keys(FONTS).map(k=>fontFace(k)+'.ff-'+k+'{font-family:'+fontStack(k)+'}').join('');document.head.append(st)})();
function fontRows(b,act){
  return [['fontDisplay','제목 글꼴'],['fontBody','본문 글꼴']].map(([k,l])=>'<h4 class="pk-h">'+l+'</h4><div class="pk-fonts">'+Object.keys(FONTS).map(f=>'<button type="button" class="pk-font ff-'+f+((b[k]||'system')===f?' on':'')+'" data-act="'+act+'" data-k="'+k+'" data-v="'+f+'"><b>'+esc(FONTS[f].label)+'</b><span>좋은 발견을, 끌리는 콘텐츠로.</span></button>').join('')+'</div>').join('');
}
let PICK=null;
function closePicker(){PICK=null;const el=document.getElementById('picker');if(el)el.remove()}
function openPicker(o){PICK=o;renderPicker()}
function renderPicker(){
  if(!PICK)return;
  let el=document.getElementById('picker');if(!el){el=document.createElement('div');el.id='picker';document.body.append(el)}
  const kind=PICK.kind||'image';let body='';
  if(kind==='font')body='<div class="pk-pad">'+fontRows(S.brand,'font-choose')+'</div>';
  else{
    const media=S.media.filter(m=>m.kind===kind).map(m=>[mediaRef(m),mediaSrc(m),m.name||'내 파일']);
    const items=kind==='video'?media:media.concat(IMAGES.map(([v,l])=>[v,v,l]));
    const cur=PICK.value||'none';
    body='<div class="pk-grid">'+(S.assets?'<label class="pk-item pk-up" for="pk-file"><span class="pk-none">＋</span><small>새로 올리기</small><input id="pk-file" type="file" accept="'+(kind==='video'?'video/mp4,video/webm':'image/png,image/jpeg,image/gif,image/webp,image/svg+xml')+'" class="hidden"></label>':'')+
      '<button class="pk-item'+(cur==='none'?' on':'')+'" data-act="pk-choose" data-v="none"><span class="pk-none">없음</span><small>'+(kind==='video'?'영상 없음':'사진 없음')+'</small></button>'+
      items.map(([v,src,l])=>'<button class="pk-item'+(v===cur?' on':'')+'" data-act="pk-choose" data-v="'+esc(v)+'">'+(kind==='video'?'<video src="'+esc(src)+'" muted preload="metadata"></video>':'<img src="'+esc(src)+'" alt="" loading="lazy">')+'<small>'+esc(l)+'</small></button>').join('')+'</div>'+
      (S.local?'<p class="hint pk-pad">새 사진은 사이트 폴더의 img 폴더에 넣고 “사진·영상” 메뉴에서 파일 이름을 등록하면 여기에 나와요.</p>':'');
  }
  el.innerHTML='<div class="pk-back" data-act="pk-close"><section class="pk" role="dialog" aria-modal="true" aria-labelledby="pk-title"><header><b id="pk-title">'+esc(kind==='font'?'글꼴 고르기':PICK.title||'사진 고르기')+'</b><button class="btn ghost" data-act="pk-close" aria-label="닫기">✕</button></header>'+body+'</section></div>';
}
async function saveBrandPatch(patch){
  const nb=Object.assign(clone(S.brand),patch);delete nb.toolText;nb.updatedAt=new Date().toISOString();
  await S.db.doc('settings/brand').set(nb);S.brandDraft=null;
}
function editTarget(key){
  const b=S.brand;let title='',value='',save=null;
  if(key==='logo'){title='로고';value=b.logo;save=v=>saveBrandPatch({logo:v})}
  else if(key==='story'){title='대표 브랜드 사진';value=b.storyImage;save=v=>saveBrandPatch({storyImage:v})}
  else if(key.startsWith('cat:')){const c=key.slice(4);title=c+' 아이콘';value=(b.catIcons||{})[c];save=v=>saveBrandPatch({catIcons:Object.assign({},b.catIcons||{},{[c]:v})})}
  else if(key.startsWith('banner:')){const id=key.slice(7),bn=(b.banners||[]).find(x=>String(x.id)===id);if(!bn)return;title='배너 이미지';value=bn.image;save=v=>saveBrandPatch({banners:b.banners.map(x=>String(x.id)===id?Object.assign({},x,{image:v}):x)})}
  else if(key.startsWith('product:')){const p=S.products.find(x=>x.id===key.slice(8));if(!p)return;title=p.name+' 사진';value=p.image;save=v=>S.db.doc('products/'+p.id).set(Object.assign(normProduct(p),{image:v,updatedAt:new Date().toISOString()}))}
  else if(key.startsWith('work:')){
    const id=key.slice(5),pr=S.projects.find(x=>x.id===id),w=S.portfolio.find(x=>x.id===id);title='샘플 썸네일';value=pr?pr.thumb:w&&w.thumb;
    save=async v=>{if(pr){const now=new Date().toISOString(),u=normalize(Object.assign(clone(pr),{thumb:v,updatedAt:now}));u.history=[{at:now,text:'썸네일 변경'}].concat(pr.history).slice(0,80);await writeProject(u)}else if(w){const d=clone(w);delete d.id;d.thumb=v;await S.db.doc('portfolio/'+id).set(d)}};
  }
  if(!save)return;
  openPicker({title,value,kind:'image',onPick:async v=>{try{await save(v);toast('바꿨어요.')}catch(e){toast(errMsg(e))}}});
}
document.addEventListener('click',ev=>{
  if(!S.preview||!S.editMode||ev.target.closest('#picker'))return;
  const t=ev.target.closest('[data-edit]');if(!t)return;
  ev.preventDefault();ev.stopImmediatePropagation();editTarget(t.dataset.edit);
},true);
document.addEventListener('change',ev=>{
  const t=ev.target;
  if(t.id!=='pk-file'||!t.files||!t.files[0])return;
  const f=t.files[0];t.value='';
  uploadMedia([f]).then(refs=>{if(refs&&refs[0]&&PICK&&PICK.onPick){const cb=PICK.onPick;closePicker();cb(refs[0])}else renderPicker()});
});
document.addEventListener('click',ev=>{
  const t=ev.target.closest('[data-act]');if(!t)return;
  const act=t.dataset.act,id=t.dataset.id,list=t.dataset.list;
  switch(act){
case 'nav':S.page=t.dataset.page;S.filter='all';S.query='';if(S.page==='brand')S.brandDraft=null;render();window.scrollTo(0,0);break;
    case 'filter':S.filter=t.dataset.filter;render();break;
    case 'filter-go':S.page='projects';S.filter=t.dataset.filter;S.query='';render();window.scrollTo(0,0);break;
    case 'preview':S.preview=true;render();window.scrollTo(0,0);break;
    case 'unpreview':S.preview=false;S.editMode=false;closePicker();S.pub.sheet=null;renderModal();render();break;
    case 'new':S.draft=blank();S.original=clone(S.draft);S.openedAt='';S.tab='기본 정보';renderModal();setTimeout(()=>{const n=document.getElementById('f-name');if(n)n.focus()},0);break;
    case 'open':openProject(id);break;
    case 'open-folio':openProject(id,'제작 기록');break;
    case 'tab':S.tab=t.dataset.tab;renderModal();break;
    case 'save':save();break;
    case 'trash':moveTrash(id,false);break;
    case 'restore':moveTrash(id,true);break;
    case 'purge':purge(id);break;
    case 'toggle-public':togglePublic(id);break;
    case 'copy-folio':{const p=S.projects.find(x=>x.id===id);if(p)copyText(folioText(p),'포트폴리오 카드 내용을 복사했어요.');break}
    case 'copy-draft':copyText(folioText(S.draft),'카드 내용을 복사했어요.');break;
    case 'tool':S.draft.tools=toggleIn(splitTools(S.draft.tools),t.dataset.v).join(', ');renderModal();break;
    case 'role':toggleIn(S.draft.roles,t.dataset.v);renderModal();break;
    case 'dl-add':{const it=Object.assign({id:uid()},TPL[list]());S.draft[list].push(it);renderModal();const n=S.draft&&document.querySelector('[data-dl="'+list+'"][data-item="'+it.id+'"]:not([type=checkbox])');if(n)n.focus();break}
    case 'dl-del':S.draft[list]=S.draft[list].filter(x=>x.id!==id);renderModal();break;
    case 'dl-up':{const a=S.draft[list],i=a.findIndex(x=>x.id===id);if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];renderModal()}break}
    case 'pnew':S.pdraft=normProduct({id:uid(),order:(Math.max(0,...S.products.map(p=>p.order))+1),example:false});S.poriginal=clone(S.pdraft);renderModal();break;
    case 'popen':{const p=S.products.find(x=>x.id===id);if(p){S.pdraft=clone(p);S.poriginal=clone(p);renderModal()}break}
    case 'psave':saveProduct();break;
    case 'pdel':deleteProduct();break;
    case 'bl-add':S.brandDraft[list].push(Object.assign({id:uid()},TPL[list]()));render();break;
    case 'bl-del':S.brandDraft[list]=S.brandDraft[list].filter(x=>x.id!==id);render();break;
    case 'brand-reset':S.brandDraft=clone(S.brand);render();toast('저장된 설정으로 되돌렸어요.');break;
    case 'brand-save':saveBrand();break;
    case 'mdel':deleteMedia(id);break;
    case 'mreg':registerMedia();break;
    case 'edit-toggle':S.editMode=!S.editMode;render();break;
    case 'font-open':openPicker({kind:'font'});break;
    case 'pk-close':if(ev.target===t||t.tagName==='BUTTON')closePicker();break;
    case 'pk-choose':{const cb=PICK&&PICK.onPick,v=t.dataset.v;closePicker();if(cb)cb(v);break}
    case 'font-choose':saveBrandPatch({[t.dataset.k]:t.dataset.v}).then(()=>{toast('글꼴을 바꿨어요.');setTimeout(renderPicker,60)}).catch(e=>toast(errMsg(e)));break;
    case 'bfont':if(S.brandDraft){S.brandDraft[t.dataset.k]=t.dataset.v;render()}break;
    case 'pick-field':{const sel=document.getElementById(t.dataset.for),kind=t.dataset.kind;if(!sel)break;openPicker({title:'사진 고르기',value:sel.value,kind,onPick:v=>{if(![...sel.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;sel.append(o)}sel.value=v;t.innerHTML=pickThumb(v,kind);sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))}});break}
    case 'export-content':exportContent();break;
    case 'export-projects':exportProjects();break;
    case 'local-reset':ask('이 브라우저에 저장된 관리 내용을 지우고 content.js 상태로 되돌릴까요? 프로젝트도 지워져요.','되돌리기',true).then(ok=>{if(ok&&window.__localStore){window.__localStore.reset();toast('처음 상태로 되돌렸어요.')}});break;
    case 'export':copyText(JSON.stringify(S.projects,null,2),'전체 프로젝트 JSON을 복사했어요. 메모장 등에 붙여 넣어 보관하세요.');break;
  }
});

document.addEventListener('input',ev=>{
  const t=ev.target,ds=t.dataset;
  if(t.type==='checkbox')return;
  if(t.id==='q'){S.query=t.value;render();return}
  if(S.draft){
    if(ds.f){S.draft[ds.f]=t.value;if(ds.f==='name'){const h=document.getElementById('d-title');if(h)h.textContent=t.value||'새 프로젝트'}return}
    if(ds.dl){const it=S.draft[ds.dl].find(x=>x.id===ds.item);if(it)it[ds.key]=t.value;return}
  }
  if(S.pdraft&&ds.pf){S.pdraft[ds.pf]=t.type==='number'?(t.value===''?0:Number(t.value)):t.value;if(ds.pf==='price'||ds.pf==='sale'){const hint=document.getElementById('pf-discount-hint');const discount=pct(S.pdraft.price,S.pdraft.sale);if(hint)hint.textContent=discount?discount+'% 할인':'비우면 정가만 표시'}if(ds.pf==='name'){const h=document.getElementById('pd-title');if(h)h.textContent=t.value||'새 상품'}return}
  if(S.brandDraft){
    if(ds.brand){S.brandDraft[ds.brand]=t.value;return}
    if(ds.footer){S.brandDraft.footer[ds.footer]=t.value;return}
    if(ds.bl){const it=S.brandDraft[ds.bl].find(x=>x.id===ds.item);if(it)it[ds.key]=t.value;return}
  }
});
document.addEventListener('change',ev=>{
  const t=ev.target,ds=t.dataset;
  if(t.id==='sort'){S.sort=t.value;render();return}
  if(t.id==='import-file'&&t.files&&t.files[0]){importJson(t.files[0]);t.value='';return}
  if(t.id==='media-file'&&t.files&&t.files.length){const fs=[...t.files];t.value='';uploadMedia(fs);return}
  if(ds.media){renameMedia(ds.media,t.value);return}
  if(S.brandDraft&&ds.caticon){S.brandDraft.catIcons=Object.assign({},S.brandDraft.catIcons||{});S.brandDraft.catIcons[ds.caticon]=t.value;return}
  if(S.draft&&ds.dl==='tasks'&&ds.key==='done'){const k=S.draft.tasks.find(x=>x.id===ds.item);if(k){k.done=t.checked;renderModal()}return}
  if(S.draft&&ds.f&&t.type==='checkbox'){S.draft[ds.f]=t.checked;renderModal();return}
  if(S.draft&&ds.f&&t.tagName==='SELECT'){S.draft[ds.f]=t.value;if(ds.f==='category')renderModal();return}
  if(S.draft&&ds.f&&t.type==='date'){S.draft[ds.f]=t.value;return}
  if(S.pdraft&&ds.pf&&(t.type==='checkbox'||t.tagName==='SELECT')){S.pdraft[ds.pf]=t.type==='checkbox'?t.checked:t.type==='number'?Number(t.value||0):t.value;renderModal();return}
  if(S.brandDraft&&ds.bl&&(t.tagName==='SELECT'||t.type==='date')){const it=S.brandDraft[ds.bl].find(x=>x.id===ds.item);if(it)it[ds.key]=t.value;return}
});
document.addEventListener('keydown',ev=>{
  const t=ev.target;
  if(ev.key==='Enter'&&(t.id==='tool-new'||t.id==='role-new')&&S.draft){
    ev.preventDefault();const v=t.value.trim().replace(/,/g,' ');if(!v)return;
    if(t.id==='tool-new'){const l=splitTools(S.draft.tools);if(!l.includes(v))l.push(v);S.draft.tools=l.join(', ')}
    else if(!S.draft.roles.includes(v))S.draft.roles.push(v);
    renderModal();const n=document.getElementById(t.id);if(n){n.value='';n.focus()}return;
  }
  if(ev.key==='Enter'&&t.tagName==='TR'&&t.dataset.id)openProject(t.dataset.id);
});

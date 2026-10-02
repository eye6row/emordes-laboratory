let S=[];
const toS=d=>d.samples.map(x=>({n:x.n,code:'EML-'+x.n,t:x.title,f:x.fiber,g:x.gsm,fi:x.finish,o:x.origin,tags:x.tags.length?x.tags:['sample'],d:x.description,y:x.year||'',r:x.recipe||[],imgs:(x.images&&x.images.length?x.images:x.image?[x.image]:[]).map(u)})).map(s=>(s.img=s.imgs[0]||'',s));
const u=p=>/^images\/uploads\//.test(p)?'/api/img?p='+encodeURIComponent(p):p;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// dot-matrix mark: 7x7 woven diamond
(()=>{let h='';for(let y=0;y<7;y++)for(let x=0;x<7;x++){const d=Math.abs(x-3)+Math.abs(y-3);if(d===3||d===0||(d===1&&(x+y)%2))h+=`<circle cx="${2+x*4}" cy="${2+y*4}" r="1.35"/>`}$('#dots').innerHTML=h})();
const ARROW='<svg class="dm" viewBox="0 0 13 13" aria-hidden="true">'+[[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[2,2]].map(([x,y])=>`<circle cx="${2.5+x*4}" cy="${2.5+y*2}" r="1.1"/>`).join('')+'</svg>';

// placeholder: woven pattern seeded per sample
function ph(i){const hue=[30,48,40,25,200,52,18,0,35,150,10,330][i%12],sat=i===7?0:i===4?20:28;
return `style="--h:${hue};--s:${sat}%;--a:${(i*37)%90}deg"`}
const img=(s,i,k='',src=s.img)=>`<div class="ph-img" ${ph(i)}><span>${s.code}${k}</span><img src="${esc(src)}" alt="${esc(s.t)} sample${k}" loading="lazy" onerror="this.remove()"></div>`;

function render(){const N=S.length;$('#count').textContent=N+' Specimens / Placeholder data';$('#shown').textContent=N+' / '+N;
$('#grid').innerHTML=S.map((s,i)=>`<li class="card" data-i="${i}" data-tags="${esc(s.tags.join(' '))}" style="--d:${i*40}ms"><button aria-label="Open ${esc(s.t)}, ${s.code}">${img(s,i)}<span class="ov"><span class="ot"><b>${esc(s.t)}</b><small>${esc(s.code)} / ${esc(s.tags[0])}</small></span>${ARROW}</span></button><div class="cap"><span>${esc(s.code)}</span><span>${esc(s.t)}</span><span>${esc(s.g)} gsm</span></div></li>`).join('');
$('#idx').innerHTML=S.map((s,i)=>`<tr data-i="${i}" data-tags="${esc(s.tags.join(' '))}"><td>${esc(s.n)}</td><td><button>${esc(s.t)}</button></td><td>${esc(s.tags[0])}</td><td>${esc(s.y)}</td></tr>`).join('');
$('#picks').innerHTML=S.map(s=>`<label><input type="checkbox" name="s" value="${esc(s.code)} ${esc(s.t)}"><span>${esc(s.code)}</span> ${esc(s.t)}</label>`).join('');}

// filters
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(o=>o.classList.toggle('on',o===b));const f=b.dataset.f;let n=0;
$$('[data-tags]').forEach(el=>{const h=f!=='all'&&!el.dataset.tags.includes(f);el.classList.toggle('hide',h);if(!h&&el.tagName==='LI')n++});$('#shown').textContent=`${n} / ${S.length}`});

// panels
let open=null,lastFocus=null;const scrim=$('.scrim');
function trap(el,e){const f=[...el.querySelectorAll('button,a,input,select,textarea')].filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];
if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
function closePanel(ret=true){if(!open)return;const p=open;p.classList.remove('in');scrim.classList.remove('in');$$('nav button').forEach(b=>b.setAttribute('aria-expanded','false'));open=null;
setTimeout(()=>{p.hidden=true;if(!open)scrim.hidden=true},260);if(ret&&lastFocus)lastFocus.focus()}
function openPanel(id,btn){if(open&&open.id===id)return closePanel();if(open){open.hidden=true;open.classList.remove('in')}
closeDetail(false);lastFocus=btn||document.activeElement;const p=$('#'+id);p.hidden=false;scrim.hidden=false;
requestAnimationFrame(()=>{p.classList.add('in');scrim.classList.add('in')});open=p;
$$('nav button').forEach(b=>b.setAttribute('aria-expanded',b.dataset.panel===id));setTimeout(()=>(p.querySelector('input,.filters button,a')||p).focus(),60)}
$$('nav button').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel,b));
scrim.onclick=()=>closePanel();
$$('[data-home]').forEach(a=>a.onclick=e=>{e.preventDefault();closePanel(false);closeDetail(false);scrollTo({top:0,behavior:'smooth'})});

// detail
let cur=-1,detFocus=null;const det=$('#detail');
function showDetail(i,from){const N=S.length;cur=(i+N)%N;const s=S[cur];if(det.hidden){detFocus=from||document.activeElement}
$('#d-title').innerHTML=`<span>${esc(s.code)}</span>${esc(s.t)}`;
$('#d-meta').innerHTML=`<dl>${[['Code',s.code],['Fiber',s.f],['Weight',s.g+' GSM'],['Finish',s.fi]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><dl>${[['Origin',s.o],['Tags',s.tags.join(', ')],['Year',s.y],['Description',s.d]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${s.r.length?`<dl>${s.r.map((r,j)=>`<dt>${j?'':'Recipe'}</dt><dd>${esc((r.item+' '+r.amount).trim())}</dd>`).join('')}</dl>`:''}`;
const G=$('#d-imgs'),n=s.imgs.length;G.dataset.n=n>3?'many':Math.max(n,1);
G.innerHTML=n?s.imgs.map((src,j)=>`<button class="dshot" data-j="${j}" aria-label="Enlarge photo ${j+1} of ${n}">${img(s,cur,n>1?' / '+(j+1):'',src)}</button>`).join(''):img(s,cur,'','');
if(det.hidden){closePanel(false);det.hidden=false;document.body.classList.add('lock');requestAnimationFrame(()=>det.classList.add('in'))}
det.scrollTop=0;history.replaceState(null,'','#'+s.code.toLowerCase());$('#back').focus()}
function closeDetail(ret=true){if(det.hidden)return;det.classList.remove('in');document.body.classList.remove('lock');history.replaceState(null,'',location.pathname);
setTimeout(()=>det.hidden=true,280);if(ret&&detFocus)detFocus.focus()}
$('#grid').addEventListener('click',e=>{const c=e.target.closest('.card');if(c)showDetail(+c.dataset.i,c.querySelector('button'))});
$('#idx').addEventListener('click',e=>{const r=e.target.closest('tr');if(r)showDetail(+r.dataset.i,$(`.card[data-i="${r.dataset.i}"] button`))});
$('#back').onclick=()=>closeDetail();$('#prev').onclick=()=>showDetail(cur-1);$('#next').onclick=()=>showDetail(cur+1);
$('#req').onclick=()=>{const s=S[cur];closeDetail(false);$$('#picks input').forEach(x=>x.checked=x.value.startsWith(s.code));openPanel('p-request',$('[data-panel=p-request]'))};

// lightbox
const lb=$('#lb');let lj=0,lbFocus=null;
function lbShow(j){const s=S[cur],n=s.imgs.length;lj=(j+n)%n;$('#lb-img').src=s.imgs[lj];$('#lb-img').alt=`${s.t} photo ${lj+1}`;$('#lb-c').textContent=`${s.code} / ${lj+1} of ${n}`;$('#lb-p').hidden=$('#lb-n').hidden=n<2;
if(lb.hidden){lbFocus=document.activeElement;lb.hidden=false;requestAnimationFrame(()=>lb.classList.add('in'));$('#lb-x').focus()}}
function lbClose(){if(lb.hidden)return;lb.classList.remove('in');setTimeout(()=>{lb.hidden=true;$('#lb-img').removeAttribute('src')},220);lbFocus&&lbFocus.focus()}
$('#d-imgs').addEventListener('click',e=>{const b=e.target.closest('.dshot');if(b)lbShow(+b.dataset.j)});
$('#lb-x').onclick=lbClose;$('#lb-p').onclick=()=>lbShow(lj-1);$('#lb-n').onclick=()=>lbShow(lj+1);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lbw'))lbClose()});
let tx=null;lb.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{if(tx==null)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>40&&S[cur].imgs.length>1)lbShow(lj+(dx<0?1:-1))});
document.addEventListener('keydown',e=>{if(!lb.hidden){e.stopImmediatePropagation();if(e.key==='Escape')lbClose();else if(e.key==='ArrowRight')lbShow(lj+1);else if(e.key==='ArrowLeft')lbShow(lj-1);else if(e.key==='Tab')trap(lb,e)}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(open)closePanel();else closeDetail()}
if(e.key==='Tab'){if(open)trap(open,e);else if(!det.hidden)trap(det,e)}
if(!det.hidden&&!open){if(e.key==='ArrowRight')showDetail(cur+1);if(e.key==='ArrowLeft')showDetail(cur-1)}});
(async()=>{let d;try{const r=await fetch('/api/samples');if(!r.ok)throw 0;d=await r.json()}catch{d=await (await fetch('/data/samples.json')).json()}
S=toS(d);render();const m=location.hash.match(/^#eml-(.+)$/);if(m){const i=S.findIndex(s=>s.code.toLowerCase()==='eml-'+m[1]);if(i>=0)showDetail(i)}})();

$('#f').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),s=d.getAll('s').join(', ')||'none selected';
const body=`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nType: ${d.get('type')}\nSamples: ${s}\nDate: ${d.get('date')}\nNotes: ${d.get('notes')}`;
location.href=`mailto:jh@emordes.studio?subject=${encodeURIComponent('Laboratory: '+d.get('type'))}&body=${encodeURIComponent(body)}`};

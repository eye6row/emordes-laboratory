const para=v=>String(v||'').replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/).map(b=>'<p>'+esc(b).replace(/\n/g,'<br>')+'</p>').join('');
let S=[],CATS=[];
const DEF=[['code','Code','l'],['fiber','Fiber','l'],['gsm','Weight','l'],['finish','Finish','l'],['origin','Origin','r'],['tags','Tags','r'],['year','Year','r'],['description','Description','r'],['recipes','Recipes','w'],['notes','Notes','b']],ZONES=['l','r','w','b'];
function lay(x){const out=[],seen=new Set();(Array.isArray(x.fields)?x.fields:[]).forEach(f=>{if(!f||typeof f!=='object')return;const z=ZONES.includes(f.zone)?f.zone:null;
 if(f.key){const d=DEF.find(d=>d[0]===f.key);if(!d||seen.has(f.key))return;seen.add(f.key);out.push({key:f.key,label:f.label||d[1],zone:z||d[2],hidden:!!f.hidden})}
 else out.push({label:f.label||'',value:f.value||'',zone:z||'r',hidden:!!f.hidden})});
 DEF.forEach(d=>{if(!seen.has(d[0]))out.push({key:d[0],label:d[1],zone:d[2],hidden:false})});return out}
const toS=d=>d.samples.map(x=>({cat:CATS.includes(x.category)?x.category:'',n:x.n,code:'EML-'+x.n,t:x.title,f:x.fiber,g:x.gsm,fi:x.finish,o:x.origin,tags:x.tags.length?x.tags:['sample'],d:x.description,y:x.year||'',c:x.crop||null,r:(x.recipes||(x.recipe&&x.recipe.length?[{title:'Recipe',rows:x.recipe}]:[])).map(q=>({title:q.title||'Recipe',rows:(q.rows||[]).map(w=>({i:w.ingredient??w.item??'',a:w.amount||''}))})),L:lay(x),raw:(x.images&&x.images.length?x.images:x.image?[x.image]:[]),cm:x.captions&&typeof x.captions==='object'?x.captions:{},no:String(x.notes||'').trim(),crs:x.crops&&typeof x.crops==='object'?x.crops:{},sz:x.sizes&&typeof x.sizes==='object'?x.sizes:{}})).map(s=>(s.imgs=s.raw.map(u),s.caps=s.raw.map(p=>String(s.cm[p]||'').trim()),s.pc=s.raw.map(p=>s.crs[p]||null),s.zs=s.raw.map(p=>s.sz[p]||''),s.lay=s.zs.some(Boolean),s.img=s.imgs[0]||'',s));
const u=p=>/^images\/uploads\//.test(p)?'/api/img?p='+encodeURIComponent(p):p;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// dot-matrix mark: 7x7 woven diamond
(()=>{let h='';for(let y=0;y<7;y++)for(let x=0;x<7;x++){const d=Math.abs(x-3)+Math.abs(y-3);if(d===3||d===0||(d===1&&(x+y)%2))h+=`<circle cx="${2+x*4}" cy="${2+y*4}" r="1.35"/>`}$('#dots').innerHTML=h})();
const ARROW='<svg class="dm" viewBox="0 0 13 13" aria-hidden="true">'+[[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[2,2]].map(([x,y])=>`<circle cx="${2.5+x*4}" cy="${2.5+y*2}" r="1.1"/>`).join('')+'</svg>';

// placeholder: woven pattern seeded per sample
function ph(i){const hue=[30,48,40,25,200,52,18,0,35,150,10,330][i%12],sat=i===7?0:i===4?20:28;
return `style="--h:${hue};--s:${sat}%;--a:${(i*37)%90}deg"`}
const cst=c=>{if(!c)return '';const n=(v,a,b,d)=>{v=+v;return isFinite(v)?Math.max(a,Math.min(b,v)):d},x=n(c.x,0,100,50),y=n(c.y,0,100,50),z=n(c.zoom,1,3,1);return ` style="object-position:${x}% ${y}%;transform-origin:${x}% ${y}%;transform:scale(${z})"`};
const img=(s,i,k='',src=s.img,cr='')=>`<div class="ph-img" ${ph(i)}><span>${s.code}${k}</span><img src="${esc(src)}" alt="${esc(s.t)} sample${k}" loading="lazy"${cr} onerror="this.remove()"></div>`;

const gid=c=>'cat-'+(c?CATS.indexOf(c):'u');
const groups=()=>{const g=[...CATS,''].map(c=>({c,i:S.map((s,i)=>s.cat===c?i:-1).filter(i=>i>=0)})).filter(x=>x.i.length);return g};
const gname=c=>c||(CATS.length?'Uncategorized':'');
function render(){const N=S.length;$('#count').textContent=N+' Specimens';$('#shown').textContent=N+' / '+N;
const G=groups(),labeled=CATS.length>0;const J=$('#jump');J.hidden=!labeled||G.length<2;
J.innerHTML=labeled?G.map(g=>`<a href="#${gid(g.c)}" data-j="${gid(g.c)}">${esc(gname(g.c))}<sup>${g.i.length}</sup></a>`).join(''):'';
const card=i=>{const s=S[i];return `<li class="card" data-i="${i}" data-tags="${esc(s.tags.join(' '))}" style="--d:${i*40}ms"><button aria-label="Open ${esc(s.t)}, ${s.code}">${img(s,i,'',s.img,cst(s.c))}<span class="ov"><span class="ot"><b>${esc(s.t)}</b><small>${esc(s.code)} / ${esc(s.tags[0])}</small></span>${ARROW}</span></button><div class="cap"><span>${esc(s.code)}</span><span>${esc(s.t)}</span><span>${esc(s.g)} gsm</span></div></li>`};
$('#grid').innerHTML=G.map(g=>(labeled?`<li class="gh" id="${gid(g.c)}" data-g="${gid(g.c)}"><span>${esc(gname(g.c))}</span><span class="gn">${String(g.i.length).padStart(2,'0')}</span></li>`:'')+g.i.map(card).join('')).join('');
$('#grid').querySelectorAll('.card').forEach(el=>el.dataset.g=gid(S[+el.dataset.i].cat));
$('#idx').innerHTML=G.map(g=>(labeled?`<tr class="igh" data-g="${gid(g.c)}"><th colspan="4">${esc(gname(g.c))}</th></tr>`:'')+g.i.map(i=>{const s=S[i];return `<tr data-i="${i}" data-tags="${esc(s.tags.join(' '))}"><td>${esc(s.n)}</td><td><button>${esc(s.t)}</button></td><td>${esc(s.tags[0])}</td><td>${esc(s.y)}</td></tr>`}).join('')).join('');
$('#picks').innerHTML=S.map(s=>`<label><input type="checkbox" name="s" value="${esc(s.code)} ${esc(s.t)}"><span>${esc(s.code)}</span> ${esc(s.t)}</label>`).join('');}

// filters
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(o=>o.classList.toggle('on',o===b));const f=b.dataset.f;let n=0;
$$('[data-tags]').forEach(el=>{const h=f!=='all'&&!el.dataset.tags.includes(f);el.classList.toggle('hide',h);if(!h&&el.tagName==='LI')n++});
$$('.gh,.igh').forEach(h=>h.classList.toggle('hide',!$$(`.card[data-g="${h.dataset.g}"]`).some(c=>!c.classList.contains('hide'))));$('#shown').textContent=`${n} / ${S.length}`});

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
const V=f=>({code:s.code,fiber:s.f,gsm:s.g+' GSM',finish:s.fi,origin:s.o,tags:s.tags.join(', '),year:s.y})[f.key];
const zone=z=>{let h='',row='';const flush=()=>{if(row)h+=`<dl>${row}</dl>`;row=''};
 s.L.filter(f=>!f.hidden&&f.zone===z).forEach(f=>{if(f.key==='notes'){if(s.no){flush();h+=`<aside class="note"><b class="nh">${esc(f.label==='Notes'?'notes':f.label)}</b><div class="nb">${para(s.no)}</div><span class="nm">${esc(s.code)}</span></aside>`}return}if(f.key==='recipes'){flush();h+=s.r.map(q=>`<dl>${(q.rows.length?q.rows:[{i:'',a:''}]).map((r,j)=>`<dt>${j?'':esc(q.title)}</dt><dd>${esc((r.i+' '+r.a).trim())}</dd>`).join('')}</dl>`).join('')}
  else if(f.key==='description'||!f.key)row+=`<dt>${esc(f.label)}</dt><dd class="desc">${para(f.key?s.d:f.value)}</dd>`;else row+=`<dt>${esc(f.label)}</dt><dd>${esc(V(f))}</dd>`});flush();return h};
const zl=zone('l'),zr=zone('r'),zw=zone('w'),zb=zone('b');
$('#d-meta').innerHTML=(zl||zr?`<div class="dcol">${zl}</div><div class="dcol">${zr}</div>`:'')+(zw?`<div class="dwide">${zw}</div>`:'');
$('#d-below').innerHTML=zb?`<div class="dwide">${zb}</div>`:'';$('#d-below').hidden=!zb;
const G=$('#d-imgs'),n=s.imgs.length;G.dataset.n=n>3?'many':Math.max(n,1);
G.classList.toggle('lay',!!s.lay);G.innerHTML=n?s.imgs.map((src,j)=>`<figure class="dshot-f"${s.lay?` data-z="${s.zs[j]||'m'}"`:''}><button class="dshot" data-j="${j}" aria-label="Enlarge photo ${j+1} of ${n}"${s.caps[j]?` aria-describedby="dc${j}"`:''}>${s.pc[j]?img(s,cur,n>1?' / '+(j+1):'',src,cst(s.pc[j])).replace('class="ph-img"','class="ph-img pcrop"'):img(s,cur,n>1?' / '+(j+1):'',src)}</button>${s.caps[j]?`<figcaption class="dfc" id="dc${j}">${esc(s.caps[j]).replace(/\n/g,'<br>')}</figcaption>`:''}</figure>`).join(''):img(s,cur,'','');
const C=$('#d-cap'),any=s.caps.some(Boolean);C.hidden=!any;C.classList.remove('on');C.innerHTML='';G.classList.toggle('hascap',any);
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
function lbShow(j){const s=S[cur],n=s.imgs.length;lj=(j+n)%n;$('#lb-img').src=s.imgs[lj];$('#lb-img').alt=`${s.t} photo ${lj+1}`;$('#lb-c').textContent=`${s.code} / ${lj+1} of ${n}`;const lc=$('#lb-cap');lc.innerHTML=s.caps[lj]?esc(s.caps[lj]).replace(/\n/g,'<br>'):'';lc.hidden=!s.caps[lj];$('#lb-p').hidden=$('#lb-n').hidden=n<2;
if(lb.hidden){lbFocus=document.activeElement;lb.hidden=false;requestAnimationFrame(()=>lb.classList.add('in'));$('#lb-x').focus()}}
function lbClose(){if(lb.hidden)return;lb.classList.remove('in');setTimeout(()=>{lb.hidden=true;$('#lb-img').removeAttribute('src')},220);lbFocus&&lbFocus.focus()}
const capOn=j=>{const s=S[cur],C=$('#d-cap');if(!s||!s.caps[j]){C.classList.remove('on');return}C.innerHTML=`<span class="dcn">${String(j+1).padStart(2,'0')}</span><span class="dct">${esc(s.caps[j]).replace(/\n/g,'<br>')}</span>`;C.classList.add('on')};
$('#d-imgs').addEventListener('mouseover',e=>{const b=e.target.closest('.dshot');if(b)capOn(+b.dataset.j)});
$('#d-imgs').addEventListener('focusin',e=>{const b=e.target.closest('.dshot');if(b)capOn(+b.dataset.j)});
$('#d-imgs').addEventListener('mouseleave',()=>$('#d-cap').classList.remove('on'));
$('#d-imgs').addEventListener('focusout',()=>$('#d-cap').classList.remove('on'));
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
about(d.about);CATS=Array.isArray(d.categories)?d.categories.filter(c=>typeof c==='string'&&c):[];S=toS(d);if(CATS.length){const o=c=>c?CATS.indexOf(c):CATS.length;S=S.map((s,k)=>[s,k]).sort((a,b)=>o(a[0].cat)-o(b[0].cat)||a[1]-b[1]).map(x=>x[0])}render();const m=location.hash.match(/^#eml-(.+)$/);if(m){const i=S.findIndex(s=>s.code.toLowerCase()==='eml-'+m[1]);if(i>=0)showDetail(i)}})();

$('#f').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),s=d.getAll('s').join(', ')||'none selected';
const body=`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nType: ${d.get('type')}\nSamples: ${s}\nDate: ${d.get('date')}\nNotes: ${d.get('notes')}`;
location.href=`mailto:jh@emordes.studio?subject=${encodeURIComponent('Laboratory: '+d.get('type'))}&body=${encodeURIComponent(body)}`};
$('#jump').addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();const t=document.getElementById(a.dataset.j);if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')||60)-14,behavior:'smooth'})});

// print / pdf spec sheets
function sheet(s){const V={code:s.code,fiber:s.f,gsm:s.g?s.g+' GSM':'',finish:s.fi,origin:s.o,tags:s.tags.join(', '),year:s.y};
 const rows=[];s.L.filter(f=>!f.hidden).forEach(f=>{if(!f.key){if(f.value)rows.push([f.label,f.value]);return}if(V[f.key]!=null&&V[f.key]!==''&&f.key!=='code')rows.push([f.label,V[f.key]])});
 if(s.cat)rows.splice(1,0,['Category',s.cat]);
 const on=k=>s.L.some(f=>f.key===k&&!f.hidden),lab=k=>(s.L.find(f=>f.key===k)||{}).label;
 const th=s.imgs.slice(1,4);
 return `<article class="ps"><header class="psh"><div><b>EMORDES LABORATORY</b><span>Textile Innovation &amp; Material Research</span></div><div class="psm"><span>Spec sheet</span><span>${new Date().toLocaleDateString()}</span></div></header>
 <h1><span>${esc(s.code)}</span>${esc(s.t)}</h1>
 <div class="psg"><div class="psi">${s.img?`<img src="${esc(s.img)}" alt="">`:''}${th.length?`<div class="pst">${th.map(x=>`<img src="${esc(x)}" alt="">`).join('')}</div>`:''}</div>
 <div class="psd"><table class="pmt">${rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>
 ${on('description')&&s.d?`<h3>${esc(lab('description'))}</h3><div class="pdesc">${para(s.d)}</div>`:''}
 ${on('recipes')?s.r.filter(q=>q.rows.length).map(q=>`<h3>${esc(q.title)}</h3><table class="prt"><tr><th>Ingredient</th><th>Amount</th></tr>${q.rows.map(r=>`<tr><td>${esc(r.i)}</td><td>${esc(r.a)}</td></tr>`).join('')}</table>`).join(''):''}
 ${on('notes')&&s.no?`<div class="pnote"><b>notes</b>${para(s.no)}</div>`:''}</div></div>
 <footer class="psf"><span>© EMORDES LABORATORY</span><span>izlab.emordes.studio/#${esc(s.code.toLowerCase())}</span></footer></article>`}
async function printS(list){const P=$('#pr');P.innerHTML=list.map(sheet).join('');document.documentElement.classList.add('printing');
 await Promise.all([...P.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));window.print()}
addEventListener('afterprint',()=>setTimeout(()=>document.documentElement.classList.remove('printing'),300));
$('#prt').onclick=()=>{if(cur>=0)printS([S[cur]])};$('#prall').onclick=()=>printS(S);
window.__printS=printS;

// about (editable in admin; static HTML stays if none saved)
const md=t=>esc(t).replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g,(m,a,h)=>`<a href="${h}"${h.startsWith('http')?' target="_blank" rel="noopener"':''}>${a}</a>`).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>').replace(/\n/g,'<br>');
function about(a){if(!a||typeof a!=='object')return;const P=$('#p-about');if(!P)return;
 if(a.tagline!=null)P.querySelector('.ph span:last-child').textContent=a.tagline;
 const big=P.querySelector('.big');if(big){big.innerHTML=md(a.title||'');big.hidden=!a.title}
 const col=P.querySelector('.acols>div');col.querySelectorAll(':scope>p,:scope>.aimg').forEach(e=>e.remove());
 const h=String(a.body||'').trim().split(/\n\s*\n/).filter(Boolean).map(b=>`<p>${md(b.trim())}</p>`).join('')+(a.image?`<img class="aimg" src="${esc(u(a.image))}" alt="">`:'');
 col.insertAdjacentHTML('afterbegin',h)}

const S=[
['001','Binakol Cotton','100% Cotton',280,'Hand-loom twill, optical wave','Ilocos, PH',['heritage','woven'],'The Binakol wave, an optical whirlpool woven to ward off spirits. Studied here for density and repeat.'],
['002','Piña Sheer Study','Pineapple-leaf fiber blend',40,'Translucent, crisp hand','Aklan, PH',['sheer','plant fiber'],'Pineapple-leaf fiber, the cloth of the barong. Tested for drape and layering.'],
['003','Abaca Blend','60% Abaca / 40% Linen',190,'Raw slub, matte','Bicol, PH',['bast','structural'],'Abaca blended with linen for structure without stiffness.'],
['004','Mycelium Bio-Leather','Mycelium composite',520,'Pebbled, waxed','Lab-grown',['biomaterial','vegan'],'Grown, not tanned. A fungal composite finished to read as leather.'],
['005','Recycled Organza','100% rPET',55,'Iridescent, stiff','Post-consumer',['recycled','sheer'],'Post-consumer bottles spun into a sheer, iridescent organza.'],
['006','Banana Silk Jacquard','Musa fiber / Cotton',210,'Satin float jacquard','Davao, PH',['plant fiber','jacquard'],'Musa fiber floats over a cotton ground in a satin jacquard.'],
["007","T'nalak Dye Study",'Abaca, natural dye',170,'Tie-resist, earth tones','South Cotabato, PH',['heritage','natural dye'],"Resist-dye study after T'boli T'nalak, earth tones only."],
['008','Chrome Laminate','Nylon / metallic film',120,'Mirror foil, crinkle','Industrial',['coated','future'],'Mirror foil bonded to nylon. Crinkles and holds its shape.'],
['009','Coconut Coir Felt','Coir / wool',650,'Needle-punched, rigid','Quezon, PH',['nonwoven','upcycled'],'Coconut husk waste needle-punched with wool into a rigid felt.'],
['010','Algae Knit','Seaweed-cellulose yarn',160,'Soft rib, cool touch','Lab-grown',['biomaterial','knit'],'Seaweed-cellulose yarn knit in a soft rib, cool to the touch.'],
['011','Inabel Overshot','100% Cotton',300,'Raised geometric float','Abra, PH',['heritage','woven'],'Ilocano Inabel overshot, raised geometric floats on cotton.'],
['012','Burnout Velvet','Viscose / silk',230,'Devoré, sculpted pile','Studio-treated',['finish','experimental'],'Devoré treatment sculpts the pile, leaving silk windows.']
].map(([n,t,f,g,fi,o,tags,d],i)=>({n,code:'EML-'+n,t,f,g,fi,o,tags,d,img:`images/sample-${String(i+1).padStart(2,'0')}.jpg`}));
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// dot-matrix mark: 7x7 woven diamond
(()=>{let h='';for(let y=0;y<7;y++)for(let x=0;x<7;x++){const d=Math.abs(x-3)+Math.abs(y-3);if(d===3||d===0||(d===1&&(x+y)%2))h+=`<circle cx="${2+x*4}" cy="${2+y*4}" r="1.35"/>`}$('#dots').innerHTML=h})();
const ARROW='<svg class="dm" viewBox="0 0 13 13" aria-hidden="true">'+[[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[2,2]].map(([x,y])=>`<circle cx="${2.5+x*4}" cy="${2.5+y*2}" r="1.1"/>`).join('')+'</svg>';

// placeholder: woven pattern seeded per sample
function ph(i){const hue=[30,48,40,25,200,52,18,0,35,150,10,330][i],sat=i===7?0:i===4?20:28;
return `style="--h:${hue};--s:${sat}%;--a:${(i*37)%90}deg"`}
const img=(s,i,k='')=>`<div class="ph-img" ${ph(i)}><span>${s.code}${k}</span><img src="${s.img}" alt="${esc(s.t)} sample${k}" loading="lazy" onerror="this.remove()"></div>`;

$('#grid').innerHTML=S.map((s,i)=>`<li class="card" data-i="${i}" data-tags="${s.tags.join(' ')}" style="--d:${i*40}ms"><button aria-label="Open ${esc(s.t)}, ${s.code}">${img(s,i)}<span class="ov"><span class="ot"><b>${esc(s.t)}</b><small>${s.code} / ${s.tags[0]}</small></span>${ARROW}</span></button><div class="cap"><span>${s.code}</span><span>${esc(s.t)}</span><span>${s.g} gsm</span></div></li>`).join('');
$('#idx').innerHTML=S.map((s,i)=>`<tr data-i="${i}" data-tags="${s.tags.join(' ')}"><td>${s.n}</td><td><button>${esc(s.t)}</button></td><td>${s.tags[0]}</td><td>2026</td></tr>`).join('');
$('#picks').innerHTML=S.map(s=>`<label><input type="checkbox" name="s" value="${s.code} ${esc(s.t)}"><span>${s.code}</span> ${esc(s.t)}</label>`).join('');

// filters
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(o=>o.classList.toggle('on',o===b));const f=b.dataset.f;let n=0;
$$('[data-tags]').forEach(el=>{const h=f!=='all'&&!el.dataset.tags.includes(f);el.classList.toggle('hide',h);if(!h&&el.tagName==='LI')n++});$('#shown').textContent=`${n} / 12`});

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
function showDetail(i,from){cur=(i+12)%12;const s=S[cur];if(det.hidden){detFocus=from||document.activeElement}
$('#d-title').innerHTML=`<span>${s.code}</span>${esc(s.t)}`;
$('#d-meta').innerHTML=`<dl>${[['Code',s.code],['Fiber',s.f],['Weight',s.g+' GSM'],['Finish',s.fi]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><dl>${[['Origin',s.o],['Tags',s.tags.join(', ')],['Year','2026'],['Description',s.d]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
$('#d-imgs').innerHTML=img(s,cur,'')+img(s,(cur+4)%12,' / Macro')+img(s,(cur+8)%12,' / Drape');
if(det.hidden){closePanel(false);det.hidden=false;document.body.classList.add('lock');requestAnimationFrame(()=>det.classList.add('in'))}
det.scrollTop=0;history.replaceState(null,'','#'+s.code.toLowerCase());$('#back').focus()}
function closeDetail(ret=true){if(det.hidden)return;det.classList.remove('in');document.body.classList.remove('lock');history.replaceState(null,'',location.pathname);
setTimeout(()=>det.hidden=true,280);if(ret&&detFocus)detFocus.focus()}
$('#grid').addEventListener('click',e=>{const c=e.target.closest('.card');if(c)showDetail(+c.dataset.i,c.querySelector('button'))});
$('#idx').addEventListener('click',e=>{const r=e.target.closest('tr');if(r)showDetail(+r.dataset.i,$(`.card[data-i="${r.dataset.i}"] button`))});
$('#back').onclick=()=>closeDetail();$('#prev').onclick=()=>showDetail(cur-1);$('#next').onclick=()=>showDetail(cur+1);
$('#req').onclick=()=>{const s=S[cur];closeDetail(false);$$('#picks input').forEach(x=>x.checked=x.value.startsWith(s.code));openPanel('p-request',$('[data-panel=p-request]'))};

document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(open)closePanel();else closeDetail()}
if(e.key==='Tab'){if(open)trap(open,e);else if(!det.hidden)trap(det,e)}
if(!det.hidden&&!open){if(e.key==='ArrowRight')showDetail(cur+1);if(e.key==='ArrowLeft')showDetail(cur-1)}});
const m=location.hash.match(/eml-(\d{3})/);if(m)showDetail(+m[1]-1);

$('#f').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),s=d.getAll('s').join(', ')||'none selected';
const body=`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nType: ${d.get('type')}\nSamples: ${s}\nDate: ${d.get('date')}\nNotes: ${d.get('notes')}`;
location.href=`mailto:jh@emordes.studio?subject=${encodeURIComponent('Laboratory: '+d.get('type'))}&body=${encodeURIComponent(body)}`};

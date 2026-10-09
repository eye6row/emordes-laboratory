/* Spellchecking stays in the browser, no editor text leaves this page. */
window.SpellGuard=(()=>{
 const words=t=>String(t||'').match(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-z]+)?/g)||[];
 const allow=new Set('Emordes Binakol kusikus Ilocano Bituin Sentro Filipino Filipiniana Rivian izlab JH IZ Pilipinas Kapwa zine Heterogross EML Piña Abaca mycelium'.toLowerCase().split(' '));
 const keys=new Set('title line description text tagline body fiber finish origin notes label value ingredient amount captions alts categories tags'.split(' '));
 const skip=new Set('image images cover photos url emails sha id n code year pos crop crops sizes');
 let loading,active=false;
 function refs(data){const a=[];function walk(o,enabled=false){if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){if(skip.has(k))continue;const yes=enabled||keys.has(k);if(typeof o[k]==='string'&&yes)a.push([o,k]);else if(o[k]&&typeof o[k]==='object')walk(o[k],yes);}}walk(data);return a;}
 function seed(data){for(const [o,k] of refs(data))for(const w of words(o[k]))if(/^[A-ZÀ-ÖØ-Þ]/.test(w)&&w.toLowerCase()!=='awar')allow.add(w.toLowerCase());}
 async function dictionary(){if(!loading)loading=(async()=>{
  if(!window.Typo)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/typo-js@1.3.2/typo.js';const timer=setTimeout(()=>{s.remove();no(new Error('Dictionary timeout'));},12000);s.onload=()=>{clearTimeout(timer);ok()};s.onerror=()=>{clearTimeout(timer);no(new Error('Dictionary unavailable'));};document.head.append(s);});
  const base='https://cdn.jsdelivr.net/npm/typo-js@1.3.2/dictionaries/en_US/en_US.';
  const [aff,dic]=await Promise.all(['aff','dic'].map(async ext=>{const r=await fetch(base+ext,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('Dictionary unavailable');return r.text();}));
  return new Typo('en_US',aff,dic,{platform:'any'});
 })().catch(e=>{loading=null;throw e;});return loading;}
 const style=document.createElement('style');style.textContent='.spell-dialog{width:min(540px,calc(100vw - 28px));max-height:85svh;padding:22px;border:1px solid var(--line,#444);border-radius:var(--r,0);background:var(--bg,#0d0d0d);color:var(--ink,#eee);font:inherit;box-sizing:border-box}.spell-dialog::backdrop{background:rgba(0,0,0,.65)}.spell-dialog h2{font-size:20px;margin:0 0 12px}.spell-dialog p{line-height:1.5;margin:8px 0 16px}.spell-rows{display:grid;gap:8px;max-height:50svh;overflow:auto}.spell-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:center;padding:8px 0;border-top:1px solid var(--line,#333);word-break:break-word}.spell-row input{min-width:0;width:100%;padding:10px;box-sizing:border-box;font:inherit;background:var(--bg2,#151515);color:inherit;border:1px solid var(--line,#444)}.spell-row small{display:block;opacity:.65}.spell-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:20px}.spell-actions button{font:inherit;min-height:44px;padding:0 14px;border:1px solid var(--line,#444);background:var(--bg2,#151515);color:inherit;cursor:pointer}';document.head.append(style);
 const dlg=document.createElement('dialog');dlg.className='spell-dialog';dlg.setAttribute('aria-labelledby','spell-title');document.body.append(dlg);
 function button(t,fn){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=fn;return b;}
 async function review(data,changed){if(active)return false;active=true;const r=refs(data);let dict,error;try{dict=await dictionary()}catch(e){error=e;}
 const bad=new Map();if(dict)for(const [o,k] of r)for(const w of words(String(o[k]).replace(/https?:\/\/\S+/g,''))){const low=w.toLowerCase();if(w.length<2||allow.has(low)||dict.check(w)||dict.check(low))continue;if(!bad.has(w))bad.set(w,dict.suggest(w,4));}
 if(!error&&!bad.size){active=false;return true;}
 return new Promise(resolve=>{
  let finished=false;const end=v=>{if(finished)return;finished=true;active=false;dlg.close();resolve(v);};
  dlg.replaceChildren();const h=document.createElement('h2');h.id='spell-title';h.textContent=error?'Spellcheck unavailable':'Check spelling';const p=document.createElement('p');p.textContent=error?'The English dictionary could not load. Cancel and try again, or save without checking.':'Review these words before publishing. Suggestions are editable. Names and textile terms may be correct.';dlg.append(h,p);
  const rows=document.createElement('div');rows.className='spell-rows';const edits=[];
  for(const [word,suggestions] of bad){const row=document.createElement('label');row.className='spell-row';const info=document.createElement('span');info.textContent=word;const small=document.createElement('small');small.textContent=suggestions.length?'Suggestions '+suggestions.join(', '):'No suggestions';info.append(small);const inp=document.createElement('input');inp.setAttribute('aria-label','Correction for '+word);inp.spellcheck=true;inp.value=suggestions[0]||word;const list=document.createElement('datalist');list.id='spell-options-'+edits.length;for(const t of suggestions){const opt=document.createElement('option');opt.value=t;list.append(opt);}inp.setAttribute('list',list.id);edits.push([word,inp]);row.append(info,inp,list);rows.append(row);}dlg.append(rows);
  const actions=document.createElement('div');actions.className='spell-actions';actions.append(button('Cancel',()=>end(false)));
  if(!error)actions.append(button('Fix',()=>{const replace=new Map(edits.map(([w,i])=>[w,i.value.trim()||w]));for(const [o,k] of r)o[k]=String(o[k]).replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-z]+)?/g,w=>replace.get(w)||w);changed?.();end(false);}));
  actions.append(button('Save anyway',()=>end(true)));dlg.append(actions);dlg.oncancel=e=>{e.preventDefault();end(false);};dlg.showModal();
 });}
 function native(root=document){root.querySelectorAll('input:not([type]),input[type="text"],input[type="search"],textarea').forEach(e=>e.spellcheck=true);}
 native();new MutationObserver(()=>native()).observe(document.body,{childList:true,subtree:true});
 return {seed,review};
})();

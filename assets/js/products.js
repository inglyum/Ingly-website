/* ============ PRODUCTS (modulo) ============
   Catalogo, shop (filtri/ricerca/ordinamento), pagina prodotto con
   configuratore e prezzo live, digitale, carrello, wishlist. */
import { $, T, eur, imgTag, toast, L } from './utils.js';
const { MAT_ART, MATN, CATS, P, DIG, CONFIG } = window.INGLY;
import { go } from './navigation.js';

/* ---- stato ---- */
export const F={cat:new Set(),mat:new Set(),sub:new Set()};
const VIS = () => P.filter(x=>!x.hidden);   /* prodotti visibili sul sito */
let cart=[], wish=new Set(), cur=P[0], sel={qty:1}, collCur='best', SORT='rel', RV=[];

/* ---- categorie (bento home) ---- */
function catCount(id){return VIS().filter(x=>x.cat===id).length}
export function renderCats(){
  $('catBento').innerHTML=CATS.map(c=>{
    const dark=c.darkc?'color:#fffafa':'';
    const cnt=c.go?'':`<span class="cnt">${catCount(c.id)}</span>`;
    const act=c.go?`data-action="go" data-arg="${c.go}"`:`data-action="go-shop" data-arg="${c.id}"`;
    return `<div class="bcard ${c.big?'b-lg':''} ${c.w?'b-w':''} reveal" style="${c.bg?'background:'+c.bg+';':''}${dark}" ${act} role="link" tabindex="0">
      <span class="ic">${c.ic}</span>${cnt}<h3>${c.n[L]}</h3><p style="${c.darkc?'color:#a5a2b8':''}">${c.s[L]}</p></div>`}).join('');
}

/* ---- card prodotto ---- */
function card(x){const a=MAT_ART[x.mat];
  return `<article class="pcard reveal in" data-action="open-product" data-id="${x.id}">
    <div class="pimg" style="background:${a.bg}">
      ${x.tag?`<span class="ptag ${x.tag==='Limited'?'y':x.tag==='B2B'?'b':''}">${x.tag}</span>`:''}
      <button class="wish ${wish.has(x.id)?'on':''}" aria-label="Wishlist" data-action="wish" data-id="${x.id}"><svg viewBox="0 0 24 24"><path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7z"/></svg></button>
      <div class="art">${x.icon}</div>${imgTag(x)}
      <button class="qadd" data-action="quick-add" data-id="${x.id}">+ ${eur(x.price)}</button>
    </div>
    <div class="pbody"><span class="mat">${MATN[x.mat][L]} · ${CATS.find(c=>c.id===x.cat).n[L]}</span><h3>${x.n[L]}</h3>
    <div class="prow"><span class="price">${eur(x.price)}</span><span class="stars">★★★★★ <span>(${x.rev})</span></span></div></div></article>`}

export function toggleWish(id,el){wish.has(id)?wish.delete(id):wish.add(id);el.classList.toggle('on');
  const b=$('wishBadge');b.textContent=wish.size;b.classList.toggle('on',wish.size>0);
  toast(wish.has(id)?T('wAdd'):T('wRm'))}

export const currentProduct = () => cur;

/* ---- HERO: card evidenziate lette dal CATALOGO (nessun dato duplicato) ----
   Quali prodotti: CONFIG.heroFeatured = [id,id,id] (gestibile dall'admin).
   Se manca, usa i primi 3 prodotti marcati con hero:true, poi i primi 3 in evidenza. */
export function heroIds(){
  const cfg=(CONFIG.heroFeatured||[]).filter(id=>P.some(x=>x.id===+id)).map(Number);
  if(cfg.length) return cfg.slice(0,3);
  const flagged=VIS().filter(x=>x.hero).map(x=>x.id);
  if(flagged.length) return flagged.slice(0,3);
  return VIS().slice(0,3).map(x=>x.id);
}
export function renderHero(){
  heroIds().forEach((id,i)=>{
    const el=$('heroCard'+(i+1)); if(!el)return;
    const x=P.find(k=>k.id===id); if(!x){el.innerHTML='';return}
    const a=MAT_ART[x.mat], c=CATS.find(k=>k.id===x.cat);
    const sub=MATN[x.mat][L]+(c&&c.sub[x.sub]?' · '+c.sub[x.sub][L]:'');
    el.dataset.action='open-product'; el.dataset.id=x.id;
    el.innerHTML=`<div class="ph" style="background:${a.bg}">
      <div style="position:absolute;inset:0;display:grid;place-items:center;font-size:46px">${x.icon}</div>${imgTag(x)}</div>
      <h4>${x.n[L]}</h4><p>${sub}</p><div class="pr">${T('from')} ${eur(x.price)}</div>`;
  });
}

/* ---- collezioni ---- */
export function renderColl(){$('collGrid').innerHTML=VIS().filter(x=>x.coll&&x.coll.includes(collCur)).slice(0,4).map(card).join('')}

/* ---- shop ---- */
const MATKEYS=Object.keys(MAT_ART).filter(k=>k!=='File');
const chip=(on,action,v,label)=>`<button class="chip ${on?'on':''}" data-action="${action}" data-v="${v}">${label}</button>`;
export function renderChips(){
  $('fCat').innerHTML=CATS.filter(c=>!c.go).map(c=>chip(F.cat.has(c.id),'tog-cat',c.id,c.ic+' '+c.n[L])).join('');
  $('fMat').innerHTML=MATKEYS.map(m=>chip(F.mat.has(m),'tog-mat',m,MATN[m][L])).join('');
  const sw=$('subWrap');
  if(F.cat.size===1){const c=CATS.find(x=>x.id===[...F.cat][0]);
    if(c.sub.length){sw.classList.add('show');$('fSub').innerHTML=c.sub.map((s,i)=>chip(F.sub.has(i),'tog-sub',i,s[L])).join('')}
    else sw.classList.remove('show');
  } else {sw.classList.remove('show');F.sub.clear()}
}
export function togCat(id){F.cat.has(id)?F.cat.delete(id):F.cat.add(id);F.sub.clear();renderChips();renderShop()}
export function togMat(m){F.mat.has(m)?F.mat.delete(m):F.mat.add(m);renderChips();renderShop()}
export function togSub(i){i=+i;F.sub.has(i)?F.sub.delete(i):F.sub.add(i);renderChips();renderShop()}
export function resetFilters(){F.cat.clear();F.mat.clear();F.sub.clear();$('q').value='';$('pRange').value=120;$('pv').textContent='€120';renderChips();renderShop()}
function filterProducts(){
  const q=$('q').value.trim().toLowerCase(),max=+$('pRange').value;
  return VIS().filter(x=>{
    const c=CATS.find(k=>k.id===x.cat), sub=c.sub[x.sub];
    const hay=(x.n.it+' '+x.n.en+' '+c.n.it+' '+c.n.en+' '+MATN[x.mat].it+' '+MATN[x.mat].en+(sub?' '+sub.it+' '+sub.en:'')).toLowerCase();
    return (!q||hay.includes(q))&&(F.cat.size===0||F.cat.has(x.cat))&&(F.mat.size===0||F.mat.has(x.mat))&&(F.sub.size===0||F.sub.has(x.sub))&&x.price<=max});
}
export function renderShop(){
  const res=filterProducts();
  if(SORT==='pa')res.sort((a,b)=>a.price-b.price);
  if(SORT==='pd')res.sort((a,b)=>b.price-a.price);
  if(SORT==='rv')res.sort((a,b)=>b.rev-a.rev);
  $('resN').textContent=res.length;
  $('shopGrid').innerHTML=res.length?res.map(card).join(''):`<div class="empty"><b>${T('empT')}</b>${T('empS')}</div>`;
  renderRV();
}
export function setSort(v){SORT=v;renderShop()}
export function fillSort(){const s=$('sortSel');if(!s)return;
  s.innerHTML=[['rel','sortRel'],['pa','sortPa'],['pd','sortPd'],['rv','sortRv']].map(o=>`<option value="${o[0]}" ${SORT===o[0]?'selected':''}>${T(o[1])}</option>`).join('')}
export function renderRV(){const w=$('rvWrap');if(!w)return;
  const items=RV.map(id=>P.find(x=>x.id===id)).filter(Boolean);
  w.classList.toggle('show',items.length>0);
  $('rvStrip').innerHTML=items.map(x=>`<div class="rv-it" data-action="open-product" data-id="${x.id}"><div class="ri" style="background:${MAT_ART[x.mat].bg}">${x.icon}</div><div><b>${x.n[L]}</b><span>${eur(x.price)}</span></div></div>`).join('')}

/* ---- pagina prodotto / configuratore ---- */
export function openProduct(id){RV=[id,...RV.filter(x=>x!==id)].slice(0,8);
  cur=P.find(x=>x.id===id)||P[0];sel={qty:1};
  renderPP();go('product')}
export function renderPP(){
  const a=MAT_ART[cur.mat], c=CATS.find(k=>k.id===cur.cat);
  $('crumbName').textContent=cur.n[L];
  $('ppCat').textContent=c.ic+' '+c.n[L]+(c.sub[cur.sub]?' · '+c.sub[cur.sub][L]:'');
  $('ppName').textContent=cur.n[L];
  $('ppStars').innerHTML=`★★★★★ <span>(${cur.rev} ${T('revs')})</span>`;
  $('ppProd').textContent=cur.prod+' '+T('days');
  $('ppMat').textContent=MATN[cur.mat][L];
  $('ppMain').style.background=a.bg;
  $('ppArt').innerHTML=cur.icon+imgTag(cur);
  /* Galleria: miniature solo se il prodotto ha più foto */
  const shots=galleryOf(cur), tw=$('ppThumbs');
  tw.style.display=shots.length>1?'':'none';
  tw.innerHTML=shots.length>1?shots.map((src,i)=>`<div class="thumb ${i===0?'on':''}" style="background:${a.bg}" data-action="pp-thumb" data-src="${src}" role="button" tabindex="0"><img src="${src}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"></div>`).join(''):'';
  $('ppQty').textContent=sel.qty;
  $('ppDesc').textContent=(cur.desc&&cur.desc[L])||T('descDefault');
  $('ppEmbed').innerHTML=cur.embed?`<h5 style="font-family:var(--fd);font-style:italic;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);margin:18px 0 10px">${T('embedH')}</h5><iframe src="${cur.embed}" loading="lazy" title="Configuratore" style="width:100%;height:440px;border:1px solid var(--line);border-radius:20px;background:#fff"></iframe>`:'';
  renderDisc();price();
  $('relGrid').innerHTML=VIS().filter(x=>x.id!==cur.id&&(x.cat===cur.cat||x.mat===cur.mat)).slice(0,4).map(card).join('');
}
export function galleryOf(x){
  const main=x.img||(CONFIG.cartellaImmagini+x.id+'.webp');
  return [main,...(x.gallery||[])];
}
export function ppThumb(el){
  el.parentNode.querySelectorAll('.thumb').forEach(x=>x.classList.remove('on'));
  el.classList.add('on');
  const src=el.dataset.src; if(!src)return;
  const art=$('ppArt'), img=art.querySelector('img.pimgph');
  if(img) img.src=src; else art.insertAdjacentHTML('beforeend',`<img class="pimgph" src="${src}" alt="" loading="lazy">`);
}
export function qty(d){sel.qty=Math.max(1,sel.qty+ +d);$('ppQty').textContent=sel.qty;renderDisc();price()}
const unit=()=>cur.price;
const disc=q=>q>=50?.85:q>=20?.9:q>=10?.95:1;
function price(){const u=unit(),d=disc(sel.qty);
  $('ppPrice').textContent=eur(u*d);
  $('ppUnit').textContent=d<1?T('bulk')+' −'+Math.round((1-d)*100)+'%':T('perPiece');
  $('ppTotal').textContent=eur(u*sel.qty*d);
  const sb=$('sbPrice');if(sb){sb.textContent=eur(u*sel.qty*d);$('sbName').textContent=cur.n[L]}}
function renderDisc(){const u=unit(),rows=[[1,9,1],[10,19,.95],[20,49,.9],[50,'∞',.85]];
  $('discTable').innerHTML=`<div class="row hd"><span>${T('dQty')}</span><span>${T('dDisc')}</span><span>${T('dUnit')}</span></div>`+rows.map(r=>{const hit=sel.qty>=r[0]&&(r[1]==='∞'||sel.qty<=r[1]);return `<div class="row ${hit?'hit':''}"><span>${r[0]}${r[1]==='∞'?'+':'–'+r[1]}</span><span>${r[2]===1?'—':'−'+Math.round((1-r[2])*100)+'%'}</span><span><b>${eur(u*r[2])}</b></span></div>`}).join('')}
export function addFromPP(){addToCart(cur.id,sel.qty,MATN[cur.mat][L],'',unit()*disc(sel.qty))}

/* ---- digitale ---- */
export function renderDigital(){$('digGrid').innerHTML=DIG.map(d=>`<div class="dcard reveal in">
  <div style="height:110px;border-radius:14px;background:${MAT_ART.File.bg};display:grid;place-items:center;font-size:42px">${d.icon}</div>
  <h3 style="font-size:17px;margin-top:14px">${d.n[L]}</h3>
  <div class="fmt">${d.f.map(f=>`<i>${f}</i>`).join('')}</div>
  <span class="lic">${T('lic')}</span>
  <div class="dl"><span class="price">${eur(d.price)}</span><button class="btn btn-blue" style="padding:10px 20px;font-size:13.5px" data-action="dig-add" data-id="${d.id}">⬇ ${T('buy')}</button></div></div>`).join('')}
export function addDigital(id){const d=DIG.find(x=>x.id===+id);cart.push({dig:d,q:1,u:d.price});renderCart();toast(T('added'));openCart()}

/* ---- carrello ---- */
export function addToCart(id,q=1,mat,txt,u){const x=P.find(k=>k.id===+id);cart.push({p:x,q,mat:mat||MATN[x.mat][L],txt:txt||'',u:u??x.price});renderCart();toast(T('added'));openCart()}
export function rmCart(i){cart.splice(+i,1);renderCart()}
export function cQty(i,d){i=+i;cart[i].q=Math.max(1,cart[i].q+ +d);renderCart()}
export function renderCart(){const n=cart.reduce((s,i)=>s+i.q,0),b=$('cartBadge');b.textContent=n;b.classList.toggle('on',n>0);
  $('drItems').innerHTML=cart.length?cart.map((i,x)=>{const nm=i.dig?i.dig.n[L]:i.p.n[L],ic=i.dig?i.dig.icon:i.p.icon,bg=i.dig?MAT_ART.File.bg:MAT_ART[i.p.mat].bg,meta=i.dig?i.dig.f.join(' · '):i.mat+(i.txt?' · “'+i.txt+'”':'');
  return `<div class="ditem"><div class="di-img" style="background:${bg}">${ic}</div><div style="flex:1"><h4>${nm}</h4><div class="di-meta">${meta}</div>
  <div style="display:flex;align-items:center;gap:8px">${i.dig?'':`<div class="qty"><button data-action="cart-qty" data-i="${x}" data-d="-1" aria-label="−">−</button><b>${i.q}</b><button data-action="cart-qty" data-i="${x}" data-d="1" aria-label="+">+</button></div>`}<button style="font-size:12px;color:var(--ink-soft);text-decoration:underline" data-action="cart-rm" data-i="${x}">${T('rm')}</button></div></div>
  <div class="di-price">${eur(i.u*i.q)}</div></div>`}).join(''):`<div class="dr-empty"><div class="big">⛯</div><b style="font-family:var(--fd);font-size:19px;color:var(--ink)">${T('crtE')}</b><p style="font-size:14px;margin-top:6px">${T('crtE2')}</p></div>`;
  $('drTotal').textContent=eur(cart.reduce((s,i)=>s+i.u*i.q,0))}
export function openCart(){$('drawer').classList.add('open');$('overlay').classList.add('open')}
export function closeCart(){$('drawer').classList.remove('open');$('overlay').classList.remove('open')}
export function checkoutWhatsApp(){
  if(!cart.length){ toast(T('crtE')); return }
  const num=(CONFIG.whatsapp||'').replace(/\D/g,'');
  if(!num){ toast('Numero WhatsApp non configurato'); return }
  let msg = (L==='it'?'Ciao INGLY! Vorrei ordinare:':'Hi INGLY! I would like to order:')+'\n';
  cart.forEach(i=>{
    const nm=i.dig?i.dig.n[L]:i.p.n[L];
    const meta=i.dig?'':(i.mat?' ('+i.mat+')':'');
    msg += `\n• ${i.q}× ${nm}${meta} — ${eur(i.u*i.q)}`;
  });
  const tot=cart.reduce((s,i)=>s+i.u*i.q,0);
  msg += '\n\n'+(L==='it'?'Totale indicativo':'Estimated total')+': '+eur(tot);
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg),'_blank');
}

/* ---- controlli statici dello shop ---- */
export function setColl(c,btn){collCur=c;document.querySelectorAll('#collTabs .tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderColl()}
export function initShopControls(){
  $('q').addEventListener('input',renderShop);
  $('pRange').addEventListener('input',e=>{$('pv').textContent='€'+e.target.value;renderShop()});
  $('sortSel').addEventListener('change',e=>setSort(e.target.value));
}

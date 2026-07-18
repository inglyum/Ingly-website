/* ============ APP (entry module) ============
   Bootstrap: configurazione, lingua, render, delega eventi, avvio router. */
const { CONFIG, D, SOCIALS, TECH, MATERIALS, STEPS, REVIEWS, BIZ, FAQS, PORT } = window.INGLY;
import { $, T, L, setL, toast } from './utils.js';
import { initNav, show, go, goShop, toggleMenu, currentPage } from './navigation.js';
import { initAnimations, observeAll, refreshMagnets } from './animations.js';
import * as prod from './products.js';
import { renderUrg, initForms } from './forms.js';
import { initLazy } from './lazyload.js';
import { initSeo, updateSeo } from './seo.js';

/* ---- config → DOM ---- */
function applyConfig(){
  document.title = CONFIG.titolo;
  const md=document.querySelector('meta[name="description"]'); if(md) md.content=CONFIG.descrizione;
  const s=CONFIG.social, map=[s.instagram,s.facebook,s.tiktok,s.pinterest,s.whatsapp,s.etsy];
  map.forEach((u,i)=>{ if(u&&SOCIALS[i]) SOCIALS[i][1]=u });
  document.querySelectorAll('a[href^="https://instagram.com"]').forEach(a=>a.href=s.instagram);
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(a=>a.href=CONFIG.whatsapp);
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href='mailto:'+CONFIG.email;a.textContent=CONFIG.email});
  $('ftCopy').textContent=CONFIG.copyright;
  $('ftLegal').textContent=CONFIG.legale;
  const st=CONFIG.statistiche, hb=document.querySelectorAll('.hero-meta .hm b');
  if(hb.length===3){hb[0].textContent=st.pezzi.toLocaleString('it-IT')+'+';hb[1].textContent=st.materiali;hb[2].textContent=st.rating}
  document.querySelectorAll('#page-about .count').forEach((c,i)=>{const v=[st.pezzi,st.clienti,st.materiali,st.puntualita][i];if(v!=null)c.dataset.to=v});
}
function renderSocials(){['soc1','soc2','soc3'].forEach(id=>{const el=$(id);if(el)el.innerHTML=SOCIALS.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener" aria-label="${s[0]}" title="${s[0]}">${s[2]}</a>`).join('')})}

/* ---- i18n ---- */
function applyI18n(){
  document.documentElement.lang=L;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const v=D[L][el.dataset.i18n];if(v!==undefined)el.innerHTML=v});
  document.querySelectorAll('[data-ph]').forEach(el=>{const v=D[L][el.dataset.ph];if(v!==undefined)el.placeholder=v});
  $('heroH1').innerHTML=T('heroH1');
  $('langIT').classList.toggle('on',L==='it');
  $('langEN').classList.toggle('on',L==='en');
  prod.fillSort();
  const l=$('ldrTxt');if(l)l.textContent=T('ldr');
  const sb=$('sbBtn');if(sb)sb.firstChild.textContent=T('ppAdd')+' ';
}
function setLang(l){setL(l);applyI18n();renderAll();const pg=currentPage();updateSeo(pg,L,T,pg==='product'?prod.currentProduct():null)}

/* ---- contenuti statici ---- */
function renderTech(){const html=TECH.map(t=>`<div class="mcard ${t.lg?'m-lg':''} reveal"><span class="mtype">${t.t}</span><h3>${t.n}</h3><p>${t.d[L]}</p><div class="spec">${t.s.map(s=>`<i>${s}</i>`).join('')}</div></div>`).join('');
  $('techGrid').innerHTML=html;const g2=$('techGrid2');if(g2)g2.innerHTML=html}
function renderSteps(){$('stepsGrid').innerHTML=STEPS.map((s,i)=>`<div class="step reveal"><span class="n">0${i+1}</span><h3>${s[L][0]}</h3><p>${s[L][1]}</p></div>`).join('')}
function renderReviews(){$('revGrid').innerHTML=REVIEWS.map((r,i)=>`<div class="rcard reveal" style="transition-delay:${i*.1}s"><div class="stars">★★★★★</div><p class="q">${r.q[L]}</p><div class="who"><div class="av" style="background:${r.c}">${r.i}</div><div><b>${r.w}</b><span>${r.s[L]}</span></div></div></div>`).join('')}
function renderBiz(){$('bizCards').innerHTML=BIZ.map((b,i)=>`<div class="rcard reveal" style="transition-delay:${i*.06}s"><div style="font-size:30px">${b[0]}</div><h3 style="margin:14px 0 8px;font-size:20px">${b[1][L]}</h3><p style="font-size:14.5px;color:var(--ink-soft)">${b[2][L]}</p></div>`).join('')}
function renderFaq(){$('faqList').innerHTML=FAQS.map(f=>`<details class="fitem reveal"><summary>${f[0][L]}<span class="pl" aria-hidden="true">+</span></summary><div class="fbody"><p>${f[1][L]}</p></div></details>`).join('')}
function renderMat(){const g=$('matGrid');if(!g)return;g.innerHTML=MATERIALS.map(m=>`<div class="matcard reveal"><div class="sw2" style="background:linear-gradient(140deg,${m[2]})"></div><b>${L==='it'?m[0]:m[1]}</b><span>${m[3][L]}</span></div>`).join('')}
const tile=(g)=>`<figure class="gtile" style="background:linear-gradient(140deg,${g[2]})"><div class="big" aria-hidden="true">${g[0]}</div><figcaption class="lbl">${g[1][L]}</figcaption></figure>`;
function renderPort(){
  $('gal1').innerHTML=[...PORT.slice(0,8),...PORT.slice(0,8)].map(tile).join('');
  $('gal2').innerHTML=[...PORT.slice(4),...PORT.slice(4)].map(tile).join('');
  $('portGrid').innerHTML=PORT.map(tile).join('')}

function renderAll(){prod.renderHero();prod.renderCats();prod.renderColl();prod.renderChips();prod.renderShop();prod.renderPP();prod.renderDigital();renderTech();renderSteps();renderReviews();renderBiz();renderFaq();renderMat();renderPort();renderUrg();prod.renderCart();observeAll();refreshMagnets()}

/* ---- delega eventi (niente handler inline) ---- */
const actions={
  'go':el=>go(el.dataset.arg),
  'go-shop':el=>goShop(el.dataset.arg),
  'open-product':el=>prod.openProduct(+el.dataset.id),
  'wish':(el,e)=>{e.stopPropagation();prod.toggleWish(+el.dataset.id,el)},
  'quick-add':(el,e)=>{e.stopPropagation();prod.addToCart(el.dataset.id)},
  'open-cart':()=>prod.openCart(),
  'close-cart':()=>prod.closeCart(),
  'menu-open':()=>toggleMenu(true),
  'menu-close':()=>toggleMenu(false),
  'lang':el=>setLang(el.dataset.l),
  'tog-cat':el=>prod.togCat(el.dataset.v),
  'tog-mat':el=>prod.togMat(el.dataset.v),
  'tog-sub':el=>prod.togSub(el.dataset.v),
  'reset-filters':()=>prod.resetFilters(),
  'pp-thumb':el=>prod.ppThumb(el),
  'pp-qty':el=>prod.qty(el.dataset.d),
  'pp-add':()=>prod.addFromPP(),
  'dig-add':el=>prod.addDigital(el.dataset.id),
  'cart-qty':el=>prod.cQty(el.dataset.i,el.dataset.d),
  'cart-rm':el=>prod.rmCart(el.dataset.i),
  'coll':el=>prod.setColl(el.dataset.coll,el),
  'pill':el=>{el.parentNode.querySelectorAll('.pill').forEach(x=>x.classList.remove('on'));el.classList.add('on')},
  'fake-upload':el=>{el.classList.toggle('done');el.textContent=el.classList.contains('done')?('✓ '+(el.dataset.done||'file')):el.dataset.t},
  'toast-soon':()=>toast(T('soon')),
  'checkout-wa':()=>prod.checkoutWhatsApp(),
  'search':()=>{go('shop');setTimeout(()=>$('q').focus(),400)},
  'quote-scroll':()=>{const q=document.querySelector('.quote-form');if(q)q.scrollIntoView({behavior:'smooth'})}
};
function initDelegation(){
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const fn=actions[el.dataset.action];if(fn){if(el.tagName==='A'&&el.getAttribute('href')==='#')e.preventDefault();fn(el,e)}
  });
}

/* ---- avvio ---- */
$('mq').innerHTML+=$('mq').innerHTML;
applyConfig();renderSocials();
initSeo();
initNav();initAnimations();initLazy();initForms();prod.initShopControls();initDelegation();
applyI18n();renderAll();
show(currentPage());

/* ============ NAVIGATION (modulo) ============
   Router hash (#/pagina): deep-link, cronologia, stato pagina. */
import { observeAll } from './animations.js';
import { F, renderRV, renderChips, renderShop, currentProduct } from './products.js';
import { updateSeo } from './seo.js';
import { L, T } from './utils.js';

export const PAGES=['home','shop','product','digital','business','portfolio','about','faq','quote'];
export function currentPage(){const m=location.hash.match(/^#\/(\w+)/);return m&&PAGES.includes(m[1])?m[1]:'home'}
export function show(page){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-links [data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));
  toggleMenu(false);
  document.body.classList.toggle('on-product',page==='product');
  window.scrollTo({top:0,behavior:'instant'});
  if(page==='shop')renderRV();
  updateSeo(page, L, T, page==='product'?currentProduct():null);
  observeAll();
}
export function go(page){ if(currentPage()===page) show(page); else location.hash='#/'+page }
export function goShop(cat){F.cat.clear();F.sub.clear();F.mat.clear();if(cat)F.cat.add(cat);renderChips();renderShop();go('shop')}
export function toggleMenu(open){document.getElementById('mm').classList.toggle('open',open)}
export function initNav(){ addEventListener('hashchange',()=>show(currentPage())) }

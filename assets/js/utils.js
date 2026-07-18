/* ============ UTILS (modulo) ============
   Helper condivisi: lingua, traduzioni, prezzi, toast, foto prodotto. */
const { D, CONFIG } = window.INGLY;

export let L = 'it';
export function setL(v){ L = v }

export const $ = id => document.getElementById(id);
export const T = k => D[L][k] || k;
export const eur = n => '€' + n.toFixed(2).replace('.', L==='it' ? ',' : '.');
export const imgTag = x => `<img class="pimgph" src="${x.img||CONFIG.cartellaImmagini+x.id+'.webp'}" alt="" loading="lazy">`;

let toastT;
export function toast(msg){
  $('toastMsg').textContent = msg;
  const t = $('toast'); t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('on'), 2600);
}

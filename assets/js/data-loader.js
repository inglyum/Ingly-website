/* ============ DATA LOADER (modulo) ============
   Fonte di verità: /data/*.json con CACHE-BUSTING automatico.
   1) legge data/version.json (mai in cache) → versione
   2) carica i JSON con ?v=<versione>
   ROBUSTEZZA: se un singolo file manca o è corrotto, NON fallisce tutto:
   recupera solo quel pezzo dai dati di riserva (data/*.js) e segnala l'anomalia.
   Su file:// (doppio click) usa direttamente i dati di riserva. */
const FILES=['config','texts','social','products','categories','content'];
const KEY={config:'CONFIG',texts:'D',social:'SOCIALS',products:'P',categories:'CATS'};

export const dataStatus={mode:'',version:null,missing:[],warnings:[]};

export async function loadData(){
  if(window.INGLY && window.INGLY.CATS) return window.INGLY;
  let v=null;
  try{
    const vr=await fetch('data/version.json?t='+Date.now(),{cache:'no-store'});
    if(vr.ok) v=(await vr.json()).v;
  }catch(e){}

  const I={};
  if(v!=null){
    const res=await Promise.allSettled(FILES.map(f=>
      fetch(`data/${f}.json?v=${v}`).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json() })));
    res.forEach((r,i)=>{
      const f=FILES[i];
      if(r.status==='fulfilled'){
        if(f==='content') Object.assign(I,r.value); else I[KEY[f]]=r.value;
      } else dataStatus.missing.push(f+'.json');
    });
    dataStatus.mode='json'; dataStatus.version=v;
  } else dataStatus.mode='legacy';

  /* pezzi mancanti → riserva (data/*.js), senza sovrascrivere ciò che è arrivato dai JSON */
  const need = dataStatus.mode!=='json' || dataStatus.missing.length;
  if(need){
    const legacy=await loadLegacy().catch(()=>null);
    if(legacy){
      for(const k of Object.keys(legacy)) if(I[k]===undefined) I[k]=legacy[k];
      if(dataStatus.missing.length)
        dataStatus.warnings.push('Dati recuperati dalla riserva per: '+dataStatus.missing.join(', ')+'. Carica questi file nella cartella data/ del repository.');
    }
  }
  if(!I.CATS || !I.P) throw new Error('Dati del sito non trovati (né JSON né riserva).');
  I.__v=v; I.__status=dataStatus;
  window.INGLY=I;
  if(dataStatus.warnings.length) console.warn('[INGLY]', dataStatus.warnings.join(' | '));
  return I;
}

/* riserva: gli script classici data/*.js (funzionano anche su file://) */
function loadLegacy(){
  const stash=window.INGLY; window.INGLY={};
  return new Promise((res,rej)=>{
    const fl=['config','i18n','socials','catalog']; let i=0;
    const next=()=>{
      if(i>=fl.length){ const got=window.INGLY; window.INGLY=stash; return got.CATS?res(got):rej(new Error('riserva incompleta')) }
      const s=document.createElement('script'); s.src='data/'+fl[i++]+'.js';
      s.onload=next; s.onerror=()=>{ window.INGLY=stash; rej(new Error('File mancante: '+s.src)) };
      document.head.appendChild(s);
    };next();
  });
}

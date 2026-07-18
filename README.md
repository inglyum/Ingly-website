# INGLY DESIGN — Sito web

Sito statico premium di INGLY DESIGN (incisione laser, stampa UV/DTF, 3D — made in Italy).
Bilingue IT/EN, catalogo config-driven, tema immersivo. **Nessuna dipendenza, nessuna build richiesta.**

## Avvio locale
Doppio click su `index.html`: funziona subito (doppio motore di avvio: moduli ES quando c'è un server, bundle di riserva `app.fallback.js` quando si apre da file). Per lo sviluppo con ricarica: `npx serve .`

## Regola d'oro per le modifiche
- Modifichi **`data/`** (testi, prodotti, contatti) → nessun comando: salva e ricarica.
- Modifichi **`assets/js/`** (codice) → esegui `npm run build` per rigenerare `app.fallback.js` e `dist/` (la CI lo farà da sola in Fase 11).

## Struttura
```
index.html                pagina unica (SPA con routing #/pagina)
assets/css/               reset → variables → animations → layout → components → pages → responsive
assets/js/                utils, navigation (router), animations, products, forms, lazyload, app (bootstrap)
assets/images/logo.png    logo (un solo file, riusato ovunque)
favicon/                  icone 16→512 + apple-touch
data/config.js            ⚙️ PANNELLO DI CONTROLLO (contatti, social, statistiche)
data/i18n.js              🌍 tutti i testi IT/EN
data/catalog.js           🗂 categorie, prodotti, digitali, FAQ, recensioni, portfolio
components/               partial di riferimento (header/hero/footer)
```

## Dove modificare
- **Contatti/social/numeri** → `data/config.js`
- **Testi e traduzioni** → `data/i18n.js`
- **Prodotti/categorie** → `data/catalog.js` (istruzioni nei banner)
- **Foto prodotti** → cartella `img/` con `<id>.jpg` (compaiono da sole)
- **Colori** → `assets/css/variables.css` (secondo blocco `:root`)

## Deploy
GitHub Pages (repo `ingly-design-website`) o Cloudflare Pages. Dominio: https://www.inglydesign.it
Guida completa e CI/CD nelle Fasi 11–12 del piano di modernizzazione.

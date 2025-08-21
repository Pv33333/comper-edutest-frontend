# Refactorizări propuse — Comper-Edutest

Scop: documentez toate propunerile de refactorizare identificate în analiză, ordonate după prioritate, cu fișiere afectate, risc/efort estimat, pași concreți de implementare și validare.

## Checklist cerințe
- [x] Analiză fișiere atașate: `.github/copilot-instructions.md` și `.github/instructiuni-basic.md`
- [x] Indexare rapidă a codebase-ului și citire fișiere cheie (`src/main.jsx`, `src/router.jsx`, `src/App.jsx`, `src/layouts/*`, `src/components/*`, `src/hooks/*`)
- [x] Generare listă prioritizată de refactorizări cu detalii implementare și validare

---

## Prioritate: Critice / Fixează acum

1) Bootstrapping & Toast import inconsistency
- Descriere: `src/main.jsx` pornește `AppRouter` direct, evitând `src/App.jsx` (care folosește `useToast`). `App.jsx` importă `./components/Toast` dar hook-ul este în `src/components/ui/Toast.jsx`.
- Fișiere: `src/main.jsx`, `src/App.jsx`, `src/components/ui/Toast.jsx`
- Risc / Efort: Mic / 15–30m
- Pași sugerați:
  - Preferat: modifica `src/main.jsx` să importe și să monteze `App` în loc de `AppRouter` (import `./App.jsx`).
  - În `App.jsx` corectează importul: `import { useToast, ToastContainer } from './components/ui/Toast.jsx'`.
- Validare: `npm run dev` pornește fără erori; toast-urile apar (testare manuală invocând `addToast` dintr-un component).

2) Înlocuire încărcare Chart.js de pe CDN cu import din npm/dynamic import
- Descriere: `src/hooks/useChartJs.js` folosește CDN pentru `chart.js` în loc de pachetul deja în `package.json`.
- Fișiere: `src/hooks/useChartJs.js`, `src/components/ChartCanvas.jsx` și alte consumatoare de chart-uri
- Risc / Efort: Mic–Mediu / 30–90m
- Pași sugerați:
  - Schimbă hook-ul pentru a folosi dynamic import: `const Chart = await import('chart.js/auto'); setChart(Chart.default || Chart)` sau export un loader async.
  - Dacă folosește `react-chartjs-2`, preferă folosirea componentelor `Chart` din acel pachet.
- Validare: Graficele se afișează, niciun error în consolă; bundle nu include duplicate CDN runtime.

3) Fixare inconsistențe de nume/case pentru utilitare
- Descriere: Found `import { stripPageBg } from '../utils/normalizeBg'` while file is `normalizeBG.js` — pe Windows nu-arată eroare, dar pe CI Linux va eșua.
- Fișiere: `src/layouts/SiteLayout.jsx`, `src/utils/normalizeBG.js`
- Risc / Efort: Mic / 10–20m
- Pași sugerați: Renumește variabila import/export pentru consistență (`normalizeBg.js`) sau schimbă importul pentru a se potrivi exact; adaugă test minimal sau lint rule pentru importuri.
- Validare: Build pe un mediu cu FS case-sensitive (sau rule local ESLint) trece.

---

## Prioritate: Mijlocii (îmbunătățiri de mentenabilitate)

4) Centralizare metadate rute (în loc de regex în `Loader.jsx`)
- Descriere: `Loader.jsx` folosește regex pentru a detecta "dash" routes; soluție mai robustă e un manifest de rute cu `meta` (ex: `isDashboard`) sau wrapper care setează meta într-un context.
- Fișiere: `src/router.jsx`, `src/components/Loader.jsx`
- Risc / Efort: Mediu / 1–3h
- Pași sugerați: Creează `routes.js` (array de obiecte `{ path, element, meta }`) sau extinde generarea actuală de rute cu `meta`. Actualizează `Loader` să citească contextul curent.
- Validare: Comportament identic la încărcare; cod mai ușor de extins.

5) Extrage logica de drawer/header în hook-uri și componente reutilizabile
- Descriere: `Header.jsx` conține `useEffect` pentru ESC, outside-click și blocarea scroll-ului; extrage în hooks `useOnClickOutside`, `useEscapeKey`, `useLockBodyScroll` și/sau creează `Drawer` component.
- Fișiere: `src/components/Header.jsx`, nou: `src/hooks/useOnClickOutside.js`, `src/hooks/useLockBodyScroll.js`, `src/components/ui/Drawer.jsx`
- Risc / Efort: Mic–Mediu / 1–2h
- Pași sugerați: Implementare hook-urilor, refactor Header pentru a utiliza noile hook-uri. Asigură accesibilitate (aria, focus trap) la Drawer.
- Validare: Manuall test of open/close, ESC, click outside, body scroll.

6) Consolidare componente UI în `src/components/ui/` (Button, Modal, Drawer, Container)
- Descriere: Există primitive, dar multe markup-uri se repetă. Centralizarea reduce duplicare și ajută la teming.
- Fișiere: `src/components/ui/*`, multiple componente consumatoare
- Risc / Efort: Mediu / 2–6h
- Pași sugerați: Adaugă `Button.jsx`, `Modal.jsx`, `Drawer.jsx`, `index.js` exports; migrate 2–3 consumatoare la noile primitive.
- Validare: UI identic, mai puține clase duplicate.

7) Uniformizează pattern-ul de lazy-loading/routing
- Descriere: `router.jsx` folosește `withSuspense(<DemoTeste />)` (transmite element), pattern inconsistent.
- Fișiere: `src/router.jsx`
- Risc / Efort: Mic / 1–2h
- Pași sugerați: Schimbă `withSuspense` să accepte componentă/lazy factory sau creează helper `lazyRoute(() => import(...))` care returnează element gata cu Suspense.
- Validare: Rute funcționează identic, cod mai ușor de citit.

---

## Prioritate: Lung-termin (îmbunătățiri arhitecturale)

8) Scaffold teste + pipeline CI
- Descriere: Lipsesc teste și CI. Adaugă `vitest` + `@testing-library/react` și un workflow GitHub Actions minimal.
- Efort: Mediu / 4–8h
- Validare: Rulare `npm test` local și `actions` trec.

9) Migrare graduală la TypeScript
- Descriere: Beneficii de siguranță pe imports și API interne.
- Efort: Mare / săptămâni (incremental)
- Pași sugerați: Configurează `tsconfig` cu `allowJs`, migrează `src/hooks` și `src/components/ui` primele.

10) Îmbunătățiri de accesibilitate (focus trap, aria, keyboard nav)
- Descriere: Drawer nu are focus trap; butoanele aria pot fi îmbunătățite.
- Efort: Mic–Mediu / 2–4h
- Pași sugerați: Adaugă `focus-trap-react` sau implementare nativă, ruleaza `axe` tests.

---

## Quick wins (5–30m)
- Adaugă `src/components/ui/index.js` cu exporturi centrale.
- Adaugă `npm run lint` + ESLint config minimal (prinde import/case issues).
- Normalizează importuri de imagini folosind `new URL('/assets/..', import.meta.url).href` sau import static pentru Vite.

---

## Prioritizare recomandată (ce să facem primul)
1. #1 Bootstrapping & Toast fix (critică) — previne componente invisibile la runtime
2. #2 Chart.js dynamic import (evită amestec CDN / npm)
3. Quick wins: fix case-sensitive filenames, central exports `ui/index`
4. #4 Centralizare rute / #5 extract hooks pentru Header
5. Teste + CI

---

## Next steps / Cum procedez eu
- Spune-mi ce item(e) să aplic automat. Pot aplica patch-uri incremental și apoi rula `npm run dev` pentru a valida.
- Sugestie inițială: permit-mi să aplic #1 și #2 și voi rula dev pentru verificare.

Dacă vrei, pot începe acum cu patch-urile pentru primele două. Vrei să continui?

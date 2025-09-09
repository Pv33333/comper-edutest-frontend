// src/pages/profesor/AdeverintaProfesor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * ✔ Nu afișează numele/calea vreunui fișier
 * ✔ Afișează o adeverință DEMO (A4) randată în pagină
 * ✔ Butoane premium: Print, Export PNG, Copiere conținut
 * ✔ Păstrăm gradientul + butonul „Înapoi la Dashboard”
 * ✔ Fără dependențe externe
 */

function Chip({ tone = "indigo", children }) {
  const map = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export default function AdeverintaProfesor() {
  // câmpuri DEMO (poți lega ulterior de backend)
  const [profName, setProfName] = useState("Popescu Andreea");
  const [schoolName, setSchoolName] = useState(
    "Școala Gimnazială „Mihai Eminescu”"
  );
  const [serie, setSerie] = useState("AP-DEM-2025-001");
  const [functie, setFunctie] = useState("Profesor învățământ primar");
  const [interval, setIntervalStr] = useState("01 sept. 2024 – 31 aug. 2025");
  const [emitent, setEmitent] = useState("Director — Prof. dr. Ionescu Mircea");
  const [loc, setLoc] = useState("București");
  const [dataDoc, setDataDoc] = useState(() =>
    new Intl.DateTimeFormat("ro-RO", { dateStyle: "long" }).format(new Date())
  );

  const [toast, setToast] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const onCopyText = async () => {
    const text = `ADEVERINȚĂ
Se adeverește că ${profName}, angajat/ă al/a ${schoolName}, având funcția de ${functie},
și-a desfășurat activitatea în perioada ${interval}.
Document emis la ${loc}, la data de ${dataDoc}.
Emitent: ${emitent}
Serie: ${serie}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast({ type: "success", message: "Conținut copiat." });
    } catch {
      setToast({ type: "error", message: "Nu s-a putut copia." });
    }
  };

  const onPrint = () => {
    const node = pageRef.current;
    if (!node) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Adeverință</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a; }
            .a4 { width: 210mm; min-height: 297mm; }
          </style>
        </head>
        <body></body>
      </html>
    `);
    doc.close();
    doc.body.appendChild(node.cloneNode(true));

    // declanșăm print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {}
      setTimeout(() => document.body.removeChild(iframe), 800);
    }, 150);
  };

  const onExportPNG = async () => {
    // Export PNG printr-un SVG generat (rapid, fără librării)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#EEF2FF"/>
            <stop offset="100%" stop-color="#FFFFFF"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <rect x="60" y="60" width="1120" height="1634" rx="24" fill="#ffffff" stroke="#E5E7EB"/>
        <text x="120" y="170" font-size="36" font-family="Arial" fill="#1e1b4b" font-weight="700">ADEVERINȚĂ</text>
        <text x="120" y="230" font-size="20" font-family="Arial" fill="#334155">Serie: ${serie}</text>
        <text x="120" y="300" font-size="22" font-family="Arial" fill="#0f172a">Se adeverește că</text>
        <text x="120" y="340" font-size="28" font-family="Arial" fill="#0f172a" font-weight="700">${profName}</text>
        <text x="120" y="390" font-size="20" font-family="Arial" fill="#334155">angajat/ă al/a</text>
        <text x="120" y="420" font-size="22" font-family="Arial" fill="#0f172a">${schoolName}</text>
        <text x="120" y="470" font-size="20" font-family="Arial" fill="#334155">în funcția de</text>
        <text x="120" y="500" font-size="22" font-family="Arial" fill="#0f172a">${functie}</text>
        <text x="120" y="560" font-size="20" font-family="Arial" fill="#334155">și-a desfășurat activitatea în perioada</text>
        <text x="120" y="590" font-size="22" font-family="Arial" fill="#0f172a">${interval}</text>
        <text x="120" y="760" font-size="20" font-family="Arial" fill="#334155">Document emis la ${loc}, la data de ${dataDoc}.</text>
        <text x="120" y="820" font-size="20" font-family="Arial" fill="#0f172a">${emitent}</text>
        <text x="120" y="1300" font-size="16" font-family="Arial" fill="#64748b">* ADEVERINȚĂ DE PROBĂ — validă doar pentru testare UI *</text>
      </svg>
    `.trim();
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "adeverinta_demo.png";
    a.click();
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white text-blue-900 font-sans flex flex-col">
      {/* Accente decorative subtile */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200 blur-3xl" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl" />
      </div>

      {/* Înapoi la Dashboard */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex-1 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">
            Adeverință profesor (DEMO)
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Previzualizează și tipărește o adeverință de probă. Nu afișăm
            denumirea sau calea niciunui fișier.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Chip tone="emerald">Disponibil</Chip>
            <Chip tone="slate">Format: A4</Chip>
          </div>
        </div>

        {/* Acțiuni rapide */}
        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm">
              <div className="font-semibold text-indigo-900">
                Adeverință de probă
              </div>
              <div className="text-gray-600">
                Poți actualiza câmpurile înainte de imprimare / export.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700"
                title="Printează"
              >
                🖨 Print
              </button>
              <button
                type="button"
                onClick={onExportPNG}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
                title="Export ca imagine"
              >
                🖼 Export PNG
              </button>
              <button
                type="button"
                onClick={onCopyText}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
                title="Copiază conținutul textual"
              >
                🔗 Copiază text
              </button>
            </div>
          </div>
        </div>

        {/* Editor rapid (opțional) */}
        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-indigo-900">
            Date adeverință
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Nume profesor</label>
              <input
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Numele complet"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Unitate de învățământ
              </label>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Școala / Liceul"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Funcția</label>
              <input
                value={functie}
                onChange={(e) => setFunctie(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: Profesor învățământ primar"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Perioada</label>
              <input
                value={interval}
                onChange={(e) => setIntervalStr(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: 01 sept. 2024 – 31 aug. 2025"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Emitent</label>
              <input
                value={emitent}
                onChange={(e) => setEmitent(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: Director — Prof. dr. ..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Loc emitere</label>
              <input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: București"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Data documentului</label>
              <input
                value={dataDoc}
                onChange={(e) => setDataDoc(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: 8 septembrie 2025"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Serie</label>
              <input
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: AP-DEM-2025-001"
              />
            </div>
          </div>
        </div>

        {/* Previzualizare A4 (randare nativă) */}
        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-4 shadow-xl">
          <h2 className="text-lg font-semibold text-indigo-900 mb-3">
            Previzualizare
          </h2>

          <div
            ref={pageRef}
            className="a4 mx-auto bg-white shadow-xl rounded-2xl overflow-hidden"
            style={{
              width: "210mm",
              minHeight: "297mm",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* header decorativ */}
            <div className="h-24 bg-gradient-to-r from-indigo-100 to-white flex items-center px-10">
              <div>
                <div className="text-xs text-slate-500">Serie</div>
                <div className="text-sm font-semibold text-indigo-900">
                  {serie}
                </div>
              </div>
            </div>

            <div className="px-12 py-10">
              <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
                ADEVERINȚĂ
              </h1>

              <p className="mt-6 text-sm text-slate-700 leading-6">
                Se adeverește că{" "}
                <span className="font-semibold text-slate-900">{profName}</span>
                , angajat/ă al/a{" "}
                <span className="font-semibold text-slate-900">
                  {schoolName}
                </span>
                , având funcția de{" "}
                <span className="font-semibold text-slate-900">{functie}</span>,
                și-a desfășurat activitatea în perioada{" "}
                <span className="font-semibold text-slate-900">{interval}</span>
                .
              </p>

              <p className="mt-4 text-sm text-slate-700 leading-6">
                Document emis la <span className="font-medium">{loc}</span>, la
                data de <span className="font-medium">{dataDoc}</span>.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Emitent</div>
                <div className="font-medium text-slate-900">{emitent}</div>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-10">
                <div className="text-sm">
                  <div className="text-xs text-slate-500">Semnătură</div>
                  <div className="mt-10 h-[2px] bg-slate-200 w-48" />
                </div>
                <div className="text-sm">
                  <div className="text-xs text-slate-500">Ștampilă</div>
                  <div className="mt-6 h-24 w-24 border-2 border-dashed border-slate-300 rounded-full" />
                </div>
              </div>

              <div className="mt-16 text-[11px] text-slate-500">
                * ADEVERINȚĂ DE PROBĂ — valabilă doar pentru testare UI. *
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={
              "fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow " +
              (toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-blue-100 text-blue-800 border-blue-200")
            }
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}

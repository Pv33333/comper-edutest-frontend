// src/pages/elev/TesteComperElev.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

/* ───────── Config ───────── */
const CLASE = {
  Primar: [
    "Clasa Pregătitoare",
    "Clasa I",
    "Clasa a II-a",
    "Clasa a III-a",
    "Clasa a IV-a",
  ],
  Gimnazial: ["Clasa a V-a", "Clasa a VI-a", "Clasa a VII-a", "Clasa a VIII-a"],
};
const MATERII = ["Română", "Matematică"];
const ETAPE = [
  { key: "etapa1", label: "Etapa I" },
  { key: "etapa2", label: "Etapa a II-a" },
  { key: "etapa_nationala", label: "Etapa Națională" },
];

/* ───────── Helpers ───────── */
const safeTitle = (t, fallback = "Test Comper") =>
  (t && String(t).trim()) || fallback;

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ro-RO", { dateStyle: "medium" });
  } catch {
    return d;
  }
};

/* ───────── Actions ───────── */
const StartActions = ({ disabled, onStart }) => (
  <div className="flex items-center gap-2 mt-2">
    <button
      disabled={disabled}
      onClick={onStart}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold border transition",
        disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
      ].join(" ")}
      title={disabled ? "Nu există test" : "Începe testul"}
    >
      Începe testul
    </button>
  </div>
);

/* ───────── Pagina ───────── */
export default function TesteComperElev() {
  const navigate = useNavigate();

  // acordeon: materie+ciclu și clasă
  const [openSection, setOpenSection] = useState({});
  const [openClass, setOpenClass] = useState({});
  const [openStage, setOpenStage] = useState({}); // per etapă

  // cache + loading per (materie|ciclu|clasa|etapa)
  const [cacheComper, setCacheComper] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);

  // Catalog
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catMaterie, setCatMaterie] = useState("Română");
  const [catNivel, setCatNivel] = useState("Primar");
  const [catClasa, setCatClasa] = useState(CLASE["Primar"][0]);
  const [catEtapa, setCatEtapa] = useState(ETAPE[0].key);
  const [catSearch, setCatSearch] = useState("");
  const [catTests, setCatTests] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const searchRef = useRef(null);

  const toggleSection = (key) =>
    setOpenSection((s) => ({ ...s, [key]: !s[key] }));

  const toggleClass = (key) => setOpenClass((s) => ({ ...s, [key]: !s[key] }));

  const toggleStage = (key) => setOpenStage((s) => ({ ...s, [key]: !s[key] }));

  const fetchComperStage = useCallback(
    async (materie, ciclu, clasa, stageKey) => {
      const k = `${materie}|${ciclu}|${clasa}|${stageKey}`;
      if (cacheComper[k] !== undefined) return cacheComper[k];
      setLoadingKey(k);
      try {
        const { data, error } = await supabase
          .from("tests_comper")
          .select(
            "id, title, subject, cycle, class_name, stage, published, created_at"
          )
          .eq("published", true)
          .eq("subject", materie)
          .eq("cycle", ciclu)
          .eq("class_name", clasa)
          .eq("stage", stageKey)
          .order("created_at", { ascending: false });
        const val = error ? [] : data || [];
        setCacheComper((m) => ({ ...m, [k]: val }));
        return val;
      } finally {
        setLoadingKey(null);
      }
    },
    [cacheComper]
  );

  const loadCatalog = useCallback(async () => {
    setCatLoading(true);
    try {
      const { data, error } = await supabase
        .from("tests_comper")
        .select(
          "id, title, subject, cycle, class_name, stage, created_at, published"
        )
        .eq("published", true)
        .eq("subject", catMaterie)
        .eq("cycle", catNivel)
        .eq("class_name", catClasa)
        .eq("stage", catEtapa)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCatTests(Array.isArray(data) ? data : []);
    } finally {
      setCatLoading(false);
    }
  }, [catMaterie, catNivel, catClasa, catEtapa]);

  useEffect(() => {
    if (catalogOpen) {
      loadCatalog();
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [catalogOpen, loadCatalog]);

  const onStart = (testId) => {
    if (!testId) return;
    navigate(`/elev/teste-comper/start/${encodeURIComponent(testId)}`);
  };

  /* ───────── UI ───────── */
  const renderClasaSection = (materie, nivel) => {
    const colorTone =
      materie === "Română"
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-green-600 hover:bg-green-700";
    const secKey = `${materie}_${nivel}`;

    return (
      <div
        className="bg-white shadow-xl rounded-2xl border-t-4 p-6 w-full"
        style={{ borderTopColor: materie === "Română" ? "#3b82f6" : "#10b981" }}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            className={`${colorTone} text-white px-4 py-2 rounded-xl font-medium shadow`}
            onClick={() => toggleSection(secKey)}
          >
            {materie} • Ciclul {nivel}
          </button>
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              setCatMaterie(materie);
              setCatNivel(nivel);
              setCatClasa(CLASE[nivel][0]);
              setCatEtapa(ETAPE[0].key);
              setCatalogOpen(true);
            }}
          >
            + Catalog
          </button>
        </div>

        {openSection[secKey] && (
          <div className="flex flex-col items-center mt-4 gap-4 w-full">
            {CLASE[nivel].map((clasa) => {
              const clsKey = `${materie}_${nivel}_${clasa}`;
              return (
                <div key={clsKey} className="w-full">
                  {/* Clasă (toggle) */}
                  <button
                    className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition mb-2"
                    onClick={() => toggleClass(clsKey)}
                  >
                    {clasa}
                  </button>

                  {/* Etape */}
                  {openClass[clsKey] && (
                    <div className="pl-4">
                      {ETAPE.map((st) => {
                        const cacheKey = `${materie}|${nivel}|${clasa}|${st.key}`;
                        const rows = cacheComper[cacheKey];
                        const isLoading =
                          loadingKey === cacheKey && rows === undefined;

                        return (
                          <div key={cacheKey} className="mb-4">
                            {/* Buton Etapă */}
                            <button
                              className="w-full text-left bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm rounded-xl px-4 py-2 font-medium text-sm transition mb-2"
                              onClick={async () => {
                                toggleStage(cacheKey);
                                await fetchComperStage(
                                  materie,
                                  nivel,
                                  clasa,
                                  st.key
                                );
                              }}
                            >
                              {st.label}
                            </button>

                            {/* Lista testelor sub Etapă */}
                            {openStage[cacheKey] && (
                              <div className="pl-3">
                                {isLoading && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Se încarcă testele pentru {st.label}...
                                  </div>
                                )}
                                {rows !== undefined && (
                                  <div className="space-y-2">
                                    {rows.length === 0 ? (
                                      <div className="text-xs text-red-600 mt-1">
                                        Nu există test publicat pentru{" "}
                                        {st.label}.
                                      </div>
                                    ) : (
                                      rows.map((row) => (
                                        <div
                                          key={row.id}
                                          className="border rounded-xl p-3 bg-white shadow-sm"
                                        >
                                          <div className="font-semibold text-sm">
                                            {safeTitle(row.title, "Test")}
                                          </div>
                                          <div className="text-xs opacity-70">
                                            {row.subject} • {row.class_name} •{" "}
                                            {st.label}
                                            {row.created_at
                                              ? ` • ${fmtDate(row.created_at)}`
                                              : ""}
                                          </div>
                                          <StartActions
                                            disabled={!row}
                                            onStart={() => onStart(row?.id)}
                                          />
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full text-gray-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
      {/* Înapoi */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/elev/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <main className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-purple-800">
            📝 Teste Comper
          </h1>
        </div>

        <section className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {renderClasaSection("Română", "Primar")}
            {renderClasaSection("Matematică", "Primar")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8">
            {renderClasaSection("Română", "Gimnazial")}
            {renderClasaSection("Matematică", "Gimnazial")}
          </div>
        </section>
      </main>

      {/* FAB Catalog global */}
      <button
        onClick={() => {
          setCatMaterie("Română");
          setCatNivel("Primar");
          setCatClasa(CLASE["Primar"][0]);
          setCatEtapa(ETAPE[0].key);
          setCatalogOpen(true);
        }}
        className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 text-sm font-semibold"
      >
        + Catalog teste
      </button>

      {/* Drawer Catalog (Comper) */}
      {catalogOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setCatalogOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-indigo-900">
                Catalog teste disponibile
              </h3>
              <button
                onClick={() => setCatalogOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Închide ✕
              </button>
            </div>

            <div className="p-4 border-b grid grid-cols-2 gap-2">
              <select
                value={catMaterie}
                onChange={(e) => setCatMaterie(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {MATERII.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <select
                value={catNivel}
                onChange={(e) => {
                  const next = e.target.value;
                  setCatNivel(next);
                  setCatClasa(CLASE[next][0]);
                }}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {Object.keys(CLASE).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>

              <select
                value={catClasa}
                onChange={(e) => setCatClasa(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm col-span-2"
              >
                {CLASE[catNivel].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                value={catEtapa}
                onChange={(e) => setCatEtapa(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm col-span-2"
              >
                {ETAPE.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
              </select>

              <input
                ref={searchRef}
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Caută în catalog…"
                className="rounded-xl border px-3 py-2 text-sm col-span-2"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {catLoading ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  Se încarcă testele…
                </div>
              ) : (
                catTests
                  .filter((t) =>
                    [t.title, t.class_name, t.subject, t.stage]
                      .filter(Boolean)
                      .join(" ")
                      .toLowerCase()
                      .includes(catSearch.trim().toLowerCase())
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border bg-white p-4 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold">
                          {safeTitle(t.title, "Test Comper")}
                        </div>
                        <div className="text-xs opacity-80">
                          {t.subject} • {t.cycle} • {t.class_name} •{" "}
                          {ETAPE.find((e) => e.key === t.stage)?.label ||
                            t.stage}
                          {t.created_at ? ` • ${fmtDate(t.created_at)}` : ""}
                        </div>
                      </div>
                      <button
                        className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                        onClick={() => onStart(encodeURIComponent(t.id))}
                        title="Începe testul"
                      >
                        Începe
                      </button>
                    </div>
                  ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

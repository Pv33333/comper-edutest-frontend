import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
const TestActions = ({ disabled, onStart, onSend }) => (
  <div className="flex flex-wrap items-center gap-2 mt-2">
    <button
      disabled={disabled}
      onClick={onStart}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold border transition",
        disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
      ].join(" ")}
    >
      Începe testul
    </button>
    <button
      disabled={disabled}
      onClick={onSend}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold border transition",
        disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : "bg-gray-100 hover:bg-gray-200 text-emerald-800 border-emerald-700",
      ].join(" ")}
    >
      📤 Trimite elevului
    </button>
  </div>
);

/* ───────── Pagina ───────── */
export default function TesteComperProfesor() {
  const navigate = useNavigate();

  // state pentru acordeoane clase și etape
  const [openClass, setOpenClass] = useState({});
  const [openStage, setOpenStage] = useState({});
  const [cacheComper, setCacheComper] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);

  // state pentru Catalog
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catMaterie, setCatMaterie] = useState("Română");
  const [catNivel, setCatNivel] = useState("Primar");
  const [catClasa, setCatClasa] = useState(CLASE["Primar"][0]);
  const [catSearch, setCatSearch] = useState("");
  const [catTests, setCatTests] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const searchRef = useRef(null);

  const toggleClass = (clasaKey) => {
    setOpenClass((prev) => ({ ...prev, [clasaKey]: !prev[clasaKey] }));
  };

  const toggleStage = (stageKey) => {
    setOpenStage((prev) => ({ ...prev, [stageKey]: !prev[stageKey] }));
  };

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
        .from("tests")
        .select("id, description, subject, school_class, exam_date")
        .eq("subject", catMaterie)
        .eq("school_class", catClasa)
        .order("exam_date", { ascending: false })
        .order("id", { ascending: false });
      if (error) throw error;
      setCatTests(Array.isArray(data) ? data : []);
    } finally {
      setCatLoading(false);
    }
  }, [catMaterie, catClasa]);

  useEffect(() => {
    if (catalogOpen) {
      loadCatalog();
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [catalogOpen, loadCatalog]);

  const onStartStage = (testId) => {
    if (!testId) return;
    navigate(`/profesor/teste-comper/start/${encodeURIComponent(testId)}`);
  };

  const onSendStage = (row, materie, ciclu, clasa, stageKey) => {
    if (!row?.id) return;
    const payload = {
      id: row.id,
      source: "comper",
      subject: materie === "Română" ? "romana" : "mate",
      cycle: ciclu.toLowerCase(),
      className: clasa,
      stage: stageKey,
      title: safeTitle(row.title, `Test ${materie} – ${clasa} – ${stageKey}`),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("selected_test", JSON.stringify(payload));
    } catch {}
    navigate(`/profesor/elevi?testId=${encodeURIComponent(row.id)}`);
  };

  /* ───────── UI ───────── */
  const renderClasaSection = (materie, nivel) => {
    const colorTone =
      materie === "Română"
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-green-600 hover:bg-green-700";

    return (
      <div
        className="bg-white shadow-xl rounded-2xl border-t-4 p-6 w-full"
        style={{ borderTopColor: materie === "Română" ? "#3b82f6" : "#10b981" }}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            className={`${colorTone} text-white px-4 py-2 rounded-xl font-medium shadow`}
            onClick={() => toggleClass(`${materie}_${nivel}`)}
          >
            {materie} • Ciclul {nivel}
          </button>
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              setCatMaterie(materie);
              setCatNivel(nivel);
              setCatClasa(CLASE[nivel][0]);
              setCatalogOpen(true);
            }}
          >
            + Catalog
          </button>
        </div>

        {openClass[`${materie}_${nivel}`] && (
          <div className="flex flex-col items-center mt-4 gap-4 w-full">
            {CLASE[nivel].map((clasa) => (
              <div key={`${materie}_${nivel}_${clasa}`} className="w-full">
                <button
                  className="w-full text-left bg-white border border-blue-200 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm mb-2"
                  onClick={() => toggleClass(`${materie}_${nivel}_${clasa}`)}
                >
                  {clasa}
                </button>

                {openClass[`${materie}_${nivel}_${clasa}`] && (
                  <div className="pl-4">
                    {ETAPE.map((st) => {
                      const k = `${materie}|${nivel}|${clasa}|${st.key}`;
                      const rows = cacheComper[k];
                      const isLoading = loadingKey === k && rows === undefined;

                      return (
                        <div key={k} className="mb-4">
                          {/* Buton Etapă */}
                          <button
                            className="w-full text-left bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm rounded-xl px-4 py-2 font-medium text-sm transition mb-2"
                            onClick={() => {
                              toggleStage(k);
                              fetchComperStage(materie, nivel, clasa, st.key);
                            }}
                          >
                            {st.label}
                          </button>

                          {/* Teste sub Etapă */}
                          {openStage[k] && (
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
                                      Nu există test publicat pentru {st.label}.
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
                                        <TestActions
                                          disabled={!row}
                                          onStart={() => onStartStage(row?.id)}
                                          onSend={() =>
                                            onSendStage(
                                              row,
                                              materie,
                                              nivel,
                                              clasa,
                                              st.key
                                            )
                                          }
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
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full text-gray-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
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
          setCatalogOpen(true);
        }}
        className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 text-sm font-semibold"
      >
        + Catalog teste
      </button>

      {/* Drawer Catalog */}
      {catalogOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setCatalogOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-indigo-900">
                Catalog teste
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
                    [t.description, t.school_class, t.subject]
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
                          {safeTitle(t.description, "Test")}
                        </div>
                        <div className="text-xs opacity-80">
                          {t.subject} • {t.school_class}{" "}
                          {t.exam_date ? `• ${fmtDate(t.exam_date)}` : ""}
                        </div>
                      </div>
                      <button
                        className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                        onClick={() => setCatalogOpen(false)}
                      >
                        Selectează
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

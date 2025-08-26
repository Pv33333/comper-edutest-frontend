import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function DemoTeste() {
  // Română panels
  const [romanaPrimarOpen, setRomanaPrimarOpen] = useState(false);
  const [romanaGimnazialOpen, setRomanaGimnazialOpen] = useState(false);
  const [romanaClasa4Open, setRomanaClasa4Open] = useState(false);

  // Matematică panels
  const [matePrimarOpen, setMatePrimarOpen] = useState(false);
  const [mateGimnazialOpen, setMateGimnazialOpen] = useState(false);
  const [mateClasa4Open, setMateClasa4Open] = useState(false);

  // Date din Supabase (doar pentru Clasa a IV-a, ca în designul tău)
  const [romanaIV, setRomanaIV] = useState({
    rows: [],
    loading: false,
    err: "",
  });
  const [mateIV, setMateIV] = useState({ rows: [], loading: false, err: "" });

  const toggleRomana = (panel) => {
    if (panel === "primar") {
      setRomanaPrimarOpen((v) => !v);
      setRomanaGimnazialOpen(false);
    } else {
      setRomanaGimnazialOpen((v) => !v);
      setRomanaPrimarOpen(false);
    }
  };

  const toggleMate = (panel) => {
    if (panel === "primar") {
      setMatePrimarOpen((v) => !v);
      setMateGimnazialOpen(false);
    } else {
      setMateGimnazialOpen((v) => !v);
      setMatePrimarOpen(false);
    }
  };

  // --- Fetch helpers (filtrăm strict după subject/grade și published) ---
  const fetchRomanaIV = useCallback(async () => {
    setRomanaIV((s) => ({ ...s, loading: true, err: "" }));
    const { data, error } = await supabase
      .from("tests")
      .select("id, title, link, published")
      .eq("subject", "Română")
      .eq("grade", "IV")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) setRomanaIV({ rows: [], loading: false, err: error.message });
    else setRomanaIV({ rows: data || [], loading: false, err: "" });
  }, []);

  const fetchMateIV = useCallback(async () => {
    setMateIV((s) => ({ ...s, loading: true, err: "" }));
    const { data, error } = await supabase
      .from("tests")
      .select("id, title, link, published")
      .eq("subject", "Matematică")
      .eq("grade", "IV")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) setMateIV({ rows: [], loading: false, err: error.message });
    else setMateIV({ rows: data || [], loading: false, err: "" });
  }, []);

  // Când deschizi “Clasa a IV-a” prima dată, încărcăm din DB
  useEffect(() => {
    if (romanaClasa4Open && romanaIV.rows.length === 0 && !romanaIV.loading) {
      fetchRomanaIV();
    }
  }, [romanaClasa4Open, romanaIV.rows.length, romanaIV.loading, fetchRomanaIV]);

  useEffect(() => {
    if (mateClasa4Open && mateIV.rows.length === 0 && !mateIV.loading) {
      fetchMateIV();
    }
  }, [mateClasa4Open, mateIV.rows.length, mateIV.loading, fetchMateIV]);

  // Realtime: dacă se schimbă ceva în tests, refacem fetch DOAR dacă panelul e deschis
  useEffect(() => {
    const channel = supabase
      .channel("realtime:tests:demo")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tests" },
        () => {
          if (romanaClasa4Open) fetchRomanaIV();
          if (mateClasa4Open) fetchMateIV();
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [romanaClasa4Open, mateClasa4Open, fetchRomanaIV, fetchMateIV]);

  return (
    <div className="-50 text-gray-800 min-h-screen">
      {/* Back link */}
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Înapoi la Pagina Principală
        </Link>
      </section>

      <main className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">
          🧪 Demo Teste
        </h1>

        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Română */}
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-blue-500 p-6 w-full max-w-md text-center mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                📘 Română
              </h2>

              <div className="flex flex-col items-center gap-4">
                {/* Ciclul Primar */}
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full"
                  onClick={() => toggleRomana("primar")}
                >
                  Ciclul Primar
                </button>

                {romanaPrimarOpen && (
                  <div className="flex flex-col items-center mt-4 gap-4 w-full">
                    {[
                      "Clasa Pregătitoare",
                      "Clasa I",
                      "Clasa a II-a",
                      "Clasa a III-a",
                    ].map((label) => (
                      <button key={label} className="btn-cls">
                        {label}
                      </button>
                    ))}

                    {/* Clasa a IV-a */}
                    <button
                      className="btn-cls"
                      onClick={() => setRomanaClasa4Open((v) => !v)}
                    >
                      Clasa a IV-a
                    </button>

                    {romanaClasa4Open && (
                      <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-4 text-left">
                        {/* stări: încărcare / eroare / listă */}
                        {romanaIV.loading && (
                          <div className="text-gray-600">Se încarcă…</div>
                        )}
                        {!!romanaIV.err && (
                          <div className="text-red-600">
                            Eroare: {romanaIV.err}
                          </div>
                        )}

                        {!romanaIV.loading &&
                          !romanaIV.err &&
                          romanaIV.rows.length === 0 && (
                            <div className="text-gray-600">
                              Nu există teste publicate pentru Română · Clasa a
                              IV‑a.
                            </div>
                          )}

                        {romanaIV.rows.map((row) => (
                          <Link
                            key={row.id}
                            to={row.link || "#"}
                            className="block text-left w-full bg-white border border-purple-300 hover:border-purple-500 rounded-xl px-4 py-2 text-purple-800 font-semibold shadow-sm hover:shadow-md transition"
                          >
                            {row.title || "Începe testul la Română"}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ciclul Gimnazial */}
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full"
                  onClick={() => toggleRomana("gimnazial")}
                >
                  Ciclul Gimnazial
                </button>
                {romanaGimnazialOpen && (
                  <div className="flex flex-col items-center mt-4 gap-4 w-full">
                    {[
                      "Clasa a V-a",
                      "Clasa a VI-a",
                      "Clasa a VII-a",
                      "Clasa a VIII-a",
                    ].map((label) => (
                      <button key={label} className="btn-cls">
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Matematică */}
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-green-500 p-6 w-full max-w-md text-center mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                📐 Matematică
              </h2>

              <div className="flex flex-col items-center gap-4">
                {/* Ciclul Primar */}
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full"
                  onClick={() => toggleMate("primar")}
                >
                  Ciclul Primar
                </button>

                {matePrimarOpen && (
                  <div className="flex flex-col items-center mt-4 gap-4 w-full">
                    {[
                      "Clasa Pregătitoare",
                      "Clasa I",
                      "Clasa a II-a",
                      "Clasa a III-a",
                    ].map((label) => (
                      <button key={label} className="btn-cls">
                        {label}
                      </button>
                    ))}

                    {/* Clasa a IV-a */}
                    <button
                      className="btn-cls"
                      onClick={() => setMateClasa4Open((v) => !v)}
                    >
                      Clasa a IV-a
                    </button>

                    {mateClasa4Open && (
                      <div className="w-full bg-green-50 border border-green-200 p-4 rounded-xl space-y-4 text-left">
                        {mateIV.loading && (
                          <div className="text-gray-600">Se încarcă…</div>
                        )}
                        {!!mateIV.err && (
                          <div className="text-red-600">
                            Eroare: {mateIV.err}
                          </div>
                        )}

                        {!mateIV.loading &&
                          !mateIV.err &&
                          mateIV.rows.length === 0 && (
                            <div className="text-gray-600">
                              Nu există teste publicate pentru Matematică ·
                              Clasa a IV‑a.
                            </div>
                          )}

                        {mateIV.rows.map((row) => (
                          <Link
                            key={row.id}
                            to={row.link || "#"}
                            className="block text-left w-full bg-white border border-green-300 hover:border-green-500 rounded-xl px-4 py-2 text-green-800 font-semibold shadow-sm hover:shadow-md transition"
                          >
                            {row.title || "Începe testul la Matematică"}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ciclul Gimnazial */}
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full"
                  onClick={() => toggleMate("gimnazial")}
                >
                  Ciclul Gimnazial
                </button>
                {mateGimnazialOpen && (
                  <div className="flex flex-col items-center mt-4 gap-4 w-full">
                    {[
                      "Clasa a V-a",
                      "Clasa a VI-a",
                      "Clasa a VII-a",
                      "Clasa a VIII-a",
                    ].map((label) => (
                      <button key={label} className="btn-cls">
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .btn-cls {
          width: 100%;
          text-align: left;
          background: white;
          border: 1px solid #bfdbfe;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          color: #1f2937;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .btn-cls:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

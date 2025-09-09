// src/pages/profesor/RapoarteTestare.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

// ---------- Utils ----------
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

// Robust score computation from various shapes
function computeScoreFromAnswers(answers) {
  if (!Array.isArray(answers) || !answers.length) return { score: 0, total: 0 };
  let total = 0;
  let score = 0;
  for (const q of answers) {
    const userAns = (q?.elev ?? q?.answer ?? q?.user ?? q?.choice ?? "")
      .toString()
      .trim()
      .toLowerCase();
    const correct = (q?.corect ?? q?.correct ?? q?.key ?? q?.corecta ?? "")
      .toString()
      .trim()
      .toLowerCase();
    if (correct) {
      total += 1;
      if (userAns === correct) score += 1;
    }
  }
  // if "correct" keys missing, fallback to length
  if (total === 0) total = answers.length;
  return { score, total };
}

// Feedback banding
function feedbackFromPercent(p) {
  if (p >= 90)
    return {
      label: "🏆 Excepțional",
      tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  if (p >= 80)
    return {
      label: "🎉 Excelent",
      tone: "bg-green-100 text-green-800 border-green-200",
    };
  if (p >= 70)
    return {
      label: "👍 Bun",
      tone: "bg-lime-100 text-lime-800 border-lime-200",
    };
  if (p >= 60)
    return {
      label: "🙂 Satisfăcător",
      tone: "bg-yellow-100 text-yellow-900 border-yellow-300",
    };
  if (p >= 40)
    return {
      label: "🧭 În progres",
      tone: "bg-orange-100 text-orange-900 border-orange-300",
    };
  return {
    label: "⚠️ Necesită lucru",
    tone: "bg-red-100 text-red-800 border-red-200",
  };
}

// ---------- Component ----------
export default function RapoarteTestare() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // UI state
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("toate");
  const [grade, setGrade] = useState("toate");
  const [minPct, setMinPct] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("submitted_at_desc"); // submitted_at_desc | procent_desc | durata_asc
  const [page, setPage] = useState(1);
  const perPage = 20;

  const debouncedQ = useDebounced(q, 250);
  const navigate = useNavigate();

  // Load data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const { data, error } = await supabase
          .from("results_enriched")
          .select(
            "id, test_id, student_id, score, duration_sec, submitted_at, answers, student_name, student_email, test_title, test_subject, school_class"
          )
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        const normalized = (data || []).map((r) => {
          const { score: computed, total } = computeScoreFromAnswers(r.answers);
          // If server score exists and total is 0 (unknown), treat score as percent if in 0..100
          let procent;
          let scor;
          let totalQs = total;

          if (total > 0) {
            scor = computed;
            procent = Math.round((computed / total) * 100);
          } else if (typeof r.score === "number") {
            // If score is 0..1 treat as ratio, else percent
            if (r.score > 0 && r.score <= 1) {
              procent = Math.round(r.score * 100);
            } else {
              procent = clamp(Math.round(r.score), 0, 100);
            }
            scor = null;
            totalQs = null;
          } else {
            procent = 0;
            scor = 0;
            totalQs = 0;
          }

          return {
            id: r.id,
            submitted_at: r.submitted_at,
            elevNume: r.student_name || r.student_id,
            elevEmail: r.student_email || "—",
            testTitle: r.test_title || "—",
            subject: r.test_subject || "—",
            grade_level: r.school_class || "—",
            data: fmtDateTime(r.submitted_at),
            scor,
            total: totalQs,
            procent,
            durata: Number(r.duration_sec || 0),
            raw: r,
          };
        });

        if (!cancelled) setRows(normalized);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setErr(e?.message || "Eroare la încărcarea rapoartelor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Facets
  const allSubjects = useMemo(() => {
    const s = new Set(rows.map((r) => r.subject).filter(Boolean));
    return ["toate", ...Array.from(s).sort()];
  }, [rows]);

  const allGrades = useMemo(() => {
    const s = new Set(rows.map((r) => r.grade_level).filter(Boolean));
    return ["toate", ...Array.from(s).sort()];
  }, [rows]);

  // Filtering
  const filtered = useMemo(() => {
    let X = rows;

    if (debouncedQ.trim()) {
      const qq = debouncedQ.toLowerCase();
      X = X.filter(
        (r) =>
          (r.elevNume || "").toLowerCase().includes(qq) ||
          (r.elevEmail || "").toLowerCase().includes(qq) ||
          (r.testTitle || "").toLowerCase().includes(qq) ||
          (r.subject || "").toLowerCase().includes(qq) ||
          (r.grade_level || "").toLowerCase().includes(qq)
      );
    }

    if (subject !== "toate") {
      X = X.filter((r) => r.subject === subject);
    }
    if (grade !== "toate") {
      X = X.filter((r) => r.grade_level === grade);
    }
    if (minPct > 0) {
      X = X.filter((r) => r.procent >= minPct);
    }
    if (dateFrom) {
      const t0 = new Date(dateFrom).getTime();
      X = X.filter((r) => new Date(r.submitted_at).getTime() >= t0);
    }
    if (dateTo) {
      const t1 = new Date(dateTo).getTime();
      X = X.filter((r) => new Date(r.submitted_at).getTime() <= t1);
    }

    // Sorting
    X = [...X];
    if (sortKey === "submitted_at_desc") {
      X.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    } else if (sortKey === "procent_desc") {
      X.sort((a, b) => b.procent - a.procent);
    } else if (sortKey === "durata_asc") {
      X.sort((a, b) => a.durata - b.durata);
    }

    return X;
  }, [rows, debouncedQ, subject, grade, minPct, dateFrom, dateTo, sortKey]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = clamp(page, 1, totalPages);
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);
  const pageRows = useMemo(
    () => filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage),
    [filtered, pageSafe]
  );

  // Navigate detailed report
  const veziRaport = (r) => {
    sessionStorage.setItem("raport_selectat_resultID", r.raw?.id || r.id || "");
    sessionStorage.setItem("raport_selectat_testID", r.raw?.test_id || "");
    sessionStorage.setItem("raport_selectat_elevID", r.raw?.student_id || "");
    navigate("/profesor/raport-detaliat");
  };

  // Export CSV
  const onExportCSV = () => {
    const head = [
      "#",
      "Elev",
      "Email",
      "Test",
      "Materie",
      "Clasă",
      "Data",
      "Procent",
      "Scor",
      "Durata(s)",
    ];
    const lines = [head.join(",")];
    filtered.forEach((r, i) => {
      lines.push(
        [
          i + 1,
          `"${(r.elevNume || "").replace(/"/g, '""')}"`,
          r.elevEmail || "",
          `"${(r.testTitle || "").replace(/"/g, '""')}"`,
          r.subject || "",
          r.grade_level || "",
          r.data || "",
          r.procent,
          r.total ? `${r.scor}/${r.total}` : "",
          r.durata,
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapoarte_testare.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen w-full text-gray-800 font-sans bg-gradient-to-b from-indigo-50 via-white to-white flex flex-col">
      {/* Înapoi la Dashboard */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900">
              📊 Rapoarte Testare
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Caută, filtrează și analizează rezultatele elevilor. Click pe
              „Vezi” pentru detaliu.
            </p>
          </div>

          {/* Toolbar */}
          <div className="rounded-2xl border border-blue-200 bg-white/90 shadow p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="col-span-2 md:col-span-1 lg:col-span-2">
                <label className="text-xs font-medium text-gray-600">
                  Căutare
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nume elev, email, test, materie, clasă"
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Materie */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Materie
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {allSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clasă */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Clasă
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {allGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Procent minim */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Procent minim: {minPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minPct}
                  onChange={(e) => setMinPct(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>

              {/* Sortare */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Sortare
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="submitted_at_desc">După dată (recente)</option>
                  <option value="procent_desc">
                    După procent (descrescător)
                  </option>
                  <option value="durata_asc">După durată (crescător)</option>
                </select>
              </div>
            </div>

            {/* Date range + Export */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  De la
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Până la
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setQ("");
                    setSubject("toate");
                    setGrade("toate");
                    setMinPct(0);
                    setDateFrom("");
                    setDateTo("");
                    setSortKey("submitted_at_desc");
                    setPage(1);
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-blue-50"
                >
                  Reset filtre
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={onExportCSV}
                  className="w-full rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700 shadow"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto shadow rounded-2xl bg-white border border-blue-200">
            <table className="min-w-full table-auto text-sm text-left border-collapse">
              <thead className="bg-blue-100 text-blue-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Elev</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Materie</th>
                  <th className="px-4 py-3">Clasă</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Scor</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3 text-center">Detalii</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500">
                      Se încarcă rapoartele…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500">
                      Niciun raport după filtrele curente.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r, i) => {
                    const fb = feedbackFromPercent(r.procent);
                    return (
                      <tr key={r.id} className="hover:bg-blue-50 transition">
                        <td className="px-4 py-3">
                          {(pageSafe - 1) * perPage + i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-900">
                          {r.elevNume}
                        </td>
                        <td className="px-4 py-3">{r.elevEmail}</td>
                        <td className="px-4 py-3">{r.testTitle}</td>
                        <td className="px-4 py-3">{r.subject}</td>
                        <td className="px-4 py-3">{r.grade_level}</td>
                        <td className="px-4 py-3">{r.data}</td>
                        <td className="px-4 py-3">
                          {r.total ? `${r.scor}/${r.total}` : `${r.procent}%`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg border text-xs font-semibold ${fb.tone}`}
                          >
                            {fb.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => veziRaport(r)}
                            className="text-blue-600 hover:underline"
                          >
                            Vezi
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-3 text-sm">
            <div className="text-gray-600">
              Rezultate: <b>{filtered.length}</b> • Pagina <b>{pageSafe}</b> din{" "}
              <b>{totalPages}</b>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
                disabled={pageSafe <= 1}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
              >
                ← Înapoi
              </button>
              <button
                onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
                disabled={pageSafe >= totalPages}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
              >
                Înainte →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

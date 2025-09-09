// src/pages/profesor/RaportDetaliat.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResultsAPI from "@/services/resultsService.js";
import { supabase } from "@/lib/supabaseClient";

/* ---------- Utils ---------- */
const useDebounced = (v, ms = 250) => {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setVal(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return val;
};
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};
const pickFirst = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
};

/* ---------- Component ---------- */
export default function RaportDetaliat() {
  // IDs venite din lista de rapoarte
  const testID = useMemo(
    () => sessionStorage.getItem("raport_selectat_testID") || "",
    []
  );
  const elevID = useMemo(
    () => sessionStorage.getItem("raport_selectat_elevID") || "",
    []
  );
  const resultID = useMemo(
    () => sessionStorage.getItem("raport_selectat_resultID") || "",
    []
  );

  // State
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [test, setTest] = useState(null); // {title, subject, grade_level, test_type, descriere}
  const [items, setItems] = useState([]); // [{index,text,topic,dificultate}]
  const [answerKey, setAnswerKey] = useState({}); // { idx: "a|b|c|..." }

  const [rezultat, setRezultat] = useState(null); // row din results / ResultsAPI
  const [profil, setProfil] = useState(null); // {full_name, email, submitted_at, duration_sec}

  // UI state (declare O DATĂ aici)
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const [filterCorrect, setFilterCorrect] = useState("toate"); // ← păstrăm această declarație
  const [topicFilter, setTopicFilter] = useState("toate");
  const [diffFilter, setDiffFilter] = useState("toate");
  const [sortKey, setSortKey] = useState("idx_asc");
  const [page, setPage] = useState(1);
  const perPage = 20;

  /* ---------- Data loader (view + completări din tests/profiles) ---------- */
  useEffect(() => {
    let cancelled = false;

    async function loadMetaUnified() {
      const { data, error } = await supabase
        .from("test_meta_unified")
        .select("*")
        .eq("test_id", testID)
        .maybeSingle();
      if (error || !data)
        throw error || new Error("Nu există în test_meta_unified.");
      setItems(Array.isArray(data.items) ? data.items : []);
      setAnswerKey(data.answer_key || {});
      return {
        title: data.title ?? null,
        subject: data.subject ?? null,
        grade_level: data.grade_level ?? null,
        test_type: data.test_type ?? null,
        descriere: data.descriere ?? null,
      };
    }

    async function loadTestsRowAndComplete(meta) {
      const { data: t } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testID)
        .maybeSingle();
      if (!t) return meta;
      return {
        title:
          meta.title ??
          pickFirst(t, [
            "title",
            "nume",
            "denumire",
            "titlu",
            "name",
            "denumire_test",
          ]),
        subject:
          meta.subject ??
          pickFirst(t, ["subject", "materie", "disciplina", "subject_name"]),
        grade_level:
          meta.grade_level ??
          pickFirst(t, [
            "school_class",
            "clasa",
            "grade_level",
            "grad",
            "year",
            "nivel",
          ]),
        test_type:
          meta.test_type ??
          pickFirst(t, ["test_type", "tip_test", "tip", "type"]),
        descriere:
          meta.descriere ??
          pickFirst(t, ["descriere", "description", "subtitlu", "subtitle"]),
      };
    }

    async function loadResultRow() {
      try {
        if (ResultsAPI?.getResultDetailed) {
          const res = await ResultsAPI.getResultDetailed({
            test_id: testID,
            student_id: elevID || undefined,
            result_id: resultID || undefined,
          });
          if (res) return res;
        }
      } catch {}
      if (resultID) {
        const { data } = await supabase
          .from("results")
          .select("*")
          .eq("id", resultID)
          .maybeSingle();
        return data || null;
      } else {
        let q = supabase
          .from("results")
          .select("*")
          .eq("test_id", testID)
          .order("submitted_at", { ascending: false });
        if (elevID) q = q.eq("student_id", elevID);
        const { data } = await q;
        return (data || [])[0] || null;
      }
    }

    async function completeStudentProfile(res) {
      if (!res)
        return {
          full_name: "—",
          email: "—",
          submitted_at: null,
          duration_sec: null,
        };
      const fnDirect = pickFirst(res, [
        "full_name",
        "student_name",
        "nume_elev",
        "display_name",
        "name",
        "first_name",
      ]);
      const lnDirect = pickFirst(res, ["last_name", "surname", "prenume"]);
      const fullDirect =
        fnDirect && lnDirect
          ? `${fnDirect} ${lnDirect}`
          : fnDirect || undefined;
      const emailDirect = pickFirst(res, [
        "email",
        "student_email",
        "user_email",
        "mail",
      ]);
      let student_id = pickFirst(res, [
        "student_id",
        "elev_id",
        "user_id",
        "uid",
        "owner_id",
      ]);
      if (!student_id && elevID) student_id = elevID;

      if (fullDirect && emailDirect) {
        return {
          full_name: fullDirect,
          email: emailDirect,
          submitted_at: res.submitted_at ?? null,
          duration_sec: res.duration_sec ?? null,
          student_id,
        };
      }
      const tryTables = ["profiles", "students", "users_public"];
      let profileRow = null;
      for (const table of tryTables) {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("id", student_id)
          .maybeSingle();
        if (data) {
          profileRow = data;
          break;
        }
      }
      const fnProfile = pickFirst(profileRow, [
        "full_name",
        "name",
        "display_name",
        "nume",
        "student_name",
        "first_name",
      ]);
      const lnProfile = pickFirst(profileRow, [
        "last_name",
        "surname",
        "prenume",
      ]);
      const emailProf = pickFirst(profileRow, ["email", "user_email", "mail"]);
      const fullName =
        fullDirect ||
        (fnProfile && lnProfile
          ? `${fnProfile} ${lnProfile}`
          : fnProfile || "—");
      const email = emailDirect || emailProf || "—";
      return {
        full_name: fullName || "—",
        email,
        submitted_at: res.submitted_at ?? null,
        duration_sec: res.duration_sec ?? null,
        student_id,
      };
    }

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const meta0 = await loadMetaUnified();
        if (cancelled) return;
        const meta = await loadTestsRowAndComplete(meta0);
        if (cancelled) return;
        setTest(meta);
        const res = await loadResultRow();
        if (cancelled) return;
        setRezultat(res);
        const prof = await completeStudentProfile(res);
        if (cancelled) return;
        setProfil(prof);
      } catch (e) {
        if (!cancelled)
          setErr(e?.message || "Eroare la încărcarea raportului.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [testID, elevID, resultID]);

  /* ---------- Normalize & computed (cu fallback Topic/Dificultate) ---------- */
  const rows = useMemo(() => {
    if (!rezultat?.answers) return [];
    const ans = rezultat.answers;
    const indexes = Array.isArray(ans)
      ? ans.map((_, i) => i)
      : Object.keys(ans)
          .map((k) => Number(k))
          .sort((a, b) => a - b);

    const fallbackTopics = ["General", "Gramatică", "Literatură", "Matematică"];
    const fallbackDiffs = ["Ușor", "Mediu", "Greu"];

    return indexes.map((idx) => {
      const it =
        items.find((x) => Number(x.index ?? x.idx ?? x.i) === idx) || {};
      const elev = Array.isArray(ans) ? ans[idx] : ans[idx];
      const corect = answerKey?.[idx];
      const isCorrect =
        String(elev ?? "")
          .trim()
          .toLowerCase() ===
        String(corect ?? "")
          .trim()
          .toLowerCase();

      return {
        idx,
        text: it.text || it.enunt || it.question || "—",
        elev: elev ?? "—",
        corect: corect ?? "—",
        topic:
          (it.topic ?? "").trim() !== ""
            ? it.topic
            : fallbackTopics[idx % fallbackTopics.length],
        diff:
          (it.dificultate ?? "").trim() !== ""
            ? it.dificultate
            : fallbackDiffs[idx % fallbackDiffs.length],
        isCorrect,
      };
    });
  }, [rezultat, items, answerKey]);

  const scor = useMemo(() => {
    const total = rows.length || 0;
    const n = rows.filter((r) => r.isCorrect).length;
    return { n, total, procent: total ? Math.round((n / total) * 100) : 0 };
  }, [rows]);

  const durata = useMemo(() => {
    const sec = Number(profil?.duration_sec ?? 0);
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }, [profil?.duration_sec]);

  // facets
  const topics = useMemo(
    () => [
      "toate",
      ...Array.from(new Set(rows.map((r) => r.topic).filter(Boolean))).sort(),
    ],
    [rows]
  );
  const diffs = useMemo(
    () => [
      "toate",
      ...Array.from(new Set(rows.map((r) => r.diff).filter(Boolean))).sort(),
    ],
    [rows]
  );

  // filtre + căutare + sort (NU redeclarăm filterCorrect aici!)
  const filtered = useMemo(() => {
    let X = rows;
    if (filterCorrect !== "toate")
      X = X.filter((r) =>
        filterCorrect === "corecte" ? r.isCorrect : !r.isCorrect
      );
    if (topicFilter !== "toate") X = X.filter((r) => r.topic === topicFilter);
    if (diffFilter !== "toate") X = X.filter((r) => r.diff === diffFilter);
    if (dq.trim()) {
      const ql = dq.toLowerCase();
      X = X.filter((r) =>
        [r.text, r.elev, r.corect, r.topic, r.diff]
          .join(" ")
          .toLowerCase()
          .includes(ql)
      );
    }
    X = [...X];
    if (sortKey === "idx_asc") X.sort((a, b) => a.idx - b.idx);
    if (sortKey === "corect_desc")
      X.sort((a, b) =>
        a.isCorrect === b.isCorrect ? a.idx - b.idx : a.isCorrect ? -1 : 1
      );
    if (sortKey === "text_asc")
      X.sort((a, b) => (a.text || "").localeCompare(b.text || ""));
    return X;
  }, [rows, dq, filterCorrect, topicFilter, diffFilter, sortKey]);

  // paginare
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe); /* eslint-disable-next-line */
  }, [totalPages]);
  const pageRows = useMemo(
    () => filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage),
    [filtered, pageSafe]
  );

  // export CSV
  const onExportCSV = () => {
    const head = [
      "#",
      "Enunț",
      "Răspuns elev",
      "Răspuns corect",
      "Corect",
      "Topic",
      "Dificultate",
    ];
    const lines = [head.join(",")];
    filtered.forEach((r, i) => {
      lines.push(
        [
          i + 1,
          `"${String(r.text || "—").replace(/"/g, '""')}"`,
          `"${String(r.elev || "—").replace(/"/g, '""')}"`,
          `"${String(r.corect || "—").replace(/"/g, '""')}"`,
          r.isCorrect ? "DA" : "NU",
          `"${String(r.topic || "—").replace(/"/g, '""')}"`,
          `"${String(r.diff || "—").replace(/"/g, '""')}"`,
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raport_detaliat.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white text-blue-900 font-sans flex flex-col">
      {/* Back → Rapoarte Testare */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/rapoarte"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Rapoarte
        </Link>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6 flex-grow">
        {/* Header & meta */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">
            Raport detaliat
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Vizualizează toate întrebările, răspunsurile elevului și cheia
            corectă. Caută și filtrează rapid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="p-4 bg-white rounded-2xl border border-indigo-100 shadow">
            <h2 className="text-base font-semibold mb-1">🧪 Test</h2>
            <div className="font-medium text-lg">{test?.title || "—"}</div>
            <div className="text-sm text-gray-500">
              {test?.descriere || "—"}
            </div>
            <div className="text-sm text-gray-600">
              Materie: {test?.subject || "—"}
            </div>
            <div className="text-sm text-gray-600">
              Clasă: {test?.grade_level || "—"}
            </div>
            {test?.test_type && (
              <div className="text-sm text-gray-600">Tip: {test.test_type}</div>
            )}
          </section>

          <section className="p-4 bg-white rounded-2xl border border-indigo-100 shadow">
            <h2 className="text-base font-semibold mb-1">👤 Elev</h2>
            <div className="font-medium">{profil?.full_name || "—"}</div>
            <div className="text-sm text-gray-600">{profil?.email || "—"}</div>
            <div className="text-sm text-gray-600">
              Trimis: {fmtDateTime(profil?.submitted_at)}
            </div>
          </section>

          <section className="p-4 bg-white rounded-2xl border border-indigo-100 shadow">
            <h2 className="text-base font-semibold mb-1">📈 Rezumat</h2>
            <div className="text-sm text-gray-600">
              Scor:{" "}
              <b>
                {scor.n}/{scor.total}
              </b>{" "}
              ({scor.procent}%)
            </div>
            <div className="text-sm text-gray-600">
              Durată: <b>{durata}</b>
            </div>
          </section>
        </div>

        {/* Toolbar premium */}
        <div className="rounded-2xl border border-blue-200 bg-white/90 shadow p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-gray-600">
                Căutare
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Enunț, răspuns elev, răspuns corect, topic, dificultate…"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Corectitudine
              </label>
              <select
                value={filterCorrect}
                onChange={(e) => setFilterCorrect(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="toate">Toate</option>
                <option value="corecte">Doar corecte</option>
                <option value="gresite">Doar greșite</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Topic</label>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Dificultate
              </label>
              <select
                value={diffFilter}
                onChange={(e) => setDiffFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                {diffs.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Sortare
              </label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="idx_asc">După # întrebare</option>
                <option value="corect_desc">Corecte → Greșite</option>
                <option value="text_asc">Enunț (A→Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="flex items-end">
              <button
                onClick={() => {
                  setQ("");
                  setFilterCorrect("toate");
                  setTopicFilter("toate");
                  setDiffFilter("toate");
                  setSortKey("idx_asc");
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

        {/* Tabel întrebări */}
        <div className="overflow-x-auto shadow rounded-2xl bg-white border border-blue-200">
          <table className="min-w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-blue-100 text-blue-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Enunț</th>
                <th className="px-4 py-3">Răspuns elev</th>
                <th className="px-4 py-3">Răspuns corect</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Dificultate</th>
                <th className="px-4 py-3">Corect?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    Se încarcă…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    Nimic de afișat după filtrele curente.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr key={r.idx} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3">
                      {(pageSafe - 1) * perPage + i + 1}
                    </td>
                    <td className="px-4 py-3">{r.text}</td>
                    <td className="px-4 py-3">{String(r.elev || "—")}</td>
                    <td className="px-4 py-3">{String(r.corect || "—")}</td>
                    <td className="px-4 py-3">{r.topic}</td>
                    <td className="px-4 py-3">{r.diff}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg border text-xs font-semibold ${
                          r.isCorrect
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {r.isCorrect ? "Corect" : "Greșit"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginare */}
        <div className="flex items-center justify-between py-3 text-sm">
          <div className="text-gray-600">
            Întrebări: <b>{filtered.length}</b> • Pagina <b>{pageSafe}</b> din{" "}
            <b>{totalPages}</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            >
              ← Înapoi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            >
              Înainte →
            </button>
          </div>
        </div>

        {/* Eroare globală */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-3 text-sm">
            {err}
          </div>
        )}
      </main>
    </div>
  );
}

// src/pages/profesor/RezultateElevi.jsx (Supabase direct – results_enriched cu titlu şi materie)
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const fmtDurata = (totalSec) => {
  if (totalSec == null) return "—";
  const s = Number(totalSec) || 0;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

const RezultateElevi = () => {
  const [elevi, setElevi] = useState([]);
  const [selectedElev, setSelectedElev] = useState("");
  const [teste, setTeste] = useState([]);
  const [loadingElevi, setLoadingElevi] = useState(true);
  const [loadingTeste, setLoadingTeste] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingElevi(true);
      setErr("");
      try {
        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) throw authErr;
        const user = authData?.user;
        if (!user) throw new Error("Neautentificat");

        const { data, error } = await supabase
          .from("results_enriched")
          .select("student_id, student_name, student_email")
          .order("student_name", { ascending: true });
        if (error) throw error;

        const seen = new Set();
        const uniq = [];
        for (const r of data || []) {
          if (!seen.has(r.student_id)) {
            seen.add(r.student_id);
            uniq.push({
              id: r.student_id,
              full_name: r.student_name,
              email: r.student_email,
            });
          }
        }
        if (!cancelled) setElevi(uniq);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr(e?.message || "Eroare la încărcarea elevilor.");
      } finally {
        if (!cancelled) setLoadingElevi(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTeste([]);
      if (!selectedElev) return;
      setLoadingTeste(true);
      setErr("");
      try {
        const { data: rows, error } = await supabase
          .from("results_enriched")
          .select(
            "id, test_id, student_id, score, duration_sec, submitted_at, student_name, student_email, answers, test_title, test_subject"
          )
          .eq("student_id", selectedElev)
          .order("submitted_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setTeste(rows || []);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setErr(e?.message || "Eroare la încărcarea rezultatelor.");
      } finally {
        if (!cancelled) setLoadingTeste(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedElev]);

  const selectRaport = (testID, elevID) => {
    sessionStorage.setItem("raport_selectat_testID", testID);
    sessionStorage.setItem("raport_selectat_elevID", elevID);
  };

  return (
    <div className="text-blue-900 font-sans min-h-screen flex flex-col">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
          href="/profesor/dashboard"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8 flex-grow">
        <h1 className="text-4xl font-bold text-center">👥 Rezultate Elevi</h1>

        {err && (
          <div className="max-w-3xl mx-auto p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
            {err}
          </div>
        )}

        <div className="text-center">
          <label
            className="text-lg font-medium mb-2 block"
            htmlFor="elevSelect"
          >
            Selectează un elev:
          </label>
          {loadingElevi ? (
            <div className="text-gray-500">Se încarcă elevii…</div>
          ) : (
            <select
              id="elevSelect"
              className="w-full max-w-md mx-auto block border border-gray-300 rounded-lg px-4 py-2 text-sm"
              value={selectedElev}
              onChange={(e) => setSelectedElev(e.target.value)}
            >
              <option value="">-- Selectează elevul --</option>
              {elevi.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name || e.id} ({e.email || "—"})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-4">
          {loadingTeste && (
            <p className="text-center text-gray-500">Se încarcă rezultatele…</p>
          )}

          {selectedElev && !loadingTeste && teste.length === 0 && !err && (
            <p className="text-center text-gray-500">
              Nicio testare găsită pentru acest elev.
            </p>
          )}

          {teste.map((row) => {
            const title = row.test_title || "Test fără titlu";
            const subtitle = row.test_subject || null;

            return (
              <div
                key={row.id}
                className="bg-white rounded-xl shadow p-5 border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-blue-800 mb-2 flex items-center justify-between">
                  <span title={title} className="truncate">
                    🧪 {title}
                  </span>
                  {subtitle && (
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {subtitle}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-700 mb-1">
                  Elev: <strong>{row.student_name || row.student_id}</strong> (
                  {row.student_email || "—"})
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  Scor: <strong>{row.score != null ? row.score : "—"}</strong>
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  Durată: {fmtDurata(row.duration_sec)}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  Trimis la:{" "}
                  {row.submitted_at
                    ? new Intl.DateTimeFormat("ro-RO", {
                        timeZone: "Europe/Bucharest",
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(row.submitted_at))
                    : "—"}
                </p>
                <a
                  href="/profesor/raport-detaliat"
                  onClick={() => selectRaport(row.test_id, row.student_id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Vezi detalii test
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default RezultateElevi;

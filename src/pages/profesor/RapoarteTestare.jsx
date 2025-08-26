// src/pages/profesor/RapoarteTestare.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultsAPI from "@/services/resultsService.js";

const RapoarteTestare = () => {
  const [rapoarte, setRapoarte] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const { listAllResultsForTeacher } = ResultsAPI;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listAllResultsForTeacher();
        if (!cancelled) setRapoarte(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr(e?.message || "Eroare la încărcarea rapoartelor.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const veziRaport = (resultID, testID, elevID) => {
    sessionStorage.setItem("raport_selectat_resultID", resultID);
    sessionStorage.setItem("raport_selectat_testID", testID);
    sessionStorage.setItem("raport_selectat_elevID", elevID);
    navigate("/profesor/raport-detaliat");
  };

  return (
    <div className="min-h-screen text-gray-800 font-sans flex flex-col">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          href="/profesor/dashboard"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center text-blue-900">📊 Rapoarte Testare</h1>

          {err && (
            <div className="max-w-3xl mx-auto p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
              {err}
            </div>
          )}

          <div className="overflow-x-auto shadow rounded-xl bg-white border border-blue-200">
            <table className="min-w-full table-auto text-sm text-left border-collapse">
              <thead className="bg-blue-100 text-blue-800">
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
                {rapoarte.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500">Niciun raport disponibil.</td>
                  </tr>
                ) : (
                  rapoarte.map((r, i) => {
                    const raspunsuri = r.raspunsuri || [];
                    const scor = raspunsuri.filter(q => q.elev === q.corect).length;
                    const total = raspunsuri.length;
                    const procent = total ? Math.round((scor / total) * 100) : 0;
                    return (
                      <tr key={r.key} className="hover:bg-blue-50 transition">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-blue-900">{r.elevNume || r.elevID}</td>
                        <td className="px-4 py-3">{r.elevEmail || "—"}</td>
                        <td className="px-4 py-3">{r.testTitle || r.testID}</td>
                        <td className="px-4 py-3">{r.subject || "-"}</td>
                        <td className="px-4 py-3">{r.grade_level || "-"}</td>
                        <td className="px-4 py-3">{r.data}</td>
                        <td className="px-4 py-3">{scor}/{total} ({procent}%)</td>
                        <td className="px-4 py-3">{procent >= 80 ? "🎉 Excelent" : procent >= 60 ? "👍 Bine" : "⚠️ Necesită îmbunătățire"}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => veziRaport(r.key, r.testID, r.elevID)} className="text-blue-600 hover:underline">Vezi</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RapoarteTestare;

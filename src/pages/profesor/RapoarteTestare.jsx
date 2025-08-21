import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RapoarteTestare = () => {
  const [rapoarte, setRapoarte] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  const existaDate = Object.keys(localStorage).some(k => k.startsWith("rezultat_test_"));
  const isDev = import.meta.env.MODE === "development";

  if (!existaDate && isDev) {
    const demo = {
      testID: "test123",
      elevID: "elev_demo",
      data: new Date().toLocaleDateString("ro-RO"),
      raspunsuri: [
        { intrebare: "Care este capitala Franței?", elev: "Paris", corect: "Paris" },
        { intrebare: "2 + 2 = ?", elev: "4", corect: "4" },
        { intrebare: "Ce culoare are cerul?", elev: "Verde", corect: "Albastru" }
      ]
    };
    localStorage.setItem("rezultat_test_test123_elev_demo", JSON.stringify(demo));
  }

    const rezultate = Object.keys(localStorage)
      .filter((k) => k.startsWith("rezultat_test_"))
      .map((k) => ({ key: k, ...JSON.parse(localStorage.getItem(k)) }));

    setRapoarte(rezultate);
  }, []);

  const veziRaport = (testID, elevID) => {
    sessionStorage.setItem("raport_selectat_testID", testID);
    sessionStorage.setItem("raport_selectat_elevID", elevID);
    navigate("/profesor/raport-detaliat");
  };

  const stergeRaport = (key) => {
    if (window.confirm("Sigur vrei să ștergi acest raport?")) {
      localStorage.removeItem(key);
      setRapoarte((prev) => prev.filter((r) => r.key !== key));
    }
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

          <div className="overflow-x-auto shadow rounded-xl bg-white border border-blue-200">
            <table className="min-w-full table-auto text-sm text-left border-collapse">
              <thead className="bg-blue-100 text-blue-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Elev</th>
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Scor</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3 text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rapoarte.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">Niciun raport disponibil.</td>
                  </tr>
                ) : (
                  rapoarte.map((r, i) => {
                    const scor = r.raspunsuri.filter(q => q.elev === q.corect).length;
                    const total = r.raspunsuri.length;
                    const procent = Math.round((scor / total) * 100);
                    return (
                      <tr key={r.key} className="hover:bg-blue-50 transition">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-blue-900">{r.elevID}</td>
                        <td className="px-4 py-3">{r.testID}</td>
                        <td className="px-4 py-3">{r.data}</td>
                        <td className="px-4 py-3">{scor}/{total} ({procent}%)</td>
                        <td className="px-4 py-3">{procent >= 80 ? "🎉 Excelent" : procent >= 60 ? "👍 Bine" : "⚠️ Necesită îmbunătățire"}</td>
                        <td className="px-4 py-3 flex flex-col gap-1 text-sm text-center items-center justify-center">
                          <button onClick={() => veziRaport(r.testID, r.elevID)} className="text-blue-600 hover:underline">Detalii</button>
                          <button onClick={() => stergeRaport(r.key)} className="text-red-600 hover:underline">Șterge</button>
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
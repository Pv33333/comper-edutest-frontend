
import React, { useEffect, useState } from "react";

const RezultateElevi = () => {
  const [elevi, setElevi] = useState([]);
  const [selectedElev, setSelectedElev] = useState("");
  const [teste, setTeste] = useState([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("rezultat_test_"));
    const eleviUnici = [...new Set(keys.map(k => k.split("_").pop()))];
    setElevi(eleviUnici);
  }, []);

  useEffect(() => {
    if (!selectedElev) {
      setTeste([]);
      return;
    }

    const rezultate = Object.keys(localStorage)
      .filter(k => k.startsWith("rezultat_test_") && k.endsWith("_" + selectedElev))
      .map(k => JSON.parse(localStorage.getItem(k)));

    setTeste(rezultate);
  }, [selectedElev]);

  const selectRaport = (testID, elevID) => {
    sessionStorage.setItem("raport_selectat_testID", testID);
    sessionStorage.setItem("raport_selectat_elevID", elevID);
  };

  return (
    <div className="text-blue-900 font-sans min-h-screen flex flex-col">
      <div className="w-full text-center mt-6"></div>

      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
          href="/profesor/dashboard"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8 flex-grow">
        <h1 className="text-4xl font-bold text-center">👥 Rezultate Elevi</h1>
        <div className="text-center">
          <label className="text-lg font-medium mb-2 block" htmlFor="elevSelect">Selectează un elev:</label>
          <select
            id="elevSelect"
            className="w-full max-w-md mx-auto block border border-gray-300 rounded-lg px-4 py-2 text-sm"
            value={selectedElev}
            onChange={(e) => setSelectedElev(e.target.value)}
          >
            <option value="">-- Selectează elevul --</option>
            {elevi.map((elev, i) => (
              <option key={i} value={elev}>{elev}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {selectedElev && teste.length === 0 && (
            <p className="text-center text-gray-500">Nicio testare găsită pentru acest elev.</p>
          )}

          {teste.map((test, index) => {
            const scor = test.raspunsuri.filter(r => r.elev === r.corect).length;
            const total = test.raspunsuri.length;
            const procent = Math.round((scor / total) * 100);
            const feedback = procent >= 80 ? "🎉 Excelent" : procent >= 60 ? "👍 Bine" : "⚠️ Necesită îmbunătățire";

            return (
              <div key={index} className="bg-white rounded-xl shadow p-5 border border-gray-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">🧪 {test.testID} – {test.data}</h3>
                <p className="text-sm text-gray-700 mb-1">Scor: <strong>{scor}/{total}</strong> ({procent}%)</p>
                <p className="text-sm text-gray-500 mb-2">Feedback: {feedback}</p>
                <a
                  href="/profesor/raport-detaliat"
                  onClick={() => selectRaport(test.testID, test.elevID)}
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

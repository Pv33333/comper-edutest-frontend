import React, { useEffect, useState } from "react";

const RaportDetaliatProfesor = () => {
  const [raport, setRaport] = useState(null);
  const [testID, setTestID] = useState(null);
  const [elevID, setElevID] = useState(null);

  useEffect(() => {
    const tID = sessionStorage.getItem("raport_selectat_testID");
    const eID = sessionStorage.getItem("raport_selectat_elevID");

    setTestID(tID);
    setElevID(eID);

    if (!tID || !eID) return;

    const key = `rezultat_test_${tID}_${eID}`;
    const data = JSON.parse(localStorage.getItem(key));
    setRaport(data);
  }, []);

  return (
    <div className="min-h-screen flex flex-col -50 text-gray-800 font-sans">
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
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-blue-900 text-center">📄 Raport Detaliat – Profesor</h1>
          <div className="text-center text-sm text-gray-600">
            {!raport
              ? (!testID || !elevID
                ? "⚠️ Nu există raport selectat."
                : `⚠️ Nu am găsit date pentru ${elevID} la testul ${testID}.`)
              : `Elev: ${elevID} | Test: ${testID} | Data: ${raport.data}`}
          </div>

          {raport && (
            <div className="space-y-6 mt-4">
              {raport.raspunsuri.map((q, i) => {
                const corect = q.elev === q.corect;
                return (
                  <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm space-y-1">
                    <p className="text-base font-medium">🔹 Întrebarea {i + 1}:</p>
                    <p className="text-sm text-gray-700">{q.intrebare}</p>
                    <p className="text-sm">
                      ✍️ Răspuns elev:{" "}
                      <span className={corect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {q.elev}
                      </span>
                    </p>
                    <p className="text-sm">
                      ✅ Corect: <span className="text-green-800">{q.corect}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RaportDetaliatProfesor;
import React, { useEffect, useState } from "react";

export default function TesteProfesorElev() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("teste_primite");
      const list = raw ? JSON.parse(raw) : [];
      setTests(Array.isArray(list) ? list : []);
    } catch {
      setTests([]);
    }
  }, []);

  const removeTest = (id) => {
    const ok = window.confirm("Ești sigur că vrei să ștergi acest test?");
    if (!ok) return;
    const next = tests.filter(t => t.id !== id);
    setTests(next);
    localStorage.setItem("teste_primite", JSON.stringify(next));
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
          href="/elev/dashboard"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">📥 Teste de la profesor</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              Momentan nu ai teste primite de la profesor.
            </p>
          )}

          {tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-1">{test.titlu}</h2>
                <p className="text-sm text-gray-700 mb-1"><strong>Materie:</strong> {test.materie}</p>
                <p className="text-sm text-gray-700 mb-1"><strong>Clasa:</strong> {test.clasa}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Profesor:</strong> {test.profesor}</p>
              </div>

              <a
                href={test.link}
                className="mt-3 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
              >
                📝 Rezolvă testul
              </a>

              <button
                onClick={() => removeTest(test.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                🗑️ Șterge testul
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

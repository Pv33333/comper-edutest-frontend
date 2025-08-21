import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TesteProfesorElev() {
  const [teste, setTeste] = useState([]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("teste_primite") || "[]");
      setTeste(arr);
    } catch {
      setTeste([]);
    }
  }, []);

  const stergeTest = (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest test?")) return;
    try {
      let arr = JSON.parse(localStorage.getItem("teste_primite") || "[]");
      arr = arr.filter((t) => t.id !== id);
      localStorage.setItem("teste_primite", JSON.stringify(arr));
      setTeste(arr);
    } catch {}
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-6 px-4">
        <Link className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium" to="/elev/dashboard">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">📥 Teste de la profesor</h1>
        {teste.length === 0 ? (
          <p className="text-gray-500 text-center">Momentan nu ai teste primite de la profesor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teste.map((test) => (
              <div key={test.id} className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-blue-800 mb-1">{test.titlu}</h2>
                  <p className="text-sm text-gray-700 mb-1"><strong>Materie:</strong> {test.materie || "-"}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong>Clasa:</strong> {test.clasa || "-"}</p>
                  <p className="text-sm text-gray-700 mb-2"><strong>Profesor:</strong> {test.profesor || "-"}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link to={test.link || "#"} className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition">
                    📝 Rezolvă testul
                  </Link>
                  <button onClick={() => stergeTest(test.id)} className="text-sm text-red-600 hover:underline">
                    🗑️ Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

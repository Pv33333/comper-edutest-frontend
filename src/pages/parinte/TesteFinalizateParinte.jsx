import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function readScore(key) {
  const v = localStorage.getItem(key);
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

function StatusBadge({ score }) {
  const finalizat = score > 0;
  const cls = finalizat
    ? "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
    : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm";
  return <span className={cls}>{finalizat ? "Finalizat" : "În desfășurare"}</span>;
}

export default function TesteFinalizateParinte() {
  const [scorRomana, setScorRomana] = useState(0);
  const [scorMate, setScorMate] = useState(0);

  useEffect(() => {
    setScorRomana(readScore("scor_romana"));
    setScorMate(readScore("scor_matematica"));
  }, []);

  return (
    <main className="min-h-screen text-[#1C3C7B] flex flex-col">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link
          to="/parinte/dashboard"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <div className="max-w-4xl mx-auto py-12 px-6 space-y-10 flex-1">
        <h1 className="text-4xl font-bold text-center text-gray-800">📚 Testele finalizate ale copilului tău</h1>
        <p className="text-center text-base text-gray-700">
          Vizualizează testele finalizate și rezultatele obținute
        </p>

        {/* Română */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">📖 Test Limba Română</h2>
            <StatusBadge score={scorRomana} />
            <div className="flex gap-2">
              <Link
                to="/parinte/revizuiri/romana-10"
                className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition hover:opacity-90"
              >
                🔍 Revizuire
              </Link>
              <Link
                to="/parinte/rapoarte/romana-10"
                className="inline-block bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition hover:opacity-90"
              >
                📄 Raport detaliat
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Scor: <strong>{scorRomana}%</strong>
          </p>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${scorRomana}%` }}></div>
          </div>
        </div>

        {/* Matematică */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">🧠 Test Matematică</h2>
            <StatusBadge score={scorMate} />
            <div className="flex gap-2">
              <Link
                to="/parinte/revizuiri/mate-10"
                className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition hover:opacity-90"
              >
                🔍 Revizuire
              </Link>
              <Link
                to="/parinte/rapoarte/mate-10"
                className="inline-block bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition hover:opacity-90"
              >
                📄 Raport detaliat
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Scor: <strong>{scorMate}%</strong>
          </p>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${scorMate}%` }}></div>
          </div>
        </div>
      </div>
    </main>
  );
}

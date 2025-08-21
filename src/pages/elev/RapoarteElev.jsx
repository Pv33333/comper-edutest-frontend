
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RapoarteElev() {
  const [scorRomana, setScorRomana] = useState(null);
  const [scorMate, setScorMate] = useState(null);

  useEffect(() => {
    const sr = localStorage.getItem("scor_romana");
    const sm = localStorage.getItem("scor_matematica");
    setScorRomana(sr ? parseInt(sr) : null);
    setScorMate(sm ? parseInt(sm) : null);
  }, []);

  const Card = ({ title, color, scor, revizuireTo, raportTo }) => (
    <div className="bg-white p-6 rounded-2xl shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span
          className={`text-sm px-3 py-1 rounded-full ${
            scor != null ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {scor != null ? "Finalizat" : "În desfășurare"}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        Scor: <strong>{scor != null ? `${scor}%` : "–"}</strong>
      </p>
      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className={`h-3 rounded-full ${color === "blue" ? "bg-blue-500" : "bg-green-500"}`}
          style={{ width: `${scor || 0}%` }}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Link
          className={`text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition ${
            color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
          }`}
          to={revizuireTo}
        >
          🔍 Revizuire
        </Link>
        <Link
          className="bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition hover:opacity-90"
          to={raportTo}
        >
          📄 Raport detaliat
        </Link>
      </div>
    </div>
  );

  return (
    <div className="-50 min-h-screen text-gray-800">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link
          to="/elev/dashboard"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-10">
        <h1 className="text-3xl font-bold text-center text-purple-800">📊 Rapoartele Mele</h1>

        <Card
          title="📖 Test Limba Română"
          color="blue"
          scor={scorRomana}
          revizuireTo="/elev/revizuiri/romana-10"
          raportTo="/elev/rapoarte/romana-10"
        />

        <Card
          title="🧠 Test Matematică"
          color="green"
          scor={scorMate}
          revizuireTo="/elev/revizuiri/mate-10"
          raportTo="/elev/rapoarte/mate-10"
        />
      </main>
    </div>
  );
}

import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function FelicitarePremium() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scor = params.get("scor");
  const tip = params.get("tip"); // "mate" | "romana"

  const isMate = tip === "mate";
  const revizuirePath = isMate ? "/elev/revizuiri/mate-10" : "/elev/revizuiri/romana-10";
  const raportPath = isMate ? "/elev/rapoarte/mate-10" : "/elev/rapoarte/romana-10";

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-indigo-50 to-white px-6 py-16">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700">🎉 Felicitări!</h1>
        <p className="mt-2 text-gray-700">Ai finalizat testul.</p>
        <p className="mt-6 text-5xl font-mono font-bold">{scor ?? "–"}{scor ? "%" : ""}</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to={revizuirePath} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            🔍 Vezi revizuirea
          </Link>
          <Link to={raportPath} className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold">
            📄 Vezi raportul
          </Link>
        </div>

        <Link to="/elev/dashboard" className="block mt-6 text-indigo-700 hover:underline">
          ⬅️ Înapoi la Dashboard
        </Link>
      </div>
    </div>
  );
}
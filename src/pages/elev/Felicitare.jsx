import React from "react";
import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function FelicitareElev() {
  const query = useQuery();
  const scor = query.get("scor") ?? "0";
  const tip = query.get("tip") ?? "";
  const nr = query.get("nr") ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold">🎉 Felicitări!</h1>
        <p className="text-lg">Ai obținut scorul <span className="font-semibold">{scor}%</span>{tip ? <> la <span className="uppercase">{tip}</span></> : null}{nr ? <> – {nr} întrebări</> : null}.</p>
        <div className="flex justify-center gap-3">
          <Link to="/demo/teste" className="rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">Înapoi la Demo Teste</Link>
          <Link to="/" className="rounded-xl px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white">Acasă</Link>
        </div>
      </div>
    </div>
  );
}

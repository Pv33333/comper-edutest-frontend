import React, { useEffect, useState } from "react";

export default function RevizuireMate10() {
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("raspunsuri_mate_10");
      const list = raw ? JSON.parse(raw) : [];
      setAnswers(Array.isArray(list) ? list : []);
    } catch { setAnswers([]); }
    const s = localStorage.getItem("scor_matematica");
    setScore(s ? parseInt(s) : null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-2">🔍 Revizuire – Matematică (Clasa a IV-a)</h1>
      <p className="text-gray-600 mb-6">Scor: <strong>{score ?? "–"}{score != null ? "%" : ""}</strong></p>

      {answers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
          Nu găsesc răspunsuri salvate pentru acest test. Finalizează testul și revino aici.
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{idx + 1}. {item.intrebare || item.question || "Întrebare"}</p>
              <p className="text-sm text-gray-700">Răspunsul tău: <strong className="text-gray-900">{item.ales ?? item.elev ?? "—"}</strong></p>
              <p className="text-sm text-gray-700">Corect: <strong className="text-green-700">{item.corect}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";

const TestCard = ({ test, onModifica, onSterge, onTrimiteElevului, onTrimiteAdminului, onProgrameaza }) => {
  const statusText = test.status === "validat" ? "✅ Validat" :
                     test.status === "in_asteptare" ? "⏳ În așteptare" :
                     "— Neexpediat";
  const statusClass = test.status === "validat" ? "text-green-600" :
                      test.status === "in_asteptare" ? "text-yellow-600" :
                      "text-gray-500";

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-3">
      <h2 className="text-lg font-semibold text-indigo-800">📘 {test.materie}</h2>
      <p className="text-sm text-gray-700"><strong>Data:</strong> {test.data}</p>
      <p className="text-sm text-gray-700"><strong>Ora:</strong> {test.ora}</p>
      <p className="text-sm text-gray-600"><strong>Descriere:</strong> {test.descriere}</p>
      <p className="text-sm text-gray-600"><strong>Profesor:</strong> {test.profesor || "—"}</p>
      <p className="text-sm"><strong>Status Admin:</strong> <span className={statusClass}>{statusText}</span></p>

      <div className="flex flex-wrap gap-3 pt-2">
        <button onClick={onModifica} className="text-sm text-yellow-700 hover:underline">✏️ Modifică</button>
        <button onClick={onTrimiteElevului} className="text-sm text-green-700 hover:underline">📤 Trimite elevului</button>
        <button onClick={onTrimiteAdminului} className="text-sm text-blue-700 hover:underline">📩 Trimite adminului</button>
        <button onClick={onSterge} className="text-sm text-red-600 hover:underline">🗑️ Șterge</button>
        <button onClick={onProgrameaza} className="text-sm text-purple-700 hover:underline">🗓 Programează în calendar</button>
      </div>
    </div>
  );
};

export default TestCard;

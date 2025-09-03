import React from "react";

/**
 * TestCard (Premium Clean)
 * - Afișează doar câmpurile existente (fără „—”)
 * - Fără emoji; layout curat
 * - Chip de status doar dacă status != 'neexpediat'
 */
export default function TestCard({
  test,
  onModifica = () => {},
  onTrimiteElevului = () => {},
  onTrimiteAdminului = () => {},
  onSterge = () => {},
  onProgrameaza = () => {},
}) {
  const hasClass = !!test.school_class && test.school_class !== "Fără clasă";
  const hasDateOrTime = !!test.data || !!test.ora;
  const hasTeacher = !!test.profesor;
  const hasDescriere = !!test.descriere;
  const showStatus = !!test.status && test.status !== "neexpediat";

  const statusMap = {
    validat: { text: "Validat", cls: "text-green-700 bg-green-50 border-green-200" },
    in_asteptare: { text: "În așteptare", cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    neexpediat: { text: "Neexpediat", cls: "text-gray-600 bg-gray-50 border-gray-200" },
  };
  const st = statusMap[test.status] || statusMap.neexpediat;

  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-indigo-900">{test.materie || "Test"}</h2>
        {showStatus && (
          <span className={"text-xs px-2 py-1 rounded-full border " + st.cls}>
            {st.text}
          </span>
        )}
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {hasClass && (
          <div>
            <div className="text-gray-500">Clasă</div>
            <div className="font-medium">{test.school_class}</div>
          </div>
        )}
        {hasDateOrTime && (
          <div>
            <div className="text-gray-500">Programare</div>
            <div className="font-medium">
              {test.data ? `Data: ${test.data}` : ""}{test.data && test.ora ? " • " : ""}{test.ora ? `Ora: ${test.ora}` : ""}
            </div>
          </div>
        )}
        {hasTeacher && (
          <div className="col-span-2">
            <div className="text-gray-500">Profesor</div>
            <div className="font-medium">{test.profesor}</div>
          </div>
        )}
      </div>

      {/* Description */}
      {hasDescriere && (
        <div className="text-sm">
          <div className="text-gray-500">Descriere</div>
          <div className="font-medium break-words">{test.descriere}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={onModifica} className="px-3 py-2 rounded-xl border hover:bg-gray-50">✏️ Modifică</button>
        <button type="button" onClick={onTrimiteElevului} className="px-3 py-2 rounded-xl border hover:bg-gray-50">📤 Trimite elevului</button>
        <button type="button" onClick={onTrimiteAdminului} className="px-3 py-2 rounded-xl border hover:bg-gray-50">📩 Trimite adminului</button>
        <button type="button" onClick={onProgrameaza} className="px-3 py-2 rounded-xl border hover:bg-gray-50">🗓 Programează</button>
        <div className="flex-1" />
        <button type="button" onClick={onSterge} className="px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">🗑️ Șterge</button>
      </div>
    </div>
  );
}
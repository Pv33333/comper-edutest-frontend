
import React from "react";

/**
 * TestCard — card UI pentru afișarea unui test cu acțiuni.
 *
 * 🔧 Îmbunătățiri cheie față de versiunea anterioară:
 * - Mapare robustă a câmpurilor: disciplina/materie/subject, clasa/class/grade
 * - Badge-uri pentru Materie, Clasă, Tip + Status Admin colorizat
 * - Afișare date/ore cu fallback și iconițe
 * - Număr întrebări (dacă există test.intrebari)
 * - Butoane cu aria-label + titluri, ușor de atins pe mobil
 * - Layout responsiv, focus states, rol semnificativ pentru a11y
 */
const TestCard = ({
  test,
  onModifica,
  onSterge,
  onTrimiteElevului,
  onTrimiteAdminului,
  onProgrameaza,
}) => {
  if (!test) {
    return (
      <div
        className="text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl"
        role="alert"
        aria-live="polite"
      >
        ❌ Eroare: Test inexistent
      </div>
    );
  }

  // 🔁 Mapare robustă a denumirilor de câmpuri
  const disciplina = test.disciplina || test.materie || test.subject || "";
  const clasa = test.clasa || test.class || test.grade || "";
  const tip = test.tip || "—";
  const profesor = test.profesor || "—";
  const descriere = test.descriere || test.desc || "—";
  const data = test.data || test.date || "";
  const ora = test.ora || test.time || "";
  const nrIntrebari = Array.isArray(test.intrebari) ? test.intrebari.length : undefined;

  // 🏷️ Status admin
  const status = test.status || "neexpediat";
  const statusText =
    status === "validat"
      ? "✅ Validat"
      : status === "in_asteptare"
      ? "⏳ În așteptare"
      : "— Neexpediat";

  const statusClass =
    status === "validat"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "in_asteptare"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  // ⏰ Fallbackuri user-friendly
  const dateLabel = data || "—";
  const timeLabel = ora ? String(ora).slice(0, 5) : "—";

  return (
    <article
      className="bg-white p-5 rounded-2xl shadow border border-gray-200 space-y-4 hover:shadow-md transition focus-within:ring-2 focus-within:ring-indigo-500"
      role="group"
      aria-label={`Test ${disciplina || "fără materie"} pentru ${clasa || "fără clasă"}`}
    >
      {/* Header: titlu + status */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-indigo-800 leading-snug">
          📘 {disciplina || "Fără materie"}
        </h2>

        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-xl border ${statusClass}`}
          title={`Status Admin: ${statusText}`}
          aria-label={`Status Admin: ${statusText}`}
        >
          {statusText}
        </span>
      </div>

      {/* Badge-uri info */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
          <span aria-hidden>🏷</span> {tip}
        </span>
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
          <span aria-hidden>🏫</span> {clasa || "Fără clasă"}
        </span>
        {nrIntrebari !== undefined && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span aria-hidden>❓</span> {nrIntrebari} întrebări
          </span>
        )}
      </div>

      {/* Detalii */}
      <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
        <p className="flex items-center gap-2">
          <span aria-hidden>🗓</span>
          <span><strong>Data:</strong> {dateLabel}</span>
          <span className="opacity-50">•</span>
          <span><strong>Ora:</strong> {timeLabel}</span>
        </p>
        <p className="flex items-center gap-2">
          <span aria-hidden>👤</span>
          <span><strong>Profesor:</strong> {profesor}</span>
        </p>
        <p className="text-gray-600">
          <strong>Descriere:</strong> {descriere}
        </p>
      </div>

      {/* Acțiuni */}
      <div className="flex flex-wrap gap-2 pt-1">
        {onModifica && (
          <button
            onClick={onModifica}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Modifică testul"
            title="Modifică testul"
          >
            ✏️ Modifică
          </button>
        )}
        {onTrimiteElevului && (
          <button
            onClick={onTrimiteElevului}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Trimite testul elevului"
            title="Trimite testul elevului"
          >
            📤 Trimite elevului
          </button>
        )}
        {onTrimiteAdminului && (
          <button
            onClick={onTrimiteAdminului}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Trimite testul administratorului"
            title="Trimite testul administratorului"
          >
            📩 Trimite adminului
          </button>
        )}
        {onSterge && (
          <button
            onClick={onSterge}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
            aria-label="Șterge testul"
            title="Șterge testul"
          >
            🗑️ Șterge
          </button>
        )}
        {onProgrameaza && (
          <button
            onClick={onProgrameaza}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Programează în calendar"
            title="Programează în calendar"
          >
            🗓 Programează în calendar
          </button>
        )}
      </div>
    </article>
  );
};

export default TestCard;

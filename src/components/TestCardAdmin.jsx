import React from "react";

/**
 * TestCard
 * - variant="default": pentru paginile profesor/elev (păstrează stil simplu)
 * - variant="admin":   pentru Administrare Platformă (design fidel HTML, cu acțiuni: Editează / Șterge / Validează)
 */
export default function TestCard({
  test = {},
  eticheta,
  variant = "default",
  onEdit,
  onDelete,
  onValidate,
}) {
  const {
    id,
    titlu,
    materie,
    clasa,
    descriere,
    profesor,
    data,
    ora,
    dataCreare,
    validat,
  } = test;

  if (variant === "admin") {
    return (
      <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between border">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{titlu || "Fără titlu"}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {materie || "—"} • {clasa || "—"}
          </p>
          {(data || ora) && (
            <p className="text-xs text-gray-500 mt-1">🗓 {data || "—"} {ora ? `• ${ora}` : ""}</p>
          )}
          {dataCreare && (
            <p className="text-xs text-gray-400 mt-1">📅 Creat: {dataCreare}</p>
          )}
          {profesor && (
            <p className="text-xs text-gray-500 mt-1">👤 Profesor: {profesor}</p>
          )}
          {descriere && (
            <p className="text-sm text-gray-700 mt-2">{descriere}</p>
          )}
          <div className="mt-3">
            {eticheta && (
              <span
                className={`inline-block text-xs px-2 py-1 rounded ${
                  eticheta.includes("admin")
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {eticheta}
              </span>
            )}
            {typeof validat === "boolean" && (
              <span className={`inline-block ml-2 text-xs px-2 py-1 rounded ${validat ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {validat ? "✅ Validat" : "⏳ Nevalidat"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-sm transition"
            >
              ✏️ Editează
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition"
            >
              🗑️ Șterge
            </button>
          )}
          {onValidate && (
            <button
              onClick={onValidate}
              className="px-3 py-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm transition"
            >
              ✅ Validează
            </button>
          )}
        </div>
      </div>
    );
  }

  // VARIANTA DEFAULT (profesor/elev) – păstrată simplă
  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-3">
      <h2 className="text-lg font-semibold text-indigo-800">📘 {materie || "—"}</h2>
      {titlu && <p className="text-sm text-gray-800"><strong>Titlu:</strong> {titlu}</p>}
      {clasa && <p className="text-sm text-gray-700"><strong>Clasa:</strong> {clasa}</p>}
      {data && <p className="text-sm text-gray-700"><strong>Data:</strong> {data}</p>}
      {ora && <p className="text-sm text-gray-700"><strong>Ora:</strong> {ora}</p>}
      {descriere && <p className="text-sm text-gray-600"><strong>Descriere:</strong> {descriere}</p>}
      {profesor && <p className="text-sm text-gray-600"><strong>Profesor:</strong> {profesor}</p>}

      {eticheta && (
        <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
          {eticheta}
        </span>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        {onEdit && (
          <button onClick={onEdit} className="text-sm text-yellow-700 hover:underline">✏️ Modifică</button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="text-sm text-red-600 hover:underline">🗑️ Șterge</button>
        )}
      </div>
    </div>
  );
}

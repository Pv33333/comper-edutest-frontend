import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LoguriActiuni() {
  const [filter, setFilter] = useState("Toate");
  const [selectedLog, setSelectedLog] = useState(null);

  // Sample logs (hardcoded for now, can be replaced with API/localStorage)
  const logs = [
    { id: 1, data: "2025-08-10 14:32", rol: "Admin", actiune: "A adăugat un test nou pentru clasa a IV-a" },
    { id: 2, data: "2025-08-09 11:20", rol: "Profesor", actiune: "A actualizat profilul elevului Ion Popescu" },
    { id: 3, data: "2025-08-08 09:15", rol: "Admin", actiune: "A dezactivat un cont de profesor" },
    { id: 4, data: "2025-08-07 16:45", rol: "Profesor", actiune: "A creat un test Comper la matematică" },
  ];

  const filteredLogs = filter === "Toate" ? logs : logs.filter((log) => log.rol === filter);

  return (
    <div className="-50 min-h-screen px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">📜 Loguri Acțiuni</h1>
        <Link
          to="/admin/dashboard"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition"
        >
          ⬅ Înapoi la Dashboard Admin
        </Link>
      </div>

      {/* Filtru */}
      <div className="flex gap-3 mb-6">
        {["Toate", "Admin", "Profesor"].map((rol) => (
          <button
            key={rol}
            onClick={() => setFilter(rol)}
            className={`px-4 py-2 rounded-lg font-medium shadow-sm border transition ${
              filter === rol
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {rol}
          </button>
        ))}
      </div>

      {/* Tabel loguri */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiune</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{log.data}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{log.rol}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{log.actiune}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm shadow hover:bg-blue-600 transition"
                  >
                    🔍 Detalii
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panou detalii */}
      {selectedLog && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Detalii acțiune</h2>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              ✖
            </button>
          </div>
          <p className="text-gray-700"><strong>Data:</strong> {selectedLog.data}</p>
          <p className="text-gray-700"><strong>Rol:</strong> {selectedLog.rol}</p>
          <p className="text-gray-700"><strong>Acțiune:</strong> {selectedLog.actiune}</p>
        </div>
      )}
    </div>
  );
}

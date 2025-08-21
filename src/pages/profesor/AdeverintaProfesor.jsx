import React from "react";
import BackToDashboard from "../../components/BackToDashboard";

const AdeverintaProfesor = () => {
  return (
    <div className="flex flex-col min-h-screen -50 text-blue-900 font-sans">
      <BackToDashboard />

      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-blue-200">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">📄 Adeverință disponibilă</h1>
          <p className="text-gray-700 mb-6">
            Poți descărca adeverința ta oficială în format PDF. Documentul
            confirmă statutul și activitatea ta educațională.
          </p>
          <a
            href="/assets/adeverinta_exemplu.pdf"
            download
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            ⬇️ Descarcă Adeverința (PDF)
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdeverintaProfesor;
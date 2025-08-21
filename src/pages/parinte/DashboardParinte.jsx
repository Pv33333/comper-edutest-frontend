import React, { useEffect, useState } from "react";

export default function DashboardParinte() {
  const [numarTesteFinalizate, setNumarTesteFinalizate] = useState(0);

  useEffect(() => {
    try {
      const finalizate = JSON.parse(localStorage.getItem("finalizate") || "[]");
      if (Array.isArray(finalizate)) setNumarTesteFinalizate(finalizate.length);
    } catch {}
  }, []);

  const logout = () => {
    sessionStorage.removeItem("rol_autentificat");
    localStorage.removeItem("utilizator_autentificat");
    window.location.href = "/autentificare/login";
  };

  return (
    <main className="text-blue-900 min-h-screen">
      {/* Navigație principală */}
      <div className="flex justify-center gap-6 mb-4 pt-10">
        <a
          href="/homepage/homepage.html"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          🏠 Acasă
        </a>
        <button
          onClick={logout}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold rounded-xl shadow transition flex items-center gap-2"
        >
          🚪 Ieși din cont
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Calendar */}
        <div className="mb-10 mt-10">
          <a
            href="/parinte/calendar"
            className="block p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center"
          >
            <h2 className="text-3xl font-semibold text-gray-800">📅 Calendar activitate</h2>
            <p className="text-base text-gray-700">Programări și activități viitoare.</p>
          </a>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16">
          {/* Stânga */}
          <div className="flex flex-col gap-6">
            <a
              href="/parinte/profil"
              className="block p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center"
            >
              <h2 className="text-3xl font-semibold text-gray-800">👤 Profilul meu</h2>
              <p className="text-base text-gray-700">Datele tale ca părinte.</p>
            </a>
            <a
              href="/parinte/profil-copil"
              className="block p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center"
            >
              <h2 className="text-3xl font-semibold text-gray-800">🧍 Profil copil</h2>
              <p className="text-base text-gray-700">Informații despre copilul tău.</p>
            </a>
          </div>

          {/* Centru */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-800">
              🎯 Fii alături de copilul tău în călătoria educațională!
            </h2>
            <img
              src="/assets/img/parinte_implicat.png"
              alt="Părinte implicat"
              className="mx-auto rounded-xl shadow-lg w-full max-w-md"
            />
          </div>

          {/* Dreapta */}
          <div className="flex flex-col gap-6">
            <a
              href="/parinte/rapoarte"
              className="block p-6 h-full bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center flex flex-col justify-between"
            >
              <h2 className="text-3xl font-semibold text-gray-800">📊 Rapoarte de Progres</h2>
              <p className="text-base text-gray-700">Rezultate, scoruri și evoluție completă.</p>
            </a>
            <a
              href="/parinte/teste-finalizate"
              className="block p-6 h-full bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center flex flex-col justify-between"
            >
              <h2 className="text-3xl font-semibold text-gray-800">📦 Teste Finalizate</h2>
              <p className="text-base text-gray-700">Vezi toate testele completate și rapoartele PDF.</p>
              <p className="text-base text-gray-700">{numarTesteFinalizate}</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

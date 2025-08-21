import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardElev() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [nrFinalizate, setNrFinalizate] = useState(0);
  const [lastTest, setLastTest] = useState({ name: "–", score: "-" });

  const logout = () => {
    sessionStorage.removeItem("rol_autentificat");
    localStorage.removeItem("utilizator_autentificat");
    navigate("/autentificare/login", { replace: true });
  };

  useEffect(() => {
    const finalizate = JSON.parse(localStorage.getItem("finalizate") || "[]");
    const total = 10; // dacă ai un alt total de teste, actualizează aici
    const nr = Array.isArray(finalizate) ? finalizate.length : 0;
    setNrFinalizate(nr);
    const procent = Math.min(Math.round((nr / total) * 100), 100);
    setProgress(procent);

    const rapoarte = JSON.parse(localStorage.getItem("rapoarte") || "{}");
    if (nr > 0) {
      const ultimId = finalizate[finalizate.length - 1];
      const scor = rapoarte[ultimId] ?? "-";
      setLastTest({ name: ultimId, score: scor });
    }
  }, []);

  return (
    <div className="-50 min-h-screen">
      {/* Top actions */}
      <div className="col-span-full flex justify-center gap-6 mb-4 pt-10">
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

      {/* Grid de navigare */}
      <section className="px-6 mb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
          {/* Dacă ai rute React pentru aceste pagini, înlocuiește <a> cu <Link to="..."> */}
          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-purple-600 to-purple-800"
            href="/elev/teste-platforma"
          >
            📝 Teste Platformă
          </a>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-purple-600 to-purple-800"
            href="/elev/teste-comper"
          >
            📚 Teste Comper
          </a>

          <Link
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-rose-500 to-rose-700"
            to="/elev/teste-primite"
          >
            📥 Teste de la profesor
          </Link>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-cyan-600 to-cyan-800"
            href="/elev/rapoarte"
          >
            📂 Portofoliu
          </a>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-emerald-500 to-emerald-700"
            href="/elev/diplome"
          >
            🎖 Diplome și Certificate Comper
          </a>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-amber-500 to-amber-700"
            href="/elev/calendar"
          >
            📅 Calendar
          </a>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-fuchsia-600 to-fuchsia-800"
            href="/elev/profil"
          >
            👤 Profil
          </a>

          <a
            className="py-8 px-6 w-full text-white font-bold text-center rounded-3xl shadow-xl transition hover:scale-[1.03] duration-300 bg-gradient-to-br from-indigo-500 to-indigo-700"
            href="/elev/profil-parinte"
          >
            👨‍👩‍👧 Profil Părinte
          </a>
        </div>
      </section>

      <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex justify-center">
        💪 Continuă să înveți, viitorul e al tău!
      </h2>

      {/* Carduri */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Progres */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-2xl shadow w-full h-full max-w-sm flex flex-col justify-center">
            <h2 className="text-lg font-bold text-blue-900">📊 Progresul tău</h2>
            <div className="w-full bg-blue-200 rounded-full h-4 mt-2">
              <div
                className="bg-blue-600 h-4 rounded-full text-xs text-white text-center transition-all duration-300"
                style={{ width: `${progress}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                {progress}%
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {nrFinalizate > 0
                ? `Ai finalizat ${nrFinalizate} test(e) din 10.`
                : "Primul test îți va deschide drumul."}
            </p>
          </div>
        </div>

        {/* Imagine */}
        <div className="text-center">
          <img
            alt="Elev concentrat la laptop"
            className="mx-auto rounded-3xl shadow-xl w-full max-w-xs"
            src="/assets/img/realistic_elev_laptop_acasa.png"
          />
        </div>

        {/* Ultimul test */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-2xl shadow w-full h-full max-w-sm flex flex-col justify-center">
            <h2 className="text-lg font-bold text-green-900">✅ Ultimul test finalizat</h2>
            <div className="mt-4 text-left space-y-2 text-sm text-fuchsia-900">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-fuchsia-700 font-semibold">
                  🧾 Test finalizat:
                </span>
                <span className="block font-semibold italic" id="lastTestSubject">
                  {lastTest.name}
                </span>
                <span className="block text-sm text-green-800 font-medium" id="lastTestScore">
                  {lastTest.score !== "-" ? `🎯 Scor obținut: ${lastTest.score}%` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

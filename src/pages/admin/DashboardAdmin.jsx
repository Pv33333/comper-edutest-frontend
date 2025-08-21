import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("rol_autentificat");
    localStorage.removeItem("utilizator_autentificat");
    navigate("/autentificare/login");
  };

  const resetDatePlatforma = () => {
    const cont = localStorage.getItem("utilizator_autentificat");
    const rol = sessionStorage.getItem("rol_autentificat");

    localStorage.clear();
    sessionStorage.clear();

    if (cont) localStorage.setItem("utilizator_autentificat", cont);
    if (rol) sessionStorage.setItem("rol_autentificat", rol);

    alert("Datele platformei au fost resetate. Contul a fost păstrat.");
    window.location.reload();
  };

  return (
    <div className="text-gray-900 min-h-screen">
      {/* Header + Acțiuni */}
      <div className="col-span-full flex justify-center gap-6 mt-10 mb-6">
        <Link
          to="/"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          🏠 Acasă
        </Link>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold rounded-xl shadow transition flex items-center gap-2"
          onClick={logout}
        >
          🚪 Ieși din cont
        </button>
      </div>

      <main className="max-w-6xl mx-auto py-12 px-4 space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">🛠️ Dashboard Admin</h1>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white text-xl font-semibold text-center">
          <Link
            to="/admin/utilizatori"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-blue-500"
          >
            👥 Gestionare Utilizatori
          </Link>
          <Link
            to="/admin/teste"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-emerald-500"
          >
            🧪 Administrare Teste
          </Link>
          <Link
            to="/admin/statistici"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-red-500"
          >
            📊 Statistici
          </Link>
          <Link
            to="/admin/loguri"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-yellow-500"
          >
            📜 Loguri Acțiuni
          </Link>
          <Link
            to="/admin/administrare-platforma"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-fuchsia-500"
          >
            📂 Administrare Platformă
          </Link>
          <Link
            to="/admin/setari-platforma"
            className="text-white font-semibold text-xl text-center p-8 rounded-2xl shadow-md hover:opacity-90 transition bg-gray-700"
          >
            ⚙️ Setări Platformă
          </Link>
        </section>

        <div className="text-center mt-12">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow font-semibold transition"
            onClick={resetDatePlatforma}
          >
            ♻️ Resetare Date Platformă
          </button>
        </div>
      </main>
    </div>
  );
}


import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DashboardProfesor = () => {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("rol_autentificat");
    localStorage.removeItem("utilizator_autentificat");
    navigate("/autentificare/login");
  };

  return (
    <div className="bg-gray-50 text-blue-900 font-sans">
      <div id="header-container" />
      <div className="col-span-full flex justify-center gap-6 mb-4 mt-10">
        <Link
          to="/homepage"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          🏠 Acasă
        </Link>
        <button
          onClick={logout}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold rounded-xl shadow transition flex items-center gap-2"
        >
          🚪 Ieși din cont
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-8">
        <Link
          to="/profesor/calendar"
          className="block p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-xl hover:scale-[1.02] transition text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800">📅 Calendar activitate</h2>
          <p className="text-base text-gray-700">Testări programate și activități viitoare.</p>
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-blue-800 mb-6 flex justify-center">
        🎯 Creează teste care inspiră și susțin performanța!
      </h2>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col gap-6">
          <LinkCard to="/profesor/profil" title="👤 Profilul meu" desc="Datele tale ca profesor." />
          <LinkCard to="/profesor/creare-test" title="📝 Creează un test" desc="Inițiază un test nou pentru elevi sau platformă." color="green" />
          <LinkCard to="/profesor/teste-profesor" title="📂 Testele mele" desc="Gestionează testele deja construite." />
          <LinkCard to="/profesor/teste-platforma" title="🌐 Teste Platformă" desc="Toate testele validate din platformă." />
          <LinkCard to="/profesor/teste-comper" title="📚 Teste COMPER" desc="Accesează testele oficiale Comper pentru toate clasele." color="yellow" />
        </div>

        <div className="text-center">
          <img
            alt="Profesor motivant"
            className="mx-auto rounded-3xl shadow-xl w-full max-w-xs"
            src="/assets/img/profesor_motivant.png"
          />
        </div>

        <div className="flex flex-col gap-6">
          <LinkCard to="/profesor/rezultate" title="📈 Rezultate Elevi" desc="Selectează elevul și vezi scorurile individuale la teste." color="pink" />
          <LinkCard to="/profesor/elevi" title="👥 Gestionează Elevi" desc="Adaugă, modifică și organizează elevii și clasele." />
          <LinkCard to="/profesor/rapoarte" title="📊 Rapoarte testare" desc="Vizualizează rezultatele și analizează performanța." color="indigo" />
          <LinkCard to="/profesor/adeverinta" title="📄 Adeverință" desc="Descarcă adeverința oficială în format PDF." color="lime" />
        </div>
      </div>
      <div id="footer-container" />
    </div>
  );
};

const LinkCard = ({ to, title, desc, color }) => {
  const colors = {
    green: "from-green-100 to-green-200 text-green-900",
    yellow: "from-yellow-100 to-yellow-200 text-yellow-900",
    pink: "from-pink-100 to-pink-200",
    indigo: "from-indigo-100 to-indigo-200",
    lime: "from-lime-100 to-lime-200",
    default: "from-blue-100 to-blue-200 text-blue-900",
  };
  const style = colors[color] || colors.default;

  return (
    <Link
      to={to}
      className={`p-6 bg-gradient-to-br ${style} rounded-2xl shadow text-center`}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-700">{desc}</p>
    </Link>
  );
};

export default DashboardProfesor;

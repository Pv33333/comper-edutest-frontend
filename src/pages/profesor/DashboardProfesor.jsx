
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, FilePlus2, FolderOpen, FileText, Calendar, TrendingUp, Users2, BarChart3, FileBadge2, Home } from "lucide-react";

const HOME_PATH = "/";

const DashboardProfesor = () => {
  const navigate = useNavigate();

  const logout = () => {
    try {
      sessionStorage.removeItem("rol_autentificat");
      localStorage.removeItem("utilizator_autentificat");
    } catch {}
    navigate(HOME_PATH, { replace: true });
    setTimeout(() => {
      if (window?.location?.pathname !== HOME_PATH) {
        window.location.assign(HOME_PATH);
      }
    }, 10);
  };

  return (
    <div className="min-h-screen w-full text-blue-900 font-sans bg-gradient-to-b from-indigo-50 via-white to-white overflow-x-hidden">
      {/* Butoane sus */}
      <div className="flex justify-center gap-8 py-10">
        <Link
          to={HOME_PATH}
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          <Home size={18}/> Acasă
        </Link>
        <button
          onClick={logout}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold rounded-xl shadow transition flex items-center gap-2"
        >
          🚪 Ieși din cont
        </button>
      </div>

      {/* Grilă: 5 carduri stânga – imagine centru – 5 carduri dreapta */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,360px)_1fr] gap-8 items-center">
        {/* Stânga: 5 carduri */}
        <div className="flex flex-col gap-8 order-2 lg:order-1">
          <LinkCard to="/profesor/profil" title="Profilul meu" desc="Datele tale ca profesor." from="from-blue-100" toC="to-blue-200" Icon={User} iconStroke="stroke-blue-600" />
          <LinkCard to="/profesor/creare-test" title="Creează un test" desc="Inițiază un test nou pentru elevi sau platformă." from="from-green-100" toC="to-green-200" Icon={FilePlus2} iconStroke="stroke-emerald-600" />
          <LinkCard to="/profesor/teste-profesor" title="Testele mele" desc="Gestionează testele deja construite." from="from-blue-100" toC="to-blue-200" Icon={FolderOpen} iconStroke="stroke-blue-600" />
          <LinkCard to="/profesor/teste-platforma" title="Teste Platformă" desc="Toate testele validate din platformă." from="from-violet-100" toC="to-violet-200" Icon={FileText} iconStroke="stroke-violet-600" />
          <LinkCard to="/profesor/teste-comper" title="Teste COMPER" desc="Accesează testele oficiale Comper" from="from-yellow-100" toC="to-yellow-200" Icon={FileText} iconStroke="stroke-violet-600" />
        </div>

        {/* Imagine centru cu text */}
        <div className="order-1 lg:order-2 flex items-center justify-center">
          <div className="w-full max-w-[360px] min-w-[320px] rounded-[1.4rem] shadow-xl bg-white/70 backdrop-blur p-5 ring-1 ring-black/5">
            <img
              alt="Profesor motivant"
              className="block rounded-2xl w-full h-auto object-cover"
              src="/assets/img/profesor_motivant.png"
            />
            <h2 className="text-xl font-semibold text-blue-900 text-center mt-4">
              🎯 Creează teste care inspiră și susțin performanța!
            </h2>
          </div>
        </div>

        {/* Dreapta: 5 carduri (Calendar primul sus) */}
        <div className="flex flex-col gap-8 order-3">
          <LinkCard to="/profesor/calendar" title="Calendar activitate" desc="Testări programate și activități viitoare." from="from-purple-100" toC="to-purple-200" Icon={Calendar} iconStroke="stroke-purple-600" />
          <LinkCard to="/profesor/rezultate" title="Rezultate Elevi" desc="Scorurile individuale ale elevilor" from="from-pink-100" toC="to-pink-200" Icon={TrendingUp} iconStroke="stroke-pink-600" />
          <LinkCard to="/profesor/elevi" title="Gestionează Elevi" desc="Gestionează elevii și clasele" from="from-blue-100" toC="to-blue-200" Icon={Users2} iconStroke="stroke-cyan-600" />
          <LinkCard to="/profesor/rapoarte" title="Rapoarte testare" desc="Analizează rezultatele testelor" from="from-indigo-100" toC="to-indigo-200" Icon={BarChart3} iconStroke="stroke-indigo-600" />
          <LinkCard to="/profesor/adeverinta" title="Adeverință" desc="Descarcă adeverința oficială" from="from-lime-100" toC="to-lime-200" Icon={FileBadge2} iconStroke="stroke-lime-600" />
        </div>
      </div>
    </div>
  );
};

/* LinkCard identic ca la elev (icon stânga + text centru, dimensiuni uniforme) */
const LinkCard = ({ to, title, desc, from, toC, Icon, iconStroke }) => (
  <Link
    to={to}
    className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${toC} shadow hover:shadow-lg transition ring-1 ring-black/5`}
  >
    <div className="h-[110px] px-6 py-5 flex items-center gap-4">
      {Icon && (
        <div className="shrink-0 rounded-xl bg-white/30 p-2.5 ring-1 ring-black/5">
          <Icon size={24} className={iconStroke} />
        </div>
      )}
      <div className="text-center w-full leading-tight select-none">
        <h3 className="text-lg font-bold tracking-normal text-blue-900">{title}</h3>
        <p className="text-[14px] font-medium text-gray-700 line-clamp-1 truncate tracking-wide">{desc}</p>
      </div>
    </div>
  </Link>
);

export default DashboardProfesor;

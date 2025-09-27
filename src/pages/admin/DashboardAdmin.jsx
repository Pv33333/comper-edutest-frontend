import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersRound,
  FlaskConical,
  BarChart3,
  FileText,
  FolderKanban,
  Settings,
  Home,
} from "lucide-react";

const HOME_PATH = "/";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("utilizator_autentificat");
    localStorage.removeItem("rol_autentificat");
    navigate("/autentificare/login");
  };

  return (
    <div className="relative min-h-screen w-full text-gray-900 font-sans bg-gradient-to-b from-slate-50 via-white to-slate-100 overflow-x-hidden overflow-hidden">
      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-blue-700/20 to-indigo-700/20 blur-3xl"
          animate={{ x: [0, 20, -15, 0], y: [0, 10, -20, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"
          animate={{ x: [0, -20, 15, 0], y: [0, -10, 20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        />
      </div>

      {/* Top actions */}
      <div className="relative flex justify-center gap-8 py-8">
        <Link
          to={HOME_PATH}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow transition inline-flex items-center gap-2"
          title="Acasă"
        >
          <Home size={18} /> Acasă
        </Link>
        <button
          onClick={logout}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2 text-sm font-semibold rounded-xl shadow transition inline-flex items-center gap-2"
          title="Delogare"
        >
          🚪 Ieși din cont
        </button>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-20">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-900 to-cyan-700 text-center mb-12">
          🛠️ Dashboard Admin
        </h1>

        {/* Grid of actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LinkCard
            to="/admin/utilizatori"
            title="Gestionare Utilizatori"
            desc="Administrare completă a conturilor."
            from="from-blue-800"
            toC="to-indigo-900"
            Icon={UsersRound}
            iconStroke="stroke-blue-200"
          />
          <LinkCard
            to="/admin/teste"
            title="Administrare Teste"
            desc="Creează, editează și organizează testele."
            from="from-cyan-600"
            toC="to-cyan-700"
            Icon={FlaskConical}
            iconStroke="stroke-cyan-200"
          />
          <LinkCard
            to="/admin/statistici"
            title="Statistici"
            desc="Monitorizează date și rapoarte."
            from="from-amber-600"
            toC="to-amber-700"
            Icon={BarChart3}
            iconStroke="stroke-amber-200"
          />
          <LinkCard
            to="/admin/loguri"
            title="Loguri Acțiuni"
            desc="Urmărește acțiunile din platformă."
            from="from-rose-600"
            toC="to-rose-700"
            Icon={FileText}
            iconStroke="stroke-rose-200"
          />
          <LinkCard
            to="/admin/administrare-platforma"
            title="Administrare Platformă"
            desc="Controlează structura aplicației."
            from="from-violet-600"
            toC="to-indigo-700"
            Icon={FolderKanban}
            iconStroke="stroke-violet-200"
          />
          <LinkCard
            to="/admin/setari-platforma"
            title="Setări Platformă"
            desc="Personalizează configurările globale."
            from="from-slate-700"
            toC="to-slate-900"
            Icon={Settings}
            iconStroke="stroke-slate-200"
          />
        </div>
      </main>
    </div>
  );
}

/* --- Components --- */

const LinkCard = ({ to, title, desc, from, toC, Icon, iconStroke }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 320, damping: 22 }}
  >
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${toC} text-white shadow-lg ring-1 ring-white/10 hover:ring-white/20 hover:shadow-2xl transition`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
        aria-hidden="true"
      >
        <div className="absolute -inset-16 bg-white/10 blur-3xl" />
      </div>
      <div className="h-[120px] px-6 py-5 flex items-center gap-6">
        {Icon && (
          <div className="shrink-0 rounded-xl bg-white/15 p-2.5 backdrop-blur ring-1 ring-white/20">
            <Icon
              size={28}
              className={`w-7 h-7 ${iconStroke}`}
              strokeWidth={2.5}
            />
          </div>
        )}
        <div className="text-center w-full leading-tight select-none">
          <h3 className="text-lg font-bold tracking-normal text-white drop-shadow-sm">
            {title}
          </h3>
          <p className="text-[14px] font-medium text-blue-100 line-clamp-1 tracking-wide truncate">
            {desc}
          </p>
        </div>
      </div>
    </Link>
  </motion.div>
);

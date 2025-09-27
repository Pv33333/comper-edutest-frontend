import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  UserCircle,
  UsersRound,
  BarChart3,
  FolderKanban,
  CalendarDays,
  Home,
} from "lucide-react";

/** Ruta corectă spre homepage */
const HOME_PATH = "/";

export default function DashboardParinte() {
  const navigate = useNavigate();
  const [numarTesteFinalizate, setNumarTesteFinalizate] = useState(0);

  useEffect(() => {
    try {
      const finalizate = JSON.parse(localStorage.getItem("finalizate") || "[]");
      if (Array.isArray(finalizate)) setNumarTesteFinalizate(finalizate.length);
    } catch {}
  }, []);

  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("utilizator_autentificat");
    localStorage.removeItem("rol_autentificat");
    navigate(HOME_PATH, { replace: true });
    setTimeout(() => {
      if (window?.location?.pathname !== HOME_PATH) {
        window.location.assign(HOME_PATH);
      }
    }, 10);
  };

  return (
    <div className="relative min-h-screen w-full text-blue-900 font-sans bg-gradient-to-b from-emerald-50 via-white to-white overflow-x-hidden overflow-hidden">
      {/* Subtle blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, 10, -15, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl"
          animate={{ x: [0, -20, 10, 0], y: [0, -10, 15, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        />
      </div>

      {/* Top actions */}
      <div className="relative flex justify-center gap-8 py-8">
        <Link
          to={HOME_PATH}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow transition inline-flex items-center gap-2"
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
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,360px)_1fr] gap-8 items-center">
        {/* Left column */}
        <div className="grid grid-cols-1 gap-8 order-2 lg:order-1">
          <LinkCard
            to="/parinte/profil"
            title="Profil părinte"
            desc="Datele și preferințele tale."
            from="from-emerald-600"
            toC="to-emerald-700"
            Icon={UserCircle}
            iconStroke="stroke-emerald-200"
          />
          <LinkCard
            to="/parinte/profil-copil"
            title="Profil copil"
            desc="Informații despre copilul tău."
            from="from-teal-600"
            toC="to-teal-700"
            Icon={UsersRound}
            iconStroke="stroke-teal-200"
          />
        </div>

        {/* Center image */}
        <div className="order-1 lg:order-2 flex items-start justify-center">
          <motion.div
            className="w-full max-w-[380px] min-w-[320px] rounded-[1.4rem] shadow-xl bg-white/70 backdrop-blur p-5 ring-1 ring-black/5"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <img
              alt="Părinte implicat"
              className="block rounded-2xl w-full h-auto object-cover"
              src="/assets/img/parinte_implicat.png"
            />
            <h2 className="text-xl font-semibold text-emerald-900 text-center mt-4">
              Fii alături de copilul tău în călătoria educațională!
            </h2>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="grid grid-cols-1 gap-8 order-3">
          <LinkCard
            to="/parinte/rapoarte"
            title="Rapoarte de progres"
            desc="Rezultate și evoluție completă."
            from="from-indigo-600"
            toC="to-indigo-700"
            Icon={BarChart3}
            iconStroke="stroke-indigo-200"
          />
          <LinkCard
            to="/parinte/teste-finalizate"
            title="Teste finalizate"
            desc={`${numarTesteFinalizate} teste completate`}
            from="from-amber-600"
            toC="to-amber-700"
            Icon={FolderKanban}
            iconStroke="stroke-amber-200"
            counter={numarTesteFinalizate}
          />
          <LinkCard
            to="/parinte/calendar"
            title="Calendar activitate"
            desc="Programări și activități viitoare."
            from="from-cyan-600"
            toC="to-cyan-700"
            Icon={CalendarDays}
            iconStroke="stroke-cyan-200"
          />
        </div>
      </div>
    </div>
  );
}

/* --- Components --- */

const LinkCard = ({
  to,
  title,
  desc,
  from,
  toC,
  Icon,
  iconStroke,
  counter,
}) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
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
      <div className="h-[110px] px-6 py-5 flex items-center gap-6">
        {Icon && (
          <div className="shrink-0 rounded-xl bg-white/15 p-2.5 backdrop-blur ring-1 ring-white/20">
            <Icon
              size={24}
              className={`w-6 h-6 ${iconStroke}`}
              strokeWidth={2.5}
            />
          </div>
        )}
        <div className="text-center w-full leading-tight select-none">
          <h3 className="text-lg font-bold tracking-normal text-white drop-shadow-sm">
            {title}
          </h3>
          <p className="text-[14px] font-medium text-blue-100 line-clamp-1 tracking-wide truncate">
            {counter !== undefined ? (
              <AnimatedCounter value={counter} suffix=" teste" />
            ) : (
              desc
            )}
          </p>
        </div>
      </div>
    </Link>
  </motion.div>
);

const AnimatedCounter = ({ value = 0, suffix = "", className = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const to = value;
    const dur = 900;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={`tabular-nums font-semibold ${className}`}>
      {display}
      {suffix}
    </span>
  );
};

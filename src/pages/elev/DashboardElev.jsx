
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { FileText, BookOpen, MailOpen, FolderKanban, Award, CalendarDays, UserCircle, UsersRound, Home, Sparkles } from "lucide-react";

/** Ruta corectă spre homepage este "/" */
const HOME_PATH = "/";

export default function DashboardElev() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [nrFinalizate, setNrFinalizate] = useState(0);
  const [lastTest, setLastTest] = useState({ name: "–", score: "-" });

  // Global gradient to avoid white stripe near footer
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const gradient =
      "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 45%, rgba(224,231,255,0.85) 100%), linear-gradient(to bottom, #eef2ff 0%, #eef2ff 30%, #e0e7ff 100%)";
    html.style.background = gradient;
    body.style.background = "transparent";
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
    };
  }, []);

  const logout = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem("utilizator_autentificat");
      localStorage.removeItem("rol_autentificat");
    } catch {}
    navigate(HOME_PATH, { replace: true });
    setTimeout(() => {
      if (window?.location?.pathname !== HOME_PATH) {
        window.location.assign(HOME_PATH);
      }
    }, 10);
  };

  useEffect(() => {
    const finalizate = JSON.parse(localStorage.getItem("finalizate") || "[]");
    const total = 10;
    const nr = Array.isArray(finalizate) ? finalizate.length : 0;
    setNrFinalizate(nr);
    setProgress(Math.min(Math.round((nr / total) * 100), 100));

    const rapoarte = JSON.parse(localStorage.getItem("rapoarte") || "{}");
    if (nr > 0) {
      const ultimId = finalizate[finalizate.length - 1];
      const scor = rapoarte[ultimId] ?? "-";
      setLastTest({ name: ultimId, score: scor });
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full text-blue-900 font-sans bg-gradient-to-b from-indigo-50 via-white to-white overflow-x-hidden overflow-hidden">
      {/* Subtle blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, 10, -15, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/15 blur-3xl"
          animate={{ x: [0, -20, 10, 0], y: [0, -10, 15, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        />
      </div>

      {/* Top actions */}
      <div className="relative flex justify-center gap-8 py-8">
        <Link
          to={HOME_PATH}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow transition inline-flex items-center gap-2"
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

      {/* Premium stats row (wider, smaller height, reveal on view) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProgressCard progress={progress} nrFinalizate={nrFinalizate} />
        <LastTestCard lastTest={lastTest} />
      </div>

      {/* Wider side cards + centered image with equal spacing */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,360px)_1fr] gap-8 items-center">
        {/* Left column (wider cards) */}
        <div className="grid grid-cols-1 gap-8 order-2 lg:order-1">
          <LinkCard to="/elev/teste-platforma" title="Teste Platformă" desc="Teste pregătite — pornește imediat." from="from-blue-600" toC="to-blue-700" Icon={FileText} iconStroke="stroke-sky-200" />
          <LinkCard to="/elev/teste-comper" title="Teste COMPER" desc="Testele oficiale COMPER" from="from-violet-600" toC="to-indigo-700" Icon={BookOpen} iconStroke="stroke-violet-200" />
          <LinkCard to="/elev/teste-primite" title="Teste de la profesor" desc="Teste trimise de profesorul tău" from="from-rose-600" toC="to-rose-700" Icon={MailOpen} iconStroke="stroke-rose-200" />
          <LinkCard to="/elev/rapoarte" title="Portofoliu" desc="Rapoarte, scoruri și diplome organizate." from="from-cyan-600" toC="to-cyan-700" Icon={FolderKanban} iconStroke="stroke-cyan-200" />
        </div>

        {/* Center image with equal padding */}
        <div className="order-1 lg:order-2 flex items-start justify-center">
          <motion.div
            className="w-full max-w-[380px] min-w-[320px] rounded-[1.4rem] shadow-xl bg-white/70 backdrop-blur p-5 ring-1 ring-black/5"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <img
              alt="Elev la laptop concentrat"
              className="block rounded-2xl w-full h-auto object-cover"
              src="/assets/img/realistic_elev_laptop_acasa.png"
            />
            <h2 className="text-xl font-semibold text-blue-900 text-center mt-4">
              Continuă să înveți — viitorul e al tău!
            </h2>
          </motion.div>
        </div>

        {/* Right column (wider cards) */}
        <div className="grid grid-cols-1 gap-8 order-3">
          <LinkCard to="/elev/diplome" title="Diplome" desc="Toate diplomele și certificatele tale." from="from-emerald-600" toC="to-emerald-700" Icon={Award} iconStroke="stroke-emerald-200" />
          <LinkCard to="/elev/calendar" title="Calendar" desc="Programări și evenimentele tale viitoare." from="from-amber-600" toC="to-amber-700" Icon={CalendarDays} iconStroke="stroke-amber-200" />
          <LinkCard to="/elev/profil" title="Profil" desc="Datele de cont și preferințele tale." from="from-fuchsia-600" toC="to-fuchsia-700" Icon={UserCircle} iconStroke="stroke-fuchsia-200" />
          <LinkCard to="/elev/profil-parinte" title="Profil părinte" desc="Acces părinte și setări dedicate." from="from-indigo-600" toC="to-indigo-700" Icon={UsersRound} iconStroke="stroke-indigo-200" />
        </div>
      </div>
    </div>
  );
}

/* --- Components --- */

const ProgressCard = ({ progress, nrFinalizate }) => {
  const percent = Math.max(0, Math.min(progress, 100));
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-white/60 p-5"
    >
      {/* Animated border glow (thin) */}
      <motion.div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl ring-1 ring-transparent"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, rgba(59,130,246,0.22), rgba(99,102,241,0.22), rgba(236,72,153,0.22), rgba(59,130,246,0.22))",
          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      <h2 className="text-lg font-extrabold text-blue-900 text-center tracking-tight">
        📊 Progres
      </h2>
      <div className="mt-4">
        <div className="relative w-full h-3.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 overflow-hidden ring-1 ring-blue-200/60">
          {/* Subtle moving stripes */}
          <motion.div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(59,130,246,0.35) 0, rgba(59,130,246,0.35) 10px, rgba(99,102,241,0.35) 10px, rgba(99,102,241,0.35) 20px)",
            }}
            animate={{ x: ["0%", "20%"] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          />
          {/* Fill */}
          <motion.div
            className="relative h-full bg-gradient-to-r from-blue-600 to-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          {/* Floating dot showing live percent */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow ring-2 ring-blue-600"
            style={{ left: `calc(${percent}% - 8px)` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            title={`${percent}%`}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
          <span>Finalizate</span>
          <AnimatedCounter value={percent} suffix="%" />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">
          {nrFinalizate} / 10 teste parcurse
        </p>
      </div>
    </motion.div>
  );
};

const LastTestCard = ({ lastTest }) => {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, [-50, 50], [6, -6]);
  const rotateY = useTransform(tiltX, [-50, 50], [-6, 6]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    tiltX.set(x);
    tiltY.set(y);
  };

  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      style={{ rotateX, rotateY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-white/60 p-5 will-change-transform"
    >
      <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-700 to-teal-600 text-center tracking-tight">
        ✅ Ultimul test
      </h2>
      <div className="mx-auto mt-2 h-[2px] w-24 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 rounded-full" />

      <div className="mt-5 text-center space-y-3 text-sm">
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-fuchsia-700 font-semibold">
          <Sparkles size={14} /> Test
        </span>
        <motion.span
          className="block font-semibold tracking-wide text-base text-gray-800"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring" }}
        >
          {lastTest.name}
        </motion.span>
        {lastTest.score !== "-" && (
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-green-900 text-sm px-3 py-1 font-semibold ring-1 ring-emerald-200/60"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring" }}
          >
            🎯 Scor: <AnimatedCounter className="ml-1" value={Number(lastTest.score) || 0} suffix="%" />
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

/** Animated number counter with smooth easing */
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
  return <span className={`tabular-nums font-semibold ${className}`}>{display}{suffix}</span>;
};

const LinkCard = ({ to, title, desc, from, toC, Icon, iconStroke }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 320, damping: 22 }}
  >
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${toC} text-white shadow-lg ring-1 ring-white/10 hover:ring-white/20 hover:shadow-2xl transition`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition" aria-hidden="true">
        <div className="absolute -inset-16 bg-white/10 blur-3xl" />
      </div>
      <div className="h-[110px] px-6 py-5 flex items-center gap-8">
        {Icon && (
          <div className="shrink-0 rounded-xl bg-white/15 p-2.5 backdrop-blur ring-1 ring-white/20">
            <Icon size={24} className={`w-6 h-6 ${iconStroke}`} strokeWidth={2.5} />
          </div>
        )}
        <div className="text-center w-full leading-tight select-none">
          <h3 className="text-lg font-bold tracking-normal text-white drop-shadow-sm">{title}</h3>
          <p className="text-[14px] font-medium text-blue-100 line-clamp-1 tracking-wide truncate">{desc}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

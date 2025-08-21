
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/** Injectează Chart.js din CDN, apoi returnează window.Chart când e gata */
function useChartJs() {
  const [ready, setReady] = useState(!!window.Chart);
  useEffect(() => {
    if (window.Chart) { setReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js";
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => console.error("Chart.js nu s-a încărcat");
    document.head.appendChild(s);
  }, []);
  return ready ? window.Chart : null;
}

/** Canvas simplu pentru Chart.js (fără alte dependențe) */
function ChartCanvas({ config, height = 240, width = 240, className = "" }) {
  const Chart = useChartJs();
  const ref = useRef(null);
  const chartRef = useRef(null);

  const cfg = useMemo(() => config, [config]);

  useEffect(() => {
    if (!Chart || !ref.current) return;
    try {
      const ctx = ref.current.getContext("2d");
      chartRef.current = new Chart(ctx, cfg);
    } catch (e) {
      console.error("Chart init error:", e);
    }
    return () => {
      try { chartRef.current?.destroy(); } catch {}
      chartRef.current = null;
    };
  }, [Chart, cfg]);

  return <canvas ref={ref} height={height} width={width} className={className} />;
}

export default function Homepage() {
  const [showDetails, setShowDetails] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [cookieOk, setCookieOk] = useState(
    typeof window !== "undefined" && localStorage.getItem("cookieAccepted") === "true"
  );

  // ===== Modal Stats =====
  const [modal, setModal] = useState({
    open: false, title: "", labels: [], data: [], colors: []
  });
  const openChart = (title, labels, data, colors) =>
    setModal({ open: true, title, labels, data, colors });
  const closeChart = () => setModal((m) => ({ ...m, open: false }));

  // ===== Cookie banner =====
  const acceptCookies = () => {
    localStorage.setItem("cookieAccepted", "true");
    setCookieOk(true);
  };

  return (
    <div className="bg-white text-gray-800">
      {/* ===== Modal ===== */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl relative">
            <button
              onClick={closeChart}
              className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2 absolute right-4 top-4"
              aria-label="Închide"
            >
              ×
            </button>
            <h3 className="text-xl font-medium text-gray-800 mb-4">{modal.title}</h3>
            <ChartCanvas
              height={220}
              width={420}
              config={{
                type: "bar",
                data: {
                  labels: modal.labels,
                  datasets: [
                    {
                      label: modal.title,
                      data: modal.data,
                      backgroundColor: modal.colors,
                      borderRadius: 6
                    }
                  ]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
              }}
            />
          </div>
        </div>
      )}

      {/* ===== Hero FULLSCREEN ===== */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          alt="Imagine copil Comper Educa Premium"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          src="/assets/hero_comper_educa_premium.png"
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-6 text-center">
         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]">
  🎓 Transformăm testarea în progres real
</h1>

<p className="text-lg md:text-xl lg:text-2xl max-w-2xl mb-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
  Platforma inteligentă care oferă elevilor încredere, părinților vizibilitate și profesorilor control educațional.
</p>

          {/* Vezi Teste Demo */}
          <Link
            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 transition rounded-xl text-white font-semibold shadow-lg"
            to="/demo-teste"
          >
            Vezi Teste Demo
          </Link>

          {/* Butonul de Înregistrare */}
          <Link
            to="/autentificare/inregistrare"
            className="inline-block mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold shadow-lg"
          >
            Înregistrează-te acum
          </Link>
        </div>
      </section>

      {/* ===== Roles Section ===== */}
      <section className="bg-[#F9E588]/60 px-10 py-24 text-center">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-blue-800 mb-6">Pentru fiecare rol educațional</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <Link
            className="group block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white relative h-[420px] no-underline"
            to="/autentificare/login?rol=elev"
          >
            <img alt="Elev" className="absolute inset-0 w-full h-full object-cover object-center z-0" src="/assets/realistic_elev_la_laptop.png" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition duration-300 z-10"></div>
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <h3 className="text-3xl font-bold text-white drop-shadow-xl tracking-wide">Elev</h3>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-white/90 text-gray-800 text-base leading-relaxed px-6 py-4 rounded-xl shadow z-30 w-80 text-center">
              Accesează teste interactive, primește feedback instant și urmărește-ți progresul în timp real.
            </div>
          </Link>

          <Link
            className="group block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white relative h-[420px] no-underline"
            to="/autentificare/login?rol=parinte"
          >
            <img alt="Părinte" className="absolute inset-0 w-full h-full object-cover object-center z-0" src="/assets/realistic_parinte_cu_test_bifat.png" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition duration-300 z-10"></div>
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <h3 className="text-3xl font-bold text-white drop-shadow-xl tracking-wide">Părinte</h3>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-white/90 text-gray-800 text-base leading-relaxed px-6 py-4 rounded-xl shadow z-30 w-80 text-center">
              Monitorizează evoluția copilului, vizualizează rapoarte detaliate și implică-te activ în parcursul său educațional.
            </div>
          </Link>

          <Link
            className="group block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white relative h-[420px] no-underline"
            to="/autentificare/login?rol=profesor"
          >
            <img alt="Profesor" className="absolute inset-0 w-full h-full object-cover object-center z-0" src="/assets/realistic_profesor_final.png" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition duration-300 z-10"></div>
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <h3 className="text-3xl font-bold text-white drop-shadow-xl tracking-wide">Profesor</h3>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-white/90 text-gray-800 text-base leading-relaxed px-6 py-4 rounded-xl shadow z-30 w-80 text-center">
              Creează teste personalizate, analizează performanțele elevilor și oferă sprijin adaptat nevoilor fiecăruia.
            </div>
          </Link>
        </div>
      </section>

      {/* ===== Statistici platformă ===== */}
      <section className="bg-white py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-blue-800 mb-6">Statistici platformă</h2>

            <div className="mt-6 w-full max-w-4xl mx-auto rounded-xl border border-gray-200 bg-white shadow p-5 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Top 5 județe după testări</h3>
              <ChartCanvas
                height={200}
                config={{
                  type: "bar",
                  data: {
                    labels: ["București", "Cluj", "Iași", "Timiș", "Brașov"],
                    datasets: [
                      {
                        label: "Testări finalizate",
                        data: [1250, 980, 870, 790, 740],
                        backgroundColor: "#2563EB",
                        borderRadius: 4
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
                  }
                }}
              />
              <div className="mt-4 text-right">
                <button
                  className="text-sm text-blue-600 hover:underline font-medium"
                  onClick={() => setShowDetails((s) => !s)}
                >
                  {showDetails ? "🔼 Închide detaliile" : "🔽 Detalii județe, orașe și școli"}
                </button>
              </div>

              {showDetails && (
                <div className="mt-4 border-t pt-4 space-y-4 text-sm text-gray-800 text-left">
                  <div>
                    <h4 className="text-blue-800 font-semibold">📍 București</h4>
                    <ul className="ml-4 list-disc">
                      <li>Sector 1 – Școala Centrală (512)</li>
                      <li>Sector 2 – Colegiul I.L. Caragiale (420)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-blue-800 font-semibold">📍 Cluj</h4>
                    <ul className="ml-4 list-disc">
                      <li>Cluj-Napoca – Liceul Avram Iancu (670)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-blue-800 font-semibold">📍 Iași</h4>
                    <ul className="ml-4 list-disc">
                      <li>Școala „Al. I. Cuza” (580)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carduri (polarArea) + click → modal bar chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 max-w-7xl mx-auto">
          {[
            {
              title: "Distribuție utilizatori",
              labels: ["Elevi", "Părinți", "Profesori"],
              data: [8230, 2100, 2128],
              colors: ["#3B82F6", "#FBBF24", "#8B5CF6"],
              onClick: () =>
                openChart(
                  "Distribuție utilizatori activi",
                  ["Elevi", "Părinți", "Profesori"],
                  [8230, 2100, 2128],
                  ["#3B82F6", "#FBBF24", "#8B5CF6"]
                )
            },
            {
              title: "Teste pe clase",
              labels: ["Clasa I", "Clasa II", "Clasa III", "Clasa IV", "V–VIII", "IX–XII"],
              data: [650, 700, 710, 680, 3200, 2290],
              colors: ["#0EA5E9", "#06B6D4", "#14B8A6", "#10B981", "#059669", "#064E3B"],
              onClick: () =>
                openChart(
                  "Elevi pe clase",
                  ["Clasa I", "Clasa II", "Clasa III", "Clasa IV", "V–VIII", "IX–XII"],
                  [650, 700, 710, 680, 3200, 2290],
                  ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#059669", "#064E3B"]
                )
            },
            {
              title: "Scoruri pe discipline",
              labels: ["Matematică", "Română", "Științe", "Engleză"],
              data: [85, 78, 81, 76],
              colors: ["#E879F9", "#8B5CF6", "#06B6D4", "#10B981"],
              onClick: () =>
                openChart(
                  "Scoruri pe discipline",
                  ["Matematică", "Română", "Științe", "Engleză"],
                  [85, 78, 81, 76],
                  ["#E879F9", "#8B5CF6", "#06B6D4", "#10B981"]
                )
            },
            {
              title: "Progres lunar",
              labels: ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun"],
              data: [5, 8, 11, 15, 19, 24],
              colors: ["#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"],
              onClick: () =>
                openChart(
                  "Progres lunar",
                  ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun"],
                  [5, 8, 11, 15, 19, 24],
                  ["#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"]
                )
            }
          ].map((c, i) => (
            <button
              key={i}
              onClick={c.onClick}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 shadow hover:shadow-2xl transition transform hover:-translate-y-1 p-5 flex flex-col items-center text-center"
            >
              <h3 className="text-xl font-medium text-gray-800 mb-4">{c.title}</h3>
              <ChartCanvas
                height={200}
                config={{
                  type: "polarArea",
                  data: { labels: c.labels, datasets: [{ data: c.data, backgroundColor: c.colors, borderWidth: 1 }] },
                  options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { r: { grid: { color: "#E5E7EB" }, ticks: { display: false } } }
                  }
                }}
              />
              <span className="mt-3 text-sm text-blue-600">Click pentru detalii</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== Teste educaționale ===== */}
      <section className="bg-white py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-blue-800 mb-6">Teste educaționale</h2>
            <p className="text-gray-700 text-base mb-8">
              Analiză vizuală a testelor disponibile, finalizate și progres în timp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 shadow p-5 flex flex-col items-center text-center">
              <h3 className="text-xl font-medium text-gray-800 mb-4">Teste pe discipline</h3>
              <ChartCanvas
                config={{
                  type: "polarArea",
                  data: {
                    labels: ["Matematică", "Română", "Engleză", "Științe", "Geografie"],
                    datasets: [
                      { data: [120, 85, 65, 40, 30], backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#6366F1", "#E879F9"] }
                    ]
                  },
                  options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { r: { ticks: { display: false }, grid: { color: "#E5E7EB" } } }
                  }
                }}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 shadow p-5 flex flex-col items-center text-center">
              <h3 className="text-xl font-medium text-gray-800 mb-4">Finalizare teste</h3>
              <ChartCanvas
                config={{
                  type: "polarArea",
                  data: {
                    labels: ["Disponibile", "Finalizate"],
                    datasets: [{ data: [320, 245], backgroundColor: ["#FBBF24", "#10B981"] }]
                  },
                  options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { r: { ticks: { display: false }, grid: { color: "#E5E7EB" } } }
                  }
                }}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 shadow p-5 flex flex-col items-center text-center">
              <h3 className="text-xl font-medium text-gray-800 mb-4">Progres lunar</h3>
              <ChartCanvas
                config={{
                  type: "line",
                  data: {
                    labels: ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun"],
                    datasets: [
                      {
                        label: "Teste finalizate",
                        data: [20, 35, 50, 65, 80, 100],
                        fill: false,
                        borderColor: "#1E3A8A",
                        backgroundColor: "#1E3A8A",
                        tension: 0.3
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: "#1E3A8A", font: { weight: "bold" } }, grid: { display: false } },
                      y: { ticks: { color: "#4B5563" }, grid: { color: "#E5E7EB" } }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Recenzii ===== */}
      <section className="px-10 bg-[#F9FAFB] relative py-24 text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">Recenzii de la utilizatori</h2>
        <div className="relative max-w-4xl mx-auto overflow-hidden">
          <div id="reviewGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: 10, nume: "Adriana T.", rol: "părinte", text: "„În doar câteva teste, copilul meu a prins curaj.”" },
              { img: 12, nume: "Mihai R.", rol: "profesor", text: "„Platforma îmi permite să personalizez testarea pentru fiecare elev.”" },
              { img: 14, nume: "Ioana D.", rol: "elev", text: "„Testele sunt clare și ușor de înțeles. Mă simt mai încrezătoare acum.”" },
              { img: 15, nume: "Daniel P.", rol: "părinte", text: "„Rapoartele săptămânale mă ajută să rămân implicat.”" },
              { img: 18, nume: "Corina M.", rol: "profesor", text: "„Excelent pentru predare diferențiată.”" },
              { img: 20, nume: "Alex V.", rol: "elev", text: "„E ca un joc — învăț fără să simt presiune.”" },
              { img: 23, nume: "Ruxandra L.", rol: "părinte", text: "„Comunicarea cu profesorii prin platformă e foarte eficientă.”" },
              { img: 24, nume: "George N.", rol: "profesor", text: "„Evaluările automate îmi economisesc timp prețios.”" },
              { img: 26, nume: "Bianca F.", rol: "elev", text: "„Am luat primul meu 10 datorită testelor Comper!”" },
              { img: 28, nume: "Tudor S.", rol: "părinte", text: "„Vă mulțumesc! Copilul meu e din nou motivat.”" }
            ].map((r, i) => {
              const hidden = !reviewsExpanded && i >= 3;
              return (
                <div key={i} className={`min-w-full px-4 ${hidden ? "hidden" : ""}`}>
                  <div className="bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-xl p-8 flex flex-col items-start">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        alt="Avatar"
                        className="w-14 h-14 rounded-full border-2 border-blue-300"
                        src={`https://i.pravatar.cc/80?img=${r.img}`}
                      />
                      <div>
                        <p className="text-gray-700 text-base">
                          {r.nume} <span className="text-sm text-gray-500">({r.rol})</span>
                        </p>
                        <div className="text-yellow-400 flex gap-1 text-sm mt-1">
                          <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-base">{r.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => setReviewsExpanded((v) => !v)}
            className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
          >
            {reviewsExpanded ? "Ascunde recenziile" : "Vezi toate recenziile"}
          </button>
        </div>
      </section>

      {/* ===== Cookie Banner ===== */}
      {!cookieOk && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-gradient-to-r from-white to-blue-50 border border-gray-200 shadow-xl rounded-2xl p-6 z-50 text-center text-gray-800">
          <h2 className="text-3xl font-semibold text-blue-800 mb-6">📢 Politica de Cookie-uri</h2>
          <p className="text-gray-700 text-base mb-8">
            Folosim cookie-uri esențiale și tehnologii similare pentru a asigura funcționalitatea optimă a platformei, pentru analize statistice și pentru personalizarea experienței tale.
            Prin continuarea navigării sau apăsarea pe „Accept”, îți exprimi acordul pentru utilizarea acestora conform{" "}
            <a className="underline text-blue-700 hover:text-blue-900" href="/politica-cookie" target="_blank" rel="noreferrer">
              Politicii noastre de confidențialitate
            </a>.
          </p>
          <div className="mt-4">
            <button onClick={acceptCookies} className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TestCard from "../../components/TestCardAdmin";

export default function AdministrarePlatforma() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Sunt folosite aceleași valori cu HTML-ul inițial
  const userData = useMemo(() => ({ elevi: 400, parinti: 400, profesori: 500 }), []);

  const [testeAdmin, setTesteAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("teste_admin")) || []; } catch { return []; }
  });
  const [testeProfesor, setTesteProfesor] = useState(() => {
    try { return JSON.parse(localStorage.getItem("teste_profesor")) || []; } catch { return []; }
  });

  // Re-randare la schimbarea localStorage (din alte pagini)
  useEffect(() => {
    const onStorage = () => {
      try {
        setTesteAdmin(JSON.parse(localStorage.getItem("teste_admin")) || []);
        setTesteProfesor(JSON.parse(localStorage.getItem("teste_profesor")) || []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totalUsers = userData.elevi + userData.parinti + userData.profesori;
  const testeActiveCount = testeAdmin.length;

  // Chart.js – se încarcă la cerere; dacă pachetul nu e instalat, nu aruncăm eroare
  useEffect(() => {
    let chart;
    (async () => {
      try {
        const Chart = (await import("chart.js/auto")).default;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Elevi", "Părinți", "Profesori"],
            datasets: [
              {
                label: "Utilizatori",
                data: [userData.elevi, userData.parinti, userData.profesori],
                backgroundColor: ["#2E5AAC", "#8faadd", "#1e4896"],
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          },
        });
      } catch (e) {
        // pachetul chart.js nu e instalat — ignorăm grațios
        // poți rula: npm i chart.js
      }
    })();
    return () => {
      if (chart) chart.destroy();
    };
  }, [userData]);

  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const handleDelete = (id, source) => {
    if (!confirm("Ștergi testul?")) return;
    if (source === "admin") {
      const upd = testeAdmin.filter((t) => t.id !== id);
      setTesteAdmin(upd);
      save("teste_admin", upd);
    } else {
      const upd = testeProfesor.filter((t) => t.id !== id);
      setTesteProfesor(upd);
      save("teste_profesor", upd);
    }
  };

  const handleValidate = (test) => {
    const valid = { ...test, validat: true, dataCreare: test.dataCreare || new Date().toISOString().slice(0, 10) };
    const adminUpd = [valid, ...testeAdmin];
    const profUpd = testeProfesor.filter((t) => t.id !== test.id);
    setTesteAdmin(adminUpd);
    setTesteProfesor(profUpd);
    save("teste_admin", adminUpd);
    save("teste_profesor", profUpd);
  };

  const handleEdit = (test, source) => {
    // Deschidem pagina de creare test cu parametrii de precompletare
    const params = new URLSearchParams({ id: String(test.id || ""), source });
    navigate(`/admin/creare-test?${params.toString()}`);
  };

  return (
    <div className="-50 text-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">⚙️ Administrare Platformă</h1>
          <Link
            to="/admin/dashboard"
            className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
          >
            ⬅ Înapoi la Dashboard Admin
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Utilizatori activi</h2>
            <p className="text-2xl text-gray-700 mt-1">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Teste active</h2>
            <p className="text-2xl text-gray-700 mt-1">{testeActiveCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Teste Profesori</h2>
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/admin/creare-test"
                className="block text-white bg-blue-600 hover:bg-blue-700 text-center py-2 px-4 rounded-xl shadow-sm"
              >
                ➕ Creează test
              </Link>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                className="block text-white bg-green-600 hover:bg-green-700 text-center py-2 px-4 rounded-xl shadow-sm"
              >
                ✅ Validează test
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribuție utilizatori</h2>
          <canvas ref={canvasRef} height={100} />
          {/* Fallback când chart.js nu e instalat */}
          <noscript>
            <div className="text-sm text-gray-500 mt-2">Activează JavaScript pentru a vedea graficul.</div>
          </noscript>
        </div>

        {/* Teste active (Admin) */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🧪 Teste active</h2>
          {testeAdmin.length === 0 ? (
            <p className="text-sm text-gray-500">Nu există teste active create/validate de admin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testeAdmin.map((t) => (
                <TestCard
                  key={t.id}
                  test={t}
                  variant="admin"
                  eticheta="Creat de admin"
                  onEdit={() => handleEdit(t, "admin")}
                  onDelete={() => handleDelete(t.id, "admin")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Teste propuse de profesori (de validat) */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📥 Teste propuse de profesori</h2>
          {testeProfesor.length === 0 ? (
            <p className="text-sm text-gray-500">Nu există teste propuse de validat.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testeProfesor.map((t) => (
                <TestCard
                  key={t.id}
                  test={t}
                  variant="admin"
                  eticheta="Propus de profesor"
                  onEdit={() => handleEdit(t, "profesor")}
                  onDelete={() => handleDelete(t.id, "profesor")}
                  onValidate={() => handleValidate(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

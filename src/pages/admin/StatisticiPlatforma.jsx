import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatisticiPlatforma() {
  const utilizatoriRef = useRef(null);
  const testeRef = useRef(null);
  const activitateRef = useRef(null);
  const [viewMode, setViewMode] = useState("all"); // all, utilizatori, teste, activitate

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Moodboard colors
  const colors = {
    primary: "#5582F6",
    success: "#1FF444",
    warning: "#F39806",
    secondary: "#DBEAFE",
    secondaryText: "#1D4ED3",
  };

  // Hardcoded data (as per HTML)
  const utilizatoriData = {
    labels: ["Elevi", "Profesori", "Părinți"],
    datasets: [
      {
        label: "Utilizatori",
        data: [120, 45, 78],
        backgroundColor: colors.primary,
        borderRadius: 6,
      },
    ],
  };

  const testeData = {
    labels: ["Luni", "Marți", "Miercuri", "Joi", "Vineri"],
    datasets: [
      {
        label: "Teste completate",
        data: [15, 20, 25, 22, 18],
        backgroundColor: colors.success,
        borderRadius: 6,
      },
    ],
  };

  const activitateData = {
    labels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    datasets: [
      {
        label: "Activitate utilizatori",
        data: [5, 12, 30, 22, 10],
        borderColor: colors.secondaryText,
        backgroundColor: colors.secondaryText,
        tension: 0.3,
      },
    ],
  };

  const showAll = () => setViewMode("all");

  return (
    <div className="-50 min-h-screen px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">📊 Statistici Platformă</h1>
        <Link
          to="/admin/dashboard"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition"
        >
          ⬅ Înapoi la Dashboard Admin
        </Link>
      </div>

      {/* KPI Cards */}
      {viewMode === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div
            onClick={() => {
              setViewMode("utilizatori");
              scrollToRef(utilizatoriRef);
            }}
            className="cursor-pointer"
          >
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow hover:bg-blue-600 transition">
              <h2 className="text-xl font-bold">Utilizatori activi</h2>
              <p className="text-3xl font-semibold">243</p>
            </div>
          </div>
          <div
            onClick={() => {
              setViewMode("teste");
              scrollToRef(testeRef);
            }}
            className="cursor-pointer"
          >
            <div className="bg-green-400 text-white p-6 rounded-lg shadow hover:bg-green-500 transition">
              <h2 className="text-xl font-bold">Teste completate</h2>
              <p className="text-3xl font-semibold">100</p>
            </div>
          </div>
          <div
            onClick={() => {
              setViewMode("teste");
              scrollToRef(testeRef);
            }}
            className="cursor-pointer"
          >
            <div className="bg-orange-400 text-white p-6 rounded-lg shadow hover:bg-orange-500 transition">
              <h2 className="text-xl font-bold">Rată completare</h2>
              <p className="text-3xl font-semibold">85%</p>
            </div>
          </div>
          <div
            onClick={() => {
              setViewMode("activitate");
              scrollToRef(activitateRef);
            }}
            className="cursor-pointer"
          >
            <div className="bg-indigo-100 text-indigo-800 p-6 rounded-lg shadow hover:bg-indigo-200 transition">
              <h2 className="text-xl font-bold">Activitate 24h</h2>
              <p className="text-3xl font-semibold">+15%</p>
            </div>
          </div>
        </div>
      )}

      {viewMode !== "all" && (
        <div className="mb-6">
          <button
            onClick={showAll}
            className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition"
          >
            ⬅ Înapoi la toate graficele
          </button>
        </div>
      )}

      {/* Utilizatori chart */}
      {(viewMode === "all" || viewMode === "utilizatori") && (
        <div ref={utilizatoriRef} className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-2xl font-bold mb-4">📈 Distribuția utilizatorilor</h3>
          <Bar data={utilizatoriData} options={{ responsive: true }} />
        </div>
      )}

      {/* Teste chart */}
      {(viewMode === "all" || viewMode === "teste") && (
        <div ref={testeRef} className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-2xl font-bold mb-4">📝 Teste completate pe zile</h3>
          <Bar data={testeData} options={{ responsive: true }} />
        </div>
      )}

      {/* Activitate chart */}
      {(viewMode === "all" || viewMode === "activitate") && (
        <div ref={activitateRef} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-4">⏱ Activitate pe ore</h3>
          <Line data={activitateData} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Small, dependency-free line chart using SVG.
 * Expects values in [0,100].
 */
function MiniLineChart({ labels = [], values = [] }) {
  const width = 720;
  const height = 240;
  const padding = { top: 16, right: 12, bottom: 28, left: 28 };

  const points = useMemo(() => {
    if (!values.length) return "";
    const n = values.length;
    const xStep = (width - padding.left - padding.right) / Math.max(n - 1, 1);
    return values
      .map((v, i) => {
        const x = padding.left + i * xStep;
        const y =
          padding.top + (height - padding.top - padding.bottom) * (1 - Math.min(Math.max(v, 0), 100) / 100);
        return `${x},${y}`;
      })
      .join(" ");
  }, [values]);

  // y axis ticks at 0, 25, 50, 75, 100
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-4xl mx-auto">
      {/* axes */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#d1d5db"
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#d1d5db"
      />
      {/* y ticks */}
      {yTicks.map((t) => {
        const y = padding.top + (height - padding.top - padding.bottom) * (1 - t / 100);
        return (
          <g key={t}>
            <line
              x1={padding.left - 4}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#f3f4f6"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {t}
            </text>
          </g>
        );
      })}
      {/* polyline */}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
        />
      )}
      {/* circles */}
      {points &&
        points.split(" ").map((p, i) => {
          const [x, y] = p.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />;
        })}
      {/* x labels */}
      {labels.map((lab, i) => {
        const n = Math.max(labels.length - 1, 1);
        const x = padding.left + (width - padding.left - padding.right) * (i / n);
        const y = height - padding.bottom + 16;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {lab}
          </text>
        );
      })}
    </svg>
  );
}

function loadJSON(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key) || "null");
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

export default function RapoarteProgres() {
  const [finalizate, setFinalizate] = useState([]);
  const [rapoarte, setRapoarte] = useState({});

  useEffect(() => {
    setFinalizate(loadJSON("finalizate", []));
    setRapoarte(loadJSON("rapoarte", {}));
  }, []);

  // Build table rows
  const rows = useMemo(() => {
    return finalizate.map((test) => {
      const scor = Number(rapoarte?.[test] ?? 0);
      const materie = test.toLowerCase().includes("mate") ? "Matematică" : "Română";
      return { test, materie, scor: isNaN(scor) ? 0 : scor };
    });
  }, [finalizate, rapoarte]);

  const labels = rows.map((r) => r.test);
  const values = rows.map((r) => r.scor);

  const medii = useMemo(() => {
    let totalMate = 0, cMate = 0, totalRo = 0, cRo = 0;
    rows.forEach(({ materie, scor }) => {
      if (materie === "Matematică") { totalMate += scor; cMate++; }
      else { totalRo += scor; cRo++; }
    });
    return {
      mate: cMate ? (totalMate / cMate).toFixed(1) + "%" : "–",
      romana: cRo ? (totalRo / cRo).toFixed(1) + "%" : "–",
    };
  }, [rows]);

  const ultimul = useMemo(() => {
    if (!rows.length) return { nume: "–", scor: "–" };
    const r = rows[rows.length - 1];
    return { nume: r.test, scor: r.scor + "%" };
  }, [rows]);

  return (
    <main className="text-[#1C3C7B] min-h-screen">
      <div className="max-w-6xl mx-auto pt-10 mb-4 px-4">
        <Link
          to="/parinte/dashboard"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </Link>
      </div>

      <section className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        {/* KPIs */}
        <h2 className="text-3xl font-semibold text-center mb-8">📈 Progres actualizat</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-xl shadow space-y-2">
            <h3 className="text-xl font-medium">📝 Ultimul Test</h3>
            <p>{ultimul.nume}</p>
            <p>{ultimul.scor}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-xl shadow space-y-2">
            <h3 className="text-xl font-medium">📘 Medie Română</h3>
            <p>{medii.romana}</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-xl shadow space-y-2">
            <h3 className="text-xl font-medium">🧮 Medie Matematică</h3>
            <p>{medii.mate}</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-xl shadow space-y-2">
            <h3 className="text-xl font-medium">📦 Teste Finalizate</h3>
            <p>{rows.length}</p>
          </div>
        </div>

        {/* Tabel evoluție */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center mb-4">📊 Evoluție Teste</h2>
          <p className="text-center text-gray-600 mb-6">
            Detalii despre scorurile obținute în testele finalizate și progresul copilului în timp.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-xl overflow-hidden">
              <thead className="bg-blue-100 text-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left">📝 Test</th>
                  <th className="px-6 py-3 text-left">📚 Materie</th>
                  <th className="px-6 py-3 text-left">📈 Scor</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {rows.map((r) => (
                  <tr key={r.test} className="border-b border-gray-200">
                    <td className="px-6 py-4">{r.test}</td>
                    <td className="px-6 py-4">{r.materie}</td>
                    <td className="px-6 py-4 font-bold text-green-700">{r.scor}%</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Nu există încă teste finalizate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grafic fără dependențe externe */}
          <div className="mt-10">
            <MiniLineChart labels={labels} values={values} />
            <p className="text-sm text-gray-500 text-center mt-4 italic">
              📉 Acest grafic reflectă evoluția scorurilor pe măsură ce copilul finalizează testele.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

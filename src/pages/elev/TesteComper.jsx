import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function TesteComperElev() {
  const [open, setOpen] = useState({});

  const cicluri = [
    { label: "Ciclul Primar", id: "Primar", clase: ["Clasa Pregătitoare","Clasa I","Clasa a II-a","Clasa a III-a","Clasa a IV-a"] },
    { label: "Ciclul Gimnazial", id: "Gimnazial", clase: ["Clasa a V-a","Clasa a VI-a","Clasa a VII-a","Clasa a VIII-a"] },
  ];

  const materii = [
    { label: "📘 Română", id: "romana", color: "blue" },
    { label: "📐 Matematică", id: "mate", color: "green" }
  ];

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  const TestCard = ({ color, label }) => (
    <div className="bg-white border-2 rounded-2xl p-4 mt-2 shadow hover:shadow-md transition">
      <h3 className={`text-lg font-semibold ${color === "blue" ? "text-blue-800" : "text-green-800"} mb-1`}>
        {label.includes("Română") ? "📘" : "📐"} Test {label} – Clasa a IV-a
      </h3>
      <p className="text-sm text-gray-600 mb-2">Etapa I – Test standardizat</p>
      <div className="flex justify-center items-center mt-4">
        <Link
          to={label.includes("Română") ? "/elev/tests/romana/clasa-iv/curent" : "/elev/tests/matematica/clasa-iv/curent"}
          className={`${color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} px-5 py-2 rounded-xl text-white text-sm font-semibold`}
        >
          Începe testul
        </Link>
      </div>
    </div>
  );

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link to="/elev/dashboard" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">📝 Teste Comper</h1>
        <div className="flex flex-col md:flex-row justify-center items-start gap-10">
          {materii.map((m) => (
            <div key={m.id} className={`bg-white shadow-xl rounded-2xl border-t-4 ${m.color === "blue" ? "border-blue-500" : "border-green-500"} p-6 w-full max-w-md text-center`}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{m.label}</h2>
              <div className="flex flex-col items-center gap-4">
                {cicluri.map((c) => (
                  <div key={c.id} className="w-full">
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium w-full"
                      onClick={() => toggle(`${m.id}-${c.id}`)}
                    >
                      {c.label}
                    </button>
                    {open[`${m.id}-${c.id}`] && (
                      <div className="flex flex-col items-center mt-4 gap-4">
                        {c.clase.map((clasa) => (
                          <div key={clasa} className="w-full">
                            <button className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition-all duration-200 hover:shadow-md mb-2">
                              {clasa}
                            </button>
                            {clasa === "Clasa a IV-a" && <TestCard color={m.color} label={m.label} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

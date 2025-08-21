import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TesteComperProfesor = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState({});

  const toggle = (id) => {
    setVisible((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clase = [
    "Clasa Pregătitoare", "Clasa I", "Clasa a II-a", "Clasa a III-a",
    "Clasa a IV-a", "Clasa a V-a", "Clasa a VI-a", "Clasa a VII-a", "Clasa a VIII-a"
  ];

  const cicluri = [
    { label: "Ciclul Primar", id: "Primar", clase: clase.slice(0, 5) },
    { label: "Ciclul Gimnazial", id: "Gimnazial", clase: clase.slice(5) },
  ];

  const materii = [
    { label: "📘 Română", id: "romana", color: "blue" },
    { label: "📐 Matematică", id: "mate", color: "green" }
  ];

  const etape = ["Etapa I", "Etapa a II-a", "Etapa Națională"];

  const trimiteTestul = (materieId, materieLabel) => {
    const test = {
      id: "test_" + Math.random().toString(36).substring(2, 10),
      titlu: `📘 Test ${materieLabel} – Clasa a IV-a`,
      link: materieId === "romana" ? "/profesor/test-preview/romana-10" : "/profesor/test-preview/mate-10",
      status: "neatribuit",
      data: new Date().toISOString(),
    };
    const lista = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
    lista.push(test);
    localStorage.setItem("teste_profesor", JSON.stringify(lista));
    navigate("/profesor/gestionare-elevi?testId=" + test.id);
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium" href="/profesor/dashboard">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>
      <main className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">📝 Teste Comper</h1>
        <div className="flex flex-col md:flex-row justify-center items-start gap-10">
          {materii.map((materie) => (
            <div key={materie.id} className={`bg-white shadow-xl rounded-2xl border-t-4 ${materie.color === "blue" ? "border-blue-500" : "border-green-500"} p-6 w-full max-w-md text-center`}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{materie.label}</h2>
              <div className="flex flex-col items-center gap-4" id={`${materie.id}Ciclu`}>
                {cicluri.map((ciclu) => (
                  <React.Fragment key={ciclu.id}>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                      onClick={() => toggle(`${materie.id}${ciclu.id}`)}
                    >
                      {ciclu.label}
                    </button>
                    {visible[`${materie.id}${ciclu.id}`] && (
                      <div className="flex flex-col items-center mt-4 gap-4">
                        {ciclu.clase.map((clasa, idx) => (
                          <div key={idx} className="w-full">
                            <button
                              onClick={() => toggle(`${materie.id}${ciclu.id}${idx}`)}
                              className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition-all duration-200 hover:shadow-md mb-2"
                            >
                              {clasa}
                            </button>
                            {visible[`${materie.id}${ciclu.id}${idx}`] && (
                              <div className="etape-container w-full pl-4 mt-1">
                                {etape.map((etapa, eIdx) => (
                                  <div key={eIdx}>
                                    <button
                                      className="w-full text-left text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1 my-1 hover:border-purple-400 hover:shadow-sm transition"
                                    >
                                      {etapa}
                                    </button>
                                    {etapa === "Etapa I" && clasa === "Clasa a IV-a" && (
                                      <div className="bg-white border-2 rounded-2xl p-4 mt-2 shadow hover:shadow-md transition">
                                        <h3 className={`text-lg font-semibold ${materie.color === "blue" ? "text-blue-800" : "text-green-800"} mb-1`}>
                                          {materie.label.includes('Română') ? '📘' : '📐'} Test {materie.label} – Clasa a IV-a
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">Etapa I – Test standardizat</p>
                                        <div className="flex justify-between items-center mt-4">
                                          <button
                                            onClick={() =>
                                              window.location.href =
                                                materie.id === "romana"
                                                  ? "/profesor/test-preview/romana-10"
                                                  : "/profesor/test-preview/mate-10"
                                            }
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${
                                              materie.color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                                            }`}
                                          >
                                            Începe testul
                                          </button>
                                          <button
                                            onClick={() => trimiteTestul(materie.id, materie.label)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 ${
                                              materie.color === "blue" ? "text-blue-800" : "text-green-800"
                                            }`}
                                          >
                                            Trimite elevului
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TesteComperProfesor;
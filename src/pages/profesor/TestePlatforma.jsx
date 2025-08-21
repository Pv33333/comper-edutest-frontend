
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TestePlatforma = () => {
  const navigate = useNavigate();

  const claseRomana = {
    Primar: ["Clasa Pregătitoare", "Clasa I", "Clasa a II-a", "Clasa a III-a", "Clasa a IV-a"],
    Gimnazial: ["Clasa a V-a", "Clasa a VI-a", "Clasa a VII-a", "Clasa a VIII-a"]
  };

  const claseMate = {
    Primar: ["Clasa Pregătitoare", "Clasa I", "Clasa a II-a", "Clasa a III-a", "Clasa a IV-a"],
    Gimnazial: ["Clasa a V-a", "Clasa a VI-a", "Clasa a VII-a", "Clasa a VIII-a"]
  };

  const [visibleRomana, setVisibleRomana] = useState("");
  const [visibleMate, setVisibleMate] = useState("");
  const [visibleRomanaNationala, setVisibleRomanaNationala] = useState("");
  const [visibleMateNationala, setVisibleMateNationala] = useState("");

  const [testCards, setTestCards] = useState({});

  const generateCard = (materie, clasa) => {
    const id = `${materie}_${clasa}`;
    const title = `📘 Test ${materie} – ${clasa}`;
    const color = materie === "Română" ? "blue" : "green";

    let link = "#";
    if (materie === "Română" && clasa === "Clasa a IV-a") {
      link = "/profesor/test-preview/romana-10";
    } else if (materie === "Matematică" && clasa === "Clasa a IV-a") {
      link = "/profesor/test-preview/mate-10";
    }

    setTestCards((prev) => ({
      ...prev,
      [id]: { id, title, color, link },
    }));
  };

  const trimiteElevului = (link, title) => {
    const id = "test_" + Math.random().toString(36).substring(2, 10);
    const test = {
      id,
      titlu: title,
      link,
      status: "neatribuit",
      data: new Date().toISOString(),
    };

    const lista = JSON.parse(localStorage.getItem("teste_profesor")) || [];
    lista.push(test);
    localStorage.setItem("teste_profesor", JSON.stringify(lista));
    navigate(`/profesor/gestionare-elevi?testId=${id}`);
  };

  
  const renderClasaButtonsNationala = (materie, nivel, clase) => {
    const visibleKey = materie === "Română" ? visibleRomanaNationala : visibleMateNationala;
    return (
      <>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
          onClick={() =>
            materie === "Română"
              ? setVisibleRomanaNationala(prev => prev === nivel ? "" : nivel)
              : setVisibleMateNationala(prev => prev === nivel ? "" : nivel)
          }
        >
          Ciclul {nivel}
        </button>
        {visibleKey === nivel && (
          <div className="flex flex-col items-center mt-4 gap-4">
            {clase.map((clasa, idx) => {
              const id = `${materie}_nationala_${clasa}`;
              return (
                <div key={idx} className="w-full">
                  <button
                    onClick={() => generateCard(materie, clasa)}
                    className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition-all duration-200 hover:shadow-md mb-2"
                  >
                    {clasa}
                  </button>
                  {testCards[id] && (
                    <div className={`w-full bg-white border-2 border-${testCards[id].color}-400 rounded-2xl p-4 shadow hover:shadow-lg transition mt-2`}>
                      <h3 className={`text-lg font-semibold text-${testCards[id].color}-800 mb-1`}>{testCards[id].title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Test standardizat</p>
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => window.location.href = testCards[id].link}
                          className={`${testCards[id].color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-xl text-sm font-semibold`}
                        >
                          Începe testul
                        </button>
                        <button
                          onClick={() => trimiteElevului(testCards[id].link, testCards[id].title)}
                          className={`bg-gray-100 hover:bg-gray-200 ${testCards[id].color === "blue" ? "text-blue-800" : "text-green-800"} px-4 py-2 rounded-xl text-sm font-semibold`}
                        >
                          Trimite elevului
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderClasaButtons = (materie, nivel, clase) => {

    const visibleKey = materie === "Română" ? visibleRomana : visibleMate;

    return (
      <>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
          onClick={() =>
            materie === "Română" ? setVisibleRomana(prev => prev === nivel ? "" : nivel) : setVisibleMate(prev => prev === nivel ? "" : nivel)
          }
        >
          Ciclul {nivel}
        </button>
        {visibleKey === nivel && (
          <div className="flex flex-col items-center mt-4 gap-4">
            {clase.map((clasa, idx) => {
              const id = `${materie}_${clasa}`;
              return (
                <div key={idx} className="w-full">
                  <button
                    onClick={() => generateCard(materie, clasa)}
                    className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition-all duration-200 hover:shadow-md mb-2"
                  >
                    {clasa}
                  </button>
                  {testCards[id] && (
                    <div className={`w-full bg-white border-2 border-${testCards[id].color}-400 rounded-2xl p-4 shadow hover:shadow-lg transition mt-2`}>
                      <h3 className={`text-lg font-semibold text-${testCards[id].color}-800 mb-1`}>{testCards[id].title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Test standardizat</p>
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => window.location.href = testCards[id].link}
                          className={`${testCards[id].color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-xl text-sm font-semibold`}
                        >
                          Începe testul
                        </button>
                        <button
                          onClick={() => trimiteElevului(testCards[id].link, testCards[id].title)}
                          className={`bg-gray-100 hover:bg-gray-200 ${testCards[id].color === "blue" ? "text-blue-800" : "text-green-800"} px-4 py-2 rounded-xl text-sm font-semibold`}
                        >
                          Trimite elevului
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
          href="/profesor/dashboard"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">🧪 Teste Platformă</h1>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">🧭 Evaluare Curentă</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-blue-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📘 Română</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseRomana).map(([nivel, clase]) =>
                  renderClasaButtons("Română", nivel, clase)
                )}
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-green-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📐 Matematică</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseMate).map(([nivel, clase]) =>
                  renderClasaButtons("Matematică", nivel, clase)
                )}
              </div>
            </div>
          </div>
        
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">🎯 Evaluarea Națională</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-blue-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📘 Română</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseRomana).map(([nivel, clase]) =>
                  renderClasaButtonsNationala("Română", nivel, clase)
                )}
              </div>
            </div>
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-green-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📐 Matematică</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseMate).map(([nivel, clase]) =>
                  renderClasaButtonsNationala("Matematică", nivel, clase)
                )}
              </div>
            </div>
          </div>
        </section>
    </section>
      </main>
    </div>
  );
};

export default TestePlatforma;

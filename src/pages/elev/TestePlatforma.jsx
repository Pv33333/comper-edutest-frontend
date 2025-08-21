import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TestePlatformaElev() {
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
    const title = `Test ${materie} – ${clasa}`;
    const color = materie === "Română" ? "blue" : "green";

    let link = "#";
    if (materie === "Română" && clasa === "Clasa a IV-a") {
      link = "/elev/tests/romana/clasa-iv/curent";
    } else if (materie === "Matematică" && clasa === "Clasa a IV-a") {
      link = "/elev/tests/matematica/clasa-iv/curent";
    }

    setTestCards((prev) => ({
      ...prev,
      [id]: { id, title, color, link },
    }));
  };

  const Card = ({ data }) => (
    <div className={`w-full bg-white border-2 border-${data.color}-400 rounded-2xl p-4 shadow hover:shadow-lg transition mt-2`}>
      <h3 className={`text-lg font-semibold text-${data.color}-800 mb-1`}>{data.title}</h3>
      <p className="text-sm text-gray-600 mb-2">Evaluare Curentă</p>
      <div className="flex justify-center items-center mt-4">
        <Link
          to={data.link}
          className={`${data.color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-5 py-2 rounded-xl text-sm font-semibold`}
        >
          Începe testul
        </Link>
      </div>
    </div>
  );

  const renderClasaButtons = (materie, nivel, clase, nationala=false) => {
    const visibleKey = materie === "Română"
      ? (nationala ? visibleRomanaNationala : visibleRomana)
      : (nationala ? visibleMateNationala : visibleMate);

    const setVisible = materie === "Română"
      ? (nationala ? setVisibleRomanaNationala : setVisibleRomana)
      : (nationala ? setVisibleMateNationala : setVisibleMate);

    return (
      <>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
          onClick={() => setVisible(prev => prev === nivel ? "" : nivel)}
        >
          Ciclul {nivel}
        </button>
        {visibleKey === nivel && (
          <div className="flex flex-col items-center mt-4 gap-4">
            {clase.map((clasa, idx) => {
              const id = `${materie}_${clasa}${nationala ? "_national" : ""}`;
              return (
                <div key={idx} className="w-full">
                  <button
                    onClick={() => generateCard(materie, clasa)}
                    className="w-full text-left bg-white border border-blue-200 hover:border-blue-500 shadow-sm rounded-xl px-4 py-2 text-gray-800 font-semibold text-sm transition-all duration-200 hover:shadow-md mb-2"
                  >
                    {clasa}
                  </button>
                  {testCards[id] && <Card data={testCards[id]} />}
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
        <Link className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium" to="/elev/dashboard">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-purple-800">🧪 Teste Platformă</h1>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">🧭 Evaluare Curentă</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-blue-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📘 Română</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseRomana).map(([nivel, clase]) => renderClasaButtons("Română", nivel, clase))}
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl border-t-4 border-green-500 p-6 w-full max-w-md text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📐 Matematică</h2>
              <div className="flex flex-col items-center gap-4">
                {Object.entries(claseMate).map(([nivel, clase]) => renderClasaButtons("Matematică", nivel, clase))}
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">🎯 Evaluarea Națională</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="bg-white shadow-xl rounded-2xl border-t-4 border-blue-500 p-6 w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">📘 Română</h2>
                <div className="flex flex-col items-center gap-4">
                  {Object.entries(claseRomana).map(([nivel, clase]) => renderClasaButtons("Română", nivel, clase, true))}
                </div>
              </div>
              <div className="bg-white shadow-xl rounded-2xl border-t-4 border-green-500 p-6 w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">📐 Matematică</h2>
                <div className="flex flex-col items-center gap-4">
                  {Object.entries(claseMate).map(([nivel, clase]) => renderClasaButtons("Matematică", nivel, clase, true))}
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

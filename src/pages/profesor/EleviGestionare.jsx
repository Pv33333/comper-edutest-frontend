
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const EleviGestionare = () => {
  const location = useLocation();
  const [date, setDate] = useState({});
  const [scoala, setScoala] = useState("");
  const [clasaNoua, setClasaNoua] = useState("");
  const [numeElev, setNumeElev] = useState("");
  const [emailElev, setEmailElev] = useState("");
  const [clasaSelectata, setClasaSelectata] = useState("");
  const [testId, setTestId] = useState(null);
  const [testSelectat, setTestSelectat] = useState(null);
  const [testeTrimise, setTesteTrimise] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("testId");
    setTestId(id);
    
    let scoalaActiva = localStorage.getItem("scoala_selectata");
    let structura = JSON.parse(localStorage.getItem("scoli_structura") || "{}");

    if (!scoalaActiva) {
      scoalaActiva = "Școala implicită";
      localStorage.setItem("scoala_selectata", scoalaActiva);
    }

    if (!structura[scoalaActiva]) {
      structura[scoalaActiva] = {};
      localStorage.setItem("scoli_structura", JSON.stringify(structura));
    }

    const scoalaActivaFinal = scoalaActiva;
    setScoala(scoalaActivaFinal);
    setDate(structura);
    
    setDate(structura);
    setScoala(scoalaActiva);
    if (id) {
      const toate = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
      const gasit = toate.find(t => t.id === id);
      setTestSelectat(gasit);
      const dejaTrimise = JSON.parse(localStorage.getItem("teste_elev") || "[]");
      setTesteTrimise(dejaTrimise);
    }
  }, [location]);

  const salveaza = (actualizat) => {
    localStorage.setItem("scoli_structura", JSON.stringify(actualizat));
    localStorage.setItem("scoala_selectata", scoala);
    setDate({ ...actualizat });
  };

  const adaugaClasa = () => {
    if (!clasaNoua || !scoala) return;
    const actualizat = { ...date };
    if (!actualizat[scoala]) actualizat[scoala] = {};
    if (!actualizat[scoala][clasaNoua]) {
      actualizat[scoala][clasaNoua] = [];
      setClasaNoua("");
      salveaza(actualizat);
    }
  };

  const adaugaElev = () => {
    if (!numeElev || !emailElev || !clasaSelectata) return;
    const actualizat = { ...date };
    actualizat[scoala][clasaSelectata].push({ nume: numeElev, email: emailElev });
    setNumeElev("");
    setEmailElev("");
    salveaza(actualizat);
  };

  const stergeElev = (clasa, index) => {
    const actualizat = { ...date };
    actualizat[scoala][clasa].splice(index, 1);
    salveaza(actualizat);
  };

  const stergeClasa = (clasa) => {
    if (!confirm(`Ștergi clasa '${clasa}' și toți elevii?`)) return;
    const actualizat = { ...date };
    delete actualizat[scoala][clasa];
    salveaza(actualizat);
  };

  const aFostTrimis = (testId, elev, clasa) =>
    testeTrimise.some(t => t.id == testId && t.trimis_catre == elev.email && t.clasa == clasa);

  const trimiteTestLaElev = (clasa, elev) => {
    if (aFostTrimis(testId, elev, clasa)) {
      alert(`⚠️ Testul a fost deja trimis către ${elev.nume}.`);
      return;
    }
    const test = { ...testSelectat, trimis_catre: elev.email, clasa };
    const toate = JSON.parse(localStorage.getItem("teste_elev") || "[]");
    toate.push(test);
    localStorage.setItem("teste_elev", JSON.stringify(toate));
    setTesteTrimise([...testeTrimise, test]);
    alert(`✅ Testul a fost trimis către ${elev.nume}`);
  };

  const trimiteTestLaClasa = (clasa) => {
    const elevi = date[scoala][clasa];
    const noi = elevi.filter(elev => !aFostTrimis(testId, elev, clasa))
      .map(elev => ({ ...testSelectat, trimis_catre: elev.email, clasa }));
    const toate = JSON.parse(localStorage.getItem("teste_elev") || "[]");
    localStorage.setItem("teste_elev", JSON.stringify([...toate, ...noi]));
    setTesteTrimise([...testeTrimise, ...noi]);
    alert(`✅ Testul a fost trimis clasei ${clasa}`);
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-5xl mx-auto mt-10 mb-6 px-4">
        <a href="/profesor/dashboard" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-900">📚 Gestionare Elevi</h1>
        <div className="text-center text-lg text-gray-700">
          {scoala ? `Școala activă: ${scoala}` : "⚠️ Nicio școală activă"}
        </div>

        {/* FORMULAR */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Adaugă Clasă și Elev</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Denumire clasă</label>
              <input value={clasaNoua} onChange={(e) => setClasaNoua(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm" placeholder="Ex: VII A" />
              <button className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 rounded-xl shadow-sm" onClick={adaugaClasa}>➕ Adaugă Clasă</button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Nume elev</label>
              <input value={numeElev} onChange={(e) => setNumeElev(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm" placeholder="Ex: Ana Popescu" />
              <label className="block text-sm font-medium mt-3 mb-1 text-gray-700">Email elev</label>
              <input value={emailElev} onChange={(e) => setEmailElev(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm" placeholder="Ex: ana@email.com" />
              <label className="block text-sm font-medium mt-3 mb-1 text-gray-700">Selectează clasa</label>
              <select value={clasaSelectata} onChange={(e) => setClasaSelectata(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm">
                <option value="">Alege clasa</option>
                {scoala && date[scoala] && Object.keys(date[scoala]).map((clasa, i) => (
                  <option key={i} value={clasa}>{clasa}</option>
                ))}
              </select>
              <button className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 rounded-xl shadow-sm" onClick={adaugaElev}>👤 Adaugă Elev</button>
            </div>
          </div>
        </div>

        {/* STRUCTURĂ */}
        {scoala && date[scoala] && Object.keys(date[scoala]).map((clasa, i) => (
          <div key={i} className="bg-white border rounded-xl shadow p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">🏫 Clasa {clasa} ({date[scoala][clasa].length} elevi)</h3>
              <div className="flex gap-2">
                <button onClick={() => stergeClasa(clasa)} className="text-red-500 hover:text-red-700 font-bold text-sm">✖</button>
                {testId && <button onClick={() => trimiteTestLaClasa(clasa)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">📤 Trimite tuturor</button>}
              </div>
            </div>
            <ul className="list-disc ml-6 space-y-1">
              {date[scoala][clasa].map((elev, index) => {
                const trimis = aFostTrimis(testId, elev, clasa);
                return (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span>👤 {elev.nume} <small className="text-xs text-gray-500 ml-2">{elev.email}</small> {trimis && <span className="text-xs text-gray-500 ml-2">✅ Trimis</span>}</span>
                    <div className="flex gap-2">
                      <button onClick={() => stergeElev(clasa, index)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded">🗑️ Șterge</button>
                      {testId && !trimis && (
                        <button onClick={() => trimiteTestLaElev(clasa, elev)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">📤 Trimite elevului</button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EleviGestionare;
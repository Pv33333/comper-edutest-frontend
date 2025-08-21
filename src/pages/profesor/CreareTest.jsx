
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const IntrebareGrila = ({ index, intrebare, setIntrebare, sterge }) => {
  const handleChange = (field, value) => {
    const newQ = { ...intrebare, [field]: value };
    setIntrebare(index, newQ);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-xl bg-white space-y-2">
      <input type="text" placeholder="Întrebare" value={intrebare.text} onChange={(e) => handleChange("text", e.target.value)} className="w-full p-2 border rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {["a", "b", "c", "d"].map((opt) => (
          <input key={opt} type="text" placeholder={`Varianta ${opt}`} value={intrebare[opt]} onChange={(e) => handleChange(opt, e.target.value)} className="p-2 border rounded" />
        ))}
      </div>
      <select value={intrebare.corecta} onChange={(e) => handleChange("corecta", e.target.value)} className="w-full p-2 border rounded bg-white">
        <option value="">Alege varianta corectă</option>
        {["a", "b", "c", "d"].map((opt) => (
          <option key={opt} value={opt}>Varianta {opt}</option>
        ))}
      </select>
      <button type="button" onClick={() => sterge(index)} className="text-red-600 text-sm mt-2 hover:underline">🗑 Șterge întrebare</button>
    </div>
  );
};

const CreareTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [test, setTest] = useState({
    id: "",
    disciplina: "",
    clasa: "",
    tip: "",
    competenta: "",
    descriere: "",
    profesor: "",
    data: "",
    ora: "",
    intrebari: [],
    status: "neexpediat"
  });

  const [salvat, setSalvat] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      const toate = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
      const gasit = toate.find(t => t.id === id);
      if (gasit) setTest(gasit);
    }
  }, [location]);

  const adaugaIntrebare = () => {
    setTest({
      ...test,
      intrebari: [...test.intrebari, { text: "", a: "", b: "", c: "", d: "", corecta: "" }],
    });
  };

  const setIntrebare = (index, newData) => {
    const intrebari = [...test.intrebari];
    intrebari[index] = newData;
    setTest({ ...test, intrebari });
  };

  const stergeIntrebare = (index) => {
    const intrebari = test.intrebari.filter((_, i) => i !== index);
    setTest({ ...test, intrebari });
  };

  const salveazaTest = () => {
    if (!test.data || !test.ora) {
      alert("⚠️ Te rugăm să completezi atât data cât și ora testului!");
      return;
    }
    const toateProf = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
    const toateMele = JSON.parse(localStorage.getItem("teste_mele") || "[]");

    let testFinal = { ...test };
    if (!test.id) {
      testFinal.id = Date.now().toString();
    }

    const actualizateProf = toateProf.filter(t => t.id !== testFinal.id);
    const actualizateMele = toateMele.filter(t => t.id !== testFinal.id);

    actualizateProf.push(testFinal);
    actualizateMele.push(testFinal);

    localStorage.setItem("teste_profesor", JSON.stringify(actualizateProf));
    localStorage.setItem("teste_mele", JSON.stringify(actualizateMele));
    setSalvat(true);

    setTimeout(() => {
      navigate("/profesor/teste-profesor");
    }, 1500);
  };

  return (
    <div className="-50 min-h-screen py-10 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">✍️ Creare Test</h1>
          <Link to="/profesor/dashboard" className="text-blue-600 hover:underline text-sm">← Înapoi la Dashboard</Link>
        </div>

        {salvat && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm">
            ✅ Testul a fost salvat cu succes! Îl poți vedea în <Link to="/profesor/teste-profesor" className="underline font-medium">Testele Mele</Link>.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select className="p-2 border rounded bg-white" value={test.disciplina} onChange={(e) => setTest({ ...test, disciplina: e.target.value })}>
            <option value="">Alege disciplina</option>
            <option>Matematică</option>
            <option>Limba română</option>
          </select>
          <select className="p-2 border rounded bg-white" value={test.clasa} onChange={(e) => setTest({ ...test, clasa: e.target.value })}>
            <option value="">Alege clasa</option>
            <optgroup label="Ciclul Primar">
              <option>Clasa pregătitoare</option>
              <option>Clasa I</option>
              <option>Clasa a II-a</option>
              <option>Clasa a III-a</option>
              <option>Clasa a IV-a</option>
            </optgroup>
            <optgroup label="Ciclul Gimnazial">
              <option>Clasa a V-a</option>
              <option>Clasa a VI-a</option>
              <option>Clasa a VII-a</option>
              <option>Clasa a VIII-a</option>
            </optgroup>
          </select>
          <select className="p-2 border rounded bg-white" value={test.tip} onChange={(e) => setTest({ ...test, tip: e.target.value })}>
            <option value="">Tip test</option>
            <option>Evaluare Curentă</option>
            <option>Evaluare Națională</option>
            <option>Test pentru elevii mei</option>
          </select>
          <input type="text" placeholder="Profesor" className="p-2 border rounded" value={test.profesor} onChange={(e) => setTest({ ...test, profesor: e.target.value })} />
          <input type="text" placeholder="Competență vizată" className="p-2 border rounded col-span-1 sm:col-span-2" value={test.competenta} onChange={(e) => setTest({ ...test, competenta: e.target.value })} />
          <input type="text" placeholder="Descriere test" className="p-2 border rounded col-span-1 sm:col-span-2" value={test.descriere} onChange={(e) => setTest({ ...test, descriere: e.target.value })} />
          <input type="date" className="p-2 border rounded" value={test.data} onChange={(e) => setTest({ ...test, data: e.target.value })} />
          <input type="time" className="p-2 border rounded" value={test.ora} onChange={(e) => setTest({ ...test, ora: e.target.value })} />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Întrebări grilă</h2>
            <button onClick={adaugaIntrebare} className="text-sm text-blue-700 hover:underline">+ Adaugă întrebare</button>
          </div>
          {test.intrebari.map((q, index) => (
            <IntrebareGrila key={index} index={index} intrebare={q} setIntrebare={setIntrebare} sterge={stergeIntrebare} />
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={salveazaTest} className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
            💾 Salvează testul
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreareTest;

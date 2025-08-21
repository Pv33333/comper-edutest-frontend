import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

/** Item întrebare grilă (identic cu varianta profesorului) */
const IntrebareGrila = ({ index, intrebare, setIntrebare, sterge }) => {
  const handleChange = (field, value) => {
    const newQ = { ...intrebare, [field]: value };
    setIntrebare(index, newQ);
  };
  return (
    <div className="p-4 border border-gray-300 rounded-xl bg-white space-y-2">
      <input
        type="text"
        placeholder="Întrebare"
        value={intrebare.text || ""}
        onChange={(e) => handleChange("text", e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {["a", "b", "c", "d"].map((opt) => (
          <input
            key={opt}
            type="text"
            placeholder={`Varianta ${opt}`}
            value={intrebare[opt] || ""}
            onChange={(e) => handleChange(opt, e.target.value)}
            className="p-2 border rounded"
          />
        ))}
      </div>
      <select
        value={intrebare.corecta || ""}
        onChange={(e) => handleChange("corecta", e.target.value)}
        className="w-full p-2 border rounded bg-white"
      >
        <option value="">Alege varianta corectă</option>
        {["a", "b", "c", "d"].map((opt) => (
          <option key={opt} value={opt}>
            Varianta {opt}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => sterge(index)}
        className="text-red-600 text-sm mt-2 hover:underline"
      >
        🗑 Șterge întrebare
      </button>
    </div>
  );
};

/** CreareTestAdmin.jsx
 * - Salvează în localStorage.teste_admin
 * - Dacă vine cu ?id=...&source=admin → încarcă din teste_admin (editare)
 * - Dacă vine cu ?id=...&source=profesor → încarcă din teste_profesor (preluare/validare)
 * - După salvare → redirect la /admin/administrare-platforma
 */
export default function CreareTestAdmin() {
  const location = useLocation();
  const navigate = useNavigate();

  const [test, setTest] = useState({
    id: "",
    titlu: "",
    materie: "",
    clasa: "",
    tip: "",
    competenta: "",
    descriere: "",
    profesor: "",
    data: "",
    ora: "",
    intrebari: [],
    validat: true,
    dataCreare: ""
  });

  const [salvat, setSalvat] = useState(false);
  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  const source = params.get("source"); // "admin" | "profesor" | null

  useEffect(() => {
    if (!editId) return;
    const admin = JSON.parse(localStorage.getItem("teste_admin") || "[]");
    const prof = JSON.parse(localStorage.getItem("teste_profesor") || "[]");

    let found = null;
    if (source === "admin") {
      found = admin.find((t) => String(t.id) === String(editId));
    } else if (source === "profesor") {
      found = prof.find((t) => String(t.id) === String(editId));
    } else {
      // fallback: caută mai întâi în admin
      found = admin.find((t) => String(t.id) === String(editId)) || prof.find((t) => String(t.id) === String(editId));
    }
    if (found) {
      setTest({
        id: found.id || "",
        titlu: found.titlu || "",
        materie: found.materie || found.disciplina || "",
        clasa: found.clasa || "",
        tip: found.tip || "",
        competenta: found.competenta || "",
        descriere: found.descriere || "",
        profesor: found.profesor || "",
        data: found.data || "",
        ora: found.ora || "",
        intrebari: Array.isArray(found.intrebari) ? found.intrebari : [],
        validat: true,
        dataCreare: found.dataCreare || new Date().toISOString().slice(0, 10)
      });
    }
  }, [editId, source]);

  const adaugaIntrebare = () => {
    setTest((prev) => ({
      ...prev,
      intrebari: [...prev.intrebari, { text: "", a: "", b: "", c: "", d: "", corecta: "" }]
    }));
  };

  const setIntrebare = (index, newData) => {
    setTest((prev) => {
      const intrebari = [...prev.intrebari];
      intrebari[index] = newData;
      return { ...prev, intrebari };
    });
  };

  const stergeIntrebare = (index) => {
    setTest((prev) => ({
      ...prev,
      intrebari: prev.intrebari.filter((_, i) => i !== index)
    }));
  };

  const salveazaTest = () => {
    if (!test.data || !test.ora) {
      alert("⚠️ Te rugăm să completezi atât data cât și ora testului!");
      return;
    }

    const adminAll = JSON.parse(localStorage.getItem("teste_admin") || "[]");
    const profAll = JSON.parse(localStorage.getItem("teste_profesor") || "[]");

    const id = test.id || Date.now().toString();
    const dataCreare = test.dataCreare || new Date().toISOString().slice(0, 10);

    const testFinal = {
      ...test,
      id,
      dataCreare,
      validat: true, // orice test creat/actualizat de admin este validat
      // normalizăm câmpuri
      materie: test.materie || test.disciplina || "",
      titlu: test.titlu || (test.materie ? `${test.materie} – ${test.clasa || ""}` : ""),
    };

    // Scoatem orice dublură din admin și adăugăm testul actualizat
    const adminFaraCurent = adminAll.filter((t) => String(t.id) !== String(id));
    const adminActualizat = [testFinal, ...adminFaraCurent];
    localStorage.setItem("teste_admin", JSON.stringify(adminActualizat));

    // Dacă venea din profesor și există acolo, îl scoatem (considerăm că a fost preluat/validat)
    const profFaraCurent = profAll.filter((t) => String(t.id) !== String(id));
    if (profFaraCurent.length !== profAll.length) {
      localStorage.setItem("teste_profesor", JSON.stringify(profFaraCurent));
    }

    setSalvat(true);
    setTimeout(() => {
      navigate("/admin/administrare-platforma");
    }, 1000);
  };

  return (
    <div className="-50 min-h-screen py-10 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">✍️ Creare Test (Admin)</h1>
          <Link
            to="/admin/administrare-platforma"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Înapoi la Administrare Platformă
          </Link>
        </div>

        {salvat && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm">
            ✅ Testul a fost salvat cu succes! Vezi lista în{" "}
            <Link to="/admin/administrare-platforma" className="underline font-medium">
              Administrare Platformă
            </Link>.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            className="p-2 border rounded"
            placeholder="Titlu test"
            value={test.titlu}
            onChange={(e) => setTest({ ...test, titlu: e.target.value })}
          />
          <select
            className="p-2 border rounded bg-white"
            value={test.materie}
            onChange={(e) => setTest({ ...test, materie: e.target.value })}
          >
            <option value="">Materie</option>
            <option>Matematică</option>
            <option>Limba română</option>
          </select>

          <select
            className="p-2 border rounded bg-white"
            value={test.clasa}
            onChange={(e) => setTest({ ...test, clasa: e.target.value })}
          >
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

          <select
            className="p-2 border rounded bg-white"
            value={test.tip}
            onChange={(e) => setTest({ ...test, tip: e.target.value })}
          >
            <option value="">Tip test</option>
            <option>Evaluare Curentă</option>
            <option>Evaluare Națională</option>
            <option>Test pentru elevii mei</option>
          </select>

          <input
            type="text"
            placeholder="Profesor"
            className="p-2 border rounded"
            value={test.profesor}
            onChange={(e) => setTest({ ...test, profesor: e.target.value })}
          />
          <input
            type="text"
            placeholder="Competență vizată"
            className="p-2 border rounded col-span-1 sm:col-span-2"
            value={test.competenta}
            onChange={(e) => setTest({ ...test, competenta: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descriere test"
            className="p-2 border rounded col-span-1 sm:col-span-2"
            value={test.descriere}
            onChange={(e) => setTest({ ...test, descriere: e.target.value })}
          />

          <input
            type="date"
            className="p-2 border rounded"
            value={test.data}
            onChange={(e) => setTest({ ...test, data: e.target.value })}
          />
          <input
            type="time"
            className="p-2 border rounded"
            value={test.ora}
            onChange={(e) => setTest({ ...test, ora: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Întrebări grilă</h2>
            <button onClick={adaugaIntrebare} className="text-sm text-blue-700 hover:underline">
              + Adaugă întrebare
            </button>
          </div>
          {test.intrebari.map((q, index) => (
            <IntrebareGrila
              key={index}
              index={index}
              intrebare={q}
              setIntrebare={setIntrebare}
              sterge={stergeIntrebare}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={salveazaTest}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            💾 Salvează testul
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdministrareTeste() {
  const initialTests = [
    { title: "Evaluare Română", clasa: "Clasa IV", profesor: "Ioana D.", scoala: "Școala Nr. 1", oras: "Cluj", judet: "Cluj", active: true },
    { title: "Test AI Matematică", clasa: "Clasa III", profesor: "Marius Pop", scoala: "Colegiul Național", oras: "București", judet: "Ilfov", active: true },
    { title: "Simulare Bac", clasa: "Clasa XII", profesor: "Alina V.", scoala: "Liceul Teoretic", oras: "Iași", judet: "Iași", active: false }
  ];

  const [tests, setTests] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_tests");
    if (stored) {
      setTests(JSON.parse(stored));
    } else {
      localStorage.setItem("admin_tests", JSON.stringify(initialTests));
      setTests(initialTests);
    }
  }, []);

  const saveTests = (updatedTests) => {
    setTests(updatedTests);
    localStorage.setItem("admin_tests", JSON.stringify(updatedTests));
  };

  const toggleTest = (index) => {
    const updated = [...tests];
    updated[index].active = !updated[index].active;
    saveTests(updated);
  };

  const deleteTest = (index) => {
    if (window.confirm("Sigur doriți să ștergeți acest test?")) {
      const updated = [...tests];
      updated.splice(index, 1);
      saveTests(updated);
    }
  };

  const addTest = () => {
    const title = prompt("Titlu test:");
    const clasa = prompt("Clasa:");
    const profesor = prompt("Profesor:");
    const scoala = prompt("Școala:");
    const oras = prompt("Oraș:");
    const judet = prompt("Județ:");
    if (title && clasa && profesor && scoala && oras && judet) {
      const newTest = { title, clasa, profesor, scoala, oras, judet, active: true };
      const updated = [newTest, ...tests];
      saveTests(updated);
    }
  };

  const activeTests = tests.filter((t) => t.active);
  const inactiveTests = tests.filter((t) => !t.active);

  return (
    <div className="-50 text-gray-900 min-h-screen px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">🧪 Administrare Teste</h1>
        <Link
          to="/admin/dashboard"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          ⬅ Înapoi la Dashboard Admin
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={addTest}
          className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
        >
          ➕ Adaugă Test
        </button>
        <span className="text-sm text-gray-600">{tests.length} test(e) în total</span>
      </div>

      {/* Active Tests */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow mb-10 p-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">✔️ Teste Active</h2>
        <table className="min-w-full text-sm text-left text-gray-800 mt-2">
          <thead className="bg-[#F4F4F6] text-[#2E5AAC] uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3">Titlu</th>
              <th className="px-4 py-3">Clasă</th>
              <th className="px-4 py-3">Profesor</th>
              <th className="px-4 py-3">Școala</th>
              <th className="px-4 py-3">Oraș</th>
              <th className="px-4 py-3">Județ</th>
              <th className="px-4 py-3">Activ</th>
              <th className="px-4 py-3 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeTests.map((test, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{test.title}</td>
                <td className="px-4 py-2">{test.clasa}</td>
                <td className="px-4 py-2">{test.profesor}</td>
                <td className="px-4 py-2">{test.scoala}</td>
                <td className="px-4 py-2">{test.oras}</td>
                <td className="px-4 py-2">{test.judet}</td>
                <td className="px-4 py-2">✔️</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => toggleTest(tests.indexOf(test))}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
                  >
                    ⏸ Dezactivează
                  </button>
                  <button
                    onClick={() => deleteTest(tests.indexOf(test))}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    🗑 Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inactive Tests */}
      <div className="overflow-x-auto bg-gray-100 border border-gray-300 rounded-xl shadow p-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">⛔ Teste Inactive</h2>
        <table className="min-w-full text-sm text-left text-gray-700 mt-2">
          <thead className="bg-[#EFEFEF] text-[#2E5AAC] uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3">Titlu</th>
              <th className="px-4 py-3">Clasă</th>
              <th className="px-4 py-3">Profesor</th>
              <th className="px-4 py-3">Școala</th>
              <th className="px-4 py-3">Oraș</th>
              <th className="px-4 py-3">Județ</th>
              <th className="px-4 py-3">Activ</th>
              <th className="px-4 py-3 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inactiveTests.map((test, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{test.title}</td>
                <td className="px-4 py-2">{test.clasa}</td>
                <td className="px-4 py-2">{test.profesor}</td>
                <td className="px-4 py-2">{test.scoala}</td>
                <td className="px-4 py-2">{test.oras}</td>
                <td className="px-4 py-2">{test.judet}</td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => toggleTest(tests.indexOf(test))}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    ✅ Activează
                  </button>
                  <button
                    onClick={() => deleteTest(tests.indexOf(test))}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    🗑 Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

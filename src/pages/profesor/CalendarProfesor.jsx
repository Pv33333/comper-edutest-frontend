// ✅ CalendarProfesor.jsx – Complet, Final, Funcțional
import React, { useState, useEffect } from "react";
import { populateConfirmariElevi } from "../../utils/confirmari_elevi_test";

const CalendarProfesor = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tests, setTests] = useState([]);
  const [confirmari, setConfirmari] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: "", desc: "", time: "", date: "" });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    populateConfirmariElevi();
    const saved = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    setTests(saved);
    const c = JSON.parse(localStorage.getItem("confirmari_elevi") || "[]");
    setConfirmari(c);
  }, [modalOpen]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const openModal = (date) => {
    const saved = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    const existingIndex = saved.findIndex(t => t.date === date);
    const existingTest = saved[existingIndex];

    if (existingTest) {
      setFormData({
        subject: existingTest.subject,
        desc: existingTest.desc,
        time: existingTest.time,
        date: existingTest.date
      });
      localStorage.setItem("edit_index_prof", existingIndex);
    } else {
      setFormData({ subject: "", desc: "", time: "", date });
      localStorage.removeItem("edit_index_prof");
    }

    setSelectedDate(date);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ subject: "", desc: "", time: "", date: "" });
    localStorage.removeItem("edit_index_prof");
  };

  const saveActivity = () => {
    const { subject, desc, time, date } = formData;
    if (!subject || !desc || !time || !date) return;

    const editIndex = localStorage.getItem("edit_index_prof");
    let saved = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");

    if (editIndex !== null) {
      saved[parseInt(editIndex)] = { ...formData, prof: true, confirmed: false };
      localStorage.removeItem("edit_index_prof");
    } else {
      saved.push({ ...formData, prof: true, confirmed: false });
    }

    localStorage.setItem("tests_from_prof", JSON.stringify(saved));
    setModalOpen(false);
    setTests(saved);
  };

  const handleDeleteTest = (index) => {
    let saved = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    saved.splice(index, 1);
    localStorage.setItem("tests_from_prof", JSON.stringify(saved));
    setTests(saved);
    setModalOpen(false);
  };

  const handleAnuleazaTest = (index) => {
    let updated = [...tests];
    updated[index].anulat = true;
    localStorage.setItem("tests_from_prof", JSON.stringify(updated));
    setTests(updated);
  };

  const handleReactiveazaTest = (index) => {
    let updated = [...tests];
    updated[index].anulat = false;
    localStorage.setItem("tests_from_prof", JSON.stringify(updated));
    setTests(updated);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const startDay = start.getDay() || 7;
    const grid = [];

    for (let i = 0; i < startDay - 1; i++) grid.push(<div key={"e" + i}></div>);

    for (let d = 1; d <= end.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const key = dateObj.toLocaleDateString("en-CA");
      const dayTests = tests.filter(t => t.date === key);

      grid.push(
        <div key={key} className="calendar-cell bg-white p-2 rounded-xl shadow hover:shadow-lg cursor-pointer" onClick={() => openModal(key)}>
          <div className="font-bold text-gray-800">{d}</div>
          {dayTests.map((e, i) => (
            <div key={i} className={`text-sm ${e.prof ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"} rounded px-1 my-1`}>
              {e.prof ? "📘" : "📝"} {e.subject}
              <div className="text-xs text-gray-500">{e.time}</div>
              <div className="text-xs text-gray-600 italic">{e.desc || e.descriere}</div>
            </div>
          ))}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="min-h-screen text-gray-800 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">👨‍🏫 Calendar Profesor</h1>

        {/* Înapoi la dashboard */}
        <div className="flex justify-center mt-2 mb-6">
          <a href="/profesor/dashboard" className="flex items-center gap-2 text-sm sm:text-base text-blue-700 hover:text-blue-900 transition font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Înapoi la Dashboard
          </a>
        </div>

        {/* Buton Adaugă Test */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 shadow">
          <div className="text-indigo-900 font-semibold mb-3">📋 Planificare test nou</div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm shadow transition" onClick={() => openModal(new Date().toLocaleDateString("en-CA"))}>
            ➕ Adaugă test
          </button>
        </div>

        {/* Lista Teste */}
        <div className="space-y-3 mb-6">
          {tests.length === 0 ? (
            <p className="text-sm text-gray-500">Niciun test planificat.</p>
          ) : (
            tests.map((test, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-indigo-800">📘 {test.subject} {test.anulat && <span className="text-red-500 font-semibold ml-2">(Anulat)</span>}</div>
                  <div className="text-xs text-gray-500">{test.date} {test.time}</div>
                  <div className="text-xs text-gray-500">{test.desc || test.descriere || "-"}</div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4 text-xs">
                  {test.anulat ? (
                    <button className="text-green-600 hover:underline" onClick={() => handleReactiveazaTest(i)}>Reactivează</button>
                  ) : (
                    <button className="text-yellow-600 hover:underline" onClick={() => handleAnuleazaTest(i)}>Anulează</button>
                  )}
                  <button className="text-blue-600 hover:underline" onClick={() => openModal(test.date)}>Modifică</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDeleteTest(i)}>Șterge</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calendar Vizual */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(-1)}>⬅ Luna precedentă</button>
          <h2 className="text-xl font-semibold">{currentDate.toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}</h2>
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(1)}>Luna următoare ➡</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm md:text-base">{renderCalendar()}</div>

        {/* Confirmări Elevi */}
        <div className="mt-10">
          <details className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-md">
            <summary className="text-lg font-semibold text-indigo-900 cursor-pointer select-none">
              ✔ Confirmări Teste de la Elevi <span className="text-sm text-gray-600">(click pentru a extinde)</span>
            </summary>
            <ul className="mt-4 space-y-3 text-sm text-gray-800">
              {confirmari.length === 0 ? (
                <li className="text-gray-500">Nicio confirmare încă.</li>
              ) : (
                confirmari.map((c, i) => (
                  <li key={i} className="border border-gray-300 rounded p-3 bg-white">
                    <div className="font-medium text-indigo-700">{c.subject} {c.viewed && <span className="text-green-600 text-xs ml-2">(Văzut)</span>}</div>
                    <div className="text-xs text-gray-500">{c.date} {c.time} – {c.desc}</div>
                    <div className="text-xs text-green-600 mt-1">✔ Confirmat: {new Date(c.confirmedAt).toLocaleString("ro-RO")}</div>
                    <div className="flex gap-3 text-xs mt-2">
                      <button className="text-blue-600 hover:underline" onClick={() => {
                        const updated = [...confirmari];
                        updated[i].viewed = true;
                        localStorage.setItem("confirmari_elevi", JSON.stringify(updated));
                        setConfirmari(updated);
                      }}>Văzut</button>
                      <button className="text-red-600 hover:underline" onClick={() => {
                        const updated = [...confirmari];
                        updated.splice(i, 1);
                        localStorage.setItem("confirmari_elevi", JSON.stringify(updated));
                        setConfirmari(updated);
                      }}>Șterge</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </details>
        </div>
      </div>

      {/* Modal Adaugă/Editare */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-center">Adaugă / Editează test</h3>
            <p className="text-center text-gray-500 text-sm">{selectedDate ? new Date(selectedDate).toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
            <input className="w-full border p-2 rounded-xl" type="date" value={formData.date || new Date().toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            <input className="w-full border p-2 rounded-xl" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            <input className="w-full border p-2 rounded-xl" placeholder="Materie" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
            <input className="w-full border p-2 rounded-xl" placeholder="Descriere" value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} />
            <div className="flex justify-between items-center">
              <button className="text-gray-600 hover:underline" onClick={closeModal}>Anulează</button>
              {localStorage.getItem("edit_index_prof") !== null && (
                <button className="text-red-600 hover:underline" onClick={() => {
                  const index = localStorage.getItem("edit_index_prof");
                  if (index !== null) {
                    handleDeleteTest(parseInt(index));
                    closeModal();
                  }
                }}>Șterge</button>
              )}
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-xl" onClick={saveActivity}>Salvează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarProfesor;
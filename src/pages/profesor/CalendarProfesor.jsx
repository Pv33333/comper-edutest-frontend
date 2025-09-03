// ✅ CalendarProfesor.jsx – Păstrează designul original, integrează Supabase pentru evenimente
import React, { useEffect, useMemo, useState } from "react";
import { populateConfirmariElevi } from "../../utils/confirmari_elevi_test";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

const CalendarProfesor = () => {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tests, setTests] = useState([]); // evenimente (lista)
  const [confirmari, setConfirmari] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: "", desc: "", time: "", date: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingId, setEditingId] = useState(null); // id eveniment supabase (sau null)

  // Helpers
  const toKey = (y,m,d) => new Date(y,m,d).toLocaleDateString("en-CA");

  const fetchEvents = async () => {
    if (!user?.id) return;
    // Citește din Supabase calendar_events pentru user curent
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id, subject, descriere, disciplina, clasa, tip, event_date, event_time, anulat, source, test_id")
      .eq("created_by", user.id)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });

    if (error) {
      console.error("[CalendarProfesor] fetch error:", error);
      // Fallback local
      try {
        const saved = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
        setTests(saved.map((e) => ({
          id: e.id || `${e.date}_${e.time}`,
          subject: e.subject || e.disciplina || "",
          desc: e.desc || e.descriere || "",
          disciplina: e.disciplina || "",
          clasa: e.clasa || "",
          tip: e.tip || "Test programat",
          date: e.date,
          time: e.time,
          anulat: !!e.anulat,
          source: e.source || "profesor",
          test_id: e.test_id || null,
        })));
      } catch {}
      return;
    }

    const normalized = (data || []).map((r) => ({
      id: r.id,
      subject: r.subject,
      desc: r.descriere || "",
      disciplina: r.disciplina || "",
      clasa: r.clasa || "",
      tip: r.tip || "Test programat",
      date: r.event_date,
      time: r.event_time,
      anulat: !!r.anulat,
      source: r.source || "profesor",
      test_id: r.test_id || null,
    }));
    setTests(normalized);

    // Mirror local pentru compat (nu obligatoriu, dar util până migrezi toate paginile)
    try {
      localStorage.setItem("tests_from_prof", JSON.stringify(normalized.map((e) => ({
        id: e.id, subject: e.subject, desc: e.desc,
        disciplina: e.disciplina, clasa: e.clasa, tip: e.tip,
        date: e.date, time: e.time, anulat: e.anulat, source: e.source, test_id: e.test_id
      }))));
    } catch {}
  };

  useEffect(() => {
    populateConfirmariElevi();
    try {
      const c = JSON.parse(localStorage.getItem("confirmari_elevi") || "[]");
      setConfirmari(c);
    } catch {}
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, modalOpen]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const openModal = (date) => {
    // Caută primul eveniment din acea zi (ca în model)
    const existingIndex = tests.findIndex((t) => t.date === date);
    const existing = existingIndex >= 0 ? tests[existingIndex] : null;

    if (existing) {
      setFormData({
        subject: existing.subject,
        desc: existing.desc,
        time: existing.time,
        date: existing.date,
      });
      setEditingId(existing.id);
    } else {
      setFormData({ subject: "", desc: "", time: "", date });
      setEditingId(null);
    }
    setSelectedDate(date);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ subject: "", desc: "", time: "", date: "" });
    setSelectedDate(null);
    setEditingId(null);
  };

  const saveActivity = async () => {
    const { subject, desc, time, date } = formData;
    if (!subject || !desc || !time || !date) return;

    if (!user?.id) { alert("Trebuie să fii autentificat."); return; }

    if (editingId) {
      // update
      const { error } = await supabase
        .from("calendar_events")
        .update({
          subject,
          descriere: desc,
          event_date: date,
          event_time: time,
        })
        .eq("id", editingId);
      if (error) {
        console.error("[CalendarProfesor] update error:", error);
        alert("Nu am putut actualiza evenimentul.");
        return;
      }
    } else {
      // insert
      const { error } = await supabase
        .from("calendar_events")
        .insert([{
          created_by: user.id,
          subject,
          descriere: desc,
          event_date: date,
          event_time: time,
          tip: "Test programat",
          source: "profesor",
        }]);
      if (error) {
        console.error("[CalendarProfesor] insert error:", error);
        alert("Nu am putut salva evenimentul.");
        return;
      }
    }
    closeModal();
    fetchEvents();
  };

  const handleDeleteTest = async (id) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) { alert("Nu am putut șterge evenimentul."); return; }
    fetchEvents();
    closeModal();
  };

  const handleAnuleazaTest = async (id, current) => {
    const { error } = await supabase
      .from("calendar_events")
      .update({ anulat: !current })
      .eq("id", id);
    if (error) { alert("Nu am putut actualiza statusul."); return; }
    fetchEvents();
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
      const key = toKey(year, month, d);
      const dayTests = tests.filter(t => t.date === key);
      grid.push(
        <div key={key} className="calendar-cell bg-white p-2 rounded-xl shadow hover:shadow-lg cursor-pointer" onClick={() => openModal(key)}>
          <div className="font-bold text-gray-800">{d}</div>
          {dayTests.map((e, i) => (
            <div key={i} className={`text-sm ${e.source === "profesor" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"} rounded px-1 my-1`}>
              📘 {e.subject}
              <div className="text-xs text-gray-500">{e.time}</div>
              <div className="text-xs text-gray-600 italic">{e.desc}</div>
              {e.anulat && <div className="text-xs text-red-600 mt-1">Anulat</div>}
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
              <div key={test.id || i} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-indigo-800">📘 {test.subject} {test.anulat && <span className="text-red-500 font-semibold ml-2">(Anulat)</span>}</div>
                  <div className="text-xs text-gray-500">{test.date} {test.time}</div>
                  <div className="text-xs text-gray-500">{test.desc || "-"}</div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4 text-xs">
                  <button className={`${test.anulat ? "text-green-600" : "text-yellow-600"} hover:underline`} onClick={() => handleAnuleazaTest(test.id, test.anulat)}>
                    {test.anulat ? "Reactivează" : "Anulează"}
                  </button>
                  <button className="text-blue-600 hover:underline" onClick={() => openModal(test.date)}>Modifică</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDeleteTest(test.id)}>Șterge</button>
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

        {/* Confirmări Elevi – rămâne pe local deocamdată */}
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
              {editingId && (
                <button className="text-red-600 hover:underline" onClick={() => handleDeleteTest(editingId)}>Șterge</button>
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
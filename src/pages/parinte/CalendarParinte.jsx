import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DateTimePicker from "../../components/DateTimePicker"; // src/components/DateTimePicker.jsx

function getKey(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function loadJSON(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key) || "null");
    return val ?? fallback;
  } catch {
    return fallback;
  }
}

export default function CalendarParinte() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [testsFromProf, setTestsFromProf] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null); // ziua selectată pentru listare/edita
  const [showPicker, setShowPicker] = useState(false);
  const [pickerInitial, setPickerInitial] = useState({ date: "", time: "", subject: "", desc: "" });
  const [editIndex, setEditIndex] = useState(null); // null = adaugare, number = editare

  // Bar: activități programate de profesor
  useEffect(() => {
    const list = loadJSON("tests_from_prof", []);
    setTestsFromProf(Array.isArray(list) ? list : []);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const startDay = start.getDay() || 7; // Monday=1..Sunday=7 for RO UX

  const monthTitle = useMemo(
    () => start.toLocaleDateString("ro-RO", { month: "long", year: "numeric" }),
    [start]
  );

  const days = useMemo(() => {
    const slots = Array.from({ length: startDay - 1 }, () => null);
    for (let d = 1; d <= end.getDate(); d++) {
      slots.push(new Date(year, month, d));
    }
    return slots;
  }, [startDay, end, year, month]);

  const entriesForSelected = useMemo(() => {
    if (!selectedKey) return [];
    return loadJSON(selectedKey, []);
  }, [selectedKey, showPicker]); // refresh when picker closes

  // Click pe o zi a calendarului
  const onDayClick = (key) => {
    const entries = loadJSON(key, []);
    if (entries.length === 0) {
      // Nu există activități -> deschide direct DateTimePicker pentru adăugare
      setPickerInitial({ date: key, time: "", subject: "", desc: "" });
      setEditIndex(null);
      setShowPicker(true);
      setSelectedKey(null); // nu arăt panelul
    } else {
      // Există activități -> arată panel cu Modifică/Șterge
      setSelectedKey(key);
      setShowPicker(false);
      setEditIndex(null);
    }
  };

  const changeMonth = (offset) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
    setSelectedKey(null);
    setShowPicker(false);
  };

  const saveFromPicker = ({ date, time, subject, desc }) => {
    const key = date;
    const existing = loadJSON(key, []);
    if (editIndex !== null) {
      existing[editIndex] = { subject, desc, time };
    } else {
      existing.push({ subject, desc, time });
    }
    localStorage.setItem(key, JSON.stringify(existing));
    // Închidem picker-ul și gata; la următorul click pe zi se vede panelul cu Modifică/Șterge.
    setShowPicker(false);
    setEditIndex(null);
    setSelectedKey(null);
  };

  const handleEdit = (idx) => {
    const entry = entriesForSelected[idx];
    setPickerInitial({ date: selectedKey, time: entry.time || "", subject: entry.subject || "", desc: entry.desc || "" });
    setEditIndex(idx);
    setShowPicker(true);
  };

  const handleDelete = (idx) => {
    const list = loadJSON(selectedKey, []);
    list.splice(idx, 1);
    localStorage.setItem(selectedKey, JSON.stringify(list));
    // Dacă nu mai rămân activități, închidem panelul
    if (list.length === 0) {
      setSelectedKey(null);
    } else {
      // re-render panel
      setSelectedKey(selectedKey);
    }
  };

  const removeProfessorTest = (i) => {
    const list = loadJSON("tests_from_prof", []);
    list.splice(i, 1);
    localStorage.setItem("tests_from_prof", JSON.stringify(list));
    setTestsFromProf(list);
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* Bar activități programate de profesor (pentru copil) */}
      <div className="bg-blue-100 border-b border-blue-300 text-gray-800 shadow px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            📘 Activitățile copilului tău (testele programate)
          </h2>
          <ul className="space-y-2 text-sm">
            {testsFromProf.length === 0 && (
              <li className="text-gray-500">Nu există activități programate încă.</li>
            )}
            {testsFromProf.map((test, i) => (
              <li key={i} className="bg-white p-3 rounded-lg shadow flex justify-between items-start">
                <div>
                  <div className="font-medium text-blue-700">{test.subject}</div>
                  <div className="text-sm text-gray-500">{test.date} {test.time}</div>
                  {test.confirmed ? (
                    <div className="text-green-600 font-semibold text-sm">✔ Confirmat de elev</div>
                  ) : (
                    <div className="text-red-500 font-semibold text-sm">❗ Neconfirmat de elev</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm("Sigur vrei să ștergi această activitate din calendar?")) {
                      removeProfessorTest(i);
                    }
                  }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Înapoi la Dashboard */}
      <div className="max-w-5xl mx-auto pt-6 px-4">
        <div className="max-w-5xl mx-auto px-4 -mt-4 mb-2">
          <Link
            to="/parinte/dashboard"
            className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-700 hover:text-blue-900 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
            </svg>
            Înapoi la Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6">👩‍👧‍👦 Calendar Părinte – Activitățile copilului tău</h1>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(-1)}>⬅ Luna precedentă</button>
          <h2 className="text-xl font-semibold">{monthTitle}</h2>
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(1)}>Luna următoare ➡</button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 text-sm md:text-base">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            const key = getKey(date);
            const events = loadJSON(key, []);
            return (
              <div
                key={key}
                className="calendar-cell transition hover:shadow-lg bg-white p-2 rounded-xl shadow cursor-pointer"
                onClick={() => onDayClick(key)}
              >
                <div className="font-bold text-gray-800">{date.getDate()}</div>
                {events.map((e, i) => (
                  <div key={i} className="mt-1">
                    <div className="text-sm">📝 {e.subject}</div>
                    <div className="text-xs text-gray-500">{e.time}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel listare/editare pentru ziua selectată (doar dacă există activități) */}
      {selectedKey && entriesForSelected.length > 0 && !showPicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-center">Activități pentru {selectedKey}</h3>
            <div className="space-y-2">
              {entriesForSelected.map((e, i) => (
                <div key={i} className="p-2 rounded-xl bg-gray-100 text-black flex justify-between items-start">
                  <div>
                    <div><strong>{e.subject}</strong> – {e.desc}</div>
                    <div className="text-xs text-gray-500">Ora: {e.time}</div>
                  </div>
                  <div className="flex flex-col gap-1 ml-3">
                    <button className="text-blue-600 text-xs hover:underline" onClick={() => handleEdit(i)}>Modifică</button>
                    <button className="text-red-600 text-xs hover:underline" onClick={() => handleDelete(i)}>Șterge</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="text-gray-600 hover:underline" onClick={() => setSelectedKey(null)}>Închide</button>
            </div>
          </div>
        </div>
      )}

      {/* DateTimePicker – se deschide direct când dai click pe o zi fără activități 
          sau la "Modifică" pentru o activitate existentă */}
      {showPicker && (
        <DateTimePicker
          onConfirm={saveFromPicker}
          onCancel={() => {
            setShowPicker(false);
            setEditIndex(null);
          }}
        />
      )}
    </div>
  );
}

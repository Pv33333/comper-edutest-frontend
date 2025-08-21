import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DateTimePicker from "../../components/DateTimePicker";

const getKey = (date) => date.toISOString().split("T")[0];

export default function CalendarElev() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [testsFromProf, setTestsFromProf] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const refreshProfTests = () => {
    const list = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    setTestsFromProf(list);
  };

  useEffect(() => {
    refreshProfTests();
  }, []);

  const changeMonth = (offset) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const startDay = start.getDay() || 7;

    const cells = [];
    for (let i = 0; i < startDay - 1; i++) cells.push(<div key={"e" + i}></div>);

    for (let d = 1; d <= end.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const key = getKey(dateObj);
      const events = JSON.parse(localStorage.getItem(key) || "[]");

      cells.push(
        <div
          key={key}
          className="calendar-cell transition hover:shadow-lg bg-white p-2 rounded-xl shadow cursor-pointer"
          onClick={() => {
            setSelectedDate(key);
            setShowPicker(true);
          }}
        >
          <div className="font-bold text-gray-800">{d}</div>
          {events.map((e, i) => (
            <div key={i} className="text-sm">
              📝 {e.subject}
              <div className="text-xs text-gray-500">{e.time}</div>
            </div>
          ))}
        </div>
      );
    }
    return cells;
  }, [currentDate, showPicker]);

  const onPickerConfirm = ({ date, time, subject, desc }) => {
    const event = { subject, desc, time };
    const existing = JSON.parse(localStorage.getItem(date) || "[]");
    existing.push(event);
    localStorage.setItem(date, JSON.stringify(existing));
    setShowPicker(false);
  };

  const onPickerCancel = () => setShowPicker(false);

  const confirmTest = (i) => {
    const list = [...testsFromProf];
    list[i].confirmed = true;
    localStorage.setItem("tests_from_prof", JSON.stringify(list));
    setTestsFromProf(list);
  };

  const anulTest = (i) => {
    const list = [...testsFromProf];
    list[i].confirmed = false;
    localStorage.setItem("tests_from_prof", JSON.stringify(list));
    setTestsFromProf(list);
  };

  const deleteTest = (i) => {
    const list = [...testsFromProf];
    if (window.confirm("Sigur vrei să ștergi testul propus?")) {
      list.splice(i, 1);
      localStorage.setItem("tests_from_prof", JSON.stringify(list));
      setTestsFromProf(list);
    }
  };

  return (
    <div className="min-h-screen text-gray-800 px-4 pb-10">
      {/* Bară: Teste programate de profesor */}
      <section className="bg-blue-100 border-b border-blue-300 text-gray-800 shadow px-4 py-4 -mx-4 mb-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📘 Teste programate de profesor</h2>
          <ul className="space-y-2 text-sm" id="bar-teste-profesor">
            {testsFromProf.length === 0 ? (
              <li className="text-gray-500">Niciun test programat de profesor.</li>
            ) : (
              testsFromProf.map((test, i) => (
                <li key={i} className="bg-white p-3 rounded-lg shadow flex justify-between items-start">
                  <div>
                    <div className="font-medium text-blue-700">{test.subject}</div>
                    <div className="text-sm text-gray-500">{test.date} {test.time}</div>
                    {test.confirmed && <div className="text-green-600 font-semibold text-sm">✔ Confirmat</div>}
                  </div>
                  <div className="flex gap-2">
                    {test.confirmed ? (
                      <button className="text-yellow-600 hover:underline text-sm" onClick={() => anulTest(i)}>Anulează</button>
                    ) : (
                      <button className="text-blue-600 hover:underline text-sm" onClick={() => confirmTest(i)}>Confirmă</button>
                    )}
                    <button className="text-red-600 hover:underline text-sm" onClick={() => deleteTest(i)}>Șterge</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <div className="max-w-5xl mx-auto">
        {/* Înapoi la dashboard */}
        <div className="flex justify-center mt-2 mb-6">
          <Link to="/elev/dashboard" className="flex items-center gap-2 text-sm sm:text-base text-blue-700 hover:text-blue-900 transition font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Înapoi la Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">👨‍🎓 Calendar Elev – Activități Proprii</h1>

        {/* Controale calendar */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(-1)}>⬅ Luna precedentă</button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
          </h2>
          <button className="text-blue-600 hover:underline" onClick={() => changeMonth(1)}>Luna următoare ➡</button>
        </div>

        {/* Calendar vizual */}
        <div className="grid grid-cols-7 gap-2 text-sm md:text-base">
          {monthGrid}
        </div>
      </div>

      {/* DateTimePicker direct */}
      {showPicker && (
        <DateTimePicker
          onConfirm={onPickerConfirm}
          onCancel={onPickerCancel}
        />
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/SupabaseAuthProvider.jsx";
import {
  listTeacherSchedules,
  scheduleForClass,
  scheduleForStudent,
} from "@/services/calendarService.js";
import { getTestById } from "@/services/testsService.js";

export default function CalendarProfesor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const testToAdd = new URLSearchParams(location.search).get("add"); // când vii din TesteProfesor
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // formularul tău de adăugare – păstrez UI-ul; doar logica schimbată
  const [when, setWhen] = useState("");
  const [due, setDue] = useState("");
  const [classId, setClassId] = useState(""); // selectul tău de clase (populate separat)
  const [studentId, setStudentId] = useState(""); // select elev (opțional)
  const [testId, setTestId] = useState(testToAdd || "");

  async function load() {
    try {
      setLoading(true);
      const data = await listTeacherSchedules();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn(e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  const addSchedule = async () => {
    if (!testId || !when) return;
    try {
      if (classId && !studentId) {
        await scheduleForClass({
          test_id: testId,
          class_id: classId,
          scheduled_at: when,
          due_at: due || null,
        });
      } else if (studentId && !classId) {
        await scheduleForStudent({
          test_id: testId,
          student_id: studentId,
          scheduled_at: when,
          due_at: due || null,
        });
      } else {
        alert("Alege fie o clasă, fie un elev (nu ambele).");
        return;
      }
      setWhen("");
      setDue("");
      load();
      alert("✅ Test programat.");
    } catch (e) {
      console.error(e);
      alert("⚠️ Eroare la programare.");
    }
  };

  const human = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          href="/profesor/dashboard"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          🗓 Calendar Profesor
        </h1>

        {/* Formularul tău de programare – UI păstrat */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm"
              placeholder="ID Test"
            />
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm"
            />
            <input
              type="datetime-local"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm"
            />
            <input
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm"
              placeholder="Class ID (sau lasă gol)"
            />
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm"
              placeholder="Student ID (sau lasă gol)"
            />
          </div>
          <button
            onClick={addSchedule}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm"
          >
            🗓 Programează
          </button>
        </div>

        {/* Lista ta vizuală din calendar – păstrat în stil carduri */}
        {loading && <p className="text-gray-500">Se încarcă...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && schedules.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              Nu ai programări.
            </p>
          )}

          {schedules.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-5"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-1">
                {s.tests?.title || "Test"}
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Materie:</strong> {s.tests?.subject}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Clasa:</strong> {s.tests?.grade_level}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Programat:</strong> {human(s.scheduled_at)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Scadent:</strong> {human(s.due_at)}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

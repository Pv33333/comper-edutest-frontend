// src/pages/profesor/EleviGestionare.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/SupabaseAuthProvider.jsx";

import {
  createClass,
  listMyClasses,
  deleteClass,
} from "@/services/classesService.js";
import {
  addStudentByEmail,
  listStudentsForClass,
  removeStudentFromClass,
} from "@/services/enrollmentsService.js";
import {
  scheduleTestForClass,
  scheduleTestForStudent,
} from "@/services/assignmentsService.js";
import { getTestById } from "@/services/testsService.js";

export default function EleviGestionare() {
  const { user } = useAuth();
  const { search } = useLocation();

  const [testId, setTestId] = useState(null);
  const [testSelectat, setTestSelectat] = useState(null);

  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});

  // câmpuri creare clasă
  const [clasaNoua, setClasaNoua] = useState(""); // ex: VII
  const [literaNoua, setLiteraNoua] = useState(""); // ex: A

  // adăugare elev în clasa selectată
  const [emailElev, setEmailElev] = useState("");
  const [clasaSelectata, setClasaSelectata] = useState("");

  // dacă vii cu ?testId= în URL, afișăm butoanele de trimitere test
  useEffect(() => {
    const id = new URLSearchParams(search).get("testId");
    setTestId(id || null);
    if (!id) return;
    getTestById(id)
      .then(setTestSelectat)
      .catch(() => {});
  }, [search]);

  const reload = async () => {
    const cls = await listMyClasses();
    setClasses(cls);
    const map = {};
    for (const c of cls) map[c.id] = await listStudentsForClass(c.id);
    setStudentsByClass(map);
  };

  useEffect(() => {
    if (user) reload().catch(() => {});
  }, [user]);

  // ────────────────────────────── Actions ──────────────────────────────
  const onAddClass = async () => {
    const grade_level = String(clasaNoua).toUpperCase().trim();
    const letter =
      (literaNoua ? String(literaNoua).toUpperCase().trim() : "") || null;

    const allowed = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    if (!allowed.includes(grade_level)) {
      return alert(
        "Clasa trebuie să fie una dintre: 0, I, II, III, IV, V, VI, VII, VIII."
      );
    }
    if (letter && !/^[A-Z]$/.test(letter)) {
      return alert("Litera trebuie să fie o singură literă A–Z.");
    }

    try {
      await createClass({ grade_level, letter });
      setClasaNoua("");
      setLiteraNoua("");
      await reload();
      alert("✅ Clasa a fost creată.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "⚠️ Eroare la crearea clasei.");
    }
  };

  const onAddStudent = async () => {
    if (!clasaSelectata) return alert("Selectează o clasă.");
    if (!emailElev.trim()) return alert("Introdu emailul elevului.");
    try {
      await addStudentByEmail({
        class_id: clasaSelectata,
        email: emailElev.trim(),
      });
      setEmailElev("");
      // ✅ reîncarcă DOAR clasa selectată
      const data = await listStudentsForClass(clasaSelectata);
      setStudentsByClass((prev) => ({ ...prev, [clasaSelectata]: data }));
      alert("✅ Elev adăugat în clasă.");
    } catch (e) {
      console.error(e);
      alert(
        e?.message ||
          "⚠️ Eroare la adăugarea elevului. Asigură-te că elevul are cont."
      );
    }
  };

  const onRemoveStudent = async (classId, studentId, nume) => {
    if (
      !confirm(`Ștergi înscrierea lui ${nume || "elevul"} din această clasă?`)
    )
      return;
    try {
      await removeStudentFromClass({
        class_id: classId,
        student_id: studentId,
      });
      // ✅ reîncarcă DOAR clasa din care ai șters
      const data = await listStudentsForClass(classId);
      setStudentsByClass((prev) => ({ ...prev, [classId]: data }));
      alert("✅ Elevul a fost scos din clasă.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "⚠️ Eroare la ștergerea elevului din clasă.");
    }
  };

  const onDeleteClass = async (classId) => {
    const c = classes.find((x) => x.id === classId);
    const nume = c
      ? `Clasa ${c.grade_level}${c.letter ? " " + c.letter : ""}`
      : "clasa";
    if (!confirm(`Sigur ștergi ${nume}? Se vor șterge și înscrierile.`)) return;
    try {
      await deleteClass(classId);
      await reload();
      alert("✅ Clasa a fost ștearsă.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "⚠️ Eroare la ștergerea clasei.");
    }
  };

  const sendToClass = async (class_id) => {
    if (!testId) return alert("Selectează un test (parametrul ?testId=).");
    try {
      await scheduleTestForClass(
        testId,
        class_id,
        new Date().toISOString(),
        null
      );
      alert("✅ Testul a fost trimis clasei.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "⚠️ Eroare la trimiterea către clasă.");
    }
  };

  const sendToStudent = async (student_id, nume) => {
    if (!testId) return alert("Selectează un test (parametrul ?testId=).");
    try {
      await scheduleTestForStudent(
        testId,
        student_id,
        new Date().toISOString(),
        null
      );
      alert(`✅ Testul a fost trimis către ${nume || "elev"}.`);
    } catch (e) {
      console.error(e);
      alert(e?.message || "⚠️ Eroare la trimiterea către elev.");
    }
  };

  // ────────────────────────────── UI ──────────────────────────────
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <Link
          to="/profesor/dashboard"
          className="text-blue-700 hover:underline"
        >
          ← Înapoi la Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">📚 Gestionare Elevi</h1>

        {/* Card: Adaugă Clasă & Elev */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6 grid gap-6 md:grid-cols-2">
          {/* Adaugă Clasă */}
          <div>
            <label className="block text-sm mb-1">Clasă (0, I–VIII)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-3 py-2"
                placeholder="ex: VII"
                value={clasaNoua}
                onChange={(e) =>
                  setClasaNoua(e.target.value.toUpperCase().trim())
                }
              />
              <input
                className="w-24 border rounded-xl px-3 py-2"
                placeholder="Lit."
                maxLength={1}
                value={literaNoua}
                onChange={(e) =>
                  setLiteraNoua(e.target.value.toUpperCase().trim())
                }
              />
            </div>
            <button
              className="mt-2 w-full bg-blue-600 text-white rounded-xl py-2"
              onClick={onAddClass}
            >
              ➕ Adaugă Clasă
            </button>
          </div>

          {/* Adaugă Elev */}
          <div>
            <label className="block text-sm mb-1">Email elev</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="elev@exemplu.com"
              value={emailElev}
              onChange={(e) => setEmailElev(e.target.value)}
            />
            <label className="block text-sm mt-3 mb-1">Selectează clasa</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={clasaSelectata}
              onChange={(e) => setClasaSelectata(e.target.value)}
            >
              <option value="">Alege clasa</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade_level}
                  {c.letter ? ` ${c.letter}` : ""}
                </option>
              ))}
            </select>
            <button
              className="mt-2 w-full bg-blue-600 text-white rounded-xl py-2"
              onClick={onAddStudent}
            >
              👤 Adaugă Elev
            </button>
          </div>
        </div>

        {/* Liste clase + elevi */}
        <div className="mt-8 space-y-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-800">
                  🏫 Clasa {c.grade_level}
                  {c.letter ? ` ${c.letter}` : ""} (
                  {(studentsByClass[c.id] || []).length} elevi)
                </h3>
                <div className="flex gap-2">
                  <button
                    className="text-red-600"
                    onClick={() => onDeleteClass(c.id)}
                  >
                    ✖
                  </button>
                  {testId && (
                    <button
                      className="bg-green-600 text-white rounded px-3 py-1"
                      onClick={() => sendToClass(c.id)}
                    >
                      📤 Trimite tuturor
                    </button>
                  )}
                </div>
              </div>

              <ul className="mt-3 space-y-1">
                {(studentsByClass[c.id] || []).map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span>
                      👤 {e.nume} ({e.email})
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="bg-red-500 text-white rounded px-3 py-1 text-xs"
                        onClick={() => onRemoveStudent(c.id, e.id, e.nume)}
                      >
                        🗑️ Șterge
                      </button>
                      {testId && (
                        <button
                          className="bg-green-600 text-white rounded px-3 py-1 text-xs"
                          onClick={() => sendToStudent(e.id, e.nume)}
                        >
                          📤 Trimite elevului
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="text-gray-600 text-sm">
              Nu ai clase încă. Adaugă una mai sus.
            </div>
          )}
        </div>

        {/* footer info test ales */}
        {testId && testSelectat && (
          <div className="mt-6 text-sm text-gray-600">
            Test selectat:{" "}
            <span className="font-medium">{testSelectat.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

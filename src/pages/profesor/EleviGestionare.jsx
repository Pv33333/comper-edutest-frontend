// src/pages/profesor/EleviGestionare.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

/** Utils **/
const ls = {
  get(key, def) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
    } catch {
      return def;
    }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
};
const useQuery = () => new URLSearchParams(useLocation().search);
const isUUID = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );

function Badge({ children }) {
  return (
    <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2 py-0.5">
      {children}
    </span>
  );
}

/** Card special Trimitere test (UI only) */
function SendTestCard({
  test,
  onSendToAll,
  onScrollToClasses,
  onScrollToStudents,
}) {
  const subjectChip =
    test?.subject === "romana" || /rom/i.test(test?.materie || "") ? (
      <Badge>Limba română</Badge>
    ) : (
      <Badge>Matematică</Badge>
    );

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-900">Trimitere test</h2>
          <p className="text-sm text-gray-600">
            Alege cui trimiți testul selectat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subjectChip}
          {test?.school_class && <Badge>{test.school_class}</Badge>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-500">Data & Ora</div>
          <div className="font-medium">
            {test?.data || test?.exam_date || "—"}
            {test?.ora || test?.exam_time
              ? ` • ${test?.ora || test?.exam_time}`
              : ""}
          </div>
        </div>
        <div className="rounded-2xl border p-4 md:col-span-2">
          <div className="text-xs text-gray-500">Descriere</div>
          <div className="font-medium break-words">
            {test?.descriere || test?.description || "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSendToAll}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 shadow transition"
        >
          📤 Trimite tuturor claselor
        </button>
        <button
          type="button"
          onClick={onScrollToClasses}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
        >
          Selectează o clasă
        </button>
        <button
          type="button"
          onClick={onScrollToStudents}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
        >
          Selectează elev(i)
        </button>
      </div>
    </div>
  );
}

export default function EleviGestionare() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const q = useQuery();

  const testId = q.get("testId"); // /profesor/elevi?testId=<...>
  const owner = session?.user?.id || null;

  const [test, setTest] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [toast, setToast] = useState(null);

  // form state
  const [gradeLevel, setGradeLevel] = useState("");
  const [gradeLetter, setGradeLetter] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [classForStudent, setClassForStudent] = useState("");

  /** Load test (Supabase → local fallback) */
  const loadTest = useCallback(async () => {
    if (!testId) return setTest(null);
    try {
      if (isUUID(testId)) {
        const { data, error } = await supabase
          .from("tests")
          .select("*")
          .eq("id", testId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setTest(data);
          return;
        }
      }
    } catch {}
    // local fallback
    const arr = ls.get("teste_profesor", []);
    const local = arr.find((x) => String(x.id) === String(testId));
    if (local) setTest(local);
  }, [supabase, testId]);

  /** Load classes + students (Supabase → local fallback) */
  const loadClasses = useCallback(async () => {
    if (!owner) return;
    try {
      const { data: cls, error } = await supabase
        .from("classes")
        .select("*")
        .eq("created_by", owner)
        .order("grade_level", { ascending: true })
        .order("letter", { ascending: true });
      if (error) throw error;

      const map = {};
      for (const c of cls) {
        const { data: enrolls, error: e2 } = await supabase
          .from("class_enrollments")
          .select("student_id, students ( id, name, email )")
          .eq("class_id", c.id);
        if (e2) throw e2;
        map[c.id] = (enrolls || []).map((en) => ({
          id: en.students?.id,
          nume: en.students?.name,
          email: en.students?.email,
        }));
      }
      setClasses(cls);
      setStudentsByClass(map);
      return;
    } catch {
      // local fallback
      const cls = ls.get("classes_local", []);
      const map = ls.get("students_by_class_local", {});
      setClasses(cls);
      setStudentsByClass(map);
    }
  }, [owner, supabase]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);
  useEffect(() => {
    if (owner) loadClasses();
  }, [owner, loadClasses]);

  /** Add class */
  const addClass = async () => {
    const gl = String(gradeLevel).trim().toUpperCase();
    const lt =
      String(gradeLetter || "")
        .trim()
        .toUpperCase() || null;
    const allowed = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    if (!allowed.includes(gl)) {
      setToast({ type: "error", message: "Clasa trebuie să fie 0, I–VIII." });
      return;
    }

    try {
      const { error } = await supabase
        .from("classes")
        .insert({ grade_level: gl, letter: lt });
      if (error) throw error;
      setGradeLevel("");
      setGradeLetter("");
      await loadClasses();
      setToast({ type: "success", message: "Clasă creată." });
    } catch {
      // local
      const cls = ls.get("classes_local", []);
      const id = "LCL-" + Date.now();
      const row = { id, grade_level: gl, letter: lt, created_by: owner };
      ls.set("classes_local", [...cls, row]);
      const map = ls.get("students_by_class_local", {});
      if (!map[id]) map[id] = [];
      ls.set("students_by_class_local", map);
      setGradeLevel("");
      setGradeLetter("");
      await loadClasses();
      setToast({ type: "info", message: "Clasă creată local." });
    }
  };

  /** Add student + enroll */
  const addStudent = async () => {
    if (!classForStudent) {
      setToast({ type: "error", message: "Selectează o clasă." });
      return;
    }
    if (!studentEmail.trim()) {
      setToast({ type: "error", message: "Introdu emailul elevului." });
      return;
    }
    try {
      const { data: stu, error: e1 } = await supabase
        .from("students")
        .insert({ name: studentName || null, email: studentEmail.trim() })
        .select("*")
        .single();
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from("class_enrollments")
        .insert({ class_id: classForStudent, student_id: stu.id });
      if (e2) throw e2;

      setStudentName("");
      setStudentEmail("");
      setClassForStudent("");
      await loadClasses();
      setToast({ type: "success", message: "Elev adăugat." });
    } catch {
      // local
      const map = ls.get("students_by_class_local", {});
      const list = map[classForStudent] || [];
      list.push({
        id: "STU-" + Date.now(),
        nume: studentName || studentEmail.split("@")[0],
        email: studentEmail.trim(),
      });
      map[classForStudent] = list;
      ls.set("students_by_class_local", map);
      setStudentName("");
      setStudentEmail("");
      setClassForStudent("");
      await loadClasses();
      setToast({ type: "info", message: "Elev adăugat local." });
    }
  };

  /** Remove student from class */
  const removeStudent = async (classId, studentId) => {
    if (!confirm("Ștergi elevul din această clasă?")) return;
    try {
      const { error } = await supabase
        .from("class_enrollments")
        .delete()
        .eq("class_id", classId)
        .eq("student_id", studentId);
      if (error) throw error;
      await loadClasses();
      setToast({ type: "success", message: "Elev șters din clasă." });
    } catch {
      const map = ls.get("students_by_class_local", {});
      map[classId] = (map[classId] || []).filter((s) => s.id !== studentId);
      ls.set("students_by_class_local", map);
      await loadClasses();
      setToast({ type: "info", message: "Elev șters local." });
    }
  };

  /** Delete class */
  const deleteClass = async (classId) => {
    if (!confirm("Ștergi această clasă? Se vor șterge și înscrierile.")) return;
    try {
      await supabase.from("class_enrollments").delete().eq("class_id", classId);
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);
      if (error) throw error;
      await loadClasses();
      setToast({ type: "success", message: "Clasă ștearsă." });
    } catch {
      const cls = ls.get("classes_local", []).filter((c) => c.id !== classId);
      ls.set("classes_local", cls);
      const map = ls.get("students_by_class_local", {});
      delete map[classId];
      ls.set("students_by_class_local", map);
      await loadClasses();
      setToast({ type: "info", message: "Clasă ștearsă local." });
    }
  };

  /** Trimitere test (UUID-aware) */
  const scheduleAssignment = async ({ class_id = null, student_id = null }) => {
    if (!testId) {
      setToast({ type: "error", message: "Nu există test selectat." });
      return;
    }

    // Test local (ID TEST-...) → doar localStorage
    if (!isUUID(testId)) {
      const arr = ls.get("assignments_local", []);
      arr.push({
        id: "ASG-" + Date.now(),
        test_id: testId,
        class_id,
        student_id,
        scheduled_at: new Date().toISOString(),
      });
      ls.set("assignments_local", arr);
      setToast({
        type: "info",
        message: "Test înregistrat local pentru trimitere.",
      });
      return;
    }

    try {
      const payload = {
        test_id: testId,
        scheduled_at: new Date().toISOString(),
        ...(class_id ? { class_id } : {}),
        ...(student_id ? { student_id } : {}),
      };
      const { error } = await supabase.from("assignments").insert(payload);
      if (error) throw error;
      setToast({ type: "success", message: "Test trimis." });
    } catch (e) {
      console.error("Supabase insert error:", e);
      setToast({ type: "error", message: "Nu am putut trimite testul." });
    }
  };

  const sendToAllClasses = async () => {
    if (!classes.length) {
      setToast({ type: "error", message: "Nu ai clase încă." });
      return;
    }
    for (const c of classes) {
      await scheduleAssignment({ class_id: c.id });
    }
  };

  // anchors
  const scrollToClasses = () =>
    document
      .getElementById("sectiune-clase")
      ?.scrollIntoView({ behavior: "smooth" });
  const scrollToStudents = () =>
    document
      .getElementById("sectiune-elevi")
      ?.scrollIntoView({ behavior: "smooth" });

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.10),transparent)]">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back to dashboard */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/80 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">
            Gestionare elevi & clase
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Adaugă clase și elevi, apoi trimite testul selectat.
          </p>
        </div>

        {/* Send Test Card */}
        {testId && test && (
          <SendTestCard
            test={test}
            onSendToAll={sendToAllClasses}
            onScrollToClasses={scrollToClasses}
            onScrollToStudents={scrollToStudents}
          />
        )}

        {/* Quick add */}
        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-indigo-900">
            Adaugă rapid
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Class */}
            <div className="rounded-2xl border p-4">
              <div className="text-sm font-medium mb-2">Clasă nouă</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border px-3 py-2"
                  placeholder="Clasă (0, I–VIII)"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
                <input
                  className="w-24 rounded-xl border px-3 py-2"
                  placeholder="Lit."
                  maxLength={1}
                  value={gradeLetter}
                  onChange={(e) => setGradeLetter(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={addClass}
                className="mt-3 w-full rounded-xl bg-indigo-600 text-white py-2 hover:bg-indigo-700"
              >
                ➕ Creează clasă
              </button>
            </div>

            {/* Add Student */}
            <div className="rounded-2xl border p-4" id="sectiune-elevi">
              <div className="text-sm font-medium mb-2">Elev nou</div>
              <input
                className="w-full rounded-xl border px-3 py-2 mb-2"
                placeholder="Nume (opțional)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Email elev"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <label className="block text-xs text-gray-500 mt-3 mb-1">
                Înscrie în clasă
              </label>
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={classForStudent}
                onChange={(e) => setClassForStudent(e.target.value)}
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
                type="button"
                onClick={addStudent}
                className="mt-3 w-full rounded-xl bg-indigo-600 text-white py-2 hover:bg-indigo-700"
              >
                👤 Adaugă elev
              </button>
            </div>
          </div>
        </div>

        {/* Classes & students */}
        <div className="space-y-4" id="sectiune-clase">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-indigo-900">
                  Clasa {c.grade_level}
                  {c.letter ? ` ${c.letter}` : ""}
                </div>
                <div className="flex items-center gap-2">
                  {testId && (
                    <button
                      type="button"
                      className="rounded-xl bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700"
                      onClick={() => scheduleAssignment({ class_id: c.id })}
                    >
                      📤 Trimite clasei
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-xl border px-3 py-1 hover:bg-red-50 text-red-600 border-red-200"
                    onClick={() => deleteClass(c.id)}
                  >
                    🗑️ Șterge clasă
                  </button>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {(studentsByClass[c.id] || []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="text-sm">
                      {s.nume || "(fără nume)"}{" "}
                      <span className="text-gray-500">• {s.email}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {testId && (
                        <button
                          type="button"
                          className="rounded-xl border px-3 py-1 hover:bg-gray-50"
                          onClick={() =>
                            scheduleAssignment({ student_id: s.id })
                          }
                        >
                          📤 Trimite elevului
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-xl border px-3 py-1 hover:bg-red-50 text-red-600 border-red-200 text-xs"
                        onClick={() => removeStudent(c.id, s.id)}
                      >
                        Șterge
                      </button>
                    </div>
                  </li>
                ))}
                {(studentsByClass[c.id] || []).length === 0 && (
                  <li className="text-xs text-gray-500">
                    Niciun elev înscris încă.
                  </li>
                )}
              </ul>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="text-center text-gray-600 text-sm">
              Nu ai clase încă. Adaugă una din secțiunea de mai sus.
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={
              "mx-auto max-w-lg text-center rounded-2xl p-3 text-sm " +
              (toast.type === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300")
            }
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

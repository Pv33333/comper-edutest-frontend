// src/pages/profesor/EleviGestionare.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // ✅ un singur client global

/** Helpers (nicio modificare de logică existentă) **/
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

function SendTestCard({
  test,
  onSendToAll,
  onScrollToClasses,
  onScrollToStudents,
}) {
  const subject = test?.subject || test?.disciplina || "—";
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
          <Badge>{subject}</Badge>
          {test?.school_class && <Badge>{test.school_class}</Badge>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-500">Data & Ora</div>
          <div className="font-medium">
            {test?.exam_date || test?.data || "—"}
            {test?.exam_time || test?.ora
              ? ` • ${test?.exam_time || test?.ora}`
              : ""}
          </div>
        </div>
        <div className="rounded-2xl border p-4 md:col-span-2">
          <div className="text-xs text-gray-500">Descriere</div>
          <div className="font-medium break-words">
            {test?.description || test?.descriere || "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
  const q = useQuery();
  const testId = q.get("testId"); // /profesor/elevi?testId=<uuid>

  const [owner, setOwner] = useState(null);
  const [test, setTest] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [toast, setToast] = useState(null);

  // form
  const [gradeLevel, setGradeLevel] = useState("");
  const [gradeLetter, setGradeLetter] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [classForStudent, setClassForStudent] = useState("");

  // 🔎 Search bar premium (clase + elevi)
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSearch("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // auth user (prefer sesiunea curentă)
  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || null;
      if (!uid) {
        const { data } = await supabase.auth.getUser();
        setOwner(data?.user?.id || null);
      } else {
        setOwner(uid);
      }
    })();
  }, []);

  /** Load test */
  const loadTest = useCallback(async () => {
    if (!testId || !isUUID(testId)) return setTest(null);
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .maybeSingle();
    if (!error) setTest(data || null);
  }, [testId]);

  /** Load classes + students */
  const loadClasses = useCallback(async () => {
    if (!owner) return;

    const { data: cls, error } = await supabase
      .from("classes")
      .select("id, grade_level, letter, created_by, created_at")
      .eq("created_by", owner)
      .order("grade_level", { ascending: true })
      .order("letter", { ascending: true });
    if (error) return;

    setClasses(cls || []);

    const result = {};
    for (const c of cls || []) {
      const { data: enrolls } = await supabase
        .from("class_enrollments")
        .select("student_id")
        .eq("class_id", c.id);
      const ids = (enrolls || []).map((e) => e.student_id).filter(Boolean);
      let studs = [];
      if (ids.length) {
        const { data: sData } = await supabase
          .from("students")
          .select("id, name, email")
          .in("id", ids);
        studs =
          sData?.map((s) => ({
            id: s.id,
            nume: s.name,
            email: (s.email || "").toLowerCase(),
          })) || [];
      }
      result[c.id] = studs;
    }
    setStudentsByClass(result);
  }, [owner]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);
  useEffect(() => {
    if (owner) loadClasses();
  }, [owner, loadClasses]);

  /** Add class (buton modern) */
  const addClass = async () => {
    if (!owner)
      return setToast({
        type: "error",
        message: "Trebuie să fii autentificat.",
      });
    const gl = String(gradeLevel).trim().toUpperCase();
    const lt =
      String(gradeLetter || "")
        .trim()
        .toUpperCase() || null;
    const allowed = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    if (!allowed.includes(gl))
      return setToast({
        type: "error",
        message: "Clasa trebuie să fie 0, I–VIII.",
      });

    const { error } = await supabase
      .from("classes")
      .insert({ grade_level: gl, letter: lt, created_by: owner });
    if (error) {
      setToast({ type: "error", message: error.message });
    } else {
      setGradeLevel("");
      setGradeLetter("");
      await loadClasses();
      setToast({ type: "success", message: "Clasă creată." });
    }
  };

  /** Add student + enroll (buton modern) */
  const addStudent = async () => {
    if (!owner)
      return setToast({
        type: "error",
        message: "Trebuie să fii autentificat.",
      });
    if (!classForStudent)
      return setToast({ type: "error", message: "Selectează o clasă." });
    const email = (studentEmail || "").trim().toLowerCase();
    if (!email)
      return setToast({ type: "error", message: "Introdu emailul elevului." });

    // find or create by email
    let studentId = null;
    {
      const { data: existing } = await supabase
        .from("students")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      studentId = existing?.id || null;
    }
    if (!studentId) {
      const { data, error: e1 } = await supabase
        .from("students")
        .insert({
          id: crypto.randomUUID(),
          name: studentName || null,
          email,
          created_by: owner,
        })
        .select("id")
        .single();
      if (e1) return setToast({ type: "error", message: e1.message });
      studentId = data.id;
    }

    const { error: e2 } = await supabase
      .from("class_enrollments")
      .insert({ class_id: classForStudent, student_id: studentId });
    if (e2 && !String(e2.message || "").includes("duplicate key")) {
      return setToast({ type: "error", message: e2.message });
    }

    setStudentName("");
    setStudentEmail("");
    setClassForStudent("");
    await loadClasses();
    setToast({ type: "success", message: "Elev adăugat." });
  };

  /** Remove student */
  const removeStudent = async (classId, studentId) => {
    if (!isUUID(classId) || !isUUID(studentId))
      return setToast({ type: "error", message: "ID invalid." });
    const { error } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);
    if (error) setToast({ type: "error", message: error.message });
    else {
      await loadClasses();
      setToast({ type: "success", message: "Elev șters din clasă." });
    }
  };

  /** Delete class via RPC delete_class_safe */
  const deleteClass = async (classId) => {
    if (!confirm("Ștergi această clasă? Se vor șterge și înscrierile.")) return;
    const { error } = await supabase.rpc("delete_class_safe", {
      _class_id: classId,
    });
    if (error) setToast({ type: "error", message: error.message });
    else {
      await loadClasses();
      setToast({ type: "success", message: "Clasă ștearsă." });
    }
  };

  /** ==== TRIMITERE TEST (nemodificată) ==== */
  const scheduleForClass = async (classId) => {
    if (!owner)
      return setToast({
        type: "error",
        message: "Trebuie să fii autentificat.",
      });
    if (!testId)
      return setToast({ type: "error", message: "Nu există test selectat." });
    if (!isUUID(testId) || !isUUID(classId))
      return setToast({
        type: "error",
        message: "ID invalid pentru test sau clasă.",
      });

    const { data, error } = await supabase.rpc("schedule_test_safe", {
      _test_id: testId,
      _owner: owner,
      _target_class: classId,
      _target_student: null,
      _scheduled_at: new Date().toISOString(),
    });
    if (error) {
      console.error("schedule_test_safe error", error);
      setToast({
        type: "error",
        message: error.message || "Eroare la programarea testului.",
      });
    } else {
      setToast({
        type: data ? "success" : "info",
        message: data
          ? "Test programat pentru clasă."
          : "Deja era trimis clasei.",
      });
    }
  };

  const scheduleForStudent = async ({ classId = null, name, email }) => {
    if (!owner)
      return setToast({
        type: "error",
        message: "Trebuie să fii autentificat.",
      });
    if (!testId)
      return setToast({ type: "error", message: "Nu există test selectat." });
    const mail = (email || "").toLowerCase();
    if (!mail)
      return setToast({ type: "error", message: "Elevul nu are email." });

    const { data, error } = await supabase.rpc(
      "schedule_test_upsert_for_email",
      {
        _test_id: testId,
        _email: mail,
        _owner: owner,
        _class_id: isUUID(classId) ? classId : null,
        _name: name || null,
        _scheduled_at: new Date().toISOString(),
        _new_attempt: false,
      }
    );

    if (error) {
      console.error("schedule_test_upsert_for_email error", error);
      setToast({
        type: "error",
        message: error.message || "Eroare la trimiterea către elev.",
      });
    } else {
      setToast({
        type: data ? "success" : "info",
        message: data ? "Test trimis elevului." : "Deja era trimis elevului.",
      });
    }
  };

  // ancore + toast auto-hide
  const scrollToClasses = () =>
    document
      .getElementById("sectiune-clase")
      ?.scrollIntoView({ behavior: "smooth" });
  const scrollToStudents = () =>
    document
      .getElementById("sectiune-elevi")
      ?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /** 🔎 Filtrare client-side pentru clase & elevi (fără a altera datele) */
  const filteredClasses = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return classes;
    return classes.filter((c) => {
      const classLabel = `clasa ${c.grade_level}${
        c.letter ? " " + c.letter : ""
      }`.toLowerCase();
      const hasMatchClass = classLabel.includes(needle);
      const studs = studentsByClass[c.id] || [];
      const hasMatchStudent = studs.some(
        (s) =>
          String(s.nume || "")
            .toLowerCase()
            .includes(needle) ||
          String(s.email || "")
            .toLowerCase()
            .includes(needle)
      );
      return hasMatchClass || hasMatchStudent;
    });
  }, [search, classes, studentsByClass]);

  const highlight = (text) => {
    const t = String(text ?? "");
    const needle = search.trim();
    if (!needle) return t;
    const i = t.toLowerCase().indexOf(needle.toLowerCase());
    if (i === -1) return t;
    const before = t.slice(0, i);
    const mid = t.slice(i, i + needle.length);
    const after = t.slice(i + needle.length);
    return `${before}<mark class="bg-yellow-200 rounded px-0.5">${mid}</mark>${after}`;
  };

  /** UI */
  return (
    <div className="min-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
      {/* Accente decorative subtile */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl"></div>
      </div>

      {/* Înapoi la Dashboard (păstrat) */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">
            Gestionează clase și elevi
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Adaugă clase și elevi, apoi trimite testul selectat.
          </p>
        </div>

        {/* Card trimitere */}
        {testId && test && (
          <SendTestCard
            test={test}
            onSendToAll={async () => {
              if (!owner)
                return setToast({
                  type: "error",
                  message: "Trebuie să fii autentificat.",
                });
              if (!classes.length)
                return setToast({
                  type: "error",
                  message: "Nu ai clase încă.",
                });
              let created = 0,
                duplicate = 0,
                failed = 0;
              for (const c of classes) {
                const { data, error } = await supabase.rpc(
                  "schedule_test_safe",
                  {
                    _test_id: testId,
                    _owner: owner,
                    _target_class: c.id,
                    _target_student: null,
                    _scheduled_at: new Date().toISOString(),
                  }
                );
                if (error) failed++;
                else if (data) created++;
                else duplicate++;
              }
              setToast({
                type: failed ? "error" : duplicate ? "info" : "success",
                message: `Clase: ${created} create · ${duplicate} deja existau${
                  failed ? ` · ${failed} erori` : ""
                }.`,
              });
            }}
            onScrollToClasses={scrollToClasses}
            onScrollToStudents={scrollToStudents}
          />
        )}

        {/* Toolbar sticky: Search + Stats + Quick actions */}
        <div className="sticky top-3 z-10">
          <div className="rounded-3xl border border-blue-200 bg-white/90 shadow-xl p-4 md:p-5 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="md:flex-1">
                <label className="text-xs font-medium text-gray-600">
                  Căutare <span className="opacity-60">(apasă „/”)</span>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Caută în denumirea clasei, numele sau emailul elevului…"
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                    title="Șterge căutarea"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* micro-statistici */}
              <div className="grid grid-cols-3 gap-2 md:w-auto">
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Clase</div>
                  <div className="font-semibold">{classes.length}</div>
                </div>
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">După căutare</div>
                  <div className="font-semibold">{filteredClasses.length}</div>
                </div>
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Total elevi</div>
                  <div className="font-semibold">
                    {Object.values(studentsByClass).reduce(
                      (a, b) => a + (b?.length || 0),
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adaugă rapid – butoane premium/interactive */}
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
                  className="flex-1 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Clasă (0, I–VIII)"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
                <input
                  className="w-24 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Lit."
                  maxLength={1}
                  value={gradeLetter}
                  onChange={(e) => setGradeLetter(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={addClass}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-2 font-medium shadow-xl hover:opacity-95 active:scale-[.99] transition"
                title="Creează clasă"
              >
                ➕ Creează clasă
              </button>
            </div>

            {/* Add Student */}
            <div className="rounded-2xl border p-4" id="sectiune-elevi">
              <div className="text-sm font-medium mb-2">Elev nou</div>
              <input
                className="w-full rounded-xl border px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nume (opțional)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Email elev"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <label className="block text-xs text-gray-500 mt-3 mb-1">
                Înscrie în clasă
              </label>
              <select
                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-2 font-medium shadow-xl hover:opacity-95 active:scale-[.99] transition"
                title="Adaugă elev"
              >
                👤 Adaugă elev
              </button>
            </div>
          </div>
        </div>

        {/* Classes & students – listă filtrabilă */}
        <div className="space-y-4" id="sectiune-clase">
          {filteredClasses.map((c) => {
            const studs = studentsByClass[c.id] || [];
            const classTitle = `Clasa ${c.grade_level}${
              c.letter ? ` ${c.letter}` : ""
            }`;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="font-semibold text-indigo-900"
                    dangerouslySetInnerHTML={{ __html: highlight(classTitle) }}
                  />
                  <div className="flex items-center gap-2">
                    {testId && (
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700"
                        onClick={() => scheduleForClass(c.id)}
                        title="Trimite testul clasei"
                      >
                        📤 Trimite clasei
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-xl border px-3 py-1 hover:bg-red-50 text-red-600 border-red-200"
                      onClick={() => deleteClass(c.id)}
                      title="Șterge clasa"
                    >
                      🗑️ Șterge clasă
                    </button>
                  </div>
                </div>

                <ul className="mt-3 space-y-1">
                  {studs.map((s) => (
                    <li
                      key={s.id || s.email}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlight(s.nume || "(fără nume)"),
                          }}
                        />{" "}
                        <span className="text-gray-500">
                          •{" "}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlight((s.email || "").toLowerCase()),
                            }}
                          />
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        {testId && (
                          <button
                            type="button"
                            className="rounded-xl border px-3 py-1 hover:bg-gray-50"
                            onClick={() =>
                              scheduleForStudent({
                                classId: c.id,
                                name: s.nume,
                                email: s.email,
                              })
                            }
                            title="Trimite elevului"
                          >
                            📤 Trimite elevului
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-xl border px-3 py-1 hover:bg-red-50 text-red-600 border-red-200 text-xs"
                          onClick={() => removeStudent(c.id, s.id)}
                          title="Șterge elev din clasă"
                        >
                          Șterge
                        </button>
                      </div>
                    </li>
                  ))}
                  {studs.length === 0 && (
                    <li className="text-xs text-gray-500">
                      Niciun elev înscris încă.
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
          {filteredClasses.length === 0 && (
            <div className="text-center text-gray-600 text-sm rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-8">
              🔎 Niciun rezultat pentru filtrul curent.
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
                ? "bg-red-100 text-red-800 border-red-300"
                : "bg-blue-100 text-blue-800 border-blue-300")
            }
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

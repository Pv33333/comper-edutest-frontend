import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * DateTimePicker.jsx — versiune modernă, atractivă, interactivă
 * - UI modern (Tailwind), segmente pentru scope, chips pentru elevi selectați, căutare elevi
 * - Compatibilă cu FK UUID: `test_id (uuid)`, `student_ids (uuid[])`
 * - Rezolvă eroarea: `null value in column "created_by"` trimițând explicit `created_by = user.id`
 * - Afișează erori concrete din Supabase (message/details/code)
 *
 * Props:
 *  - selectedTestId?: string (uuid sau null)
 *  - classId?: string (uuid)
 *  - className?: string
 *  - classLabel?: string
 *  - fixedStudentIds?: string[] (uuid[])
 *  - defaultSubject?: string
 *  - defaultDescriere?: string
 *  - tip?: string
 *  - defaultScope?: 'private' | 'class' | 'students' | 'emails'
 *  - onSaved?: (row) => void
 */
const isUUID = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v || "");

export default function DateTimePicker({
  selectedTestId = null,
  classId = null,
  className = "",
  classLabel = "",
  fixedStudentIds = null,
  defaultSubject = "",
  defaultDescriere = "",
  tip = "Profesor",
  defaultScope = "private",
  onSaved,
}) {
  // --- UI state ---
  const [subject, setSubject] = useState(defaultSubject);
  const [descriere, setDescriere] = useState(defaultDescriere);
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState("09:00");
  const [scope, setScope] = useState(defaultScope);

  const [students, setStudents] = useState([]);          // [{id, name, email}]
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]); // string[] (uuid)
  const [emailList, setEmailList] = useState("");
  const [saving, setSaving] = useState(false);

  const classText = useMemo(() => classLabel || className || "", [classLabel, className]);

  // --- Load students by classId (pivot + fallback) ---
  useEffect(() => {
    let ignore = false;
    async function loadStudents() {
      if (!classId) {
        setStudents([]);
        setSelectedStudents([]);
        return;
      }
      try {
        const { data: enrolls, error: e1 } = await supabase
          .from("class_enrollments")
          .select("student:student_id ( id, name, email )")
          .eq("class_id", classId);
        if (e1) throw e1;

        let s = [];
        if (Array.isArray(enrolls) && enrolls.length) {
          s = enrolls.map((row) => row.student).filter(Boolean);
        } else {
          const { data: s2, error: e2 } = await supabase
            .from("students")
            .select("id, name, email")
            .eq("class_id", classId);
          if (e2) throw e2;
          s = s2 || [];
        }
        if (!ignore) setStudents(s);
      } catch (err) {
        console.error("Eroare încărcare elevi:", err?.message || err);
        if (!ignore) setStudents([]);
      }
    }
    loadStudents();
    return () => {
      ignore = true;
    };
  }, [classId]);

  // --- Apply fixedStudentIds when provided ---
  useEffect(() => {
    if (Array.isArray(fixedStudentIds) && fixedStudentIds.length) {
      setSelectedStudents(fixedStudentIds.map(String));
    }
  }, [fixedStudentIds]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const t = (s.name || "").toLowerCase() + " " + (s.email || "").toLowerCase();
      return t.includes(q);
    });
  }, [students, search]);

  function toggleStudent(id) {
    const sid = String(id);
    setSelectedStudents((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  }

  async function handleSave() {
    if (saving) return;

    // 1) Verifică autentificarea & obține user.id pentru created_by (REZOLVĂ EROAREA ta)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      alert("Trebuie să fii autentificat pentru a salva. Te rog, reconectează-te.");
      return;
    }
    const userId = userData.user.id;

    // 2) Validări de business
    if (selectedTestId && !isUUID(selectedTestId)) {
      alert("ID-ul testului nu este UUID valid (selectează un test real din baza de date).");
      return;
    }

    let finalScope = scope || "private";
    let studentIdsToSend = [];

    if (finalScope === "students") {
      studentIdsToSend = (selectedStudents || []).map(String).filter(Boolean);
      if (!studentIdsToSend.length) {
        alert("Selectează cel puțin un elev.");
        return;
      }
    }
    if (finalScope === "class" && !classId) {
      alert("Lipsește classId pentru trimitere către clasă.");
      return;
    }
    if (finalScope === "emails") {
      const emails = emailList
        .split(/[\s,;]+/g)
        .map((e) => e.trim())
        .filter(Boolean);
      if (!emails.length) {
        alert("Introdu cel puțin un email.");
        return;
      }
      // Notă: salvăm doar evenimentul; trimiterea efectivă de email se face ulterior via Edge Function/webhook.
    }

    // 3) Construiește payload-ul conform schemei (inclusiv created_by)
    const payload = {
      created_by: userId,                   // <— FIX: previne null la created_by
      test_id: selectedTestId ?? null,      // FK uuid sau null
      subject: subject?.trim() || "(fără subiect)",
      descriere: descriere?.trim() || "",
      tip: tip || "Profesor",
      event_date: eventDate,                // 'YYYY-MM-DD'
      event_time: eventTime,                // 'HH:MM'
      clasa: classText || null,
      scope: finalScope,                    // 'private' | 'draft' | 'class' | 'students' | 'emails'
      student_ids: finalScope === "students" ? studentIdsToSend : null, // uuid[] sau null
    };

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        alert(`Eroare la salvare: ${error.message || "cerere invalidă"}`);
        return;
      }

      if (typeof onSaved === "function") onSaved(data);
      // Feedback vizual discret (poți înlocui cu toast-ui dacă ai)
      alert("Eveniment salvat cu succes.");
    } catch (err) {
      console.error("Eroare la salvare:", err?.message || err);
      alert("Eroare la salvare. Vezi consola pentru detalii.");
    } finally {
      setSaving(false);
    }
  }

  // --- UI modern, fără dependențe externe ---
  const scopeOptions = [
    { key: "private", label: "Privat" },
    { key: "class", label: "Clasă" },
    { key: "students", label: "Elevi" },
    { key: "emails", label: "Email-uri" },
  ];

  return (
    <div className="rounded-2xl border bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-4 md:p-6 shadow-lg space-y-5 transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg md:text-xl font-semibold">Programează/Testează</h3>
          <p className="text-sm text-gray-500">Alege data, ora și destinatarii</p>
        </div>
        {selectedTestId ? (
          <span className="text-xs md:text-sm px-2 py-1 rounded-full border">
            Test: {isUUID(selectedTestId) ? selectedTestId : "ID invalid"}
          </span>
        ) : (
          <span className="text-xs md:text-sm px-2 py-1 rounded-full border">Fără test</span>
        )}
      </div>

      {/* Subject & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Subiect</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Test Matematică - Unit 3"
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-black/20 transition"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Descriere</span>
          <input
            type="text"
            value={descriere}
            onChange={(e) => setDescriere(e.target.value)}
            placeholder="Detalii opționale..."
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-black/20 transition"
          />
        </label>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Data</span>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-black/20 transition"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Ora</span>
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="h-11 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-black/20 transition"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Tip</span>
          <select
            value={tip}
            onChange={(e) => {}}
            disabled
            className="h-11 rounded-xl border px-3 bg-gray-50 dark:bg-neutral-800 text-gray-500 cursor-not-allowed"
          >
            <option value="Profesor">Profesor</option>
          </select>
        </label>
      </div>

      {/* Scope segmented control */}
      <div className="flex flex-wrap gap-2">
        {scopeOptions.map((opt) => {
          const active = scope === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setScope(opt.key)}
              className={`px-3 md:px-4 h-10 rounded-full border transition
                ${active ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"}`}
            >
              {opt.label}
            </button>
          );
        })}
        {classText ? (
          <span className="ml-auto text-xs md:text-sm px-2 py-1 rounded-full border bg-gray-50 dark:bg-neutral-800">
            Clasă: {classText}
          </span>
        ) : null}
      </div>

      {/* Students picker */}
      {scope === "students" && (
        <div className="rounded-xl border p-3 md:p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">Selectează elevi</div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume sau email..."
              className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-black/20 transition"
            />
          </div>

          {/* chips selected */}
          {!!selectedStudents.length && (
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 text-xs md:text-sm px-2 py-1 rounded-full bg-black text-white"
                >
                  {id.slice(0, 8)}…
                  <button
                    type="button"
                    className="opacity-80 hover:opacity-100"
                    onClick={() => toggleStudent(id)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* list */}
          <ul className="max-h-56 overflow-auto divide-y rounded-lg border">
            {filteredStudents.length ? (
              filteredStudents.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.name || "Fără nume"}</div>
                    {s.email ? <div className="text-xs text-gray-500 truncate">{s.email}</div> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={`h-8 px-3 rounded-full border text-sm transition ${
                      selectedStudents.includes(String(s.id))
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-gray-50 dark:bg-neutral-800"
                    }`}
                  >
                    {selectedStudents.includes(String(s.id)) ? "Selectat" : "Selectează"}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-sm text-gray-500">Nu există elevi de afișat.</li>
            )}
          </ul>
        </div>
      )}

      {/* Emails */}
      {scope === "emails" && (
        <div className="space-y-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Email-uri (separate prin virgulă/spațiu)</span>
            <textarea
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={3}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 transition"
              placeholder="ex1@școală.ro, ex2@școală.ro"
            />
          </label>
          <p className="text-xs text-gray-500">
            Notă: salvăm doar evenimentul; trimiterea efectivă a emailurilor se poate face ulterior prin Edge Function.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-5 rounded-xl bg-black text-white shadow-sm hover:shadow transition disabled:opacity-50"
        >
          {saving ? "Se salvează..." : "Salvează"}
        </button>
        <div className="text-xs md:text-sm text-gray-500">
          {selectedTestId
            ? isUUID(selectedTestId)
              ? "Test asociat (uuid valid)"
              : "Atenție: ID invalid de test"
            : "Fără test asociat"}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SUBJECTS = [
  { value: "", label: "Selectează disciplina" },
  { value: "Limba română", label: "Limba română" },
  { value: "Matematică", label: "Matematică" },
];

const CLASS_GROUPS = [
  { group: "Ciclul Primar", options: ["Clasa pregătitoare","Clasa I","Clasa a II-a","Clasa a III-a","Clasa a IV-a"] },
  { group: "Ciclul Gimnazial", options: ["Clasa a V-a","Clasa a VI-a","Clasa a VII-a","Clasa a VIII-a"] },
];

const TEST_TYPES = [
  { value: "", label: "Selectează tipul testului" },
  { value: "evaluare_curenta", label: "Evaluare Curentă" },
  { value: "evaluare_nationala", label: "Evaluare Națională" },
  { value: "test_elevi_mei", label: "Test pentru elevii mei" },
  { value: "teste_platforma", label: "Teste Platformă" },
  { value: "testele_mele", label: "Testele mele" },
];

function Field({ label, children, required=false, help }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {!!help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function ChoiceRow({ qIndex, idx, value, active, onText, onPick }) {
  const letter = String.fromCharCode(65 + idx);
  return (
    <div className={"group flex items-center gap-3 rounded-xl border p-2 transition shadow-sm " + (active ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow")}>
      <input
        type="radio"
        name={`q-${qIndex}-correct`}
        className="h-5 w-5 accent-emerald-600 cursor-pointer"
        checked={!!active}
        onChange={() => onPick(idx)}
        aria-label={`Marchează varianta ${letter} ca fiind corectă`}
      />
      <div className="w-8 text-sm font-semibold text-gray-700">{letter}.</div>
      <input
        type="text"
        className="flex-1 rounded-lg border border-transparent group-hover:border-indigo-200 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onText(e.target.value)}
        placeholder={`Răspuns ${letter}`}
      />
    </div>
  );
}

function Question({ index, value, onChange, onRemove }) {
  const set = (patch) => onChange(index, { ...value, ...patch });
  const { text = "", choices = ["", "", "", ""], correct_index = 0 } = value ?? {};
  const updateChoice = (i, val) => {
    const next = [...choices];
    next[i] = val;
    set({ choices: next });
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-md transition hover:shadow-lg">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-red-600 text-white shadow hover:bg-red-700"
        title="Șterge întrebarea"
        aria-label="Șterge întrebarea"
      >
        ✕
      </button>

      <Field label={`Întrebare ${index + 1}`} required>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={text}
          onChange={(e) => set({ text: e.target.value })}
          placeholder="Introduceți textul întrebării"
        />
      </Field>

      <div className="mt-4 space-y-2">
        {[0,1,2,3].map((i) => (
          <ChoiceRow
            key={i}
            qIndex={index}
            idx={i}
            value={choices[i] ?? ""}
            active={Number(correct_index) === i}
            onText={(val) => updateChoice(i, val)}
            onPick={(iPick) => set({ correct_index: iPick })}
          />
        ))}
        <p className="text-xs text-gray-500 mt-2">Selectează varianta corectă bifând bulina de lângă răspuns.</p>
      </div>
    </div>
  );
}

export default function CreareTest() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const search = new URLSearchParams(useLocation().search);
  const editId = search.get("id");

  const [form, setForm] = useState({
    subject: "",
    schoolClass: "",
    testType: "",
    competency: "",
    description: "",
    teacherName: "",
    date: "",
    time: "",
  });
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [toast, setToast] = useState(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const addQuestion = () => setQuestions((q) => [...q, { text: "", choices: ["","","",""], correct_index: 0 }]);
  const updateQuestion = (idx, next) => setQuestions((arr) => arr.map((q,i) => (i===idx ? next : q)));
  const removeQuestion = (idx) => setQuestions((arr) => arr.filter((_,i) => i!==idx));

  const isValid = useMemo(() => {
    const { subject, schoolClass, testType, description, date, time } = form;
    if (!subject || !schoolClass || !testType || !description || !date || !time) return false;
    if (questions.length === 0) return false;
    for (const q of questions) {
      if (!q.text?.trim()) return false;
      if (q.choices?.length !== 4 || q.choices.some((c) => !c?.trim())) return false;
      if (q.correct_index < 0 || q.correct_index > 3) return false;
    }
    return true;
  }, [form, questions]);

  useEffect(() => {
    if (!editId && questions.length === 0) {
      setQuestions([{ text: "", choices: ["","","",""], correct_index: 0 }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        setLoading(true);
        const { data: t, error } = await supabase
          .from("tests")
          .select("*, test_questions(*)")
          .eq("id", editId)
          .maybeSingle();
        if (error) throw error;
        if (!t) return;

        setForm({
          subject: (t.subject?.toLowerCase()?.includes("rom") ? "Limba română" : "Matematică"),
          schoolClass: t.school_class || "",
          testType: t.test_type || "",
          competency: t.competency || "",
          description: t.description || "",
          teacherName: t.teacher_name || "",
          date: t.exam_date || "",
          time: t.exam_time || "",
        });

        const qs = (t.test_questions || []).map(q => ({
          text: q.text || "",
          choices: Array.isArray(q.choices) ? q.choices : [q.choices?.[0] ?? "", q.choices?.[1] ?? "", q.choices?.[2] ?? "", q.choices?.[3] ?? ""],
          correct_index: Number(q.correct_index ?? 0),
        }));
        setQuestions(qs.length ? qs : [{ text: "", choices: ["","","",""], correct_index: 0 }]);
      } catch (e) {
        console.error(e);
        setToast({ type: "error", message: "Nu am putut încărca testul pentru editare." });
      } finally {
        setLoading(false);
      }
    })();
  }, [editId, supabase]);

  const saveLocalMirror = (payload) => {
    try {
      const arr = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
      const idx = arr.findIndex(x => x.id === payload.id);
      if (idx >= 0) arr[idx] = payload; else arr.push(payload);
      localStorage.setItem("teste_profesor", JSON.stringify(arr));
    } catch {}
  };

  const canonicalSubject = (value) => {
    const s = (value || "").toLowerCase();
    if (s.includes("rom")) return "romana";
    return "matematica";
  };

  const handleSave = async () => {
    if (!isValid) {
      setToast({ type: "error", message: "Completează câmpurile obligatorii și adaugă cel puțin o întrebare validă." });
      return;
    }
    setSaving(true);
    setToast(null);

    const owner = session?.user?.id ?? null;
    const testPayload = {
      subject: canonicalSubject(form.subject),
      school_class: form.schoolClass,
      test_type: form.testType,
      competency: form.competency || null,
      description: form.description,
      teacher_name: form.teacherName || null,
      exam_date: form.date,
      exam_time: form.time,
      created_by: owner,
    };

    try {
      let testId = editId;
      if (editId) {
        const { error: upErr } = await supabase.from("tests").update(testPayload).eq("id", editId);
        if (upErr) throw upErr;

        const { error: delQ } = await supabase.from("test_questions").delete().eq("test_id", editId);
        if (delQ) throw delQ;
        const qRows = questions.map((q) => ({
          test_id: editId,
          text: q.text,
          choices: q.choices,
          correct_index: q.correct_index,
        }));
        const { error: insQ } = await supabase.from("test_questions").insert(qRows);
        if (insQ) throw insQ;
      } else {
        const { data: tRow, error: tErr } = await supabase.from("tests").insert(testPayload).select("id").single();
        if (tErr) throw tErr;
        testId = tRow.id;

        const qRows = questions.map((q) => ({
          test_id: testId,
          text: q.text,
          choices: q.choices,
          correct_index: q.correct_index,
        }));
        const { error: qErr } = await supabase.from("test_questions").insert(qRows);
        if (qErr) throw qErr;
      }

      const localMirror = {
        id: testId,
        materie: form.subject,
        clasa: form.schoolClass,
        tip: form.testType,
        descriere: form.description,
        profesor: form.teacherName,
        data: form.date,
        ora: form.time,
        intrebari: questions.map((q) => ({
          intrebare: q.text,
          variante: q.choices,
          corect: q.choices[q.correct_index],
        })),
        status: "neexpediat",
        trimis: true,
        link: `/elev/rezolva-test?id=${testId}`,
      };
      saveLocalMirror(localMirror);

      setToast({ type: "success", message: "Test salvat." });
      setTimeout(() => navigate("/profesor/teste"), 600);
    } catch (e) {
      console.error("Supabase save error:", e);
      const msg = e?.message || "Eroare necunoscută";
      const localId = editId || ("TEST-" + Date.now());
      saveLocalMirror({
        id: localId,
        materie: form.subject,
        clasa: form.schoolClass,
        tip: form.testType,
        descriere: form.description,
        profesor: form.teacherName,
        data: form.date,
        ora: form.time,
        intrebari: questions.map((q) => ({
          intrebare: q.text,
          variante: q.choices,
          corect: q.choices[q.correct_index],
        })),
        status: "neexpediat",
        trimis: true,
        link: `/elev/rezolva-test?id=${localId}`,
      });
      setToast({ type: "error", message: `Nu am putut salva. ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-5xl p-6">
          <p>Se încarcă testul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.12),transparent)]">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* Back-to-dashboard centered */}
        <div className="mb-6 flex justify-center">
          <Link to="/profesor/dashboard" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/80 backdrop-blur shadow">
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">Creează test grilă</h1>
          <p className="mt-1 text-sm text-gray-600">Completează detaliile testului și adaugă întrebări. Câmpurile marcate cu * sunt obligatorii.</p>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Disciplină" required>
              <select
                value={form.subject}
                onChange={(e) => update({ subject: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUBJECTS.map((s) => <option key={s.value || s.label} value={s.value}>{s.label}</option>)}
              </select>
            </Field>

            <Field label="Clasă" required>
              <select
                value={form.schoolClass}
                onChange={(e) => update({ schoolClass: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selectează clasa</option>
                {CLASS_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>

            <Field label="Tip test" required>
              <select
                value={form.testType}
                onChange={(e) => update({ testType: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TEST_TYPES.map((t) => <option key={t.value || t.label} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <Field label="Competență">
              <input
                type="text"
                value={form.competency}
                onChange={(e) => update({ competency: e.target.value })}
                placeholder="Ex: Rezolvare de probleme cu fracții"
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            <Field label="Profesor">
              <input
                type="text"
                value={form.teacherName}
                onChange={(e) => update({ teacherName: e.target.value })}
                placeholder="Nume Prenume"
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            <Field label="Dată" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            <Field label="Oră" required>
              <input
                type="time"
                value={form.time}
                onChange={(e) => update({ time: e.target.value })}
                className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Descriere" required>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Scurtă descriere a testului..."
                />
              </Field>
            </div>
          </div>

          {/* Questions */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-indigo-900">Întrebări grilă</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700 transition"
              >
                ➕ Adaugă întrebare
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Question
                  key={idx}
                  index={idx}
                  value={q}
                  onChange={updateQuestion}
                  onRemove={removeQuestion}
                />
              ))}
            </div>

            {/* Toast (inside card) */}
            {toast && (
              <div
                className={
                  "mt-6 rounded-2xl p-3 text-sm " +
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

        {/* SAVE BUTTON — centered bottom, no sticky bar */}
        <div className="mt-8 mb-10 flex justify-center">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className={"rounded-2xl px-8 py-3 font-semibold text-white shadow-xl transition " + (saving ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700")}
            aria-busy={saving}
          >
            {saving ? (editId ? "Se actualizează..." : "Se salvează...") : "💾 Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}
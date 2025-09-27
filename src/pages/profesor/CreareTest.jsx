import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/* =========================
   CONSTANTE
   ========================= */
const SUBJECTS = [
  { value: "", label: "Selectează disciplina" },
  { value: "Limba română", label: "Limba română" },
  { value: "Matematică", label: "Matematică" },
];

const CLASS_GROUPS = [
  {
    group: "Ciclul Primar",
    options: [
      "Clasa pregătitoare",
      "Clasa I",
      "Clasa a II-a",
      "Clasa a III-a",
      "Clasa a IV-a",
    ],
  },
  {
    group: "Ciclul Gimnazial",
    options: ["Clasa a V-a", "Clasa a VI-a", "Clasa a VII-a", "Clasa a VIII-a"],
  },
];

const TEST_TYPES = [
  { value: "", label: "Selectează tipul testului" },
  { value: "evaluare_curenta", label: "Evaluare Curentă" },
  { value: "evaluare_nationala", label: "Evaluare Națională" },
  { value: "test_elevi_mei", label: "Test pentru elevii mei" },
  { value: "teste_platforma", label: "Teste Platformă" },
  { value: "testele_mele", label: "Testele mele" },
];

/* =========================
   UI HELPERS
   ========================= */
function Chip({ children, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Field({ label, children, required = false, help, valid = true }) {
  return (
    <div className="space-y-1 group">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {!valid && <Chip tone="red">Completați câmpul</Chip>}
      </div>
      {children}
      {!!help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}

function ChoiceRow({ qIndex, idx, value, active, onText, onPick }) {
  const letter = String.fromCharCode(65 + idx);
  return (
    <div
      className={
        "group relative flex items-center gap-3 rounded-xl border p-2 transition shadow-sm " +
        (active
          ? "border-emerald-400 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow")
      }
    >
      <input
        type="radio"
        name={`q-${qIndex}-correct`}
        className="h-5 w-5 accent-emerald-600 cursor-pointer"
        checked={!!active}
        onChange={() => onPick(idx)}
      />
      <div className="w-8 text-sm font-semibold text-slate-700">{letter}.</div>
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
  const {
    text = "",
    choices = ["", "", "", ""],
    correct_index = 0,
  } = value ?? {};
  const updateChoice = (i, val) => {
    const next = [...choices];
    next[i] = val;
    set({ choices: next });
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-md transition hover:shadow-lg">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-red-600 text-white"
      >
        ✕
      </button>

      <Field label={`Întrebare ${index + 1}`} required valid={!!text.trim()}>
        <input
          type="text"
          className="w-full rounded-lg border p-2"
          value={text}
          onChange={(e) => set({ text: e.target.value })}
          placeholder="Introduceți textul întrebării"
        />
      </Field>

      <div className="mt-4 space-y-2">
        {[0, 1, 2, 3].map((i) => (
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
      </div>
    </div>
  );
}

/* =========================
   PAGINA PRINCIPALĂ
   ========================= */
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
  const addQuestion = () =>
    setQuestions((q) => [
      ...q,
      { text: "", choices: ["", "", "", ""], correct_index: 0 },
    ]);
  const updateQuestion = (idx, next) =>
    setQuestions((arr) => arr.map((q, i) => (i === idx ? next : q)));
  const removeQuestion = (idx) =>
    setQuestions((arr) => arr.filter((_, i) => i !== idx));

  const isValid = useMemo(() => {
    const { subject, schoolClass, testType, description, date, time } = form;
    if (!subject || !schoolClass || !testType || !description || !date || !time)
      return false;
    if (questions.length === 0) return false;
    for (const q of questions) {
      if (!q.text?.trim()) return false;
      if (q.choices?.length !== 4 || q.choices.some((c) => !c?.trim()))
        return false;
      if (q.correct_index < 0 || q.correct_index > 3) return false;
    }
    return true;
  }, [form, questions]);

  const canonicalSubject = (value) => {
    const s = (value || "").toLowerCase();
    if (s.includes("rom")) return "romana";
    return "matematica";
  };

  /* Salvare */
  const handleSave = async () => {
    if (!isValid) {
      setToast({
        type: "error",
        message:
          "Completează câmpurile obligatorii și adaugă cel puțin o întrebare validă.",
      });
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
      status: "draft",
    };

    try {
      let testId = editId;
      if (editId) {
        await supabase.from("tests").update(testPayload).eq("id", editId);
        await supabase.from("test_questions").delete().eq("test_id", editId);
        const qRows = questions.map((q) => ({
          test_id: editId,
          text: q.text,
          choices: q.choices,
          correct_index: q.correct_index,
        }));
        await supabase.from("test_questions").insert(qRows);
      } else {
        const { data: tRow, error: tErr } = await supabase
          .from("tests")
          .insert(testPayload)
          .select("id")
          .single();
        if (tErr) throw tErr;
        testId = tRow.id;

        const qRows = questions.map((q) => ({
          test_id: testId,
          text: q.text,
          choices: q.choices,
          correct_index: q.correct_index,
        }));
        await supabase.from("test_questions").insert(qRows);
      }

      setToast({
        type: "success",
        message: "✅ Test salvat. Îl găsești acum în pagina Testele mele.",
      });
      setTimeout(() => navigate("/profesor/teste"), 700);
    } catch (e) {
      console.error("Supabase save error:", e);
      setToast({ type: "error", message: "Nu am putut salva testul." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Se încarcă testul...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-indigo-900">
          Creează test grilă
        </h1>

        {/* Formular */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Field label="Disciplină" required valid={!!form.subject}>
            <select
              value={form.subject}
              onChange={(e) => update({ subject: e.target.value })}
              className="w-full rounded-lg border p-2"
            >
              {SUBJECTS.map((s) => (
                <option key={s.value || s.label} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Clasă" required valid={!!form.schoolClass}>
            <select
              value={form.schoolClass}
              onChange={(e) => update({ schoolClass: e.target.value })}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Selectează clasa</option>
              {CLASS_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Tip test" required valid={!!form.testType}>
            <select
              value={form.testType}
              onChange={(e) => update({ testType: e.target.value })}
              className="w-full rounded-lg border p-2"
            >
              {TEST_TYPES.map((t) => (
                <option key={t.value || t.label} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Competență">
            <input
              type="text"
              value={form.competency}
              onChange={(e) => update({ competency: e.target.value })}
              className="w-full rounded-lg border p-2"
            />
          </Field>

          <Field label="Profesor">
            <input
              type="text"
              value={form.teacherName}
              onChange={(e) => update({ teacherName: e.target.value })}
              className="w-full rounded-lg border p-2"
            />
          </Field>

          <Field label="Dată" required valid={!!form.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
              className="w-full rounded-lg border p-2"
            />
          </Field>

          <Field label="Oră" required valid={!!form.time}>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update({ time: e.target.value })}
              className="w-full rounded-lg border p-2"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Descriere" required valid={!!form.description}>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                className="w-full rounded-lg border p-2"
              />
            </Field>
          </div>
        </div>

        {/* Întrebări */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Întrebări grilă</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
            >
              ➕ Adaugă întrebare
            </button>
          </div>

          <div className="space-y-4 mt-4">
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
        </div>

        {toast && (
          <div
            className={`mt-6 rounded-2xl p-3 text-sm ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 rounded-xl text-white font-semibold ${
              saving
                ? "bg-emerald-400"
                : isValid
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Se salvează..." : "💾 Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

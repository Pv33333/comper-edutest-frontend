import React, { useEffect, useMemo, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

/* Config opțiuni */
const MATERII = ["Română", "Matematică"];
const CLASE = [
  "Clasa Pregătitoare",
  "Clasa I",
  "Clasa a II-a",
  "Clasa a III-a",
  "Clasa a IV-a",
  "Clasa a V-a",
  "Clasa a VI-a",
  "Clasa a VII-a",
  "Clasa a VIII-a",
];
const TIPURI = ["Test programat", "Test Comper", "Test Platformă", "Alt tip"];

export default function DateTimePicker({ onClose, onSaved, defaultDate = "" }) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const todayISO = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [date, setDate] = useState(defaultDate || todayISO);
  const [time, setTime] = useState(() => {
    // rotunjire la următoarea jumătate de oră
    const d = new Date();
    const mins = d.getMinutes();
    const rounded = mins < 30 ? 30 : 60;
    if (rounded === 60) d.setHours(d.getHours() + 1, 0, 0, 0);
    else d.setMinutes(30, 0, 0);
    return d.toTimeString().slice(0, 5);
  });

  const [subject, setSubject] = useState(MATERII[0]);
  const [clasa, setClasa] = useState(CLASE[0]);
  const [desc, setDesc] = useState("");
  const [tip, setTip] = useState(TIPURI[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const isValid = useMemo(
    () => !!date && !!time && !!subject && !!clasa,
    [date, time, subject, clasa]
  );

  const confirm = async () => {
    setErr("");
    if (!isValid) {
      setErr("Completează Materia, Clasa, Data și Ora.");
      return;
    }
    setSaving(true);

    const newEvent = {
      created_by: user?.id || "local",
      subject,
      descriere: desc,
      disciplina: subject, // păstrat dacă ai câmpul în DB
      clasa,
      tip,
      event_date: date, // YYYY-MM-DD (en-CA)
      event_time: time, // HH:mm
      source: "profesor",
      anulat: false,
    };

    try {
      if (user?.id) {
        const { error } = await supabase
          .from("calendar_events")
          .insert([newEvent]);
        if (error) throw error;
      } else {
        // fallback local
        const saved = JSON.parse(
          localStorage.getItem("tests_from_prof") || "[]"
        );
        saved.push({ id: `${date}_${time}_${subject}_${clasa}`, ...newEvent });
        localStorage.setItem("tests_from_prof", JSON.stringify(saved));
      }
      onSaved?.(newEvent);
      onClose?.();
    } catch (e) {
      console.error("Eroare salvare test:", e);
      setErr("Nu am putut salva testul. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  // Esc pentru închidere
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6">
      {/* backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full sm:max-w-xl bg-white/90 backdrop-blur rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/60">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-indigo-900">
            🗓 Programează test
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
          >
            Închide ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 gap-3">
          {/* Materie & Clasa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Materie</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              >
                {MATERII.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Clasa</label>
              <select
                value={clasa}
                onChange={(e) => setClasa(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              >
                {CLASE.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data & Ora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Ora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              />
            </div>
          </div>

          {/* Tip & Descriere */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Tip test</label>
              <select
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              >
                {TIPURI.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">
                Descriere (opțional)
              </label>
              <input
                type="text"
                placeholder="Ex: Test recapitulativ capitolul 2"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 bg-white/80"
              />
            </div>
          </div>

          {/* Eroare */}
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            Anulează
          </button>
          <button
            onClick={confirm}
            disabled={saving || !isValid}
            className={`rounded-xl px-4 py-2 text-sm text-white shadow transition
              ${
                saving || !isValid
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {saving ? "Se salvează…" : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

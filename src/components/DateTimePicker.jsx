import React, { useEffect, useState } from "react";

export default function DateTimePicker({ onConfirm, onCancel }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");

  const confirm = () => {
    if (!date || !time) {
      alert("Selectează data și ora.");
      return;
    }
    onConfirm?.({ date, time, subject, desc });
  };

  // Escape with ESC
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold">🗓 Programează în calendar</h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Materie (opțional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Descriere (opțional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Anulează</button>
          <button onClick={confirm} className="px-4 py-2 rounded bg-blue-600 text-white">Salvează</button>
        </div>
      </div>
    </div>
  );
}
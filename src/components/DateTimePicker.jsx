// ✅ DateTimePicker.jsx – reparat JSX + validare completă
import React, { useState } from "react";

const DateTimePicker = ({ onConfirm, onCancel }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");

  const confirm = () => {
    if (!date || !time || !subject || !desc) {
      alert("⚠️ Completează toate câmpurile!");
      return;
    }
    onConfirm({ date, time, subject, desc });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-full max-w-sm">
        <h2 className="text-lg font-semibold">🗓 Programează testul</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Materie"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Descriere"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onCancel} className="text-sm text-gray-600 hover:underline">Renunță</button>
          <button onClick={confirm} className="text-sm text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            ✅ Programează
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
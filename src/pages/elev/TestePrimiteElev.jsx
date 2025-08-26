// src/pages/elev/TestePrimiteElev.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStudentAssignments } from "@/services/calendarService.js";
import { hideAssignment } from "@/services/assignmentsService.js";

export default function TestePrimiteElev() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await listStudentAssignments(); // exclude deja testele ascunse
      setTests(data || []);
    } catch (e) {
      setErr(e?.message || "A apărut o eroare la încărcarea testelor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onHide = async (scheduledId) => {
    try {
      // optimist: scoatem local
      setTests((prev) => prev.filter((t) => t.id !== scheduledId));
      await hideAssignment(scheduledId); // scrie în DB
    } catch (e) {
      // rollback simplu
      await load();
      alert(e?.message || "Nu am putut ascunde testul.");
    }
  };

  if (loading) return <div className="p-6">Se încarcă…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📥 Teste primite</h1>
        <Link className="text-blue-600 hover:underline" to="/elev/dashboard">
          ← Înapoi la Dashboard
        </Link>
      </div>

      {err && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
          {err}
        </div>
      )}

      {tests.length === 0 ? (
        <div className="mt-6 text-gray-600">Nu ai teste noi.</div>
      ) : (
        <ul className="mt-6 space-y-4">
          {tests.map((t) => {
            const test = t.tests || {};
            return (
              <li key={t.id} className="p-4 bg-white rounded-xl shadow border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-800">
                      {test.title || "Test"}
                    </h2>
                    <div className="text-sm text-gray-600">
                      Materie: <b>{test.subject || "-"}</b> · Clasa:{" "}
                      <b>{test.grade_level || "-"}</b>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Programat: {new Date(t.scheduled_at).toLocaleString()}
                      {t.due_at
                        ? ` · Scadent: ${new Date(t.due_at).toLocaleString()}`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/elev/rezolva-test/${t.test_id}`}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                    >
                      ▶️ Deschide
                    </Link>

                    {/* Înlocuim Șterge cu Ascunde (persistă în Supabase) */}
                    <button
                      onClick={() => onHide(t.id)} // t.id = scheduled_tests.id
                      className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 text-sm"
                      title="Ascunde din lista mea (nu șterge din server)"
                    >
                      🗂️ Ascunde
                    </button>
                  </div>
                </div>

                {/* Descriere opțională */}
                {test?.content?.descriere && (
                  <p className="text-sm text-gray-700 mt-3">
                    {test.content.descriere}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

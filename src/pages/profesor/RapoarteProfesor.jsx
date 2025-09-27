
// src/pages/profesor/RapoarteProfesor.jsx
// Premium lista rapoarte profesor (ca la elev): carduri premium, search bar, buton Dashboard, Revizuire + Raport

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Eye, FileText } from "lucide-react";

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const RapoarteProfesor = () => {
  const [rapoarte, setRapoarte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qList, setQList] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("results_with_questions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) console.error("Eroare:", error.message);
      setRapoarte(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-6 pb-12">
      <div className="flex flex-col items-center pt-10 pb-6">
        <Link to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm bg-white/80 backdrop-blur shadow hover:shadow-lg transition">
          ⬅ Înapoi la Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-blue-900 mt-4">📊 Rapoarte elevi</h1>
      </div>
      <div className="mt-3 mx-auto max-w-3xl">
        <input value={qList} onChange={(e) => setQList(e.target.value)}
          placeholder="Caută după materie, elev, email, clasă…"
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur" />
      </div>
      {loading ? (
        <p className="text-center text-gray-500 mt-6">Se încarcă...</p>
      ) : rapoarte.length === 0 ? (
        <p className="text-center text-gray-600 mt-6">Nu există rapoarte.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {rapoarte.filter((r) => {
            const needle = qList.toLowerCase();
            return (
              r.test_subject?.toLowerCase().includes(needle) ||
              r.teacher_name?.toLowerCase().includes(needle) ||
              r.school_class?.toLowerCase().includes(needle) ||
              r.test_type?.toLowerCase().includes(needle) ||
              r.student_name?.toLowerCase().includes(needle) ||
              r.student_email?.toLowerCase().includes(needle) ||
              r.description?.toLowerCase().includes(needle)
            );
          }).map((r) => (
            <div key={r.result_id}
              className="rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition p-6">
              <h3 className="font-bold text-blue-900">{r.student_name ?? "—"}</h3>
              <p className="text-sm text-gray-600">{r.student_email ?? "—"}</p>
              <p className="text-sm text-gray-600">📘 {r.test_subject}</p>
              <p className="text-sm text-gray-600">🏫 {r.school_class}</p>
              <p className="text-sm text-gray-600">🏷 {r.test_type}</p>
              <p className="text-sm text-gray-600">👨‍🏫 {r.teacher_name}</p>
              <p className="text-xs text-gray-500 mt-1">🗓 {formatDate(r.submitted_at)}</p>
              {r.description && <p className="text-sm text-gray-600 mt-1">📝 {r.description}</p>}
              <div className="mt-4 flex gap-2">
                <Link to={`/profesor/raport-detaliat/${r.result_id}?view=revizuire`}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700">
                  <Eye size={14} className="inline mr-1" /> Revizuire
                </Link>
                <Link to={`/profesor/raport-detaliat/${r.result_id}?view=raport`}
                  className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow hover:bg-indigo-700">
                  <FileText size={14} className="inline mr-1" /> Raport
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RapoarteProfesor;

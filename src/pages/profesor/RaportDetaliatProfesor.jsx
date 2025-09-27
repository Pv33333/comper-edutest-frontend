
// src/pages/profesor/RaportDetaliatProfesor.jsx
// Premium ca la elev: Revizuire simplă vs Raport detaliat cu grafice

import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const normalizeChoice = (c) => {
  if (!c) return "";
  if (typeof c === "string") return c;
  if (typeof c === "number") return String(c);
  if (typeof c === "object") return c.text || c.label || Object.values(c).join(" / ");
  return String(c);
};

const RaportDetaliatProfesor = () => {
  const { id } = useParams();
  const location = useLocation();
  const view = new URLSearchParams(location.search).get("view") || "revizuire";

  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [student, setStudent] = useState(null);
  const [qFilter, setQFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: res } = await supabase.from("results").select("*").eq("id", id).single();
      if (!res) return;
      setResult(res);

      const { data: m } = await supabase.from("test_meta_unified").select("*").eq("test_id", res.test_id).single();
      setMeta(m || {});

      if (res.student_id) {
        const { data: s } = await supabase.from("profiles").select("*").eq("id", res.student_id).single();
        setStudent(s);
      }
    };
    load();
  }, [id]);

  const questions = meta?.items || [];
  const answerKey = meta?.answer_key || {};
  const answers = result?.answers || {};

  const calcScore = () => {
    const total = questions.length;
    let correct = 0;
    questions.forEach((q, i) => {
      if (String(answers?.[i]).toUpperCase() === String(answerKey?.[i]).toUpperCase()) correct++;
    });
    return { correct, total, score: total > 0 ? Math.round((correct / total) * 100) : 0 };
  };

  const { correct, total, score } = calcScore();
  const pieData = [
    { name: "Corecte", value: correct, color: "#10b981" },
    { name: "Greșite", value: total - correct, color: "#ef4444" },
  ];

  const QuestionCard = ({ q, idx }) => {
    const userLetter = answers?.[idx];
    const userIndex = userLetter ? userLetter.toLowerCase().charCodeAt(0) - 97 : null;
    const userText = userIndex !== null ? normalizeChoice(q.choices[userIndex]) : null;

    const correctLetter = answerKey?.[idx];
    const correctIndex = correctLetter ? correctLetter.charCodeAt(0) - 65 : null;
    const correctText = correctIndex !== null ? normalizeChoice(q.choices[correctIndex]) : null;

    const isCorrect = String(userLetter).toUpperCase() === String(correctLetter).toUpperCase();

    return (
      <div className={`rounded-2xl border shadow-lg p-6 transition hover:-translate-y-1 ${
        isCorrect ? "bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-300"
                  : "bg-gradient-to-r from-rose-50 to-red-100 border-rose-300"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-blue-900">{idx + 1}. {normalizeChoice(q.text)}</p>
          {isCorrect ? (
            <span className="flex items-center gap-1 text-emerald-700 text-sm font-medium bg-emerald-100 px-2 py-1 rounded-full">
              <CheckCircle2 size={16}/> Corect
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-700 text-sm font-medium bg-rose-100 px-2 py-1 rounded-full">
              <XCircle size={16}/> Greșit
            </span>
          )}
        </div>
        <ul className="space-y-1 mb-4">
          {q.choices?.map((c, ci) => {
            const letter = String.fromCharCode(65 + ci);
            return (
              <li key={ci} className={`px-3 py-2 rounded-lg text-sm ${
                ci === correctIndex
                  ? "bg-emerald-200 text-emerald-900 font-semibold"
                  : ci === userIndex && !isCorrect
                  ? "bg-rose-200 text-rose-900 font-semibold"
                  : ci === userIndex && isCorrect
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-gray-700"
              }`}>
                {letter}. {normalizeChoice(c)}
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p className={isCorrect ? "text-emerald-700" : "text-rose-700"}>
            Răspuns elev: {userLetter ? `${String(userLetter).toUpperCase()} — ${normalizeChoice(userText)}` : "—"}
          </p>
          <p className="text-emerald-700">
            Răspuns corect: {correctLetter ? `${String(correctLetter)} — ${normalizeChoice(correctText)}` : normalizeChoice(correctText)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-6 pb-12">
      <div className="flex flex-col items-center pt-10 pb-6">
        <Link to="/profesor/rapoarte"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm bg-white/80 backdrop-blur shadow hover:shadow-lg transition">
          <ArrowLeft size={18} /> Înapoi la Rapoarte
        </Link>
        <h1 className="text-2xl font-bold text-blue-900 mt-4">
          {view === "raport" ? "Raport detaliat" : "Revizuire test"}
        </h1>
      </div>

      <div className="rounded-2xl bg-white shadow p-6 mb-6">
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          <span>👤 {student?.full_name ?? "—"}</span>
          <span>📧 {student?.email ?? "—"}</span>
          <span>📘 {meta?.subject ?? "—"}</span>
          <span>🏫 {meta?.class_name ?? "—"}</span>
          <span>🏷 {meta?.type ?? "—"}</span>
          <span>🗓 {result?.submitted_at ? new Date(result.submitted_at).toLocaleString("ro-RO") : "—"}</span>
        </div>
        {meta?.description && <p className="mt-2 text-sm text-gray-600">📝 {meta.description}</p>}
        <div className="mt-3 text-xl font-bold text-blue-900">{score}%</div>
      </div>

      {view === "raport" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-xl border bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Distribuție</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xl font-bold text-blue-900 mt-2">
              {score}% ({correct}/{total})
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Corecte vs Greșite</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 mx-auto max-w-2xl">
        <input value={qFilter} onChange={(e) => setQFilter(e.target.value)}
          placeholder="🔍 Caută întrebare sau răspuns..."
          className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur" />
      </div>

      <div className="space-y-6 mt-4">
        {questions.filter((q) =>
          (q.text || "").toLowerCase().includes(qFilter.toLowerCase())
        ).map((q, idx) => (
          <QuestionCard key={idx} q={q} idx={idx} />
        ))}
      </div>
    </div>
  );
};

export default RaportDetaliatProfesor;


// src/pages/elev/RapoarteElev.jsx
// PREMIUM WITH META: listă pe results_with_questions, dar Revizuire și Raport detaliat citesc întrebările + răspunsurile corecte din test_meta_unified

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, FileText, Eye, XCircle, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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

// normalize
const normalizeChoice = (c) => {
  if (c === null || c === undefined) return "";
  if (typeof c === "string") return c;
  if (typeof c === "number") return String(c);
  if (typeof c === "object") return c.text || c.label || Object.values(c).join(" / ");
  return String(c);
};

const RapoarteElev = () => {
  const [rapoarte, setRapoarte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answerKey, setAnswerKey] = useState({});
  const [qList, setQList] = useState("");
  const [qFilter, setQFilter] = useState("");

  const revizuireRef = useRef();
  const raportRef = useRef();

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

  const calcScore = (questions, answers) => {
    const total = questions?.length || 0;
    let correct = 0;
    (questions || []).forEach((q, i) => {
      const userLetter = answers?.[String(i)];
      if (String(userLetter).toUpperCase() === String(answerKey?.[i] ?? "").toUpperCase()) {
        correct++;
      }
    });
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { score, correct, total };
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const studentId = auth?.user?.id;
      if (!studentId) {
        setRapoarte([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("results_with_questions")
        .select("*")
        .eq("student_id", studentId)
        .order("submitted_at", { ascending: false });
      if (error) console.error("Eroare la încărcare:", error.message);
      setRapoarte(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (resultId) => {
    const { error } = await supabase.from("results").delete().eq("id", resultId);
    if (error) {
      console.error("Eroare la ștergere:", error.message);
      return;
    }
    setRapoarte((prev) => prev.filter((r) => r.result_id !== resultId));
    setView("list");
  };

  const loadMeta = async (testId) => {
    const { data, error } = await supabase
      .from("test_meta_unified")
      .select("*")
      .eq("test_id", testId)
      .single();
    if (error) {
      console.error("Eroare la încărcare meta:", error.message);
      return;
    }
    setQuestions(data?.items || []);
    setAnswerKey(data?.answer_key || {});
  };

  const TestInfo = ({ test }) => (
    <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border shadow p-4 flex flex-wrap gap-4 text-sm text-gray-700">
      <span>📘 <b>{test.test_subject}</b></span>
      <span>🏷 {test.test_type}</span>
      <span>🏫 {test.school_class}</span>
      <span>👨‍🏫 {test.teacher_name}</span>
      <span>🗓 {formatDate(test.submitted_at)}</span>
      {test.description && <span>📝 {test.description}</span>}
    </div>
  );

  const ReportCard = ({ r }) => {
    return (
      <div className="rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition p-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
            <span>📘 {r.test_subject}</span>
            <span>🏷 {r.test_type}</span>
            <span>🏫 {r.school_class}</span>
            <span>👨‍🏫 {r.teacher_name}</span>
            <span>🗓 {formatDate(r.submitted_at)}</span>
            {r.description && <span>📝 {r.description}</span>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => { setSelected(r); loadMeta(r.test_id).then(() => setView("revizuire")); }}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Eye size={16} className="inline mr-1" /> Revizuire
          </button>
          <button
            onClick={() => { setSelected(r); loadMeta(r.test_id).then(() => setView("raport")); }}
            className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <FileText size={16} className="inline mr-1" /> Raport
          </button>
          <button
            onClick={() => handleDelete(r.result_id)}
            className="px-3 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            <XCircle size={16} className="inline mr-1" /> Șterge
          </button>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ q, idx, answers }) => {
    const userLetter = answers?.[String(idx)] || null;
    const userIndex = userLetter ? userLetter.toLowerCase().charCodeAt(0) - 97 : null;
    const userText = userIndex !== null && q.choices ? normalizeChoice(q.choices[userIndex]) : null;
    const correctLetter = answerKey?.[idx] || null;
    const correctIndex = correctLetter ? correctLetter.charCodeAt(0) - 65 : null;
    const correctText = correctIndex !== null ? normalizeChoice(q.choices?.[correctIndex]) : null;
    const isCorrect = String(userLetter).toUpperCase() === String(correctLetter).toUpperCase();
    return (
      <div className={`rounded-2xl border shadow-lg p-6 transition transform hover:-translate-y-1 ${
        isCorrect
          ? "bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-300"
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
            Răspuns elev: {userLetter ? `${userLetter.toUpperCase()} — ${normalizeChoice(userText)}` : "—"}
          </p>
          <p className="text-emerald-700">
            Răspuns corect: {correctLetter ? `${correctLetter} — ${normalizeChoice(correctText)}` : normalizeChoice(correctText)}
          </p>
        </div>
      </div>
    );
  };

  const RevizuireView = () => {
    const answers = selected?.answers || {};
    return (
      <div className="max-w-5xl mx-auto space-y-8" ref={revizuireRef}>
        <h2 className="text-2xl font-extrabold text-blue-900 text-center">Revizuire test</h2>
        <div className="flex justify-center">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 rounded-full border px-6 py-2 text-sm bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow hover:shadow-lg hover:opacity-90 transition">
            <ArrowLeft size={18} /> Înapoi la Rapoarte
          </button>
        </div>
        <div className="mt-4 mx-auto max-w-2xl">
          <input value={qFilter} onChange={(e) => setQFilter(e.target.value)} placeholder="🔍 Caută întrebare sau răspuns..." className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur" />
        </div>
        <TestInfo test={selected} />
        <div className="space-y-6">
          {(questions || []).filter((q) =>
            q.text?.toLowerCase().includes(qFilter.toLowerCase())
          ).map((q, idx) => (
            <QuestionCard key={idx} q={q} idx={idx} answers={answers} />
          ))}
        </div>
      </div>
    );
  };

  const RaportDetaliatView = () => {
    const answers = selected?.answers || {};
    const { score, correct, total } = calcScore(questions, answers);
    const pieData = [
      { name: "Corecte", value: correct, color: "#10b981" },
      { name: "Greșite", value: total - correct, color: "#ef4444" },
    ];
    return (
      <div className="max-w-5xl mx-auto space-y-8" ref={raportRef}>
        <h2 className="text-2xl font-extrabold text-blue-900 text-center">Raport detaliat</h2>
        <div className="flex justify-center">
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 rounded-full border px-6 py-2 text-sm bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow hover:shadow-lg hover:opacity-90 transition">
            <ArrowLeft size={18} /> Înapoi la Rapoarte
          </button>
        </div>
        <div className="mt-4 mx-auto max-w-2xl">
          <input value={qFilter} onChange={(e) => setQFilter(e.target.value)} placeholder="🔍 Caută întrebare sau răspuns..." className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur" />
        </div>
        <TestInfo test={selected} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="space-y-6">
          {(questions || []).filter((q) =>
            q.text?.toLowerCase().includes(qFilter.toLowerCase())
          ).map((q, idx) => (
            <QuestionCard key={idx} q={q} idx={idx} answers={answers} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-6 pb-12">
      {view === "list" && (
        <>
          <div className="flex flex-col items-center pt-10 pb-6">
            <Link to="/elev/dashboard" className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm bg-white/80 backdrop-blur shadow hover:shadow-lg transition">
              <ArrowLeft size={18} /> Înapoi la Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-blue-900 mt-4">📊 Rapoartele mele</h1>
          </div>
          <div className="mt-3 mx-auto max-w-3xl">
            <input value={qList} onChange={(e) => setQList(e.target.value)} placeholder="Caută după materie, tip, profesor, clasa…" className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur" />
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
                  r.description?.toLowerCase().includes(needle)
                );
              }).map((r) => (
                <ReportCard key={r.result_id} r={r} />
              ))}
            </div>
          )}
        </>
      )}
      {view === "revizuire" && selected && <RevizuireView />}
      {view === "raport" && selected && <RaportDetaliatView />}
    </div>
  );
};

export default RapoarteElev;

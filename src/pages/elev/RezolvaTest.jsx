import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Clock, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function RezolvaTest() {
  const q = useQuery();
  const sid = q.get("sid");

  const [row, setRow] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [duration, setDuration] = useState(0);

  const tickRef = useRef(null);
  const startTsRef = useRef(null);

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // încărcare test
  useEffect(() => {
    (async () => {
      if (!sid) {
        setErr("Lipsă sau SID invalid în URL.");
        setLoading(false);
        return;
      }
      try {
        const { data: rec } = await supabase
          .from("v_student_received_tests")
          .select("*")
          .eq("assignment_id", sid)
          .limit(1)
          .maybeSingle();

        if (!rec) {
          setErr("Nu s-a găsit testul.");
          setLoading(false);
          return;
        }
        setRow(rec);

        const { data: t } = await supabase
          .from("tests")
          .select(
            "id, title, subject, school_class, test_type, intrebari, description, teacher_name, exam_date, exam_time"
          )
          .eq("id", rec.test_id)
          .maybeSingle();

        setTest(t || null);

        let qs = Array.isArray(t?.intrebari) ? t.intrebari : [];
        if (!qs.length) {
          const { data: tq } = await supabase
            .from("test_questions")
            .select("text, choices, correct_index")
            .eq("test_id", rec.test_id);

          if (Array.isArray(tq) && tq.length) {
            qs = tq.map((q) => {
              const ch = q.choices || {};
              const idxToLetter = (idx) =>
                (["a", "b", "c", "d"][Number(idx)] || "").toLowerCase();
              return {
                text: q.text || "",
                a: ch.a ?? ch[0] ?? "",
                b: ch.b ?? ch[1] ?? "",
                c: ch.c ?? ch[2] ?? "",
                d: ch.d ?? ch[3] ?? "",
                corecta: idxToLetter(q.correct_index),
              };
            });
          }
        }
        setQuestions(qs);
      } catch (e) {
        setErr(e.message || "Nu am putut încărca testul.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sid]);

  // timer
  const startTimer = () => {
    startTsRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTsRef.current) / 1000));
    }, 1000);
  };
  const stopTimer = () => {
    if (tickRef.current) clearInterval(tickRef.current);
  };
  useEffect(() => () => stopTimer(), []);

  const onStart = () => {
    if (!questions.length) return alert("Acest test nu are întrebări.");
    setStarted(true);
    setSubmitted(false);
    setStep(0);
    setAnswers({});
    setDuration(0);
    startTimer();
  };

  const onSelect = (qIndex, opt) =>
    setAnswers((p) => ({ ...p, [qIndex]: opt }));

  const next = useCallback(
    () => setStep((s) => Math.min(s + 1, questions.length - 1)),
    [questions.length]
  );
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const computeScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if ((answers[i] || "").toLowerCase() === q.corecta?.toLowerCase())
        score++;
    });
    return score;
  };

  const onSubmit = async () => {
    stopTimer();
    try {
      const score = computeScore();
      const payload = {
        id: crypto.randomUUID(),
        test_id: row.test_id,
        student_id: row.student_id,
        answers,
        score,
        duration_sec: duration,
        submitted_at: new Date().toISOString(),
      };
      await supabase.from("results").insert(payload);
      setSubmitted(true);

      if (score / questions.length >= 0.5) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      alert(e.message || "Eroare la salvarea rezultatului.");
      startTimer();
    }
  };

  const progress =
    questions.length > 0
      ? (Object.keys(answers).length / questions.length) * 100
      : 0;

  // keyboard shortcuts
  useEffect(() => {
    if (!started || submitted) return;
    const handler = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const opt = ["a", "b", "c", "d"][Number(e.key) - 1];
        onSelect(step, opt);
      }
      if (e.key === "Enter") {
        if (step < questions.length - 1) next();
        else onSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started, submitted, step, questions.length, next]);

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        Se încarcă…
      </div>
    );

  if (err)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-red-600">
        {err}
      </div>
    );

  const qCur = questions[step];
  const score = computeScore();
  const percent = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-white to-white p-6">
      <div className="flex justify-center mb-4">
        <Link
          to="/elev/teste-primite"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
        >
          ⟵ Înapoi la Teste primite
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* CARD START */}
        {!started && !submitted && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="max-w-xl w-full text-center bg-gradient-to-br from-indigo-100 to-white rounded-3xl shadow-2xl p-10">
              <h1 className="text-3xl font-extrabold text-indigo-900 mb-3">
                {row?.title ||
                  row?.description ||
                  test?.title ||
                  "Test fără titlu"}
              </h1>
              {row?.description && (
                <p className="text-gray-600 mb-6">{row.description}</p>
              )}
              <button
                onClick={onStart}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform transition hover:scale-105"
              >
                🚀 Începe testul
              </button>
              <div className="text-xs text-gray-500 mt-4">
                Folosește tastele <b>1</b>-<b>4</b> pentru răspunsuri și{" "}
                <b>Enter</b> pentru a avansa
              </div>
            </div>
          </div>
        )}

        {/* CARD ÎNTREBARE */}
        {started && !submitted && qCur && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Clock size={16} /> {fmtDuration(duration)}
              </div>
              <div className="w-1/2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                Întrebarea {step + 1} din {questions.length}
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-white shadow mb-4">
              <h2 className="text-lg font-semibold mb-4">{qCur.text}</h2>
              <div className="space-y-2">
                {["a", "b", "c", "d"].map((opt) => (
                  <label
                    key={opt}
                    className={`block p-3 rounded-lg border cursor-pointer transition ${
                      answers[step] === opt
                        ? "bg-indigo-100 border-indigo-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${step}`}
                      className="mr-2"
                      checked={answers[step] === opt}
                      onChange={() => onSelect(step, opt)}
                    />
                    <b className="uppercase mr-2">{opt}.</b> {qCur[opt] || ""}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                ← Înapoi
              </button>
              {step < questions.length - 1 ? (
                <button
                  onClick={next}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Înainte →
                </button>
              ) : (
                <button
                  onClick={onSubmit}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  ✅ Trimite răspunsurile
                </button>
              )}
            </div>
          </div>
        )}

        {/* CARD REZULTATE */}
        {submitted && (
          <div className="text-center">
            <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Ai terminat testul!</h2>
            <div className="flex justify-center items-center my-6">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#4f46e5"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - percent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-[2000ms]"
                />
              </svg>
            </div>
            <div className="text-3xl font-extrabold text-indigo-700">
              {percent}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Timp: {fmtDuration(duration)}
            </div>

            {/* LISTĂ RĂSPUNSURI */}
            <div className="mt-8 space-y-4 text-left">
              {questions.map((q, idx) => {
                const myAns = answers[idx];
                const correct = q.corecta?.toLowerCase();
                const isCorrect = myAns?.toLowerCase() === correct;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border bg-white shadow-sm"
                  >
                    <p className="font-semibold mb-2">
                      {idx + 1}. {q.text}
                    </p>
                    {isCorrect ? (
                      <p className="text-green-700">
                        ✅ Răspunsul tău: {myAns?.toUpperCase()}
                      </p>
                    ) : (
                      <>
                        <p className="text-red-700">
                          ❌ Răspunsul tău: {myAns ? myAns.toUpperCase() : "—"}
                        </p>
                        <p className="text-green-700">
                          Corect era: {correct?.toUpperCase()}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

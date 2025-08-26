// src/pages/elev/RezolvaTest.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyScheduledTest } from "@/services/calendarService.js";
import { saveResult } from "@/services/resultsService.js";

export default function RezolvaTest() {
  const { id } = useParams(); // tests.id din URL
  const [row, setRow] = useState(null); // rând din scheduled_tests cu embed tests
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // runner state
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [duration, setDuration] = useState(0);
  const tickRef = useRef(null);
  const startTsRef = useRef(null);

  // Load test (RLS-safe) prin scheduled_tests
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getMyScheduledTest(id);
        if (!mounted) return;
        if (!r)
          setErr(
            "Nu ai acces la acest test sau nu este programat pentru tine."
          );
        setRow(r || null);
      } catch (e) {
        setErr(e?.message || "Nu am putut încărca testul.");
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const test = row?.tests || null;
  const questions = useMemo(
    () =>
      Array.isArray(test?.content?.intrebari) ? test.content.intrebari : [],
    [test]
  );

  // Timer
  const startTimer = () => {
    startTsRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTsRef.current) / 1000));
    }, 1000);
  };
  const stopTimer = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };
  useEffect(() => () => stopTimer(), []);

  // Handlers
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
    setAnswers((prev) => ({ ...prev, [qIndex]: opt }));
  const next = () => setStep((s) => Math.min(s + 1, questions.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const computeScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      const correct = (q.corecta || "").trim().toLowerCase();
      if (answers[i] && answers[i].toLowerCase() === correct) score += 1;
    });
    return score;
  };

  const onSubmit = async () => {
    stopTimer();
    try {
      const score = computeScore();
      await saveResult({
        test_id: test.id,
        answers,
        score,
        duration_sec: duration,
      });
      setSubmitted(true);
      alert("✅ Răspunsurile au fost trimise.");
    } catch (e) {
      alert(e?.message || "⚠️ Eroare la salvarea rezultatului.");
      startTimer();
    }
  };

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  const progressPct = questions.length
    ? Math.round(((step + 1) / questions.length) * 100)
    : 0;

  if (loading) return <div className="p-6 text-center">Se încarcă…</div>;

  if (err)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Link
          to="/elev/teste-primite"
          className="text-blue-600 hover:underline"
        >
          ← Înapoi
        </Link>
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {err}
        </div>
      </div>
    );

  if (!test)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Link
          to="/elev/teste-primite"
          className="text-blue-600 hover:underline"
        >
          ← Înapoi
        </Link>
        <div className="mt-4 text-gray-700">Testul nu a fost găsit.</div>
      </div>
    );

  const q = questions[step];

  return (
    <div className="-50 min-h-screen text-gray-800">
      <div className="max-w-3xl mx-auto p-6">
        <Link
          to="/elev/teste-primite"
          className="text-blue-600 hover:underline"
        >
          ← Înapoi
        </Link>

        <div className="bg-white rounded-2xl shadow p-6 mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-800">{test.title}</h1>
            <div className="text-sm text-gray-600">
              Materie: <b>{test.subject || "-"}</b> · Clasa:{" "}
              <b>{test.grade_level || "-"}</b>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex-1 mr-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-indigo-600"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {questions.length > 0 && (
                <div className="mt-1 text-gray-600">
                  Întrebarea {step + 1}/{questions.length} · Progres{" "}
                  {progressPct}%
                </div>
              )}
            </div>
            <div className="font-mono text-gray-800">
              ⏱ {fmtDuration(duration)}
            </div>
          </div>

          {!started && !submitted && (
            <div className="p-4 border rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-between">
              <div>
                {questions.length ? (
                  <p>
                    Testul are <b>{questions.length}</b> întrebări. Când ești
                    gata, apasă „Începe testul”.
                  </p>
                ) : (
                  <p>Acest test nu are întrebări definite.</p>
                )}
              </div>
              <button
                className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                disabled={!questions.length}
                onClick={onStart}
              >
                ▶️ Începe testul
              </button>
            </div>
          )}

          {started && !submitted && questions.length > 0 && (
            <>
              <div className="p-4 border rounded-xl">
                <div className="font-semibold mb-3">
                  {q?.text || "Întrebare"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["a", "b", "c", "d"].map((opt) => (
                    <label
                      key={opt}
                      className={`cursor-pointer p-3 border rounded-xl flex items-start gap-2 ${
                        answers[step] === opt
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${step}`}
                        className="mt-1"
                        checked={answers[step] === opt}
                        onChange={() => onSelect(step, opt)}
                      />
                      <span>
                        <b className="uppercase mr-1">{opt}.</b>{" "}
                        {q?.[opt] || ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
                  onClick={prev}
                  disabled={step === 0}
                >
                  ← Înapoi
                </button>
                <div className="flex items-center gap-2">
                  {step < questions.length - 1 ? (
                    <button
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={next}
                    >
                      Înainte →
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                      onClick={onSubmit}
                    >
                      ✅ Trimite răspunsurile
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {submitted && (
            <RezultatView
              questions={questions}
              answers={answers}
              duration={duration}
              onCloseText="Înapoi la testele primite"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RezultatView({ questions, answers, duration, onCloseText }) {
  const score = useMemo(() => {
    let s = 0;
    questions.forEach((q, i) => {
      const correct = (q.corecta || "").trim().toLowerCase();
      if (answers[i] && answers[i].toLowerCase() === correct) s += 1;
    });
    return s;
  }, [questions, answers]);

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="p-4 border rounded-xl bg-green-50">
      <div className="flex items-center justify-between">
        <div className="text-green-900">
          <div className="text-lg font-semibold">
            Răspunsurile au fost trimise.
          </div>
          <div className="text-sm">
            Scor: <b>{score}</b> / {questions.length} · Timp:{" "}
            <b>{fmtDuration(duration)}</b>
          </div>
        </div>
        <Link
          to="/elev/teste-primite"
          className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
        >
          {onCloseText || "Înapoi"}
        </Link>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-green-900">
          Vezi corecturile
        </summary>
        <div className="mt-2 space-y-2">
          {questions.map((q, i) => {
            const correct = (q.corecta || "").trim().toLowerCase();
            const my = (answers[i] || "").toLowerCase();
            const ok = my && my === correct;
            return (
              <div key={i} className="p-3 rounded-lg border bg-white">
                <div className="font-medium">
                  {i + 1}. {q.text}
                </div>
                <div className="text-sm mt-1">
                  Răspunsul tău:{" "}
                  <b className={ok ? "text-green-700" : "text-red-700"}>
                    {my || "-"}
                  </b>
                  {" · "} Corect:{" "}
                  <b className="text-green-700">{correct || "-"}</b>
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

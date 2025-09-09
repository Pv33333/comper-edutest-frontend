// src/pages/elev/RezolvaTest.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const useQuery = () => new URLSearchParams(useLocation().search);
const isUUID = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );

export default function RezolvaTest() {
  const q = useQuery();
  const sidRaw = q.get("sid");
  const sid = isUUID(sidRaw) ? sidRaw : null;

  const [session, setSession] = useState(null);
  const [studentIds, setStudentIds] = useState([]);
  const [row, setRow] = useState(null); // programarea din v_student_received_tests
  const [test, setTest] = useState(null); // rând din tests
  const [questions, setQuestions] = useState([]);
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

  // sesiune
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    })();
  }, []);

  // posibile ID-uri elev (auth.uid + mapare email în students/student_profiles)
  useEffect(() => {
    (async () => {
      if (!session?.user) return;
      const s = new Set();
      const authId = session.user.id;
      const email = (session.user.email || "").toLowerCase().trim();
      if (authId) s.add(authId);
      if (email) {
        const { data: s1 } = await supabase
          .from("students")
          .select("id")
          .eq("email", email);
        (s1 || []).forEach((r) => r?.id && s.add(r.id));
        const { data: s2 } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("email", email);
        (s2 || []).forEach((r) => r?.id && s.add(r.id));
      }
      setStudentIds(Array.from(s));
    })();
  }, [session]);

  const fmt = useMemo(
    () => (ts) =>
      ts
        ? new Date(ts).toLocaleString("ro-RO", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—",
    []
  );
  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // încarcă programarea + testul + întrebările (fallback)
  useEffect(() => {
    (async () => {
      if (!sid) {
        setErr("Lipsă sau SID invalid.");
        setLoading(false);
        return;
      }
      if (!studentIds.length) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr("");

      try {
        // 1) programarea elevului (RLS friendly)
        const { data: rec, error: e1 } = await supabase
          .from("v_student_received_tests")
          .select("*")
          .eq("id", sid)
          .in("student_id", studentIds)
          .maybeSingle();
        if (e1) throw e1;
        if (!rec) {
          setErr(
            "Nu ai acces la acest test sau nu este programat pentru tine."
          );
          setLoading(false);
          return;
        }
        setRow(rec);

        // 2) metadate test
        const { data: t } = await supabase
          .from("tests")
          .select(
            "id, title, subject, school_class, test_type, intrebari, descriere, description, teacher_name, exam_date, exam_time"
          )
          .eq("id", rec.test_id)
          .maybeSingle();
        setTest(t || null);

        // 3) întrebări (prefer tests.intrebari; fallback test_questions)
        let qs = Array.isArray(t?.intrebari) ? t.intrebari : [];
        if (!qs.length) {
          const { data: tq } = await supabase
            .from("test_questions")
            .select("text, choices, correct_index")
            .eq("test_id", rec.test_id)
            .order("created_at", { ascending: true });

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
        setQuestions(Array.isArray(qs) ? qs : []);
      } catch (e) {
        setErr(e?.message || "Nu am putut încărca testul.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sid, studentIds]);

  // timer
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

  // handlers
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

  // tastatură: 1..4 -> a..d, săgeți, Enter
  useEffect(() => {
    const onKey = (e) => {
      if (!started || submitted || !questions.length) return;
      if (["ArrowRight"].includes(e.key)) {
        e.preventDefault();
        next();
        return;
      }
      if (["ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        prev();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        step < questions.length - 1 ? next() : onSubmit();
        return;
      }
      const map = { 1: "a", 2: "b", 3: "c", 4: "d" };
      if (map[e.key]) onSelect(step, map[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, submitted, step, questions.length, next, prev]);

  const computeScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      const correct = (q.corecta || "").trim().toLowerCase();
      if ((answers[i] || "").toLowerCase() === correct) score += 1;
    });
    return score;
  };

  const onSubmit = async () => {
    stopTimer();
    try {
      const score = computeScore();

      // FK spre auth.users(id) -> folosim auth user id
      const authUserId = session?.user?.id;
      if (!authUserId) throw new Error("Nu ești autentificat.");

      const payload = {
        id: crypto.randomUUID(),
        test_id: row.test_id,
        student_id: authUserId, // ✅ respectă FK
        answers,
        score,
        duration_sec: duration,
        submitted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("results")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      if (!data?.id) throw new Error("Insert blocat de policy (RLS) sau FK.");

      // încearcă să marchezi programarea ca "completed" (ignori dacă RLS nu permite)
      await supabase
        .from("student_tests")
        .update({ status: "completed" })
        .eq("id", sid)
        .select("id");

      setSubmitted(true);
    } catch (e) {
      alert(e?.message || "⚠️ Eroare la salvarea rezultatului.");
      startTimer();
    }
  };

  // PROGRES: înainte de start = 0%; după start = real
  const progressPct = useMemo(() => {
    if (!started || !questions.length) return 0;
    return Math.round(((step + 1) / questions.length) * 100);
  }, [started, step, questions.length]);
  const progressWidth = started ? `${progressPct}%` : "0%"; // 👈 forțăm 0% până la Start

  // ---- UI ----
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center">
            <Link
              to="/elev/teste-primite"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
            >
              ⟵ Înapoi la Teste primite
            </Link>
          </div>
          <div className="mt-6 text-center text-sm text-gray-600 animate-pulse">
            Se încarcă…
          </div>
        </div>
      </div>
    );
  }

  if (err || !row) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center">
            <Link
              to="/elev/teste-primite"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
            >
              ⟵ Înapoi la Teste primite
            </Link>
          </div>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            {err ||
              "Nu ai acces la acest test sau nu este programat pentru tine."}
          </div>
        </div>
      </div>
    );
  }

  // meta premium
  const headerTitle = row?.title || test?.title || "Test";
  const subject = row?.subject || test?.subject || "—";
  const classLabel = row?.school_class || test?.school_class || "—";
  const tipTest = test?.test_type || "—";
  const dataStr = row?.exam_date || test?.exam_date || "—";
  const oraStr = row?.exam_time || test?.exam_time || "—";
  const prof = row?.teacher_name || test?.teacher_name || "—";
  const descr =
    row?.description ||
    row?.descriere ||
    test?.description ||
    test?.descriere ||
    "";

  const qCur = questions[step];

  return (
    <div className="min-h-[100dvh] text-gray-800 bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* top back */}
        <div className="flex justify-center">
          <Link
            to="/elev/teste-primite"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Teste primite
          </Link>
        </div>

        {/* Premium Card: preview + start */}
        <div className="mt-6 rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-indigo-900">
                {headerTitle}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
                  📘 {subject}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2 py-0.5">
                  🏷 {tipTest}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
                  🏫 {classLabel}
                </span>
              </div>
            </div>
            {!started && !submitted && (
              <button
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm shadow transition-transform active:scale-95"
                onClick={onStart}
                disabled={!questions.length}
                title={
                  !questions.length
                    ? "Nu sunt întrebări definite"
                    : "Începe testul"
                }
              >
                ▶ Începe testul
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">🗓 Data</div>
              <div className="font-medium">{dataStr}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">• Ora</div>
              <div className="font-medium">{oraStr}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">👤 Profesor</div>
              <div className="font-medium">{prof}</div>
            </div>
          </div>

          {!!descr && (
            <div className="mt-4 rounded-2xl border p-4 text-sm">
              <div className="text-xs text-gray-500">Descriere</div>
              <div className="font-medium whitespace-pre-wrap break-words">
                {descr}
              </div>
            </div>
          )}

          {/* avertisment premium (doar înainte de start) */}
          {!started && !submitted && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-900 p-3 text-xs">
              <b>Atenție:</b> La „Începe testul” pornește cronometrul. Poți
              naviga cu 1–4 (A–D), săgeți stânga/dreapta și Enter.
            </div>
          )}

          {/* progres (0% înainte de start) */}
          <div className="mt-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-indigo-600 transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {started && questions.length ? (
                <>
                  Întrebarea {step + 1}/{questions.length} · Progres{" "}
                  {progressPct}% · ⏱ {fmtDuration(duration)}
                </>
              ) : (
                <>Progres 0% · ⏱ 00:00</>
              )}
            </div>
          </div>

          {/* runner */}
          {started && !submitted && questions.length > 0 && (
            <div className="mt-4">
              <div className="p-4 rounded-2xl border bg-white">
                <div className="font-semibold mb-3">
                  {qCur?.text || "Întrebare"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["a", "b", "c", "d"].map((opt) => (
                    <label
                      key={opt}
                      className={`cursor-pointer p-3 border rounded-xl flex items-start gap-2 transition-colors ${
                        answers[step] === opt
                          ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200"
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
                        {qCur?.[opt] || ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
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
            </div>
          )}

          {/* rezultat */}
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
      if ((answers[i] || "").toLowerCase() === correct) s += 1;
    });
    return s;
  }, [questions, answers]);

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="mt-4 p-4 border rounded-2xl bg-green-50">
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

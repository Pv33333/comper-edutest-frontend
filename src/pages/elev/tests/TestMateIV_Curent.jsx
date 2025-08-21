import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestMateIV_Curent() {
  const navigate = useNavigate();

  const questions = useMemo(
    () => [
      { text: "1. Cât face 25 + 37?", answers: ["60", "62", "64"], correct: "62" },
      { text: "2. Cel mai mare număr par mai mic decât 100?", answers: ["98", "97", "99"], correct: "98" },
      { text: "3. Cât face 144 : 12?", answers: ["12", "11", "13"], correct: "12" },
      { text: "4. Numărul din 3 sute, 4 zeci și 2 unități:", answers: ["324", "342", "432"], correct: "342" },
      { text: "5. Succesorul lui 899 este:", answers: ["900", "899", "901"], correct: "900" },
      { text: "6. Cât face 9 × 8?", answers: ["72", "81", "69"], correct: "72" },
      { text: "7. Diferența dintre 250 și 75 este:", answers: ["175", "185", "165"], correct: "175" },
      { text: "8. Câte minute are un sfert de oră?", answers: ["10", "15", "20"], correct: "15" },
      { text: "9. Care este jumătatea lui 48?", answers: ["24", "22", "26"], correct: "24" },
      { text: "10. Cât face 3 + 4 × 2?", answers: ["14", "11", "16"], correct: "11" }
    ],
    []
  );

  const total = questions.length;
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [seconds, setSeconds] = useState(600);
  const tickRef = useRef(null);
  useEffect(() => {
    tickRef.current = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(tickRef.current);
  }, []);
  useEffect(() => {
    if (seconds === 0) {
      handleSubmit();
    }
  }, [seconds]);

  const minutesLeft = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsLeft = String(seconds % 60).padStart(2, "0");

  const choose = (idx, ans) => setResponses((r) => ({ ...r, [idx]: ans }));

  const goNext = () => {
    if (!responses[current]) {
      alert("Te rog selectează un răspuns.");
      return;
    }
    if (current < total - 1) setCurrent((c) => c + 1);
    else setReviewMode(true);
  };
  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));

  const handleSubmit = () => {
    const correct = questions.reduce((acc, q, i) => acc + (responses[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / total) * 100);
    try {
      localStorage.setItem("scor_matematica", String(score));
    } catch {}
    navigate(`/elev/felicitare?scor=${score}&tip=mate&nr=10`);
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <main className="max-w-3xl mx-auto space-y-6 mt-10 px-4 pb-10">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">🧪 Test Demo – Matematică clasa a IV‑a</h1>

        <div className="w-full bg-blue-100 rounded-2xl shadow-xl border border-blue-400 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-6">
          <div className="text-left w-full sm:w-1/2">
            <p className="text-sm text-blue-900 mb-1 font-medium">⏳ Timp rămas</p>
            <p className="text-5xl font-mono font-bold text-blue-900">{minutesLeft}:{secondsLeft}</p>
          </div>
          <div className="text-right w-full sm:w-1/2">
            <p className="text-sm text-blue-900 mb-1 font-medium">📈 Progres test</p>
            <div className="w-full bg-white border border-blue-300 rounded-full h-4 overflow-hidden">
              <div className="h-4 bg-blue-500 rounded-full transition-all" style={{ width: `${reviewMode ? 100 : Math.round((current / total) * 100)}%` }} />
            </div>
          </div>
        </div>

        {!reviewMode ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 mt-2">
              <p className="text-base text-gray-700 text-center">{questions[current].text}</p>
              <div className="space-y-2 text-center">
                {questions[current].answers.map((a) => (
                  <label key={a} className="flex items-center justify-center gap-2 w-full">
                    <input
                      type="radio"
                      name={`q${current}`}
                      className="accent-blue-600"
                      checked={responses[current] === a}
                      onChange={() => choose(current, a)}
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className={`rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 py-2 ${current === 0 ? "invisible" : ""}`}
                onClick={goPrev}
              >
                Înapoi
              </button>
              <button
                className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 py-2"
                onClick={goNext}
                disabled={!responses[current]}
              >
                {current < total - 1 ? "Mai departe" : "Revizuiește"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800">🔍 Revizuiește răspunsurile</h2>
            <form className="space-y-4 text-left text-base mt-4">
              {questions.map((q, i) => (
                <div key={i} className="bg-white border border-gray-300 rounded-2xl p-4 shadow-sm space-y-2">
                  <p className="font-semibold text-blue-700">{q.text}</p>
                  {q.answers.map((ans) => (
                    <label key={ans} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`review_q_${i}`}
                        className="accent-blue-600"
                        checked={responses[i] === ans}
                        onChange={() => choose(i, ans)}
                      />
                      <span>{ans}</span>
                    </label>
                  ))}
                </div>
              ))}
            </form>

            {!confirmOpen ? (
              <button
                type="button"
                className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 py-2 mt-6"
                onClick={() => setConfirmOpen(true)}
              >
                📤 Trimite răspunsurile
              </button>
            ) : (
              <div className="space-y-3 mt-6">
                <p className="text-base text-gray-700">Ești sigur că vrei să trimiți testul?</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 py-2"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Nu
                  </button>
                  <button
                    className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 py-2"
                    onClick={handleSubmit}
                  >
                    Da, trimite
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

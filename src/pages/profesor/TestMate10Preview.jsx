
import React, { useState, useEffect } from "react";

const TestMate10Preview = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const questions = [
    { text: "1. Cât face 25 + 37?", answers: ["60", "62", "64"] },
    { text: "2. Care este cel mai mare număr par mai mic decât 100?", answers: ["98", "97", "99"] },
    { text: "3. Cât face 144 : 12?", answers: ["12", "11", "13"] },
    { text: "4. Numărul format din 3 sute, 4 zeci și 2 unități este:", answers: ["324", "342", "432"] },
    { text: "5. Succesorul lui 899 este:", answers: ["900", "899", "901"] },
    { text: "6. Cât face 9 × 8?", answers: ["72", "81", "69"] },
    { text: "7. Diferența dintre 250 și 75 este:", answers: ["175", "185", "165"] },
    { text: "8. Câte minute are un sfert de oră?", answers: ["10", "15", "20"] },
    { text: "9. Care este jumătatea lui 48?", answers: ["24", "22", "26"] },
    { text: "10. Cât face 3 + 4 × 2?", answers: ["14", "11", "16"] }
  ];

  const handleSelect = (answer) => {
    setResponses({ ...responses, [currentQuestion]: answer });
  };

  const nextQuestion = () => {
    if (!responses[currentQuestion]) {
      alert("Te rog selectează un răspuns.");
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setReviewMode(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  return (
    <div className="min-h-screen -50 text-blue-900 font-sans px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold text-center">📐 Test Matematică – Previzualizare</h1>

        {!reviewMode && (
          <>
            <div className="flex justify-between items-center text-sm font-medium text-gray-700">
              <span>{`Întrebarea ${currentQuestion + 1} din ${questions.length}`}</span>
              <span>{String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentQuestion / questions.length) * 100)}%` }}
              ></div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-blue-300 space-y-4">
              <p className="font-medium text-lg">{questions[currentQuestion].text}</p>
              <div className="space-y-2">
                {questions[currentQuestion].answers.map((ans, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q${currentQuestion}`}
                      value={ans}
                      checked={responses[currentQuestion] === ans}
                      onChange={() => handleSelect(ans)}
                      className="accent-blue-600"
                    />
                    {ans}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={prevQuestion} disabled={currentQuestion === 0} className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded-xl text-sm font-semibold">
                Înapoi
              </button>
              <button onClick={nextQuestion} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
                {currentQuestion === questions.length - 1 ? "Revizuiește" : "Mai departe"}
              </button>
            </div>
          </>
        )}

        {reviewMode && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🔍 Revizuiește răspunsurile</h2>
            {questions.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border space-y-2">
                <p className="font-medium">{q.text}</p>
                {q.answers.map((a, j) => (
                  <label key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`review_q${i}`}
                      value={a}
                      checked={responses[i] === a}
                      onChange={() => setResponses({ ...responses, [i]: a })}
                      className="accent-blue-600"
                    />
                    {a}
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMate10Preview;

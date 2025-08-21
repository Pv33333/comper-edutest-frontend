
import React, { useState, useEffect } from "react";

const TestRomana10Preview = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [reviewMode, setReviewMode] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const questions = [
    { text: "1. Care este antonimul cuvântului „mic”?", answers: ["slab", "mare", "scund"] },
    { text: "2. Sinonimul cuvântului „rapid” este:", answers: ["iute", "lent", "târziu"] },
    { text: "3. Verbul din propoziția „Maria citește o carte.” este:", answers: ["carte", "Maria", "citește"] },
    { text: "4. Cuvântul „frumos” este:", answers: ["substantiv", "adjectiv", "verb"] },
    { text: "5. Articolul hotărât pentru „floare” este:", answers: ["floarea", "floarei", "floare"] },
    { text: "6. Pluralul cuvântului „copil” este:", answers: ["copii", "copile", "copiiile"] },
    { text: "7. Pronume personal, persoana I, singular:", answers: ["tu", "el", "eu"] },
    { text: "8. Subiectul în propoziția „Andrei joacă fotbal.” este:", answers: ["joacă", "Andrei", "fotbal"] },
    { text: "9. Transformare negativă: „Ea merge la școală.”", answers: ["Ea merge nu la școală.", "Ea nu merge la școală.", "Ea nu la școală merge."] },
    { text: "10. Propoziție enunțiativă afirmativă:", answers: ["Nu am mâncat.", "Să pleci!", "Pisica doarme."] }
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
        <h1 className="text-3xl font-semibold text-center">🧪 Test Română – Previzualizare</h1>

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

export default TestRomana10Preview;

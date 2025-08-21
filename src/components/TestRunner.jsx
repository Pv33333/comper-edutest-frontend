import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar.jsx'

export default function TestRunner({
  testId,
  titlu,
  materie,
  clasa,
  durataSec = 600,
  intrebari = [],
}) {
  const navigate = useNavigate()
  const [current, setCurrent] = React.useState(0)
  const [raspunsuri, setRaspunsuri] = React.useState({})
  const [review, setReview] = React.useState(false)
  const [seconds, setSeconds] = React.useState(durataSec)
  const total = intrebari.length

  // Timer simplu
  React.useEffect(() => {
    if (review) return
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [review])

  React.useEffect(() => {
    if (seconds === 0 && !review) {
      setReview(true)
      // optional: alert
    }
  }, [seconds, review])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const q = intrebari[current]

  const progressPct = review ? 100 : Math.round((current / Math.max(1, total)) * 100)

  const onSelect = (ans) => {
    setRaspunsuri((r) => ({ ...r, [current]: ans }))
  }

  const next = () => {
    if (raspunsuri[current] == null) {
      alert('Te rog selectează un răspuns.')
      return
    }
    if (current < total - 1) {
      setCurrent((c) => c + 1)
    } else {
      setReview(true)
    }
  }

  const prev = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  const calcScore = () => {
    let correct = 0
    intrebari.forEach((q, i) => {
      if (raspunsuri[i] === q.correct) correct++
    })
    return Math.round((correct / Math.max(1, total)) * 100)
  }

  const submit = () => {
    const scor = calcScore()
    // salvăm în localStorage rezultate similare cu HTML-ul original
    const keyBase = testId.replaceAll('/', '_')
    localStorage.setItem(`scor_${keyBase}`, String(scor))
    localStorage.setItem(`progres_${keyBase}`, '100')
    // mark as finalizat în liste generice
    const finalizate = JSON.parse(localStorage.getItem('finalizate') || '[]')
    const exists = finalizate.findIndex(t => t.id === testId)
    const testEntry = { id: testId, materie, clasa, scor, data: new Date().toISOString() }
    if (exists >= 0) finalizate[exists] = testEntry
    else finalizate.push(testEntry)
    localStorage.setItem('finalizate', JSON.stringify(finalizate))

    // Navigăm la pagina de „Felicitări” (echivalent felicitare_premium.html)
    navigate('/elev/felicitare', { state: { scor, tip: materie.toLowerCase(), nr: total, titlu } })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <h1 className="text-3xl font-semibold text-gray-800 text-center">
        🧪 {titlu}
      </h1>

      <div className="w-full bg-blue-100 rounded-2xl shadow-xl border border-blue-400 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-6">
        <div className="text-left w-full sm:w-1/2">
          <p className="text-sm text-blue-900 mb-1 font-medium tracking-wide">⏳ Timp rămas</p>
          <p className="text-5xl font-mono font-bold text-blue-900 drop-shadow-sm">{mm}:{ss}</p>
        </div>
        <div className="text-right w-full sm:w-1/2">
          <p className="text-sm text-blue-900 mb-1 font-medium tracking-wide">📈 Progres test</p>
          <ProgressBar value={progressPct} />
          <p className="text-sm font-semibold text-blue-900 mt-2 text-right">Progres: {progressPct}%</p>
        </div>
      </div>

      {!review && (
        <>
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-200 space-y-3 mt-2">
            <p className="text-base text-gray-700 text-center">{q?.text}</p>
            <div className="space-y-2 text-center">
              {q?.answers?.map((a, idx) => (
                <label key={idx} className="flex items-center justify-center gap-2 w-full">
                  <input
                    type="radio"
                    name={`q${current}`}
                    className="accent-[#2E5AAC]"
                    checked={raspunsuri[current] === a}
                    onChange={() => onSelect(a)}
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={prev} className={`rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2 ${current === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={current===0}>
              Înapoi
            </button>
            <button onClick={next} className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2">
              Mai departe
            </button>
          </div>
        </>
      )}

      {review && (
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800">🔍 Revizuiește răspunsurile</h2>
          <form className="space-y-4 text-left text-base mt-4">
            {intrebari.map((qq, i) => (
              <div key={i} className="bg-white border border-gray-300 rounded-2xl p-4 shadow-sm space-y-2">
                <p className="font-semibold text-[#2E5AAC]">{qq.text}</p>
                {qq.answers.map((ans, j) => (
                  <label key={j} className="flex items-center justify-center gap-2 w-full">
                    <input
                      type="radio"
                      name={`review_q${i}`}
                      className="accent-[#2E5AAC]"
                      checked={raspunsuri[i] === ans}
                      onChange={() => setRaspunsuri((r) => ({ ...r, [i]: ans }))}
                    />
                    <span>{ans}</span>
                  </label>
                ))}
              </div>
            ))}
          </form>

          <div className="mt-4 space-x-3">
            <button onClick={() => setReview(false)} className="rounded-xl px-4 text-white bg-gray-500 hover:bg-gray-600 shadow-sm py-2">
              Înapoi la test
            </button>
            <button onClick={submit} className="rounded-xl px-4 text-white bg-blue-600 hover:bg-blue-700 shadow-sm py-2">
              📤 Trimite răspunsurile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

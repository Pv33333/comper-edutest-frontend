import React from 'react'

const REVIEWS = [
  { name: 'Adriana T.', role: 'părinte', img: 'https://i.pravatar.cc/80?img=10', text: '„În doar câteva teste, copilul meu a prins curaj.”' },
  { name: 'Mihai R.', role: 'profesor', img: 'https://i.pravatar.cc/80?img=12', text: '„Platforma îmi permite să personalizez testarea pentru fiecare elev.”' },
  { name: 'Ioana D.', role: 'elev', img: 'https://i.pravatar.cc/80?img=14', text: '„Testele sunt clare și ușor de înțeles. Mă simt mai încrezătoare acum.”' },
  { name: 'Daniel P.', role: 'părinte', img: 'https://i.pravatar.cc/80?img=15', text: '„Rapoartele săptămânale mă ajută să rămân implicat.”' },
  { name: 'Corina M.', role: 'profesor', img: 'https://i.pravatar.cc/80?img=18', text: '„Excelent pentru predare diferențiată.”' },
  { name: 'Alex V.', role: 'elev', img: 'https://i.pravatar.cc/80?img=20', text: '„E ca un joc — învăț fără să simt presiune.”' },
  { name: 'Ruxandra L.', role: 'părinte', img: 'https://i.pravatar.cc/80?img=23', text: '„Comunicarea cu profesorii prin platformă e foarte eficientă.”' },
  { name: 'George N.', role: 'profesor', img: 'https://i.pravatar.cc/80?img=24', text: '„Evaluările automate îmi economisesc timp prețios.”' },
  { name: 'Bianca F.', role: 'elev', img: 'https://i.pravatar.cc/80?img=26', text: '„Am luat primul meu 10 datorită testelor Comper!”' },
  { name: 'Tudor S.', role: 'părinte', img: 'https://i.pravatar.cc/80?img=28', text: '„Vă mulțumesc! Copilul meu e din nou motivat.”' },
]

function Card({ r }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow p-6 flex flex-col items-start h-full">
      <div className="flex items-center gap-4 mb-4">
        <img src={r.img} alt={r.name} className="w-14 h-14 rounded-full border-2 border-blue-300" />
        <div>
          <p className="text-gray-700 font-medium">{r.name} <span className="text-sm text-gray-500">({r.role})</span></p>
          <div className="text-yellow-400 text-sm">★★★★★</div>
        </div>
      </div>
      <p className="text-gray-700">{r.text}</p>
    </div>
  )
}

export default function ReviewsGrid() {
  const [expanded, setExpanded] = React.useState(false)
  const visible = expanded ? REVIEWS : REVIEWS.slice(0, 3)

  return (
    <section className="px-10 bg-[#F9FAFB] py-24 text-center">
      <h2 className="text-3xl font-semibold text-blue-800 mb-6">Recenzii de la utilizatori</h2>
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((r, i) => <Card key={i} r={r} />)}
      </div>
      <div className="text-center mt-10">
        <button onClick={() => setExpanded(v => !v)} className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-700">
          {expanded ? 'Ascunde recenziile' : 'Vezi toate recenziile'}
        </button>
      </div>
    </section>
  )
}

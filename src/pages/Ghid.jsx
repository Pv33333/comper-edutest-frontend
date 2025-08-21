import React from "react";

export default function Ghid() {
  return (
    <div className="bg-white text-gray-800">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a href="/contact" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Contact
        </a>
      </section>

      <section className="py-24 px-6 text-center space-y-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">1. Autentificare</h2>
            <p className="text-base text-gray-700">
              Accesează pagina de autentificare și selectează rolul tău: elev, părinte sau profesor. Introdu datele de conectare primite.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">2. Rezolvarea testelor</h2>
            <p className="text-base text-gray-700">
              Intră în secțiunea „Teste” pentru a vedea testele disponibile. Selectează un test și începe rezolvarea. Poți primi feedback instant sau după corectare, în funcție de tipul testului.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">3. Vizualizarea progresului</h2>
            <p className="text-base text-gray-700">
              Accesează „Scoruri” pentru a vedea performanța ta pe fiecare test, în timp real. Părinții și profesorii pot urmări scorurile în conturile lor dedicate.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">4. Recomandări și feedback</h2>
            <p className="text-base text-gray-700">
              Platforma oferă sugestii de îmbunătățire, precum și feedback pe întrebările greșite. Revizuiește-le pentru un progres constant.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

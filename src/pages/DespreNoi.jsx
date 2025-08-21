import React from "react";

export default function DespreNoi() {
  return (
    <div className="text-[#1C3C7B] text-sm bg-white">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a href="/" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Pagina Principală
        </a>
      </section>

      {/* Hero */}
      <section className="px-6 bg-gradient-to-r from-blue-100 via-white to-blue-100 py-24 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">📘 Descoperă COMPEREDUTEST</h1>
        <p className="text-base text-gray-700 mb-8">
          Un ecosistem educațional modern, prin joc și orientat spre progres real — pentru elevi, părinți și profesori.
        </p>
        <a className="mt-6 inline-block bg-[#2E5AAC] text-white px-6 py-3 rounded-full text-base hover:bg-[#1e4896] transition" href="#roluri">
          Vezi cum funcționează
        </a>
      </section>

      {/* Misiune */}
      <section className="px-6 bg-gray-50 py-24 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">🎯 Misiunea noastră</h2>
        <p className="text-base text-gray-700 mb-8">
          Credem într-o educație care nu doar evaluează, ci inspiră. Cu teste clare, feedback instant și scoruri intuitive, transformăm procesul de învățare într-un parcurs predictibil și motivant.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-600">
          <span className="px-4 py-2 bg-gray-100 rounded-full">✔️ Claritate</span>
          <span className="px-4 py-2 bg-gray-100 rounded-full">✔️ Accesibilitate</span>
          <span className="px-4 py-2 bg-gray-100 rounded-full">✔️ Educație echitabilă</span>
        </div>
      </section>

      {/* De ce COMPEREDUTEST */}
      <section className="px-6 bg-white py-24 text-center">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">🚀 De ce COMPEREDUTEST?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow transition duration-300">
              <h3 className="text-xl font-medium text-blue-800 mb-6">Prezentare inteligentă</h3>
              <p className="text-base text-gray-700">Marcaje, scoruri și progres clar vizibil care îi motivează pe elevi și implică părinții.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow transition duration-300">
              <h3 className="text-xl font-medium text-blue-800 mb-6">Relevanță</h3>
              <p className="text-base text-gray-700">Testele de evaluare standard sunt elaborate pentru fiecare competență de învățare, la fiecare disciplină și clasă, dar și sumativ, cu feedback instant.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow transition duration-300">
              <h3 className="text-xl font-medium text-blue-800 mb-6">Rapoarte Premium</h3>
              <p className="text-base text-gray-700">Vizualizări intuitive, istorice de scoruri, comparații și export pentru profesori și părinți.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roluri */}
      <section className="px-6 bg-[#DBEAFE] py-24 text-center" id="roluri">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">👨‍👩‍👧‍👦 Pentru cine este COMPEREDUTEST?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-4xl mb-2">🧑‍🎓</div>
            <h3 className="text-xl font-medium text-gray-800 mb-6">Elevi</h3>
            <p className="text-base text-gray-700">Rezolvă teste clare, vizualizează scoruri și învață din greșeli fără stres.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-4xl mb-2">👨‍👩‍👦</div>
            <h3 className="text-xl font-medium text-gray-800 mb-6">Părinți</h3>
            <p className="text-base text-gray-700">Urmărește rezultatele copilului tău și oferă sprijin unde e nevoie.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-4xl mb-2">👩‍🏫</div>
            <h3 className="text-xl font-medium text-gray-800 mb-6">Profesori</h3>
            <p className="text-base text-gray-700">Creează teste, evaluează elevii și încurajează progresul educațional real.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 bg-blue-50 py-24 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">🎯 Ești gata să începi?</h2>
        <p className="text-base text-gray-700 mb-8">
          Accesează pagina principală și descoperă modul în care COMPEREDUTEST poate susține învățarea eficientă.
        </p>
      </section>

      <div className="text-center py-12 bg-white">
        <a className="inline-block bg-blue-500 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow transition" href="/">
          🏁 Înapoi la Pagina Principală
        </a>
      </div>
    </div>
  );
}

import React from "react";

export default function TermeniConditii() {
  return (
    <main className="bg-white text-[#1C3C7B]">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a href="/" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Pagina Principală
        </a>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">📜 Termeni și Condiții</h1>
        <p className="text-base text-gray-700">Ultima actualizare: iunie 2025</p>

        <section className="space-y-4 text-gray-800 text-sm leading-relaxed">
          <h2 className="text-3xl font-semibold text-gray-800">1. Acceptarea termenilor</h2>
          <p className="text-base text-gray-700">
            Prin accesarea și utilizarea platformei COMPEREDUTEST, accepți acești termeni și condiții în întregime.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">2. Utilizarea platformei</h2>
          <p className="text-base text-gray-700">
            Utilizatorii trebuie să respecte regulile de conduită, să nu abuzeze de sistem și să furnizeze informații corecte.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">3. Proprietate intelectuală</h2>
          <p className="text-base text-gray-700">
            Conținutul platformei este protejat prin drepturi de autor. Nu este permisă distribuirea fără acord.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">4. Modificări</h2>
          <p className="text-base text-gray-700">
            Ne rezervăm dreptul de a actualiza acești termeni. Modificările vor fi comunicate pe site.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">5. Contact</h2>
          <p className="text-base text-gray-700">
            Întrebări? Trimite-ne un email la <a className="text-blue-700 underline" href="mailto:contact@comper.ro">contact@comper.ro</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

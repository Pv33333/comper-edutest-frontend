import React from "react";

export default function PoliticaConfidentialitate() {
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
        <h1 className="text-4xl font-bold text-gray-800">🔐 Politica de Confidențialitate</h1>
        <p className="text-base text-gray-700">Ultima actualizare: iunie 2025</p>

        <section className="space-y-4 text-gray-800 text-sm leading-relaxed">
          <h2 className="text-3xl font-semibold text-gray-800">1. Ce informații colectăm</h2>
          <p className="text-base text-gray-700">
            Colectăm date personale precum nume, e-mail, scoruri de testare și comportament pe platformă în scopuri educaționale.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">2. Cum folosim datele</h2>
          <p className="text-base text-gray-700">
            Folosim datele pentru a genera rapoarte, a personaliza feedback-ul și a îmbunătăți experiența de învățare.
          </p>

          <h2 className="text-3xl font-semibold text-gray-800">3. Drepturile tale</h2>
          <ul className="list-disc pl-6">
            <li>Acces la datele tale</li>
            <li>Corectarea sau ștergerea lor</li>
            <li>Retragerea consimțământului</li>
          </ul>

          <h2 className="text-3xl font-semibold text-gray-800">4. Contact</h2>
          <p className="text-base text-gray-700">
            Pentru orice întrebare legată de datele tale, contactează-ne la{" "}
            <a className="text-blue-700 underline" href="mailto:contact@comper.ro">contact@comper.ro</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

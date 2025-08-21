import React from "react";

export default function Intrebari() {
  const faqs = [
    ["1. Cum mă înregistrez pe platformă?", "Accesează pagina principală, selectează rolul (Elev, Părinte, Profesor) și completează formularul de înregistrare."],
    ["2. Ce pot face ca elev?", "Poți accesa teste, primi feedback imediat și urmări progresul tău."],
    ["3. Ce pot face ca părinte?", "Poți vizualiza evoluția copilului tău și primi rapoarte detaliate."],
    ["4. Ce pot face ca profesor?", "Ai acces la clase, poți distribui teste și monitoriza performanța elevilor."],
    ["5. Cum accesez testele?", "Te autentifici în cont și accesezi secțiunea „Teste disponibile”."],
    ["6. Sunt testele gratuite?", "Unele sunt gratuite. Pentru acces complet, activează contul premium."],
    ["7. Pot descărca rezultatele testelor?", "Da, poți descărca rapoarte PDF cu scoruri și feedback."],
    ["8. Platforma este sigură pentru datele copiilor?", "Da, conform standardelor GDPR și protejată prin criptare."],
    ["9. Cum primesc suport tehnic?", "Prin email, WhatsApp sau formularul de contact. Răspundem în 24h."],
    ["10. Pot folosi platforma pe telefon?", "Da, platforma e complet responsive și funcționează pe Android și iOS."],
  ];

  return (
    <div>
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a href="/contact" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Contact
        </a>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">❓ Întrebări frecvente</h1>
        <div className="space-y-4 text-gray-800 text-sm">
          {faqs.map(([q, a], i) => (
            <details key={i} className="bg-white rounded-xl shadow p-4">
              <summary className="cursor-pointer font-semibold text-blue-800">{q}</summary>
              <p className="mt-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

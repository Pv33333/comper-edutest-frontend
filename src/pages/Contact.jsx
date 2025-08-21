import React, { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    e.currentTarget.reset();
  };

  return (
    <div className="bg-white text-gray-800">
      {/* Back link (optional) */}
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          href="/"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Înapoi la Pagina Principală
        </a>
      </section>

      {/* HERO */}
      <section className="bg-[#F4F4F6] px-6 text-center py-24">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">📨 Contactează echipa COMPEREDUTEST</h1>
        <p className="text-base text-gray-700 mb-8">
          Ai întrebări sau ai nevoie de ajutor? Suntem aici pentru tine. Trimite un mesaj sau folosește una dintre metodele de mai jos.
        </p>
      </section>

      {/* CARDS */}
      <section className="px-6 max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center py-24">
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">📧</div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Email</h2>
          <p className="text-base text-gray-700 mb-8">Trimite-ne un mesaj la adresa:</p>
          <a className="text-blue-700 underline" href="mailto:contact@comper.ro">contact@comper.ro</a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">WhatsApp</h2>
          <p className="text-base text-gray-700 mb-8">Scrie-ne rapid pe mobil:</p>
          <a
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
            href="https://wa.me/40700000000"
            target="_blank"
            rel="noreferrer"
          >
            Deschide WhatsApp
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">🎓</div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Resurse utile</h2>
          <p className="text-base text-gray-700 mb-8">Vezi răspunsuri în centrul de ajutor:</p>
          <a className="text-blue-700 underline" href="/ghid">Ghid rapid de utilizare</a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow text-left hover:shadow-lg transition">
          <div className="text-4xl mb-2">❓</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Întrebări frecvente</h2>
          <p className="text-sm text-gray-600 mb-4">Găsește rapid răspunsuri la cele mai importante întrebări despre platformă.</p>
          <a className="inline-block text-sm text-blue-600 hover:underline font-medium" href="/intrebari">🔍 Vezi întrebările frecvente</a>
        </div>
      </section>

      {/* FORM */}
      <section className="px-6 bg-white text-center py-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">✍️ Trimite un mesaj</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Nume complet" required type="text" />
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Adresa de email" required type="email" />
            <textarea className="w-full border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-blue-300" placeholder="Mesajul tău..." required rows={5} />
            <button className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2" type="submit">
              Trimite mesajul
            </button>
          </form>

          {sent && <div className="mt-6 text-green-600 font-semibold text-center">✅ Mesajul tău a fost trimis cu succes!</div>}

          <div className="mt-16">
            <a className="inline-block bg-blue-500 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow transition" href="/">
              🏁 Înapoi la Pagina Principală
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

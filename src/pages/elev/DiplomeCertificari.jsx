import React from "react";
import { Link } from "react-router-dom";

// Pagina Diplome & Certificate (Elev) – fără Header/Footer externe.
// Include buton "Înapoi la Dashboard" direct în pagină.
// TailwindCSS este folosit pentru stilizare (presupune setup existent în proiect).

const diplomas = [
  {
    id: "participare",
    title: "🏅 Diplomă de Participare",
    description: "Pentru implicare activă în testele Comper",
    fileHref: "/diploma_participare_comper.pdf", // Plasează PDF-ul în /public pentru Vite
    theme: {
      from: "from-yellow-100",
      to: "to-yellow-50",
      border: "border-yellow-200",
      title: "text-yellow-800",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
  },
];

export default function DiplomeCertificari() {
  return (
    <div className="-50 min-h-screen text-gray-800">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        {/* Înapoi la Dashboard (în pagină) */}
        <section className="max-w-6xl mx-auto mt-2 mb-6 px-0">
          <Link
            className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
            to="/elev/dashboard"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Înapoi la Dashboard
          </Link>
        </section>

        <h1 className="text-4xl font-bold text-blue-800 text-center mb-10">
          🎖 Diplome și Certificate
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diplomas.map((d) => (
            <div
              key={d.id}
              className={`bg-gradient-to-br ${d.theme.from} ${d.theme.to} border ${d.theme.border} shadow rounded-2xl p-6 flex flex-col justify-between`}
            >
              <div>
                <h2 className={`text-xl font-semibold ${d.theme.title} mb-2`}>
                  {d.title}
                </h2>
                <p className="text-sm text-gray-700">{d.description}</p>
              </div>
              <div className="mt-6">
                <a
                  href={d.fileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block ${d.theme.button} text-white px-4 py-2 rounded-xl text-sm shadow`}
                >
                  📥 Descarcă diploma
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

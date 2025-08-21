import React from "react";
import { Link } from "react-router-dom";

export default function RevizuireRomana10() {
  return (
    <main className="bg-[#F9FAFB] text-[#1C3C7B] min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link
          to="/parinte/teste-finalizate"
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la Teste Finalizate
        </Link>
      </section>

      <div className="max-w-3xl mx-auto px-4 space-y-6 pb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🔍 Revizuire – Test Română 10</h1>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">1. Care este antonimul cuvântului „mic”?</p>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ slab</div>
          <div className="p-2 rounded bg-green-50 text-green-700">mare</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">scund</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">2. Sinonimul cuvântului „rapid” este:</p>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ iute</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">lent</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">târziu</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">3. Verbul din propoziția „Maria citește o carte.” este:</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">carte</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ Maria</div>
          <div className="p-2 rounded bg-green-50 text-green-700">citește</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">4. Cuvântul „frumos” este:</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">substantiv</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ adjectiv</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">verb</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">5. Articolul hotărât pentru „floare” este:</p>
          <div className="p-2 rounded bg-green-50 text-green-700">floarea</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ floarei</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">floare</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">6. Pluralul cuvântului „copil” este:</p>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ copii</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">copile</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">copiiile</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">7. Pronume personal, persoana I, singular:</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">tu</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">el</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ eu</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">8. Subiectul în propoziția „Andrei joacă fotbal.” este:</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">joacă</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ Andrei</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">fotbal</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">9. Transformare negativă: „Ea merge la școală.”</p>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ Ea merge nu la școală.</div>
          <div className="p-2 rounded bg-green-50 text-green-700">Ea nu merge la școală.</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">Ea nu la școală merge.</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">10. Propoziție enunțiativă afirmativă:</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">Nu am mâncat.</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">Să pleci!</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ Pisica doarme.</div>
        </div>
      </div>
    </main>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function RevizuireMate10() {
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🔍 Revizuire – Test Matematică 10</h1>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">1. Cât face 25 + 37?</p>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 60</div>
          <div className="p-2 rounded bg-green-50 text-green-700">62</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">64</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">2. Care este cel mai mare număr par mai mic decât 100?</p>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ 98</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">97</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">99</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">3. Cât face 144 : 12?</p>
          <div className="p-2 rounded bg-green-50 text-green-700">12</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 11</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">13</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">
            4. Numărul format din 3 sute, 4 zeci și 2 unități este:
          </p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">324</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ 342</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">432</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">5. Succesorul lui 899 este:</p>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ 900</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">899</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">901</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">6. Cât face 9 × 8?</p>
          <div className="p-2 rounded bg-green-50 text-green-700">72</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 81</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">69</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">7. Diferența dintre 250 și 75 este:</p>
          <div className="p-2 rounded bg-green-50 text-green-700">175</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 185</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">165</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">8. Câte minute are un sfert de oră?</p>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">10</div>
          <div className="p-2 rounded bg-green-100 text-green-800">✔️ 15</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">20</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">9. Care este jumătatea lui 48?</p>
          <div className="p-2 rounded bg-green-50 text-green-700">24</div>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 22</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">26</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <p className="text-base text-gray-700">10. Cât face 3 + 4 × 2?</p>
          <div className="p-2 rounded bg-red-100 text-red-800">✔️ 14</div>
          <div className="p-2 rounded bg-green-50 text-green-700">11</div>
          <div className="p-2 rounded hover:bg-gray-50 transition-colors">16</div>
        </div>
      </div>
    </main>
  );
}

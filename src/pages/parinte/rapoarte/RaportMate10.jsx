import React from "react";
import { Link } from "react-router-dom";

export default function RaportMate10() {
  const handlePrint = () => window.print();
  // Dacă ai PDF-ul la /public/pdfs/raport_mate_10_STATIC_FINAL.pdf, linkul va funcționa direct
  const pdfHref = "/pdfs/raport_mate_10_STATIC_FINAL.pdf";

  return (
    <main className="bg-white text-[#1C3C7B] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <a
            href={pdfHref}
            download="raport_mate_10_STATIC_FINAL.pdf"
            className="inline-block px-4 py-2 rounded-md bg-green-600 text-white"
          >
            📄 Descarcă PDF
          </a>
          <button
            onClick={handlePrint}
            className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
          >
            🖨️ Tipărește
          </button>
          <Link
            to="/parinte/teste-finalizate"
            className="inline-block px-4 py-2 rounded-md bg-blue-600 text-white"
          >
            ⬅️ Înapoi la Teste Finalizate
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">📄 Raport – Test Matematică 10</h1>
        <p className="text-base text-gray-700 mb-4">Data generării: 28.06.2025</p>
        <hr className="my-4" />

        {/* Blocuri raport statice */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">1. Cât face 25 + 37?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 60</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 62</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">2. Care este cel mai mare număr par mai mic decât 100?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 98</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 98</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">3. Cât face 144 : 12?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 11</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 12</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">4. Numărul format din 3 sute, 4 zeci și 2 unități este:</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 342</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 342</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">5. Succesorul lui 899 este:</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 900</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 900</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">6. Cât face 9 × 8?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 81</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 72</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">7. Diferența dintre 250 și 75 este:</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 185</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 175</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">8. Câte minute are un sfert de oră?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 15</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 15</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">9. Care este jumătatea lui 48?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 22</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 24</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">10. Cât face 3 + 4 × 2?</p>
            <p className="text-base text-gray-700">✍️ <strong>Răspuns elev:</strong> 14</p>
            <p className="text-base text-gray-700">✅ <strong>Răspuns corect:</strong> 11</p>
          </div>
        </div>
      </div>
    </main>
  );
}

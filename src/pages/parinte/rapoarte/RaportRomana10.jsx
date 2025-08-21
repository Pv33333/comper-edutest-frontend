import React from "react";
import { Link } from "react-router-dom";

export default function RaportRomana10() {
  const handlePrint = () => window.print();
  const pdfHref = "/pdfs/raport_romana_10_STATIC_FINAL.pdf";

  return (
    <main className="bg-white text-[#1C3C7B] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <a
            href={pdfHref}
            download="raport_romana_10_STATIC_FINAL.pdf"
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

        <h1 className="text-4xl font-bold text-gray-800 mb-2">📄 Raport – Test Română 10</h1>
        <p className="text-base text-gray-700 mb-4">Data generării: 28.06.2025</p>
        <hr className="my-4" />

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">1. Care este antonimul cuvântului „mic”?</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> slab
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> mare
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">2. Sinonimul cuvântului „rapid” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> iute
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> iute
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">3. Verbul din propoziția „Maria citește o carte.” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> Maria
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> citește
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">4. Cuvântul „frumos” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> adjectiv
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> adjectiv
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">5. Articolul hotărât pentru „floare” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> floarei
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> floarea
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">6. Pluralul cuvântului „copil” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> copii
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> copii
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">7. Pronume personal, persoana I, singular:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> eu
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> eu
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">8. Subiectul în propoziția „Andrei joacă fotbal.” este:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> Andrei
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> Andrei
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">
              9. Transformare negativă: „Ea merge la școală.”
            </p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> Ea merge nu la școală.
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> Ea nu merge la școală.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <p className="text-base text-gray-700">🔹 Întrebare:</p>
            <p className="text-base text-gray-700">10. Propoziție enunțiativă afirmativă:</p>
            <p className="text-base text-gray-700">
              ✍️ <strong>Răspuns elev:</strong> Pisica doarme.
            </p>
            <p className="text-base text-gray-700">
              ✅ <strong>Răspuns corect:</strong> Pisica doarme.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";

export default function FormularScoala() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-0">
      <main className="flex-grow">
        <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
          <a
            href="/autentificare/inregistrare"
            className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Înapoi la Înregistrare
          </a>
        </section>

        <div className="flex justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🏫 Școala ta nu apare în listă?
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Completează formularul de mai jos și o vom adăuga în sistem.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Județ
                </label>
                <select className="border border-gray-300 rounded-md p-2 w-full" required>
                  <option value="">Selectează județul</option>
                  <option>București</option>
                  <option>Cluj</option>
                  <option>Iași</option>
                  <option>Timiș</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localitate
                </label>
                <select className="border border-gray-300 rounded-md p-2 w-full" required>
                  <option value="">Selectează localitatea</option>
                  <option>București</option>
                  <option>Cluj-Napoca</option>
                  <option>Iași</option>
                  <option>Timișoara</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Denumirea școlii
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  placeholder="Ex: Școala Gimnazială Nr. 5"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl w-full shadow"
              >
                📤 Trimite formularul
              </button>
            </form>

            {success && (
              <p className="text-green-600 mt-4 text-center font-medium">
                ✅ Formular trimis cu succes!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

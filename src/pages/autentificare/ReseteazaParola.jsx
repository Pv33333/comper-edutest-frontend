
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ReseteazaParola() {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);

    if (!validateEmail(email)) {
      setError(true);
      return;
    }

    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-grow px-4 pt-10">
        <section className="max-w-6xl mx-auto mb-8">
          <Link
            to="/"
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
            Înapoi la Pagina Principală
          </Link>
        </section>

        <div className="flex justify-center">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 space-y-6 fade-in">
            {!showSuccess ? (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-semibold text-gray-800">Resetare parolă</h2>
                  <p className="text-base text-gray-700">
                    Introdu adresa ta de email și îți vom trimite un link de resetare.
                  </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        className={`p-2 border rounded-md w-full ${error ? "border-red-400" : "border-gray-300"}`}
                        placeholder="ex: nume@domeniu.ro"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {error && (
                        <p className="text-sm text-red-600 mt-1">Email invalid.</p>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
                    >
                      🔄 Trimite link-ul de resetare
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 fade-in">
                <h3 className="text-xl font-medium text-gray-800">
                  📧 Link trimis cu succes!
                </h3>
                <p className="text-base text-gray-700">
                  Verifică adresa ta de email pentru a reseta parola.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  🔐 Înapoi la autentificare
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

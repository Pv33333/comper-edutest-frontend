import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/SupabaseAuthProvider.jsx";
import { listTests, deleteTest } from "@/services/testsService.js";

export default function TesteProfesor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await listTests({
        created_by: user?.id,
        category: "profesor",
      });
      setTests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn(e);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  const onCreate = () => navigate("/profesor/creare-test");
  const onEdit = (id) => navigate(`/profesor/creare-test?id=${id}`);
  const onSend = (id) => navigate(`/profesor/elevi?testId=${id}`);
  const onSchedule = (id) => navigate(`/profesor/calendar?add=${id}`);

  const onDelete = async (id) => {
    if (!window.confirm("Ștergi acest test?")) return;
    try {
      await deleteTest(id);
    } finally {
      load();
    }
  };

  return (
    <div className="-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <a
          href="/profesor/dashboard"
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
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Înapoi la Dashboard
        </a>
      </section>

      <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-900">🧪 Testele mele</h1>
          <button
            onClick={onCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm"
          >
            ➕ Creează test
          </button>
        </div>

        {loading && <p className="text-gray-500">Se încarcă...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && tests.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              Nu ai încă teste.
            </p>
          )}

          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-blue-800 mb-1">
                  {t.title}
                </h2>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Materie:</strong> {t.subject || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Clasa:</strong> {t.grade_level || "—"}
                </p>
                {t.phase && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Fază:</strong> {t.phase}
                  </p>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSend(t.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-xl transition"
                >
                  📤 Trimite elevului
                </button>
                <button
                  onClick={() => onEdit(t.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-xl transition"
                >
                  ✏️ Editează
                </button>
                <button
                  onClick={() => onSchedule(t.id)}
                  className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-xl transition"
                >
                  🗓 Programează în calendar
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="col-span-2 text-sm text-red-600 hover:underline"
                >
                  🗑️ Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function loadAuthUser() {
  try { return JSON.parse(localStorage.getItem("utilizator_autentificat") || "null"); }
  catch { return null; }
}

export default function ParinteSincronizat() {
  const [user, setUser] = useState(() => loadAuthUser());
  const [confirmati, setConfirmati] = useState([]);

  useEffect(() => {
    const u = loadAuthUser();
    setUser(u);
    if (u?.rol === "parinte") {
      const copii = Array.isArray(u.copii) ? u.copii : [];
      setConfirmati(copii.filter(c => c.confirmat));
    }
  }, []);

  if (!user || user.rol !== "parinte") {
    return (
      <main className="bg-green-50 min-h-screen text-gray-800 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-red-600">⚠️ Nu ești logat ca părinte.</p>
          <Link to="/autentificare/login" className="text-blue-600 underline">Autentificare</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-green-50 text-gray-800 min-h-screen">
      <section className="max-w-6xl mx-auto mt-6 mb-4 px-4">
        <Link to="/parinte/dashboard" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">👧 Copil Asociat</h1>

        <div className="space-y-4">
          {confirmati.length === 0 ? (
            <p className="text-yellow-600">🔗 Nu ai copii confirmați.</p>
          ) : (
            confirmati.map((copil, i) => (
              <div key={i} className="border p-4 rounded-xl shadow bg-white">
                <p><strong>Prenume:</strong> {copil.prenume}</p>
                <p><strong>Nume:</strong> {copil.nume}</p>
                <p><strong>Email:</strong> {copil.email}</p>
                <p><strong>Data nașterii:</strong> {copil.dataNasterii || "-"}</p>
                <p><strong>Județ:</strong> {copil.judet || "-"}</p>
                <p><strong>Oraș:</strong> {copil.oras || "-"}</p>
                <p><strong>Școală:</strong> {copil.scoala || "-"}</p>
                <p><strong>Clasă:</strong> {copil.clasa || "-"}</p>
                <p><strong>Litera:</strong> {copil.litera || "-"}</p>
                <p><strong>Cod Asociere:</strong> <span className="font-mono bg-gray-100 px-2 rounded">{copil.cod}</span></p>
              </div>
            ))
          )}
        </div>

        <p className="mt-4 text-sm text-gray-500">Datele afișate provin din confirmarea elevilor prin cod.</p>
      </main>
    </main>
  );
}

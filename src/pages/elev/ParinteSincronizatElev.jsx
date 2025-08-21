import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ParinteSincronizatElev() {
  const [parinte, setParinte] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const elev = JSON.parse(localStorage.getItem("utilizator_autentificat"));
    if (!elev || elev.rol !== "elev") {
      setMessage("⚠️ Nu ești logat ca elev.");
      return;
    }
    let parinteGasit = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("utilizator_")) {
        const user = JSON.parse(localStorage.getItem(key));
        if (user.rol === "parinte" && user.copii) {
          const copil = user.copii.find(c => c.email === elev.email && c.confirmat);
          if (copil) {
            parinteGasit = user;
            break;
          }
        }
      }
    }
    if (parinteGasit) setParinte(parinteGasit);
    else setMessage("🔗 Nu există un părinte confirmat.");
  }, []);

  return (
    <div className="-50 text-gray-800 min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto mt-6 mb-4 px-4">
        <Link className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 font-medium" to="/elev/dashboard">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </div>
      <main className="max-w-xl mx-auto mt-12 bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">👨‍👧 Părinte Asociat</h1>
        {message && <p className={message.includes("⚠️") ? "text-red-600" : "text-yellow-600"}>{message}</p>}
        {parinte && (
          <div className="space-y-2 text-lg">
            <p><strong>Prenume:</strong> {parinte.prenume}</p>
            <p><strong>Nume:</strong> {parinte.nume}</p>
            <p><strong>Email:</strong> {parinte.email}</p>
            <p><strong>Telefon:</strong> {parinte.telefon || "-"}</p>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500">Datele sunt preluate automat din asocierea cu codul părinților.</p>
      </main>
    </div>
  );
}

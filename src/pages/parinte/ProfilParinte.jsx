import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const JUDETE = ["Alba","Arad","București","Cluj","Timiș"];
const ORASE = {
  "": [""],
  "Alba": ["Alba Iulia"],
  "Arad": ["Arad"],
  "București": ["București"],
  "Cluj": ["Cluj-Napoca"],
  "Timiș": ["Timișoara"],
};
const SCOLI = ["Școala Centrală", "Colegiul Național", "Liceul Teoretic"];

function loadAuthUser() {
  try { return JSON.parse(localStorage.getItem("utilizator_autentificat") || "null"); }
  catch { return null; }
}

export default function ProfilParinte() {
  const [user, setUser] = useState(() => loadAuthUser());
  const [copii, setCopii] = useState(() => user?.copii || []);
  const [showFormCopil, setShowFormCopil] = useState(false);
  const [msg, setMsg] = useState("");

  // form profil
  const [prenume, setPrenume] = useState(user?.prenume || "");
  const [nume, setNume] = useState(user?.nume || "");
  const [dataNasterii, setDataNasterii] = useState(user?.dataNasterii || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefon, setTelefon] = useState(user?.telefon || "");
  const [judet, setJudet] = useState(user?.judet || "");
  const [oras, setOras] = useState(user?.oras || "");
  const [scoala, setScoala] = useState(user?.scoala || "");
  const [username, setUsername] = useState(user?.username || "");

  useEffect(() => {
    // if not logged as parent, keep minimal info
    if (!user || user.rol !== "parinte") return;
  }, [user]);

  const oraseDisponibile = useMemo(() => ORASE[judet] || [oras || ""], [judet]);

  const saveProfil = () => {
    if (!user) return;
    const updated = {
      ...user,
      prenume: prenume.trim(),
      nume: nume.trim(),
      dataNasterii,
      email: email.trim(),
      telefon: telefon.trim(),
      judet,
      oras,
      scoala,
      username: username.trim(),
      copii
    };
    localStorage.setItem("utilizator_autentificat", JSON.stringify(updated));
    if (updated.username) {
      localStorage.setItem("utilizator_" + updated.username, JSON.stringify(updated));
    }
    setUser(updated);
    setMsg("✔️ Salvat cu succes!");
    setTimeout(() => setMsg(""), 2500);
  };

  // copil
  const [prenumeCopil, setPrenumeCopil] = useState("");
  const [numeCopil, setNumeCopil] = useState("");
  const [emailCopil, setEmailCopil] = useState("");

  const addCopil = () => {
    if (!prenumeCopil.trim() || !numeCopil.trim() || !emailCopil.trim()) {
      alert("Completează toate câmpurile pentru copil.");
      return;
    }
    const cod = Math.random().toString(36).substring(2, 8).toUpperCase();
    const updated = [...copii, { prenume: prenumeCopil.trim(), nume: numeCopil.trim(), email: emailCopil.trim(), confirmat: false, cod }];
    setCopii(updated);
    setPrenumeCopil(""); setNumeCopil(""); setEmailCopil("");
    setShowFormCopil(false);
  };

  const deleteCopil = (index) => {
    const updated = [...copii];
    updated.splice(index, 1);
    setCopii(updated);
    // persist immediately if we already saved profile
    if (user) {
      const next = { ...user, copii: updated };
      localStorage.setItem("utilizator_autentificat", JSON.stringify(next));
      if (next.username) localStorage.setItem("utilizator_" + next.username, JSON.stringify(next));
      setUser(next);
    }
  };

  if (!user || user.rol !== "parinte") {
    return (
      <main className="min-h-screen -50 text-gray-800 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
          <p className="text-red-600">⚠️ Nu ești logat ca părinte.</p>
          <Link to="/autentificare/login" className="text-blue-600 underline">Autentificare</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F9FAFB] text-blue-900 min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link to="/parinte/dashboard" className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="max-w-2xl mx-auto mt-4 bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">👩‍👧 Profil Părinte</h1>

        <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); saveProfil();}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Prenume" value={prenume} onChange={(e)=>setPrenume(e.target.value)} />
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Nume" value={nume} onChange={(e)=>setNume(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-2 border rounded-md border-gray-300 w-full" type="date" value={dataNasterii} onChange={(e)=>setDataNasterii(e.target.value)} />
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Telefon" value={telefon} onChange={(e)=>setTelefon(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select className="border px-4 py-2 rounded-lg w-full" value={judet} onChange={(e)=>{setJudet(e.target.value); setOras("");}}>
              <option value="">Alege județul</option>
              {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
            </select>

            <select className="border px-4 py-2 rounded-lg w-full" value={oras} onChange={(e)=>setOras(e.target.value)}>
              <option value="">{judet ? "Alege orașul" : "—"}</option>
              {oraseDisponibile.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <select className="border px-4 py-2 rounded-lg w-full" value={scoala} onChange={(e)=>setScoala(e.target.value)}>
            <option value="">Alege școala</option>
            {SCOLI.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />

          <button type="submit" className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">
            💾 Salvează
          </button>
        </form>

        {msg && <p className="text-base text-gray-700">{msg}</p>}

        <section className="mt-8 space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">👧 Copiii adăugați</h2>

          <button type="button" onClick={()=>setShowFormCopil(v=>!v)} className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">
            ➕ Adaugă copil
          </button>

          {showFormCopil && (
            <div className="space-y-4 p-4 border rounded-lg mt-4 bg-gray-50">
              <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Prenume copil" value={prenumeCopil} onChange={(e)=>setPrenumeCopil(e.target.value)} />
              <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Nume copil" value={numeCopil} onChange={(e)=>setNumeCopil(e.target.value)} />
              <input className="p-2 border rounded-md border-gray-300 w-full" placeholder="Email copil" value={emailCopil} onChange={(e)=>setEmailCopil(e.target.value)} />
              <div className="flex justify-end">
                <button type="button" onClick={addCopil} className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">
                  💾 Salvează copil
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 mt-4">
            {copii.length === 0 ? (
              <p className="text-gray-600">Nu există copii adăugați.</p>
            ) : (
              copii.map((copil, index) => (
                <div key={index} className="border p-4 rounded bg-white shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{copil.prenume} {copil.nume}</strong><br/>
                      Email: {copil.email}<br/>
                      Confirmat: {copil.confirmat ? "✅ Da" : "⏳ În așteptare"}<br/>
                      Cod: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{copil.cod}</span>
                    </div>
                    <button onClick={()=>deleteCopil(index)} className="text-red-600 hover:underline">🗑️ Șterge</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </main>
  );
}

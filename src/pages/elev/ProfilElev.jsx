import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProfilElev() {
  const navigate = useNavigate();
  const [elev, setElev] = useState(null);
  const [formData, setFormData] = useState({
    prenume: "", nume: "", dataNasterii: "", email: "", judet: "",
    oras: "", scoala: "", clasa: "", litera: "", username: "", codParinte: ""
  });
  const [salvatMsg, setSalvatMsg] = useState("");
  const [asociereStatus, setAsociereStatus] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("utilizator_autentificat"));
    if (!stored || stored.rol !== "elev") {
      alert("⚠️ Nu ești logat ca elev.");
      return;
    }
    setElev(stored);
    setFormData({ ...formData, ...stored });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedElev = { ...elev, ...formData };
    setElev(updatedElev);
    localStorage.setItem("utilizator_autentificat", JSON.stringify(updatedElev));
    localStorage.setItem("utilizator_" + updatedElev.username, JSON.stringify(updatedElev));
    setSalvatMsg("✔️ Profil salvat cu succes!");
    setTimeout(() => setSalvatMsg(""), 3000);
  };

  const handleAsociere = () => {
    const cod = formData.codParinte.trim().toUpperCase();
    if (!cod) {
      setAsociereStatus("⚠️ Introdu un cod.");
      return;
    }
    let asociat = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith("utilizator_")) continue;
      const user = JSON.parse(localStorage.getItem(key));
      if (user.rol === "parinte" && Array.isArray(user.copii)) {
        const copil = user.copii.find(c => c.email === elev.email && c.cod === cod);
        if (copil) {
          Object.assign(copil, elev);
          copil.confirmat = true;
          const updatedElev = { ...elev, confirmat: true };
          setElev(updatedElev);
          localStorage.setItem("utilizator_autentificat", JSON.stringify(updatedElev));
          localStorage.setItem("utilizator_" + updatedElev.username, JSON.stringify(updatedElev));
          localStorage.setItem(key, JSON.stringify(user));
          setAsociereStatus("✅ Cod valid. Asociere realizată!");
          setTimeout(() => navigate("/elev/parinte-sincronizat"), 2000);
          asociat = true;
          break;
        }
      }
    }
    if (!asociat) setAsociereStatus("❌ Cod invalid sau nu corespunde.");
  };

  return (
    <div className="bg-white text-[#1C3C7B] min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 font-medium" to="/elev/dashboard">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>
      <main className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">👦 Profil Elev</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input id="prenume" value={formData.prenume} onChange={handleChange} placeholder="Prenume" className="p-2 border rounded-md border-gray-300 w-full" />
            <input id="nume" value={formData.nume} onChange={handleChange} placeholder="Nume" className="p-2 border rounded-md border-gray-300 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input id="dataNasterii" type="date" value={formData.dataNasterii} onChange={handleChange} className="p-2 border rounded-md border-gray-300 w-full" />
            <input id="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded-md border-gray-300 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select id="judet" value={formData.judet} onChange={handleChange} className="border px-4 py-2 rounded-lg w-full">
              <option value="">Alege județul</option>
              <option>Alba</option><option>Arad</option><option>București</option><option>Cluj</option><option>Timiș</option>
            </select>
            <select id="oras" value={formData.oras} onChange={handleChange} className="border px-4 py-2 rounded-lg w-full">
              <option value="">Alege orașul</option>
              <option>Alba Iulia</option><option>Arad</option><option>București</option><option>Cluj-Napoca</option><option>Timișoara</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input id="scoala" value={formData.scoala} onChange={handleChange} placeholder="Școală..." readOnly className="p-2 border rounded-md border-gray-300 w-full" />
            <input id="clasa" value={formData.clasa} onChange={handleChange} placeholder="Clasă..." readOnly className="p-2 border rounded-md border-gray-300 w-full" />
          </div>
          <input id="username" value={formData.username} onChange={handleChange} placeholder="Username" readOnly className="p-2 border rounded-md border-gray-300 w-full" />
          <button type="submit" className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">💾 Salvează</button>
          <section className="mt-10 space-y-4 border-t pt-6">
            <h2 className="text-3xl font-semibold text-gray-800">🔗 Asociere cu părinte</h2>
            <input id="codParinte" value={formData.codParinte} onChange={handleChange} placeholder="Introdu codul primit de la părinte" className="p-2 border rounded-md border-gray-300 w-full" />
            <button type="button" onClick={handleAsociere} className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2">✔️ Confirmă cod</button>
            <p className="text-base text-gray-700">{asociereStatus}</p>
          </section>
        </form>
        {salvatMsg && <p className="text-base text-gray-700">{salvatMsg}</p>}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";

const ProfilProfesor = () => {
  const [profil, setProfil] = useState({
    prenume: "",
    nume: "",
    dataNasterii: "",
    email: "",
    telefon: "",
    judet: "",
    oras: "",
    scoala: "",
    username: ""
  });

  const [salvat, setSalvat] = useState(false);

  useEffect(() => {
    const dateSalvate = JSON.parse(localStorage.getItem("profil_profesor") || "{}");
    if (Object.keys(dateSalvate).length > 0) {
      setProfil(dateSalvate);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil((prev) => ({ ...prev, [name]: value }));
    setSalvat(false);
  };

  const salveazaProfil = () => {
    localStorage.setItem("profil_profesor", JSON.stringify(profil));
    setSalvat(true);
  };

  return (
    <div className="min-h-screen -50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">👤 Profil Profesor</h1>
          <Link to="/profesor/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Înapoi la Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" name="prenume" value={profil.prenume} onChange={handleChange} placeholder="Prenume" className="border p-2 rounded" />
          <input type="text" name="nume" value={profil.nume} onChange={handleChange} placeholder="Nume" className="border p-2 rounded" />
          <input type="date" name="dataNasterii" value={profil.dataNasterii} onChange={handleChange} className="border p-2 rounded" />
          <input type="email" name="email" value={profil.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
          <input type="tel" name="telefon" value={profil.telefon} onChange={handleChange} placeholder="Telefon" className="border p-2 rounded" />
          <input type="text" name="judet" value={profil.judet} onChange={handleChange} placeholder="Județ" className="border p-2 rounded" />
          <input type="text" name="oras" value={profil.oras} onChange={handleChange} placeholder="Oraș" className="border p-2 rounded" />
          <input type="text" name="scoala" value={profil.scoala} onChange={handleChange} placeholder="Școală" className="border p-2 rounded" />
          <input type="text" name="username" value={profil.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded sm:col-span-2" />
        </div>

        <button onClick={salveazaProfil} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          💾 Salvează profilul
        </button>

        {salvat && (
          <div className="mt-4 text-green-600 text-sm text-center font-medium">
            ✔️ Profil salvat cu succes!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilProfesor;
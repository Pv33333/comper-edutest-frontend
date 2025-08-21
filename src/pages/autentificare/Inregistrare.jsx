import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";

export default function Inregistrare() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    prenume: "",
    nume: "",
    birthdate: "",
    username: "",
    email: "",
    parola: "",
    confirmParola: "",
    telefon: "",
    judet: "",
    oras: "",
    scoala: "",
    clasa: "",
    litera: "",
    tipProfesor: "",
  });

  useEffect(() => {
    import("./Login.jsx");
    import("../elev/DashboardElev.jsx");
    import("../profesor/DashboardProfesor.jsx");
    import("../parinte/DashboardParinte.jsx");
    import("../admin/DashboardAdmin.jsx");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || formData.parola !== formData.confirmParola) {
      alert("Date invalide sau parolele nu coincid.");
      return;
    }
    const userData = { ...formData, username: formData.username.toLowerCase(), rol: role };
    localStorage.setItem("utilizator_" + userData.username, JSON.stringify(userData));
    alert("Cont creat cu succes! Vei fi redirecționat către login.");
    setTimeout(() => navigate("/autentificare/login"), 1200);
  };

  const isElev = role === "elev";
  const isParinte = role === "parinte";
  const isProfesor = role === "profesor";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Înregistrare</h1>
          <p className="text-base text-gray-600">
            Creează un cont nou pe <strong>ComperEduTest</strong>.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Rol */}
          <select
            className="border border-gray-300 rounded-md p-2 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Selectează rolul</option>
            <option value="elev">Elev</option>
            <option value="parinte">Părinte</option>
            <option value="profesor">Profesor</option>
            <option value="admin">Admin</option>
          </select>

          {/* Prenume + Nume */}
          <div className="grid grid-cols-2 gap-4">
            <input className="border border-gray-300 rounded-md p-2 w-full" name="prenume" placeholder="👤 Prenume" required onChange={handleChange} />
            <input className="border border-gray-300 rounded-md p-2 w-full" name="nume" placeholder="👤 Nume" required onChange={handleChange} />
          </div>

          {/* Data nașterii */}
          <input className="border border-gray-300 rounded-md p-2 w-full" name="birthdate" type="date" required onChange={handleChange} />

          {/* Username + Email */}
          <input className="border border-gray-300 rounded-md p-2 w-full" name="username" placeholder="👤 Username" required onChange={handleChange} />
          <input className="border border-gray-300 rounded-md p-2 w-full" name="email" type="email" placeholder="✉️ Email" required onChange={handleChange} />

          {/* Parolă */}
          <PasswordInput
            label="Parolă"
            value={formData.parola}
            onChange={(e) => setFormData({ ...formData, parola: e.target.value })}
            showStrength
          />

          {/* Confirmare parolă */}
          <PasswordInput
            label="Confirmă parola"
            value={formData.confirmParola}
            onChange={(e) => setFormData({ ...formData, confirmParola: e.target.value })}
          />

          {/* Telefon pentru părinte/profesor */}
          {(isParinte || isProfesor) && (
            <input className="border border-gray-300 rounded-md p-2 w-full" name="telefon" placeholder="📞 Telefon" onChange={handleChange} />
          )}

          {/* Date școală comune */}
          {(isElev || isParinte || isProfesor) && (
            <>
              <select className="border border-gray-300 rounded-md p-2 w-full" name="judet" required onChange={handleChange}>
                <option value="">Selectează județul</option>
                <option>București</option>
                <option>Cluj</option>
                <option>Iași</option>
                <option>Timiș</option>
              </select>
              <select className="border border-gray-300 rounded-md p-2 w-full" name="oras" required onChange={handleChange}>
                <option value="">Selectează localitatea</option>
                <option>București</option>
                <option>Cluj-Napoca</option>
                <option>Iași</option>
                <option>Timișoara</option>
              </select>
              <select className="border border-gray-300 rounded-md p-2 w-full" name="scoala" required onChange={handleChange}>
                <option value="">Selectează școala</option>
                <option>Școala Gimnazială Nr. 1</option>
                <option>Colegiul Național</option>
                <option>Liceul Teoretic</option>
              </select>
              <a className="text-sm text-blue-600 hover:underline block text-right" href="/autentificare/formular-scoala">
                ❓ Nu găsești școala? Trimite-ne mesaj!
              </a>
            </>
          )}

          {/* Clasa + Litera pentru elev */}
          {isElev && (
            <div className="grid grid-cols-2 gap-4">
              <select className="border border-gray-300 rounded-md p-2 w-full" name="clasa" onChange={handleChange}>
                <option value="">Clasa</option>
                {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"].map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
              <select className="border border-gray-300 rounded-md p-2 w-full" name="litera" onChange={handleChange}>
                <option value="">Litera</option>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tip profesor */}
          {isProfesor && (
            <select className="border border-gray-300 rounded-md p-2 w-full" name="tipProfesor" onChange={handleChange}>
              <option value="">Selectează tipul</option>
              <option value="primar">Primar I-IV</option>
              <option value="gimnazial">Gimnazial V-VIII</option>
              <option value="liceal">Liceal IX-XII</option>
            </select>
          )}

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm w-full" type="submit">
            ✔️ Creează cont
          </button>
        </form>

        <div className="text-center mt-6">
          <a className="text-blue-600 hover:underline" href="/autentificare/login">
            🔐 Înapoi la autentificare
          </a>
        </div>
      </div>
    </main>
  );
}

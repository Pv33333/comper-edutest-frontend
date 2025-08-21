import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";

const conturiExistente = [
  { email: "elev@test.com", parola: "test123", rol: "elev", nume: "Ion Popescu" },
  { email: "parinte@test.com", parola: "test123", rol: "parinte", nume: "Elena Popescu" },
  { email: "profesor@test.com", parola: "test123", rol: "profesor", nume: "Dl. Ionescu" },
  { email: "admin@test.com", parola: "test123", rol: "admin", nume: "Admin" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const navigate = useNavigate();

  // Prefetch dashboard-uri
  useEffect(() => {
    import("../elev/DashboardElev.jsx");
    import("../profesor/DashboardProfesor.jsx");
    import("../parinte/DashboardParinte.jsx");
    import("../admin/DashboardAdmin.jsx");
  }, []);

  const autentifica = () => {
    const lowerEmail = email.trim().toLowerCase();
    const parolaCurata = parola.trim();

    let user = conturiExistente.find(
      (u) => u.email === lowerEmail && u.parola === parolaCurata
    );

    if (!user) {
      for (let key in localStorage) {
        if (key.startsWith("utilizator_")) {
          try {
            const u = JSON.parse(localStorage.getItem(key));
            if (u.email?.toLowerCase() === lowerEmail && u.parola === parolaCurata) {
              user = u; break;
            }
          } catch {}
        }
      }
    }

    if (user) {
      localStorage.setItem("utilizator_autentificat", JSON.stringify(user));
      sessionStorage.setItem("rol_autentificat", user.rol);
      navigate(
        user.rol === "elev" ? "/elev/dashboard"
        : user.rol === "parinte" ? "/parinte/dashboard"
        : user.rol === "profesor" ? "/profesor/dashboard"
        : "/admin/dashboard"
      );
    } else {
      alert("❌ Email sau parolă greșite!");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Autentificare</h1>
          <p className="text-base text-gray-700">
            Intră în contul tău pe <strong>ComperEduTest</strong>.
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-semibold text-sm text-gray-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="ex: parinte@test.com"
              className="p-2 border rounded-md border-gray-300 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Parola */}
          <PasswordInput
            label="Parolă"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />

          {/* Buton login */}
          <button
            onClick={autentifica}
            className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2 w-full"
          >
            🔐 Autentificare
          </button>

          {/* Google Login */}
          <div className="mt-1">
            <a
              href="https://accounts.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white text-gray-800 border border-gray-300 py-2 rounded-md shadow-sm hover:bg-gray-50 transition"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
              />
              <span>Continuă cu Google</span>
            </a>
          </div>
        </div>

        {/* Linkuri suplimentare */}
        <div className="mt-6">
          <a
            href="/autentificare/inregistrare"
            className="block text-center w-full bg-green-50 border border-green-500 text-green-700 hover:bg-green-100 font-semibold py-2 rounded-md transition text-lg"
          >
            ➕ Creează cont nou
          </a>
        </div>
        <div className="mt-4 text-center">
          <a
            href="/autentificare/reseteaza-parola"
            className="text-sm text-blue-600 hover:underline transition"
          >
            🔑 Ți-ai uitat parola?
          </a>
        </div>
      </div>
    </main>
  );
}

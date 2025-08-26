// src/pages/autentificare/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import { useAuthContext } from "@/context/SupabaseAuthProvider.jsx";
import { supabase } from "@/lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithPassword } = useAuthContext();

  useEffect(() => {
    import("../elev/DashboardElev.jsx");
    import("../profesor/DashboardProfesor.jsx");
    import("../parinte/DashboardParinte.jsx");
    import("../admin/DashboardAdmin.jsx");
  }, []);

  const safeMsg = (e) =>
    typeof e === "string" ? e : e?.message || "A apărut o eroare.";

  const autentifica = async () => {
    setErrMsg("");
    try {
      const { error } = await signInWithPassword({
        email: email.trim(),
        password: parola,
      });
      if (error) {
        setErrMsg(safeMsg(error));
        return;
      }

      // after login, decide redirect using profiles.role (truth source)
      const { data: u, error: uerr } = await supabase.auth.getUser();
      if (uerr) {
        setErrMsg(safeMsg(uerr));
        return;
      }
      const uid = u?.user?.id;

      let role = "elev";
      if (uid) {
        const { data: prof, error: perr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .single();
        if (perr) {
          // fallback la user_metadata dacă profilul nu e încă populat
          role = u?.user?.user_metadata?.role || "elev";
        } else {
          role = prof?.role || u?.user?.user_metadata?.role || "elev";
        }
      }

      // support ?next= redirect
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      if (next) {
        navigate(next, { replace: true });
        return;
      }

      navigate(
        role === "elev"
          ? "/elev/dashboard"
          : role === "parinte"
          ? "/parinte/dashboard"
          : role === "profesor"
          ? "/profesor/dashboard"
          : "/admin/dashboard",
        { replace: true }
      );
    } catch (e) {
      setErrMsg(safeMsg(e));
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

        {errMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {errMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              className="block font-semibold text-sm text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="ex: profesor@test.com"
              className="p-2 border rounded-md border-gray-300 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <PasswordInput
            label="Parolă"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />

          <button
            onClick={autentifica}
            className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2 w-full"
          >
            🔐 Autentificare
          </button>

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

        <div className="mt-6">
          <a
            className="block text-center w-full bg-green-50 border border-green-500 text-green-700 hover:bg-green-100 font-semibold py-2 rounded-md transition text-lg"
            href="/autentificare/inregistrare"
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

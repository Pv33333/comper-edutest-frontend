// src/pages/autentificare/LoginAdmin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // noindex pentru crawleri
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => {
      document.head.removeChild(m);
    };
  }, []);

  const autentifica = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: parola,
      });
      if (error) throw error;

      const user = data?.user;
      const isAdmin =
        (user?.app_metadata?.role || user?.user_metadata?.role) === "admin";
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Nu ai drept de acces.");
      }
      try {
        localStorage.setItem("metaRole", "admin");
      } catch {}
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setMsg(err?.message || "Eroare la autentificare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.08),transparent)]">
      <form
        onSubmit={autentifica}
        className="bg-white/90 backdrop-blur border border-indigo-100 rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-900">🔑 Admin</h1>
          <p className="text-sm text-gray-600">
            Acces rezervat administratorilor.
          </p>
        </div>

        {msg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
            {msg}
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Email admin
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Parolă</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 pr-10"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Se verifică…" : "➜ Intră în panoul admin"}
        </button>
      </form>
    </div>
  );
}

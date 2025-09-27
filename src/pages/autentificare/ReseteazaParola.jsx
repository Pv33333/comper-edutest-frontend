// src/pages/autentificare/ReseteazaParola.jsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";

export default function ReseteazaParola() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ ok: "", err: "" });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/autentificare/reset-callback",
      });
      if (error) throw error;
      setMsg({
        ok: "✅ Verifică emailul pentru link-ul de resetare.",
        err: "",
      });
    } catch (err) {
      setMsg({ ok: "", err: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.08),transparent)] p-4">
      <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-extrabold text-center text-indigo-900 mb-4">
          🔑 Resetează parola
        </h1>
        {msg.err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
            {msg.err}
          </div>
        )}
        {msg.ok && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm text-center">
            {msg.ok}
          </div>
        )}
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="✉️ Email"
            className="p-2 border rounded-xl w-full"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-4 py-2 w-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60"
          >
            {loading ? "Se trimite…" : "Trimite link resetare"}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link
            className="text-indigo-700 hover:underline"
            to="/autentificare/login"
          >
            ⟵ Înapoi la login
          </Link>
        </div>
      </div>
    </div>
  );
}

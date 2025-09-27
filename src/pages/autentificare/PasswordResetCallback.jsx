// src/pages/autentificare/PasswordResetCallback.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import PasswordInput from "@/components/PasswordInput";

export default function PasswordResetCallback() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState({ ok: "", err: "" });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });

    if (password.length < 6)
      return setMsg({
        err: "Parola trebuie să aibă minim 6 caractere.",
        ok: "",
      });
    if (password !== confirm)
      return setMsg({ err: "Parolele nu coincid.", ok: "" });

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMsg({ ok: "✅ Parola a fost resetată cu succes.", err: "" });
      setTimeout(() => navigate("/autentificare/login"), 2000);
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
          🔒 Setează o parolă nouă
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
        <form onSubmit={handleUpdate} className="space-y-4">
          <PasswordInput
            label="Parola nouă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength
          />
          <PasswordInput
            label="Confirmă parola nouă"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-4 py-2 w-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60"
          >
            {loading ? "Se resetează…" : "Resetează parola"}
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

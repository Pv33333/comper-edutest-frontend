import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.js";

export default function PasswordResetCallback() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const navigate = useNavigate();

  const safeMsg = (e) => {
    if (!e) return "Eroare necunoscută.";
    if (typeof e === "string") return e;
    if (e.message) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setOkMsg("");
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrMsg(safeMsg(error));
        return;
      }
      setOkMsg("Parola a fost resetată.");
      setTimeout(
        () => navigate("/autentificare/login", { replace: true }),
        800
      );
    } catch (err) {
      setErrMsg(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Setează o parolă nouă
        </h1>

        {errMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {errMsg}
          </div>
        )}
        {okMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
            {okMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Parolă nouă
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white font-medium py-2.5 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Se actualizează..." : "Salvează parola"}
          </button>
        </form>
      </div>
    </main>
  );
}

// src/pages/autentificare/Login.jsx
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://comper-edutest-frontend.vercel.app";

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get("verified") === "1")
      setInfoMsg("Email confirmat. Te poți autentifica.");
    if (p.get("check_email") === "1")
      setInfoMsg("Ți-am trimis emailul de confirmare. Verifică Inbox/Spam.");
  }, [location.search]);

  const safeMsg = (e) =>
    typeof e === "string" ? e : e?.message || "A apărut o eroare.";

  const getSafeNext = useCallback(() => {
    const raw = new URLSearchParams(location.search).get("next");
    if (raw && raw.startsWith("/")) return raw;
    return null;
  }, [location.search]);

  const routeByRoleOrOnboarding = useCallback(async () => {
    const {
      data: { user },
      error: uerr,
    } = await supabase.auth.getUser();

    if (uerr || !user) {
      setErrMsg(safeMsg(uerr || "Nu ești autentificat."));
      return;
    }

    let prof = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, username, prenume, nume")
        .eq("id", user.id)
        .maybeSingle();
      if (!error) prof = data;
    } catch {}

    const roleMeta = user.user_metadata?.role || null;
    const roleDb = prof?.role || null;

    const needOnboarding =
      !prof ||
      !prof?.username ||
      !prof?.prenume ||
      !prof?.nume ||
      (!roleMeta && !roleDb);

    if (needOnboarding) {
      const safeNext = getSafeNext();
      const base = "/autentificare/inregistrare?onboarding=1";
      const target = safeNext
        ? `${base}&next=${encodeURIComponent(safeNext)}`
        : base;
      navigate(target, { replace: true });
      return;
    }

    const finalRole =
      (["elev", "parinte", "profesor"].includes(roleDb) && roleDb) ||
      (["elev", "parinte", "profesor"].includes(roleMeta) && roleMeta) ||
      "elev";

    const safeNext = getSafeNext();
    const fallback =
      finalRole === "profesor"
        ? "/profesor/dashboard"
        : finalRole === "parinte"
        ? "/parinte/dashboard"
        : "/elev/dashboard";

    navigate(safeNext || fallback, { replace: true });
  }, [getSafeNext, navigate]);

  const autentifica = async () => {
    setErrMsg("");
    setInfoMsg("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: parola,
      });
      if (error) {
        setErrMsg(safeMsg(error));
      } else {
        await routeByRoleOrOnboarding();
      }
    } catch (e) {
      setErrMsg(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setErrMsg("");
    setInfoMsg("Se deschide Google…");
    try {
      const safeNext = getSafeNext();
      const baseCallback = `${siteUrl}/autentificare/callback`;
      const redirectTo = safeNext
        ? `${baseCallback}?next=${encodeURIComponent(safeNext)}`
        : baseCallback;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });

      if (error) {
        const msg = error.message || "";
        if (/provider is not enabled/i.test(msg))
          setErrMsg(
            "Activează Google în Supabase și setează Web Client ID/Secret."
          );
        else if (/redirect_uri_mismatch/i.test(msg))
          setErrMsg(
            "În Google Cloud, adaugă redirect: https://<project-ref>.supabase.co/auth/v1/callback."
          );
        else setErrMsg(msg);
        setInfoMsg("");
      }
    } catch (e) {
      setErrMsg(safeMsg(e));
      setInfoMsg("");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.08),transparent)]">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 hover:bg-white backdrop-blur shadow transition"
          >
            ⟵ Înapoi la pagina principală
          </Link>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-indigo-900">
              🔐 Autentificare
            </h1>
            <p className="text-sm text-gray-600">
              Intră în contul tău pe <strong>ComperEduTest</strong>.
            </p>
          </div>

          {infoMsg && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-sm text-center whitespace-pre-line">
              {infoMsg}
            </div>
          )}
          {errMsg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center whitespace-pre-line">
              {errMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-xs text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="p-2 border rounded-xl border-gray-300 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Parolă
              </label>
              <div className="relative">
                <input
                  className="border px-3 py-2 rounded-xl w-full pr-10"
                  type={showPw ? "text" : "password"}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ascunde parola" : "Afișează parola"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={autentifica}
              disabled={loading}
              className="rounded-xl px-4 text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm py-2 w-full disabled:opacity-60"
            >
              {loading ? "Se verifică..." : "➜ Autentifică-te"}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/90 backdrop-blur px-3 text-xs text-gray-500">
                  sau
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 w-full bg-white text-gray-800 border border-gray-300 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
              />
              <span>Continuă cu Google</span>
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              className="block text-center w-full bg-green-50 border border-green-500 text-green-700 hover:bg-green-100 font-semibold py-2 rounded-xl transition"
              to="/autentificare/inregistrare"
            >
              ➕ Creează cont nou
            </Link>
            <div className="text-center">
              <Link
                to="/autentificare/reseteaza-parola"
                className="text-sm text-indigo-700 hover:underline transition"
              >
                🔑 Ți-ai uitat parola?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

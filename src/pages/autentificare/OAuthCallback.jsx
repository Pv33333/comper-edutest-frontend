// src/pages/autentificare/OAuthCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

function dash(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "profesor":
      return "/profesor/dashboard";
    case "parinte":
      return "/parinte/dashboard";
    case "elev":
      return "/elev/dashboard";
    default:
      return "/";
  }
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    (async () => {
      const nextParam = params.get("next");
      const safeNext =
        nextParam && nextParam.startsWith("/") ? nextParam : null;

      // 🔄 IMPORTANT: token proaspăt (reflectă app_metadata schimbat din dashboard/SQL)
      try {
        await supabase.auth.refreshSession();
      } catch {}

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session?.user) {
        return navigate("/autentificare/login?err=session", { replace: true });
      }

      const user = session.user;
      const metaRole =
        user.app_metadata?.role || user.user_metadata?.role || null;

      // 👑 Admin → exit early: direct la dashboard admin, fără profil minim / onboarding
      if (metaRole === "admin") {
        try {
          localStorage.setItem("metaRole", "admin");
        } catch {}
        return navigate(safeNext || "/admin/dashboard", { replace: true });
      }

      // (non-admin) luăm profilul ca să decidem onboarding
      let profile = null;
      try {
        const { data, error: pErr } = await supabase
          .from("profiles")
          .select("role, username, prenume, nume")
          .eq("id", user.id)
          .maybeSingle();
        if (!pErr) profile = data;
      } catch (e) {
        console.warn("[OAuthCallback] profil:", e?.message);
      }

      const dbRole = profile?.role || null;
      const needOnboarding =
        !profile ||
        !profile.username ||
        !profile.prenume ||
        !profile.nume ||
        !profile.role;

      if (needOnboarding) {
        if (!profile) {
          // profil minim DOAR pentru non-admin
          try {
            await supabase.from("profiles").insert({
              id: user.id,
              email: user.email,
              role: null,
              username: null,
              prenume: null,
              nume: null,
            });
          } catch (e) {
            console.warn("[OAuthCallback] insert profil minim:", e?.message);
          }
        }
        const base = "/autentificare/inregistrare?onboarding=1";
        return navigate(
          safeNext ? `${base}&next=${encodeURIComponent(safeNext)}` : base,
          {
            replace: true,
          }
        );
      }

      const finalRole = metaRole || dbRole || "elev";
      try {
        localStorage.setItem("metaRole", finalRole);
      } catch {}
      return navigate(safeNext || dash(finalRole), { replace: true });
    })();
  }, [navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="opacity-70">Se finalizează autentificarea…</p>
    </div>
  );
}

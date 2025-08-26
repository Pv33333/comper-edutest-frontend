// src/context/SupabaseAuthProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.js";

const AuthCtx = createContext(null);

export default function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // încărcare sesiune + încărcare profil
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- init sesiune + subscribe la schimbări
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
      setUser(data.session?.user || null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || null);
      setUser(s?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // --- profile loader (respectă RLS pe public.profiles)
  const refreshProfile = async () => {
    setProfileLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      if (!uid) {
        setProfile(null);
        return null;
      }
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (error) {
        setProfile(null);
        return null;
      }
      setProfile(prof);
      return prof;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    refreshProfile().catch(() => setProfile(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // --- rol derivat & normalizat: profiles.role > user_metadata.role > app_metadata.role
  const role = useMemo(() => {
    const r =
      profile?.role || user?.user_metadata?.role || user?.app_metadata?.role;
    return r ? String(r).toLowerCase() : null;
  }, [profile?.role, user?.user_metadata?.role, user?.app_metadata?.role]);

  // --- acțiuni de autentificare folosite în pagini
  const signInWithPassword = async ({ email, password }) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithPassword = async ({ email, password, metadata = {} }) => {
    // Trigger-ul DB handle_new_user() va popula public.profiles la crearea userului
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // ex: { role: 'elev', prenume: '...', nume: '...' ... }
        emailRedirectTo: `${window.location.origin}/autentificare/resetare-parola-callback`,
      },
    });
  };

  const resetPasswordForEmail = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/autentificare/resetare-parola-callback`,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role,
      loading,
      profileLoading,
      signInWithPassword,
      signUpWithPassword,
      resetPasswordForEmail,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, role, loading, profileLoading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** Hook principal */
export const useAuth = () => useContext(AuthCtx);

/** Alias pentru compatibilitate cu paginile existente */
export const useAuthContext = useAuth;

/** Gard: doar autentificați (așteaptă și profilul) */
export function RequireAuth({ children, redirectTo = "/autentificare/login" }) {
  const { user, loading, profileLoading } = useAuth();
  const location = useLocation();
  if (loading || profileLoading)
    return <div className="p-6 text-center">Se încarcă…</div>;
  if (!user)
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  return children;
}

/** Gard pe rol: profiles.role sau user_metadata.role (normalizat lowercase) */
export function RequireRole({
  allow,
  children,
  fallback = null,
  redirectTo = "/autentificare/login",
}) {
  const { user, role, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading)
    return <div className="p-6 text-center">Se încarcă…</div>;
  if (!user)
    return <Navigate to={redirectTo} replace state={{ from: location }} />;

  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!role || !allowed.includes(role))
    return fallback ?? <div className="p-6 text-center">Nu ai permisiune.</div>;

  return children;
}

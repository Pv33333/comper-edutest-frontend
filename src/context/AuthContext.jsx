// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!error) {
        setSession(data?.session || null);
        setUser(data?.session?.user || null);
      }
      setAuthReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || null);
      setUser(s?.user || null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // 🔑 rolul cu prioritate din app_metadata (JWT), apoi user_metadata, apoi localStorage
  const role = useMemo(() => {
    const r =
      session?.user?.app_metadata?.role ||
      session?.user?.user_metadata?.role ||
      null;
    if (r) return r;
    try {
      return localStorage.getItem("metaRole") || null;
    } catch {
      return null;
    }
  }, [session]);

  const value = useMemo(
    () => ({ user, session, role, authReady }),
    [user, session, role, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

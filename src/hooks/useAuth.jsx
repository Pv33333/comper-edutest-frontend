import { useEffect, useState, useContext, createContext } from "react";
import { supabase } from "@/lib/supabaseClient";

// default non-null (evită crash dacă e folosit fără provider)
const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user || null);
        setLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (mounted) setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

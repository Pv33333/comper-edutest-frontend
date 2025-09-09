// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cheie de storage unică pentru proiectul tău (evită coliziuni între proiecte/tab-uri)
const STORAGE_KEY = "comper_supabase_auth_v1";

// Factory de client
function makeClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: STORAGE_KEY,
    },
  });
}

// HMR-safe singleton: o singură instanță în tot browser contextul (inclusiv cu Vite HMR)
const g = globalThis;
export const supabase =
  g.__COMPER_SUPABASE__ ?? (g.__COMPER_SUPABASE__ = makeClient());

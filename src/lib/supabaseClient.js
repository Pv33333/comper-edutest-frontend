// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ========================
//  DEBUG VARIABILE ENV
// ========================
console.group("[Supabase Debug]");
console.log(
  "VITE_SUPABASE_URL:",
  import.meta.env.VITE_SUPABASE_URL || "(undefined)"
);
if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log("VITE_SUPABASE_ANON_KEY prefix:", key.slice(0, 15));
  console.log("VITE_SUPABASE_ANON_KEY length:", key.length);
} else {
  console.warn("VITE_SUPABASE_ANON_KEY is MISSING!");
}
console.groupEnd();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ========================
//  CREATE CLIENT
// ========================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow for OAuth
    flowType: "pkce",
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "comper_supabase_auth_v1",
  },
});

// Extra debug on client creation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase Debug] Client created with missing URL or Key!");
} else {
  console.info("[Supabase Debug] Supabase client created successfully.");
}

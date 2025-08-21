// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validări prietenoase (evită "Failed to construct 'URL': Invalid URL")
if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
  throw new Error(
    "[Supabase] VITE_SUPABASE_URL lipsă sau invalid. " +
      "Exemplu corect: https://xxxx.supabase.co (setează în .env / Vercel Env)."
  );
}
if (!anonKey || typeof anonKey !== "string") {
  throw new Error(
    "[Supabase] VITE_SUPABASE_ANON_KEY lipsă. " +
      "Folosește cheia publică (anon) din Project Settings → API, NU service role."
  );
}

// Creează clientul cu opțiuni recomandate pentru SPA
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true, // păstrează sesiunea în localStorage
    autoRefreshToken: true, // reîmprospătează automat token-urile
    detectSessionInUrl: true, // necesar pentru magic links / OAuth
    flowType: "pkce", // bun pentru aplicații publice (implicit în versiunile noi)
  },
  // Realtime este activ by default; dacă vrei reconectări agresive:
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// (opțional) mic helper ca să verifici rapid env-urile în consola locală
export function logSupabaseEnvSafe() {
  const maskedKey =
    anonKey.length > 8
      ? `${anonKey.slice(0, 4)}...${anonKey.slice(-4)}`
      : "***";
  // eslint-disable-next-line no-console
  console.info("[Supabase] URL:", url, "| anon:", maskedKey);
}

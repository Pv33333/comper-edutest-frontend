// src/services/profileService.js
import { supabase } from "@/lib/supabaseClient.js";

/** Ia profilul utilizatorului curent (sau după id, dacă este dat) */
export async function getProfile(id = null) {
  const { data: u } = await supabase.auth.getUser();
  const uid = id || u?.user?.id;
  if (!uid) throw new Error("No authenticated user");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) throw error;
  return data;
}

/** Actualizează propriul profil; întoarce rândul actualizat */
export async function updateProfile(patch, id = null) {
  const { data: u } = await supabase.auth.getUser();
  const uid = id || u?.user?.id;
  if (!uid) throw new Error("No authenticated user");
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", uid)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

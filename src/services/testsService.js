// src/services/testsService.js
import { supabase } from "../lib/supabaseClient";

/**
 * Ia un test după ID (UUID) din Supabase
 */
export async function getTestById(testId) {
  if (!testId) return null;
  try {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("getTestById error:", err.message);
    return null;
  }
}

/**
 * Creează un test nou
 */
export async function createTest(test) {
  try {
    const { data, error } = await supabase
      .from("tests")
      .insert(test)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("createTest error:", err.message);
    return null;
  }
}

/**
 * Ia toate testele profesorului curent
 */
export async function getAllTests(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("getAllTests error:", err.message);
    return [];
  }
}

/**
 * Șterge un test
 */
export async function deleteTest(testId) {
  try {
    const { error } = await supabase.from("tests").delete().eq("id", testId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteTest error:", err.message);
    return false;
  }
}

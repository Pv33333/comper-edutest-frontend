// src/services/classesService.js
import { supabase } from "@/lib/supabaseClient.js";

export async function createClass({ grade_level, letter }) {
  const { data, error } = await supabase
    .from("classes")
    .insert([{ grade_level, letter: letter || null }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listMyClasses() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("classes")
    .select("id, grade_level, letter")
    .eq("teacher_id", uid)
    .order("grade_level", { ascending: true })
    .order("letter", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function deleteClass(id) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
  return true;
}

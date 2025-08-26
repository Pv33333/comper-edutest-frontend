// src/services/enrollmentsService.js
import { supabase } from "@/lib/supabaseClient.js";

export async function addStudentByEmail({ class_id, email }) {
  const { data, error } = await supabase.rpc("add_student_by_email", {
    _class_id: class_id,
    _email: email,
  });
  if (error) throw error;
  return data;
}

export async function listStudentsForClass(class_id) {
  const { data, error } = await supabase.rpc("list_students_for_class", {
    _class_id: class_id,
  });
  if (error) throw error;
  return data || [];
}

export async function removeStudentFromClass({ class_id, student_id }) {
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("class_id", class_id)
    .eq("student_id", student_id);
  if (error) throw error;
  return true;
}

// src/services/assignmentsService.js
import { supabase } from "@/lib/supabaseClient.js";

/**
 * Marchează un test programat ca ascuns pentru elevul logat
 */
export async function hideAssignment(scheduled_id) {
  const { data: u, error: eAuth } = await supabase.auth.getUser();
  if (eAuth) throw eAuth;
  const student_id = u?.user?.id;
  if (!student_id) throw new Error("Neautentificat");

  const { error } = await supabase
    .from("student_hidden_schedules")
    .insert([{ student_id, scheduled_id }]);

  // ignoră duplicate
  if (error && error.code !== "23505") throw error;
  return true;
}

/**
 * Programează un test pentru o clasă întreagă
 * @param {string} testId - UUID al testului
 * @param {string} classId - UUID al clasei
 * @param {string} scheduledAt - ISO 8601 (timestamptz)
 * @param {string|null} dueAt - ISO 8601 (timestamptz) sau null
 */
export async function scheduleTestForClass(testId, classId, scheduledAt, dueAt) {
  const { data, error } = await supabase.rpc("schedule_test_for_class", {
    p_test_id: testId,
    p_class_id: classId,
    p_scheduled_at: scheduledAt,
    p_due_at: dueAt,
  });
  if (error) throw error;
  return data;
}

/**
 * Programează un test pentru un singur elev
 * @param {string} testId - UUID al testului
 * @param {string} studentId - UUID al elevului
 * @param {string} scheduledAt - ISO 8601 (timestamptz)
 * @param {string|null} dueAt - ISO 8601 (timestamptz) sau null
 */
export async function scheduleTestForStudent(testId, studentId, scheduledAt, dueAt) {
  const { data, error } = await supabase.rpc("schedule_test_for_student", {
    p_test_id: testId,
    p_student_id: studentId,
    p_scheduled_at: scheduledAt,
    p_due_at: dueAt,
  });
  if (error) throw error;
  return data;
}

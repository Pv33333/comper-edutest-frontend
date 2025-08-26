// src/services/calendarService.js
import { supabase } from "@/lib/supabaseClient.js";

/** Programare test către CLASĂ (RPC SECURITY DEFINER) */
export async function scheduleForClass({
  test_id,
  class_id,
  scheduled_at,
  due_at,
}) {
  const { error } = await supabase.rpc("schedule_test_for_class", {
    _test_id: test_id,
    _class_id: class_id,
    _scheduled_at: scheduled_at,
    _due_at: due_at,
  });
  if (error) throw error;
  return true;
}

/** Programare test către ELEV (RPC SECURITY DEFINER) */
export async function scheduleForStudent({
  test_id,
  student_id,
  scheduled_at,
  due_at,
}) {
  const { error } = await supabase.rpc("schedule_test_for_student", {
    _test_id: test_id,
    _student_id: student_id,
    _scheduled_at: scheduled_at,
    _due_at: due_at,
  });
  if (error) throw error;
  return true;
}

/** Lista tuturor programărilor vizibile elevului logat (exclude cele ASCUNSE) */
export async function listStudentAssignments() {
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = u?.user?.id;
  if (!uid) return [];

  // Clasele în care e elevul
  const { data: myEnroll, error: eEnroll } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", uid);
  if (eEnroll) throw eEnroll;
  const classIds = (myEnroll || []).map((r) => r.class_id).filter(Boolean);

  // Programări direct către elev
  const { data: direct, error: eDirect } = await supabase
    .from("scheduled_tests")
    .select(
      `id, test_id, class_id, student_id, scheduled_at, due_at, tests:tests(*)`
    )
    .eq("student_id", uid)
    .order("scheduled_at", { ascending: false });
  if (eDirect) throw eDirect;

  // Programări către clasele elevului
  let onClasses = [];
  if (classIds.length) {
    const { data, error } = await supabase
      .from("scheduled_tests")
      .select(
        `id, test_id, class_id, student_id, scheduled_at, due_at, tests:tests(*)`
      )
      .in("class_id", classIds)
      .order("scheduled_at", { ascending: false });
    if (error) throw error;
    onClasses = data || [];
  }

  // Combinate (înainte de filtrul "ascunse")
  const combined = [...(direct || []), ...(onClasses || [])];

  // Ia „ascunsele” din DB și filtrează
  const { data: hiddenRows, error: eHidden } = await supabase
    .from("student_hidden_schedules")
    .select("scheduled_id")
    .eq("student_id", uid);
  if (eHidden) throw eHidden;
  const hidden = new Set((hiddenRows || []).map((r) => r.scheduled_id));

  const visible = combined.filter((r) => !hidden.has(r.id));

  // Unic + sort desc după scheduled_at
  const unique = Array.from(new Map(visible.map((r) => [r.id, r])).values());
  unique.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
  return unique;
}

/** Cea mai recentă programare a unui test pentru elevul curent (ține cont de clase) */
export async function getMyScheduledTest(test_id) {
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = u?.user?.id;
  if (!uid) throw new Error("Neautentificat.");

  // Clasele elevului
  const { data: myEnroll, error: eEnroll } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", uid);
  if (eEnroll) throw eEnroll;
  const classIds = (myEnroll || []).map((r) => r.class_id).filter(Boolean);

  // Programare directă pentru elev la acest test
  const { data: direct, error: e1 } = await supabase
    .from("scheduled_tests")
    .select(
      `id, test_id, class_id, student_id, scheduled_at, due_at, tests:tests(*)`
    )
    .eq("test_id", test_id)
    .eq("student_id", uid)
    .order("scheduled_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (e1) throw e1;

  // Programare pe una dintre clasele elevului
  let onClass = null;
  if (classIds.length) {
    const { data, error } = await supabase
      .from("scheduled_tests")
      .select(
        `id, test_id, class_id, student_id, scheduled_at, due_at, tests:tests(*)`
      )
      .eq("test_id", test_id)
      .in("class_id", classIds)
      .order("scheduled_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    onClass = data || null;
  }

  // Returnează cea mai recentă dintre ele, dacă există
  if (direct && onClass) {
    return new Date(direct.scheduled_at) >= new Date(onClass.scheduled_at)
      ? direct
      : onClass;
  }
  return direct || onClass || null;
}

// export alias pentru compatibilitate (folosește aceeași funcție)
export { listStudentAssignments as listTeacherSchedules };

const calendarService = {
  scheduleForClass,
  scheduleForStudent,
  listStudentAssignments,
  getMyScheduledTest,
};
export default calendarService;

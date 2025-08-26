// src/services/resultsService.js
import { supabase } from "@/lib/supabaseClient.js";

/**
 * Salvează rezultatul elevului la un test.
 */
export async function saveResult({ test_id, answers = [], score = 0, duration_sec = 0 }) {
  const { data: u, error: eAuth } = await supabase.auth.getUser();
  if (eAuth) throw eAuth;
  const uid = u?.user?.id;
  if (!uid) throw new Error("Neautentificat.");

  const { data, error } = await supabase
    .from("results")
    .insert([{
      test_id,
      student_id: uid,
      answers,
      score,
      duration_sec,
      submitted_at: new Date().toISOString(),
    }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** ─────────────────────────────
 *   PROFIL & TEST
 *  ───────────────────────────── */
export async function getStudentProfile(student_id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", student_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getTest(test_id) {
  const { data, error } = await supabase
    .from("tests")
    .select("id, title, subject, grade_level, created_by")
    .eq("id", test_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Returnează un rezultat detaliat din view-ul results_with_profiles.
 */
export async function getResultDetailed({ test_id, student_id, result_id }) {
  let q = supabase.from("results_with_profiles").select("*");
  if (test_id) q = q.eq("test_id", test_id);
  if (student_id) q = q.eq("student_id", student_id);
  if (result_id) q = q.eq("result_id", result_id);

  const { data, error } = await q.order("submitted_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function getResultByTestAndStudent(test_id, student_id) {
  return getResultDetailed({ test_id, student_id });
}

/** ─────────────────────────────
 *   Answer key + enunțuri (ROBUST)
 *  ───────────────────────────── */
function pickText(obj = {}) {
  return (
    obj.text ?? obj.enunt ?? obj.question ?? obj.question_text ?? obj.prompt ?? obj.title ?? null
  );
}
function pickCorrect(obj = {}) {
  // suportă diverse scheme
  if (obj.corect != null) return obj.corect;
  if (obj.correct != null) return obj.correct;
  if (obj.correct_option != null) return obj.correct_option;
  if (obj.answer != null) return obj.answer;
  if (obj.solution != null) return obj.solution;
  // uneori opțiunile au isCorrect / correctIndex
  if (Array.isArray(obj.options)) {
    const byFlag = obj.options.find((o) => o?.isCorrect === true || o?.correct === true);
    if (byFlag?.value != null) return byFlag.value;
    if (byFlag?.label != null) return byFlag.label;
    if (obj.correctIndex != null && obj.options[obj.correctIndex] != null) {
      return obj.options[obj.correctIndex]?.value ?? obj.options[obj.correctIndex]?.label ?? obj.correctIndex;
    }
  }
  return null;
}

function arrayFromMaybe(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  // uneori e string json
  try {
    if (typeof obj === "string") {
      const parsed = JSON.parse(obj);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

export async function getAnswerKeyAndItems(test_id) {
  // 0) fetch o singură dată coloanele posibile din tests
  let testsRow = null;
  try {
    const { data, error } = await supabase
      .from("tests")
      .select("answer_key, questions, content, structure, items")
      .eq("id", test_id)
      .maybeSingle();
    if (!error) testsRow = data;
  } catch {}

  // A) tests.answer_key (map index->val)
  if (testsRow?.answer_key && typeof testsRow.answer_key === "object") {
    return { answerKey: testsRow.answer_key, items: [] };
  }

  // B) tests.questions (jsonb array)
  const questions = arrayFromMaybe(testsRow?.questions);
  if (questions.length) {
    const answerKey = {};
    const items = questions.map((q, i) => {
      const idx = Number(q.index ?? i);
      const text = pickText(q);
      const corr = pickCorrect(q);
      if (corr != null) answerKey[idx] = corr;
      return { index: idx, text: text ?? null };
    });
    return { answerKey, items };
  }

  // C) tests.content / tests.structure / tests.items (posibil JSON cu secțiuni)
  for (const key of ["content", "structure", "items"]) {
    const arr = arrayFromMaybe(testsRow?.[key]);
    if (arr.length) {
      const flat = [];
      const stack = [...arr];
      while (stack.length) {
        const node = stack.shift();
        if (!node) continue;
        if (Array.isArray(node)) { stack.push(...node); continue; }
        if (node.children) stack.push(...arrayFromMaybe(node.children));
        if (node.questions) stack.push(...arrayFromMaybe(node.questions));
        if (
          node.text || node.enunt || node.question || node.question_text || node.prompt ||
          node.options || node.correct != null || node.correct_option != null
        ) {
          flat.push(node);
        }
      }
      if (flat.length) {
        const answerKey = {};
        const items = flat.map((q, i) => {
          const idx = Number(q.index ?? i);
          const text = pickText(q);
          const corr = pickCorrect(q);
          if (corr != null) answerKey[idx] = corr;
          return { index: idx, text: text ?? null };
        });
        return { answerKey, items };
      }
    }
  }

  // D) test_items (tabel separat)
  try {
    const { data, error } = await supabase
      .from("test_items")
      .select("index, correct_option, text, question_text, prompt")
      .eq("test_id", test_id)
      .order("index", { ascending: true });
    if (!error && Array.isArray(data) && data.length) {
      const answerKey = {};
      const items = data.map((row, i) => {
        const idx = typeof row.index === "number" ? row.index : i;
        const text = row.text ?? row.question_text ?? row.prompt ?? null;
        if (row.correct_option != null) answerKey[idx] = row.correct_option;
        return { index: idx, text };
      });
      return { answerKey, items };
    }
  } catch {}

  // E) questions (fallback)
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("index, correct, correct_option, text, question_text, prompt, options, correctIndex")
      .eq("test_id", test_id)
      .order("index", { ascending: true });
    if (!error && Array.isArray(data) && data.length) {
      const answerKey = {};
      const items = data.map((row, i) => {
        const idx = typeof row.index === "number" ? row.index : i;
        const text = row.text ?? row.question_text ?? row.prompt ?? null;
        const corr = row.correct ?? row.correct_option ?? (
          Array.isArray(row.options) && row.correctIndex != null && row.options[row.correctIndex] != null
            ? (row.options[row.correctIndex].value ?? row.options[row.correctIndex].label ?? row.correctIndex)
            : null
        );
        if (corr != null) answerKey[idx] = corr;
        return { index: idx, text };
      });
      return { answerKey, items };
    }
  } catch {}

  return { answerKey: {}, items: [] };
}

/** ─────────────────────────────
 *   PROFESOR: liste rezultate
 *  ───────────────────────────── */
export async function listStudentsWithResultsForTeacher() {
  const { data: u } = await supabase.auth.getUser();
  const teacherId = u?.user?.id;
  if (!teacherId) return [];

  const { data, error } = await supabase
    .from("results_with_profiles")
    .select("student_id, full_name, email")
    .eq("created_by", teacherId);

  if (error) throw error;

  const uniq = {};
  for (const r of data || []) {
    const profile = { id: r.student_id, full_name: r.full_name || r.student_id, email: r.email || "—" };
    uniq[profile.id] = profile;
  }
  return Object.values(uniq);
}

export async function listResultsForStudentForTeacher(student_id) {
  const { data: u } = await supabase.auth.getUser();
  const teacherId = u?.user?.id;
  if (!teacherId || !student_id) return [];

  const { data, error } = await supabase
    .from("results_with_profiles")
    .select("*")
    .eq("student_id", student_id)
    .eq("created_by", teacherId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    key: row.result_id || row.id,
    testID: row.test_id,
    elevID: row.student_id,
    elevNume: row.full_name || row.student_id,
    elevEmail: row.email || "—",
    data: new Date(row.submitted_at).toLocaleDateString("ro-RO"),
    raspunsuri: Array.isArray(row.answers) ? row.answers : Object.values(row.answers || {}),
    score: row.score,
    duration_sec: row.duration_sec,
    testTitle: row.test_title || row.title,
    subject: row.subject,
    grade_level: row.grade_level,
  }));
}

export async function listAllResultsForTeacher() {
  const { data: u } = await supabase.auth.getUser();
  const teacherId = u?.user?.id;
  if (!teacherId) return [];

  const { data, error } = await supabase
    .from("results_with_profiles")
    .select("*")
    .eq("created_by", teacherId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    key: row.result_id || row.id,
    testID: row.test_id,
    elevID: row.student_id,
    elevNume: row.full_name || row.student_id,
    elevEmail: row.email || "—",
    data: new Date(row.submitted_at).toLocaleDateString("ro-RO"),
    raspunsuri: Array.isArray(row.answers) ? row.answers : Object.values(row.answers || {}),
    score: row.score,
    duration_sec: row.duration_sec,
    testTitle: row.test_title || row.title,
    subject: row.subject,
    grade_level: row.grade_level,
  }));
}

/** Default export */
const ResultsAPI = {
  saveResult,
  getStudentProfile,
  getTest,
  getResultDetailed,
  getResultByTestAndStudent,
  getAnswerKeyAndItems,
  listStudentsWithResultsForTeacher,
  listResultsForStudentForTeacher,
  listAllResultsForTeacher,
};
export default ResultsAPI;

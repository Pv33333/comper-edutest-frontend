import { supabase } from "@/lib/supabaseClient.js";

async function getUid() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user?.id || null;
}

// cheile TREBUIE să fie string
const romanToArabic = {
  0: "0",
  I: "1",
  II: "2",
  III: "3",
  IV: "4",
  V: "5",
  VI: "6",
  VII: "7",
  VIII: "8",
};

function backfillGrade(row) {
  if (row.grade == null) {
    const gl = row.grade_level ?? row.content?.clasa ?? null;
    if (typeof gl === "string") {
      const g = romanToArabic[gl] ?? romanToArabic[String(gl).toUpperCase()];
      if (g != null) row.grade = g;
    }
  }
  return row;
}

export async function createTest(payload) {
  const uid = await getUid();
  if (!uid) throw new Error("Nu ești autentificat.");
  const row = backfillGrade({ ...payload, created_by: uid });
  const { data, error } = await supabase
    .from("tests")
    .insert([row])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getTestById(id) {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateTest(id, partial) {
  const row = backfillGrade({ ...partial });
  const { data, error } = await supabase
    .from("tests")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTest(id) {
  const { error } = await supabase.from("tests").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function listTests(filters = {}) {
  const { subject, grade_level, category, created_by, published, phase } =
    filters;
  let q = supabase.from("tests").select("*");
  if (subject) q = q.eq("subject", subject);
  if (grade_level) q = q.eq("grade_level", grade_level);
  if (category) q = q.eq("category", category);
  if (typeof published === "boolean") q = q.eq("published", published);
  if (phase) q = q.eq("phase", phase);

  const uid = created_by || (await getUid());
  if (uid) q = q.eq("created_by", uid);

  q = q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

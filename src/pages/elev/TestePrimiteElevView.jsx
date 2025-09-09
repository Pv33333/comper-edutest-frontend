// src/pages/elev/TestePrimiteElevView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const useQuery = () => new URLSearchParams(useLocation().search);
const isUUID = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v || "")
  );

export default function TestePrimiteElevView() {
  const navigate = useNavigate();
  const q = useQuery();

  // Query params validate
  const rawSid = q.get("sid");
  const sid = isUUID(rawSid) ? rawSid : null;

  const rawTestId = q.get("test_id");
  const testId = isUUID(rawTestId) ? rawTestId : null;

  const [session, setSession] = useState(null);
  const [studentIds, setStudentIds] = useState([]);
  const [row, setRow] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // sesiune
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    })();
  }, []);

  // candidate student ids
  useEffect(() => {
    (async () => {
      if (!session?.user) return;
      const candidates = new Set();
      const authId = session.user.id;
      const email = (session.user.email || "").toLowerCase().trim();
      if (authId) candidates.add(authId);

      if (email) {
        const { data: s1 } = await supabase
          .from("students")
          .select("id")
          .eq("email", email);
        (s1 || []).forEach((r) => r?.id && candidates.add(r.id));

        const { data: s2 } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("email", email);
        (s2 || []).forEach((r) => r?.id && candidates.add(r.id));
      }
      setStudentIds(Array.from(candidates));
    })();
  }, [session]);

  const fmt = useMemo(
    () => (ts) =>
      ts
        ? new Date(ts).toLocaleString("ro-RO", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—",
    []
  );

  // load row defensively
  useEffect(() => {
    (async () => {
      if (!studentIds.length) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);

      try {
        if (sid) {
          const { data, error } = await supabase
            .from("v_student_received_tests")
            .select("*")
            .eq("id", sid)
            .in("student_id", studentIds)
            .maybeSingle();
          if (error) throw error;
          setRow(data || null);
          setLoading(false);
          return;
        }

        if (testId) {
          const { data, error } = await supabase
            .from("v_student_received_tests")
            .select("*")
            .eq("test_id", testId)
            .in("student_id", studentIds)
            .order("scheduled_for", { ascending: false })
            .limit(1);
          if (error) throw error;
          setRow((data && data[0]) || null);
          setLoading(false);
          return;
        }

        // fallback: ultimul test
        const { data, error } = await supabase
          .from("v_student_received_tests")
          .select("*")
          .in("student_id", studentIds)
          .order("scheduled_for", { ascending: false })
          .limit(1);
        if (error) throw error;
        setRow((data && data[0]) || null);
        setLoading(false);
      } catch (e) {
        setErr(e?.message || "Eroare la încărcare.");
        setLoading(false);
      }
    })();
  }, [studentIds, sid, testId]);

  const startTest = () => {
    if (!row?.id) return;
    navigate(`/elev/teste/incepe?sid=${row.id}`);
  };

  // UI
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center">
            <Link
              to="/elev/teste-primite"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
            >
              ⟵ Înapoi la Teste primite
            </Link>
          </div>
          <div className="mt-6 rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
            Se încarcă…
          </div>
        </div>
      </div>
    );
  }

  if (err || !row) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center">
            <Link
              to="/elev/teste-primite"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
            >
              ⟵ Înapoi la Teste primite
            </Link>
          </div>
          <div className="mt-6 rounded-3xl border border-red-100 bg-white/90 backdrop-blur p-6 shadow-xl">
            <div className="text-red-700 font-semibold mb-1">
              Nu ai acces la acest test sau nu este programat pentru tine.
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
          </div>
        </div>
      </div>
    );
  }

  // premium card
  const subject = row.subject || "—";
  const classLabel = row.school_class || "—";
  const dataStr = row.exam_date || "—";
  const oraStr = row.exam_time || "—";
  const prof = row.teacher_name || "—";
  const descr = row.description || row.descriere || "—";

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center">
          <Link
            to="/elev/teste-primite"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Teste primite
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-indigo-900 truncate">
                {row.title || "Test"}
              </h1>
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
                  📘 {subject}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
                  🏫 {classLabel}
                </span>
              </div>
            </div>

            <button
              onClick={startTest}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm shadow"
            >
              ▶ Începe testul
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">🗓 Data</div>
              <div className="font-medium">{dataStr}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">• Ora</div>
              <div className="font-medium">{oraStr}</div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-gray-500">Profesor</div>
              <div className="font-medium">{prof}</div>
            </div>
          </div>

          {descr ? (
            <div className="mt-4 rounded-2xl border p-4">
              <div className="text-xs text-gray-500">Descriere</div>
              <div className="font-medium whitespace-pre-wrap break-words">
                {descr}
              </div>
            </div>
          ) : null}

          <div className="mt-4 text-xs text-gray-500">
            Programat: {fmt(row.scheduled_for)} • Status: {row.status || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/profesor/RezultateElevi.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";

function fmtDateTime(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("ro-RO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(ts);
  }
}

export default function RezultateElevi() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // rezultate îmbogățite
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);

      const userId = session?.user?.id;
      if (!userId) {
        setRows([]);
        setLoading(false);
        return;
      }

      // 1) testele create de profesorul curent (meta pentru rezultat)
      const { data: tests } = await supabase
        .from("tests")
        .select(
          "id, subject, test_type, school_class, exam_date, exam_time, teacher_name, description, status, created_by"
        )
        .eq("created_by", userId);

      const testById = new Map((tests || []).map((t) => [t.id, t]));
      const testIds = new Set((tests || []).map((t) => t.id));

      // 2) rezultate elevi (cu nume+email). Încercăm view-ul results_with_profiles; dacă nu există, facem fallback.
      let res = [];
      let usedView = false;

      const tryView = await supabase
        .from("results_with_profiles")
        .select(
          "id, test_id, student_id, score, duration_sec, submitted_at, student_name, student_email, answers"
        );
      if (!tryView.error && Array.isArray(tryView.data)) {
        usedView = true;
        res = tryView.data || [];
      }

      if (!usedView) {
        // fallback: results + profiles/student_profiles/students
        const { data: raw } = await supabase
          .from("results")
          .select(
            "id, test_id, student_id, score, duration_sec, submitted_at, answers"
          );

        const sids = Array.from(
          new Set((raw || []).map((r) => r.student_id).filter(Boolean))
        );
        const [p1, p2, p3] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", sids),
          supabase
            .from("student_profiles")
            .select("id, full_name, email")
            .in("id", sids),
          supabase.from("students").select("id, name, email").in("id", sids),
        ]);

        const profMap = new Map(
          (p1.data || []).map((x) => [
            x.id,
            { name: x.full_name, email: x.email },
          ])
        );
        const studProfMap = new Map(
          (p2.data || []).map((x) => [
            x.id,
            { name: x.full_name, email: x.email },
          ])
        );
        const studMap = new Map(
          (p3.data || []).map((x) => [x.id, { name: x.name, email: x.email }])
        );

        res = (raw || []).map((r) => {
          const f =
            profMap.get(r.student_id) ||
            studProfMap.get(r.student_id) ||
            studMap.get(r.student_id) ||
            {};
          return {
            ...r,
            student_name: f.name || "—",
            student_email: f.email || "—",
          };
        });
      }

      // 3) păstrăm DOAR rezultatele pentru testele profesorului curent
      const mine = (res || []).filter((r) => testIds.has(r.test_id));

      // 4) îmbogățim rândurile cu meta test pentru card
      const enriched = mine.map((r) => {
        const t = testById.get(r.test_id) || {};
        const test_name =
          t.description?.trim() ||
          [t.subject, t.test_type].filter(Boolean).join(" • ") ||
          "Test";
        return {
          ...r,
          test_name,
          test_subject: t.subject || "—",
          test_type: t.test_type || "—",
          school_class: t.school_class || "—",
          exam_date: t.exam_date || null,
          exam_time: t.exam_time || null,
          teacher_name: t.teacher_name || "—",
          test_status: t.status || null,
        };
      });

      // ordonăm desc după data trimiterii
      enriched.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));

      setRows(enriched);
      setLoading(false);
    })();
  }, [session?.user?.id, supabase]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = [
        r.student_name,
        r.student_email,
        r.test_name,
        r.test_subject,
        r.test_type,
        r.school_class,
        r.teacher_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* back top center */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-900">
            Rezultate elevi
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Nume elev, clasa, scor, data & ora, numele testului, profesor.
          </p>
          <div className="mt-3 mx-auto max-w-3xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Caută după elev, email, test, profesor, clasa…"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* listă rezultate */}
        {loading ? (
          <div className="text-center text-sm text-gray-600">Se încarcă…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-600 text-sm">
            Nu există rezultate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="group rounded-2xl border border-indigo-100 bg-white/90 backdrop-blur p-4 shadow hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                {/* header: elev + scor */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-indigo-900 truncate">
                      {r.student_name || "—"}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {r.student_email || "—"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-gray-500">Scor</div>
                    <div className="text-base font-bold text-indigo-700">
                      {r.score ?? "—"}
                    </div>
                  </div>
                </div>

                {/* chips: nume test + clasa */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
                    🧪 {r.test_name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
                    🏫 {r.school_class}
                  </span>
                </div>

                {/* meta: data/ora, profesor */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border p-2">
                    <div className="text-[10px] text-gray-500">🗓 Trimis la</div>
                    <div className="font-medium truncate">
                      {fmtDateTime(r.submitted_at)}
                    </div>
                  </div>
                  <div className="rounded-xl border p-2">
                    <div className="text-[10px] text-gray-500">👤 Profesor</div>
                    <div className="font-medium truncate">
                      {r.teacher_name || "—"}
                    </div>
                  </div>
                </div>

                {/* info subtile */}
                <div className="mt-2 text-[11px] text-gray-600">
                  {r.test_subject ? `📘 ${r.test_subject}` : ""}{" "}
                  {r.test_type ? ` · 🏷 ${r.test_type}` : ""}
                </div>

                {/* >>> BUTON DETALII ⇩⇩⇩ */}
                <div className="mt-3">
                  <Link
                    to={`/profesor/rapoarte?result=${encodeURIComponent(r.id)}`}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs hover:bg-white bg-white/70 backdrop-blur"
                    aria-label="Vezi detalii rezultat în rapoarte de testare"
                    title="Vezi detalii"
                  >
                    🔍 Detalii
                  </Link>
                </div>
                {/* <<< BUTON DETALII */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const statusLabel = (s) => {
  const v = String(s || "").toLowerCase();
  if (["draft", "neexpediat"].includes(v))
    return {
      text: "Neexpediat",
      cls: "bg-gray-100 text-gray-700 border-gray-200",
    };
  if (
    [
      "assigned",
      "scheduled",
      "pending",
      "în așteptare",
      "in asteptare",
    ].includes(v)
  )
    return {
      text: "În așteptare",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    };
  if (["completed", "rezolvat", "submitted"].includes(v))
    return {
      text: "Rezolvat",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  return { text: s || "—", cls: "bg-gray-100 text-gray-700 border-gray-200" };
};

export default function TestePrimiteElev() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [studentIds, setStudentIds] = useState([]);
  const [rows, setRows] = useState([]);
  const [testsMeta, setTestsMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user) return;
      const email = (session.user.email || "").toLowerCase().trim();
      if (!email) return;
      const { data: s1 } = await supabase
        .from("students")
        .select("id")
        .eq("email", email);
      setStudentIds((s1 || []).map((r) => r.id));
    })();
  }, [session]);

  const loadRows = async (ids = studentIds) => {
    if (!ids.length) {
      setRows([]);
      setTestsMeta({});
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: recs } = await supabase
      .from("v_student_received_tests")
      .select("*")
      .in("student_id", ids)
      .neq("status", "deleted")
      .order("scheduled_for", { ascending: false });

    setRows(recs || []);

    const tids = Array.from(new Set((recs || []).map((r) => r.test_id))).filter(
      Boolean
    );
    if (tids.length) {
      const { data: tmeta } = await supabase
        .from("tests")
        .select(
          "id, title, subject, test_type, school_class, exam_date, exam_time, teacher_name, description"
        );

      const map = {};
      (tmeta || [])
        .filter((t) => tids.includes(t.id))
        .forEach((t) => {
          map[t.id] = {
            title: t.title,
            subject: t.subject,
            test_type: t.test_type,
            school_class: t.school_class,
            exam_date: t.exam_date,
            exam_time: t.exam_time,
            teacher_name: t.teacher_name,
            description: t.description || "",
          };
        });
      setTestsMeta(map);
    } else {
      setTestsMeta({});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRows(); // eslint-disable-line
  }, [studentIds]);

  const handleSterge = async (assignmentId) => {
    const { error } = await supabase
      .from("assignments")
      .update({ status: "deleted" })
      .eq("id", assignmentId);

    if (error) {
      console.error(error);
    } else {
      setRows((prev) => prev.filter((r) => r.assignment_id !== assignmentId));
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const t = testsMeta[r.test_id] || {};
      const hay = [
        r.title,
        r.description,
        t.title,
        t.subject,
        t.test_type,
        t.school_class,
        t.exam_date,
        t.exam_time,
        t.teacher_name,
        t.description,
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, testsMeta, q]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <Link
            to="/elev/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
          <input
            type="text"
            placeholder="🔍 Caută după titlu, materie, profesor, clasă..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-lg border px-4 py-2 text-sm w-64 shadow-sm"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-indigo-900 mt-6">
          Testele mele primite
        </h1>

        {loading ? (
          <div className="text-sm text-gray-600 mt-4">Se încarcă testele…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-600 mt-4">Nu ai teste primite.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const t = testsMeta[r.test_id] || {};
              const s = statusLabel(r.status);

              return (
                <div
                  key={r.assignment_id}
                  className="group rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-white p-5 shadow-md transition hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-indigo-900 line-clamp-2">
                        {r.title ||
                          r.description ||
                          t.title ||
                          "Test fără titlu"}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${s.cls}`}
                      >
                        {s.text}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
                        📘 {t.subject ?? r.subject ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
                        🏫 {t.school_class ?? r.school_class ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5">
                        🏷 {t.test_type ?? r.test_type ?? "—"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border p-3 bg-white/70">
                        <div className="text-[11px] text-gray-500">🗓 Data</div>
                        <div className="font-medium">
                          {t.exam_date || r.exam_date || "—"}{" "}
                          {t.exam_time || r.exam_time
                            ? `• ${t.exam_time || r.exam_time}`
                            : ""}
                        </div>
                      </div>
                      <div className="rounded-xl border p-3 bg-white/70">
                        <div className="text-[11px] text-gray-500">
                          👤 Profesor
                        </div>
                        <div className="font-medium">
                          {t.teacher_name ||
                            r.teacher_name ||
                            "Profesor necunoscut"}
                        </div>
                      </div>
                    </div>

                    {t.description && (
                      <div className="mt-4 rounded-xl border p-3 bg-white/80 text-sm">
                        <div className="text-[11px] text-gray-500">
                          Descriere
                        </div>
                        <p className="mt-1 text-gray-700 line-clamp-3">
                          {t.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      ID:{" "}
                      <span className="font-mono text-[11px]">{r.test_id}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/elev/rezolva-test?sid=${r.assignment_id}`)
                        }
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm shadow-sm"
                      >
                        Deschide
                      </button>
                      <button
                        onClick={() => handleSterge(r.assignment_id)}
                        className="rounded-lg border border-red-200 text-red-600 px-3 py-1 text-sm hover:bg-red-50"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

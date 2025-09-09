// src/pages/elev/TestePrimiteElev.jsx
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
      "in asteptare",
      "în așteptare",
      "pending",
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
  const [rows, setRows] = useState([]); // programări (v_student_received_tests)
  const [testsMeta, setTestsMeta] = useState({}); // meta pentru fiecare test_id
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [q, setQ] = useState(""); // 🔍 search

  // session
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    })();
  }, []);

  // candidate student ids (auth.uid + mapare pe email în students/student_profiles)
  useEffect(() => {
    (async () => {
      if (!session?.user) return;
      const s = new Set();
      const authId = session.user.id;
      const email = (session.user.email || "").toLowerCase().trim();
      if (authId) s.add(authId);
      if (email) {
        const { data: s1 } = await supabase
          .from("students")
          .select("id")
          .eq("email", email);
        (s1 || []).forEach((r) => r?.id && s.add(r.id));
        const { data: s2 } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("email", email);
        (s2 || []).forEach((r) => r?.id && s.add(r.id));
      }
      setStudentIds(Array.from(s));
    })();
  }, [session]);

  // load list + tests meta
  const loadRows = async (ids = studentIds) => {
    if (!ids.length) {
      setRows([]);
      setTestsMeta({});
      setLoading(false);
      return;
    }
    setLoading(true);

    // 1) programările elevului
    const { data: recs } = await supabase
      .from("v_student_received_tests")
      .select("*")
      .in("student_id", ids)
      .order("scheduled_for", { ascending: false });
    setRows(recs || []);

    // 2) meta test (tabela tests)
    const tids = Array.from(new Set((recs || []).map((r) => r.test_id))).filter(
      Boolean
    );
    if (tids.length) {
      const { data: tmeta } = await supabase
        .from("tests")
        .select(
          "id, subject, test_type, school_class, exam_date, exam_time, teacher_name, description, descriere"
        );
      const map = {};
      (tmeta || [])
        .filter((t) => tids.includes(t.id))
        .forEach((t) => {
          map[t.id] = {
            subject: t.subject,
            test_type: t.test_type,
            school_class: t.school_class,
            exam_date: t.exam_date,
            exam_time: t.exam_time,
            teacher_name: t.teacher_name,
            description: t.description || t.descriere || "",
          };
        });
      setTestsMeta(map);
    } else {
      setTestsMeta({});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRows(); /* eslint-disable-next-line */
  }, [studentIds]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const deleteScheduled = async (sid) => {
    if (!sid) return;
    if (!confirm("Ștergi programarea acestui test?")) return;
    const { data, error } = await supabase
      .from("student_tests")
      .delete()
      .eq("id", sid)
      .select("id");
    if (error) return setToast({ t: "error", m: error.message });
    if (!data?.length)
      return setToast({
        t: "error",
        m: "Nu ai permisiune să ștergi acest test.",
      });
    setToast({ t: "success", m: "Test șters din lista ta." });
    await loadRows();
  };

  // 🔍 filtrare locală ca în Rezultate elevi (căutăm în titlu/meta/status)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const t = testsMeta[r.test_id] || {};
      const hay = [
        r.title,
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
      <div className="max-w-5xl mx-auto p-6">
        {/* back top center */}
        <div className="flex justify-center">
          <Link
            to="/elev/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-indigo-900 mt-6">
          Teste primite
        </h1>
        <p className="text-sm text-gray-600">
          Vezi testele programate de profesorii tăi.
        </p>

        {/* 🔍 Search bar identic cu Rezultate elevi */}
        <div className="mt-3 mx-auto max-w-3xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută după titlu, materie, tip, profesor, clasa…"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70 backdrop-blur"
          />
        </div>

        {loading ? (
          <div className="text-sm text-gray-600 mt-4">
            Se încarcă testele primite…
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => {
              const t = testsMeta[r.test_id] || {};
              const s = statusLabel(r.status);
              return (
                <div
                  key={r.id}
                  className="group rounded-2xl border border-indigo-100 bg-white/90 backdrop-blur p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-indigo-900 truncate">
                        {r.title || "Test"}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
                          📘 {t.subject ?? r.subject ?? "—"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2 py-0.5">
                          🏷 {t.test_type || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
                          🏫 {t.school_class || "—"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${s.cls}`}
                        >
                          {s.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() =>
                          navigate(`/elev/teste/incepe?sid=${r.id}`)
                        }
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                        title="Deschide / Începe"
                      >
                        Deschide
                      </button>
                      <button
                        onClick={() => deleteScheduled(r.id)}
                        className="rounded-lg border border-red-200 text-red-600 px-3 py-1 text-xs hover:bg-red-50"
                        title="Șterge test"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border p-2">
                      <div className="text-[10px] text-gray-500">🗓 Data</div>
                      <div className="font-medium truncate">
                        {t.exam_date || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border p-2">
                      <div className="text-[10px] text-gray-500">• Ora</div>
                      <div className="font-medium truncate">
                        {t.exam_time || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border p-2">
                      <div className="text-[10px] text-gray-500">
                        👤 Profesor
                      </div>
                      <div className="font-medium truncate">
                        {t.teacher_name || "—"}
                      </div>
                    </div>
                  </div>

                  {!!t.description && (
                    <div className="mt-3 rounded-xl border p-2 text-xs">
                      <div className="text-[10px] text-gray-500">Descriere</div>
                      <div className="font-medium line-clamp-2">
                        {t.description}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-gray-500">
                    Programat:{" "}
                    {r.scheduled_for
                      ? new Date(r.scheduled_for).toLocaleString("ro-RO", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </div>
                </div>
              );
            })}

            {!filtered.length && !loading && (
              <div className="col-span-full text-center text-gray-600 text-sm">
                Nu există rezultate pentru căutare.
              </div>
            )}
          </div>
        )}

        {toast && (
          <div
            className={
              "fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow " +
              (toast.t === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-emerald-100 text-emerald-800 border-emerald-200")
            }
          >
            {toast.m}
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/profesor/TesteProfesor.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Link, useNavigate } from "react-router-dom";

/* ───────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const useDebounced = (v, ms = 300) => {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setVal(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return val;
};
function labelMaterie(subject) {
  if (!subject) return "—";
  const s = String(subject).toLowerCase();
  if (s.includes("rom")) return "Limba română";
  if (s.includes("mat")) return "Matematică";
  return subject;
}
function mapRowToCard(row) {
  return {
    id: row.id,
    title: row.title || row.nume || "Test",
    materie: labelMaterie(row.subject || row.materie),
    test_type: row.test_type || row.tip_test || "—",
    school_class: row.school_class || row.clasa || "—",
    exam_date: row.exam_date || row.data || null,
    data: fmtDate(row.exam_date || row.data || null),
    ora: row.exam_time || row.ora || "—",
    profesor: row.teacher_name || row.profesor || "—",
    descriere: row.description || row.descriere || "",
    status: row.status || "neexpediat",
    created_at: row.created_at || null,
    source: "supabase",
  };
}

/* ───────────────────────────────────────────────
   Card premium modern
──────────────────────────────────────────────── */
function PremiumCard({
  t,
  onEdit,
  onSendStudents,
  onSendAdmin,
  onSchedule,
  onDelete,
}) {
  const statusColors = {
    neexpediat: "bg-gray-100 text-gray-700 border-gray-200",
    "în așteptare": "bg-amber-50 text-amber-700 border-amber-200",
    rezolvat: "bg-emerald-50 text-emerald-700 border-emerald-200",
    deleted: "bg-red-50 text-red-700 border-red-200",
  };
  const badgeCls =
    statusColors[t.status?.toLowerCase()] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="group rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-white p-5 shadow-md transition hover:shadow-2xl hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-indigo-900 line-clamp-2">
            {t.descriere || t.title || "Test fără titlu"}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5">
              📘 {t.materie}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2 py-0.5">
              🏷 {t.test_type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5">
              🏫 {t.school_class}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${badgeCls}`}
            >
              {t.status}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border p-3 bg-white/70">
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            🗓 Data
          </div>
          <div className="font-medium">{t.data || "—"}</div>
        </div>
        <div className="rounded-xl border p-3 bg-white/70">
          <div className="text-[11px] text-gray-500">• Ora</div>
          <div className="font-medium">{t.ora || "—"}</div>
        </div>
        <div className="rounded-xl border p-3 bg-white/70">
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            👤 Profesor
          </div>
          <div className="font-medium">{t.profesor || "—"}</div>
        </div>
      </div>

      {/* Full description */}
      {t.descriere && (
        <div className="mt-4 rounded-xl border p-3 bg-white/80 text-sm">
          <div className="text-[11px] text-gray-500">Descriere completă</div>
          <p className="mt-1 text-gray-700 line-clamp-3">{t.descriere}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border px-3 py-2 text-xs hover:bg-gray-50"
        >
          ✏️ Modifică
        </button>
        <button
          onClick={onSendStudents}
          className="flex-1 rounded-lg border px-3 py-2 text-xs hover:bg-indigo-50 text-indigo-700 border-indigo-200"
        >
          📤 Trimite elevului
        </button>
        <button
          onClick={onSendAdmin}
          className="flex-1 rounded-lg border px-3 py-2 text-xs hover:bg-purple-50 text-purple-700 border-purple-200"
        >
          📩 Trimite adminului
        </button>
        <button
          onClick={onSchedule}
          className="flex-1 rounded-lg border px-3 py-2 text-xs hover:bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          🗓 Programează
        </button>
        <button
          onClick={onDelete}
          className="flex-1 rounded-lg border px-3 py-2 text-xs hover:bg-red-50 text-red-700 border-red-200"
        >
          🗑 Șterge
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Pagina TesteProfesor
──────────────────────────────────────────────── */
export default function TesteProfesor() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [remoteTests, setRemoteTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [q, setQ] = useState("");
  const [materie, setMaterie] = useState("toate");
  const [clasa, setClasa] = useState("toate");
  const [status, setStatus] = useState("toate");
  const [tip, setTip] = useState("toate");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("data_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const searchRef = useRef(null);
  const debouncedQ = useDebounced(q, 250);

  const fetchSupabase = useCallback(async () => {
    if (!session?.user?.id) {
      setRemoteTests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("created_by", session.user.id)
      .neq("status", "deleted")
      .order("exam_date", { ascending: false })
      .order("exam_time", { ascending: false });
    if (error) {
      setRemoteTests([]);
    } else {
      setRemoteTests(data || []);
    }
    setLoading(false);
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    fetchSupabase();
  }, [fetchSupabase]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const tests = useMemo(() => {
    const arr = (remoteTests || []).map(mapRowToCard);
    arr.sort((a, b) => {
      const ak = a.created_at || `${a.exam_date ?? ""} ${a.ora ?? ""}`;
      const bk = b.created_at || `${b.exam_date ?? ""} ${b.ora ?? ""}`;
      return ak < bk ? 1 : ak > bk ? -1 : 0;
    });
    return arr;
  }, [remoteTests]);

  /* ─────────────────────────────
     Filtrare + sortare
  ───────────────────────────── */
  const filtered = useMemo(() => {
    let X = tests;

    if (debouncedQ.trim()) {
      const ql = debouncedQ.toLowerCase();
      X = X.filter((t) => {
        const h = [
          t.title,
          t.materie,
          t.test_type,
          t.school_class,
          t.data,
          t.ora,
          t.profesor,
          t.descriere,
          t.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return h.includes(ql);
      });
    }
    if (materie !== "toate") X = X.filter((t) => t.materie === materie);
    if (clasa !== "toate") X = X.filter((t) => t.school_class === clasa);
    if (status !== "toate")
      X = X.filter((t) => String(t.status || "").toLowerCase() === status);
    if (tip !== "toate") X = X.filter((t) => t.test_type === tip);

    if (dateFrom) {
      const t0 = new Date(dateFrom).getTime();
      X = X.filter(
        (t) => (t.exam_date ? new Date(t.exam_date).getTime() : 0) >= t0
      );
    }
    if (dateTo) {
      const t1 = new Date(dateTo).getTime();
      X = X.filter(
        (t) => (t.exam_date ? new Date(t.exam_date).getTime() : 0) <= t1
      );
    }

    X = [...X];
    if (sortKey === "data_desc") {
      X.sort((a, b) => new Date(b.exam_date || 0) - new Date(a.exam_date || 0));
    } else if (sortKey === "titlu_asc") {
      X.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return X;
  }, [
    tests,
    debouncedQ,
    materie,
    clasa,
    status,
    tip,
    dateFrom,
    dateTo,
    sortKey,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = clamp(page, 1, totalPages);
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
  }, [totalPages]);

  const pageRows = useMemo(
    () => filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage),
    [filtered, pageSafe, perPage]
  );

  /* ─────────────────────────────
     Acțiuni
  ───────────────────────────── */
  const handleModifica = (t) =>
    navigate(`/profesor/creare-test?id=${encodeURIComponent(t.id)}`);
  const handleTrimiteElevului = (t) =>
    navigate(`/profesor/elevi?testId=${encodeURIComponent(t.id)}`);
  const handleTrimiteAdminului = async (t) => {
    const { error } = await supabase
      .from("tests")
      .update({ status: "in_asteptare", sent_to_admin: true })
      .eq("id", t.id);

    if (error) {
      setToast({ type: "error", message: "Nu am putut trimite la admin." });
    } else {
      setToast({
        type: "success",
        message: "Trimis adminului pentru aprobare.",
      });
      fetchSupabase();
    }
  };
  const handleSterge = async (t) => {
    const { error } = await supabase
      .from("tests")
      .update({ status: "deleted" })
      .eq("id", t.id);
    if (error)
      setToast({ type: "error", message: "Nu am putut șterge testul." });
    else {
      setToast({ type: "success", message: "Test șters." });
      fetchSupabase();
    }
  };

  /* 🔴 Corectat: Programează în Supabase, fără localStorage */
  const handleProgrameaza = async (t) => {
    try {
      const { error } = await supabase.from("calendar_events").insert({
        test_id: t.id,
        title: t.descriere || t.title || "Test programat",
        subject: t.materie,
        description: t.descriere,
        class_id: t.class_id || null,
        class_label: t.school_class || null,
        competence: t.competence || null,
        teacher_name: t.profesor || null,
        scheduled_at: `${t.exam_date || t.data}T${t.ora || "00:00"}:00+00`,
        event_date: t.exam_date || t.data,
        event_time: t.ora,
        created_by: session.user.id,
        anulat: false,
      });

      if (error) throw error;

      setToast({
        type: "success",
        message: "✅ Test programat în calendar.",
      });

      navigate("/profesor/calendar");
    } catch (e) {
      console.error("Supabase calendar save error:", e);
      setToast({
        type: "error",
        message: "Nu am putut programa testul.",
      });
    }
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-6xl p-6">
          <div className="flex justify-center">
            <Link
              to="/profesor/dashboard"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
            >
              ⟵ Înapoi la Dashboard
            </Link>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">
            Testele mele
          </h1>
          <p className="mt-1 text-center text-sm text-gray-600">Se încarcă…</p>
        </div>
      </div>
    );
  }

  const total = filtered.length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        {/* Back */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">
            Testele mele
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Caută, filtrează, sortează și exportă testele create de tine.
          </p>
          <div className="mt-3">
            <Link
              to="/profesor/creare-test"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700"
            >
              + Creează test
            </Link>
          </div>
        </div>

        {/* Grid rezultate */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/70 p-10 text-center">
            <div className="text-6xl mb-2">🔎</div>
            <p className="text-gray-700 font-medium">
              Niciun test după filtrele curente.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Încearcă să resetezi filtrele sau să ajustezi căutarea.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageRows.map((t) => (
              <PremiumCard
                key={t.id}
                t={t}
                onEdit={() => handleModifica(t)}
                onSendStudents={() => handleTrimiteElevului(t)}
                onSendAdmin={() => handleTrimiteAdminului(t)}
                onSchedule={() => handleProgrameaza(t)}
                onDelete={() => handleSterge(t)}
              />
            ))}
          </div>
        )}

        {/* Paginare */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3 text-sm">
          <div className="text-gray-600 text-center md:text-left">
            Rezultate: <b>{filtered.length}</b> • Pagina <b>{pageSafe}</b> din{" "}
            <b>{Math.max(1, Math.ceil(filtered.length / perPage))}</b>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
              disabled={pageSafe <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-50 bg-white/80 backdrop-blur hover:bg-white"
            >
              ← Înapoi
            </button>
            <button
              onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
              disabled={
                pageSafe >= Math.max(1, Math.ceil(filtered.length / perPage))
              }
              className="rounded-lg border px-3 py-1.5 disabled:opacity-50 bg-white/80 backdrop-blur hover:bg-white"
            >
              Înainte →
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={
              "fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow " +
              (toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-blue-100 text-blue-800 border border-blue-200")
            }
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

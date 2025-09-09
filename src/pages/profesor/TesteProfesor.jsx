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

/* ──────────────────────────────────────────────────────────────
   Helpers (nicio schimbare de funcționalitate)
───────────────────────────────────────────────────────────────*/
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
function statusBadge(raw) {
  const v = String(raw || "").toLowerCase();
  if (
    [
      "assigned",
      "scheduled",
      "in_asteptare",
      "în așteptare",
      "pending",
    ].includes(v)
  )
    return {
      text: "În așteptare",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    };
  if (["completed", "rezolvat", "submitted", "finalizat", "trimis"].includes(v))
    return {
      text: "Rezolvat",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  if (["draft", "neexpediat"].includes(v))
    return {
      text: "Neexpediat",
      cls: "bg-gray-100 text-gray-700 border-gray-200",
    };
  return { text: raw || "—", cls: "bg-gray-100 text-gray-700 border-gray-200" };
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
    source:
      row.source ||
      (String(row.id || "").startsWith("TEST-") ? "local" : "supabase"),
  };
}
function readLocal() {
  try {
    return JSON.parse(localStorage.getItem("teste_profesor") || "[]");
  } catch {
    return [];
  }
}
function writeLocal(arr) {
  localStorage.setItem("teste_profesor", JSON.stringify(arr || []));
}

/* ──────────────────────────────────────────────────────────────
   Card premium – doar UI (fără modificări de flux)
───────────────────────────────────────────────────────────────*/
function PremiumCard({
  t,
  onEdit,
  onSendStudents,
  onSendAdmin,
  onSchedule,
  onDelete,
}) {
  const badge = statusBadge(t.status);
  return (
    <div className="group rounded-2xl border border-indigo-100 bg-white/90 backdrop-blur p-4 shadow-md transition hover:shadow-2xl hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-indigo-900 truncate">
            {t.title}
          </h2>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
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
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${badge.cls}`}
            >
              {badge.text}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            title="Modifică testul"
          >
            Modifică
          </button>
          <button
            onClick={onSendStudents}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            title="Trimite elevilor"
          >
            Trimite elevului
          </button>
          <button
            onClick={onSendAdmin}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            title="Trimite spre aprobare"
          >
            Trimite adminului
          </button>
          <button
            onClick={onSchedule}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            title="Programează în calendar"
          >
            Programează
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-200 text-red-600 px-3 py-1 text-xs hover:bg-red-50"
            title="Șterge testul"
          >
            Șterge
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl border p-2">
          <div className="text-[10px] text-gray-500">🗓 Data</div>
          <div className="font-medium truncate">{t.data}</div>
        </div>
        <div className="rounded-xl border p-2">
          <div className="text-[10px] text-gray-500">• Ora</div>
          <div className="font-medium truncate">{t.ora}</div>
        </div>
        <div className="rounded-xl border p-2">
          <div className="text-[10px] text-gray-500">👤 Profesor</div>
          <div className="font-medium truncate">{t.profesor}</div>
        </div>
      </div>

      {!!t.descriere && (
        <div className="mt-3 rounded-xl border p-2 text-xs">
          <div className="text-[10px] text-gray-500">Descriere</div>
          <div className="font-medium line-clamp-2">{t.descriere}</div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Pagina – premium & interactivă (păstrăm butonul + gradient)
   * câmpuri/funcționalități existente rămân neschimbate *
───────────────────────────────────────────────────────────────*/
export default function TesteProfesor() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  // date
  const [remoteTests, setRemoteTests] = useState([]);
  const localTests = useMemo(() => readLocal(), []);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // UI state (filtre) – păstrăm tot, doar UI premium
  const [q, setQ] = useState(localStorage.getItem("tp_q") || "");
  const [materie, setMaterie] = useState(
    localStorage.getItem("tp_materie") || "toate"
  );
  const [clasa, setClasa] = useState(
    localStorage.getItem("tp_clasa") || "toate"
  );
  const [status, setStatus] = useState(
    localStorage.getItem("tp_status") || "toate"
  );
  const [tip, setTip] = useState(localStorage.getItem("tp_tip") || "toate");
  const [dateFrom, setDateFrom] = useState(
    localStorage.getItem("tp_from") || ""
  );
  const [dateTo, setDateTo] = useState(localStorage.getItem("tp_to") || "");
  const [sortKey, setSortKey] = useState(
    localStorage.getItem("tp_sort") || "data_desc"
  );
  const [page, setPage] = useState(
    Number(localStorage.getItem("tp_page") || 1)
  );
  const [perPage, setPerPage] = useState(
    Number(localStorage.getItem("tp_perPage") || 12)
  );

  const searchRef = useRef(null);
  const debouncedQ = useDebounced(q, 250);

  // persistăm preferințele (nu schimbă funcționalitatea existentă)
  useEffect(() => {
    localStorage.setItem("tp_q", q);
    localStorage.setItem("tp_materie", materie);
    localStorage.setItem("tp_clasa", clasa);
    localStorage.setItem("tp_status", status);
    localStorage.setItem("tp_tip", tip);
    localStorage.setItem("tp_from", dateFrom);
    localStorage.setItem("tp_to", dateTo);
    localStorage.setItem("tp_sort", sortKey);
    localStorage.setItem("tp_page", String(page));
    localStorage.setItem("tp_perPage", String(perPage));
  }, [
    q,
    materie,
    clasa,
    status,
    tip,
    dateFrom,
    dateTo,
    sortKey,
    page,
    perPage,
  ]);

  // scurtături utile (nu alterează logica)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQ("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  // unificare local + remote
  const tests = useMemo(() => {
    const map = new Map();
    for (const t of localTests) map.set(t.id, { ...t, source: "local" });
    for (const r of remoteTests) map.set(r.id, { ...r, source: "supabase" });
    const arr = Array.from(map.values()).map(mapRowToCard);
    arr.sort((a, b) => {
      const ak = a.created_at || `${a.exam_date ?? ""} ${a.ora ?? ""}`;
      const bk = b.created_at || `${b.exam_date ?? ""} ${b.ora ?? ""}`;
      return ak < bk ? 1 : ak > bk ? -1 : 0;
    });
    return arr;
  }, [localTests, remoteTests]);

  // facets
  const allMaterii = useMemo(
    () => [
      "toate",
      ...Array.from(
        new Set(tests.map((t) => t.materie).filter(Boolean))
      ).sort(),
    ],
    [tests]
  );
  const allClase = useMemo(
    () => [
      "toate",
      ...Array.from(
        new Set(tests.map((t) => t.school_class).filter(Boolean))
      ).sort(),
    ],
    [tests]
  );
  const allStatus = useMemo(
    () => [
      "toate",
      ...Array.from(
        new Set(
          tests.map((t) => String(t.status || "").toLowerCase()).filter(Boolean)
        )
      ).sort(),
    ],
    [tests]
  );
  const allTip = useMemo(
    () => [
      "toate",
      ...Array.from(
        new Set(tests.map((t) => t.test_type).filter(Boolean))
      ).sort(),
    ],
    [tests]
  );

  // filtrare + sort
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

  // paginare
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = clamp(page, 1, totalPages);
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe); // păstrăm corectitudinea paginilor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageRows = useMemo(
    () => filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage),
    [filtered, pageSafe, perPage]
  );

  /* ──────────────────────────────────────────────────────────
     Acțiuni (nemodificate)
  ───────────────────────────────────────────────────────────*/
  const handleModifica = (t) =>
    navigate(`/profesor/creare-test?id=${encodeURIComponent(t.id)}`);
  const handleTrimiteElevului = (t) =>
    navigate(`/profesor/elevi?testId=${encodeURIComponent(t.id)}`);
  const handleTrimiteAdminului = async (t) => {
    if (t.source !== "supabase") {
      setToast({
        type: "info",
        message: "Test local: salvează în Supabase înainte.",
      });
      return;
    }
    const { error } = await supabase
      .from("tests")
      .update({ status: "in_asteptare" })
      .eq("id", t.id);
    if (error)
      setToast({ type: "error", message: "Nu am putut seta statusul." });
    else {
      setToast({
        type: "success",
        message: "Trimis adminului (în așteptare).",
      });
      fetchSupabase();
    }
  };
  const handleSterge = async (t) => {
    if (t.source === "supabase") {
      const { error } = await supabase.from("tests").delete().eq("id", t.id);
      if (error)
        setToast({ type: "error", message: "Nu am putut șterge testul." });
      else {
        setToast({ type: "success", message: "Test șters." });
        fetchSupabase();
      }
    } else {
      writeLocal(readLocal().filter((x) => x.id !== t.id));
      setToast({ type: "success", message: "Test șters (local)." });
      window.location.reload();
    }
  };
  const handleProgrameaza = (t) => {
    const entry = {
      id: t.id,
      subject: t.materie,
      school_class: t.school_class,
      description: t.descriere,
      date: t.data,
      time: t.ora,
    };
    const current = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    localStorage.setItem(
      "tests_from_prof",
      JSON.stringify([...current, entry])
    );
    navigate("/profesor/calendar");
  };

  // export CSV (filtrat) – neschimbat ca funcție, doar în UI premium
  const onExportCSV = () => {
    const head = [
      "#",
      "Titlu",
      "Materie",
      "Tip",
      "Clasă",
      "Data",
      "Ora",
      "Profesor",
      "Status",
      "Sursă",
      "Descriere",
    ];
    const lines = [head.join(",")];
    filtered.forEach((t, i) => {
      lines.push(
        [
          i + 1,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          t.materie || "",
          t.test_type || "",
          t.school_class || "",
          t.data || "",
          t.ora || "",
          `"${(t.profesor || "").replace(/"/g, '""')}"`,
          t.status || "",
          t.source || "",
          `"${(t.descriere || "").replace(/"/g, '""')}"`,
        ].join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teste_profesor.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ──────────────────────────────────────────────────────────
     UI (premium) – păstrăm butonul și gradientul
  ───────────────────────────────────────────────────────────*/
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
      {/* accente decorative subtile */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        {/* Back – păstrat */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* Header + CTA */}
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

        {/* Toolbar premium (sticky) */}
        <div className="sticky top-3 z-10">
          <div className="rounded-3xl border border-blue-200 bg-white/90 shadow-xl p-4 md:p-5 backdrop-blur">
            {/* Row 1: Search + quick stats */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="md:flex-1">
                <label className="text-xs font-medium text-gray-600">
                  Căutare <span className="opacity-60">(apasă „/”)</span>
                </label>
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Titlu, materie, tip, clasă, profesor, descriere…"
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 md:w-auto">
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Rezultate</div>
                  <div className="font-semibold">{total}</div>
                </div>
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Pe pagină</div>
                  <div className="font-semibold">{perPage}</div>
                </div>
                <div className="rounded-xl border px-3 py-2 text-center">
                  <div className="text-[10px] text-gray-500">Pagina</div>
                  <div className="font-semibold">
                    {Math.min(page, Math.max(1, Math.ceil(total / perPage)))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Facets */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Materie
                </label>
                <select
                  value={materie}
                  onChange={(e) => setMaterie(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {allMaterii.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Clasă
                </label>
                <select
                  value={clasa}
                  onChange={(e) => setClasa(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {allClase.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {allStatus.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Tip test
                </label>
                <select
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {allTip.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  De la
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Până la
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Row 3: Sort + perPage + actions */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Sortare
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="data_desc">După dată (recente)</option>
                  <option value="titlu_asc">După titlu (A→Z)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Pe pagină
                </label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {[12, 24, 48].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <button
                  onClick={() => {
                    setQ("");
                    setMaterie("toate");
                    setClasa("toate");
                    setStatus("toate");
                    setTip("toate");
                    setDateFrom("");
                    setDateTo("");
                    setSortKey("data_desc");
                    setPage(1);
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-blue-50"
                >
                  Reset filtre
                </button>
                <button
                  onClick={onExportCSV}
                  className="w-full rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700 shadow"
                >
                  Export CSV
                </button>
              </div>
            </div>
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

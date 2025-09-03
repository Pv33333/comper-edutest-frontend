import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Link, useNavigate } from "react-router-dom";
import TestCard from "@/components/TestCard";

function labelMaterie(subject) {
  if (!subject) return "—";
  const s = String(subject).toLowerCase();
  if (s.includes("rom")) return "Limba română";
  if (s.includes("mat")) return "Matematică";
  return subject;
}

// Transformă un rând (Supabase sau local) într-un obiect pentru TestCard
function mapRowToCard(row) {
  const materie = labelMaterie(row.subject || row.materie);
  return {
    id: row.id,
    materie,
    data: row.exam_date || row.data || "—",
    ora: row.exam_time || row.ora || "—",
    descriere: row.description || row.descriere || "—",
    profesor: row.teacher_name || row.profesor || "—",
    status: row.status || "neexpediat",
    school_class: row.school_class || row.clasa || "",
    source: row.source || (String(row.id || "").startsWith("TEST-") ? "local" : "supabase"),
  };
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem("teste_profesor") || "[]"); }
  catch { return []; }
}

function writeLocal(arr) {
  localStorage.setItem("teste_profesor", JSON.stringify(arr || []));
}

export default function TesteProfesor() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [remoteTests, setRemoteTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const fetchSupabase = useCallback(async () => {
    if (!session?.user?.id) {
      setRemoteTests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("created_by", session.user.id)
      .order("exam_date", { ascending: false })
      .order("exam_time", { ascending: false });

    if (error) {
      setError("Nu am putut încărca testele din Supabase.");
      setRemoteTests([]);
    } else {
      setRemoteTests(data || []);
    }
    setLoading(false);
  }, [session?.user?.id, supabase]);

  useEffect(() => { fetchSupabase(); }, [fetchSupabase]);

  const localTests = useMemo(() => readLocal(), []);

  const tests = useMemo(() => {
    const map = new Map();
    for (const t of localTests) map.set(t.id, { ...t, source: "local" });
    for (const r of remoteTests) map.set(r.id, { ...r, source: "supabase" });
    const arr = Array.from(map.values()).map(mapRowToCard);
    arr.sort((a, b) => {
      const aKey = `${a.data ?? ""} ${a.ora ?? ""}`;
      const bKey = `${b.data ?? ""} ${b.ora ?? ""}`;
      return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
    });
    return arr;
  }, [localTests, remoteTests]);

  // Actions
  const handleModifica = (t) => navigate(`/profesor/creare-test?id=${encodeURIComponent(t.id)}`);

  const handleTrimiteElevului = (t) => {
    navigate(`/profesor/elevi?testId=${encodeURIComponent(t.id)}`);
  };

  const handleTrimiteAdminului = async (t) => {
    if (t.source === "supabase") {
      try {
        const { error } = await supabase.from("tests").update({ status: "in_asteptare" }).eq("id", t.id);
        if (error) throw error;
        setToast({ type: "success", message: "Trimis adminului (în așteptare)." });
        fetchSupabase();
      } catch {
        setToast({ type: "error", message: "Nu am putut seta statusul în Supabase." });
      }
    } else {
      setToast({ type: "info", message: "Test local: salvează întâi în Supabase, apoi trimite adminului." });
    }
  };

  const handleSterge = async (t) => {
    if (t.source === "supabase") {
      const { error } = await supabase.from("tests").delete().eq("id", t.id);
      if (error) setToast({ type: "error", message: "Nu am putut șterge testul din Supabase." });
      else {
        setToast({ type: "success", message: "Test șters." });
        fetchSupabase();
      }
    } else {
      const arr = readLocal().filter(x => x.id !== t.id);
      writeLocal(arr);
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
    localStorage.setItem("tests_from_prof", JSON.stringify([...current, entry]));
    navigate("/profesor/calendar");
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-6xl p-6">
          <div className="flex justify-center">
            <Link to="/profesor/dashboard" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow">
              ⟵ Înapoi la Dashboard
            </Link>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">Testele mele</h1>
          <p className="mt-1 text-center text-sm text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Buton centru sus */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm hover:bg-white bg-white/70 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        {/* Header premium */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">Testele mele</h1>
          <p className="mt-1 text-sm text-gray-600">Vizualizează, modifică și distribuie testele create.</p>
          <div className="mt-3">
            <Link
              to="/profesor/creare-test"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700"
            >
              + Creează test
            </Link>
          </div>
        </div>

        {/* Eroare */}
        {error && (
          <div className="mx-auto max-w-4xl bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Listă carduri */}
        {tests.length === 0 ? (
          <p className="text-center text-gray-600">Nu ai încă teste. Creează primul test.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((t) => (
              <TestCard
                key={t.id}
                test={t}
                onModifica={() => handleModifica(t)}
                onTrimiteElevului={() => handleTrimiteElevului(t)}
                onTrimiteAdminului={() => handleTrimiteAdminului(t)}
                onSterge={() => handleSterge(t)}
                onProgrameaza={() => handleProgrameaza(t)}
              />
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={
              "mt-2 rounded-2xl p-3 text-sm text-center mx-auto max-w-lg " +
              (toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300")
            }
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
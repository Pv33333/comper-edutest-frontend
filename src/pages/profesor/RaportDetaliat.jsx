import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultsAPI from "@/services/resultsService.js";
import { supabase } from "@/lib/supabaseClient";

export default function RaportDetaliat() {
  const navigate = useNavigate();
  const { getResultDetailed } = ResultsAPI;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profil, setProfil] = useState(null);
  const [test, setTest] = useState(null);
  const [rezultat, setRezultat] = useState(null);
  const [items, setItems] = useState([]);
  const [answerKey, setAnswerKey] = useState({});

  const testID = useMemo(
    () => sessionStorage.getItem("raport_selectat_testID") || "",
    []
  );
  const elevID = useMemo(
    () => sessionStorage.getItem("raport_selectat_elevID") || "",
    []
  );
  const resultID = useMemo(
    () => sessionStorage.getItem("raport_selectat_resultID") || "",
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!testID) {
        setErr("Nu ai selectat niciun test.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // meta (titlu, materie, clasă + items & cheie din view)
        const { data: meta, error: eMeta } = await supabase
          .from("test_meta_unified")
          .select("*")
          .eq("test_id", testID)
          .maybeSingle();
        if (eMeta) throw eMeta;

        setTest({
          id: meta?.test_id,
          title: meta?.title,
          subject: meta?.subject,
          grade_level: meta?.grade_level,
        });
        setItems(meta?.items || []);
        setAnswerKey(meta?.answer_key || {});

        // dacă avem elev selectat, încărcăm rezultatul lui
        if (elevID) {
          const res = await getResultDetailed({
            test_id: testID,
            student_id: elevID,
            result_id: resultID || undefined,
          });
          setRezultat(res);
          setProfil({
            id: res?.student_id,
            full_name: res?.full_name,
            email: res?.email,
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testID, elevID, resultID]);

  const normalized = useMemo(() => {
    const a = rezultat?.answers;
    if (!a) return [];
    return Object.keys(a).map((k) => {
      const idx = Number(k);
      const elev = a[k];
      const item = items.find((it) => Number(it.index) === idx);
      return { idx, text: item?.text || null, elev, corect: answerKey?.[idx] };
    });
  }, [rezultat, items, answerKey]);

  const scor = useMemo(() => {
    if (!normalized.length) return { n: 0, total: 0, procent: 0 };
    const total = normalized.length;
    const n = normalized.filter(
      (r) => r.corect && String(r.elev) === String(r.corect)
    ).length;
    return { n, total, procent: Math.round((n / total) * 100) };
  }, [normalized]);

  const durata = useMemo(() => {
    const sec = Number(rezultat?.duration_sec ?? 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  }, [rezultat]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* buton sus, ca pe celelalte pagini */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/profesor/dashboard")}
          className="text-blue-600 hover:underline"
        >
          ⬅ Înapoi la Dashboard
        </button>
        <h1 className="text-3xl font-bold">Raport Detaliat</h1>
        <div />
      </div>

      {loading && <p>Se încarcă...</p>}
      {err && <p className="text-red-600">{err}</p>}

      {test && (
        <section className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold">🧪 Test</h2>
          <p>
            <strong>{test.title}</strong>
          </p>
          <p>Materie: {test.subject || "—"}</p>
          <p>Clasă: {test.grade_level || "—"}</p>
        </section>
      )}

      {profil && (
        <section className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold">👤 Elev</h2>
          <p>{profil.full_name || profil.id}</p>
          <p>{profil.email}</p>
        </section>
      )}

      <section className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold">📈 Scor</h2>
        <p>
          {scor.n}/{scor.total} ({scor.procent}%)
        </p>
        <p>Durată: {durata}</p>
      </section>

      <section className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold">📝 Răspunsuri</h2>
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Enunț</th>
              <th className="p-2 text-left">Răspuns elev</th>
              <th className="p-2 text-left">Răspuns corect</th>
              <th className="p-2 text-left">Corect?</th>
            </tr>
          </thead>
          <tbody>
            {normalized.map((r) => (
              <tr key={r.idx} className="border-t">
                <td className="p-2">{r.idx + 1}</td>
                <td className="p-2">{r.text || "—"}</td>
                <td className="p-2">{r.elev || "—"}</td>
                <td className="p-2">{r.corect || "—"}</td>
                <td className="p-2">{r.elev === r.corect ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

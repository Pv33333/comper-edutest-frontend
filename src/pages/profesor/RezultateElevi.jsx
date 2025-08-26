import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function RezultateElevi() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) throw authErr;
        const user = authData?.user;
        if (!user) throw new Error("Neautentificat");

        // 1️⃣ aflăm testele create de profesor
        const { data: tests, error: tErr } = await supabase
          .from("tests")
          .select("id")
          .eq("created_by", user.id);
        if (tErr) throw tErr;

        const testIds = (tests || []).map((t) => t.id);
        if (testIds.length === 0) {
          setRows([]);
          return;
        }

        // 2️⃣ rezultatele testelor → cu join profiles
        const { data: results, error: rErr } = await supabase
          .from("results")
          .select(
            `
            id,
            test_id,
            student_id,
            score,
            duration_sec,
            submitted_at,
            profiles:student_id ( full_name, email )
          `
          )
          .in("test_id", testIds)
          .order("submitted_at", { ascending: false });
        if (rErr) throw rErr;

        setRows(results || []);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onVeziDetalii = (row) => {
    sessionStorage.setItem("raport_selectat_testID", row.test_id);
    sessionStorage.setItem("raport_selectat_elevID", row.student_id);
    sessionStorage.setItem("raport_selectat_resultID", row.id);
    navigate("/profesor/raport-detaliat");
  };

  const fmtDurata = (sec) => {
    const s = Number(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${String(r).padStart(2, "0")}s`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/profesor/dashboard")}
          className="text-blue-600 hover:underline"
        >
          ⬅ Înapoi la Dashboard
        </button>
        <h1 className="text-2xl font-bold">📊 Rezultate elevi</h1>
        <div />
      </div>

      {loading && <p>Se încarcă...</p>}

      {!loading && rows.length === 0 && (
        <p className="text-gray-500">Nu există rezultate încă.</p>
      )}

      {!loading && rows.length > 0 && (
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Elev</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Test</th>
              <th className="p-2 border">Scor</th>
              <th className="p-2 border">Durată</th>
              <th className="p-2 border">Dată</th>
              <th className="p-2 border">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border">
                  {r.profiles?.full_name || r.student_id}
                </td>
                <td className="p-2 border">{r.profiles?.email || "—"}</td>
                <td className="p-2 border">
                  <code className="text-xs">{r.test_id}</code>
                </td>
                <td className="p-2 border">{r.score}</td>
                <td className="p-2 border">{fmtDurata(r.duration_sec)}</td>
                <td className="p-2 border">
                  {r.submitted_at
                    ? new Date(r.submitted_at).toLocaleString()
                    : "—"}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => onVeziDetalii(r)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Vezi detalii test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

function parseGradeNumber(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toUpperCase();

  // 1) dacă are cifre, ia primul număr
  const m = s.match(/\d+/);
  if (m) {
    const n = parseInt(m[0], 10);
    if (!Number.isNaN(n)) return n;
  }

  // 2) roman numerals I–XII
  const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
  };
  const token = s.replace(/CLASA|CL\s*|A\s*/g, "").trim(); // „Clasa IV” -> „IV”
  if (romanMap[token]) return romanMap[token];

  return null; // lasă codul să pună fallback
}

export default function CreareTest() {
  const navigate = useNavigate();
  const [test, setTest] = useState({
    disciplina: "",
    clasa: "",
    tip: "",
    competenta: "",
    descriere: "",
    profesor: "",
    data: "",
    ora: "",
    intrebari: [],
    status: "draft",
  });
  const [loading, setLoading] = useState(false);

  const addIntrebare = (afterIndex = null) => {
    setTest((prev) => {
      const newQ = { text: "", a: "", b: "", c: "", d: "", corecta: "" };
      const intrebari = [...prev.intrebari];
      if (afterIndex === null) intrebari.push(newQ);
      else intrebari.splice(afterIndex + 1, 0, newQ);
      return { ...prev, intrebari };
    });
  };

  const updateIntrebare = (index, field, value) => {
    setTest((prev) => {
      const intrebari = [...prev.intrebari];
      intrebari[index][field] = value;
      return { ...prev, intrebari };
    });
  };

  const normalizeForDB = (t) => {
    const title =
      (t.descriere || "").trim() ||
      `${t.disciplina || "Test"} - ${t.clasa || ""}`.trim();

    // derive numeric grade (NOT NULL în DB)
    const gradeNum = parseGradeNumber(t.clasa);
    // fallback politicos dacă nu reușim să-l deducem
    const grade = gradeNum ?? 1;

    const questions = Array.isArray(t.intrebari)
      ? t.intrebari.map((q, idx) => ({
          index: idx,
          text: q.text || "",
          a: q.a || "",
          b: q.b || "",
          c: q.c || "",
          d: q.d || "",
          corect: q.corecta || "",
        }))
      : [];

    return {
      title,
      subject: t.disciplina || null,
      grade_level: t.clasa || null, // păstrăm exact cum o scrii
      grade, // numeric (1–12); necesar pt NOT NULL
      phase: t.tip || null,
      category: "profesor",
      published: false,
      questions, // jsonb pentru Raport Detaliat

      // păstrăm structura ta în content
      content: {
        disciplina: t.disciplina,
        clasa: t.clasa,
        tip: t.tip,
        competenta: t.competenta,
        descriere: t.descriere,
        profesor: t.profesor,
        data: t.data,
        ora: t.ora,
        intrebari: t.intrebari,
        status: t.status,
      },
      created_by: null, // setăm efectiv la insert cu user.id
    };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = normalizeForDB(test);
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const userId = authData?.user?.id || null;

      const { error } = await supabase.from("tests").insert([
        {
          title: payload.title,
          subject: payload.subject,
          grade_level: payload.grade_level,
          grade: payload.grade, // ✅ previne NOT NULL violation
          phase: payload.phase,
          category: payload.category,
          created_by: userId,
          published: payload.published,
          questions: payload.questions, // ✅ pentru Raport Detaliat
          content: payload.content, // păstrăm tot ce aveai
        },
      ]);

      if (error) throw error;

      alert("✅ Testul a fost salvat cu succes!");
      navigate("/profesor/teste");
    } catch (e) {
      console.error(e);
      alert("❌ Eroare la salvare: " + (e?.message || "necunoscută"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* 🔙 Buton sus, ca pe celelalte pagini */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/profesor/dashboard")}
          className="text-blue-600 hover:underline"
        >
          ⬅ Înapoi la Dashboard
        </button>
        <h1 className="text-2xl font-bold">Creare Test</h1>
        <div />
        {/* spacer */}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Disciplina"
          value={test.disciplina}
          onChange={(e) => setTest({ ...test, disciplina: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Clasa (ex. Clasa IV / 4 / IV)"
          value={test.clasa}
          onChange={(e) => setTest({ ...test, clasa: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Tip test"
          value={test.tip}
          onChange={(e) => setTest({ ...test, tip: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Competență"
          value={test.competenta}
          onChange={(e) => setTest({ ...test, competenta: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Descriere"
          value={test.descriere}
          onChange={(e) => setTest({ ...test, descriere: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Profesor"
          value={test.profesor}
          onChange={(e) => setTest({ ...test, profesor: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="date"
          value={test.data}
          onChange={(e) => setTest({ ...test, data: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <input
          type="time"
          value={test.ora}
          onChange={(e) => setTest({ ...test, ora: e.target.value })}
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Întrebări</h2>
        {test.intrebari.map((q, idx) => (
          <div key={idx} className="border rounded p-3 space-y-3 mb-3">
            <input
              type="text"
              placeholder="Enunț întrebare"
              value={q.text}
              onChange={(e) => updateIntrebare(idx, "text", e.target.value)}
              className="border rounded p-2 w-full"
            />

            {["a", "b", "c", "d"].map((lit) => (
              <div key={lit} className="flex items-center space-x-3">
                <span className="w-6 font-bold">{lit.toUpperCase()}.</span>
                <input
                  type="text"
                  placeholder={`Varianta ${lit.toUpperCase()}`}
                  value={q[lit]}
                  onChange={(e) => updateIntrebare(idx, lit, e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
            ))}

            {/* Dropdown a/b/c/d pentru răspunsul corect */}
            <select
              value={q.corecta}
              onChange={(e) => updateIntrebare(idx, "corecta", e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Selectează răspunsul corect</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => addIntrebare(idx)}
                className="text-blue-600 text-sm"
              >
                ➕ Adaugă întrebare după aceasta
              </button>
            </div>
          </div>
        ))}

        {test.intrebari.length === 0 && (
          <button
            type="button"
            onClick={() => addIntrebare(null)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            ➕ Adaugă prima întrebare
          </button>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Se salvează..." : "💾 Salvează Test"}
        </button>
      </div>
    </div>
  );
}

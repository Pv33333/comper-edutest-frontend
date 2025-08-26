// src/pages/elev/ProfilElev.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/SupabaseAuthProvider.jsx";
import { getProfile, updateProfile } from "@/services/profileService.js";

export default function ProfilElev() {
  const { user, role, loading, profileLoading, refreshProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [salvatMsg, setSalvatMsg] = useState("");
  const [asociereStatus, setAsociereStatus] = useState("");

  const [form, setForm] = useState({
    prenume: "",
    nume: "",
    birthdate: "",
    email: "",
    judet: "",
    oras: "",
    scoala: "",
    clasa: "",
    litera: "",
    username: "",
    telefon: "",
    codParinte: "",
  });

  useEffect(() => {
    if (loading || profileLoading || !user || (role && role !== "elev")) return;
    (async () => {
      try {
        const p = await getProfile();
        setForm((f) => ({
          ...f,
          prenume: p?.prenume || "",
          nume: p?.nume || "",
          birthdate: p?.birthdate || "",
          email: user?.email || "",
          judet: p?.judet || "",
          oras: p?.oras || "",
          scoala: p?.scoala || "",
          clasa: p?.clasa || "",
          litera: p?.litera || "",
          username: p?.username || "",
          telefon: p?.telefon || "",
        }));
      } catch {}
    })();
  }, [loading, profileLoading, user?.id, role]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.id]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      await updateProfile({
        prenume: form.prenume || null,
        nume: form.nume || null,
        birthdate: form.birthdate || null,
        judet: form.judet || null,
        oras: form.oras || null,
        scoala: form.scoala || null,
        clasa: form.clasa || null,
        litera: form.litera || null,
        username: form.username || null,
        telefon: form.telefon || null,
      });
      await refreshProfile();
      setSalvatMsg("✔️ Profil salvat cu succes!");
      setTimeout(() => setSalvatMsg(""), 3000);
    } catch (err) {
      alert(err?.message || "⚠️ Eroare la salvarea profilului.");
    } finally {
      setSaving(false);
    }
  };

  const handleAsociere = () => {
    const cod = (form.codParinte || "").trim().toUpperCase();
    setAsociereStatus(
      cod
        ? "ℹ️ Fluxul de asociere se va implementa în DB."
        : "⚠️ Introdu un cod."
    );
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Se încarcă…
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1C3C7B] min-h-screen">
      <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
        <Link
          className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 font-medium"
          to="/elev/dashboard"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Înapoi la Dashboard
        </Link>
      </section>

      <main className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">👦 Profil Elev</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              id="prenume"
              value={form.prenume}
              onChange={onChange}
              placeholder="Prenume"
              className="p-2 border rounded-md border-gray-300 w-full"
            />
            <input
              id="nume"
              value={form.nume}
              onChange={onChange}
              placeholder="Nume"
              className="p-2 border rounded-md border-gray-300 w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              id="birthdate"
              type="date"
              value={form.birthdate || ""}
              onChange={onChange}
              className="p-2 border rounded-md border-gray-300 w-full"
            />
            <input
              id="email"
              value={form.email}
              readOnly
              className="p-2 border rounded-md border-gray-300 w-full bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              id="judet"
              value={form.judet}
              onChange={onChange}
              className="border px-4 py-2 rounded-lg w-full bg-white"
            >
              <option value="">Alege județul</option>
              <option>Alba</option>
              <option>Arad</option>
              <option>București</option>
              <option>Cluj</option>
              <option>Timiș</option>
            </select>
            <select
              id="oras"
              value={form.oras}
              onChange={onChange}
              className="border px-4 py-2 rounded-lg w-full bg-white"
            >
              <option value="">Alege orașul</option>
              <option>Alba Iulia</option>
              <option>Arad</option>
              <option>București</option>
              <option>Cluj-Napoca</option>
              <option>Timișoara</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              id="scoala"
              value={form.scoala}
              onChange={onChange}
              placeholder="Școală..."
              readOnly
              className="p-2 border rounded-md border-gray-300 w-full bg-gray-50"
            />
            <input
              id="clasa"
              value={form.clasa}
              onChange={onChange}
              placeholder="Clasă..."
              readOnly
              className="p-2 border rounded-md border-gray-300 w-full bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              id="username"
              value={form.username}
              onChange={onChange}
              placeholder="Username"
              className="p-2 border rounded-md border-gray-300 w-full"
            />
            <input
              id="telefon"
              value={form.telefon}
              onChange={onChange}
              placeholder="Telefon"
              className="p-2 border rounded-md border-gray-300 w-full"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2 disabled:opacity-60"
          >
            {saving ? "Se salvează…" : "💾 Salvează"}
          </button>

          <section className="mt-10 space-y-4 border-t pt-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              🔗 Asociere cu părinte
            </h2>
            <input
              id="codParinte"
              value={form.codParinte}
              onChange={onChange}
              placeholder="Introdu codul primit de la părinte"
              className="p-2 border rounded-md border-gray-300 w-full"
            />
            <button
              type="button"
              onClick={handleAsociere}
              className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
            >
              ✔️ Confirmă cod
            </button>
            <p className="text-base text-gray-700">{asociereStatus}</p>
          </section>
        </form>

        {salvatMsg && <p className="text-base text-gray-700">{salvatMsg}</p>}
      </main>
    </div>
  );
}

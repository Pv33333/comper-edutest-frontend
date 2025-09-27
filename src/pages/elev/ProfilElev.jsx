
// src/pages/elev/ProfilElev.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";

export default function ProfilElev() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    prenume: "",
    nume: "",
    birthdate: "",
    email: "",
    username: "",
    judet: "",
    oras: "",
    scoala: "",
    clasa: "",
    litera: "",
    codParinte: "",
    avatar_url: "",
  });

  const fileRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const progress = useMemo(() => {
    const keys = [
      "prenume",
      "nume",
      "birthdate",
      "email",
      "username",
      "judet",
      "oras",
      "scoala",
      "clasa",
      "litera",
    ];
    const filled = keys.filter((k) => (form[k] ?? "").toString().trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [form]);

  // READ from profiles
  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "prenume,nume,birthdate,email,username,judet,oras,scoala,clasa,litera,codparinte,avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setForm((f) => ({
          ...f,
          prenume: data.prenume ?? "",
          nume: data.nume ?? "",
          birthdate: data.birthdate ?? "",
          email: data.email ?? user.email ?? "",
          username: data.username ?? "",
          judet: data.judet ?? "",
          oras: data.oras ?? "",
          scoala: data.scoala ?? "",
          clasa: data.clasa ?? "",
          litera: data.litera ?? "",
          codParinte: data.codparinte ?? "",
          avatar_url: data.avatar_url ?? "",
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Nu am putut încărca datele profilului.");
    } finally {
      setLoading(false);
    }
  };

  // WRITE to profiles
  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setOk("");
    try {
      if (!user?.id) throw new Error("Nu ești autentificat.");

      const payload = {
        id: user.id,
        role: "elev",
        prenume: form.prenume || null,
        nume: form.nume || null,
        birthdate: form.birthdate || null,
        email: form.email || user.email || null,
        username: form.username || null,
        judet: form.judet || null,
        oras: form.oras || null,
        scoala: form.scoala || null,
        clasa: form.clasa || null,
        litera: form.litera || null,
        codparinte: (form.codParinte ?? "").trim() || null,
        avatar_url: form.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      setOk("Profil salvat cu succes.");
      setTimeout(loadProfile, 300);
    } catch (err) {
      console.error(err);
      setError(
        err?.message || "A apărut o eroare la salvare. Încearcă din nou."
      );
    } finally {
      setSaving(false);
      setTimeout(() => setOk(""), 2500);
    }
  };

  // avatar upload -> profiles.avatar_url
  const onPickAvatar = () => fileRef.current?.click();
  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = pub?.publicUrl;

      setForm((f) => ({ ...f, avatar_url: publicUrl || "" }));

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (error) throw error;
      setTimeout(loadProfile, 300);
    } catch (err) {
      console.error(err);
      setError("Nu am putut încărca avatarul.");
      setTimeout(() => setError(""), 2500);
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const initials = (() => {
    const fn = (form.prenume || "").trim();
    const ln = (form.nume || "").trim();
    return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "EL";
  })();

  return (
    <div className="min-h-screen w-full text-gray-800 bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/elev/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/80 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-24">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-900 mb-6">
          👦 Profil Elev
        </h1>

        {/* Header card */}
        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Avatar elev"
                  className="h-24 w-24 rounded-2xl object-cover border shadow"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-2xl border shadow">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={onPickAvatar}
                className="absolute -bottom-2 -right-2 rounded-xl border bg-white px-3 py-1 text-xs shadow hover:bg-gray-50"
              >
                Schimbă
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelected}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="text-xl font-semibold text-indigo-900">
                {(form.prenume || "—") + " " + (form.nume || "")}
              </div>
              <div className="text-sm text-gray-600">
                {form.email || user?.email || "—"}
              </div>

              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${saving ? 100 : progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {saving ? "Se salvează..." : `Completat ${progress}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "prenume", label: "Prenume", type: "text" },
              { id: "nume", label: "Nume", type: "text" },
              { id: "birthdate", label: "Data nașterii", type: "date" },
              { id: "email", label: "Email", type: "email" },
              { id: "username", label: "Username", type: "text" },
              { id: "judet", label: "Județ", type: "text" },
              { id: "oras", label: "Oraș", type: "text" },
              { id: "scoala", label: "Școala", type: "text", full: true },
              { id: "clasa", label: "Clasa", type: "text" },
              { id: "litera", label: "Litera", type: "text" },
              {
                id: "codParinte",
                label: "Cod asociere părinte",
                type: "text",
                full: true,
              },
            ].map((field) => (
              <div key={field.id} className={field.full ? "md:col-span-2" : ""}>
                <label
                  htmlFor={field.id}
                  className="text-xs text-gray-600 block mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  value={form[field.id] || ""}
                  onChange={onChange}
                  placeholder={field.label}
                  className="w-full border px-3 py-2.5 rounded-xl bg-white/80"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              className="rounded-xl border px-4 py-2 text-sm bg-white hover:bg-gray-50"
              onClick={loadProfile}
              disabled={loading}
            >
              Reîncarcă
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm text-white shadow ${
                saving
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Se salvează…" : "Salvează profilul"}
            </button>
          </div>

          {ok && <p className="text-sm text-green-600 mt-4">{ok}</p>}
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}

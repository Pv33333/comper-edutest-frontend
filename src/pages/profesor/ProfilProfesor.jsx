// src/pages/profesor/ProfilProfesor.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

// util localStorage
const ls = {
  get(k, d) {
    try {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
    } catch {
      return d;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

const empty = {
  first_name: "",
  last_name: "",
  birth_date: "",
  email: "",
  phone: "",
  county: "",
  city: "",
  school: "",
  username: "",
};

export default function ProfilProfesor() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const user = session?.user || null;

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // valori implicite din înregistrare (Auth)
  const defaultsFromAuth = useMemo(() => {
    if (!user) return {};
    const m = user.user_metadata || {};
    const first =
      m.given_name || (m.full_name ? m.full_name.split(" ")[0] : "") || "";
    const last =
      m.family_name ||
      (m.full_name ? m.full_name.split(" ").slice(1).join(" ") : "") ||
      "";
    return { first_name: first, last_name: last, email: user.email || "" };
  }, [user]);

  // încarcă profilul (Supabase → fallback local)
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from("teacher_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            birth_date: data.birth_date || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            county: data.county || "",
            city: data.city || "",
            school: data.school || "",
            username: data.username || "",
          });
          setLoading(false);
          return;
        }
      }
      const cached = ls.get("profil_profesor", {});
      setForm({ ...empty, ...defaultsFromAuth, ...cached });
    } catch {
      const cached = ls.get("profil_profesor", {});
      setForm({ ...empty, ...defaultsFromAuth, ...cached });
    } finally {
      setLoading(false);
    }
  }, [supabase, user, defaultsFromAuth]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const saveProfile = async () => {
    if (!user) {
      ls.set("profil_profesor", form);
      setToast({
        type: "info",
        message: "Profil salvat local (neautentificat).",
      });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id: user.id, // PK = auth.uid()
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name?.trim() || null,
        birth_date: form.birth_date || null,
        email: user.email || form.email || null, // preferă emailul din Auth
        phone: form.phone?.trim() || null,
        county: form.county?.trim() || null,
        city: form.city?.trim() || null,
        school: form.school?.trim() || null,
        username: form.username?.trim() || null,
      };

      const { error } = await supabase
        .from("teacher_profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      // cache local pentru offline
      ls.set("profil_profesor", { ...form, email: payload.email });
      setToast({ type: "success", message: "Profil salvat cu succes." });
    } catch (e) {
      console.error("saveProfile error:", e);
      ls.set("profil_profesor", form);
      setToast({
        type: "error",
        message: "Nu am putut salva. Datele au fost salvate local.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.08),transparent)]">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Înapoi la Dashboard (centru) */}
        <div className="flex justify-center">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/80 backdrop-blur shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-indigo-900">
                👤 Profil profesor
              </h1>
              <p className="text-sm text-gray-600">
                Completează/actualizează datele tale.
              </p>
            </div>
            {user && (
              <span className="rounded-full border px-3 py-1 text-[11px] text-gray-600 bg-gray-50">
                ID: {user.id.slice(0, 8)}…
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-gray-500">Se încarcă…</div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  placeholder="Prenume"
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  placeholder="Nume"
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  type="date"
                  name="birth_date"
                  value={form.birth_date || ""}
                  onChange={onChange}
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email"
                  disabled
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Telefon"
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="county"
                  value={form.county}
                  onChange={onChange}
                  placeholder="Județ"
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Oraș"
                />
                <input
                  className="border px-3 py-2 rounded-xl"
                  name="school"
                  value={form.school}
                  onChange={onChange}
                  placeholder="Școala"
                />
                <input
                  className="border px-3 py-2 rounded-xl sm:col-span-2"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="Username"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveProfile}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 shadow disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Se salvează…" : "💾 Salvează profilul"}
                </button>
              </div>
            </>
          )}
        </div>

        {toast && (
          <div
            className={
              "mx-auto max-w-lg text-center rounded-2xl p-3 text-sm " +
              (toast.type === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
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

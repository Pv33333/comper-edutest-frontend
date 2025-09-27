// src/pages/elev/ParinteSincronizatElev.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";

export default function ParinteSincronizatElev() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parinte, setParinte] = useState(null);

  // progres completare
  const progress = useMemo(() => {
    if (!parinte) return 0;
    const keys = [
      "prenume",
      "nume",
      "birthdate",
      "email",
      "telefon",
      "username",
      "judet",
      "oras",
    ];
    const filled = keys.filter((k) => parinte[k]?.toString().trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [parinte]);

  const loadParinte = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError("");

      // 1. luăm codParinte al elevului
      const { data: elev, error: errElev } = await supabase
        .from("student_profiles")
        .select("codparinte")
        .eq("id", user.id)
        .maybeSingle();

      if (errElev) throw errElev;
      if (!elev?.codparinte) {
        setParinte(null);
        setLoading(false);
        return;
      }

      // 2. căutăm părintele corespunzător
      const { data: p, error: errParinte } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("codparinte", elev.codparinte)
        .maybeSingle();

      if (errParinte) throw errParinte;
      setParinte(p || null);
    } catch (err) {
      console.error(err);
      setError("Nu am putut încărca datele părintelui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParinte();
  }, [user?.id]);

  const initials = (p) => {
    const fn = (p?.prenume || "").trim();
    const ln = (p?.nume || "").trim();
    return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "P";
  };

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
          👨‍👩‍👦 Profil Părinte
        </h1>

        {loading && <p className="text-center">Se încarcă...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !parinte && !error && (
          <p className="text-center text-gray-600">
            Nu ai părinte asociat în acest moment.
          </p>
        )}

        {parinte && (
          <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                {parinte.avatar_url ? (
                  <img
                    src={parinte.avatar_url}
                    alt="Avatar părinte"
                    className="h-24 w-24 rounded-2xl object-cover border shadow"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-2xl border shadow">
                    {initials(parinte)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="text-xl font-semibold text-indigo-900">
                  {parinte.prenume} {parinte.nume}
                </div>
                <div className="text-sm text-gray-600">
                  {parinte.email || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  {parinte.telefon || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  {parinte.judet || "—"}, {parinte.oras || "—"}
                </div>

                <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Completat {progress}%
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

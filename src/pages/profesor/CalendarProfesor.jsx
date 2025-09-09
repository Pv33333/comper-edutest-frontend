// CalendarProfesor.jsx – Premium (fără sticky), buton Înapoi centrat, gradient ca în profil
import React, { useEffect, useMemo, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { populateConfirmariElevi } from "../../utils/confirmari_elevi_test";
import DateTimePicker from "../../components/DateTimePicker";

const MATERII = ["Toate", "Română", "Matematică"];
const CLASE = [
  "Toate",
  "Clasa Pregătitoare",
  "Clasa I",
  "Clasa a II-a",
  "Clasa a III-a",
  "Clasa a IV-a",
  "Clasa a V-a",
  "Clasa a VI-a",
  "Clasa a VII-a",
  "Clasa a VIII-a",
];

const CalendarProfesor = () => {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [tests, setTests] = useState([]);
  const [confirmari, setConfirmari] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState(null);
  const [tab, setTab] = useState("lista"); // "lista" | "calendar"
  const [search, setSearch] = useState("");
  const [fMaterie, setFMaterie] = useState("Toate");
  const [fClasa, setFClasa] = useState("Toate");

  const toKey = (y, m, d) => new Date(y, m, d).toLocaleDateString("en-CA");

  const fetchEvents = async () => {
    if (!user?.id) {
      const local = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
      setTests(local);
      return;
    }
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("created_by", user.id)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });
    if (error) {
      console.error("Fetch error:", error);
      return;
    }
    setTests(data);
    localStorage.setItem("tests_from_prof", JSON.stringify(data));
  };

  useEffect(() => {
    populateConfirmariElevi();
    try {
      const c = JSON.parse(localStorage.getItem("confirmari_elevi") || "[]");
      setConfirmari(c);
    } catch {}
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase().trim();
    return tests.filter((t) => {
      const matchesSearch =
        !needle ||
        `${t.subject || ""} ${t.descriere || ""} ${t.clasa || ""} ${
          t.event_date || ""
        }`
          .toLowerCase()
          .includes(needle);

      const matchesMaterie = fMaterie === "Toate" || t.subject === fMaterie;
      const matchesClasa = fClasa === "Toate" || t.clasa === fClasa;

      return matchesSearch && matchesMaterie && matchesClasa;
    });
  }, [tests, search, fMaterie, fClasa]);

  const changeMonth = (offset) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  const colorByTip = (tip) => {
    if (tip?.includes("Comper"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (tip?.includes("Platformă"))
      return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  const isToday = (dateKey) => {
    const today = new Date();
    const key = today.toLocaleDateString("en-CA");
    return key === dateKey;
  };

  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

  const renderCalendar = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const startDay = (start.getDay() || 7) - 1; // luni = 0
    const grid = [];

    for (let i = 0; i < startDay; i++) grid.push(<div key={"e" + i}></div>);

    for (let d = 1; d <= end.getDate(); d++) {
      const key = toKey(y, m, d);
      const dayTests = filtered.filter((t) => t.event_date === key);

      grid.push(
        <motion.div
          key={key}
          whileHover={{ scale: 1.02 }}
          className={`relative group bg-white p-2 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer ${
            isToday(key) ? "ring-2 ring-indigo-400" : "border-gray-200"
          }`}
          onClick={() => {
            setDefaultDate(key);
            setPickerOpen(true);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">{d}</div>
            {isToday(key) && (
              <span className="text-[10px] font-semibold text-indigo-700">
                azi
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {dayTests.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`border ${colorByTip(
                  e.tip
                )} rounded-lg px-2 py-1 text-[11px] leading-tight truncate relative`}
              >
                <span className="font-medium">{e.subject}</span>
                <span className="opacity-70"> • {e.event_time}</span>

                {/* Tooltip premium (group-hover) */}
                <div className="pointer-events-none absolute left-0 top-full mt-1 hidden group-hover:block z-30 w-64">
                  <div className="rounded-xl border bg-white/95 backdrop-blur shadow-xl p-3 text-[12px]">
                    <div className="font-semibold text-gray-900 mb-1">
                      {e.subject}
                    </div>
                    <div className="text-gray-600">{e.clasa || "—"}</div>
                    <div className="text-gray-500">
                      {e.event_date} {e.event_time}
                    </div>
                    {e.descriere && (
                      <div className="mt-1 text-gray-700">{e.descriere}</div>
                    )}
                    <div className="mt-2 text-[11px] text-gray-500">
                      Tip: {e.tip || "Profesor"} • Sursă: {e.source || "—"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }
    return grid;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white text-gray-800 flex flex-col">
      {/* Înapoi la Dashboard – centrat sus (ca în ProfilProfesor) */}
      <div className="flex justify-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white bg-white/80 backdrop-blur shadow"
        >
          ⟵ Înapoi la Dashboard
        </Link>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold text-center text-indigo-900"
        >
          📅 Calendarul testelor
        </motion.h1>

        {/* Tabs (pills) */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex p-1 bg-white/70 backdrop-blur rounded-2xl border shadow-sm">
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === "lista"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setTab("lista")}
            >
              📋 Listă
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === "calendar"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setTab("calendar")}
            >
              🗓 Calendar
            </button>
          </div>
        </div>

        {/* Toolbar căutare + filtre (fără sticky) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Caută după materie, clasă, dată sau descriere…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-2xl px-4 py-2.5 shadow-sm bg-white/80 backdrop-blur"
          />
          <select
            value={fMaterie}
            onChange={(e) => setFMaterie(e.target.value)}
            className="w-full border rounded-2xl px-4 py-2.5 shadow-sm bg-white/80 backdrop-blur"
          >
            {MATERII.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            value={fClasa}
            onChange={(e) => setFClasa(e.target.value)}
            className="w-full border rounded-2xl px-4 py-2.5 shadow-sm bg-white/80 backdrop-blur"
          >
            {CLASE.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* LISTĂ */}
        {tab === "lista" && (
          <div className="mt-6">
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <p className="text-gray-500">Niciun test găsit.</p>
              ) : (
                filtered.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="bg-white/90 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-indigo-900 font-semibold text-lg">
                          📘 {t.subject} – {t.clasa || "fără clasă"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t.event_date} · {t.event_time}
                        </div>
                        {t.descriere && (
                          <div className="text-sm text-gray-700 mt-1">
                            {t.descriere}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${colorByTip(
                              t.tip
                            )}`}
                          >
                            {t.tip || "Profesor"}
                          </span>
                          {t.source && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                              Sursă: {t.source}
                            </span>
                          )}
                          {t.anulat && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200">
                              Anulat
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDefaultDate(t.event_date);
                          setPickerOpen(true);
                        }}
                        className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm"
                      >
                        Editare rapidă
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {tab === "calendar" && (
          <div className="mt-6">
            {/* Header lună (fix, fără sticky) */}
            <div className="bg-white/70 backdrop-blur border rounded-2xl p-3 shadow-sm flex items-center justify-between">
              <button
                className="rounded-xl border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                onClick={() => changeMonth(-1)}
              >
                ⬅ Luna precedentă
              </button>
              <div className="font-semibold text-indigo-900">
                {currentDate.toLocaleDateString("ro-RO", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                className="rounded-xl border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                onClick={() => changeMonth(1)}
              >
                Luna următoare ➡
              </button>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                Comper
              </span>
              <span className="px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-200">
                Platformă
              </span>
              <span className="px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                Profesor
              </span>
              <span className="text-gray-500 ml-auto">
                Click pe o zi pentru a adăuga test
              </span>
            </div>

            {/* Zilele săptămânii */}
            <div className="mt-4 grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-gray-500">
              {weekdays.map((w, i) => (
                <div key={i} className="text-center">
                  {w}
                </div>
              ))}
            </div>

            {/* Grid zile */}
            <div className="mt-2 grid grid-cols-7 gap-2 text-sm md:text-base">
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* Confirmări Elevi */}
        <div className="mt-10">
          <details className="bg-white/80 backdrop-blur border rounded-2xl p-4 shadow-md">
            <summary className="text-lg font-semibold text-indigo-900 cursor-pointer select-none">
              ✔ Confirmări Teste de la Elevi{" "}
              <span className="text-sm text-gray-600">
                (click pentru a extinde)
              </span>
            </summary>
            <ul className="mt-4 space-y-3 text-sm text-gray-800">
              {confirmari.length === 0 ? (
                <li className="text-gray-500">Nicio confirmare încă.</li>
              ) : (
                confirmari.map((c, i) => (
                  <li
                    key={i}
                    className="border rounded-xl p-3 bg-white shadow-sm"
                  >
                    <div className="font-medium text-indigo-700">
                      {c.subject}{" "}
                      {c.viewed && (
                        <span className="text-green-600 text-xs ml-2">
                          (Văzut)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.date} {c.time} – {c.desc}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ✔ Confirmat:{" "}
                      {new Date(c.confirmedAt).toLocaleString("ro-RO")}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </details>
        </div>
      </main>

      {/* FAB – Adaugă test */}
      <button
        onClick={() => {
          setDefaultDate(null);
          setPickerOpen(true);
        }}
        className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold"
        title="Adaugă test"
      >
        ➕ Adaugă test
      </button>

      {/* DateTimePicker */}
      {pickerOpen && (
        <DateTimePicker
          defaultDate={defaultDate}
          onClose={() => setPickerOpen(false)}
          onSaved={() => {
            setPickerOpen(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

export default CalendarProfesor;

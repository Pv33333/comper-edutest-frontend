import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import DateTimePicker from "@/components/DateTimePicker.jsx";

const lsGetJSON = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const lsSetJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const MATERII = ["Toate", "Română", "Matematică"];
const CLASE = ["Toate"];
const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

const formatEventDateTime = (event_date, event_time) => {
  if (!event_date && !event_time) return "-";
  if (event_date && event_time) return `${event_date} · ${event_time}`;
  return event_date || event_time || "-";
};

export default function CalendarProfesor() {
  const [events, setEvents] = useState([]);
  const [confirmari, setConfirmari] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [existingEvent, setExistingEvent] = useState(null);
  const [editTargetsOnly, setEditTargetsOnly] = useState(false);
  const [sendMode, setSendMode] = useState(false);
  const [defaultDate, setDefaultDate] = useState(null);
  const [tab, setTab] = useState("lista");
  const [search, setSearch] = useState("");
  const [fMaterie, setFMaterie] = useState("Toate");
  const [fClasa, setFClasa] = useState("Toate");

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });
    if (!error) {
      setEvents(data || []);
      lsSetJSON("tests_from_prof", data || []);
    } else {
      console.error(error);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase().trim();
    return (events || []).filter((t) => {
      const matchesSearch =
        !needle ||
        `${t.subject || ""} ${t.descriere || ""} ${t.clasa || ""} ${t.event_date || ""}`
          .toLowerCase()
          .includes(needle);

      const matchesMaterie = fMaterie === "Toate" || t.subject === fMaterie;
      const matchesClasa = fClasa === "Toate" || t.clasa === fClasa;

      return matchesSearch && matchesMaterie && matchesClasa;
    });
  }, [events, search, fMaterie, fClasa]);

  const changeMonth = (offset) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  const colorByTip = (tip) => {
    if ((tip || "").includes("Comper")) return "bg-blue-100 text-blue-800 border-blue-200";
    if ((tip || "").includes("Platformă")) return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  const toKey = (y, m, d) => new Date(y, m, d).toLocaleDateString("en-CA");
  const isToday = (dateKey) => new Date().toLocaleDateString("en-CA") === dateKey;

  const renderCalendar = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const startDay = (start.getDay() || 7) - 1;
    const grid = [];

    for (let i = 0; i < startDay; i++) grid.push(<div key={"e" + i}></div>);

    for (let d = 1; d <= end.getDate(); d++) {
      const key = toKey(y, m, d);
      const dayTests = filtered.filter((t) => t.event_date === key);

      grid.push(
        <motion.div
          key={key}
          whileHover={{ scale: 1.02 }}
          className={`relative group bg-white p-2 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer ${isToday(key) ? "ring-2 ring-indigo-400" : "border-gray-200"}`}
          onClick={() => {
            setExistingEvent(null);
            setEditTargetsOnly(false);
            setSendMode(false);
            setDefaultDate(key);
            setPickerOpen(true);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">{d}</div>
            {isToday(key) && <span className="text-[10px] font-semibold text-indigo-700">azi</span>}
          </div>

          <div className="mt-2 space-y-1">
            {dayTests.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`border ${colorByTip(e.tip)} rounded-lg px-2 py-1 text-[11px] leading-tight truncate relative`}
              >
                <span className="font-medium">{e.subject}</span>
                <span className="opacity-70"> • {e.event_time}</span>

                <div className="pointer-events-none absolute left-0 top-full mt-1 hidden group-hover:block z-30 w-64">
                  <div className="rounded-xl border bg-white/95 backdrop-blur shadow-xl p-3 text-[12px]">
                    <div className="font-semibold text-gray-900 mb-1">{e.subject}</div>
                    <div className="text-gray-600">{e.clasa || "—"}</div>
                    <div className="text-gray-500">{e.event_date} {e.event_time}</div>
                    {e.descriere && <div className="mt-1 text-gray-700">{e.descriere}</div>}
                    <div className="mt-2 text-[11px] text-gray-500">Tip: {e.tip || "Profesor"} • Scope: {e.scope || "—"}</div>
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

  const handleDeleteEvent = useCallback(async (eventId) => {
    if (!window.confirm("Ștergi acest test programat din calendar?")) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);
    if (error) {
      console.error(error);
      alert("Eroare la ștergere.");
    }
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 via-white to-white text-gray-800 flex flex-col">
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

        <div className="mt-6 flex justify-center">
          <div className="inline-flex p-1 bg-white/70 backdrop-blur rounded-2xl border shadow-sm">
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === "lista" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setTab("lista")}
            >
              📋 Listă
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === "calendar" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"}`}
              onClick={() => setTab("calendar")}
            >
              🗓 Calendar
            </button>
          </div>
        </div>

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
                          {formatEventDateTime(t.event_date, t.event_time)}
                        </div>
                        {t.descriere && (
                          <div className="text-sm text-gray-700 mt-1">{t.descriere}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${colorByTip(t.tip)}`}>
                            {t.tip || "Profesor"}
                          </span>
                          {t.scope && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                              {t.scope === "class" ? "Trimis clasei" : (t.scope === "students" ? "Țintit elevi selectați" : "Privat (doar profesor)")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setExistingEvent(t);
                            setEditTargetsOnly(false);
                            setSendMode(false);
                            setPickerOpen(true);
                          }}
                          className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm"
                        >
                          Editare rapidă
                        </button>
                        <button
                          onClick={() => {
                            setExistingEvent(t);
                            setEditTargetsOnly(false);
                            setSendMode(true);
                            setPickerOpen(true);
                          }}
                          className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm"
                        >
                          Trimite
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(t.id)}
                          className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50 shadow-sm text-red-600"
                        >
                          🗑️ Șterge
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "calendar" && (
          <div className="mt-6">
            <div className="bg-white/70 backdrop-blur border rounded-2xl p-3 shadow-sm flex items-center justify-between">
              <button
                className="rounded-xl border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                onClick={() => changeMonth(-1)}
              >
                ⬅ Luna precedentă
              </button>
              <div className="font-semibold text-indigo-900">
                {currentDate.toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
              </div>
              <button
                className="rounded-xl border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                onClick={() => changeMonth(1)}
              >
                Luna următoare ➡
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-gray-500">
              {weekdays.map((w, i) => (
                <div key={i} className="text-center">{w}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2 text-sm md:text-base">
              {renderCalendar()}
            </div>
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setExistingEvent(null);
          setEditTargetsOnly(false);
          setSendMode(false);
          setDefaultDate(null);
          setPickerOpen(true);
        }}
        className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold"
        title="Adaugă test"
      >
        ➕ Adaugă test
      </button>

      {pickerOpen && (
        <DateTimePicker
          defaultDate={defaultDate}
          existingEvent={existingEvent}
          editTargetsOnly={editTargetsOnly}
          sendMode={sendMode}
          onClose={() => setPickerOpen(false)}
          onSaved={() => {
            setPickerOpen(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
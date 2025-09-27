import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import DateTimePicker from "@/components/DateTimePicker.jsx";
import { Trash } from "lucide-react";

/* Utils */
const weekdays = ["L", "Ma", "Mi", "J", "V", "S", "D"];
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const getEventDate = (ev) =>
  ev?.event_date ||
  (ev?.scheduled_at
    ? new Date(ev.scheduled_at).toISOString().slice(0, 10)
    : null);
const getEventTime = (ev) =>
  ev?.event_time ||
  (ev?.scheduled_at
    ? `${pad(new Date(ev.scheduled_at).getHours())}:${pad(
        new Date(ev.scheduled_at).getMinutes()
      )}`
    : null);
const formatEventDateTime = (ev) => {
  const d = getEventDate(ev);
  const t = getEventTime(ev);
  return String(d && t ? `${d} · ${t}` : d || t || "-");
};

export default function CalendarProfesor() {
  const [tab, setTab] = useState("calendar");
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [defaultTab, setDefaultTab] = useState("save");
  const [confirmations, setConfirmations] = useState([]);

  /* Fetch events */
  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("scheduled_at", { ascending: true });
    if (!error) setEvents(data || []);
  }, []);
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ✅ Fetch confirmations – include și cele cu created_by = null */
  const fetchConfirmations = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("assignments")
      .select(
        "id, status, students(name), classes(grade_level, letter), calendar_events(title)"
      )
      .or(`created_by.eq.${user.id},created_by.is.null`);

    if (error) {
      console.error("❌ Eroare confirmări:", error);
      return;
    }
    console.log("📚 Confirmări primite:", data);
    setConfirmations(data || []);
  }, []);

  /* Group confirmări */
  const groupedConfirmations = useMemo(() => {
    const map = {};
    confirmations.forEach((c) => {
      const testKey = c.calendar_events?.title || "Test";
      if (!map[testKey]) map[testKey] = {};
      const classLabel = c.classes
        ? `Clasa ${c.classes.grade_level}${
            c.classes.letter ? " " + c.classes.letter : ""
          }`
        : "—";
      if (!map[testKey][classLabel]) map[testKey][classLabel] = [];
      map[testKey][classLabel].push(c);
    });
    return map;
  }, [confirmations]);

  /* Confirmări actions */
  const deleteConfirmation = async (id) => {
    await supabase.from("assignments").delete().eq("id", id);
    fetchConfirmations();
  };

  /* ✅ openSend: inserează assignments cu created_by + class_id și evită duplicatele */
  const openSend = async (ev = null) => {
    setSelectedEvent(ev);
    setDefaultTab("send");
    setPickerOpen(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !ev?.id || !ev?.class_id) {
      console.warn("❌ Profesorul nu e autentificat sau eveniment lipsă:", {
        user,
        ev,
      });
      return;
    }

    // elevii din clasă
    const { data: students, error: stErr } = await supabase
      .from("students")
      .select("id")
      .eq("class_id", ev.class_id);
    if (stErr || !students?.length) return;

    // assignments existente pt eveniment
    const { data: existing, error: exErr } = await supabase
      .from("assignments")
      .select("student_id")
      .eq("event_id", ev.id);
    if (exErr) return;

    const existingSet = new Set((existing || []).map((r) => r.student_id));
    const rows = students
      .filter((s) => !existingSet.has(s.id))
      .map((s) => ({
        student_id: s.id,
        event_id: ev.id,
        class_id: ev.class_id,
        status: "pending",
        created_by: user.id,
      }));

    if (rows.length) {
      console.log("✅ Inserăm assignments:", rows);
      await supabase.from("assignments").insert(rows);
    }
  };

  /* Delete event + assignments asociate */
  const deleteEvent = async (id) => {
    await supabase.from("assignments").delete().eq("event_id", id);
    await supabase.from("calendar_events").delete().eq("id", id);
    fetchEvents();
  };

  /* Calendar grid */
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = endOfMonth.getDate();
  const firstDay = startOfMonth.getDay() || 7;
  const weeks = useMemo(() => {
    const rows = [];
    const totalSlots = firstDay - 1 + daysInMonth;
    const totalWeeks = Math.ceil(totalSlots / 7);
    for (let w = 0; w < totalWeeks; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d - (firstDay - 2);
        row.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
      }
      rows.push(row);
    }
    return rows;
  }, [firstDay, daysInMonth]);

  /* Modal helpers */
  const openCreate = (isoDate = null) => {
    setSelectedEvent(isoDate ? { event_date: isoDate } : null);
    setDefaultTab("save");
    setTimeout(() => setPickerOpen(true), 0);
  };
  const openEdit = (ev) => {
    setSelectedEvent(ev);
    setDefaultTab("save");
    setPickerOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-white text-gray-800">
      {/* ======= Header ======= */}
      <div className="mx-4 md:mx-auto md:max-w-6xl">
        <div className="flex justify-center pt-6 pb-6">
          <Link
            to="/profesor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 backdrop-blur hover:bg-white shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white">
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold">
                Calendar Profesor
              </h1>
              <span className="text-white/80">
                {currentDate.toLocaleDateString("ro-RO", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 text-sm rounded-xl ${
                  tab === "calendar"
                    ? "bg-white text-indigo-700"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                onClick={() => setTab("calendar")}
              >
                Calendar
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-xl ${
                  tab === "lista"
                    ? "bg-white text-indigo-700"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                onClick={() => setTab("lista")}
              >
                Listă teste
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-xl ${
                  tab === "confirmari"
                    ? "bg-white text-indigo-700"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                onClick={() => {
                  setTab("confirmari");
                  fetchConfirmations();
                }}
              >
                Confirmări elevi
              </button>
              <button
                className="rounded-xl bg-white text-indigo-700 px-4 py-2 text-sm hover:bg-gray-100 shadow"
                onClick={() => openCreate()}
              >
                + Adaugă test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======= Content ======= */}
      <div className="mx-4 md:mx-auto md:max-w-6xl my-6">
        {/* Calendar */}
        {tab === "calendar" && (
          <div className="rounded-2xl border bg-white shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                ← Luna anterioară
              </button>
              <div className="font-medium">
                {currentDate.toLocaleDateString("ro-RO", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                Luna următoare →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2 font-medium">
              {weekdays.map((d, i) => (
                <div key={i} className="text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weeks.map((row, ri) => (
                <React.Fragment key={ri}>
                  {row.map((day, di) =>
                    day ? (
                      <div
                        key={di}
                        className={`min-h[120px] min-h-[120px] rounded-xl border p-2 relative group transition ${
                          new Date().getFullYear() ===
                            currentDate.getFullYear() &&
                          new Date().getMonth() === currentDate.getMonth() &&
                          new Date().getDate() === day
                            ? "ring-2 ring-indigo-400 bg-indigo-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">{day}</div>
                          <button
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreate(
                                `${currentDate.getFullYear()}-${pad(
                                  currentDate.getMonth() + 1
                                )}-${pad(day)}`
                              );
                            }}
                          >
                            + adaugă
                          </button>
                        </div>
                        <div className="mt-1 space-y-1">
                          {(events || [])
                            .filter(
                              (e) =>
                                getEventDate(e) ===
                                `${currentDate.getFullYear()}-${pad(
                                  currentDate.getMonth() + 1
                                )}-${pad(day)}`
                            )
                            .map((e) => (
                              <div
                                key={e.id}
                                className="text-[11px] rounded-lg px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer"
                                onClick={() => openEdit(e)}
                                title={`${
                                  e.title || "Test"
                                } • ${formatEventDateTime(e)}`}
                              >
                                {e.title || e.subject || "Test"}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div key={di} />
                    )
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Listă teste */}
        {tab === "lista" && (
          <div className="space-y-4">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                layout
                className="rounded-2xl border p-5 bg-white shadow hover:shadow-lg transition w-full"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {ev.title || "Test"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatEventDateTime(ev)}
                  </p>
                  <p className="text-sm text-indigo-600 mt-1">
                    {ev.subject || "-"}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => openEdit(ev)}
                  >
                    ✏️ Editează
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => openSend(ev)}
                  >
                    📤 Trimite
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                    onClick={() => deleteEvent(ev.id)}
                  >
                    🗑️ Șterge
                  </button>
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                Niciun test programat.
              </div>
            )}
          </div>
        )}

        {/* Confirmări elevi */}
        {tab === "confirmari" && (
          <div className="rounded-2xl border bg-white shadow-lg p-5">
            <h2 className="font-medium mb-4">Confirmări elevi</h2>
            {Object.entries(groupedConfirmations).map(([test, classes]) => (
              <motion.div
                key={test}
                layout
                className="mb-6 rounded-2xl border bg-white shadow p-5"
              >
                <h3 className="font-semibold text-lg mb-4">{test}</h3>
                {Object.entries(classes).map(([cls, rows]) => (
                  <div key={cls} className="mb-5">
                    <h4 className="font-medium text-sm text-gray-600 mb-3">
                      {cls}
                    </h4>
                    <div className="divide-y">
                      {rows.map((c) => (
                        <div
                          key={c.id}
                          className="flex justify-between items-center py-3"
                        >
                          <div>
                            <span className="font-medium">
                              {c.students?.name || "Elev"}
                            </span>
                            <span
                              className={`ml-3 text-sm ${
                                c.status === "confirmed"
                                  ? "text-green-600"
                                  : c.status === "pending"
                                  ? "text-gray-600"
                                  : "text-red-600"
                              }`}
                            >
                              {c.status === "confirmed"
                                ? "Confirmat"
                                : c.status === "pending"
                                ? "În așteptare"
                                : "Anulat"}
                            </span>
                          </div>
                          <button
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            onClick={() => deleteConfirmation(c.id)}
                          >
                            <Trash className="w-4 h-4" /> Șterge
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
            {confirmations.length === 0 && (
              <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                Nu există confirmări.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DateTimePicker */}
      <AnimatePresence>
        {pickerOpen && (
          <DateTimePicker
            event={selectedEvent}
            defaultTab={defaultTab}
            onClose={() => setPickerOpen(false)}
            onSaved={() => {
              setPickerOpen(false);
              fetchEvents();
              if (tab === "confirmari") fetchConfirmations();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

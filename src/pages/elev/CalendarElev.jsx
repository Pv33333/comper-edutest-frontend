import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Trash, Check, XCircle, Info } from "lucide-react";

/* Utils */
const weekdays = ["L", "Ma", "Mi", "J", "V", "S", "D"];
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const getEventDate = (a) =>
  a?.calendar_events?.event_date ||
  (a?.calendar_events?.scheduled_at
    ? new Date(a.calendar_events.scheduled_at).toISOString().slice(0, 10)
    : null);
const getEventTime = (a) =>
  a?.calendar_events?.event_time ||
  (a?.calendar_events?.scheduled_at
    ? `${pad(new Date(a.calendar_events.scheduled_at).getHours())}:${pad(
        new Date(a.calendar_events.scheduled_at).getMinutes()
      )}`
    : null);
const formatEventDateTime = (a) => {
  const d = getEventDate(a);
  const t = getEventTime(a);
  return String(d && t ? `${d} · ${t}` : d || t || "-");
};
const statusBadge = (status) =>
  status === "confirmed"
    ? "bg-green-100 text-green-700"
    : status === "pending"
    ? "bg-gray-100 text-gray-700"
    : "bg-red-100 text-red-700";

/* Mapping DB <-> UI */
const dbToUiStatus = (status) => {
  if (status === "pending") return "În așteptare";
  if (status === "confirmed") return "Confirmat";
  if (status === "completed") return "Anulat";
  return status;
};
const uiToDbStatus = (status) => {
  if (status === "anulat") return "completed";
  return status;
};

/* Detalii test - Modal */
function DetailsModal({ assignment, onClose, onConfirm, onCancel, onDelete }) {
  if (!assignment) return null;
  const ce = assignment.calendar_events || {};
  const when = formatEventDateTime(assignment);

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="modal-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b flex items-center gap-2">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{ce.title || "Test"}</h3>
              <p className="text-xs text-gray-500">{when}</p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-1 rounded-full ${statusBadge(
                assignment.status
              )}`}
            >
              {dbToUiStatus(assignment.status)}
            </span>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Materie</span>
              <span className="text-sm font-medium">{ce.subject || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Data & ora</span>
              <span className="text-sm font-medium">{when}</span>
            </div>
          </div>

          <div className="p-5 border-t grid grid-cols-3 gap-2">
            {assignment.status !== "confirmed" && (
              <button
                onClick={() => onConfirm(assignment.id)}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Confirmă
              </button>
            )}
            {assignment.status !== "completed" && (
              <button
                onClick={() => onCancel(assignment.id)}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
              >
                Anulează
              </button>
            )}
            <button
              onClick={() => onDelete(assignment.id)}
              className="rounded-xl px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border"
            >
              Șterge
            </button>
            <button
              onClick={onClose}
              className="col-span-3 rounded-xl px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200"
            >
              Închide
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CalendarElev() {
  const [tab, setTab] = useState("calendar");
  const [assignments, setAssignments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);

  /* Fetch assignments pentru elev logat */
  const fetchAssignments = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!student) return;

    const { data } = await supabase
      .from("assignments")
      .select(
        `
        id, status, student_id,
        calendar_events (
          id, title, subject, scheduled_at, event_date, event_time
        )
      `
      )
      .eq("student_id", student.id)
      .order("id", { ascending: true });

    console.log("📚 Assignments elev:", data);
    setAssignments(data || []);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /* Actions */
  const updateStatus = async (id, newStatusUI) => {
    const newStatusDB = uiToDbStatus(newStatusUI);
    await supabase
      .from("assignments")
      .update({ status: newStatusDB })
      .eq("id", id);
    setSelected(null);
    fetchAssignments();
  };

  const deleteAssignment = async (id) => {
    await supabase.from("assignments").delete().eq("id", id);
    setSelected(null);
    fetchAssignments();
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-white text-gray-800">
      {/* ======= Header ======= */}
      <div className="mx-4 md:mx-auto md:max-w-6xl">
        <div className="flex justify-center pt-6 pb-6">
          <Link
            to="/elev/dashboard"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 backdrop-blur hover:bg-white shadow"
          >
            ⟵ Înapoi la Dashboard
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 text-white">
          <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold">
                Calendar Elev
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
                onClick={() => setTab("confirmari")}
              >
                Confirmări
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
                        className={`min-h-[120px] rounded-xl border p-2 relative group transition ${
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
                        </div>

                        <div className="mt-1 space-y-1">
                          {(assignments || [])
                            .filter(
                              (a) =>
                                getEventDate(a) ===
                                `${currentDate.getFullYear()}-${pad(
                                  currentDate.getMonth() + 1
                                )}-${pad(day)}`
                            )
                            .map((a) => (
                              <button
                                key={a.id}
                                onClick={() => setSelected(a)}
                                className="w-full text-left text-[11px] rounded-lg px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer flex items-center justify-between"
                                title={`${
                                  a.calendar_events?.title || "Test"
                                } • ${formatEventDateTime(a)}`}
                              >
                                <span className="truncate">
                                  {a.calendar_events?.title || "Test"}
                                </span>
                                <span
                                  className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${statusBadge(
                                    a.status
                                  )}`}
                                >
                                  {dbToUiStatus(a.status)}
                                </span>
                              </button>
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
            {assignments.map((a) => (
              <motion.div
                key={a.id}
                layout
                className="rounded-2xl border p-5 bg-white shadow hover:shadow-lg transition w-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {a.calendar_events?.title || "Test"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatEventDateTime(a)}
                    </p>
                    <p className="text-sm text-indigo-600 mt-1">
                      {a.calendar_events?.subject || "-"}
                    </p>
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${statusBadge(
                        a.status
                      )}`}
                    >
                      {dbToUiStatus(a.status)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setSelected(a)}
                    >
                      Detalii
                    </button>
                    <button
                      className="rounded-xl border px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-1"
                      onClick={() => deleteAssignment(a.id)}
                    >
                      <Trash className="w-4 h-4" />
                      Șterge
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {assignments.length === 0 && (
              <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                Niciun test primit.
              </div>
            )}
          </div>
        )}

        {/* Confirmări */}
        {tab === "confirmari" && (
          <div className="rounded-2xl border bg-white shadow-lg p-5">
            <h2 className="font-medium mb-4">Confirmări</h2>
            <div className="space-y-4">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border p-4 bg-white hover:shadow transition"
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {a.calendar_events?.title || "Test"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatEventDateTime(a)}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${statusBadge(
                        a.status
                      )}`}
                    >
                      {dbToUiStatus(a.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {a.status !== "confirmed" && (
                      <button
                        className="rounded-xl px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                        onClick={() => updateStatus(a.id, "confirmed")}
                      >
                        <Check className="w-4 h-4" />
                        Confirmă
                      </button>
                    )}
                    {a.status !== "completed" && (
                      <button
                        className="rounded-xl px-4 py-2 text-sm bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-1"
                        onClick={() => updateStatus(a.id, "anulat")}
                      >
                        <XCircle className="w-4 h-4" />
                        Anulează
                      </button>
                    )}
                    <button
                      className="rounded-xl px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 border flex items-center gap-1"
                      onClick={() => deleteAssignment(a.id)}
                    >
                      <Trash className="w-4 h-4" />
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="rounded-2xl border bg-white p-6 text-center text-gray-500">
                  Nu există confirmări.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal detalii test */}
      <DetailsModal
        assignment={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => updateStatus(id, "confirmed")}
        onCancel={(id) => updateStatus(id, "anulat")}
        onDelete={(id) => deleteAssignment(id)}
      />
    </div>
  );
}

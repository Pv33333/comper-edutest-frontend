import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Save, Send, X, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/* UI helpers */
const Btn = ({ variant = "solid", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow transition disabled:opacity-50";
  const styles =
    variant === "outline"
      ? "border border-gray-300 hover:bg-gray-50"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white hover:opacity-90";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
};
const Input = (p) => (
  <input
    {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
      p.className || ""
    }`}
  />
);
const Select = (p) => (
  <select
    {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
      p.className || ""
    }`}
  />
);
const TextArea = (p) => (
  <textarea
    {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
      p.className || ""
    }`}
  />
);

/* utils */
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const normalizeDate = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
};
const toUTCISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [Y, M, D] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  const local = new Date(Y, M - 1, D, h, m);
  return new Date(
    local.getTime() - local.getTimezoneOffset() * 60000
  ).toISOString();
};
const roman = (n) =>
  ["Pregătitoare", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][
    Number(n)
  ] || n;
const buildClassLabel = (grade, letter) => {
  if (grade === 0) return `Clasa pregătitoare${letter ? " " + letter : ""}`;
  return `Clasa a ${roman(grade)}-a${letter ? " " + letter : ""}`;
};

export default function DateTimePicker({
  onClose,
  onSaved,
  event = null,
  defaultTab = "save",
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState(defaultTab);

  // form state
  const now = useMemo(() => {
    const d = new Date();
    return {
      date: normalizeDate(d),
      time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
    };
  }, []);
  const [title, setTitle] = useState(event?.title || "");
  const [subject, setSubject] = useState(event?.subject || "Română");
  const [grade, setGrade] = useState(event?.grade_level || 0);
  const [letter, setLetter] = useState(event?.letter || "");
  const [competence, setCompetence] = useState(event?.competence || "");
  const [teacherName, setTeacherName] = useState(event?.teacher_name || "");
  const [date, setDate] = useState(event?.event_date || now.date);
  const [time, setTime] = useState(event?.event_time || now.time);
  const [description, setDescription] = useState(event?.description || "");
  const [saving, setSaving] = useState(false);

  // user logat → preia nume profesor
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setTeacherName(user.user_metadata?.full_name || user.email || "");
      }
    };
    fetchUser();
  }, []);

  // classes & students (prin class_enrollments)
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(event?.class_id || "");
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, grade_level, letter")
        .order("grade_level", { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((r) => ({
        id: r.id,
        label: buildClassLabel(r.grade_level, r.letter),
      }));
      setClasses(mapped);
      if (!selectedClassId && mapped[0])
        setSelectedClassId(String(mapped[0].id));
    } catch (e) {
      toast({
        title: "Eroare la clase",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingClasses(false);
    }
  };
  useEffect(() => {
    if (tab === "send") loadClasses();
  }, [tab]);

  const loadStudents = async (cid) => {
    if (!cid) return;
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from("class_enrollments")
        .select("students(id, name, email)")
        .eq("class_id", cid);

      if (error) throw error;

      setStudents((data || []).map((d) => d.students));
    } catch (e) {
      toast({
        title: "Eroare la elevi",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };
  useEffect(() => {
    if (tab === "send" && selectedClassId) loadStudents(selectedClassId);
  }, [tab, selectedClassId]);

  const canSave = !!(title && subject && date && time && teacherName);

  // Save in calendar_events
  const saveEventInternal = async () => {
    const payload = {
      title,
      subject,
      event_date: date,
      event_time: time,
      scheduled_at: toUTCISO(date, time),
      competence,
      teacher_name: teacherName,
      description,
      class_label: buildClassLabel(grade, letter),
      class_id: selectedClassId || null, // 🔑 FIX: adăugat class_id
    };

    if (event?.id) {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", event.id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([payload])
        .select("*")
        .single();
      if (error) throw error;
      return data;
    }
  };

  const handleSaveClick = async () => {
    if (!canSave) {
      toast({
        title: "Completează toate câmpurile obligatorii",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      const saved = await saveEventInternal();
      toast({
        title: "Test salvat",
        description: "Evenimentul a fost salvat.",
      });
      onSaved?.(saved);
      onClose?.();
    } catch (e) {
      toast({
        title: "Eroare la salvare",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 🗑️ Delete test
  const handleDeleteClick = async () => {
    if (!event?.id) return;
    try {
      await supabase.from("assignments").delete().eq("event_id", event.id);
      await supabase.from("calendar_events").delete().eq("id", event.id);
      toast({
        title: "Test șters",
        description: "Evenimentul a fost eliminat.",
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast({
        title: "Eroare la ștergere",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Insert assignments
  const insertAssignments = async (rows) => {
    const { error } = await supabase.from("assignments").insert(rows);
    if (error) throw error;
  };

  const sendToClass = async () => {
    try {
      const ev = event?.id ? event : await saveEventInternal();
      const rows = (students.length ? students : [{ id: null }]).map((s) => ({
        event_id: ev.id,
        class_id: selectedClassId, // 🔑 asigurăm că e setat
        student_id: s.id,
        status: "pending",
      }));
      await insertAssignments(rows);
      toast({ title: "Trimis clasei", description: "Testul a fost alocat." });
    } catch (e) {
      toast({
        title: "Eroare la trimitere",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const sendToStudent = async (s) => {
    try {
      const ev = event?.id ? event : await saveEventInternal();
      await insertAssignments([
        {
          event_id: ev.id,
          class_id: selectedClassId, // 🔑 asigurăm că e setat
          student_id: s.id,
          status: "pending",
        },
      ]);
      toast({ title: "Trimis elevului", description: s.name });
    } catch (e) {
      toast({
        title: "Eroare la trimitere elev",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />{" "}
            {event?.id ? "Gestionează test" : "Adaugă test"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "save"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("save")}
          >
            📅 Salvează
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "send"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab("send")}
          >
            📤 Trimite elevilor
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-auto">
          {tab === "save" && (
            <div className="space-y-4">
              <Input
                placeholder="Denumire test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option>Română</option>
                <option>Matematică</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                >
                  <option value={0}>Clasa pregătitoare</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                    <option key={g} value={g}>
                      Clasa {roman(g)}
                    </option>
                  ))}
                </Select>
                <Select
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                >
                  {["", "A", "B", "C", "D", "E"].map((l) => (
                    <option key={l} value={l}>
                      {l ? `Litera ${l}` : "— fără literă —"}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                placeholder="Competență"
                value={competence}
                onChange={(e) => setCompetence(e.target.value)}
              />
              <Input
                placeholder="Nume profesor"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <TextArea
                placeholder="Descriere"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {/* Select clasă obligatoriu la salvare */}
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Selectează clasa</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {tab === "send" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={loadingClasses}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Btn
                  variant="outline"
                  onClick={() => loadStudents(selectedClassId)}
                  disabled={!selectedClassId || loadingStudents}
                >
                  <RefreshCcw className="w-4 h-4" /> Reîncarcă elevii
                </Btn>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    Elevi –{" "}
                    {classes.find((c) => c.id === selectedClassId)?.label ||
                      "—"}
                  </div>
                  <Btn onClick={sendToClass}>
                    <Send className="w-4 h-4" /> Trimite clasei
                  </Btn>
                </div>
                <div className="mt-2 max-h-56 overflow-auto space-y-1">
                  {loadingStudents && (
                    <div className="text-sm text-gray-500">
                      Se încarcă elevii…
                    </div>
                  )}
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between text-sm rounded-lg px-2 py-1 hover:bg-gray-50"
                    >
                      <span>
                        {s.name} • {s.email}
                      </span>
                      <button
                        onClick={() => sendToStudent(s)}
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        Trimite elevului
                      </button>
                    </div>
                  ))}
                  {!loadingStudents && students.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Nu sunt elevi înregistrați.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 gap-2">
          <Btn variant="outline" onClick={onClose}>
            Anulează
          </Btn>
          {event?.id && (
            <Btn variant="danger" onClick={handleDeleteClick}>
              🗑️ Șterge test
            </Btn>
          )}
          {tab === "save" && (
            <Btn onClick={handleSaveClick} disabled={!canSave || saving}>
              <Save className="w-4 h-4" />{" "}
              {saving ? "Se salvează…" : "Salvează"}
            </Btn>
          )}
        </div>
      </motion.div>
    </div>
  );
}

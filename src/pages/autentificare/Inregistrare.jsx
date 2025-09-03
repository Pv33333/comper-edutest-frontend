// src/pages/autentificare/Inregistrare.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import PasswordInput from "@/components/PasswordInput";

function dash(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "profesor":
      return "/profesor/dashboard";
    case "parinte":
      return "/parinte/dashboard";
    case "elev":
      return "/elev/dashboard";
    default:
      return "/";
  }
}

const ROLES = ["elev", "parinte", "profesor"]; // nu includem admin în UI

export default function Inregistrare() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onboarding = params.get("onboarding") === "1";
  const nextParam = params.get("next");
  const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : null;

  const [role, setRole] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [checking, setChecking] = useState(onboarding);
  const [checkingAdmin, setCheckingAdmin] = useState(onboarding);
  const [msg, setMsg] = useState({ ok: "", err: "" });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    prenume: "",
    nume: "",
    birthdate: "",
    username: "",
    email: "",
    parola: "",
    confirmParola: "",
    telefon: "",
    judet: "",
    oras: "",
    scoala: "",
    clasa: "",
    litera: "",
    tipProfesor: "",
  });

  const isElev = role === "elev";
  const isParinte = role === "parinte";
  const isProfesor = role === "profesor";
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const onChange = (e) => setF(e.target.name, e.target.value);

  // liste demo (poți înlocui cu surse reale)
  const judete = useMemo(
    () => [
      "Alba",
      "Arad",
      "Argeș",
      "Bacău",
      "Bihor",
      "Bistrița-Năsăud",
      "Botoșani",
      "Brașov",
      "Brăila",
      "București",
      "Buzău",
      "Caraș-Severin",
      "Cluj",
      "Constanța",
      "Covasna",
      "Dâmbovița",
      "Dolj",
      "Galați",
      "Giurgiu",
      "Gorj",
      "Harghita",
      "Hunedoara",
      "Ialomița",
      "Iași",
      "Ilfov",
      "Maramureș",
      "Mehedinți",
      "Mureș",
      "Neamț",
      "Olt",
      "Prahova",
      "Satu Mare",
      "Sălaj",
      "Sibiu",
      "Suceava",
      "Teleorman",
      "Timiș",
      "Tulcea",
      "Vaslui",
      "Vâlcea",
      "Vrancea",
    ],
    []
  );
  const localitatiDemo = useMemo(
    () => [
      "București",
      "Cluj-Napoca",
      "Iași",
      "Timișoara",
      "Brașov",
      "Constanța",
      "Ploiești",
      "Galați",
      "Oradea",
      "Sibiu",
      "Arad",
      "Bacău",
      "Craiova",
      "Brăila",
      "Botoșani",
      "Suceava",
      "Baia Mare",
      "Buzău",
      "Piatra Neamț",
    ],
    []
  );
  const scoliDemo = useMemo(
    () => [
      "Școala Gimnazială Nr. 1",
      "Școala Gimnazială Nr. 2",
      "Liceul Teoretic Demo",
      "Colegiul Național Demo",
      "Școala Centrală",
      "Școala Ion Creangă",
      "Școala George Coșbuc",
      "Colegiul Pedagogic",
      "Școala Avram Iancu",
      "Liceul Sportiv",
    ],
    []
  );

  // 🟢 Onboarding: protecție admin + încărcăm emailul sesiunii și profilul existent
  useEffect(() => {
    if (!onboarding) return;

    (async () => {
      try {
        // Important: token proaspăt (reflectă app_metadata din dashboard/SQL)
        try {
          await supabase.auth.refreshSession();
        } catch {}
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setChecking(false);
          setCheckingAdmin(false);
          return navigate("/autentificare/login", { replace: true });
        }

        setSessionEmail(user.email || "");

        const metaRole =
          user.app_metadata?.role || user.user_metadata?.role || null;

        // 👑 Admin NU intră în onboarding
        if (metaRole === "admin") {
          try {
            localStorage.setItem("metaRole", "admin");
          } catch {}
          setChecking(false);
          setCheckingAdmin(false);
          return navigate(safeNext || "/admin/dashboard", { replace: true });
        }

        // Citim profilul existent (dacă există) să preumplem câmpurile
        const { data: prof } = await supabase
          .from("profiles")
          .select(
            "role, prenume, nume, username, judet, oras, scoala, clasa, litera, tip_profesor, telefon, birthdate"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          setForm((s) => ({
            ...s,
            prenume: prof.prenume || s.prenume,
            nume: prof.nume || s.nume,
            username: prof.username || s.username,
            judet: prof.judet || s.judet,
            oras: prof.oras || s.oras,
            scoala: prof.scoala || s.scoala,
            clasa: prof.clasa || s.clasa,
            litera: prof.litera || s.litera,
            tipProfesor: prof.tip_profesor || s.tipProfesor,
            telefon: prof.telefon || s.telefon,
            birthdate: prof.birthdate || s.birthdate,
          }));
          if (prof.role && ROLES.includes(prof.role)) setRole(prof.role);

          // dacă profilul e complet → sari direct la dashboard
          const isComplete =
            prof.role &&
            prof.username &&
            prof.prenume &&
            prof.nume &&
            ROLES.includes(prof.role);
          if (isComplete) {
            setChecking(false);
            setCheckingAdmin(false);
            return navigate(safeNext || dash(prof.role), { replace: true });
          }
        }

        setChecking(false);
        setCheckingAdmin(false);
      } catch {
        setChecking(false);
        setCheckingAdmin(false);
      }
    })();
  }, [onboarding, navigate, safeNext]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });

    if (!ROLES.includes(role))
      return setMsg({
        err: "Selectează un rol (elev / părinte / profesor).",
        ok: "",
      });
    if (!form.username)
      return setMsg({ err: "Completează username-ul.", ok: "" });
    if (!form.prenume || !form.nume)
      return setMsg({ err: "Completează prenume și nume.", ok: "" });

    // reguli doar pentru înregistrare clasică
    if (!onboarding) {
      if (!form.email) return setMsg({ err: "Completează emailul.", ok: "" });
      if (form.parola.length < 6)
        return setMsg({
          err: "Parola trebuie să aibă minim 6 caractere.",
          ok: "",
        });
      if (form.parola !== form.confirmParola)
        return setMsg({ err: "Parolele nu coincid.", ok: "" });
    }

    try {
      setLoading(true);

      if (onboarding) {
        // user existent prin Google
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesiune invalidă.");

        // NU scriem 'admin' în profiles.role (nici nu apare în UI)
        const writeRole = ROLES.includes(role) ? role : null;

        // 1) metadata user (persistăm câmpurile în user_metadata)
        await supabase.auth.updateUser({
          data: {
            role: writeRole,
            prenume: form.prenume,
            nume: form.nume,
            birthdate: form.birthdate,
            username: form.username.toLowerCase(),
            telefon: isParinte || isProfesor ? form.telefon : null,
            judet: form.judet,
            oras: form.oras,
            scoala: form.scoala,
            clasa: isElev ? form.clasa : null,
            litera: isElev ? form.litera : null,
            tipProfesor: isProfesor ? form.tipProfesor : null,
          },
        });

        // 2) profil DB
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          role: writeRole, // niciodată 'admin'
          username: form.username,
          prenume: form.prenume,
          nume: form.nume,
          birthdate: form.birthdate,
          telefon: isParinte || isProfesor ? form.telefon : null,
          judet: form.judet || null,
          oras: form.oras || null,
          scoala: form.scoala || null,
          clasa: isElev ? form.clasa || null : null,
          litera: isElev ? form.litera || null : null,
          tip_profesor: isProfesor ? form.tipProfesor || null : null,
        });

        try {
          await supabase.auth.refreshSession();
        } catch {}
        try {
          localStorage.setItem("metaRole", writeRole || "elev");
        } catch {}

        return navigate(safeNext || dash(writeRole || "elev"), {
          replace: true,
        });
      }

      // înregistrare clasică (email/parolă)
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.parola,
        options: {
          data: {
            role,
            prenume: form.prenume,
            nume: form.nume,
            birthdate: form.birthdate,
            username: form.username.toLowerCase(),
            telefon: isParinte || isProfesor ? form.telefon : null,
            judet: form.judet,
            oras: form.oras,
            scoala: form.scoala,
            clasa: isElev ? form.clasa : null,
            litera: isElev ? form.litera : null,
            tipProfesor: isProfesor ? form.tipProfesor : null,
          },
        },
      });

      if (error) throw error;

      setMsg({
        ok: "Cont creat! Verifică emailul pentru confirmare.",
        err: "",
      });
      setTimeout(() => navigate("/autentificare/login"), 1800);
    } catch (err) {
      setMsg({ ok: "", err: err?.message || "Eroare la înregistrare." });
    } finally {
      setLoading(false);
    }
  };

  if (checking || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="opacity-70">Se pregătește formularul…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(79,70,229,0.08),transparent)]">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm bg-white/80 hover:bg-white backdrop-blur shadow transition"
          >
            ⟵ Înapoi la pagina principală
          </Link>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur p-6 shadow-xl max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-indigo-900">
              {onboarding ? "👋 Completează profilul" : "📝 Înregistrare"}
            </h1>
            <p className="text-sm text-gray-600">
              {onboarding
                ? "Finalizează contul creat prin Google."
                : "Creează un cont nou pe ComperEduTest."}
            </p>
          </div>

          {msg.err && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
              {msg.err}
            </div>
          )}
          {msg.ok && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm text-center">
              {msg.ok}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            {/* Email info doar la onboarding */}
            {onboarding && (
              <p className="text-sm text-gray-600 bg-gray-50 border rounded-xl px-3 py-2">
                Te-ai autentificat cu{" "}
                <strong>{sessionEmail || "cont Google"}</strong>
              </p>
            )}

            {/* Rol */}
            <select
              className="p-2 border rounded-xl w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Selectează rolul</option>
              <option value="elev">Elev</option>
              <option value="parinte">Părinte</option>
              <option value="profesor">Profesor</option>
            </select>

            {/* Prenume + Nume */}
            <div className="grid grid-cols-2 gap-4">
              <input
                className="p-2 border rounded-xl w-full"
                name="prenume"
                placeholder="👤 Prenume"
                required
                onChange={onChange}
                value={form.prenume}
              />
              <input
                className="p-2 border rounded-xl w-full"
                name="nume"
                placeholder="👤 Nume"
                required
                onChange={onChange}
                value={form.nume}
              />
            </div>

            {/* Username */}
            <input
              className="p-2 border rounded-xl w-full"
              name="username"
              placeholder="👤 Username"
              required
              onChange={onChange}
              value={form.username}
            />

            {/* Înregistrare clasică: email + parole */}
            {!onboarding && (
              <>
                <input
                  className="p-2 border rounded-xl w-full"
                  name="email"
                  type="email"
                  placeholder="✉️ Email"
                  required
                  onChange={onChange}
                  value={form.email}
                />
                <PasswordInput
                  label="Parolă"
                  value={form.parola}
                  onChange={(e) => setF("parola", e.target.value)}
                  showStrength
                />
                <PasswordInput
                  label="Confirmă parola"
                  value={form.confirmParola}
                  onChange={(e) => setF("confirmParola", e.target.value)}
                />
              </>
            )}

            {/* Data nașterii */}
            <input
              className="p-2 border rounded-xl w-full"
              name="birthdate"
              type="date"
              required
              onChange={onChange}
              value={form.birthdate}
            />

            {/* Telefon pentru părinte/profesor */}
            {(isParinte || isProfesor) && (
              <input
                className="p-2 border rounded-xl w-full"
                name="telefon"
                placeholder="📞 Telefon"
                onChange={onChange}
                value={form.telefon}
              />
            )}

            {/* Date școală */}
            <select
              className="p-2 border rounded-xl w-full"
              value={form.judet}
              onChange={(e) => setF("judet", e.target.value)}
            >
              <option value="">🏙 Județ</option>
              {judete.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            <select
              className="p-2 border rounded-xl w-full"
              value={form.oras}
              onChange={(e) => setF("oras", e.target.value)}
            >
              <option value="">🏙 Oraș</option>
              {localitatiDemo.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <select
              className="p-2 border rounded-xl w-full"
              value={form.scoala}
              onChange={(e) => setF("scoala", e.target.value)}
            >
              <option value="">🏫 Școala</option>
              {scoliDemo.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Clasă + Literă pentru elev */}
            {isElev && (
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="p-2 border rounded-xl w-full"
                  name="clasa"
                  onChange={onChange}
                  value={form.clasa}
                >
                  <option value="">Clasa</option>
                  {[
                    "I",
                    "II",
                    "III",
                    "IV",
                    "V",
                    "VI",
                    "VII",
                    "VIII",
                    "IX",
                    "X",
                    "XI",
                    "XII",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className="p-2 border rounded-xl w-full"
                  name="litera"
                  onChange={onChange}
                  value={form.litera}
                >
                  <option value="">Litera</option>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tip profesor */}
            {isProfesor && (
              <select
                className="p-2 border rounded-xl w-full"
                name="tipProfesor"
                onChange={onChange}
                value={form.tipProfesor}
              >
                <option value="">Tip profesor</option>
                <option value="primar">Primar I–IV</option>
                <option value="gimnazial">Gimnazial V–VIII</option>
                <option value="liceal">Liceal IX–XII</option>
              </select>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-4 py-2 w-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60"
            >
              {loading
                ? "Se salvează…"
                : onboarding
                ? "✔️ Continuă"
                : "✔️ Creează cont"}
            </button>
          </form>

          {!onboarding && (
            <div className="text-center mt-6">
              <Link
                className="text-indigo-700 hover:underline"
                to="/autentificare/login"
              >
                🔐 Ai deja cont? Autentifică-te
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

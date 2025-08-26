// src/pages/autentificare/Inregistrare.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "@/components/PasswordInput";
import { useAuthContext } from "@/context/SupabaseAuthProvider.jsx";

export default function Inregistrare() {
  const navigate = useNavigate();
  const { signUpWithPassword } = useAuthContext();

  const [role, setRole] = useState("");
  const [msg, setMsg] = useState({ ok: "", err: "" });
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

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "" });

    if (!role) return setMsg({ ok: "", err: "Selectează un rol." });
    if (!form.username)
      return setMsg({ ok: "", err: "Completează username-ul." });
    if (form.parola !== form.confirmParola)
      return setMsg({ ok: "", err: "Parolele nu coincid." });

    try {
      const { error } = await signUpWithPassword({
        email: form.email.trim(),
        password: form.parola,
        metadata: {
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
      });
      if (error)
        return setMsg({
          ok: "",
          err: error.message || "Eroare la creare cont.",
        });

      setMsg({
        ok: "Cont creat! Verifică emailul pentru confirmare.",
        err: "",
      });
      setTimeout(() => navigate("/autentificare/login"), 1000);
    } catch (e2) {
      setMsg({ ok: "", err: e2?.message || "A apărut o eroare." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Înregistrare</h1>
          <p className="text-gray-600">
            Creează un cont nou pe <strong>ComperEduTest</strong>.
          </p>
        </div>

        {msg.err && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {msg.err}
          </div>
        )}
        {msg.ok && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm">
            {msg.ok}
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {/* Rol */}
          <select
            className="border rounded-md p-2 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Selectează rolul</option>
            <option value="elev">Elev</option>
            <option value="parinte">Părinte</option>
            <option value="profesor">Profesor</option>
            <option value="admin">Admin</option>
          </select>

          {/* Prenume + Nume */}
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border rounded-md p-2 w-full"
              name="prenume"
              placeholder="👤 Prenume"
              required
              onChange={onChange}
            />
            <input
              className="border rounded-md p-2 w-full"
              name="nume"
              placeholder="👤 Nume"
              required
              onChange={onChange}
            />
          </div>

          {/* Data nașterii */}
          <input
            className="border rounded-md p-2 w-full"
            name="birthdate"
            type="date"
            required
            onChange={onChange}
          />

          {/* Username + Email */}
          <input
            className="border rounded-md p-2 w-full"
            name="username"
            placeholder="👤 Username"
            required
            onChange={onChange}
          />
          <input
            className="border rounded-md p-2 w-full"
            name="email"
            type="email"
            placeholder="✉️ Email"
            required
            onChange={onChange}
          />

          {/* Parolă + Confirmare */}
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

          {/* Telefon (părinte/profesor) */}
          {(isParinte || isProfesor) && (
            <input
              className="border rounded-md p-2 w-full"
              name="telefon"
              placeholder="📞 Telefon"
              onChange={onChange}
            />
          )}

          {/* Date școală (comune) */}
          {(isElev || isParinte || isProfesor) && (
            <>
              <select
                className="border rounded-md p-2 w-full"
                name="judet"
                required
                onChange={onChange}
              >
                <option value="">Selectează județul</option>
                <option>București</option>
                <option>Cluj</option>
                <option>Iași</option>
                <option>Timiș</option>
              </select>
              <select
                className="border rounded-md p-2 w-full"
                name="oras"
                required
                onChange={onChange}
              >
                <option value="">Selectează localitatea</option>
                <option>București</option>
                <option>Cluj-Napoca</option>
                <option>Iași</option>
                <option>Timișoara</option>
              </select>
              <select
                className="border rounded-md p-2 w-full"
                name="scoala"
                required
                onChange={onChange}
              >
                <option value="">Selectează școala</option>
                <option>Școala Gimnazială Nr. 1</option>
                <option>Colegiul Național</option>
                <option>Liceul Teoretic</option>
              </select>
              <Link
                className="text-sm text-blue-600 hover:underline block text-right"
                to="/autentificare/formular-scoala"
              >
                ❓ Nu găsești școala? Trimite-ne mesaj!
              </Link>
            </>
          )}

          {/* Clasă + Literă (elev) */}
          {isElev && (
            <div className="grid grid-cols-2 gap-4">
              <select
                className="border rounded-md p-2 w-full"
                name="clasa"
                onChange={onChange}
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
                className="border rounded-md p-2 w-full"
                name="litera"
                onChange={onChange}
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
              className="border rounded-md p-2 w-full"
              name="tipProfesor"
              onChange={onChange}
            >
              <option value="">Selectează tipul</option>
              <option value="primar">Primar I–IV</option>
              <option value="gimnazial">Gimnazial V–VIII</option>
              <option value="liceal">Liceal IX–XII</option>
            </select>
          )}

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl w-full"
            type="submit"
          >
            ✔️ Creează cont
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            className="text-blue-600 hover:underline"
            to="/autentificare/login"
          >
            🔐 Înapoi la autentificare
          </Link>
        </div>
      </div>
    </main>
  );
}

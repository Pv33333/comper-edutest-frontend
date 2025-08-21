import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function GestionareUtilizatori() {
  const initialUsers = [
    { nume: "Dumitrescu", prenume: "Vlad", email: "vlad.dumitrescu@scoala.ro", rol: "Profesor", scoala: "Școala Nr. 3", oras: "București", judet: "București", active: false },
    { nume: "Popescu", prenume: "Andrei", email: "andrei.popescu@scoala.ro", rol: "Profesor", scoala: "Școala Nr. 3", oras: "Cluj-Napoca", judet: "Cluj", active: true },
    { nume: "Vasilescu", prenume: "Ion", email: "ion.vasilescu@scoala.ro", rol: "Parinte", scoala: "Liceul Teoretic Avram Iancu", oras: "Brașov", judet: "Brașov", active: false },
    { nume: "Tudor", prenume: "Daria", email: "daria.tudor@scoala.ro", rol: "Elev", scoala: "Liceul Teoretic Avram Iancu", oras: "Brașov", judet: "Brașov", active: true }
  ];

  const [users, setUsers] = useState([]);
  const [currentRole, setCurrentRole] = useState("Elev");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      localStorage.setItem("admin_users", JSON.stringify(initialUsers));
      setUsers(initialUsers);
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("admin_users", JSON.stringify(updatedUsers));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.rol === currentRole &&
      (u.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.prenume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUser = (email) => {
    const updated = users.map((u) =>
      u.email === email ? { ...u, active: !u.active } : u
    );
    saveUsers(updated);
  };

  const deleteUser = (email) => {
    if (window.confirm("Ștergi acest utilizator?")) {
      const updated = users.filter((u) => u.email !== email);
      saveUsers(updated);
    }
  };

  const resetPassword = (email) => {
    alert("Resetare parolă pentru " + email);
  };

  const addUser = () => {
    const nume = prompt("Nume:");
    const prenume = prompt("Prenume:");
    const email = prompt("Email:");
    const scoala = prompt("Școala:");
    if (nume && prenume && email && scoala) {
      const newUser = {
        nume,
        prenume,
        email,
        rol: currentRole,
        scoala,
        active: true
      };
      const updated = [...users, newUser];
      saveUsers(updated);
    }
  };

  return (
    <div className="-50 text-gray-900 min-h-screen px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">👥 Gestionare Utilizatori</h1>
        <Link
          to="/admin/dashboard"
          className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
        >
          ⬅ Înapoi la Dashboard Admin
        </Link>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setCurrentRole("Elev")}
            className={`rounded-xl px-4 py-2 shadow-sm text-white ${currentRole === "Elev" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-700"}`}
          >
            Elevi
          </button>
          <button
            onClick={() => setCurrentRole("Profesor")}
            className={`rounded-xl px-4 py-2 shadow-sm text-white ${currentRole === "Profesor" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-700"}`}
          >
            Profesori
          </button>
          <button
            onClick={() => setCurrentRole("Parinte")}
            className={`rounded-xl px-4 py-2 shadow-sm text-white ${currentRole === "Parinte" ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-700"}`}
          >
            Părinți
          </button>
        </div>
        <button
          onClick={addUser}
          className="hover:bg-blue-700 rounded-xl px-4 text-white bg-blue-500 shadow-sm py-2"
        >
          ➕ Adaugă utilizator
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Caută după nume sau email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border rounded-md border-gray-300 w-full mb-6"
      />

      {/* Active List */}
      <section className="mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">✅ Utilizatori Activi</h2>
        <ul className="space-y-2">
          {filteredUsers.filter((u) => u.active).map((u) => (
            <li
              key={u.email}
              className="bg-white px-4 py-3 rounded shadow flex justify-between items-center"
            >
              <div>
                <strong>{u.nume} {u.prenume}</strong><br />
                <span className="text-sm text-gray-500">{u.email} | {u.rol} | {u.scoala}</span>
              </div>
              <div className="space-x-2">
                <button onClick={() => resetPassword(u.email)} className="text-blue-600">🔄</button>
                <button onClick={() => toggleUser(u.email)} className="text-yellow-600">🚫</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Inactive List */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">🚫 Utilizatori Inactivi</h2>
        <ul className="space-y-2">
          {filteredUsers.filter((u) => !u.active).map((u) => (
            <li
              key={u.email}
              className="bg-gray-100 px-4 py-3 rounded shadow flex justify-between items-center"
            >
              <div>
                <strong>{u.nume} {u.prenume}</strong><br />
                <span className="text-sm text-gray-500">{u.email} | {u.rol} | {u.scoala}</span>
              </div>
              <div className="space-x-2">
                <button onClick={() => toggleUser(u.email)} className="text-green-600">✅</button>
                <button onClick={() => deleteUser(u.email)} className="text-red-600">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

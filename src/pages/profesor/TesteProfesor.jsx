// ✅ TesteProfesor.jsx 
import React, { useEffect, useState } from "react";
import TestCard from "../../components/TestCard";
import { Link, useNavigate } from "react-router-dom";
import DateTimePicker from "../../components/DateTimePicker";

const TesteProfesor = () => {
  const [teste, setTeste] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const toate = JSON.parse(localStorage.getItem("teste_profesor") || "[]");
    setTeste(toate);
  }, []);

  const modificaTest = (id) => {
    navigate(`/profesor/creare-test?id=${id}`);
  };

  const stergeTest = (index) => {
    if (confirm("Ești sigur că vrei să ștergi acest test?")) {
      const updated = [...teste];
      updated.splice(index, 1);
      setTeste(updated);
      localStorage.setItem("teste_profesor", JSON.stringify(updated));
    }
  };

  const trimiteLaElev = (test) => {
    const primite = JSON.parse(localStorage.getItem("teste_primite") || "[]");
    const deja = primite.find(t => t.id === test.id);
    if (!deja) {
      primite.push(test);
      localStorage.setItem("teste_primite", JSON.stringify(primite));
    }
    navigate(`/profesor/elevi?testId=${test.id}`);
  };

  const trimiteLaAdmin = (test) => {
    const actualizat = teste.map(t =>
      t.id === test.id ? { ...t, status: "in_asteptare" } : t
    );
    setTeste(actualizat);
    localStorage.setItem("teste_profesor", JSON.stringify(actualizat));
    alert("✅ Testul a fost trimis spre validare admin.");
  };

  const deschideCalendar = (test) => {
    setSelectedTest(test);
    setModalOpen(true);
  };

  const salveazaInCalendar = ({ date, time, subject, desc }) => {
    const toate = JSON.parse(localStorage.getItem("tests_from_prof") || "[]");
    const complet = {
      ...selectedTest,
      date: date,
      time: time,
      subject: subject,
      desc: desc,
      prof: true,
      confirmed: false
    };
    toate.push(complet);
    localStorage.setItem("tests_from_prof", JSON.stringify(toate));
    setModalOpen(false);
    alert("📅 Test programat în calendar.");
    navigate("/profesor/calendar");
  };

  return (
    <div className="-50 min-h-screen py-10 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/profesor/dashboard" className="text-blue-600 hover:underline text-sm">← Înapoi la Dashboard</Link>
          <Link to="/profesor/creare-test" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow transition text-sm">➕ Creează test nou</Link>
        </div>

        <h1 className="text-3xl font-bold text-blue-900 text-center">📋 Testele Profesorului</h1>

        {teste.length === 0 ? (
          <p className="text-center text-gray-500">Nu ai creat încă niciun test.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teste.map((test, index) => (
              <TestCard
                key={test.id}
                test={test}
                onModifica={() => modificaTest(test.id)}
                onSterge={() => stergeTest(index)}
                onTrimiteElevului={() => trimiteLaElev(test)}
                onTrimiteAdminului={() => trimiteLaAdmin(test)}
                onProgrameaza={() => deschideCalendar(test)}
              />
            ))}
          </div>
        )}

        {modalOpen && (
          <DateTimePicker
            onConfirm={salveazaInCalendar}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TesteProfesor;

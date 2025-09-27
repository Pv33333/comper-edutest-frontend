import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Printer,
  Download,
  Copy,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AdeverintaProfesor = () => {
  const [selected, setSelected] = useState(null);
  const adeverintaRef = useRef(null);

  const dataAzi = new Date().toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const [fields, setFields] = useState({
    nume: "Ionescu Mihai",
    scoala: "Școala Gimnazială nr. 3, București",
    motiv: "pentru implicarea și coordonarea elevilor în competițiile Comper",
    emitent: "Ministerul Educației",
  });

  // Export functions
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && adeverintaRef.current) {
      printWindow.document.write(`
        <html>
          <head><title>${selected?.title}</title></head>
          <body>${adeverintaRef.current.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportPNG = async () => {
    if (!adeverintaRef.current) return;
    const canvas = await html2canvas(adeverintaRef.current);
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${selected?.title || "adeverinta"}.png`;
    link.click();
  };

  const handleExportPDF = async () => {
    if (!adeverintaRef.current) return;
    const canvas = await html2canvas(adeverintaRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${selected?.title || "adeverinta"}.pdf`);
  };

  const handleCopy = () => {
    const text = `
    ${selected?.title}
    Se acordă profesorului ${fields.nume},
    de la ${fields.scoala},
    ${fields.motiv}.
    Emitent: ${fields.emitent}
    Data: ${dataAzi}
    `;
    navigator.clipboard.writeText(text);
    alert("Textul adeverinței a fost copiat!");
  };

  // Lista carduri adeverințe
  const adeverinte = [
    {
      id: "activitate",
      title: "Adeverință de Activitate",
      desc: "Certifică activitatea desfășurată în cadrul competițiilor Comper",
      icon: <FileText size={28} className="text-indigo-600" />,
    },
    {
      id: "coordonare",
      title: "Adeverință de Coordonare",
      desc: "Se acordă profesorilor pentru coordonarea elevilor în cadrul testelor",
      icon: <ClipboardList size={28} className="text-emerald-600" />,
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white text-blue-900 font-sans flex flex-col">
      {/* Buton Înapoi */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <Link
          to="/profesor/dashboard"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm bg-white/80 backdrop-blur shadow hover:shadow-lg transition"
        >
          <ArrowLeft size={18} /> Înapoi la Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-blue-900 mt-4">
          📜 Adeverințe Profesor
        </h1>
      </div>

      {/* Dacă nu e selectată adeverință → arătăm cardurile */}
      {!selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 pb-12">
          {adeverinte.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className="cursor-pointer rounded-2xl border bg-white p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              {a.icon}
              <h2 className="mt-4 text-lg font-bold text-blue-900">
                {a.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{a.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dacă e selectată adeverință → arătăm preview A4 */}
      {selected && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 space-y-6">
          <div
            ref={adeverintaRef}
            className="bg-white shadow-2xl rounded-xl mx-auto p-10 border max-w-3xl aspect-[1/1.4] relative overflow-hidden"
            style={{ fontFamily: "serif" }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-white to-indigo-100 opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-wide">
                {selected.title}
              </h2>
              <p className="text-lg text-gray-700 mb-4 text-center">
                Se acordă profesorului
              </p>
              <input
                value={fields.nume}
                onChange={(e) => setFields({ ...fields, nume: e.target.value })}
                className="w-full text-2xl font-bold text-indigo-700 text-center border-b border-indigo-300 focus:outline-none mb-6"
              />
              <p className="text-center text-gray-700 mb-2">de la</p>
              <input
                value={fields.scoala}
                onChange={(e) =>
                  setFields({ ...fields, scoala: e.target.value })
                }
                className="w-full text-lg text-center border-b border-indigo-300 focus:outline-none mb-6"
              />
              <p className="text-center text-gray-700 mb-2">pentru</p>
              <textarea
                value={fields.motiv}
                onChange={(e) =>
                  setFields({ ...fields, motiv: e.target.value })
                }
                className="w-full text-lg italic text-center border-b border-indigo-300 focus:outline-none mb-6 resize-none"
                rows={2}
              />
              <div className="flex justify-between mt-12 px-6 text-sm text-gray-700">
                <span>Data: {dataAzi}</span>
                <span>Emitent: {fields.emitent}</span>
              </div>
              <div className="flex justify-end mt-8 pr-6">
                <span className="text-sm text-gray-600">
                  Semnătură / Ștampilă: __________
                </span>
              </div>
            </div>
          </div>

          {/* Acțiuni */}
          <div className="flex justify-center gap-4 mt-8 mb-8">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              <Printer size={18} /> Print
            </button>
            <button
              onClick={handleExportPNG}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} /> Export PNG
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={18} /> Export PDF
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2"
            >
              <Copy size={18} /> Copiază text
            </button>
          </div>
        </main>
      )}
    </div>
  );
};

export default AdeverintaProfesor;

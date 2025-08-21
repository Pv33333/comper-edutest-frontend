import React, { useEffect, useMemo } from "react";

export default function RaportRomana10() {
  const scor = useMemo(() => {
    const s = localStorage.getItem("scor_romana");
    return s ? parseInt(s) : null;
  }, []);

  const pdfHtml = useMemo(() => {
    return localStorage.getItem("pdf_romana_10") || "";
  }, []);

  useEffect(() => {
    // nothing extra for now
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📄 Raport – Limba Română (Clasa a IV-a)</h1>
      <p className="text-gray-700 mb-4">Scor: <strong>{scor ?? "–"}{scor != null ? "%" : ""}</strong></p>
      {pdfHtml ? (
        <div className="bg-white rounded-xl border p-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: pdfHtml }} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4">
          Nu există conținut salvat pentru raport (pdf_romana_10). Generează raportul din test.
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * ⚙️ Setări Platformă – versiune React
 * - Conversie fidelă din HTML → JSX
 * - Tailwind 100%
 * - Fără fetch header/footer; se integrează în layoutul existent al aplicației
 * - Toate interacțiunile sunt gestionate cu React state
 */
export default function SetariPlatforma() {
  const [activeTab, setActiveTab] = useState("institutie");
  const [notifVisible, setNotifVisible] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const notifTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const showNotif = () => {
    setNotifVisible(true);
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    notifTimeoutRef.current = setTimeout(() => setNotifVisible(false), 3000);
  };

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(url);
  };

  const onConfirmReset = () => {
    if (confirmText === "CONFIRM") {
      // Înlocuiește cu acțiunea reală de reset când backend-ul este disponibil
      alert("Platforma a fost resetată complet.");
      setConfirmText("");
    } else {
      alert("Scrie exact CONFIRM pentru a continua resetarea.");
    }
  };

  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={[
        "rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm",
        activeTab === id
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-white text-[#2E5AAC] hover:bg-blue-50 border border-blue-200"
      ].join(" ")}
      aria-selected={activeTab === id}
      aria-controls={`tab-${id}`}
      role="tab"
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header + Back */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">⚙️ Setări Platformă</h1>
          <Link
            to="/admin/dashboard"
            className="bg-white text-blue-700 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-300 hover:bg-blue-50 shadow-sm transition flex items-center gap-2"
          >
            ⬅ Înapoi la Dashboard Admin
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b pb-3" role="tablist" aria-label="Setări Platformă">
          <TabButton id="institutie">Instituție</TabButton>
          <TabButton id="functie">Funcționalități</TabButton>
          <TabButton id="securitate">Securitate</TabButton>
          <TabButton id="backup">Backup</TabButton>
        </div>

        {/* Notificare */}
        {notifVisible && (
          <div id="notif" className="bg-green-100 text-green-700 px-4 py-2 rounded">
            ✔️ Setările au fost salvate.
          </div>
        )}

        {/* Conținut taburi */}
        <section
          id="tab-institutie"
          role="tabpanel"
          hidden={activeTab !== "institutie"}
          className="space-y-4"
        >
          <h2 className="text-3xl font-semibold text-gray-800">🏫 Informații Instituție</h2>

          <input
            type="text"
            defaultValue="Comper Edu Test"
            className="p-2 border rounded-md border-gray-300 w-full"
          />

          <select className="w-full border px-4 py-2 rounded">
            <option>București</option>
            <option>Cluj</option>
            <option>Iași</option>
            <option>Brașov</option>
          </select>

          <input
            type="text"
            defaultValue="București"
            className="p-2 border rounded-md border-gray-300 w-full"
          />

          <input
            type="email"
            defaultValue="admin@comper.ro"
            className="p-2 border rounded-md border-gray-300 w-full"
          />

          <div>
            <input
              type="file"
              onChange={onLogoChange}
              className="p-2 border rounded-md border-gray-300 w-full"
            />
            {logoUrl && <img src={logoUrl} alt="Logo preview" className="h-20 mt-2" />}
          </div>

          <button onClick={showNotif} className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2">
            💾 Salvează
          </button>
        </section>

        <section
          id="tab-functie"
          role="tabpanel"
          hidden={activeTab !== "functie"}
          className="space-y-4"
        >
          <h2 className="text-3xl font-semibold text-gray-800">🧩 Funcționalități Platformă</h2>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span>Activare rol Elev</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span>Activare rol Profesor</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span>Activare rol Părinte</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span>Activare rol Admin</span>
          </label>

          <button onClick={showNotif} className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2">
            💾 Salvează
          </button>
        </section>

        <section
          id="tab-securitate"
          role="tabpanel"
          hidden={activeTab !== "securitate"}
          className="space-y-4"
        >
          <h2 className="text-3xl font-semibold text-gray-800">🔐 Politici de Securitate</h2>

          <label className="block text-sm">Lungime minimă parolă</label>
          <input
            type="number"
            min={6}
            defaultValue={8}
            className="p-2 border rounded-md border-gray-300 w-full"
          />

          <label className="flex items-center gap-3 mt-2">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <span>Resetare parolă la 90 zile</span>
          </label>

          <label className="block mt-2">Durată sesiune (minute)</label>
          <select className="w-full border px-4 py-2 rounded">
            <option>15</option>
            <option selected>30</option>
            <option>60</option>
          </select>

          <button onClick={showNotif} className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2">
            💾 Salvează
          </button>
        </section>

        <section
          id="tab-backup"
          role="tabpanel"
          hidden={activeTab !== "backup"}
          className="space-y-4"
        >
          <h2 className="text-3xl font-semibold text-gray-800">💾 Backup &amp; Resetare</h2>

          <button
            onClick={() => alert("Se va genera un fișier CSV cu toți utilizatorii și testele.")}
            className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2"
          >
            ⬇ Export date CSV
          </button>

          <button
            onClick={() => alert("Backup-ul a fost planificat automat să ruleze zilnic la ora 02:00.")}
            className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2"
          >
            🗓 Planificare backup
          </button>

          <div className="space-y-2">
            <input
              id="confirmReset"
              placeholder="Scrie CONFIRM pentru resetare"
              className="p-2 border rounded-md border-gray-300 w-full"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <button onClick={onConfirmReset} className="rounded-xl px-4 text-white bg-blue-500 hover:bg-blue-700 shadow-sm py-2">
              🧨 Resetare platformă
            </button>
            <p className="text-base text-gray-700">
              Această acțiune va șterge toate datele și va reseta platforma în starea inițială.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

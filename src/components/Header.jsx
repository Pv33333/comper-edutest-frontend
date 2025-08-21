import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";

const PUB = import.meta.env.BASE_URL || "/";
const logoHeader = `${PUB}assets/img/logo_comper_edutest.png`;

function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();

  // închide meniul la schimbare de rută
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  // blochează scroll pe body când e deschis
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onKey = useCallback((e) => { if (e.key === "Escape") setOpen(false); }, []);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const onClickOutside = useCallback((e) => {
    if (!open) return;
    if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
  }, [open]);
  useEffect(() => {
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClickOutside]);

  // prefetch pentru rute grele (la hover) – nu introduce dependențe circulare
  const prefetch = (loader) => () => { if (typeof loader === "function") loader(); };

  return (
    <header className="bg-gradient-to-r from-blue-100 via-white to-blue-100 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* bară: hamburger + logo + nav desktop */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* hamburger (mobil/tabletă) */}
            <button
              type="button"
              aria-label="Meniu"
              aria-controls="site-menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center lg:hidden rounded-xl border border-blue-200 px-3 py-2 min-h-[44px] min-w-[44px] hover:bg-blue-50 transition will-change-transform active:scale-[.98]"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <Link to="/" className="inline-flex items-center">
              <img src={logoHeader} alt="Comper EduTest" className="h-10 sm:h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* nav desktop – prefetch pe hover pentru rutele grele */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[#123E91] font-medium uppercase tracking-wide">
            <Link className="hover:underline underline-offset-4" to="/despre-noi">Despre noi</Link>
            <Link className="hover:underline underline-offset-4" to="/autentificare/login?rol=elev">Sunt Elev</Link>
            <Link className="hover:underline underline-offset-4" to="/autentificare/login?rol=parinte">Sunt Părinte</Link>
            <Link
              className="hover:underline underline-offset-4"
              to="/autentificare/login?rol=profesor"
              onMouseEnter={prefetch(() => import("@/pages/profesor/DashboardProfesor.jsx"))}
            >
              Sunt Profesor
            </Link>
            <Link className="hover:underline underline-offset-4" to="/contact">Contact</Link>
          </nav>
        </div>
      </div>

      {/* Drawer mobil */}
      <div aria-hidden={!open} className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        {/* overlay */}
        <div className={`absolute inset-0 bg-black/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        {/* panou */}
        <aside
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-[100svh] w-[92%] max-w-sm bg-white shadow-2xl transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="h-14 px-4 border-b border-blue-200 flex items-center justify-between bg-white">
            <span className="text-[15px] font-semibold text-[#123E91]">Meniu</span>
            <button className="rounded-lg border border-blue-200 px-3 py-2 text-[14px] hover:bg-blue-50" onClick={() => setOpen(false)}>
              Închide
            </button>
          </div>

          <nav className="p-4 space-y-3 text-[15px]">
            {[
              { to: "/despre-noi", label: "Despre noi" },
              { to: "/autentificare/login?rol=elev", label: "Sunt Elev" },
              { to: "/autentificare/login?rol=parinte", label: "Sunt Părinte" },
              { to: "/autentificare/login?rol=profesor", label: "Sunt Profesor", prefetch: () => import("@/pages/profesor/DashboardProfesor.jsx") },
              { to: "/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                onMouseEnter={prefetch(item.prefetch)}
                className="block px-4 py-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 active:scale-[.99] transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
export default memo(Header);

import React from "react";
import { Link } from "react-router-dom";

const PUB = import.meta.env.BASE_URL || "/";
const logoFooter = `${PUB}assets/img/logo_comper_footer.png`;
const anpcSal = `${PUB}assets/img/anpc-sal-1.webp`;
const odr = `${PUB}assets/img/sol.png`;

const iconFacebook = `${PUB}assets/icons/facebook.svg`;
const iconInstagram = `${PUB}assets/icons/instagram.svg`;
const iconTiktok = `${PUB}assets/icons/tiktok.svg`;
const iconYoutube = `${PUB}assets/icons/youtube.svg`;

/** Mobile-only Disclosure (pe md+ conținutul este mereu deschis) */
function MobileSection({ title, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden border-t border-white/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full py-4 flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className={`transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="pb-4 space-y-2 text-sm text-white/90">{children}</div>}
    </div>
  );
}

function DesktopSection({ title, children }) {
  return (
    <div className="hidden md:block">
      <div className="text-sm font-semibold text-white mb-3">{title}</div>
      <div className="space-y-2 text-sm text-white/90">{children}</div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#1C3C7B] text-white mt-8">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        {/* Top: logo + (pe desktop păstrăm ritmul pe grilă) */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Col logo */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <img
              src={logoFooter}
              alt="Logo COMPEREDUTEST"
              className="h-28 w-auto object-contain"
              loading="lazy"
            />
          </div>

          {/* Col Platformă */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3">
            <DesktopSection title="Platformă">
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/">Acasă</Link>
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/despre-noi">Despre noi</Link>
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/contact">Contact</Link>
            </DesktopSection>
          </div>

          {/* Col Legal */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3">
            <DesktopSection title="Legal">
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/politica-cookie">Politica cookie</Link>
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/politica-confidentialitate">Confidențialitate</Link>
              <Link className="block hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 rounded" to="/termeni-conditii">Termeni și condiții</Link>
            </DesktopSection>
          </div>

          {/* Col Social + ANPC */}
          <div className="col-span-12 md:col-span-2 lg:col-span-3">
            <DesktopSection title="Urmărește-ne">
              <div className="flex flex-wrap gap-3 mt-1 mb-3">
                {[
                  { alt: "Facebook", src: iconFacebook, href: "#" },
                  { alt: "Instagram", src: iconInstagram, href: "#" },
                  { alt: "TikTok", src: iconTiktok, href: "#" },
                  { alt: "YouTube", src: iconYoutube, href: "#" },
                ].map((s) => (
                  <a
                    key={s.alt}
                    aria-label={s.alt}
                    href={s.href}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring focus-visible:ring-white/30 transition"
                    target="_blank" rel="noopener noreferrer"
                  >
                    <img alt={s.alt} className="w-5 h-5" src={s.src} loading="lazy" />
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src={anpcSal}
                    alt="Soluționarea alternativă a litigiilor - ANPC"
                    className="h-10 object-contain hover:opacity-90 transition"
                    loading="lazy"
                  />
                </a>
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src={odr}
                    alt="Soluționarea online a litigiilor - ODR"
                    className="h-10 object-contain hover:opacity-90 transition"
                    loading="lazy"
                  />
                </a>
              </div>
            </DesktopSection>
          </div>
        </div>

        {/* Mobile accordion (aceleași secțiuni, păstrăm 1:1 conținutul) */}
        <div className="md:hidden mt-2">
          <MobileSection title="Platformă">
            <Link className="block hover:underline underline-offset-4" to="/">Acasă</Link>
            <Link className="block hover:underline underline-offset-4" to="/despre-noi">Despre noi</Link>
            <Link className="block hover:underline underline-offset-4" to="/contact">Contact</Link>
          </MobileSection>

          <MobileSection title="Legal">
            <Link className="block hover:underline underline-offset-4" to="/politica-cookie">Politica cookie</Link>
            <Link className="block hover:underline underline-offset-4" to="/politica-confidentialitate">Confidențialitate</Link>
            <Link className="block hover:underline underline-offset-4" to="/termeni-conditii">Termeni și condiții</Link>
          </MobileSection>

          <MobileSection title="Urmărește-ne">
            <div className="flex flex-wrap gap-3 mt-1 mb-3">
              <a aria-label="Facebook" href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 transition">
                <img alt="Facebook" className="w-5 h-5" src={iconFacebook} />
              </a>
              <a aria-label="Instagram" href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 transition">
                <img alt="Instagram" className="w-5 h-5" src={iconInstagram} />
              </a>
              <a aria-label="TikTok" href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 transition">
                <img alt="TikTok" className="w-5 h-5" src={iconTiktok} />
              </a>
              <a aria-label="YouTube" href="#" className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 hover:bg-white/10 transition">
                <img alt="YouTube" className="w-5 h-5" src={iconYoutube} />
              </a>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer" className="inline-flex">
                <img src={anpcSal} alt="Soluționarea alternativă a litigiilor - ANPC" className="h-10 object-contain hover:opacity-90 transition" />
              </a>
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="inline-flex">
                <img src={odr} alt="Soluționarea online a litigiilor - ODR" className="h-10 object-contain hover:opacity-90 transition" />
              </a>
            </div>
          </MobileSection>
        </div>

        {/* Slogan */}
        <div className="mx-auto max-w-4xl mt-8 px-4 font-bold py-4 text-center text-yellow-400">
          Platformă educațională ultramodernă pentru învățarea prin teste standard și pentru evaluarea progreselor învățării.
        </div>

        {/* Separator & Copyright */}
        <div className="mt-2 border-t border-white/15 pt-4 text-center text-white/80 text-sm">
          Parteneriat cu Fundația pentru Educație, Știință și Artă „FEDUSA” — Toate drepturile rezervate © {year}
        </div>
      </div>
    </footer>
  );
}

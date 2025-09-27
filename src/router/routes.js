// src/router/routes.js
import { lazy } from "react";

/* ====================== Public ====================== */
const Homepage = lazy(() => import("@/pages/Homepage.jsx"));
const DespreNoi = lazy(() => import("@/pages/DespreNoi.jsx"));
const Contact = lazy(() => import("@/pages/Contact.jsx"));
const Ghid = lazy(() => import("@/pages/Ghid.jsx"));
const Intrebari = lazy(() => import("@/pages/Intrebari.jsx"));
const PoliticaConfidentialitate = lazy(() =>
  import("@/pages/PoliticaConfidentialitate.jsx")
);
const PoliticaCookie = lazy(() => import("@/pages/PoliticaCookie.jsx"));
const TermeniConditii = lazy(() => import("@/pages/TermeniConditii.jsx"));
const DemoTeste = lazy(() => import("@/pages/DemoTeste.jsx"));
const TestRomanaIV_Curent = lazy(() =>
  import("@/pages/TestRomanaIV_Curent.jsx")
);
const TestMateIV_Curent = lazy(() => import("@/pages/TestMateIV_Curent.jsx"));
const Felicitare = lazy(() => import("@/pages/elev/Felicitare.jsx"));

/* ====================== Autentificare ====================== */
const Login = lazy(() => import("@/pages/autentificare/Login.jsx"));
const Inregistrare = lazy(() =>
  import("@/pages/autentificare/Inregistrare.jsx")
);
const FormularScoala = lazy(() =>
  import("@/pages/autentificare/FormularScoala.jsx")
);
const ReseteazaParola = lazy(() =>
  import("@/pages/autentificare/ReseteazaParola.jsx")
);
const PasswordResetCallback = lazy(() =>
  import("@/pages/autentificare/PasswordResetCallback.jsx")
);

/* ====================== Admin ====================== */
const DashboardAdmin = lazy(() => import("@/pages/admin/DashboardAdmin.jsx"));
const GestionareUtilizatori = lazy(() =>
  import("@/pages/admin/GestionareUtilizatori.jsx")
);
const AdministrareTeste = lazy(() =>
  import("@/pages/admin/AdministrareTeste.jsx")
);
const CreareTestAdmin = lazy(() => import("@/pages/admin/CreareTestAdmin.jsx"));
const StatisticiPlatforma = lazy(() =>
  import("@/pages/admin/StatisticiPlatforma.jsx")
);
const LoguriPlatforma = lazy(() => import("@/pages/admin/LoguriPlatforma.jsx"));
const AdministrarePlatforma = lazy(() =>
  import("@/pages/admin/AdministrarePlatforma.jsx")
);
const SetariPlatforma = lazy(() => import("@/pages/admin/SetariPlatforma.jsx"));

/* ====================== Profesor ====================== */
const DashboardProfesor = lazy(() =>
  import("@/pages/profesor/DashboardProfesor.jsx")
);
const CalendarProfesor = lazy(() =>
  import("@/pages/profesor/CalendarProfesor.jsx")
);
const CreareTest = lazy(() => import("@/pages/profesor/CreareTest.jsx"));
const EleviGestionare = lazy(() =>
  import("@/pages/profesor/EleviGestionare.jsx")
);
const ProfilProfesor = lazy(() =>
  import("@/pages/profesor/ProfilProfesor.jsx")
);
const TesteProfesor = lazy(() => import("@/pages/profesor/TesteProfesor.jsx"));
const TestePlatformaProfesor = lazy(() =>
  import("@/pages/profesor/TestePlatforma.jsx")
);
const TesteComperProfesor = lazy(() =>
  import("@/pages/profesor/TesteComperProfesor.jsx")
);
const RezultateElevi = lazy(() =>
  import("@/pages/profesor/RezultateElevi.jsx")
);
const RapoarteTestare = lazy(() =>
  import("@/pages/profesor/RapoarteTestare.jsx")
);
const RaportDetaliat = lazy(() =>
  import("@/pages/profesor/RaportDetaliat.jsx")
);
const TestRomana10Preview = lazy(() =>
  import("@/pages/profesor/TestRomana10Preview.jsx")
);
const TestMate10Preview = lazy(() =>
  import("@/pages/profesor/TestMate10Preview.jsx")
);
const AdeverintaProfesor = lazy(() =>
  import("@/pages/profesor/AdeverintaProfesor.jsx")
);

/* ====================== Elev ====================== */
const DashboardElev = lazy(() => import("@/pages/elev/DashboardElev.jsx"));
const TestePrimiteElev = lazy(() =>
  import("@/pages/elev/TestePrimiteElev.jsx")
);
const RapoarteElev = lazy(() => import("@/pages/elev/RapoarteElev.jsx"));
const FelicitarePremium = lazy(() =>
  import("@/pages/elev/FelicitarePremium.jsx")
);
const RevizuireMate10 = lazy(() =>
  import("@/pages/elev/revizuiri/RevizuireMate10.jsx")
);
const RevizuireRomana10 = lazy(() =>
  import("@/pages/elev/revizuiri/RevizuireRomana10.jsx")
);
const RaportMate10 = lazy(() =>
  import("@/pages/elev/rapoarte/RaportMate10.jsx")
);
const RaportRomana10 = lazy(() =>
  import("@/pages/elev/rapoarte/RaportRomana10.jsx")
);
const TestePlatformaElev = lazy(() =>
  import("@/pages/elev/TestePlatforma.jsx")
);
const TesteComperElev = lazy(() => import("@/pages/elev/TesteComper.jsx"));
const CalendarElev = lazy(() => import("@/pages/elev/CalendarElev.jsx"));
const DiplomeCertificari = lazy(() =>
  import("@/pages/elev/DiplomeCertificari.jsx")
);
const ProfilElev = lazy(() => import("@/pages/elev/ProfilElev.jsx"));
const ParinteSincronizatElev = lazy(() =>
  import("@/pages/elev/ParinteSincronizatElev.jsx")
);
// 👇 pagina pentru „începe testul”
const RezolvaTest = lazy(() => import("@/pages/elev/RezolvaTest.jsx"));

/* ====================== Părinte ====================== */
const DashboardParinte = lazy(() =>
  import("@/pages/parinte/DashboardParinte.jsx")
);
const CalendarParinte = lazy(() =>
  import("@/pages/parinte/CalendarParinte.jsx")
);
const ProfilParinte = lazy(() => import("@/pages/parinte/ProfilParinte.jsx"));
const ParinteSincronizat = lazy(() =>
  import("@/pages/parinte/ParinteSincronizat.jsx")
);
const TesteFinalizateParinte = lazy(() =>
  import("@/pages/parinte/TesteFinalizateParinte.jsx")
);
const RevizuireMate10Parinte = lazy(() =>
  import("@/pages/parinte/revizuiri/RevizuireMate10.jsx")
);
const RevizuireRomana10Parinte = lazy(() =>
  import("@/pages/parinte/revizuiri/RevizuireRomana10.jsx")
);
const RaportMate10Parinte = lazy(() =>
  import("@/pages/parinte/rapoarte/RaportMate10.jsx")
);
const RaportRomana10Parinte = lazy(() =>
  import("@/pages/parinte/rapoarte/RaportRomana10.jsx")
);
const RapoarteProgres = lazy(() =>
  import("@/pages/parinte/RapoarteProgres.jsx")
);

export const routes = [
  /* Public */
  { path: "/", el: Homepage, meta: { layout: "site" } },
  { path: "/despre-noi", el: DespreNoi, meta: { layout: "site" } },
  { path: "/contact", el: Contact, meta: { layout: "site" } },
  { path: "/ghid", el: Ghid, meta: { layout: "site" } },
  { path: "/intrebari", el: Intrebari, meta: { layout: "site" } },
  {
    path: "/politica-confidentialitate",
    el: PoliticaConfidentialitate,
    meta: { layout: "site" },
  },
  { path: "/politica-cookie", el: PoliticaCookie, meta: { layout: "site" } },
  { path: "/termeni-conditii", el: TermeniConditii, meta: { layout: "site" } },

  /* Demo Teste */
  { path: "/demo/teste", el: DemoTeste, meta: { layout: "site" } },
  {
    path: "/demo/romana-iv",
    el: TestRomanaIV_Curent,
    meta: { layout: "site" },
  },
  { path: "/demo/mate-iv", el: TestMateIV_Curent, meta: { layout: "site" } },
  { path: "/elev/felicitare", el: Felicitare, meta: { layout: "site" } },

  /* Autentificare */
  { path: "/autentificare/login", el: Login, meta: { layout: "site" } },
  {
    path: "/autentificare/inregistrare",
    el: Inregistrare,
    meta: { layout: "site" },
  },
  {
    path: "/autentificare/formular-scoala",
    el: FormularScoala,
    meta: { layout: "site" },
  },
  {
    path: "/autentificare/reseteaza-parola",
    el: ReseteazaParola,
    meta: { layout: "site" },
  },
  {
    path: "/autentificare/reset-callback",
    el: PasswordResetCallback,
    meta: { layout: "site" },
  },

  /* Admin */
  { path: "/admin/dashboard", el: DashboardAdmin, meta: { layout: "site" } },
  {
    path: "/admin/utilizatori",
    el: GestionareUtilizatori,
    meta: { layout: "site" },
  },
  { path: "/admin/teste", el: AdministrareTeste, meta: { layout: "site" } },
  { path: "/admin/creare-test", el: CreareTestAdmin, meta: { layout: "site" } },
  {
    path: "/admin/statistici",
    el: StatisticiPlatforma,
    meta: { layout: "site" },
  },
  { path: "/admin/loguri", el: LoguriPlatforma, meta: { layout: "site" } },
  {
    path: "/admin/administrare-platforma",
    el: AdministrarePlatforma,
    meta: { layout: "site" },
  },
  {
    path: "/admin/setari-platforma",
    el: SetariPlatforma,
    meta: { layout: "site" },
  },

  /* Profesor */
  {
    path: "/profesor/dashboard",
    el: DashboardProfesor,
    meta: { layout: "site" },
  },
  {
    path: "/profesor/calendar",
    el: CalendarProfesor,
    meta: { layout: "site" },
  },
  { path: "/profesor/creare-test", el: CreareTest, meta: { layout: "site" } },
  { path: "/profesor/elevi", el: EleviGestionare, meta: { layout: "site" } },
  {
    path: "/profesor/gestionare-elevi",
    el: EleviGestionare,
    meta: { layout: "site" },
  }, // alias
  { path: "/profesor/profil", el: ProfilProfesor, meta: { layout: "site" } },
  { path: "/profesor/teste", el: TesteProfesor, meta: { layout: "site" } },
  {
    path: "/profesor/teste-profesor",
    el: TesteProfesor,
    meta: { layout: "site" },
  }, // alias
  {
    path: "/profesor/teste-platforma",
    el: TestePlatformaProfesor,
    meta: { layout: "site" },
  },
  {
    path: "/profesor/teste-comper",
    el: TesteComperProfesor,
    meta: { layout: "site" },
  },
  { path: "/profesor/rezultate", el: RezultateElevi, meta: { layout: "site" } },
  { path: "/profesor/rapoarte", el: RapoarteTestare, meta: { layout: "site" } },
  {
    path: "/profesor/raport-detaliat",
    el: RaportDetaliat,
    meta: { layout: "site" },
  },
  {
    path: "/profesor/test-preview/romana-10",
    el: TestRomana10Preview,
    meta: { layout: "site" },
  },
  {
    path: "/profesor/test-preview/mate-10",
    el: TestMate10Preview,
    meta: { layout: "site" },
  },
  {
    path: "/profesor/adeverinta",
    el: AdeverintaProfesor,
    meta: { layout: "site" },
  },

  /* Elev */
  { path: "/elev/dashboard", el: DashboardElev, meta: { layout: "site" } },
  {
    path: "/elev/teste-primite",
    el: TestePrimiteElev,
    meta: { layout: "site" },
  },
  // ⇩ ruta pentru „Începe testul” (navigate('/elev/teste/incepe?sid=...'))
  { path: "/elev/teste/incepe", el: RezolvaTest, meta: { layout: "site" } },
  { path: "/elev/rapoarte", el: RapoarteElev, meta: { layout: "site" } },
  {
    path: "/elev/felicitare-premium",
    el: FelicitarePremium,
    meta: { layout: "site" },
  },
  {
    path: "/elev/revizuiri/mate-10",
    el: RevizuireMate10,
    meta: { layout: "site" },
  },
  {
    path: "/elev/revizuiri/romana-10",
    el: RevizuireRomana10,
    meta: { layout: "site" },
  },
  {
    path: "/elev/rapoarte/mate-10",
    el: RaportMate10,
    meta: { layout: "site" },
  },
  {
    path: "/elev/rapoarte/romana-10",
    el: RaportRomana10,
    meta: { layout: "site" },
  },
  {
    path: "/elev/teste-platforma",
    el: TestePlatformaElev,
    meta: { layout: "site" },
  },
  { path: "/elev/teste-comper", el: TesteComperElev, meta: { layout: "site" } },
  { path: "/elev/calendar", el: CalendarElev, meta: { layout: "site" } },
  { path: "/elev/diplome", el: DiplomeCertificari, meta: { layout: "site" } },
  { path: "/elev/profil", el: ProfilElev, meta: { layout: "site" } },
  {
    path: "/elev/parinte-sincronizat",
    el: ParinteSincronizatElev,
    meta: { layout: "site" },
  },
  {
    path: "/elev/profil-parinte",
    el: ParinteSincronizatElev,
    meta: { layout: "site" },
  },

  /* Părinte */
  {
    path: "/parinte/dashboard",
    el: DashboardParinte,
    meta: { layout: "site" },
  },
  { path: "/parinte/calendar", el: CalendarParinte, meta: { layout: "site" } },
  { path: "/parinte/profil", el: ProfilParinte, meta: { layout: "site" } },
  {
    path: "/parinte/profil-parinte",
    el: ProfilParinte,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/profil-copil",
    el: ParinteSincronizat,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/teste-finalizate",
    el: TesteFinalizateParinte,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/revizuiri/mate-10",
    el: RevizuireMate10Parinte,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/revizuiri/romana-10",
    el: RevizuireRomana10Parinte,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/rapoarte/mate-10",
    el: RaportMate10Parinte,
    meta: { layout: "site" },
  },
  {
    path: "/parinte/rapoarte/romana-10",
    el: RaportRomana10Parinte,
    meta: { layout: "site" },
  },
  { path: "/parinte/rapoarte", el: RapoarteProgres, meta: { layout: "site" } },
];

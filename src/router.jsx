// src/router.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "@/layouts/SiteLayout.jsx";
import Loader from "@/components/Loader.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { routes } from "@/router/routes.js";
import { useAuth } from "@/context/AuthContext.jsx";

// Auth pages (non-lazy)
import Login from "@/pages/autentificare/Login.jsx";
import Inregistrare from "@/pages/autentificare/Inregistrare.jsx";
import OAuthCallback from "@/pages/autentificare/OAuthCallback.jsx";
import LoginAdmin from "@/pages/autentificare/LoginAdmin.jsx"; // ← pagina de login admin
import ReseteazaParola from "@/pages/autentificare/ReseteazaParola.jsx";
import PasswordResetCallback from "@/pages/autentificare/PasswordResetCallback.jsx";

// Lazy pages (utilizatori)
const DashboardElev = lazy(() => import("@/pages/elev/DashboardElev.jsx"));
const RezolvaTest = lazy(() => import("@/pages/elev/RezolvaTest.jsx"));
const DashboardProfesor = lazy(() =>
  import("@/pages/profesor/DashboardProfesor.jsx")
);
const EleviGestionare = lazy(() =>
  import("@/pages/profesor/EleviGestionare.jsx")
);
const RezultateElevi = lazy(() =>
  import("@/pages/profesor/RezultateElevi.jsx")
);
const RapoarteProfesor = lazy(() =>
  import("@/pages/profesor/RapoarteProfesor.jsx")
);
const RaportDetaliatProfesor = lazy(() =>
  import("@/pages/profesor/RaportDetaliatProfesor.jsx")
);
const DashboardParinte = lazy(() =>
  import("@/pages/parinte/DashboardParinte.jsx")
);

// Lazy pages (admin)
const DashboardAdmin = lazy(() => import("@/pages/admin/DashboardAdmin.jsx"));

const withSuspense = (el) => <Suspense fallback={<Loader />}>{el}</Suspense>;

function RequireRole({
  allow = [],
  children,
  fallback = "/autentificare/login",
}) {
  const { user, role, authReady } = useAuth();
  if (!authReady) return <Loader />;
  if (!user) return <Navigate to={fallback} replace />;
  if (!allow.includes(role)) return <Navigate to={fallback} replace />;
  return children;
}

// (Opțional) gardă 404 pentru /admin/* ca să „mascheze” zona admin
function RequireAdmin404({ children }) {
  const { user, role, authReady } = useAuth();
  if (!authReady) return <Loader />;
  if (!user || role !== "admin") return <Navigate to="/404" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          404 – Pagina nu există
        </h1>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Înapoi acasă
        </a>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const HomeCmp = routes.find((r) => r.path === "/")?.el;

  // URL „ascuns” pentru login admin (nu-l expune nicăieri în UI)
  const ADMIN_PATH =
    import.meta.env.VITE_ADMIN_PATH || "/_internal/login-admin";

  const guardedPaths = new Set([
    "/elev/rezolva-test/:id",
    "/elev/teste/:id",
    "/elev/dashboard",
    "/profesor/dashboard",
    "/profesor/elevi",
    "/profesor/rezultate-elevi",
    "/profesor/rapoarte",
    "/profesor/raport-detaliat/:id",
    "/parinte/dashboard",
    "/admin/dashboard",
  ]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔒 Login admin separat, în afara layout-ului public */}
        <Route path={ADMIN_PATH} element={<LoginAdmin />} />

        {/* 🌐 zona publică + rutele user */}
        <Route element={<SiteLayout />}>
          {HomeCmp ? (
            <>
              <Route index element={withSuspense(<HomeCmp />)} />
              <Route path="/" element={withSuspense(<HomeCmp />)} />
            </>
          ) : (
            <Route
              index
              element={<div className="p-8">Homepage lipsă în routes.js</div>}
            />
          )}

          {/* Auth public */}
          <Route path="/autentificare/login" element={<Login />} />
          <Route
            path="/autentificare/inregistrare"
            element={<Inregistrare />}
          />
          <Route path="/autentificare/callback" element={<OAuthCallback />} />

          {/* Elev */}
          <Route
            path="/elev/dashboard"
            element={
              <RequireRole allow={["elev"]}>
                {withSuspense(<DashboardElev />)}
              </RequireRole>
            }
          />
          <Route
            path="/elev/rezolva-test/:id"
            element={
              <RequireRole allow={["elev"]}>
                {withSuspense(<RezolvaTest />)}
              </RequireRole>
            }
          />
          <Route
            path="/elev/rezolva-test"
            element={
              <RequireRole allow={["elev"]}>
                {withSuspense(<RezolvaTest />)}
              </RequireRole>
            }
          />

          <Route
            path="/elev/teste/:id"
            element={
              <RequireRole allow={["elev"]}>
                {withSuspense(<RezolvaTest />)}
              </RequireRole>
            }
          />

          {/* Profesor */}
          <Route
            path="/profesor/dashboard"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<DashboardProfesor />)}
              </RequireRole>
            }
          />
          <Route
            path="/profesor/elevi"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<EleviGestionare />)}
              </RequireRole>
            }
          />
          <Route
            path="/profesor/rezultate-elevi"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<RezultateElevi />)}
              </RequireRole>
            }
          />
          <Route
            path="/profesor/rapoarte"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<RapoarteProfesor />)}
              </RequireRole>
            }
          />
          <Route
            path="/profesor/raport-detaliat/:id"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<RaportDetaliatProfesor />)}
              </RequireRole>
            }
          />

          {/* Părinte */}
          <Route
            path="/parinte/dashboard"
            element={
              <RequireRole allow={["parinte"]}>
                {withSuspense(<DashboardParinte />)}
              </RequireRole>
            }
          />

          {/* Admin – protejat; non-admin → 404 (mascat) */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin404>
                {withSuspense(<DashboardAdmin />)}
              </RequireAdmin404>
            }
          />

          {/* Restul din manifest (neprotejate explicit aici) */}
          {routes
            .filter((r) => r.path !== "/" && !guardedPaths.has(r.path))
            .map(({ path, el: Cmp }) => (
              <Route
                key={path}
                path={path}
                element={<ErrorBoundary>{withSuspense(<Cmp />)}</ErrorBoundary>}
              />
            ))}

          <Route
            path="/demo-teste"
            element={<Navigate to="/demo/teste" replace />}
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

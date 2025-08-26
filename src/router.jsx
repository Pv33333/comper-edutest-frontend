// src/router.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "@/layouts/SiteLayout.jsx";
import Loader from "@/components/Loader.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { routes } from "@/router/routes.js";
import { RequireRole } from "@/context/SupabaseAuthProvider.jsx";

const withSuspense = (el) => <Suspense fallback={<Loader />}>{el}</Suspense>;

// Elev
const RezolvaTest = lazy(() => import("@/pages/elev/RezolvaTest.jsx"));

// Profesor
const RezultateElevi = lazy(() => import("@/pages/profesor/RezultateElevi.jsx"));
const RapoarteTestare = lazy(() => import("@/pages/profesor/RapoarteTestare.jsx"));
// ✅ Folosim doar varianta care citește din DB
const RaportDetaliat = lazy(() => import("@/pages/profesor/RaportDetaliat.jsx"));
const EleviGestionare = lazy(() => import("@/pages/profesor/EleviGestionare.jsx"));

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

  const guardedPaths = new Set(["/elev/rezolva-test/:id", "/elev/teste/:id"]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>

          {/* Homepage */}
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

          {/* Elev routes */}
          <Route
            path="/elev/rezolva-test/:id"
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

          {/* Profesor routes */}
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
            path="/profesor/rapoarte-testare"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<RapoarteTestare />)}
              </RequireRole>
            }
          />
          <Route
            path="/profesor/raport-detaliat"
            element={
              <RequireRole allow={["profesor"]}>
                {withSuspense(<RaportDetaliat />)}
              </RequireRole>
            }
          />
          {/* 🔁 Redirect de la vechea pagină demo/localStorage */}
          <Route
            path="/profesor/raport-detaliat-profesor"
            element={<Navigate to="/profesor/raport-detaliat" replace />}
          />

          {/* Restul rutelor din manifest */}
          {routes
            .filter((r) => r.path !== "/" && !guardedPaths.has(r.path))
            .map(({ path, el: Cmp }) => (
              <Route
                key={path}
                path={path}
                element={<ErrorBoundary>{withSuspense(<Cmp />)}</ErrorBoundary>}
              />
            ))}

          {/* Aliasuri utile */}
          <Route
            path="/demo-teste"
            element={<Navigate to="/demo/teste" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// src/router.jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "@/layouts/SiteLayout.jsx";

// Dacă nu ai aceste componente, poți temporar folosi fallback-uri simple
import Loader from "@/components/Loader.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";

import { routes } from "@/router/routes.js";

// 👇 Import Demo Supabase
import SupabaseDemo from "@/pages/SupabaseDemo.jsx";

const withSuspense = (el) => <Suspense fallback={<Loader />}>{el}</Suspense>;

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-3xl font-bold">404 – Pagina nu există</h1>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-xl bg-blue-600 text-white"
        >
          Înapoi acasă
        </a>
      </div>
    </div>
  );
}

export default function AppRouter() {
  // routes[i].el este o COMPONENTĂ (ex: HomePage), nu un element (<HomePage />)
  const HomeCmp = routes.find((r) => r.path === "/")?.el;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* Homepage ca index */}
          {HomeCmp ? (
            <Route index element={withSuspense(<HomeCmp />)} />
          ) : (
            <Route
              index
              element={<div className="p-8">Homepage lipsă în routes.js</div>}
            />
          )}

          {/* și ruta explicită "/" pentru compatibilitate */}
          {HomeCmp && <Route path="/" element={withSuspense(<HomeCmp />)} />}

          {/* Rutele definite în manifest */}
          {routes
            .filter((r) => r.path !== "/")
            .map(({ path, el: Cmp }) => (
              <Route
                key={path}
                path={path}
                element={<ErrorBoundary>{withSuspense(<Cmp />)}</ErrorBoundary>}
              />
            ))}

          {/* ✅ Ruta nouă: Supabase Demo */}
          <Route
            path="/supabase-demo"
            element={
              <ErrorBoundary>{withSuspense(<SupabaseDemo />)}</ErrorBoundary>
            }
          />

          {/* Redirecturi alias (dacă le folosești) */}
          <Route
            path="/demo-teste"
            element={<Navigate to="/demo/teste" replace />}
          />
          <Route
            path="/demo-teste/romana-iv"
            element={<Navigate to="/demo/romana-iv" replace />}
          />
          <Route
            path="/demo-teste/mate-iv"
            element={<Navigate to="/demo/mate-iv" replace />}
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme.css";

import { supabase } from "./lib/supabaseClient";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { AuthProvider } from "@/context/AuthContext.jsx";

// Toaster opțional (nu se rupe build-ul dacă fișierul lipsește)
const Toaster = lazy(() =>
  import("@/components/ui/toaster")
    .then((m) => ({ default: m.Toaster }))
    .catch(() => ({ default: () => null }))
);

const root = ReactDOM.createRoot(document.getElementById("root"));

const AppTree = (
  <SessionContextProvider supabaseClient={supabase}>
    <AuthProvider>
      <App />
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </AuthProvider>
  </SessionContextProvider>
);

root.render(
  import.meta.env.DEV ? AppTree : <React.StrictMode>{AppTree}</React.StrictMode>
);

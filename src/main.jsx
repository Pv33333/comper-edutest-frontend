// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme.css";

import { supabase } from "./lib/supabaseClient";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

import { AuthProvider } from "@/context/AuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

const AppTree = (
  <SessionContextProvider supabaseClient={supabase}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SessionContextProvider>
);

if (import.meta.env.DEV) {
  root.render(AppTree);
} else {
  root.render(<React.StrictMode>{AppTree}</React.StrictMode>);
}

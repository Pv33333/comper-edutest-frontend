// src/App.jsx
import React, { Suspense } from "react";
import AppRouter from "./router";
import Loader from "./components/Loader";
import { useToast, ToastContainer } from "./components/Toast";
import SupabaseAuthProvider from "@/context/SupabaseAuthProvider.jsx";

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <SupabaseAuthProvider>
      <Suspense fallback={<Loader />}>
        <AppRouter addToast={addToast} />
      </Suspense>
      <ToastContainer toasts={toasts} />
    </SupabaseAuthProvider>
  );
}

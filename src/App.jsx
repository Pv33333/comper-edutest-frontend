import React, { Suspense } from "react";
import AppRouter from "./router";
import Loader from "./components/Loader";
import { useToast, ToastContainer } from "./components/Toast";
import { AuthProvider } from "@/hooks/useAuth";

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <AppRouter addToast={addToast} />
      </Suspense>
      <ToastContainer toasts={toasts} />
    </AuthProvider>
  );
}

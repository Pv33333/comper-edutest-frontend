// src/components/RequireAdmin.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function RequireAdmin({ children }) {
  const { user, authReady } = useAuth();
  const role = user?.app_metadata?.role || user?.user_metadata?.role || null;
  if (!authReady) return null;
  if (!user || role !== "admin") return <Navigate to="/404" replace />;
  return children;
}

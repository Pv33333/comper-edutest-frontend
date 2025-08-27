import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { stripPageBg } from "@/utils/normalizeBg.js";

export default function SiteLayout() {
  // Curăță eventualele background-uri setate de pagini
  useEffect(() => {
    stripPageBg?.();
  }, []);

  return (
    <div id="page-root" className="min-h-screen flex flex-col bg-white">
      <Header />
      <main id="main" className="flex-1 bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

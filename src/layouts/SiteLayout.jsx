import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { stripPageBg } from "../utils/normalizeBg";

export default function SiteLayout() {
  // Curăță eventualele background-uri setate de pagini
  stripPageBg?.();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header static (non-sticky), păstrează propriul gradient */}
      <Header />

      {/* Conținutul paginii */}
      <main id="main" className="flex-1 bg-white">
        <Outlet />
      </main>

      {/* Footer (culoarea proprie din componentă) */}
      <Footer />
    </div>
  );
}

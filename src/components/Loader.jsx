// src/components/Loader.jsx
import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 tracking-wide">COMPER</p>
      <p className="mt-1 text-sm text-gray-400">Se încarcă...</p>
    </div>
  );
}

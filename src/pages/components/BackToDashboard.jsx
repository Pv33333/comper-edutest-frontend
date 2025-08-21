import React from "react";
import { useNavigate } from "react-router-dom";

const BackToDashboard = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto mt-10 mb-8 px-4">
      <button
        onClick={() => navigate("/profesor/dashboard")}
        className="flex items-center justify-center gap-2 text-base sm:text-lg text-blue-700 hover:text-blue-900 transition font-medium"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Înapoi la Dashboard
      </button>
    </section>
  );
};

export default BackToDashboard;
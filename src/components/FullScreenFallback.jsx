import React from "react";

export default function FullScreenFallback() {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      {/* SVG spinner independent de CSS, deci nu depinde de tailwind keyframes */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        role="status"
        aria-label="Se încarcă"
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          opacity="0.15"
        />
        <path
          d="M42 22a20 20 0 0 0-20-20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 22 22"
            to="360 22 22"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

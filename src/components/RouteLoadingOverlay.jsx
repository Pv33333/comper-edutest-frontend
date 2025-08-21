import React from "react";
import { useNavigation } from "react-router-dom";

export default function RouteLoadingOverlay() {
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      {/* spinner mic pentru navigații */}
      <svg width="36" height="36" viewBox="0 0 44 44" role="status">
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

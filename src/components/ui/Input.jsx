import React from "react";
export default function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full h-11 rounded-xl border border-default bg-white/95 px-3",
        "text-[rgb(var(--text))] placeholder-[rgb(var(--muted))]",
        "focus:border-[rgba(var(--ring),.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(59,130,246,.25)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

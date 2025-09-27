// src/components/ui/toast.jsx
import * as React from "react";

export const Toast = React.forwardRef(
  ({ title, description, variant = "default", ...props }, ref) => {
    const base =
      "flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 shadow-lg transition-all";
    const variants = {
      default: "border-gray-200 bg-white text-gray-800",
      success: "border-green-200 bg-green-50 text-green-800",
      destructive: "border-red-200 bg-red-50 text-red-800",
    };
    return (
      <div ref={ref} className={`${base} ${variants[variant]}`} {...props}>
        <div className="flex flex-col gap-1">
          {title && <div className="font-semibold">{title}</div>}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

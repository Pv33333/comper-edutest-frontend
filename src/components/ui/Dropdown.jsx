import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Button from "./Button";

export default function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <Button onClick={() => setOpen(!open)} variant="secondary" size="sm">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white border border-default z-50">
          {children}
        </div>
      )}
    </div>
  );
}

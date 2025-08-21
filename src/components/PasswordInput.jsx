import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "Parolă",
  showStrength = false,
}) {
  const [show, setShow] = useState(false);

  // verificăm criterii
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };

  const score = Object.values(checks).filter(Boolean).length; // 0–5
  const levels = [
    { label: "Foarte slabă", color: "bg-red-500" },
    { label: "Slabă", color: "bg-orange-500" },
    { label: "Mediu", color: "bg-yellow-500" },
    { label: "Bună", color: "bg-green-500" },
    { label: "Foarte bună", color: "bg-emerald-600" },
    { label: "Excelentă", color: "bg-blue-600" },
  ];
  const current = levels[score] || levels[0];

  return (
    <div>
      {label && (
        <label className="block font-semibold text-sm text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Wrapper input + iconuri */}
      <div className="relative">
        {/* Icon stânga fix */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Lock className="w-5 h-5" />
        </span>

        {/* Input cu padding fix */}
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 pl-10 pr-10 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        {/* Ochi dreapta fix */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Bara de putere parolă */}
      {showStrength && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-2 ${current.color} transition-all duration-300`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Putere parolă: {current.label}</p>
        </div>
      )}
    </div>
  );
}

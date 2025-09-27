// src/components/ui/use-toast.js
import * as React from "react";

// Event bus global (partajează toasts între emitters și Toaster)
let nextId = 0;
const listeners = new Set();

function emit(toast) {
  listeners.forEach((fn) => fn(toast));
}

export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  // subscribe la bus când <Toaster /> sau componentele se montează
  React.useEffect(() => {
    const handler = (t) => {
      setToasts((prev) => [...prev, t]);
      // auto-hide după 3s
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  // emitter disponibil în orice componentă
  const toast = React.useCallback(
    ({ title, description, variant = "default" }) => {
      emit({ id: ++nextId, title, description, variant });
    },
    []
  );

  return { toast, toasts };
}

import { useEffect, useState } from "react";

// cache la nivel de modul pentru a evita re-importul
let chartPromise = null;

/**
 * Încarcă dinamic Chart.js din npm (fără CDN).
 * Optional: whenVisibleRef – pentru încărcare doar când canvasul devine vizibil (optimizat UX).
 */
export function useChartJs({ whenVisibleRef } = {}) {
  const [Chart, setChart] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!chartPromise) {
        chartPromise = import("chart.js/auto").then((m) => m.default || m);
      }
      const C = await chartPromise;
      if (mounted) setChart(C);
    };

    if (whenVisibleRef?.current && "IntersectionObserver" in window) {
      const el = whenVisibleRef.current;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: "128px" }
      );
      io.observe(el);
      return () => io.disconnect();
    }

    load();
    return () => {
      mounted = false;
    };
  }, [whenVisibleRef]);

  return Chart;
}

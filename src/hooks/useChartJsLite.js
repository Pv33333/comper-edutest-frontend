// src/hooks/useChartJsLite.js
import { useEffect, useState } from "react";
let chartLitePromise = null;

/** Încarcă DOAR modulele de care ai nevoie (linie+bară) — chunk mai mic decât chart.js/auto */
export function useChartJsLite() {
  const [Chart, setChart] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!chartLitePromise) {
        chartLitePromise = (async () => {
          const core = await import("chart.js");
          const {
            Chart: ChartCtor,
            LineController, LineElement, PointElement,
            BarController, BarElement,
            LinearScale, CategoryScale, Tooltip, Legend,
          } = core;
          ChartCtor.register(
            LineController, LineElement, PointElement,
            BarController, BarElement,
            LinearScale, CategoryScale, Tooltip, Legend
          );
          return ChartCtor;
        })();
      }
      const C = await chartLitePromise;
      if (mounted) setChart(C);
    })();
    return () => { mounted = false; };
  }, []);

  return Chart;
}

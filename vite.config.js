// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // Aliasuri convenabile (ex: import "@/components/...")
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Dev mai rapid: pre-bundle deps frecvente
  optimizeDeps: {
    include: [
      "chart.js/auto",
    ],
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Rupe pachetele grele în chunkuri dedicate (încărcate la nevoie)
        manualChunks: {
          chartjs: ["chart.js/auto"],
        },
      },
    },
  },

  // SPA fallback (refresh pe rute non-root)
  server: {
    historyApiFallback: true,
  },
});

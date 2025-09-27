// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // 🔑 Setează baza explicit pentru build-urile Vercel
  base: "/",

  plugins: [react()],

  resolve: {
    // Alias pentru importuri mai scurte, ex: import Button from "@/components/Button"
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Optimizări pentru dezvoltare și build
  optimizeDeps: {
    include: ["chart.js/auto"],
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          chartjs: ["chart.js/auto"],
        },
      },
    },
  },

  // Fallback pentru Single Page App (funcționează local)
  server: {
    historyApiFallback: true,
  },
});

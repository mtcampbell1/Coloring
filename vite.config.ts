import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves at /<repo>/. Override with VITE_BASE for other hosts.
const base = process.env.VITE_BASE ?? "/Coloring/";

export default defineConfig({
  base,
  plugins: [react()],
});

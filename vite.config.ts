import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Default base = "/", suitable for Vercel/Netlify/local preview.
// The Pages workflow sets VITE_BASE=/Coloring/ for GitHub Pages.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
});

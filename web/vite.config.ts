import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the static build work on any host / sub-path (GitHub Pages, Netlify, Vercel).
export default defineConfig({ base: "./", plugins: [react()] });

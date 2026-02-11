// vite.config.js  
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001" // Proxiar API-anrop till Express
    },
    headers: {
      // Allow WebAssembly for PDF generation in development
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3001; img-src 'self' data: blob:;"
    }
  }
});
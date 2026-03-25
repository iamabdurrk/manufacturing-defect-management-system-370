import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for React app. */
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  }
});

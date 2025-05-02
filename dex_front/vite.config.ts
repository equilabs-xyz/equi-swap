import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,

    // optional: allow all hosts or restrict to specific domains
    allowedHosts: "all", // <- use this instead of `true`

    // HMR settings
    hmr: {
      // Set this only if you're accessing the site via domain (e.g. swap.equilabs.io)
      host: "localhost", // use "localhost" unless you're accessing from a real domain
      protocol: "ws",     // don't use "wss" unless you're running on HTTPS
      port: 5173,
    },

    // keep your existing API prox
    proxy: {
      "/api": {
        target: "http://localhost:7778",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

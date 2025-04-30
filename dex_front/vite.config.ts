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
    // bind to all interfaces so nginx can proxy in
    host: true,

    // whitelist your custom host
    // you can also use `allowedHosts: true` to allow any host
    allowedHosts: true,

    // if you use HMR (hot module reload), ensure WebSocket goes through SSL
    hmr: {
      host: "swap.equilabs.io",
      protocol: "wss",
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

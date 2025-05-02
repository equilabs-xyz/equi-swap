import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// Set env vars to switch HMR host/protocol when needed
const isRemote = process.env.VITE_USE_REMOTE === "true";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,

    // Allow both localhost and your custom domain
    allowedHosts: ["localhost", "swap.equilabs.io"],

    hmr: isRemote
        ? {
          host: "swap.equilabs.io",
          protocol: "wss",
          port: 443,
        }
        : {
          host: "localhost",
          protocol: "ws",
          port: 5173,
        },

    proxy: {
      "/api": {
        target: "http://localhost:7778",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

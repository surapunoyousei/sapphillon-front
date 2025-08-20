import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [deno(), react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@tanstack/react-query-devtools",
        replacement:
          process.env.NODE_ENV === "production"
            ? "/src/shims/rq-devtools-shim.tsx"
            : "@tanstack/react-query-devtools",
      },
    ],
  },
  server: {
    port: 8999,
    proxy: {
      // Proxy /api to backend to avoid CORS during development
      "/api": {
        target: "http://localhost:50051",
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    deno(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // 本番ビルド時のみ Devtools をスタブに切替
      {
        find: "@tanstack/react-query-devtools",
        replacement: process.env.NODE_ENV === "production"
          ? "/src/shims/rq-devtools-shim.tsx"
          : "@tanstack/react-query-devtools",
      },
    ],
  },
  server: {
    port: 8999,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

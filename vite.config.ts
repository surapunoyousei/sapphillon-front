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
  server: {
    port: 8999,
  },
});

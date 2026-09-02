import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    allowedHosts: ["ancar-shoppings.facilities-ai.com.br"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact(), nitro()],
});

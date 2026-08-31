import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    server: {
      allowedHosts: ["ancar-shoppings.2see.io", "ancar-shoppings.facilities-ai.com.br"],
    },
  },
});

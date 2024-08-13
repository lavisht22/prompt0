import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: "/src/components",
      stores: "/src/stores",
      utils: "/src/utils",
      assets: "/src/assets",
      contexts: "/src/contexts",
      routes: "/src/routes",
    },
  },
});

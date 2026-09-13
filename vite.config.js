import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // HeadHunter blocks browser-origin calls without an app token; the dev
      // proxy lets you experiment with the source locally. See README.
      "/hh-api": {
        target: "https://api.hh.ru",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hh-api/, ""),
      },
    },
  },
});

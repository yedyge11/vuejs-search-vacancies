import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // `npm run build:file` produces one self-contained .html that runs straight
  // off the disk - no web server and no hosting account. Everything (JS, CSS)
  // has to be inlined, because browsers refuse to load module scripts over
  // file:// and would leave the page blank.
  const singleFile = mode === "singlefile";

  return {
    base: singleFile ? "./" : "/",
    plugins: [vue(), ...(singleFile ? [viteSingleFile()] : [])],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: singleFile ? "dist-file" : "dist",
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
  };
});

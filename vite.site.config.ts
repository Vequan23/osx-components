import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [vue({ customElement: /\.ce\.vue$/ })],
  build: {
    outDir: "site-dist",
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        components: resolve(root, "components.html"),
      },
    },
  },
});

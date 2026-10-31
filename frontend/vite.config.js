import { defineConfig } from "vite";

// One self-contained ES module, written where the integration serves it from.
export default defineConfig({
  build: {
    lib: { entry: "src/main.js", formats: ["es"], fileName: () => "itadaki-panel.js" },
    outDir: "../custom_components/itadaki/frontend",
    emptyOutDir: false,
    minify: true,
  },
});

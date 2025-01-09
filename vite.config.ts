/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "/app": path.resolve(__dirname, "./src/app"),
      "/test-setup": path.resolve(__dirname, "./src/__tests__")
      // "/src/World": path.resolve(__dirname, "./src/World")
    }
  },
  test: {
    environment: "happy-dom"
    //setupFiles: ["./src/__tests__/three.mock.setup.ts"]
    // deps: {
    //   inline: ["vitest-canvas-mock"]
    // }
  }
});

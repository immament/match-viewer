/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "/app": path.resolve(__dirname, "./src/app"),
      "/test-setup": path.resolve(__dirname, "./src/__tests__")
      // "/src/World": path.resolve(__dirname, "./src/World")
    }
  },
  test: {
    environment: "happy-dom",
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "**/__mocks__/*",
        "**/__sampleData__/*",
        "**/debug/**"
      ]
    }
    // pool: "threads",
    // poolOptions: {
    //   threads: {
    //     execArgv: [
    //       "--cpu-prof",
    //       "--cpu-prof-dir=test-runner-profile",
    //       "--heap-prof",
    //       "--heap-prof-dir=test-runner-profile"
    //     ],

    //     // To generate a single profile
    //     singleThread: true
    //   }
    // }
    //setupFiles: ["./src/__tests__/three.mock.setup.ts"]
    // deps: {
    //   inline: ["vitest-canvas-mock"]
    // }
  }
});

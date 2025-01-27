/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "/app": path.resolve(__dirname, "./src/app"),
      "/test-setup": path.resolve(__dirname, "./src/__tests__")
    }
  },
  esbuild: {
    //jsxFactory: "h"
    // jsxFragment: "Fragment",
    // jsxImportSource: "jsx-dom",
    // jsxInject: "import * as React from 'jsx-dom'"
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
    },
    diff: {
      // truncateThreshold: 10000
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
  },
  server: {
    proxy: {
      "/api": {
        target: "https://nd.footstar.org/match/get_data_nviewer.asp",
        changeOrigin: true,
        rewrite: (path) => {
          // console.log("path", path, path.replace(/^\/api\//, "?jogo_id="));
          return path.replace(/^\/api\//, "?jogo_id=");
        }
      }
    }
  }
});

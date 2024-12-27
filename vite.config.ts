import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "/src/app": path.resolve(__dirname, "./src/app")
      // "/src/World": path.resolve(__dirname, "./src/World")
    }
  }
});

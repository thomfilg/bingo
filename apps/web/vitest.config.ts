import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./app/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      // Match subpath exports like @repo/ui/data-display/Alert
      "@repo/ui/data-display": path.resolve(__dirname, "../../packages/ui/src/components/data-display"),
      "@repo/ui/feedback": path.resolve(__dirname, "../../packages/ui/src/components/feedback"),
      "@repo/ui/form": path.resolve(__dirname, "../../packages/ui/src/components/form"),
      "@repo/ui/layout": path.resolve(__dirname, "../../packages/ui/src/components/layout"),
      "@repo/ui/navigation": path.resolve(__dirname, "../../packages/ui/src/components/navigation"),
      "@repo/ui/typography": path.resolve(__dirname, "../../packages/ui/src/components/typography"),
      "@repo/ui/utility": path.resolve(__dirname, "../../packages/ui/src/components/utility"),
      // Base imports
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@repo/auth": path.resolve(__dirname, "../../packages/auth/src"),
    },
  },
});

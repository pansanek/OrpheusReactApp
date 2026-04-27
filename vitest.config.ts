// vitest.config.ts — исправленная версия для Next.js
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@store": path.resolve(__dirname, "./store"),
      "@utils": path.resolve(__dirname, "./utils"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/__setup__/setup.ts",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "tests/e2e/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["components/**", "hooks/**", "utils/**", "lib/**"],
      exclude: ["**/*.d.ts", "**/*.config.*", "tests/**", ".next/**"],
    },
    // Важно: игнорируем Next.js модули
    server: {
      deps: {
        inline: ["@radix-ui/react-*", "next", "next/router", "next/image"],
      },
    },
    // Подавляем предупреждения о некритичных импортах
    onConsoleLog: (log) => {
      if (log.includes("next/image") || log.includes("next/router"))
        return false;
      return undefined;
    },
  },
});

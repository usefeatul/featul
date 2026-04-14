import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const setupNode = path.join(packageRoot, "src/setup-node.ts");
const setupJsdom = path.join(packageRoot, "src/setup-jsdom.ts");

function createVitestConfig({ environment, setupFiles }) {
  return defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment,
      globals: true,
      passWithNoTests: true,
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      setupFiles,
      exclude: [
        ...configDefaults.exclude,
        "**/.next/**",
        "**/coverage/**",
        "**/dist/**",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
    },
  });
}

export function createNodeVitestConfig() {
  return createVitestConfig({
    environment: "node",
    setupFiles: [setupNode],
  });
}

export function createJsdomVitestConfig() {
  return createVitestConfig({
    environment: "jsdom",
    setupFiles: [setupJsdom],
  });
}

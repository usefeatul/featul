import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

type CreateVitestConfigOptions = {
  setupFiles?: string[];
  include?: string[];
  environment: "node" | "jsdom";
};

function createVitestConfig({
  environment,
  setupFiles,
  include = ["src/**/*.test.ts", "src/**/*.test.tsx"],
}: CreateVitestConfigOptions) {
  return defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment,
      globals: true,
      passWithNoTests: true,
      include,
      setupFiles,
      exclude: [
        ...configDefaults.exclude,
        "**/.next/**",
        "**/dist/**",
        "**/coverage/**",
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
    setupFiles: ["@featul/test/setup-node"],
  });
}

export function createJsdomVitestConfig() {
  return createVitestConfig({
    environment: "jsdom",
    setupFiles: ["@featul/test/setup-jsdom"],
  });
}


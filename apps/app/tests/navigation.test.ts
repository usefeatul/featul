import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

// Bun module mocks are global; isolate server-loader mocks from the existing suite.
for (const name of ["detail", "workspaces"]) {
  test(`${name} navigation reads overlap and preserve results`, () => {
    const result = Bun.spawnSync([
      process.execPath,
      "test",
      fileURLToPath(new URL(`./navigation/${name}.case.ts`, import.meta.url)),
    ], { cwd: fileURLToPath(new URL("../", import.meta.url)) });
    expect(result.exitCode, result.stderr.toString()).toBe(0);
  });
}

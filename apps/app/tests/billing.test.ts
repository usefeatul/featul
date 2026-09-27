import { expect, test } from "bun:test"
import { fileURLToPath } from "node:url"

test("billing page renders trial eligibility from the server through the full settings UI", () => {
  const result = Bun.spawnSync([
    process.execPath, "test", fileURLToPath(new URL("./billing/page.case.ts", import.meta.url)),
  ], { cwd: fileURLToPath(new URL("../", import.meta.url)) })
  expect(result.exitCode, result.stderr.toString()).toBe(0)
})

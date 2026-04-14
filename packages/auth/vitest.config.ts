// @ts-expect-error Shared Vitest config helper is authored as runtime ESM.
import { createNodeVitestConfig } from "../test/vitest.base.mjs";

export default createNodeVitestConfig();

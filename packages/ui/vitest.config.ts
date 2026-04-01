// @ts-expect-error Shared Vitest config helper is authored as runtime ESM.
import { createJsdomVitestConfig } from "../test/vitest.base.mjs";

export default createJsdomVitestConfig();

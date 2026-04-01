// @ts-expect-error Shared Vitest config helper is authored as runtime ESM.
import { createNodeVitestConfig } from "../test/vitest.base.mjs";

const config = createNodeVitestConfig();

export default {
  ...config,
  test: {
    ...config.test,
    fileParallelism: false,
  },
};

import { afterEach, vi } from "vitest";
import { loadTestEnv } from "./env";

loadTestEnv();

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});


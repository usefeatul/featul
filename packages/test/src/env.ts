import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

let loaded = false;

function loadIfPresent(filePath: string, override = false) {
  if (!existsSync(filePath)) return;
  loadEnv({ path: filePath, override });
}

export function getWorkspaceRoot(): string {
  return workspaceRoot;
}

export function loadTestEnv(): void {
  if (loaded) return;

  loadIfPresent(path.join(workspaceRoot, ".env.test"));
  loadIfPresent(path.join(workspaceRoot, ".env.test.local"), true);

  process.env.NODE_ENV = "test";
  loaded = true;
}


import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getWorkspaceRoot, loadTestEnv } from "../src/env";
import { getTestDatabaseUrl } from "../src/db";

type DatabaseRuntime = {
  dataDir: string;
  dbName: string;
  host: string;
  logFile: string;
  port: string;
  user: string;
  workspaceRoot: string;
};

function run(command: string, args: string[], options: { allowFailure?: boolean } = {}) {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      [result.stderr, result.stdout]
        .filter(Boolean)
        .join("\n")
        .trim() || `Command failed: ${command} ${args.join(" ")}`,
    );
  }

  return result;
}

function resolveRuntime(): DatabaseRuntime {
  loadTestEnv();

  const workspaceRoot = getWorkspaceRoot();
  const databaseUrl = new URL(getTestDatabaseUrl());
  const dataDir = path.join(workspaceRoot, ".turbo", "test-postgres");
  const logFile = path.join(workspaceRoot, ".turbo", "test-postgres.log");

  mkdirSync(path.dirname(logFile), { recursive: true });

  return {
    dataDir,
    dbName: databaseUrl.pathname.replace(/^\//, ""),
    host: databaseUrl.hostname,
    logFile,
    port: databaseUrl.port || "5432",
    user: decodeURIComponent(databaseUrl.username || "postgres"),
    workspaceRoot,
  };
}

function isReady(runtime: DatabaseRuntime): boolean {
  const result = run(
    "pg_isready",
    ["-h", runtime.host, "-p", runtime.port, "-d", runtime.dbName, "-U", runtime.user],
    { allowFailure: true },
  );

  return result.status === 0;
}

function tryDockerStart(runtime: DatabaseRuntime): boolean {
  const result = run(
    "docker",
    ["compose", "-f", path.join(runtime.workspaceRoot, "docker-compose.test.yml"), "up", "-d"],
    { allowFailure: true },
  );

  if (result.status === 0) {
    console.log("Started test database with Docker Compose.");
    return true;
  }

  return false;
}

function ensureLocalCluster(runtime: DatabaseRuntime) {
  if (!existsSync(runtime.dataDir)) {
    run("initdb", ["-D", runtime.dataDir, "-U", runtime.user, "-A", "trust"]);
  }

  run(
    "pg_ctl",
    [
      "-D",
      runtime.dataDir,
      "-l",
      runtime.logFile,
      "-o",
      `-F -p ${runtime.port}`,
      "start",
    ],
    { allowFailure: true },
  );

  const createdb = run(
    "createdb",
    ["-h", runtime.host, "-p", runtime.port, "-U", runtime.user, runtime.dbName],
    { allowFailure: true },
  );

  if (
    createdb.status !== 0 &&
    !String(createdb.stderr || "").includes("already exists")
  ) {
    throw new Error(createdb.stderr || createdb.stdout || "createdb failed");
  }

  console.log("Started test database with local Postgres.");
}

export function ensureTestDatabaseAvailable() {
  const runtime = resolveRuntime();

  if (isReady(runtime)) {
    return;
  }

  if (!tryDockerStart(runtime)) {
    ensureLocalCluster(runtime);
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (isReady(runtime)) {
      return;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }

  throw new Error("Test database did not become ready.");
}

export function stopTestDatabase() {
  const runtime = resolveRuntime();

  run(
    "docker",
    ["compose", "-f", path.join(runtime.workspaceRoot, "docker-compose.test.yml"), "down", "-v"],
    { allowFailure: true },
  );

  if (!existsSync(runtime.dataDir)) {
    return;
  }

  run("pg_ctl", ["-D", runtime.dataDir, "stop", "-m", "fast"], {
    allowFailure: true,
  });
}


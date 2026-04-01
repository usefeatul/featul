import { ensureTestDatabaseAvailable } from "./db-runtime";

try {
  ensureTestDatabaseAvailable();
  console.log("Test database is ready.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

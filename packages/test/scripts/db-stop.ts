import { stopTestDatabase } from "./db-runtime";

try {
  stopTestDatabase();
  console.log("Test database stopped.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

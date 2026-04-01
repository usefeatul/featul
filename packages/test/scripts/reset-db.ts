import {
  closeTestDatabase,
  createTestDatabase,
  migrateTestDatabase,
  recreatePublicSchema,
  resetTestDatabase,
} from "../src/db";

async function main() {
  const testDatabase = createTestDatabase();

  try {
    await recreatePublicSchema(testDatabase);
    await migrateTestDatabase(testDatabase);
    await resetTestDatabase(testDatabase);
    console.log("Test database is migrated and reset.");
  } finally {
    await closeTestDatabase(testDatabase);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { createSchema, seedDatabase } = require("./migrateProductDetails");
const { allProductDetails } = require("../productdetails");

async function runMigration() {
  try {
    console.log("🔄 Starting migration...");
    await createSchema();
    await seedDatabase(allProductDetails);
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

runMigration();

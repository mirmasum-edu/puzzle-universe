import { db, pool } from "./index";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";

async function main() {
  console.log("[db] Running database migrations...");
  try {
    // Under standalone builds or local runs, resolve the path to the drizzle folder
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[db] Database migrations completed successfully!");
  } catch (error) {
    console.error("[db] Error during database migrations:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

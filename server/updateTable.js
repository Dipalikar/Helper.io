import sql from "./configs/db.js";

async function updateTable() {
  try {
    console.log("Updating users table...");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
    `;
    console.log("Table updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating table:", error);
    process.exit(1);
  }
}

updateTable();

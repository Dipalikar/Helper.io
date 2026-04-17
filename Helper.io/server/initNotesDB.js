import sql from "./configs/db.js";

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS personal_notes (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        file_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table personal_notes created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

run();

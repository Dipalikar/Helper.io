import sql from "./configs/db.js";

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS document_comments (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        document_key VARCHAR(500) NOT NULL,
        y_position FLOAT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table document_comments created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

run();

import sql from "../configs/db.js";

export async function usernameExists(username) {
  const result = await sql`
    SELECT id FROM users WHERE username = ${username} LIMIT 1
  `;

  return result.length > 0; // true = exists
}

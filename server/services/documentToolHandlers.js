/**
 * documentToolHandlers.js
 *
 * Implements the server-side logic for each document management tool.
 * Every handler receives:
 *   - args      : the arguments object passed by Gemini in the functionCall
 *   - username  : the authenticated user, injected by the agent controller
 *
 * Every handler returns a plain JSON-serialisable object.
 * On success  → { success: true,  ...data }
 * On failure  → { success: false, error: string }
 */

import { v4 as uuidv4 } from "uuid";
import sql from "../configs/db.js";
import {
  putDocToR2,
  getPersonalDocFromR2,
  deleteDocFromR2,
} from "./r2Service.js";

// ─────────────────────────────────────────────────────────────────────────────
// CREATE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
export const handleCreateDocument = async (args, username) => {
  try {
    const { title, content } = args;

    if (!title || !content) {
      return { success: false, error: "Both title and content are required." };
    }

    const file_key = `personal_notes/${username}/${uuidv4()}.md`;

    // 1. Upload markdown content to Cloudflare R2
    await putDocToR2(file_key, content);

    // 2. Persist metadata to NeonDB
    const result = await sql`
      INSERT INTO personal_notes (username, title, file_key)
      VALUES (${username}, ${title}, ${file_key})
      RETURNING id, title, file_key, created_at
    `;

    const doc = result[0];
    return {
      success: true,
      message: `Document "${title}" created successfully.`,
      document: {
        id: doc.id,
        title: doc.title,
        file_key: doc.file_key,
        created_at: doc.created_at,
      },
    };
  } catch (error) {
    console.error("[handleCreateDocument]", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
export const handleUpdateDocument = async (args, username) => {
  try {
    const { document_id, new_content, new_title } = args;

    if (!document_id || !new_content) {
      return {
        success: false,
        error: "document_id and new_content are required.",
      };
    }

    // 1. Fetch current metadata from NeonDB to get the file_key
    const rows = await sql`
      SELECT id, title, file_key
      FROM personal_notes
      WHERE id = ${document_id} AND username = ${username}
    `;

    if (rows.length === 0) {
      return {
        success: false,
        error: `No document found with id ${document_id} for this user.`,
      };
    }

    const { file_key, title: currentTitle } = rows[0];

    // 2. Overwrite content in R2 (same key → same URL, no orphans)
    await putDocToR2(file_key, new_content);

    // 3. Optionally update the title in NeonDB
    if (new_title && new_title !== currentTitle) {
      await sql`
        UPDATE personal_notes
        SET title = ${new_title}
        WHERE id = ${document_id} AND username = ${username}
      `;
    }

    return {
      success: true,
      message: `Document "${new_title || currentTitle}" updated successfully.`,
      document: {
        id: document_id,
        title: new_title || currentTitle,
        file_key,
      },
    };
  } catch (error) {
    console.error("[handleUpdateDocument]", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
export const handleListDocuments = async (_args, username) => {
  try {
    const rows = await sql`
      SELECT id, title, file_key, created_at
      FROM personal_notes
      WHERE username = ${username}
      ORDER BY created_at DESC
    `;

    return {
      success: true,
      count: rows.length,
      documents: rows.map((r) => ({
        id: r.id,
        title: r.title,
        file_key: r.file_key,
        created_at: r.created_at,
      })),
    };
  } catch (error) {
    console.error("[handleListDocuments]", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET DOCUMENT CONTENT
// ─────────────────────────────────────────────────────────────────────────────
export const handleGetDocument = async (args, username) => {
  try {
    const { document_id } = args;

    if (!document_id) {
      return { success: false, error: "document_id is required." };
    }

    // 1. Look up file_key from NeonDB (also validates ownership)
    const rows = await sql`
      SELECT id, title, file_key, created_at
      FROM personal_notes
      WHERE id = ${document_id} AND username = ${username}
    `;

    if (rows.length === 0) {
      return {
        success: false,
        error: `No document found with id ${document_id} for this user.`,
      };
    }

    const { file_key, title, created_at } = rows[0];

    // 2. Fetch content from R2
    const content = await getPersonalDocFromR2(file_key);

    return {
      success: true,
      document: {
        id: document_id,
        title,
        file_key,
        created_at,
        content,
      },
    };
  } catch (error) {
    console.error("[handleGetDocument]", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
export const handleDeleteDocument = async (args, username) => {
  try {
    const { document_id } = args;

    if (!document_id) {
      return { success: false, error: "document_id is required." };
    }

    // 1. Look up file_key from NeonDB (also validates ownership)
    const rows = await sql`
      SELECT id, title, file_key
      FROM personal_notes
      WHERE id = ${document_id} AND username = ${username}
    `;

    if (rows.length === 0) {
      return {
        success: false,
        error: `No document found with id ${document_id} for this user.`,
      };
    }

    const { file_key, title } = rows[0];

    // 2. Delete from R2
    await deleteDocFromR2(file_key);

    // 3. Remove metadata from NeonDB
    await sql`
      DELETE FROM personal_notes
      WHERE id = ${document_id} AND username = ${username}
    `;

    return {
      success: true,
      message: `Document "${title}" has been permanently deleted.`,
    };
  } catch (error) {
    console.error("[handleDeleteDocument]", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER — maps Gemini functionCall names → handlers
// ─────────────────────────────────────────────────────────────────────────────
export const toolHandlers = {
  create_document: handleCreateDocument,
  update_document: handleUpdateDocument,
  list_documents: handleListDocuments,
  get_document: handleGetDocument,
  delete_document: handleDeleteDocument,
};

/**
 * agentController.js
 *
 * Handles POST /api/agent/chat
 *
 * Request body:
 * {
 *   username : string,           // required — the authenticated user
 *   history  : Array<{           // required — full conversation so far
 *     role  : "user" | "model",
 *     parts : Array<{ text: string }>
 *   }>
 * }
 *
 * Response:
 * {
 *   success : true,
 *   reply   : string   // Gemini's final natural-language response
 * }
 */

import { runAgentLoop } from "../services/geminiService.js";
import sql from "../configs/db.js";
import { getDocFromR2, getPersonalDocFromR2 } from "../services/r2Service.js";

export const agentChat = async (req, res) => {
  try {
    const { username, history, topic, file, file_key } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required.",
      });
    }

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({
        success: false,
        message: "history must be a non-empty array of {role, parts} objects.",
      });
    }

    // Ensure the last entry in the history is a user message
    const lastEntry = history[history.length - 1];
    if (lastEntry.role !== "user") {
      return res.status(400).json({
        success: false,
        message: "The last entry in history must have role='user'.",
      });
    }

    // ── Document Context ──────────────────────────────────────────────────────
    let contextStr = "";

    // 1. If it's a personal note (file_key)
    if (file_key) {
      try {
        const content = await getPersonalDocFromR2(file_key);
        // Find the ID and title for this note so the agent can use it for tools
        const rows = await sql`
          SELECT id, title FROM personal_notes 
          WHERE file_key = ${file_key} AND username = ${username}
        `;
        if (rows.length > 0) {
          const { id, title } = rows[0];
          contextStr = `The user is currently viewing their personal note titled "${title}" (ID: ${id}).\n\nContent:\n${content}`;
        } else {
          contextStr = `The user is viewing a document with content:\n${content}`;
        }
      } catch (err) {
        console.warn("[agentChat] Could not fetch personal doc for context:", err.message);
      }
    }
    // 2. If it's a standard topic document
    else if (topic && file) {
      try {
        const content = await getDocFromR2(topic, file);
        contextStr = `The user is currently viewing the standard learning document "${file}" in the topic "${topic}".\n\nContent:\n${content}`;
      } catch (err) {
        console.warn("[agentChat] Could not fetch topic doc for context:", err.message);
      }
    }

    // ── Run the agentic loop ──────────────────────────────────────────────────
    const { finalText: reply, toolsUsed } = await runAgentLoop(username, history, contextStr);

    return res.status(200).json({ success: true, reply, toolsUsed });
  } catch (error) {
    console.error("[agentChat] Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
};

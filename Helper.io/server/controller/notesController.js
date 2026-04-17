import sql from "../configs/db.js";
import { putDocToR2, getPersonalDocFromR2, deleteDocFromR2 } from "../services/r2Service.js";
import { v4 as uuidv4 } from "uuid";

export const uploadNote = async (req, res) => {
  try {
    const { username, title, content } = req.body;

    if (!username || !title || !content) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const file_key = `personal_notes/${username}/${uuidv4()}.md`;

    // 1. Upload to R2
    await putDocToR2(file_key, content);

    // 2. Save metadata to Database
    const result = await sql`
      INSERT INTO personal_notes (username, title, file_key)
      VALUES (${username}, ${title}, ${file_key})
      RETURNING id, title, created_at;
    `;

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      note: {
        id: result[0].id,
        title: result[0].title,
        date: result[0].created_at,
        file_key: file_key,
        content: content // Return content so frontend can immediately show it
      }
    });

  } catch (error) {
    console.error("Upload Note Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const notes = await sql`
      SELECT id, title, file_key, created_at 
      FROM personal_notes 
      WHERE username = ${username}
      ORDER BY created_at DESC;
    `;

    res.status(200).json({ success: true, notes });

  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoteContent = async (req, res) => {
  try {
    const { file_key } = req.query;
    if (!file_key) {
      return res.status(400).json({ success: false, message: "file_key is required" });
    }

    const content = await getPersonalDocFromR2(file_key);
    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error("Get Note Content Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id, file_key } = req.body;

    if (!id || !file_key) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await deleteDocFromR2(file_key);

    await sql`
      DELETE FROM personal_notes WHERE id = ${id}
    `;

    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete Note Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

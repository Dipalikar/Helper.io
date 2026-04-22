import sql from "../configs/db.js";

export const getComments = async (req, res) => {
  try {
    const { document_key, username } = req.query;

    if (!document_key || !username) {
      return res.status(400).json({ success: false, message: "document_key and username are required" });
    }

    const comments = await sql`
      SELECT id, username, y_position, content, created_at 
      FROM document_comments 
      WHERE document_key = ${document_key} AND username = ${username}
      ORDER BY created_at ASC;
    `;

    res.status(200).json({ success: true, comments });

  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { username, document_key, y_position, content } = req.body;

    if (!username || !document_key || y_position === undefined || !content) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await sql`
      INSERT INTO document_comments (username, document_key, y_position, content)
      VALUES (${username}, ${document_key}, ${y_position}, ${content})
      RETURNING id, username, y_position, content, created_at;
    `;

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: result[0]
    });

  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, username } = req.body;

    if (!id || !username) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Only allow deletion if the user is the author
    await sql`
      DELETE FROM document_comments 
      WHERE id = ${id} AND username = ${username}
    `;

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

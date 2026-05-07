import { usernameExists } from "../middleware/checkUsername.js";
import sql from "../configs/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDocFromR2 } from "../services/r2Service.js";
import { askGemini } from "../services/geminiService.js";
import { sendResetEmail } from "../services/mailService.js";
import crypto from "crypto";

export const userAdd = async (req, res) => {
  try {
    const { username, full_name, password, email } = req.body;
    const exists = await usernameExists(username);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "An user with this username already exists",
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
    INSERT INTO users (username, full_name, password_hash, email)
    VALUES (${username}, ${full_name}, ${hashedPassword}, ${email})
    RETURNING id, username, full_name, email;
  `;
    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const userVerify = async (req, res) => {
  try {
    const { username, password } = req.query;

    // 1. Find user by username
    const result = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    console.log(result);

    if (!result || result.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No account found please sign up first",
      });
    }

    const user = result[0];

    // 2. Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      success: true,
      message: "Signin successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getDoc = async (req, res) => {
  try {
    const { topic, file } = req.params;

    const data = await getDocFromR2(topic, file);

    res.set("Content-Type", "text/markdown");
    res.send(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching document",
    });
  }
};

export const getSummarize = async (req, res) => {
  try {
    const { topic, file } = req.body;
    console.log(req.body.topic, req.body.file);

    let document = "";
    if (topic && file) {
      document = await getDocFromR2(topic, file);
    }

    const prompt = document
      ? `
  Summarize the following learning document in simple terms for beginners.

  ${document}
  `
      : `
  Please summarize the current topic you are an AI tutor for. If you don't know the topic, ask the user to specify it or open a document.
  `;

    const result = await askGemini(prompt);

    res.json({ summary: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ summary: "Error generating summary." });
  }
};


export const getQuiz = async (req, res) => {
  try {
    const { topic, file } = req.body;

    let document = "";
    if (topic && file) {
      document = await getDocFromR2(topic, file);
    }

    const prompt = document
      ? `
  Create 5 multiple choice quiz questions from the document.

  Return JSON format like:

  [
    {
      "question":"",
      "options":["","","",""],
      "answer":""
    }
  ]

  Document:
  ${document}
  `
      : `
  Create 3 general knowledge tech multiple choice quiz questions.

  Return JSON format like:

  [
    {
      "question":"",
      "options":["","","",""],
      "answer":""
    }
  ]
  `;

    const result = await askGemini(prompt);

    res.json({ quiz: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating quiz." });
  }
};


export const getDoubt = async (req, res) => {
  try {
    const { topic, file, question } = req.body;

    let document = "";
    if (topic && file) {
      document = await getDocFromR2(topic, file);
    }

    const prompt = document
      ? `
  You are an AI tutor.

  Use the document below to answer the question.

  Document:
  ${document}

  Question:
  ${question}
  `
      : `
  You are a helpful AI tutor.

  Please answer the following user question:
  
  Question:
  ${question}
  `;

    const result = await askGemini(prompt);

    res.json({ answer: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "Something went wrong while getting the answer." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!result || result.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const user = result[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in DB
    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `;

    // Send email
    await sendResetEmail(email, resetToken);

    res.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with this token and check expiry
    const result = await sql`
      SELECT * FROM users 
      WHERE reset_token = ${token} AND reset_token_expiry > NOW()
    `;

    if (!result || result.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const user = result[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, reset_token = NULL, reset_token_expiry = NULL
      WHERE id = ${user.id}
    `;

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username;

    // 1. Find user
    const result = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result[0];

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update in DB
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE id = ${user.id}
    `;

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating your password",
    });
  }
};

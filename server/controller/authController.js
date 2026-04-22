import { usernameExists } from "../middleware/checkUsername.js";
import sql from "../configs/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDocFromR2 } from "../services/r2Service.js";
import { askGemini } from "../services/geminiService.js";

export const userAdd = async (req, res) => {
  try {
    const { username, full_name, password } = req.body;
    const exists = await usernameExists(username);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "An user with this username already exists",
      });
    }
    console.log(username, full_name, password);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
    INSERT INTO users (username, full_name, password_hash)
    VALUES (${username}, ${full_name}, ${hashedPassword})
    RETURNING id, username, full_name;
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

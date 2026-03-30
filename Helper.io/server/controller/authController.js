import { usernameExists } from "../middleware/checkUsername.js";
import sql from "../configs/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { r2 } from "../configs/r2Client.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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
    const key = `${topic}/${file}`;


    const command = new GetObjectCommand({
      Bucket: "notes-docs",
      Key: key,
    });

    const response = await r2.send(command);

    const data = await response.Body.transformToString();

    res.set("Content-Type", "text/markdown");
    res.send(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching document",
    });

  }
};

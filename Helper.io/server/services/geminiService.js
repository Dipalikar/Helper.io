import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askGemini = async (prompt, retryCount = 0) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    // If we run into a 503 Service Unavailable, switch to the 1.5-flash model
    if (error.status === 503 && retryCount === 0) {
      console.warn(
        "gemini-2.5-flash is experiencing high demand. Falling back to gemini-1.5-flash...",
      );
      return askGemini(prompt, 1);
    }
    throw error;
  }
};

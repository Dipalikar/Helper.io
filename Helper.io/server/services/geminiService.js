import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are the Helper.io AI Assistant, a specialized AI tutor for technical learning on the Helper.io website.
Helper.io is a platform dedicated to mastering modern technologies like AWS, Cloud Computing, Programming languages, and DevOps.

CORE RULES:
1. SCOPE: Only answer questions related to technical topics, programming, cloud computing, software engineering, and devops.
2. BOUNDARY: If a user asks about non-technical topics (e.g., politics, entertainment, sports, health, etc.), you must politely decline: "I'm sorry, I am programmed to assist only with technical and learning-related topics on Helper.io. I cannot answer that question."
3. TONE: Be helpful, professional, and beginner-friendly.
4. FORMATTING: Always use Markdown. Use code blocks for code snippets.
5. RELEVANCE: If a document context is provided, use it to provide accurate and relevant answers.
6. IDENTITY: You are Helper.io's official AI assistant.
`;

export const askGemini = async (prompt, retryCount = 0) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
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

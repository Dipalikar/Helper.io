import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { documentToolDeclarations } from "./documentTools.js";
import { toolHandlers } from "./documentToolHandlers.js";

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

const AGENT_SYSTEM_PROMPT = `
You are the Helper.io AI Assistant — a specialized technical learning tutor AND a personal document manager.

You have access to five tools that let you manage the user's personal documents:
  • create_document  — write a new note/document
  • update_document  — edit or expand an existing document
  • list_documents   — show the user's document library
  • get_document     — read the content of a specific document
  • delete_document  — permanently remove a document

DOCUMENT MANAGEMENT RULES:
- When the user asks to "create", "write", "draft", or "save" a note/document → call create_document with rich markdown content.
- When the user asks to "update", "edit", "add to", or "rewrite" a document → first list_documents if you don't know the id, then call update_document.
- When the user asks "what notes do I have?" or "show my documents" → call list_documents.
- When the user asks to "show", "read", or "open" a specific document → first list_documents if needed, then call get_document.
- When the user asks to "delete" or "remove" → confirm the document name, then call delete_document.
- Always produce high-quality, well-structured markdown content for created/updated documents.

CONTENT RULES:
1. Only handle technical topics (AWS, Cloud, DevOps, Programming, etc.).
2. Non-technical requests should be politely declined.
3. Be helpful, professional, and beginner-friendly.
4. Always use Markdown formatting in your replies.
`;

// ─────────────────────────────────────────────────────────────────────────────
// Original single-turn helper — UNCHANGED, used by all existing endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const askGemini = async (prompt, retryCount = 0) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-26b-a4b-it",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        thinkingBudget: 0, // Explicitly sets the thinking budget to zero
      }
    });
    let textResponse = result.response.text();

    // Remove the empty thought tags if they appear
    textResponse = textResponse.replace(/<\|channel>thought\n<channel\|>/g, '').trim();
    return textResponse;
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

// ─────────────────────────────────────────────────────────────────────────────
// Agentic multi-turn loop with function calling (document tools)
//
// @param {string} username  - the authenticated user (injected by controller)
// @param {Array}  history   - array of { role: "user"|"model", parts: [...] }
//                             The caller appends the latest user message before
//                             passing the history in.
// @returns {string} finalText - the assistant's natural-language reply
// ─────────────────────────────────────────────────────────────────────────────
export const runAgentLoop = async (username, history, systemContext = "") => {
  const MAX_TOOL_ROUNDS = 5; // safety guard against infinite loops

  // Prepend the system context if provided to help the model understand the current state
  let effectiveSystemPrompt = AGENT_SYSTEM_PROMPT;
  if (systemContext) {
    effectiveSystemPrompt += `\n\nCURRENT CONTEXT:\n${systemContext}\n`;
  }

  const model = genAI.getGenerativeModel({
    model: "gemma-4-26b-a4b-it",
    systemInstruction: effectiveSystemPrompt,
    tools: [{ functionDeclarations: documentToolDeclarations }],
  });

  // Start a chat session with the provided history so the model has context
  const chat = model.startChat({ history: history.slice(0, -1) }); // all but the last user message

  // Send the latest user message to kick off the loop
  const lastUserMessage = history[history.length - 1];
  let response = await chat.sendMessage(lastUserMessage.parts);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const candidate = response.response.candidates?.[0];
    if (!candidate) break;

    const parts = candidate.content?.parts ?? [];

    // Check if Gemini wants to call a tool
    const functionCallPart = parts.find((p) => p.functionCall);
    if (!functionCallPart) {
      // No more tool calls — return the text response
      break;
    }

    const { name, args } = functionCallPart.functionCall;
    console.log(`[AgentLoop] Tool called: ${name}`, args);

    // Execute the tool handler
    const handler = toolHandlers[name];
    let toolResult;
    if (handler) {
      toolResult = await handler(args, username);
    } else {
      toolResult = { success: false, error: `Unknown tool: ${name}` };
    }

    console.log(`[AgentLoop] Tool result for ${name}:`, toolResult);

    // Send the function result back to Gemini
    response = await chat.sendMessage([
      {
        functionResponse: {
          name,
          response: toolResult,
        },
      },
    ]);
  }

  // Extract the final text from the last response
  const finalText = response.response.text();
  
  // Track which tools were called (for frontend refresh logic)
  const toolsUsed = [];
  try {
    const historyEntries = await chat.getHistory();
    historyEntries.forEach(entry => {
      entry.parts.forEach(part => {
        if (part.functionCall) {
          toolsUsed.push(part.functionCall.name);
        }
      });
    });
  } catch (err) {
    console.warn("[runAgentLoop] Error extracting history for toolsUsed:", err.message);
  }

  return { finalText, toolsUsed };
};

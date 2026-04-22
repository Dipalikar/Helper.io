/**
 * geminiService.js  (OpenRouter edition)
 *
 * Uses OpenRouter's OpenAI-compatible API with 5 free models across
 * DIFFERENT providers so a single-provider 429 storm doesn't block everything.
 *
 * Free models (all support `tool_choice` + `tools`):
 *  1. meta-llama/llama-3.3-70b-instruct:free  – best instruction following, tool use
 *  2. nvidia/nemotron-3-nano-30b-a3b:free      – proven agentic MoE (NVIDIA)
 *  3. openai/gpt-oss-20b:free                  – OpenAI OSS, tool-use optimised
 *  4. nvidia/nemotron-3-super-120b-a12b:free   – larger NVIDIA fallback
 *  5. qwen/qwen3-coder:free                    – MoE 480B, last resort
 */

import axios from "axios";
import dotenv from "dotenv";
import { documentToolDeclarations } from "./documentTools.js";
import { toolHandlers } from "./documentToolHandlers.js";

dotenv.config();

// ─── OpenRouter configuration ─────────────────────────────────────────────────

const OR_BASE_URL = "https://openrouter.ai/api/v1";
const OR_HEADERS = {
  Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://helper.io",   // optional but recommended by OpenRouter
  "X-Title": "Helper.io",
};

// Model priority list — picked from DIFFERENT providers to survive single-provider 429 storms.
// All five explicitly support tool_choice + tools on OpenRouter's free tier.
const FREE_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",       // NVIDIA · 30B MoE · agentic-optimised (proven)
  "openai/gpt-oss-20b:free",                   // OpenAI OSS · 20B · designed for agentic tasks
  "nvidia/nemotron-3-super-120b-a12b:free",    // NVIDIA · 120B MoE · more capable fallback
  "qwen/qwen3-coder:free",                     // Alibaba · 480B MoE · last resort
];

// ─── System prompts ───────────────────────────────────────────────────────────

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

QUIZ / JSON RULE:
When asked to produce quiz questions or any structured JSON/array output, you MUST return ONLY the raw JSON array with no additional text, explanation, markdown code fences, or reasoning traces before or after it.
`;

const AGENT_SYSTEM_PROMPT = `
You are the Helper.io AI Assistant — a specialized technical learning tutor AND a personal document manager.

You have access to five tools that let you manage the user's personal documents:
  • create_document  — write a new note/document
  • update_document  — edit or expand an existing document
  • list_documents   — show the user's document library
  • get_document     — read the content of a specific document
  • delete_document  — permanently remove a document

CRITICAL TOOL-USE RULES (follow strictly):
- WHENEVER the user asks to "create", "write", "draft", "save", or "make" a note/document → you MUST call the create_document tool. Do NOT write the content as a plain text reply — use the tool.
- WHENEVER the user asks to "update", "edit", "add to", "expand", or "rewrite" a document → first call list_documents if you don't know the id, then call update_document. Never reply with the updated content as plain text.
- WHENEVER the user asks "what notes / documents do I have?" or "show my library" → call list_documents.
- WHENEVER the user asks to "show", "read", "open", or "summarize" a specific document → call get_document (call list_documents first if you don't know the id).
- WHENEVER the user asks to "delete" or "remove" a document → confirm the name, then call delete_document.
- Always produce high-quality, well-structured markdown for the content parameter of create_document / update_document.

CONTENT RULES:
1. Only handle technical topics (AWS, Cloud, DevOps, Programming, etc.).
2. Non-technical requests should be politely declined.
3. Be helpful, professional, and beginner-friendly.
4. Always use Markdown formatting in your text replies.
`;

// ─── Convert Gemini-style tool declarations → OpenAI-style function tools ────

/**
 * documentToolDeclarations uses Gemini schema (OBJECT / STRING / NUMBER).
 * OpenRouter expects OpenAI schema (object / string / number).
 * This converter normalises the casing.
 */
function toOpenAITools(declarations) {
  return declarations.map((decl) => ({
    type: "function",
    function: {
      name: decl.name,
      description: decl.description,
      parameters: normaliseSchema(decl.parameters),
    },
  }));
}

function normaliseSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;
  const result = { ...schema };
  if (result.type) result.type = result.type.toLowerCase();
  if (result.properties) {
    result.properties = Object.fromEntries(
      Object.entries(result.properties).map(([k, v]) => [k, normaliseSchema(v)])
    );
  }
  if (result.items) result.items = normaliseSchema(result.items);
  return result;
}

const OPENAI_TOOLS = toOpenAITools(documentToolDeclarations);

// ─── Core OpenRouter request helper ──────────────────────────────────────────

/**
 * Makes a chat completion request to OpenRouter, trying each model in order
 * until one succeeds.  Returns the full response data object.
 *
 * @param {Array}   messages  – OpenAI-format message array
 * @param {Object}  options   – extra body params (tools, tool_choice, …)
 */
async function openRouterChat(messages, options = {}) {
  let lastError;
  for (const model of FREE_MODELS) {
    try {
      const body = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 8192,
        ...options,
      };

      const response = await axios.post(`${OR_BASE_URL}/chat/completions`, body, {
        headers: OR_HEADERS,
        timeout: 90_000,
      });

      console.log(`[OpenRouter] ✓ Model used: ${model}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`[OpenRouter] ✗ Model ${model} failed (${status}): ${errMsg}`);
      lastError = err;
      // Only fall through to next model on rate-limit / overload errors
      const retryable = status === 429 || status === 502 || status === 503 || !status;
      if (!retryable) throw err;
    }
  }
  throw lastError;
}

// ─── Response cleaner (used by both askGemini and runAgentLoop) ──────────────

/**
 * Strips model-specific noise from a text response:
 *  - <think>…</think> reasoning blocks (Qwen3, DeepSeek, Nemotron)
 *  - Gemma channel tags
 *  - Markdown code fences wrapping bare JSON (for quiz responses)
 */
function cleanResponse(text) {
  if (!text) return "";
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  text = text.replace(/<\|channel\|>thought\n<channel\|>/g, "").trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return text;
}

// ─── Public: single-turn helper (summarize / quiz / doubt) ───────────────────

/**
 * askGemini — drop-in replacement for the old Gemini single-turn call.
 * Used by notesController for summarize, quiz, and doubt endpoints.
 * The SYSTEM_PROMPT contains a strict quiz/JSON rule so quiz responses
 * come back as raw JSON arrays without any wrapping text.
 *
 * @param {string} prompt
 * @returns {string} cleaned text response
 */
export const askGemini = async (prompt) => {
  const data = await openRouterChat([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: prompt },
  ]);

  const text = data.choices?.[0]?.message?.content ?? "";
  return cleanResponse(text);
};

// ─── Public: agentic multi-turn loop with function calling ───────────────────

/**
 * runAgentLoop — replaces the old Gemini function-calling loop.
 * Converts Gemini-style history to OpenAI messages, executes tool calls
 * via documentToolHandlers, and returns { finalText, toolsUsed }.
 *
 * @param {string} username      – authenticated user (injected by controller)
 * @param {Array}  history       – Gemini-style [{ role, parts: [{text}] }]
 * @param {string} systemContext – optional context appended to system prompt
 * @returns {{ finalText: string, toolsUsed: string[] }}
 */
export const runAgentLoop = async (username, history, systemContext = "") => {
  const MAX_TOOL_ROUNDS = 5;

  // Build effective system prompt
  let sysContent = AGENT_SYSTEM_PROMPT;
  if (systemContext) {
    sysContent += `\n\nCURRENT CONTEXT:\n${systemContext}\n`;
  }

  // Convert Gemini history format → OpenAI messages
  // Gemini: [{ role: "user"|"model", parts: [{ text }|{ functionCall }|{ functionResponse }] }]
  // OpenAI: [{ role: "user"|"assistant"|"tool", content, tool_calls?, tool_call_id? }]
  const messages = [{ role: "system", content: sysContent }];
  for (const entry of history) {
    convertGeminiEntry(entry, messages);
  }

  const toolsUsed = [];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const data = await openRouterChat(messages, {
      tools: OPENAI_TOOLS,
      tool_choice: "auto",
    });

    const choice = data.choices?.[0];
    if (!choice) break;

    const assistantMsg = choice.message;
    messages.push(assistantMsg); // add assistant turn to history

    // Check if the model wants to call tools
    const toolCalls = assistantMsg.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      // No tool calls — we have the final answer
      return {
        finalText: cleanResponse(assistantMsg.content ?? ""),
        toolsUsed,
      };
    }

    if (round === MAX_TOOL_ROUNDS) {
      // Safety guard — return whatever text we have
      return {
        finalText: cleanResponse(assistantMsg.content ?? "I've reached the maximum number of tool calls."),
        toolsUsed,
      };
    }

    // Execute each tool call and append results
    for (const tc of toolCalls) {
      const { id: toolCallId, function: fn } = tc;
      const fnName = fn.name;
      let args;
      try {
        args = JSON.parse(fn.arguments);
      } catch {
        args = {};
      }

      console.log(`[AgentLoop] Tool called: ${fnName}`, args);
      toolsUsed.push(fnName);

      const handler = toolHandlers[fnName];
      let toolResult;
      if (handler) {
        toolResult = await handler(args, username);
      } else {
        toolResult = { success: false, error: `Unknown tool: ${fnName}` };
      }

      console.log(`[AgentLoop] Tool result for ${fnName}:`, toolResult);

      messages.push({
        role: "tool",
        tool_call_id: toolCallId,
        content: JSON.stringify(toolResult),
      });
    }
  }

  return { finalText: "The agent loop ended without a final response.", toolsUsed };
};

// ─── Helper: convert a single Gemini history entry to OpenAI messages ────────

function convertGeminiEntry(entry, messages) {
  const role = entry.role === "model" ? "assistant" : entry.role; // "user" stays "user"
  const parts = entry.parts ?? [];

  for (const part of parts) {
    if (part.text !== undefined) {
      messages.push({ role, content: part.text });
    } else if (part.functionCall) {
      // Gemini model calling a tool → OpenAI assistant message with tool_calls
      messages.push({
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: `call_${Date.now()}`,
            type: "function",
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args ?? {}),
            },
          },
        ],
      });
    } else if (part.functionResponse) {
      // Gemini function result → OpenAI tool message
      messages.push({
        role: "tool",
        tool_call_id: `call_${Date.now()}`,
        content: JSON.stringify(part.functionResponse.response ?? {}),
      });
    }
  }
}

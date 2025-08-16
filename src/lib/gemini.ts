/**
 * @file Gemini API wrapper
 * This file provides functions to interact with the Gemini API using the @google/generative-ai SDK.
 */
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import dotenv from "dotenv";

export type BrowserCommand =
  | { command: "openUrl"; url: string }
  | { command: "search"; query: string }
  | { command: "clickElement"; selector: string }
  | { command: "takeScreenshot" }
  | { command: "wait"; ms: number };

// --- Configuration ---
const GEMINI_API_KEY = dotenv.config().parsed?.GEMINI_API_KEY;

// --- SDK Initialization ---
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY !== undefined) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.warn(
    "Gemini API key is not set. The agent will use mock data and will not be able to generate dynamic responses.",
  );
}

const textModel = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });
// Use a newer generation model that supports multimodal inputs directly.
const visionModel = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper to convert data URL to a Part object.
function fileToGenerativePart(dataUrl: string): Part {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  return {
    inlineData: {
      data: match[2],
      mimeType: match[1],
    },
  };
}

/**
 * Generates a list of browser commands from a natural language prompt.
 * @param prompt The user's natural language prompt.
 * @returns A promise that resolves to an array of browser commands.
 */
export async function generateBrowserCommands(
  prompt: string,
): Promise<BrowserCommand[]> {
  console.log(`Gemini: Generating commands for prompt: ${prompt}`);

  if (!textModel) {
    console.warn("Gemini model not initialized. Returning mock command.");
    if (prompt.includes("横浜の天気")) {
      return [
        { command: "search", query: "横浜の天気" },
        { command: "wait", ms: 2000 },
        { command: "takeScreenshot" },
      ];
    }
    return [{ command: "search", query: prompt }];
  }

  const systemPrompt = `
    You are a highly intelligent AI agent that controls a web browser to accomplish user goals.
    Based on the user's request, generate a step-by-step plan as a sequence of commands.

    **Available Commands:**
    - \`{ "command": "openUrl", "url": "..." }\`: Navigates to a specific URL.
    - \`{ "command": "search", "query": "..." }\`: Searches on Google.
    - \`{ "command": "clickElement", "selector": "..." }\`: Clicks an element using a CSS selector.
    - \`{ "command": "wait", "ms": ... }\`: Waits for a specified number of milliseconds.
    - \`{ "command": "takeScreenshot" }\`: Takes a screenshot of the current page for analysis.

    **Your Task:**
    1.  **Deconstruct the Goal:** Break down the user's request into a logical sequence of browser actions.
    2.  **Construct Selectors:** When you need to click something, create a precise CSS selector. Look for unique attributes like \`id\`, \`aria-label\`, or class names. For example, to click a menu button, you might use \`button[aria-label="Menu"]\`. To click a link with specific text, you might use \`a[href*="..."]\`.
    3.  **Ensure Page Load:** ALWAYS add a \`wait\` command (e.g., 2000-3000ms) after any \`openUrl\` or \`search\` or \`clickElement\` command that causes a page navigation, before you attempt to take a screenshot. This is critical for the page to load.
    4.  **Final Action:** The final command in your plan should almost always be \`takeScreenshot\`, so you can see the result of your actions and answer the user's question.

    **Example Goal:** "Google マップにアクセスして、私が最近訪れた場所を教えてください。"
    **Example Plan (Output):**
    [
      { "command": "openUrl", "url": "https://www.google.com/maps" },
      { "command": "wait", "ms": 3000 },
      { "command": "clickElement", "selector": "button[aria-label='Menu']" },
      { "command": "wait", "ms": 2000 },
      { "command": "clickElement", "selector": "a[href*='maps/timeline']" },
      { "command": "wait", "ms": 3000 },
      { "command": "takeScreenshot" }
    ]

    Your output must be ONLY the valid JSON array of command objects. Do not add any other text or markdown.

    **Now, generate the command plan for the following user request:**
    "${prompt}"
  `;

  try {
    const result = await textModel.generateContent(systemPrompt);
    const response = result.response;
    let jsonText = response.text();

    // Clean up potential markdown fences
    const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      jsonText = match[1];
    }

    const commands = JSON.parse(jsonText);
    return commands as BrowserCommand[];
  } catch (error) {
    console.error("Failed to generate browser commands:", error);
    return [{ command: "search", query: prompt }];
  }
}

/**
 * Generates a natural language response from the content gathered by the agent.
 * @param prompt The original user prompt.
 * @param imageDataUrl The screenshot of the browser content as a data URL.
 * @returns A promise that resolves to a natural language response.
 */
export async function generateFinalResponse(
  prompt: string,
  imageDataUrl: string,
): Promise<string> {
  console.log(`Gemini: Generating final response for prompt: ${prompt}`);

  if (!visionModel) {
    console.warn(
      "Gemini vision model not initialized. Returning mock response.",
    );
    return `これは「${prompt}」のスクリーンショットに基づいた回答のモックです。`;
  }

  const imagePart = fileToGenerativePart(imageDataUrl);
  const textPart = {
    text: `このスクリーンショットを見て、次の質問に答えてください: "${prompt}"`,
  };

  try {
    const result = await visionModel.generateContent({
      contents: [{ role: "user", parts: [imagePart, textPart] }],
    });
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Failed to generate final response:", error);
    return "申し訳ありません、画像を解析して応答を生成できませんでした。";
  }
}

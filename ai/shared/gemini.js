// src/lib/ai-config.js
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export function getAIModel() {
  const modelName = process.env.AI_MODEL || "gemini-3.1-flash-lite";

  if (modelName.startsWith("gpt")) {
    return openai(modelName);
  }
  
  return google(modelName);
}

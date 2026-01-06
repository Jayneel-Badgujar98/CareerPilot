// src/lib/ai-config.js
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export function getAIModel() {
  const modelName = process.env.AI_MODEL || "gemini-2.5-flash";

  if (modelName.startsWith("gpt")) {
    return openai(modelName);
  }
  
  // Default to Google (Gemini)
  // Gemini 1.5 Pro is recommended for complex JSON + Tool calling
  return google(modelName);
  
}
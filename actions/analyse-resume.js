"use server";

import { generateText, tool } from "ai";
import { getAIModel } from "@/lib/ai-config";
import { tavily } from "@tavily/core";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { z } from "zod";
import { ANALYZE_RESUME_PROMPT } from "@/lib/prompts"; // Assuming you saved your prompt here

// Initialize Tavily Client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Helper to extract text from files
 */
async function extractTextFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const type = file.type;

  try {
    if (type === "application/pdf") {
      const data = await pdf(buffer);
      return data.text;
    } 
    else if (
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      type.includes("word")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } 
    else if (type === "text/plain") {
      return buffer.toString("utf-8");
    } 
    else {
      throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
    }
  } catch (error) {
    console.error("File parsing error:", error);
    throw new Error("Failed to read file content.");
  }
}

/**
 * Main Server Action
 */
export async function analyzeResumeAction(formData) {
  try {
    const file = formData.get("file");

    if (!file) {
      throw new Error("No file uploaded");
    }

    // 1. Extract Text
    const resumeText = await extractTextFromFile(file);

    // 2. Prepare the AI Model
    const model = getAIModel();

    // 3. Call AI with Tools (Max 5 steps allows for search -> analyze -> refine)
    const { text } = await generateText({
      model: model,
      system: ANALYZE_RESUME_PROMPT,
      prompt: `
        Here is the resume content:
        ---
        ${resumeText}
        ---
        
        Analyze this resume. 
        CRITICAL: 
        1. If you need current salary data or market trends for 2025/2026, use the 'getMarketData' tool. 
        2. Do NOT guess the salary range. Search for it.
        3. Return ONLY the JSON object as specified in the system prompt.
      `,
      tools: {
        getMarketData: tool({
          description: "Search for real-time salary ranges, job market trends, and demand for specific roles in 2025/2026.",
          parameters: z.object({
            query: z.string().describe("The search query, e.g., 'Senior React Developer salary USD 2026' or 'Frontend Developer market trend'"),
          }),
          execute: async ({ query }) => {
            console.log(`[Tool Call] Searching Tavily for: ${query}`);
            const searchResult = await tvly.search(query, {
              search_depth: "basic", // 'advanced' is better but slower/more expensive
              max_results: 3,
            });
            
            // Return a summarized context string to the AI
            return searchResult.results.map(r => `${r.title}: ${r.content}`).join("\n");
          },
        }),
      },
      maxSteps: 5, // Allow the AI to loop (Thought -> Call Tool -> Get Result -> Final Answer)
    });

    // 4. Parse JSON safely
    // LLMs sometimes wrap code in ```json ... ```. We clean that up.
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Analysis Error:", error);
    return { 
      error: error.message || "Something went wrong during analysis." 
    };
  }
}
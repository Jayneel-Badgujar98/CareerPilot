// // "use server";

// // import { generateText, tool } from "ai";
// // import { getAIModel } from "@/lib/resumeAnalyse/ai-config";
// // import { tavily } from "@tavily/core";
// // import mammoth from "mammoth";
// // import { z } from "zod";
// // import { ANALYZE_RESUME_PROMPT } from "@/lib/Prompts/AnalyseResumePrompt";
// // import Tesseract from 'tesseract.js';
// // import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// // import { join } from 'path';

// // // Initialize Tavily Client
// // const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// // /**
// //  * Helper to extract text from files
// //  */
// // import { pathToFileURL } from 'url';

// // // Configure worker for Node.js environment
// // // We use the absolute path to the worker file in node_modules, converted to a file URL for Windows compatibility
// // const workerPath = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
// // pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;


// // export async function extractTextFromFile(file) {
// //   try {
// //     const arrayBuffer = await file.arrayBuffer();
// //     const buffer = Buffer.from(arrayBuffer);
// //     const contentType = file.type;

// //     if (contentType === "application/pdf") {
// //       // Use pdfjs-dist directly
// //       const doc = await pdfjs.getDocument({
// //         data: new Uint8Array(arrayBuffer), // pdfjs expects Uint8Array or similar
// //         useSystemFonts: true,
// //       }).promise;

// //       let fullText = "";
// //       for (let i = 1; i <= doc.numPages; i++) {
// //         const page = await doc.getPage(i);
// //         const textContent = await page.getTextContent();
// //         const pageText = textContent.items.map(item => item.str).join(' ');
// //         fullText += pageText + "\n";
// //       }
// //       console.log(fullText) ;
// //       return fullText;
// //     } else if (
// //       contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
// //       file.name.endsWith(".docx")
// //     ) {
// //       const result = await mammoth.extractRawText({ buffer });
// //       return result.value;
// //     } else if (contentType === "text/plain" || file.name.endsWith(".txt")) {
// //       return buffer.toString();
// //     } else {
// //       throw new Error("Unsupported file type");
// //     }
// //   } catch (err) {
// //     console.error("Text extraction error:", err);
// //     throw new Error("Failed to extract text from file");
// //   }
// // }

// // // --- MAIN ACTION ---
// // export async function analyzeResumeAction(formData) {
// //   try {
// //     const file = formData.get("file");
// //     if (!file) throw new Error("No file uploaded");

// //     const resumeText = await extractTextFromFile(file);
// //     const model = getAIModel();

// //     console.log("Starting Analysis...");

// //     const result = await generateText({
// //       model: model,
// //       system: ANALYZE_RESUME_PROMPT,
// //       prompt: `
// //         RESUME TEXT:
// //         ${resumeText}
        
// //         TASK:
// //         1. Analyze the resume.
// //         2. Call 'getMarketData' to get 2026 salary trends.
// //         3. AFTER the tool runs, you MUST generate the final JSON.
        
// //         CRITICAL: Return ONLY the JSON object. No markdown, no "Here is the JSON".
// //       `,
// //       tools: {
// //         getMarketData: tool({
// //           description: "Search for real-time salary ranges and job market trends for 2026.",
// //           parameters: z.object({
// //             query: z.string().describe("The specific search query, e.g., 'React Developer Salary 2026'"),
// //           }),
// //           execute: async (args) => {
// //             // --- FIX: ROBUST ARGUMENT HANDLING ---
// //             // Sometimes the AI passes the query as a string directly, or inside an object.
// //             // We check both.
// //             const query = args.query || args; 
            
// //             console.log(`[Tool] Raw Args:`, JSON.stringify(args)); // Debug log
            
// //             if (!query || typeof query !== 'string') {
// //                 console.log("[Tool] Query missing, asking AI to retry.");
// //                 return "ERROR: You forgot to provide the 'query' parameter. Please call the tool again with a valid search string.";
// //             }

// //             console.log(`[Tool] Searching Tavily for: ${query}`);
            
// //             try {
// //               const search = await tvly.search(query, { 
// //                   search_depth: "basic",
// //                   max_results: 3 
// //               });
              
// //               const results = search.results.map(r => `${r.title}: ${r.content}`).join("\n");
// //               return results || "No specific salary data found. Estimate based on general market knowledge.";
// //             } catch (e) {
// //               console.error("[Tool] Tavily Error:", e);
// //               return "Error connecting to search service. Please estimate salary based on internal knowledge.";
// //             }
// //           },
// //         }),
// //       },
// //       maxSteps: 5, 
// //     });

// //     const text = result.text;
// //     console.log("AI Final Response Length:", text.length);

// //     // --- JSON EXTRACTION ---
// //     const firstBrace = text.indexOf('{');
// //     const lastBrace = text.lastIndexOf('}');

// //     if (firstBrace === -1 || lastBrace === -1) {
// //        console.error("Failed Response:", text);
// //        // Fallback: If AI fails to give JSON, throw error to UI
// //        throw new Error("The AI analyzed the resume but failed to format the output correctly. Please try again.");
// //     }

// //     const cleanJson = text.substring(firstBrace, lastBrace + 1);
// //     return JSON.parse(cleanJson);

// //   } catch (error) {
// //     console.error("Analysis Failed:", error);
// //     return { error: error.message || "Analysis failed" };
// //   }
// // }


// "use server";

// // --- UPDATED: Imported generateObject ---
// import { generateObject, tool } from "ai"; 
// import { getAIModel } from "@/lib/resumeAnalyse/ai-config";
// import { tavily } from "@tavily/core";
// import mammoth from "mammoth";
// import { z } from "zod";
// import { ANALYZE_RESUME_PROMPT } from "@/lib/Prompts/AnalyseResumePrompt";
// import Tesseract from 'tesseract.js';
// import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// import { join } from 'path';

// // Initialize Tavily Client
// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// // --- NEW: Zod Schema for Strict JSON Output ---
// const ResumeSchema = z.object({
//   overallScore: z.string().describe("Score out of 100, e.g., '82/100'"),
//   summary: z.object({
//     profileType: z.enum(["Student", "Fresher", "Junior", "Mid-level", "Senior", "Career Switcher"]),
//     seniorityEstimate: z.enum(["Entry", "Mid", "Senior", "Staff", "Lead"]),
//     yearsOfExperience: z.string().describe("Estimated years, e.g., '5+ Years'"),
//     overallAssessment: z.string().describe("2-3 sentence high-level professional summary"),
//   }),
//   interviewerPerspective: z.object({
//     thought: z.string().describe("Internal monologue of a hiring manager."),
//     sentiment: z.enum(["Positive", "Neutral", "Cautiously Optimistic", "Skeptical"]),
//     hiringProbability: z.enum(["Low", "Medium", "High"]),
//   }),
//   salary: z.object({
//     estimatedRange: z.string().describe("e.g., '$90k - $120k'"),
//     currency: z.string().default("USD"),
//     marketTrend: z.enum(["Low Demand", "Stable", "High Demand"]),
//   }),
//   strengths: z.array(z.object({
//     title: z.string(),
//     description: z.string(),
//   })),
//   weaknesses: z.array(z.object({
//     title: z.string(),
//     severity: z.enum(["Low", "Medium", "High"]),
//     description: z.string(),
//   })),
//   improvements: z.array(z.object({
//     issue: z.string(),
//     section: z.string(),
//     whyItMatters: z.string(),
//     exampleFix: z.string(),
//   })),
//   recommendedProjects: z.array(z.object({
//     name: z.string(),
//     tech: z.string(),
//     goal: z.string(),
//   })),
//   performanceMetrics: z.object({
//     impact: z.object({ score: z.number(), reason: z.string() }),
//     technicalDepth: z.object({ score: z.number(), reason: z.string() }),
//     formatting: z.object({ score: z.number(), reason: z.string() }),
//     brevity: z.object({ score: z.number(), reason: z.string() }),
//     atsKeywords: z.object({ score: z.number(), reason: z.string() }),
//   }),
//   atsChecklist: z.array(z.object({
//     item: z.string(),
//     status: z.enum(["pass", "fail", "partial"]),
//     note: z.string(),
//   })),
//   keywords: z.object({
//     present: z.array(z.string()),
//     missing: z.array(z.string()),
//   }),
//   jobFit: z.object({
//     matches: z.array(z.object({
//       role: z.string(),
//       match: z.number(),
//     })),
//     reasoning: z.string(),
//   }),
//   actionItems: z.array(z.object({
//     priority: z.enum(["high", "medium", "low"]),
//     action: z.string(),
//     estimatedImpact: z.enum(["Low", "Medium", "High"]),
//   })),
//   proTips: z.array(z.string()),
// });

// /**
//  * Helper to extract text from files
//  */
// import { pathToFileURL } from 'url';

// // Configure worker for Node.js environment
// // We use the absolute path to the worker file in node_modules, converted to a file URL for Windows compatibility
// const workerPath = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
// pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;


// export async function extractTextFromFile(file) {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const contentType = file.type;

//     if (contentType === "application/pdf") {
//       // Use pdfjs-dist directly
//       const doc = await pdfjs.getDocument({
//         data: new Uint8Array(arrayBuffer), // pdfjs expects Uint8Array or similar
//         useSystemFonts: true,
//       }).promise;

//       let fullText = "";
//       for (let i = 1; i <= doc.numPages; i++) {
//         const page = await doc.getPage(i);
//         const textContent = await page.getTextContent();
//         const pageText = textContent.items.map(item => item.str).join(' ');
//         fullText += pageText + "\n";
//       }
//       console.log(fullText) ;
//       return fullText;
//     } else if (
//       contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//       file.name.endsWith(".docx")
//     ) {
//       const result = await mammoth.extractRawText({ buffer });
//       return result.value;
//     } else if (contentType === "text/plain" || file.name.endsWith(".txt")) {
//       return buffer.toString();
//     } else {
//       throw new Error("Unsupported file type");
//     }
//   } catch (err) {
//     console.error("Text extraction error:", err);
//     throw new Error("Failed to extract text from file");
//   }
// }

// /**
//  * Main Server Action
//  */
// export async function analyzeResumeAction(formData) {
//   try {
//     const file = formData.get("file");
//     if (!file) throw new Error("No file uploaded");

//     // 1. Extract Text
//     const resumeText = await extractTextFromFile(file);

//     // 2. Prepare AI
//     const model = getAIModel();

//     console.log("Starting Analysis with generateObject...");

//     // 3. Call AI using generateObject (Forces JSON)
//     const { object } = await generateObject({
//       model: model,
//       schema: ResumeSchema, // <--- Passes the strict schema
//       system: ANALYZE_RESUME_PROMPT,
//       prompt: `
//         RESUME CONTENT:
//         ----------------
//         ${resumeText}
//         ----------------
        
//         INSTRUCTIONS:
//         1. Analyze the resume deeply.
//         2. You MUST use the 'getMarketData' tool to find 2026 salary trends.
//         3. Do not guess salaries. Search first.
//       `,
//       tools: {
//         getMarketData: tool({
//           description: "Search for real-time salary ranges and job market trends for 2026.",
//           parameters: z.object({
//             query: z.string().describe("The specific search query, e.g., 'React Developer Salary 2026'"),
//           }),
//           execute: async (args) => {
//             // Robust Argument Handling
//             const query = args.query || args; 
            
//             console.log(`[Tool] Raw Args:`, JSON.stringify(args));
            
//             if (!query || typeof query !== 'string') {
//                 return "ERROR: Query parameter missing. Please try again with a valid search string.";
//             }

//             console.log(`[Tool] Searching Tavily for: ${query}`);
            
//             try {
//               const search = await tvly.search(query, { 
//                   search_depth: "basic",
//                   max_results: 3 
//               });
              
//               const results = search.results.map(r => `${r.title}: ${r.content}`).join("\n");
//               return results || "No specific salary data found. Estimate based on general market knowledge.";
//             } catch (e) {
//               console.error("[Tool] Tavily Error:", e);
//               return "Error connecting to search service. Please estimate salary based on internal knowledge.";
//             }
//           },
//         }),
//       },
//       maxSteps: 5, 
//     });

//     console.log("Analysis Complete. Score:", object.overallScore);
    
//     // Return the clean object directly
//     return object;

//   } catch (error) {
//     console.error("Analysis Failed:", error);
//     return { error: error.message || "Analysis failed" };
//   }
// }


"use server";

import { generateObject, tool } from "ai"; 
import { getAIModel } from "@/lib/resumeAnalyse/ai-config";
import { tavily } from "@tavily/core";
import mammoth from "mammoth";
import { z } from "zod";
import { ANALYZE_RESUME_PROMPT } from "@/lib/Prompts/AnalyseResumePrompt";
import { join } from 'path';
import { pathToFileURL } from 'url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Initialize Tavily Client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Configure PDF Worker
const workerPath = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

// --- UPDATED ZOD SCHEMA WITH PREDICTIONS ---
const ResumeSchema = z.object({
  overallScore: z.string().describe("Score out of 100, e.g., '82/100'"),
  summary: z.object({
    profileType: z.enum(["Student", "Fresher", "Junior", "Mid-level", "Senior", "Career Switcher"]),
    seniorityEstimate: z.enum(["Entry", "Mid", "Senior", "Staff", "Lead"]),
    yearsOfExperience: z.string().describe("Estimated years, e.g., '5+ Years'"),
    overallAssessment: z.string().describe("2-3 sentence high-level professional summary"),
  }),
  // ... (Existing fields remain the same) ...
  interviewerPerspective: z.object({
    thought: z.string(),
    sentiment: z.enum(["Positive", "Neutral", "Cautiously Optimistic", "Skeptical"]),
    hiringProbability: z.enum(["Low", "Medium", "High"]),
  }),
  salary: z.object({
    estimatedRange: z.string(),
    currency: z.string(),
    marketTrend: z.enum(["Low Demand", "Stable", "High Demand"]),
  }),
  strengths: z.array(z.object({ title: z.string(), description: z.string() })),
  weaknesses: z.array(z.object({ title: z.string(), severity: z.enum(["Low", "Medium", "High"]), description: z.string() })),
  improvements: z.array(z.object({ issue: z.string(), section: z.string(), whyItMatters: z.string(), exampleFix: z.string() })),
  recommendedProjects: z.array(z.object({ name: z.string(), tech: z.string(), goal: z.string() })),
  performanceMetrics: z.object({
    impact: z.object({ score: z.number(), reason: z.string() }),
    technicalDepth: z.object({ score: z.number(), reason: z.string() }),
    formatting: z.object({ score: z.number(), reason: z.string() }),
    brevity: z.object({ score: z.number(), reason: z.string() }),
    atsKeywords: z.object({ score: z.number(), reason: z.string() }),
  }),
  atsChecklist: z.array(z.object({ item: z.string(), status: z.enum(["pass", "fail", "partial"]), note: z.string() })),
  keywords: z.object({ present: z.array(z.string()), missing: z.array(z.string()) }),
  jobFit: z.object({ matches: z.array(z.object({ role: z.string(), match: z.number() })), reasoning: z.string() }),
  actionItems: z.array(z.object({ priority: z.enum(["high", "medium", "low"]), action: z.string(), estimatedImpact: z.enum(["Low", "Medium", "High"]) })),
  proTips: z.array(z.string()),

  // --- NEW FIELD: IMPROVEMENT PREDICTION ---
  improvementPrediction: z.object({
    interviewChance: z.string().describe("Estimated % increase in interview callbacks if fixes are applied (e.g. '+40%'). Be optimistic but realistic."),
    salaryBoost: z.string().describe("Estimated salary increase potential (e.g. '+ $15k' or '+20%')."),
    summary: z.string().describe("Short punchy text on why they should use the AI builder."),
  }),
});

// --- TEXT EXTRACTION (Kept exactly as requested) ---
export async function extractTextFromFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type;

    if (contentType === "application/pdf") {
      const doc = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      }).promise;

      let fullText = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
      }
      return fullText;
    } else if (
      contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (contentType === "text/plain" || file.name.endsWith(".txt")) {
      return buffer.toString();
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (err) {
    console.error("Text extraction error:", err);
    throw new Error("Failed to extract text from file");
  }
}

// --- MAIN ACTION ---
export async function analyzeResumeAction(formData) {
  try {
    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded");

    const resumeText = await extractTextFromFile(file);
    const model = getAIModel();

    console.log("Starting Analysis...");

    const { object } = await generateObject({
      model: model,
      schema: ResumeSchema, 
      system: ANALYZE_RESUME_PROMPT,
      prompt: `
        RESUME CONTENT:
        ----------------
        ${resumeText}
        ----------------
        
        INSTRUCTIONS:
        1. Analyze the resume deeply.
        2. Call 'getMarketData' to find 2026 or any other latest year salary trends for this specific role.
        3. CRITICAL: Calculate the 'improvementPrediction' fields based on the gaps found. 
           (e.g., If they are missing key keywords, interview chance increases significantly if added).
      `,
      tools: {
        getMarketData: tool({
          description: "Search for real-time salary ranges and job market trends for 2026.",
          parameters: z.object({
            query: z.string().describe("The specific search query, e.g., 'React Developer Salary 2026'"),
          }),
          execute: async (args) => {
            const query = args.query || args; 
            if (!query || typeof query !== 'string') return "ERROR: Query parameter missing.";
            
            try {
              const search = await tvly.search(query, { search_depth: "basic", max_results: 3 });
              const results = search.results.map(r => `${r.title}: ${r.content}`).join("\n");
              return results || "No specific salary data found.";
            } catch (e) {
              return "Error connecting to search service.";
            }
          },
        }),
      },
      maxSteps: 5, 
    });

    // At the end of the function:
    return { ...object, originalText: resumeText };

  } catch (error) {
    console.error("Analysis Failed:", error);
    return { error: error.message || "Analysis failed" };
  }
}
// actions/analyse-resume.js

"use server";

import { generateObject, tool } from "ai";
import { getAIModel } from "@/ai/shared/gemini";
import { tavily } from "@tavily/core";
import mammoth from "mammoth";
import { z } from "zod";
import { ANALYZE_RESUME_PROMPT } from "@/ai/resume/prompts";
import PdfParser from "pdf2json";
import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI Client
const googleGenAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });

// Initialize Tavily Client
// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });


const ResumeSchema = z.object({
  overallScore: z.string().describe("Overall resume score out of 100, formatted strictly as 'X/100' (e.g., '82/100')."),
  
  summary: z.object({
    profileType: z.enum(["Student", "Fresher", "Junior", "Mid-level", "Senior", "Career Switcher"]),
    seniorityEstimate: z.enum(["Entry", "Mid", "Senior", "Staff", "Lead"]),
    yearsOfExperience: z.string().describe("Estimated total years of experience, e.g., '0 Years', '1-2 Years', '5+ Years'."),
    overallAssessment: z.string().describe("A concise 2-3 sentence high-level professional summary analyzing their background."),
  }),
  
  interviewerPerspective: z.object({
    thought: z.string().describe("Internal monologue/rationale of the recruiter or hiring manager looking at this resume. Raw and honest feedback."),
    sentiment: z.enum(["Positive", "Neutral", "Cautiously Optimistic", "Skeptical"]),
    hiringProbability: z.enum(["Low", "Medium", "High"]),
  }),
  
  salary: z.object({
    estimatedRange: z.string().describe("Estimated market salary range based on the profile and geography, e.g., '₹6,000,000 - ₹9,000,000' or '$80,000 - $110,000'."),
    currency: z.string().describe("Three-letter ISO currency code representing the market rate context, e.g., 'INR', 'USD', 'EUR'."),
    marketTrend: z.enum(["Low Demand", "Stable", "High Demand"]),
  }),
  
  strengths: z.array(
    z.object({ 
      title: z.string().describe("Short punchy name of the strength (e.g., 'Strong Technical Stack')."), 
      description: z.string().describe("Detailed explanation of where this strength is evident in the resume.") 
    })
  ),
  
  weaknesses: z.array(
    z.object({ 
      title: z.string().describe("Name of the issue identified (e.g., 'Lack of Quantifiable Impact')."), 
      severity: z.enum(["Low", "Medium", "High"]), 
      description: z.string().describe("Detailed breakdown of why this hurts the resume's effectiveness.") 
    })
  ),
  
  improvements: z.array(
    z.object({ 
      issue: z.string().describe("What exactly needs fixing."), 
      section: z.string().describe("The specific resume section where the fix belongs (e.g., 'Experience', 'Projects')."), 
      whyItMatters: z.string().describe("The professional reason why making this change will increase conversion."), 
      exampleFix: z.string().describe("A concrete, fully rewritten before/after example showing how to fix the issue.") 
    })
  ),
  
  recommendedProjects: z.array(
    z.object({ 
      name: z.string().describe("Title of a high-impact project they should build next to fill current gaps."), 
      tech: z.string().describe("Comma-separated list of modern technologies they should use for this project (e.g., 'Next.js, LangGraph, Prisma')."), 
      goal: z.string().describe("The primary objective and learning/career outcome of this project.") 
    })
  ),
  
  recommendedSkills: z.array(
    z.object({ 
      name: z.string().describe("Name of the trending or missing skill/tool."), 
      demandStatus: z.enum(["Very High", "High", "Medium", "Low"]), 
      reason: z.string().describe("Short reasoning for the demand status like what it is, what it does, and why it is in demand currently.") 
    })
  ),
  
  projectAnalysis: z.array(
    z.object({
      projectName: z.string().describe("Name of the project parsed from the resume."),
      projectScore: z.number().min(0).max(100).describe("Individual evaluation score for this specific project based on impact and tech depth."),
      summary: z.string().describe("1-2 sentence overall evaluation of the project's complexity and description quality."),
      
      strengths: z.array(
        z.object({
          title: z.string().describe("Key highlight of the project (e.g., 'Excellent Architecture')."),
          description: z.string().describe("Elaboration on what makes this project highlight stand out.")
        })
      ),
      
      weaknesses: z.array(
        z.object({
          title: z.string().describe("A gap in the project description (e.g., 'Missing Deployment Link', 'Vague Architecture')."),
          severity: z.enum(["Low", "Medium", "High"]),
          description: z.string().describe("Detailed feedback on what is missing or weak.")
        })
      ),
      
      improvements: z.array(
        z.object({
          issue: z.string().describe("The specific technical or descriptive flaw."),
          whyItMatters: z.string().describe("Why fixing this description or feature increases technical credibility."),
          exampleFix: z.string().describe("An action-oriented rewritten bullet point for their project section.")
        })
      ),
    })
  ).describe("Array analyzing individual projects explicitly listed in the resume."),
  
  performanceMetrics: z.object({
    impact: z.object({ score: z.number().min(0).max(100), reason: z.string().describe("Evaluation of metrics, data, and business/technical results achieved.") }),
    technicalDepth: z.object({ score: z.number().min(0).max(100), reason: z.string().describe("Evaluation of complexity, tools, and engineering engineering rigor shown.") }),
    formatting: z.object({ score: z.number().min(0).max(100), reason: z.string().describe("Evaluation of visual layout, typography consistency, and ATS scannability.") }),
    brevity: z.object({ score: z.number().min(0).max(100), reason: z.string().describe("Evaluation of word economy—avoiding fluff and walls of text.") }),
    atsKeywords: z.object({ score: z.number().min(0).max(100), reason: z.string().describe("Evaluation of the density and accuracy of role-relevant keywords.") }),
  }),
  
  atsChecklist: z.array(
    z.object({ 
      item: z.string().describe("Standard ATS compliance check (e.g., 'Single Column Layout', 'No Tables/Images', 'Contact Info Present')."), 
      status: z.enum(["pass", "fail", "partial"]), 
      note: z.string().describe("Brief note explaining why it passed or failed, and how to rectify it if needed.") 
    })
  ),
  
  keywords: z.object({
    present: z.array(z.string()).describe("Important industry-standard keywords successfully detected in the resume."),
    missing: z.array(z.string()).describe("High-value target keywords that are absent but highly recommended for their target profile Type.")
  }),
  
  jobFit: z.object({
    matches: z.array(
      z.object({ 
        role: z.string().describe("Job title/role name (e.g., 'Full-Stack Developer', 'Frontend Engineer')."), 
        match: z.number().min(0).max(100).describe("Percentage score representing alignment with this role.") 
      })
    ),
    reasoning: z.string().describe("Comprehensive logic explaining why they fit these roles and what gaps prevent a 100% match.")
  }),
  
  actionItems: z.array(
    z.object({ 
      priority: z.enum(["high", "medium", "low"]), 
      action: z.string().describe("Immediate, concrete action the user should take (e.g., 'Convert layout to single-column', 'Add GitHub links')."), 
      estimatedImpact: z.enum(["Low", "Medium", "High"]) 
    })
  ).describe("Prioritized list of execution steps for the user to optimize their resume."),
  
  proTips: z.array(z.string().describe("Insider recruitment hacks or unconventional but high-conversion resume tips customized to their experience level.")),
  
  improvementPrediction: z.object({
    interviewChance: z.string().describe("Estimated % increase in interview callbacks if fixes are applied (e.g. '+40%'). Be optimistic but realistic."),
    salaryBoost: z.string().describe("Estimated salary increase potential (e.g. '+ $15k' or '+20%')."),
    summary: z.string().describe("Short punchy persuasive text explaining why using the AI platform's builder tools will secure these improvements."),
  }),
});


export async function extractTextFromFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type;

    if (contentType === "application/pdf") {

      const parser = new PdfParser(null, 1); // 1 = text content only

      return await new Promise((resolve, reject) => {
        parser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
        parser.on("pdfParser_dataReady", () => {
          // pdf2json returns text content slightly differently, we extract it here
          const rawText = parser.getRawTextContent();
          resolve(rawText);
        });
        parser.parseBuffer(buffer);
      });

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

// -- MAIN ACTION

export async function analyzeResumeAction(formData) {
  try {
    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded");

    const resumeText = await extractTextFromFile(file);
    const model = getAIModel();

    console.log("Starting Analysis with Google Search...");

    // Step 1: Query Google Search for real-time trends based on candidate stack & location
    let googleSearchContext = "";
    try {
      console.log("[Google Search] Running real-time search queries...");
      const searchResponse = await googleGenAIClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          Analyze the candidate's resume and perform a Google Search to find:
          1. The current (2026) salary benchmarks for their specific target role, tech stack, and location.
          2. Trending skills and modern high-demand tools they are missing.
          3. Top 3 high-impact portfolio projects currently desired by recruiters for this exact stack.

          RESUME TEXT:
          ----------------
          ${resumeText}
          ----------------
        `,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      googleSearchContext = searchResponse.text;
      const queries = searchResponse.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
      console.log("[Google Search] Executed queries:", queries);
    } catch (searchError) {
      console.error("[Google Search] Error during web search:", searchError);
      googleSearchContext = "No real-time data retrieved due to a connection error. Estimate based on general 2026 market standards.";
    }

    console.log("[Google Search] Context retrieved. Generating structured analysis...");

    // Step 2: Call Vercel AI SDK generateObject with Google Search results injected
    const { object } = await generateObject({
      model: model,
      schema: ResumeSchema,
      system: ANALYZE_RESUME_PROMPT,
      prompt: `
        RESUME CONTENT:
        ----------------
        ${resumeText} 
        ----------------
        
        REAL-TIME GOOGLE SEARCH MARKET DATA (2026):
        ----------------
        ${googleSearchContext}
        ----------------
        
        INSTRUCTIONS:
        1. Analyze the resume deeply against the provided real-time Google search market data and 2026 industry standards.
        2. Identify the candidate's target job title, core technology stack, and geographic location from their resume, and map them to the salary benchmarks found.
        3. Evaluate EACH and EVERY project explicitly listed in the resume (e.g., 'NEXTMIND AI', 'DeepMind AI Research Agent', 'Career Pilot') in the 'projectAnalysis' array. You MUST generate an analysis entry for every single project listed on the resume. Do not truncate the list of projects.
        4. Fill out the recommended skills, recommended projects, salary range, and currency context based on the live Google search data.
        5. CRITICAL: Calculate the 'improvementPrediction' fields based on the gaps found.
      `,
    });

    console.log("Analysis Completed Successfully. Score:", object.overallScore);

    // At the end of the function:
    return { ...object, originalText: resumeText };

  } catch (error) {
    console.error("Analysis Failed:", error);
    return { error: error.message || "Analysis failed" };
  }
}
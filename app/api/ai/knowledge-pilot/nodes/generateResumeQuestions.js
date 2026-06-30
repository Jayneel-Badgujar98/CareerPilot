// app/api/ai/knowledge-pilot/nodes/generateResumeQuestions.js
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { CONFIG } from "../config";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const model = new ChatGoogle({
    model: "gemini-3.1-flash-lite",
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    temperature: 0.2, // Slightly increased for diverse, sharp interview scenarios
});

export async function generateResumeQuestions(state) {
    try {
        console.log("--- STARTING DYNAMIC RESUME SPECIFIC INTERVIEW QUESTION GENERATION ---");
        const { extractedText, assessmentType, assessmentLength, difficulty, instructions } = state;

        if (!extractedText) {
            throw new Error("No resume text found in Graph State.");
        }

        // Tailored to handle all professions seamlessly with specialized software engineering focus
        const ResumeQuestionSchema = model.withStructuredOutput(
            z.object({
                metadata: z.object({
                    documentType: z.literal("resume"),
                    difficulty: z.enum(["easy", "medium", "hard"]),
                    assessmentType: z.enum(["mcq", "mcq_theory"]),
                    assessmentLength: z.enum(["quick", "standard", "comprehensive"]),
                    questionsInstructions : z.string().optional().describe("The Instructions given to generate the questions "),
                    candidateName: z.string().optional().describe("Extracted name of the applicant"),
                    professionDomain: z.string().describe("Identified primary domain/profession (e.g., Software Engineering, Marketing, Finance, Product Management)"),
                    primarySkillsOrTechStack: z.array(z.string()).describe("Core skills, frameworks, technologies, or tools identified in the resume"),
                }),
                mcqs: z.array(
                    z.object({
                        topic: z.string().describe("The specific micro-topic this question belongs to (e.g. Git, React Hooks, Node.js Events, REST APIs, SQL Joins)"),
                        question: z.string(),
                        options: z.array(z.string()).length(4),
                        answer: z.string(),
                        explanation: z.string().describe("Why this is correct based on professional industry standards, core concepts, or resume context"),
                    })
                ),
                theory: z.array(
                    z.object({
                        topic: z.string().describe("The specific micro-topic this question belongs to (e.g. Git, React Hooks, Node.js Events, REST APIs, SQL Joins)"),
                        category: z.enum(["project_deep_dive", "strategy_and_design", "metric_verification", "behavioral"]),
                        question: z.string(),
                        expectedAnswer: z.string().describe("Expected Answer, ideal professional response highlighting methodologies, core architecture, metrics, or frameworks"),
                    })
                ).default([]),
            })
        );

        // Fallback or setup configuration parameters via CONFIG mapping
        const questionConfig = CONFIG[assessmentType][assessmentLength];

        const resumeSystemPrompt = `You are a brutal, highly sophisticated Expert Interview Panelist, Hiring Manager, and Elite Talent Recruiter across multiple industries. 
Your objective is to thoroughly audit, dissect, and generate highly targeted interview questions based strictly on the candidate's Resume.

ADAPTIVE DOMAIN ALIGNMENT (CRITICAL):
- Dynamically detect the candidate's profession (e.g., Software Engineering, Marketing, Finance, Data Science, HR, Sales).
- SOFTWARE DEVELOPMENT SPECIAL FOCUS: If the candidate is a Software Developer/Engineer, elevate the technical depth. Focus heavily on software architectures, tech stack, data structures, algorithms, system design patterns, state management, and debugging.
- OTHER PROFESSIONS: Focus on their domain-specific methodologies, compliance, strategic frameworks, toolsets (e.g., Salesforce, Excel modeling, Google Analytics), and operational execution.

CRITICAL INTERVIEW MODES & PARADIGMS:
1. TARGETED RESUME AUDITING: Focus deeply on the candidate's listed Projects, Case Studies, Core Competencies, and claimed quantitative metrics (e.g., efficiency boosts, conversion rates, latency reductions, cost optimizations, revenue growth).
2. DISTRIBUTED CATEGORIZATION (For Theory/Open-Ended):
   - 'project_deep_dive': Challenge implementation details, workflow choices, resource management, or choices of tools/frameworks used in their specific domain. For developers, cross-examine database choice, caching models, or backend/frontend workflows.
   - 'strategy_and_design': Test their design or strategy capabilities. Scale their initiatives. Ask how their plan/architecture handles edge cases, systemic growth, failure points, or constraints.
   - 'metric_verification': Cross-examine claims. If they claim 'reduced churn by 20%', '40% cost reduction', or '<20ms API latency', ask precisely how they tracked, benchmarked, and validated that metric.
   - 'behavioral': Situational professional questions tailored to their domain, seniority level, and team dynamics.
3. DIFFICULTY CALIBRATION:
   - 'easy': Straightforward domain terminology, syntax/tool basics, or simple explanations of their day-to-day responsibilities.
   - 'medium': Trade-off analysis (e.g., why a specific approach/tool was chosen over alternatives), process troubleshooting, and scenario-based execution.
   - 'hard': Complex system/strategic failures, advanced optimization, disaster recovery, security risks, ethical dilemmas, or extreme scaling challenges under high constraints.
4. MCQ STRUCTURE:
   - Provide highly contextual domain/technical questions mapped to the core capabilities they explicitly claim to know.
   - Distractors must look highly authentic and challenging to intermediate/senior professionals.
5. DIVERSE QUESTION STRUCTURE & CODE SNIPPETS (AVOID REPETITIVE "WHAT IS..." OR "WHICH IS..." PATTERNS):
   - Do NOT generate simple factual definition questions (e.g. "What is X?"). 
   - Mix multiple dynamic formats to make the assessment feel realistic and like a real technical interview:
     * Predict Output: Show a code snippet and ask what it prints/outputs.
     * Scenario-based: "Given \`Car c("Audi", 2023);\`, when is the constructor executed?" instead of "What is a constructor?".
     * Debugging: Provide code with a subtle bug or anti-pattern and ask how to fix it.
     * Fill-in-the-blank / Completion: Present code with a missing part and ask which option correctly completes it.
     * Trade-off / Choice: "Which code will produce...?", "Choose the best implementation.", "Which statement is correct?" or "Identify the correct explanation."
     * Situational: "What happens if...", "Which feature enables...".
   - CODE SNIPPETS (MANDATORY FOR TECHNICAL FIELDS): For software development/engineering domains, you MUST write clean, indented code snippets inside standard markdown code blocks (e.g. \`\`\`cpp \\n ... \\n \`\`\`) directly in the question body.

INTERVIEW SPECIFICATIONS:
- Targeted Stress Level: ${difficulty.toUpperCase()}
- Mode Strategy: ${assessmentType.toUpperCase()}
- Session Length Profile: ${assessmentLength.toUpperCase()}

INTERVIEW QUESTIONS GEN QUANTUM:
- Generate exactly ${questionConfig.mcqs} Professional Knowledge/Domain MCQs
${questionConfig.theory ? `- Generate exactly ${questionConfig.theory} Deep Interview Questions (Theory)` : ""}

SPECIALIZED PIPELINE INSTRUCTIONS:
${instructions || "Interrogate core domain metrics, implementation frameworks, and scalability strategies rigorously."}

Analyze the resume text, determine the profession, map out structural dependencies, extract metadata, and output the clean JSON object fitting the schema perfectly.`;

        const questions = await ResumeQuestionSchema.invoke([
            new SystemMessage(resumeSystemPrompt),
            new HumanMessage(`Here is the candidate's resume for your evaluation:\n\n${extractedText}`)
        ]);

        if (questions && questions.metadata) {
            questions.metadata.questionsInstructions = instructions || null;
            questions.metadata.extractedText = extractedText || null;
        }

        return questions;

    } catch (error) {
        console.error("Error in generateResumeQuestionsNode:", error);
        throw error;
    }
}
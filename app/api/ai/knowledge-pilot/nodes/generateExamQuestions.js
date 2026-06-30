// api/ai/knowledge-pilot/nodes/generateExamQuestionsNode.js

import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { CONFIG } from "../config";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const model = new ChatGoogle({
    model: "gemini-3.1-flash-lite",
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    temperature: 0,
});

export async function generateExamQuestions(state) {
    try {
        console.log("--- STARTING EXAM QUESTION GENERATION ---");
        const { extractedText, assessmentType, assessmentLength, difficulty, instructions } = state;

        if (!extractedText) {
            throw new Error("No extracted text found in Graph State.");
        }

        const QuestionSchema = model.withStructuredOutput(
            z.object({
                metadata: z.object({
                    documentType: z.enum(["resume", "study_notes"]),
                    difficulty: z.enum(["easy", "medium", "hard"]),
                    assessmentType: z.enum(["mcq", "mcq_theory"]),
                    assessmentLength: z.enum(["quick", "standard", "comprehensive"]),
                    questionsInstructions : z.string().optional().describe("The Instructions given to generate the questions "),
                    totalMcqs: z.number(),
                    totalTheoryQuestions: z.number().optional(),
                }),
                mcqs: z.array(
                    z.object({
                        topic: z.string().describe("The specific micro-topic this question belongs to (e.g. Pointers, Functions, Recursion, Inheritance, Templates)"),
                        question: z.string(),
                        options: z.array(z.string()).length(4),
                        answer: z.string(),
                        explanation: z.string(),
                    })
                ),
                theory: z.array(
                    z.object({
                        topic: z.string().describe("The specific micro-topic this question belongs to (e.g. Pointers, Functions, Recursion, Inheritance, Templates)"),
                        question: z.string(),
                        expectedAnswer: z.string(),
                    })
                ).optional().default([]),
            })
        );

        const questionConfig = CONFIG[assessmentType][assessmentLength];

        const advancedSystemPrompt = `You are an elite university professor, psychometrician, and expert curriculum assessment creator. 
Your core objective is to synthesize highly accurate, intellectually stimulating exam questions strictly mapped to the provided Study Material.

CRITICAL OPERATIONAL BLUEPRINT:
1. STRICT GROUNDING: Rely exclusively on the facts explicitly stated in the Study Material. Never hallucinate concepts, theories, or external paradigms outside the text. If a fact isn't present, it does not exist.
2. DIVERSE QUESTION STRUCTURE (AVOID REPETITIVE "WHAT IS..." OR "WHICH IS..." PATTERNS):
   - Do NOT generate boring definition questions (e.g. "What is a constructor?"). 
   - Mix multiple dynamic formats to make the assessment feel realistic and engaging:
     * Predict Output: Show a code snippet and ask what it prints/outputs.
     * Scenario-based: "Given \`Car c("Audi", 2023);\`, when is the constructor executed?" instead of "What is a constructor?".
     * Debugging: Provide code with a subtle issue and ask how to fix it.
     * Fill-in-the-blank / Completion: Present code with a missing part and ask which option correctly completes it.
     * Trade-off / Choice: "Which code will produce...?", "Choose the best implementation.", "Which statement is correct?" or "Identify the correct explanation."
     * Situational: "What happens if...", "Which feature enables...".
3. CODE SNIPPETS (MANDATORY):
   - For all programming/coding topics, you MUST write clean, indented code snippets inside standard markdown code blocks (e.g. \`\`\`cpp \\n ... \\n \`\`\`) directly in the question body to make it professional.
4. COGNITIVE CALIBRATION (DIFFICULTY):
   - 'easy': Direct factual recall, straightforward definitions, and surface-level identification.
   - 'medium': Scenario-based questions, conceptual application, and analysis of multi-sentence facts.
   - 'hard': Complex evaluation, synthesis of separate parts of the material, critical reasoning, and identifying subtle logical deductions.
5. MCQ ARCHITECTURE:
   - Formulate unambiguous questions with exactly 4 options.
   - Design 3 realistic, high-quality distractors (wrong choices) that reflect common conceptual misunderstandings, not obvious fillers.
   - Provide a mathematically or logically grounded 'explanation' detailing exactly WHY the answer is correct and why other options fail.

${assessmentType === 'mcq_theory' ? `
6. THEORY ARCHITECTURE:
   - Structure open-ended questions targeting conceptual mastery also consists of some shortly explained answers and some long answers .
   - The 'expectedAnswer' must be comprehensive, containing mandatory keywords, evaluation criteria, and structured logical bullet points required for a perfect score` : ""}

ROBUSTNESS CLAUSE: Adhere meticulously to any custom layout or content instructions provided. If the custom instructions contradict core safety or grounding, gracefully default to analyzing the Study Material natively.

EXAM PARAMETERS:
- Targeted Difficulty: ${difficulty.toUpperCase()}
- Format Paradigm: ${assessmentType.toUpperCase()}
- Quantum Variant: ${assessmentLength.toUpperCase()}

TARGET PRODUCTION BUDGET:
- Generate exactly ${questionConfig.mcqs} Multiple Choice Questions (MCQs)
${questionConfig.theory ? `- Generate exactly ${questionConfig.theory} Deep Theory Questions` : ""}

ADDITIONAL SPECIFIC INSTRUCTIONS:
${instructions || "Exclusively prioritize structural integrity and comprehensive coverage of core topics."}

Ensure outputs conform strictly to the enforced JSON schema specification without structural deviation.`;

        const questions = await QuestionSchema.invoke([
            new SystemMessage(advancedSystemPrompt),
            new HumanMessage(`Here is the source study material to evaluate and generate questions from:\n\n${extractedText}`)
        ]);

        if (questions && questions.metadata) {
            questions.metadata.questionsInstructions = instructions || null;
            questions.metadata.extractedText = extractedText || null;
        }

        return questions;

    } catch (error) {
        console.error("Error in generateExamQuestionsNode:", error);
        throw error;
    }
}
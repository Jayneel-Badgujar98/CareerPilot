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

export default async function generateExamQuestionsNode(state) {
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
                    totalMcqs: z.number(),
                    totalTheoryQuestions: z.number().optional(),
                }),
                mcqs: z.array(
                    z.object({
                        question: z.string(),
                        options: z.array(z.string()).length(4),
                        answer: z.string(),
                        explanation: z.string(),
                    })
                ),
                theory: z.array(
                    z.object({
                        question: z.string(),
                        expectedAnswer: z.string(),
                    })
                ).default([]),
            })
        );

        const questionConfig = CONFIG[assessmentType][assessmentLength];

        const advancedSystemPrompt = `You are an elite university professor, psychometrician, and expert curriculum assessment creator. 
Your core objective is to synthesize highly accurate, intellectually stimulating exam questions strictly mapped to the provided Study Material.

CRITICAL OPERATIONAL BLUEPRINT:
1. STRICT GROUNDING: Rely exclusively on the facts explicitly stated in the Study Material. Never hallucinate concepts, theories, or external paradigms outside the text. If a fact isn't present, it does not exist.
2. COGNITIVE CALIBRATION (DIFFICULTY):
   - 'easy': Direct factual recall, straightforward definitions, and surface-level identification.
   - 'medium': Scenario-based questions, conceptual application, and analysis of multi-sentence facts.
   - 'hard': Complex evaluation, synthesis of separate parts of the material, critical reasoning, and identifying subtle logical deductions.
3. MCQ ARCHITECTURE:
   - Formulate unambiguous questions with exactly 4 options.
   - Design 3 realistic, high-quality distractors (wrong choices) that reflect common conceptual misunderstandings, not obvious fillers.
   - Provide a mathematically or logically grounded 'explanation' detailing exactly WHY the answer is correct and why other options fail.
4. THEORY ARCHITECTURE:
   - Structure open-ended questions targeting conceptual mastery.
   - The 'expectedAnswer' must be comprehensive, containing mandatory keywords, evaluation criteria, and structured logical bullet points required for a perfect score.
5. ROBUSTNESS CLAUSE: Adhere meticulously to any custom layout or content instructions provided. If the custom instructions contradict core safety or grounding, gracefully default to analyzing the Study Material natively.

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

        return questions;

    } catch (error) {
        console.error("Error in generateExamQuestionsNode:", error);
        throw error;
    }
}
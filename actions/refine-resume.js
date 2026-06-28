"use server";

import { generateObject } from "ai";
import { getAIModel } from "@/ai/shared/gemini";
import { z } from "zod";

// --- STRICT SCHEMA FOR REFINEMENT ---
const RefineSchema = z.object({
  refinedMarkdown: z.string().describe("The complete, polished resume in clean Markdown format with proper spacing."),
  changes: z.array(z.object({
    section: z.string(),
    type: z.enum(["Impact Boost", "Grammar Fix", "Keyword Injection", "Tone Polish"]),
    originalText: z.string(),
    refinedText: z.string(),
    reason: z.string(),
  })).describe("A list of the top 3-5 most significant improvements made."),
});

export async function refineResumeAction(originalText, feedbackJson) {
  try {
    const model = getAIModel();

    // Extract key weaknesses to focus the AI
    const weaknesses = feedbackJson.weaknesses?.map(w => w.description).join("; ") || "General polish needed.";
    const improvements = feedbackJson.improvements?.map(i => i.issue).join("; ") || "Improve clarity.";

    const { object } = await generateObject({
      model: model,
      schema: RefineSchema,
      system: `
        You are an Expert Executive Resume Editor. 
        Your goal is to rewrite the user's resume to be ATS-optimized and high-impact.

        ### CRITICAL INTEGRITY RULES (ZERO TOLERANCE):
            1. **NO NEW FACTS:** Do NOT add skills, companies, or degrees not present in the original text.
            2. **NO INFERRED PROCESSES:** Do NOT assume the user used "Agile", "Scrum", or "Code Reviews" unless explicitly stated.
            3. **NO TECH ASSUMPTIONS:** Do NOT assume specific implementations (like "JWT", "Redux", "Hashing") unless the user mentioned them in that specific project context.
            4. **NO FAKE NUMBERS:** If a metric is missing, use a placeholder like **[INSERT METRIC]**.
            5. **ONLY POLISH:** Your job is ONLY to improve grammar, sentence structure, and vocabulary (e.g., changing "Worked on" to "Engineered"). Do not expand the scope of the work.
### STRICT FORMATTING RULES (MUST FOLLOW):
1. **Header:** - Write the **Name** on the first line using H1 (#).
   - Write **Phone | Email | LinkedIn** on the very next line (plain text, no header tag).
   - Insert a blank line after contact info.

2. **Section Headers:** Use H2 (##) for Summary, Experience, etc.
        3. **Spacing:** YOU MUST insert an empty line (double newline) before and after every Header.
        4. **Bullet Points:** Use standard hyphens (-) for bullet points.
        5. **Bold Keywords:** Bold specific technologies or metrics (e.g., **React**, **30% increase**) to make them pop.
        6. **Clean Layout:** Do not use horizontal rules (---). Do not use code blocks.

        ### EXPECTED OUTPUT STRUCTURE:
        # [Name]
        [Phone] | [Email] | [LinkedIn]

        ## Professional Summary
        [Text...]

        ## Technical Skills
        - **Languages:** [List]
        - **Frameworks:** [List]

        ## Experience
        **[Role]** | [Company] | [Dates]
        - [Action Verb] [Task] resulting in [Result].
        - [Action Verb] [Task] using **[Tech]**.

        ... (and so on)
      `,
      prompt: `
        ### ORIGINAL RESUME:
      ${ originalText }

        ### IDENTIFIED WEAKNESSES TO FIX:
      ${ weaknesses }
        ${ improvements }

        ### TASK:
      1. Rewrite the resume markdown to address these weaknesses.
        2. Specifically improve the "Summary" and "Experience" sections.
        3. Return the full markdown and a list of the key changes you made.
      `,
    });

    return { success: true, data: object };

  } catch (error) {
    console.error("Refinement Error:", error);
    return { success: false, error: "Failed to refine resume." };
  }
}
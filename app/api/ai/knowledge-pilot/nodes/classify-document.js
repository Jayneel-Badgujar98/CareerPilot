// api/ai/knowledge-pilot/nodes/classify-document.js
// This node will classify the document as a Resume or a Notes 

import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const model = new ChatGoogle({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  temperature: 0,
});

export async function classifyDocumentNode(state) {
  try {
    console.log("--- STARTING DOCUMENT CLASSIFICATION ---");
    const { extractedText } = state;

    if (!extractedText) {
      throw new Error("No extracted text found in Graph State.");
    }

    // Send the first ~100 lines (or approx. 4000 characters) to the LLM
    const textSample = extractedText.slice(0, 4000).trim();

    // As in the first some lines it can analyse if it is a resume
    // or a study material.

    if (!textSample) {
      console.log("Extracted text is empty. Defaulting to study_notes.");
      return { documentType: "study_notes" };
    }

    // Configure the model to return structured output matching the schema
    const structuredModel = model.withStructuredOutput(
      z.object({
        documentType: z
          .enum(["resume", "study_notes"])
          .describe("The classification of the document. Choose 'resume' if it is a CV or professional resume. Choose 'study_notes' if it is a study guide, notes, revision material, textbook, or educational content .")
      })
    );

    const response = await structuredModel.invoke([
      [
        "system",
        "You are an expert document classifier. Analyze the provided snippet from the beginning of a document and classify it. Choose 'resume' for a CV or professional resume/work history, or 'study_notes' for study guides, textbook chapters, lecture notes, or educational content."
      ],
      ["human", `Here is the beginning of the document:\n\n${textSample}`],
    ]);

    console.log(`Document classified as: ${response.documentType}`);
    return { documentType: response.documentType };

  } catch (error) {
    console.error("Error in classifyDocumentNode:", error);
    // Fallback to study_notes if LLM call fails
    return { documentType: "study_notes" };
  }
}
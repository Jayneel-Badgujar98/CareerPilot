import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  // Input fields
  pdfBuffer: Annotation(),
  difficulty: Annotation(),
  assessmentType: Annotation(),
  assessmentLength: Annotation(),
  instructions: Annotation(),

  // Intermediate state fields
  extractedText: Annotation(),
  documentType: Annotation(),

  // Output fields populated by generation nodes
  metadata: Annotation(),
  mcqs: Annotation(),
  theory: Annotation(),
  questions: Annotation(),
});
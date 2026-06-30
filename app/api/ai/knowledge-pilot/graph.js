import { START, END, StateGraph } from "@langchain/langgraph";
import { GraphState } from "./graph-state";
import {
  parsePdfNode,
  classifyDocumentNode,
  generateResumeQuestions,
  generateExamQuestions,
} from "./nodes";

const graph = new StateGraph(GraphState)
  // Nodes
  .addNode("parsePdf", parsePdfNode)
  .addNode("classifyDocument", classifyDocumentNode)
  .addNode("generateResumeQuestions", generateResumeQuestions)
  .addNode("generateExamQuestions", generateExamQuestions)


  // Flow
  .addEdge(START, "parsePdf")
  .addEdge("parsePdf", "classifyDocument")
  // Conditional Edge


  .addConditionalEdges(
    "classifyDocument",
    (state) => {
      return state.documentType;
    },
    {
      resume: "generateResumeQuestions",
      study_notes: "generateExamQuestions",
    }
  )


  .addEdge("generateResumeQuestions", END)
  .addEdge("generateExamQuestions", END);

export const knowledgePilotGraph = graph.compile();
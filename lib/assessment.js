// lib/assessment.js
import { db } from "@/lib/prisma";

export async function saveAssessment({
  userId,
  documentName,
  graphResult,
}) {
  try {
    const assessment = await db.assessmentSession.create({
      data: {
        userId,
        documentName,
        status: "ready",

        assessment: {
          metadata: {
            ...graphResult.metadata,
            questionsInstructions: graphResult.instructions || null,
            extractedText: graphResult.metadata?.extractedText || null,
          },
          questions: [
            ...(graphResult.mcqs || []).map((question, index) => ({
              id: `mcq_${index + 1}`,
              type: "mcq",
              ...question,
            })),
            ...(graphResult.theory || []).map((question, index) => ({
              id: `theory_${index + 1}`,
              type: "theory",
              ...question,
            })),
          ],
        },
        answers: [],
        evaluation: null,
      },
    });
    return assessment;
  } catch (error) {
    console.error("Save Assessment Error:", error);
    throw new Error("Failed to save assessment.");
  }
}

export async function getAssessmentById(sessionId) {
  return db.assessmentSession.findUnique({
    where: {
      id: sessionId,
    },
  });
}

export async function updateAssessment(sessionId, data) {
  return db.assessmentSession.update({
    where: {
      id: sessionId,
    },
    data,
  });
}

export async function deleteAssessment(sessionId) {
  return db.assessmentSession.delete({
    where: {
      id: sessionId,
    },
  });
}
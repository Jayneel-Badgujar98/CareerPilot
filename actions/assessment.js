"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgePilotGraph } from "@/app/api/ai/knowledge-pilot/graph";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAssessment(sessionId) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const assessment = await db.assessmentSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found.");
    }

    // Strip answers if assessment is not yet completed
    if (assessment.status !== "completed" && assessment.assessment) {
      const sanitizedQuestions = (assessment.assessment.questions || []).map(q => {
        const { answer, explanation, expectedAnswer, ...sanitized } = q;
        return sanitized;
      });
      assessment.assessment.questions = sanitizedQuestions;
    }

    return {
      success: true,
      assessment,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getAssessmentHistory() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const assessments = await db.assessmentSession.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      assessments,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function submitAssessment(sessionId, userAnswers) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const session = await db.assessmentSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session || session.userId !== user.id) {
      throw new Error("Assessment session not found.");
    }

    const assessmentData = session.assessment;
    const questions = assessmentData.questions || [];

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let totalMcqs = 0;
    let totalTheory = 0;
    let totalTime = 0;

    const gradedQuestions = questions.map((q) => {
      const userAnsObj = userAnswers.find((ans) => ans.questionId === q.id);
      const userAns = userAnsObj ? userAnsObj.answer : "";
      const timeSpent = userAnsObj ? userAnsObj.timeSpent : 0;
      totalTime += timeSpent;

      let isCorrect = false;
      let skipped = !userAns || userAns.trim() === "";

      if (q.type === "mcq") {
        totalMcqs++;
        if (skipped) {
          skippedCount++;
        } else {
          isCorrect = String(q.answer).trim().toLowerCase() === String(userAns).trim().toLowerCase();
          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      } else if (q.type === "theory") {
        totalTheory++;
        if (skipped) {
          skippedCount++;
        }
      }

      return {
        id: q.id,
        type: q.type,
        question: q.question,
        topic: q.topic || "General",
        userAnswer: userAns,
        correctAnswer: q.answer || null,
        expectedAnswer: q.expectedAnswer || null,
        explanation: q.explanation || null,
        timeSpent,
        isCorrect,
        skipped,
      };
    });

    // Format total time taken
    const formatTimeTaken = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };
    const timeTakenStr = formatTimeTaken(totalTime);

    // Call Gemini to grade theory questions and perform structured evaluation
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    });

    const responseSchema = {
      type: "OBJECT",
      properties: {
        topicWisePerformance: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              topic: { type: "STRING" },
              score: { type: "INTEGER" }
            },
            required: ["topic", "score"]
          }
        },
        strengths: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        weakAreas: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        aiFeedback: { type: "STRING" },
        studyPlan: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              action: { type: "STRING" },
              topic: { type: "STRING" },
              duration: { type: "STRING" }
            },
            required: ["action", "topic", "duration"]
          }
        },
        confidenceAnalysis: { type: "STRING" },
        knowledgeLevel: {
          type: "OBJECT",
          properties: {
            level: { type: "STRING" }, // Beginner, Intermediate, Advanced
            description: { type: "STRING" }
          },
          required: ["level", "description"]
        },
        examReadiness: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            status: { type: "STRING" } // Ready, Needs Review
          },
          required: ["score", "status"]
        },
        theoryGrades: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              questionId: { type: "STRING" },
              score: { type: "INTEGER" },
              feedback: { type: "STRING" }
            },
            required: ["questionId", "score", "feedback"]
          }
        }
      },
      required: [
        "topicWisePerformance",
        "strengths",
        "weakAreas",
        "aiFeedback",
        "studyPlan",
        "confidenceAnalysis",
        "knowledgeLevel",
        "examReadiness"
      ]
    };

    const prompt = `
      You are an elite university professor, psychometrician, and AI curriculum assessor.
      Analyze the candidate's complete assessment results and output a highly detailed, premium-tier structured feedback JSON.

      ASSESSMENT DETAILS:
      - Document: ${session.documentName}
      - Difficulty: ${session.assessment?.metadata?.difficulty || "Medium"}
      - Total MCQs: ${totalMcqs}
      - Total Theory Questions: ${totalTheory}
      
      OBJECTIVE METRICS CALCULATED:
      - Correct MCQs: ${correctCount} / ${totalMcqs}
      - Wrong MCQs: ${wrongCount} / ${totalMcqs}
      - Skipped Questions: ${skippedCount}
      - Total Time Taken: ${timeTakenStr}

      GRADED QUESTIONS DATA (Includes questions, topics, user's answers, correct/expected answers, and time spent in seconds per question):
      ${JSON.stringify(gradedQuestions, null, 2)}

      OPERATIONAL DIRECTIVES:
      1. Evaluate Theory Answers: For each theory question, grade the candidate's response from 0 to 10 based on conceptual correctness against the expected answer, and provide constructive feedback. (Skip if no theory questions exist).
      2. Topic-wise Performance: Group questions by their topic. Calculate the percentage score (0-100) for each topic. (For MCQs, correct = 100%, incorrect = 0%. For Theory, map the 0-10 score to a percentage: e.g. 8/10 = 80%).
      3. Strengths & Weak Areas: List topics where performance is strong (>= 75%) and weak (< 75%).
      4. AI Feedback: Provide a personalized, detailed summary feedback explaining exactly how they did, where they excelled, and their core developmental bottlenecks. Avoid generic placeholders.
      5. Personalized Study Plan: Devise a structured study/revision plan containing actionable, bite-sized tasks with estimated durations (e.g. "Watch Virtual Functions tutorial", 15 min) mapping to their weak areas.
      6. Confidence Analysis: Compare the correctness of their answers with the timeSpent on each question. Infer confidence:
         - Quick & Correct: High confidence.
         - Slow & Correct: High understanding but potential hesitation.
         - Quick & Incorrect: Careless error or guessing.
         - Slow & Incorrect: Struggling with the concept.
      7. Knowledge Level: Choose between Beginner, Intermediate, or Advanced, with a brief explanation.
      8. Estimated Exam Readiness: Provide a readiness score (0-100) reflecting how prepared they are for an exam based on their performance, accuracy, and depth of knowledge.
    `;

    let evaluationData;
    let theoryScoresSum = 0;
    let overallScore = 0;

    try {
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const resultText = response.response.text();
      evaluationData = JSON.parse(resultText);

      // Calculate total theory scores from LLM response
      if (totalTheory > 0 && evaluationData.theoryGrades) {
        evaluationData.theoryGrades.forEach((tg) => {
          theoryScoresSum += tg.score || 0;
        });
      }

      const mcqWeight = totalMcqs > 0 ? (correctCount / totalMcqs) * 100 : 0;
      const theoryWeight = totalTheory > 0 ? (theoryScoresSum / (totalTheory * 10)) * 100 : 0;

      if (totalMcqs > 0 && totalTheory > 0) {
        overallScore = Math.round((mcqWeight * 0.5) + (theoryWeight * 0.5));
      } else if (totalMcqs > 0) {
        overallScore = Math.round(mcqWeight);
      } else if (totalTheory > 0) {
        overallScore = Math.round(theoryWeight);
      }
    } catch (aiError) {
      console.error("AI Evaluation Error (Using Local Fallback):", aiError);
      
      // Fallback: Default to a neutral 5/10 for theory questions
      if (totalTheory > 0) {
        theoryScoresSum = totalTheory * 5;
      }

      const mcqWeight = totalMcqs > 0 ? (correctCount / totalMcqs) * 100 : 0;
      const theoryWeight = totalTheory > 0 ? (theoryScoresSum / (totalTheory * 10)) * 100 : 0;

      if (totalMcqs > 0 && totalTheory > 0) {
        overallScore = Math.round((mcqWeight * 0.5) + (theoryWeight * 0.5));
      } else if (totalMcqs > 0) {
        overallScore = Math.round(mcqWeight);
      } else if (totalTheory > 0) {
        overallScore = Math.round(theoryWeight);
      }

      // Calculate topic-wise scores locally
      const topicsMap = {};
      gradedQuestions.forEach((q) => {
        if (!topicsMap[q.topic]) {
          topicsMap[q.topic] = { total: 0, correctPoints: 0 };
        }
        topicsMap[q.topic].total++;
        if (q.type === "mcq" && q.isCorrect) {
          topicsMap[q.topic].correctPoints++;
        } else if (q.type === "theory") {
          topicsMap[q.topic].correctPoints += 0.5; // default 50%
        }
      });

      const topicWisePerformance = Object.keys(topicsMap).map((t) => ({
        topic: t,
        score: Math.round((topicsMap[t].correctPoints / topicsMap[t].total) * 100),
      }));

      const strengths = topicWisePerformance.filter(t => t.score >= 75).map(t => t.topic);
      const weakAreas = topicWisePerformance.filter(t => t.score < 75).map(t => t.topic);

      evaluationData = {
        topicWisePerformance,
        strengths: strengths.length > 0 ? strengths : ["General Concepts"],
        weakAreas: weakAreas.length > 0 ? weakAreas : ["Advanced Concepts"],
        aiFeedback: "Your assessment has been evaluated locally. We were unable to reach the AI engine due to rate limits, but your objective score is calculated below.",
        studyPlan: weakAreas.map((topic) => ({
          action: `Revise key concepts and solve practice questions`,
          topic,
          duration: "20 min",
        })),
        confidenceAnalysis: "Based on your time spent, you responded steadily across topics.",
        knowledgeLevel: {
          level: overallScore >= 80 ? "Advanced" : overallScore >= 50 ? "Intermediate" : "Beginner",
          description: "Objective evaluation based on test responses.",
        },
        examReadiness: {
          score: overallScore,
          status: overallScore >= 75 ? "Exam Ready" : "Needs Revision",
        },
        theoryGrades: gradedQuestions.filter(q => q.type === "theory").map(q => ({
          questionId: q.id,
          score: 5,
          feedback: "Graded locally (AI currently unavailable).",
        })),
      };
    }

    const evaluation = {
      score: overallScore,
      mcqScore: {
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        total: totalMcqs,
      },
      theoryScore: {
        total: totalTheory,
        score: theoryScoresSum,
      },
      timeTaken: timeTakenStr,
      topicWisePerformance: evaluationData.topicWisePerformance,
      strengths: evaluationData.strengths,
      weakAreas: evaluationData.weakAreas,
      aiFeedback: evaluationData.aiFeedback,
      studyPlan: evaluationData.studyPlan,
      confidenceAnalysis: evaluationData.confidenceAnalysis,
      knowledgeLevel: evaluationData.knowledgeLevel,
      examReadiness: {
        ...evaluationData.examReadiness,
        score: evaluationData.examReadiness.score ?? overallScore
      },
      theoryEvaluation: (evaluationData.theoryGrades || []).map((tg) => {
        const matchingQ = gradedQuestions.find(q => q.id === tg.questionId);
        return {
          questionId: tg.questionId,
          question: matchingQ ? matchingQ.question : "",
          category: matchingQ ? matchingQ.topic : "General",
          userAnswer: matchingQ ? matchingQ.userAnswer : "",
          expectedAnswer: matchingQ ? matchingQ.expectedAnswer : "",
          score: tg.score,
          feedback: tg.feedback,
        };
      }),
    };

    const updatedSession = await db.assessmentSession.update({
      where: {
        id: sessionId,
      },
      data: {
        status: "completed",
        answers: userAnswers,
        evaluation: evaluation,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      assessment: updatedSession,
    };
  } catch (error) {
    console.error("Submit Assessment Error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function regenerateAssessment(oldSessionId) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const oldSession = await db.assessmentSession.findUnique({
      where: {
        id: oldSessionId,
      },
    });

    if (!oldSession || oldSession.userId !== user.id) {
      throw new Error("Assessment not found.");
    }

    const metadata = oldSession.assessment?.metadata;
    if (!metadata) {
      throw new Error("Metadata not found in the original assessment.");
    }

    const extractedText = metadata.extractedText;
    const documentType = metadata.documentType || "study_notes";
    const difficulty = metadata.difficulty;
    const assessmentType = metadata.assessmentType;
    const assessmentLength = metadata.assessmentLength;
    const instructions = metadata.questionsInstructions;

    if (!extractedText) {
      throw new Error("Source text not found in the original assessment. Cannot regenerate.");
    }

    const graphResult = await knowledgePilotGraph.invoke({
      extractedText,
      documentType,
      difficulty,
      assessmentType,
      assessmentLength,
      instructions,
    });

    const newSession = await db.assessmentSession.create({
      data: {
        userId: user.id,
        documentName: oldSession.documentName,
        status: "ready",

        assessment: {
          metadata: {
            ...graphResult.metadata,
            questionsInstructions: instructions || null,
            extractedText: extractedText,
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

    return {
      success: true,
      sessionId: newSession.id,
    };
  } catch (error) {
    console.error("Regenerate Assessment Error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}
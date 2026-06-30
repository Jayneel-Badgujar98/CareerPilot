import { notFound, redirect } from "next/navigation";
import { getAssessment } from "@/actions/assessment";
import AssessmentClient from "./AssessmentClient";

export default async function Page({ params }) {
  const { sessionId } = await params;
  const result = await getAssessment(sessionId);

  if (!result || !result.success || !result.assessment) {
    notFound();
  }

  if (result.assessment.status === "completed") {
    redirect(`/ai-career-prep/ai-knowledge-pilot/result/${sessionId}`);
  }

  return (
    <AssessmentClient
      assessment={result.assessment}
    />
  );
}

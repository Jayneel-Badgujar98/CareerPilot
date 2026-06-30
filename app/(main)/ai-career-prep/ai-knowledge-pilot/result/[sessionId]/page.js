import { notFound } from "next/navigation";
import { getAssessment } from "@/actions/assessment";
import ResultClient from "./ResultClient";

export default async function Page({ params }) {
  const { sessionId } = await params;
  const result = await getAssessment(sessionId);

  if (!result || !result.success || !result.assessment) {
    notFound();
  }

  // Ensure assessment is actually completed
  if (result.assessment.status !== "completed") {
    notFound();
  }

  return (
    <ResultClient
      assessment={result.assessment}
    />
  );
}

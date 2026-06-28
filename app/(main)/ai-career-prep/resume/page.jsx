import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import BackButton from "@/components/backButton";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <BackButton />
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}

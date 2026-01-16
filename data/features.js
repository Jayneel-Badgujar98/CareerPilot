import { BrainCircuit, FileText, LineChart, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-indigo-400" />,
    title: "AI Mock Interviews",
    description: "Experience real-time voice simulations with our AI interviewer. Get instant feedback on your tone, pacing, and answer quality."
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    title: "Intelligent Resume Builder",
    description: "Build ATS-optimized resumes from scratch. Edit anytime and let our AI refine your bullet points for maximum impact."
  },
  {
    icon: <LineChart className="w-8 h-8 text-emerald-400" />,
    title: "Performance Analytics",
    description: "Track your growth over time. View detailed reports on your interview scores, resume strength, and skill gaps."
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-pink-400" />,
    title: "AI Cover Letters",
    description: "Generate tailored cover letters in seconds that align perfectly with your resume and the specific job description."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-orange-400" />,
    title: "ATS Resume Scanner",
    description: "Scan your resume against major ATS algorithms to ensure you never get rejected by a bot before a human sees you."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    title: "Smart Refiner",
    description: "One-click enhancements for your resume. Fix grammar, improve formatting, and use power verbs automatically."
  }
];
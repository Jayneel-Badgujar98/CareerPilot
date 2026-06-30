"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Home, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Settings,
  RefreshCw,
  Gauge,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { regenerateAssessment } from "@/actions/assessment";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export default function ResultClient({ assessment }) {
  const router = useRouter();
  const evaluation = assessment.evaluation || {};
  const questions = assessment.assessment?.questions || [];
  const answers = assessment.answers || [];

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toggleExpand = (questionId) => {
    setExpandedQuestion(prev => prev === questionId ? null : questionId);
  };

  const handleAttemptAgain = async () => {
    try {
      setIsRegenerating(true);
      toast.loading("Generating fresh questions with the same settings...", { id: "regenerate-toast" });
      const res = await regenerateAssessment(assessment.id);
      if (res && res.success && res.sessionId) {
        toast.success("New assessment generated!", { id: "regenerate-toast" });
        router.push(`/ai-career-prep/ai-knowledge-pilot/assessment/${res.sessionId}`);
      } else {
        throw new Error(res.message || "Failed to generate new assessment.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.", { id: "regenerate-toast" });
      setIsRegenerating(false);
    }
  };

  const score = evaluation.score || 0;
  const mcqScore = evaluation.mcqScore || { correct: 0, wrong: 0, skipped: 0, total: 0 };
  const theoryScore = evaluation.theoryScore || { total: 0, score: 0 };
  const timeTaken = evaluation.timeTaken || "N/A";
  const difficulty = assessment.assessment?.metadata?.difficulty || "Medium";
  const knowledgeLevel = evaluation.knowledgeLevel || { level: "Intermediate", description: "Good base skills" };
  const examReadiness = evaluation.examReadiness || { score: 50, status: "Review Recommended" };
  const strengths = evaluation.strengths || [];
  const weakAreas = evaluation.weakAreas || [];
  const topicWise = evaluation.topicWisePerformance || [];
  const studyPlan = evaluation.studyPlan || [];
  const confidence = evaluation.confidenceAnalysis || "";

  // Prepare radar chart data
  const radarData = topicWise.map(item => ({
    subject: item.topic,
    score: item.score,
    fullMark: 100
  }));

  // Determine score color classes
  const getScoreColor = (val) => {
    if (val >= 80) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (val >= 50) return "text-indigo-500 border-indigo-500/20 bg-indigo-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 pb-20 pt-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-650 dark:from-white dark:via-neutral-200 dark:to-indigo-300 bg-clip-text text-transparent">
                KnowledgePilot
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                EVALUATION COMPLETED
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Document: {assessment.documentName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/ai-career-prep/ai-knowledge-pilot/create-assessment")}
            className="flex items-center gap-2 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Settings size={16} />
            Change Settings
          </Button>

          <Button 
            onClick={handleAttemptAgain}
            disabled={isRegenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
            Attempt Again
          </Button>

          <Button 
            variant="outline" 
            onClick={() => router.push("/ai-career-prep")}
            className="flex items-center gap-2 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl cursor-pointer"
          >
            <Home size={16} />
            Dashboard
          </Button>
        </div>
      </div>

      {/* ROW 1: PERFORMANCE SUMMARY & READINESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Score Ring / Badge Card */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 text-center">
          <CardContent className="space-y-4 pt-4 flex flex-col items-center">
            <div className={`h-36 w-36 rounded-full border-[6px] flex flex-col items-center justify-center shadow-lg ${getScoreColor(score)}`}>
              <span className="text-4xl font-black tracking-tight">{score}%</span>
              <span className="text-[10px] font-black tracking-widest uppercase opacity-80 mt-1">OVERALL</span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Gauge size={12} />
                <span>Level: {knowledgeLevel.level}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-[240px]">
                {knowledgeLevel.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Objective Stats Breakdown */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-455 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Metrics & Accuracy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30">
              <p className="text-[10px] text-neutral-455 font-bold uppercase">Accuracy</p>
              <p className="text-xl font-black mt-1 text-indigo-600 dark:text-indigo-400">{score}%</p>
            </div>
            <div className="p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30">
              <p className="text-[10px] text-neutral-455 font-bold uppercase">Time Taken</p>
              <p className="text-xl font-black mt-1 flex items-center gap-1">
                <Clock size={16} className="text-neutral-455" />
                <span>{timeTaken}</span>
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30">
              <p className="text-[10px] text-neutral-455 font-bold uppercase">Answers Graded</p>
              <p className="text-sm font-extrabold mt-1 text-neutral-800 dark:text-neutral-200">
                ✔️ {mcqScore.correct} Correct <br/>
                ❌ {mcqScore.wrong} Incorrect
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30">
              <p className="text-[10px] text-neutral-455 font-bold uppercase">Quiz Params</p>
              <p className="text-xs font-extrabold mt-1 text-neutral-850 dark:text-neutral-250">
                Difficulty: {difficulty} <br/>
                Skipped: {mcqScore.skipped || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Readiness Meter */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-455 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Exam Readiness</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6 flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Confidence Rating</span>
                <span className="text-emerald-500">{examReadiness.score}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500" 
                  style={{ width: `${examReadiness.score}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-1">
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Readiness status</p>
              <p className="text-xs font-bold leading-relaxed">{examReadiness.status}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ROW 2: SKILL RADAR CHART & TOPIC PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Recharts Skill Radar Chart */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" />
              <span>Skill Radar Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="80%" data={radarData}>
                  <PolarGrid stroke="#4f46e5" strokeOpacity={0.15} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#9ca3af" }} />
                  <Radar
                    name="Performance"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-bold text-neutral-500">Not enough data to map skill radar.</div>
            )}
          </CardContent>
        </Card>

        {/* Topic-Wise Performance Progress Bars */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span>Topic-Wise Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {topicWise.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>{item.topic}</span>
                  <span className={item.score >= 75 ? "text-emerald-500" : item.score >= 50 ? "text-indigo-500" : "text-rose-500"}>
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${
                      item.score >= 75 ? "from-emerald-400 to-teal-500" : 
                      item.score >= 50 ? "from-indigo-400 to-purple-500" : 
                      "from-rose-400 to-pink-500"
                    } transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ROW 3: STRENGTHS, WEAK AREAS & PERSONALIZED STUDY PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Strengths & Weak Areas List */}
        <Card className="lg:col-span-1 bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm flex flex-col justify-between p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Key Strengths</span>
            </h3>
            {strengths.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strengths.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                    <Check size={12} />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-neutral-455 italic">No major strengths identified yet.</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-200/40 dark:border-neutral-800/40">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Weak Areas</span>
            </h3>
            {weakAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20">
                    <XCircle size={12} />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-neutral-455 italic">No major weak areas flagged!</p>
            )}
          </div>
        </Card>

        {/* Study Plan Roadmap Timeline */}
        <Card className="lg:col-span-2 bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" />
              <span>Personalized Next Learning Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studyPlan.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-5">
                {studyPlan.map((plan, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Circle marker */}
                    <span className="absolute -left-[31px] top-1.5 h-[18px] w-[18px] rounded-full border-2 border-indigo-500 bg-white dark:bg-neutral-900 flex items-center justify-center text-[9px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-100">{plan.action}</h4>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/20 shrink-0 self-start sm:self-center">
                        {plan.duration}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-450 font-semibold uppercase">Focus: {plan.topic}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-neutral-555 italic">No study plan tasks generated.</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ROW 4: AI FEEDBACK & CONFIDENCE ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Detailed Feedback Panel */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
              <span>AI Evaluation Feedback</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
              <p className="text-sm font-bold leading-relaxed text-neutral-700 dark:text-neutral-350 select-text">
                {evaluation.aiFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confidence & Speed Analysis */}
        <Card className="bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span>Response Confidence Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-indigo-500/5">
              <p className="text-sm font-bold leading-relaxed text-neutral-700 dark:text-neutral-355 select-text">
                {confidence}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ROW 5: DETAILED QUESTION AUDIT REVIEW */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2.5">
          <span>Question Audit Review</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-555 font-bold">
            {questions.length} Questions
          </span>
        </h3>

        {questions.map((question, idx) => {
          const userAnsObj = answers.find(ans => ans.questionId === question.id);
          const userAnswer = userAnsObj ? userAnsObj.answer : "";
          const timeSpent = userAnsObj ? userAnsObj.timeSpent : 0;
          const isMCQ = question.type === "mcq";

          // MCQ checking
          const isMcqCorrect = isMCQ && String(question.answer).trim().toLowerCase() === String(userAnswer).trim().toLowerCase();

          // Theory checking
          const theoryEval = !isMCQ && (evaluation.theoryEvaluation || []).find(t => t.questionId === question.id);
          const theoryScoreVal = theoryEval ? theoryEval.score : 0;
          const theoryFeedbackVal = theoryEval ? theoryEval.feedback : "Graded successfully.";

          const isExpanded = expandedQuestion === question.id;

          return (
            <Card 
              key={question.id}
              className={`
                bg-white/60 dark:bg-[#0c0b15]/60 backdrop-blur-md border rounded-xl shadow-sm transition-all duration-300 overflow-hidden
                ${isExpanded ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700"}
              `}
            >
              <div 
                onClick={() => toggleExpand(question.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Status Indicator Icon */}
                  {isMCQ ? (
                    isMcqCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[10px] font-black text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                        Question {idx + 1} &bull; {isMCQ ? "MCQ" : "Theory"} &bull; {question.topic || "General"}
                      </span>
                      <span className="text-[9px] font-black bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 rounded text-neutral-500">
                        ⏱️ {timeSpent}s
                      </span>
                      {!isMCQ && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          theoryScoreVal >= 8 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20" :
                          theoryScoreVal >= 5 ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                          "bg-rose-50/10 text-rose-600 dark:text-rose-455 border border-rose-500/20"
                        }`}>
                          Score: {theoryScoreVal}/10
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-neutral-850 dark:text-neutral-100 leading-relaxed truncate pr-6">
                      {question.question}
                    </p>
                  </div>
                </div>

                <div className="text-neutral-400 shrink-0">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-neutral-100 dark:border-neutral-800/60 space-y-4 text-sm leading-relaxed">
                  
                  {/* Complete Question */}
                  <div className="space-y-1.5 pt-2">
                    <p className="font-bold text-xs text-neutral-450 uppercase tracking-wider">Full Question</p>
                    <p className="text-neutral-800 dark:text-neutral-200 font-semibold">{question.question}</p>
                  </div>

                  {/* Options List for MCQs */}
                  {isMCQ && (
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {question.options.map((option, oIdx) => {
                        const isCorrectOption = option === question.answer;
                        const isUserSelected = option === userAnswer;
                        return (
                          <div 
                            key={oIdx}
                            className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                              isCorrectOption 
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400" 
                                : isUserSelected 
                                ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-455" 
                                : "bg-neutral-50/50 border-neutral-200 dark:border-neutral-800/80 text-neutral-555"
                            }`}
                          >
                            <span>{option}</span>
                            {isCorrectOption && <span className="text-[10px] font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Correct Answer</span>}
                            {isUserSelected && !isCorrectOption && <span className="text-[10px] font-black tracking-wider uppercase text-rose-600 dark:text-rose-455">Your Selection</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Written Response for Theory */}
                  {!isMCQ && (
                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/10 space-y-1">
                        <p className="font-bold text-xs text-neutral-450 uppercase tracking-wider">Your Response</p>
                        <p className="text-neutral-800 dark:text-neutral-200 text-xs italic font-medium leading-relaxed">
                          {userAnswer ? `"${userAnswer}"` : "No response provided."}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                        <p className="font-bold text-xs text-emerald-650 dark:text-emerald-400 uppercase tracking-wider">Expected Ideal Response</p>
                        <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed font-medium">
                          {question.expectedAnswer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Feedback / Explanations */}
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-1.5">
                    <p className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {isMCQ ? "Explanation" : "AI Grading Evaluation"}
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-355 text-xs leading-relaxed font-semibold">
                      {isMCQ ? question.explanation : theoryFeedbackVal}
                    </p>
                  </div>

                </div>
              )}
            </Card>
          );
        })}
      </div>

    </div>
  );
}

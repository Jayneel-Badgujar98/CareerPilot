"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Clock, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { submitAssessment } from "@/actions/assessment";

export default function AssessmentClient({ assessment }) {
  const router = useRouter();
  const questions = assessment.assessment?.questions || [];
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, answer }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeSpent, setTimeSpent] = useState({}); // questionId -> seconds spent

  // Track seconds spent on the active question
  useEffect(() => {
    if (isSubmitting || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const activeId = questions[currentIdx]?.id;
        if (!activeId) return prev;
        return {
          ...prev,
          [activeId]: (prev[activeId] || 0) + 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, questions, isSubmitting, timeLeft]);

  // Initialize timer based on assessment type and length
  useEffect(() => {
    let mcqCount = questions.filter(q => q.type === "mcq").length;
    let theoryCount = questions.filter(q => q.type === "theory").length;
    let totalMinutes = (mcqCount * 1.5) + (theoryCount * 5) || 15;
    
    setTimeLeft(Math.ceil(totalMinutes * 60));
  }, [questions, assessment]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSelectAnswer = (questionId, selectedAnswer) => {
    setAnswers(prev => {
      const filtered = prev.filter(ans => ans.questionId !== questionId);
      return [...filtered, { questionId, answer: selectedAnswer }];
    });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => {
      const filtered = prev.filter(ans => ans.questionId !== questionId);
      return [...filtered, { questionId, answer: text }];
    });
  };

  const getSelectedAnswer = (questionId) => {
    return answers.find(ans => ans.questionId === questionId)?.answer || "";
  };

  const isQuestionAnswered = (questionId) => {
    const ans = getSelectedAnswer(questionId);
    return typeof ans === "string" ? ans.trim().length > 0 : false;
  };

  const answeredCount = questions.filter(q => isQuestionAnswered(q.id)).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  const handleAutoSubmit = () => {
    toast.warning("Time is up! Submitting your answers automatically...");
    executeSubmit();
  };

  const handleSubmitClick = () => {
    const unansweredCount = questions.length - answeredCount;
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to submit your assessment for grading?")) {
        return;
      }
    }
    executeSubmit();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    toast.loading("Grading your assessment... (This may take a moment for AI theoretical evaluation)", { id: "grading-toast" });

    try {
      const finalAnswers = questions.map(q => {
        const existing = answers.find(ans => ans.questionId === q.id);
        return {
          questionId: q.id,
          answer: existing ? existing.answer : "",
          timeSpent: timeSpent[q.id] || 0
        };
      });

      const result = await submitAssessment(assessment.id, finalAnswers);

      if (!result.success) {
        throw new Error(result.message || "Failed to submit assessment.");
      }

      toast.success("Grading complete!", { id: "grading-toast" });
      router.push(`/ai-career-prep/ai-knowledge-pilot/result/${assessment.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred during submission.", { id: "grading-toast" });
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Invalid Assessment</h2>
        <p className="text-neutral-500 max-w-md mb-6">No questions found in this assessment session. It might have failed during generation.</p>
        <Button onClick={() => router.push("/ai-career-prep/ai-knowledge-pilot/create-assessment")}>Create New Assessment</Button>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];
  const activeAnswer = getSelectedAnswer(activeQuestion.id);

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white pb-20 pt-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:via-neutral-200 dark:to-indigo-300 bg-clip-text text-transparent">
              KnowledgePilot
            </span>
            <span className="px-2 py-0.5 text-[9px] font-black tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-550/20 rounded-md">
              LIVE ASSESSMENT
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-md truncate">
            Document: {assessment.documentName}
          </p>
        </div>

        {/* Timer Box */}
        <div className="flex items-center justify-end gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold shadow-sm transition-all duration-300 ${
              timeLeft < 60 
                ? "bg-rose-50/50 border-rose-500 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 animate-pulse" 
                : "bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}>
              <Clock size={16} className={timeLeft < 60 ? "animate-spin" : ""} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Assessment View */}
      {isSubmitting ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Evaluating Your Response...</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
              We are grading your MCQs and running an advanced AI evaluation context check on your open-ended theory answers. This should only take a few moments.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT: Quick Question Navigator */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-[#0c0b15]/90 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-md">
              <CardContent className="p-5 space-y-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm">Question Index</h3>
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>{answeredCount} of {questions.length} Answered</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>

                <Progress value={progressPercentage} className="h-2 bg-neutral-150 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full" />

                {/* Grid of Numbers */}
                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => {
                    const isAnswered = isQuestionAnswered(q.id);
                    const isActive = currentIdx === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`
                          h-9 w-9 rounded-lg border font-bold text-xs flex items-center justify-center transition-all duration-300 cursor-pointer
                          ${isActive 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                            : isAnswered 
                            ? "bg-indigo-50/50 border-indigo-200 dark:border-indigo-800/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" 
                            : "bg-neutral-50 border-neutral-200 dark:border-neutral-800 hover:border-neutral-450 dark:hover:border-indigo-500/20 text-neutral-600 dark:text-neutral-400"
                          }
                        `}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="h-3 w-3 rounded bg-indigo-600" />
                    <span>Current Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="h-3 w-3 rounded bg-indigo-50/50 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/60" />
                    <span>Answered</span>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Button
              onClick={handleSubmitClick}
              className="w-full py-6 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg border-0 hover:scale-[1.005] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} />
              Submit Assessment
            </Button>
          </div>

          {/* RIGHT: Question Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white dark:bg-[#0c0b15]/90 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl shadow-md min-h-[350px] flex flex-col justify-between overflow-hidden">
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full space-y-8">
                
                {/* Question Info Header */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-150 dark:border-neutral-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold rounded-lg uppercase">
                      Question {currentIdx + 1}
                    </div>
                    <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                      {activeQuestion.type === "mcq" ? "Multiple Choice" : `Theory (${activeQuestion.category || "General"})`}
                    </span>
                  </div>
                </div>

                {/* Question Title */}
                <div className="space-y-4 flex-grow">
                  <h2 className="text-lg md:text-xl font-bold leading-relaxed text-neutral-900 dark:text-white">
                    {activeQuestion.question}
                  </h2>

                  {/* Question Inputs */}
                  {activeQuestion.type === "mcq" ? (
                    <div className="grid grid-cols-1 gap-3.5 pt-4">
                      {activeQuestion.options.map((option, oIdx) => {
                        const isSelected = activeAnswer === option;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(activeQuestion.id, option)}
                            className={`
                              cursor-pointer border rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.002]
                              ${isSelected 
                                ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 text-indigo-800 dark:text-indigo-400 shadow-sm" 
                                : "border-neutral-200 dark:border-neutral-800/85 hover:border-neutral-350 dark:hover:border-indigo-500/20 bg-neutral-50/50 dark:bg-neutral-900/10 text-neutral-700 dark:text-neutral-300"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-6 w-6 rounded-lg font-bold text-xs flex items-center justify-center border shrink-0 ${
                                isSelected 
                                  ? "bg-indigo-600 border-indigo-600 text-white" 
                                  : "bg-white dark:bg-neutral-950 border-neutral-350 dark:border-neutral-800 text-neutral-500"
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className={`text-sm font-semibold ${isSelected ? "text-neutral-900 dark:text-white" : ""}`}>{option}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4">
                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <span>Write your response below</span>
                        <span>{activeAnswer.length}/1000 chars max</span>
                      </div>
                      <Textarea
                        value={activeAnswer}
                        onChange={(e) => handleTextChange(activeQuestion.id, e.target.value.slice(0, 1000))}
                        placeholder="Write a clear, detailed conceptual explanation here. Include key architectures, paradigms, or relevant frameworks where applicable."
                        className="min-h-[180px] bg-white dark:bg-[#0c0b14] border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 placeholder:text-neutral-400 text-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500/80 resize-y shadow-inner text-neutral-950 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Back / Next navigation buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-100 dark:border-neutral-800/60">
                  <Button
                    variant="outline"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="flex items-center gap-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-300 rounded-xl cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </Button>

                  {currentIdx === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitClick}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={16} />
                      Submit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}

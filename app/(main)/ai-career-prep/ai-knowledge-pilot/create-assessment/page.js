"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X, 
  Star, 
  Zap, 
  Trophy, 
  Lightbulb, 
  Sparkles, 
  Clock, 
  Eye, 
  ShieldCheck, 
  Lock, 
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
  Sun,
  Moon,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateAssessmentPage() {
    
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { setTheme, resolvedTheme } = useTheme();
  
  // Hydration state
  const [mounted, setMounted] = useState(false);

  // Core Form States
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [difficulty, setDifficulty] = useState("medium"); // easy | medium | hard
  const [type, setType] = useState("mcqs"); // mcqs | theory (theory represents MCQs + Theory)
  const [length, setLength] = useState("quick"); // quick | standard | comprehensive
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic assessment details configurations
  const lengthConfigs = {
    mcqs: {
      quick: { label: "Quick", mcqs: 10, theory: 0, time: 10, desc: "10 MCQs" },
      standard: { label: "Standard", mcqs: 30, theory: 0, time: 25, desc: "30 MCQs" },
      comprehensive: { label: "Comprehensive", mcqs: 50, theory: 0, time: 45, desc: "50 MCQs" }
    },
    theory: {
      quick: { label: "Quick", mcqs: 5, theory: 3, time: 15, desc: "5 MCQs + 3 Theory Questions" },
      standard: { label: "Standard", mcqs: 10, theory: 6, time: 30, desc: "10 MCQs + 6 Theory Questions" },
      comprehensive: { label: "Comprehensive", mcqs: 20, theory: 12, time: 50, desc: "20 MCQs + 12 Theory Questions" }
    }
  };

  // Helper to format file size
  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Simulated File Upload Logic
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file format. Please upload a PDF document.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds the 10 MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFile({
            name: selectedFile.name,
            size: formatBytes(selectedFile.size),
            raw: selectedFile
          });
          toast.success("PDF uploaded successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Drag & Drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a PDF document first.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Analyzing document & generating AI questions...", { id: "submit-toast" });

    try {
      const formData = new FormData();
      formData.append("file", file.raw);
      formData.append("difficulty", difficulty);
      formData.append("assessmentType", type === "mcqs" ? "mcq" : "mcq_theory");
      formData.append("assessmentLength", length);
      formData.append("instructions", instructions);

      const response = await fetch("/api/ai/knowledge-pilot", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create assessment");
      }

      toast.success("Assessment created successfully!", { id: "submit-toast" });
      router.push(`/ai-career-prep/ai-knowledge-pilot/assessment/${result.sessionId}`);
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.message || "Something went wrong.", { id: "submit-toast" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLength = lengthConfigs[type][length];

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white pb-20 pt-8 px-4 sm:px-6 md:px-8 selection:bg-indigo-500/30 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800/60">
        
        {/* Back navigation button */}
        <div className="flex items-center">
          <button 
            onClick={() => router.push("/ai-career-prep")} 
            className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group text-sm font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        {/* Center: Branding Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white animate-pulse"/>
            {/* <Sparkles size={18} className="animate-pulse" /> */}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:via-neutral-200 dark:to-indigo-300 bg-clip-text text-transparent">
             
              KnowledgePilot
            </span>
            <span className="px-2 py-0.5 text-[10px] font-black tracking-wider bg-indigo-550/10 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-md uppercase">
              AI
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle button */}
        <div className="flex items-center justify-end sm:w-32">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              title="Toggle Theme Mode"
            >
              {resolvedTheme === "dark" ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Form Configuration */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Title Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/50 to-slate-100/30 dark:from-neutral-900/90 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800/80 p-6 md:p-8 shadow-md dark:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10 space-y-2 max-w-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-inner">
                  <FileText size={22} />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Create New Assessment</h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                Upload your document and configure the assessment to generate AI-powered questions tailored to your content.
              </p>
            </div>

            {/* Glowing AI Graphics */}
            <div className="relative self-center md:self-auto shrink-0 mr-4">
              <div className="absolute -inset-2 bg-indigo-500/10 rounded-2xl blur-xl opacity-70 animate-pulse" />
              <div className="relative bg-white dark:bg-[#11101d] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg">
                <div className="relative">
                  <div className="absolute -top-1 -right-1 bg-indigo-600 text-[9px] font-black px-1 py-0.5 rounded text-white scale-90">AI</div>
                  <FileText size={40} className="text-indigo-500 dark:text-indigo-400/80" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="h-2 w-14 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="h-2 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>
                <div className="h-6 w-6 rounded-full bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 ml-2">
                  <CheckCircle2 size={14} />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: Upload Document */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-white">Upload Document</h2>
              </div>

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    group cursor-pointer border-2 border-dashed rounded-2xl p-8 md:p-10 
                    flex flex-col items-center justify-center gap-4 transition-all duration-300 text-center
                    ${isDragging 
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]" 
                      : "border-neutral-300 dark:border-neutral-800 hover:border-indigo-500/45 bg-neutral-50/50 dark:bg-neutral-900/20 hover:bg-neutral-100/50 hover:dark:bg-indigo-950/5"
                    }
                  `}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  
                  <div className="p-4 rounded-full bg-neutral-100 dark:bg-neutral-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all duration-300 shadow-sm border border-neutral-200 dark:border-neutral-800">
                    <UploadCloud size={32} className="group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-200 text-base">
                      Drag & drop your PDF here
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors font-medium">
                      or browse files
                    </p>
                  </div>
                  
                  <p className="text-xs text-neutral-500 max-w-xs">
                    Supports Resume & Study Notes PDF &bull; Max size: 10 MB
                  </p>

                  {isUploading && (
                    <div className="w-full max-w-xs mt-2 space-y-2">
                      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-950 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">Uploading file... {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0f0e1a]/85 border border-neutral-200 dark:border-[#201d36] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-md dark:shadow-xl hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-red-50/50 dark:bg-red-950/40 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-900/30 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm truncate pr-2">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {file.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <button 
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Difficulty Level */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-white">Difficulty Level</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "easy", title: "Easy", desc: "Beginner friendly", icon: <Zap size={18} className="text-emerald-600 dark:text-emerald-400" />, border: "hover:border-emerald-500/20", activeBg: "bg-emerald-50/45 dark:bg-emerald-950/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-emerald-100 dark:shadow-[0_0_15px_rgba(16,185,129,0.08)]", activeRadio: "border-emerald-500 bg-emerald-500" },
                  { id: "medium", title: "Medium", desc: "Balanced challenge", icon: <Star size={18} className="text-amber-500 dark:text-amber-400 fill-amber-500/10 dark:fill-amber-400/20" />, border: "hover:border-indigo-500/20", activeBg: "bg-indigo-50/45 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-indigo-100 dark:shadow-[0_0_20px_rgba(99,102,241,0.12)]", activeRadio: "border-indigo-500 bg-indigo-500" },
                  { id: "hard", title: "Hard", desc: "Advanced level", icon: <Trophy size={18} className="text-rose-600 dark:text-rose-400" />, border: "hover:border-rose-500/20", activeBg: "bg-rose-50/45 dark:bg-rose-950/10 border-rose-500 text-rose-700 dark:text-rose-400 shadow-rose-100 dark:shadow-[0_0_15px_rgba(244,63,94,0.08)]", activeRadio: "border-rose-500 bg-rose-500" }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setDifficulty(item.id)}
                    className={`
                      cursor-pointer border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300
                      ${difficulty === item.id 
                        ? `${item.activeBg} border` 
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 hover:border-neutral-400 dark:hover:border-indigo-500/20 text-neutral-800 dark:text-neutral-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${difficulty === item.id ? "bg-white/40 dark:bg-black/20 border-current" : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"}`}>
                        {item.icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`font-bold text-sm ${difficulty === item.id ? "text-neutral-950 dark:text-white" : "text-neutral-700 dark:text-neutral-200"}`}>{item.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                      </div>
                    </div>

                    <div className={`
                      h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                      ${difficulty === item.id 
                        ? item.activeRadio 
                        : "border-neutral-300 dark:border-neutral-700"
                      }
                    `}>
                      {difficulty === item.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3: Assessment Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </div>
                <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-white">Assessment Type</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "mcqs", title: "MCQs Only", desc: "Generate multiple choice questions only", icon: <FileSpreadsheet size={20} className="text-indigo-600 dark:text-indigo-400" /> },
                  { id: "theory", title: "MCQs + Theory", desc: "Generate MCQs and theoretical questions", icon: <FileText size={20} className="text-indigo-600 dark:text-indigo-400" /> }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setType(item.id);
                    }}
                    className={`
                      cursor-pointer border rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-300
                      ${type === item.id 
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 text-indigo-800 dark:text-indigo-400 shadow-indigo-100 dark:shadow-[0_0_20px_rgba(99,102,241,0.12)]" 
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 hover:border-neutral-400 dark:hover:border-indigo-500/20"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border ${type === item.id ? "bg-white/40 dark:bg-black/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400" : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400"}`}>
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <p className={`font-bold text-sm ${type === item.id ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-200"}`}>{item.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <div className={`
                      h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                      ${type === item.id 
                        ? "border-indigo-500 bg-indigo-500" 
                        : "border-neutral-300 dark:border-neutral-700"
                      }
                    `}>
                      {type === item.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 4: Assessment Length */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                    4
                  </div>
                  <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-white">Assessment Length</h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-9">
                  Choose how comprehensive you want this assessment to be.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "quick", title: "Quick", icon: <Zap size={18} className="text-indigo-600 dark:text-indigo-400" /> },
                  { id: "standard", title: "Standard", icon: <Star size={18} className="text-indigo-600 dark:text-indigo-400" /> },
                  { id: "comprehensive", title: "Comprehensive", icon: <Trophy size={18} className="text-indigo-600 dark:text-indigo-400" /> }
                ].map((item) => {
                  const details = lengthConfigs[type][item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLength(item.id)}
                      className={`
                        cursor-pointer border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 justify-between
                        ${length === item.id 
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 text-indigo-800 dark:text-indigo-400 shadow-indigo-100 dark:shadow-[0_0_20px_rgba(99,102,241,0.12)]" 
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 hover:border-neutral-450 dark:hover:border-indigo-500/20"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${length === item.id ? "bg-white/40 dark:bg-black/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400" : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400"}`}>
                            {item.icon}
                          </div>
                          <p className={`font-bold text-sm ${length === item.id ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-200"}`}>{item.title}</p>
                        </div>

                        <div className={`
                          h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                          ${length === item.id 
                            ? "border-indigo-500 bg-indigo-500" 
                            : "border-neutral-300 dark:border-neutral-700"
                          }
                        `}>
                          {length === item.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {details.mcqs} MCQs
                          </p>
                          {type === "theory" && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {details.theory} Theory Questions
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          <Clock size={12} />
                          <span>~{details.time} minutes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 5: Additional Instructions */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                    5
                  </div>
                  <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-white">Additional Instructions (Optional)</h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-9">
                  Provide specific instructions to help AI generate better tailored questions.
                </p>
              </div>

              <div className="relative">
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
                  placeholder="Example: Ask only from Chapter 4, Focus on Trees and Graphs, Skip Introduction section, Generate advanced level questions, etc."
                  className="min-h-[120px] bg-white dark:bg-[#0c0b14] border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-200 text-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500/80 resize-y shadow-inner"
                />
                <div className="absolute bottom-3 right-3 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                  {instructions.length}/500
                </div>
              </div>

              {/* AI Tip Warning/Alert */}
              <div className="flex items-start gap-3 p-4 bg-amber-550/5 border border-amber-500/10 dark:border-amber-500/10 rounded-xl text-amber-700 dark:text-amber-500 text-sm leading-relaxed shadow-sm">
                <Lightbulb size={18} className="shrink-0 mt-0.5 text-amber-500" />
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  <strong className="text-amber-600 dark:text-amber-500">AI Tip:</strong> Be specific about topics, chapters, or areas you want the assessment to focus on for more accurate and relevant questions.
                </p>
              </div>
            </div>

            {/* Submit Button & Subtitle */}
            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-600/25 border-0 flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995] transition-all cursor-pointer"
              >
                <Sparkles size={18} className={isSubmitting ? "animate-spin" : ""} />
                Create Assessment
              </Button>
              
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-550">
                <Lock size={12} className="text-neutral-400" />
                <span>Your data is encrypted and secure. We never share your documents.</span>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Sidebar (Widgets) */}
        <div className="space-y-6">
          
          {/* Assessment Preview */}
          <Card className="bg-white dark:bg-[#0c0b15]/90 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-md dark:shadow-xl">
            <CardContent className="p-6 space-y-6">
              
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800/60">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Assessment Preview</h3>
                  <p className="text-xs text-neutral-500">This is how your assessment will be structured</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Difficulty", value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), icon: <Star size={16} className="text-amber-500 dark:text-amber-400 fill-amber-500/10 dark:fill-amber-400/20" /> },
                  { label: "Type", value: type === "mcqs" ? "MCQs Only" : "MCQs + Theory", icon: <FileSpreadsheet size={16} className="text-indigo-600 dark:text-indigo-400" /> },
                  { 
                    label: "Length", 
                    value: type === "mcqs" ? `${activeLength.mcqs} MCQs` : `${activeLength.mcqs} MCQs & ${activeLength.theory} Theory`, 
                    icon: <FileText size={16} className="text-indigo-600 dark:text-indigo-400" /> 
                  },
                  { label: "Est. Time", value: `~${activeLength.time} minutes`, icon: <Clock size={16} className="text-emerald-600 dark:text-emerald-400" /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2.5 text-neutral-500 dark:text-neutral-400">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">{item.value}</span>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>

          {/* What you'll get */}
          <Card className="bg-white dark:bg-[#0c0b15]/90 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-md dark:shadow-xl">
            <CardContent className="p-6 space-y-5">
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">What you'll get</h3>
              </div>

              <ul className="space-y-3.5">
                {[
                  "AI-generated questions from your document",
                  "Instant evaluation and detailed feedback",
                  "Performance insights and weak areas",
                  "Downloadable results and explanations"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

            </CardContent>
          </Card>

          {/* Your Data is Safe (featuring a premium neon 3D lock SVG illustration) */}
          <Card className="bg-white dark:bg-[#0c0b15]/90 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-md dark:shadow-xl relative">
            <CardContent className="p-6 space-y-6 flex flex-col justify-between h-full">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Your Data is Safe</h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Your documents are encrypted and never shared with third parties. We prioritize your privacy and security.
                </p>
              </div>

              {/* Padlock Illustration */}
              <div className="w-full flex justify-center py-4 relative">
                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full scale-75" />
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none" className="relative z-10 filter drop-shadow-[0_4px_20px_rgba(99,102,241,0.15)]">
                  {/* Glowing background circles */}
                  <circle cx="75" cy="85" r="30" fill="url(#lockGlow)" opacity="0.3" />
                  
                  {/* Shackle */}
                  <path d="M45 75V52C45 35.4315 58.4315 22 75 22C91.5685 22 105 35.4315 105 52V75" 
                        stroke="url(#shackleGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round" />
                  
                  {/* Lock body */}
                  <rect x="35" y="70" width="80" height="60" rx="16" fill="url(#bodyGradient)" stroke="#2b274c" strokeWidth="2" />
                  
                  {/* Decorative glass highlight */}
                  <rect x="40" y="75" width="70" height="20" rx="8" fill="white" opacity="0.04" />
                  
                  {/* Glow effect around shield keyhole */}
                  <path d="M75 90V105" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                  <circle cx="75" cy="90" r="6" fill="#818cf8" />
                  
                  {/* Neon dots/sparks */}
                  <circle cx="25" cy="50" r="1.5" fill="#c084fc" opacity="0.8" />
                  <circle cx="125" cy="110" r="1.5" fill="#818cf8" opacity="0.8" />
                  <circle cx="118" cy="40" r="2.5" fill="#818cf8" opacity="0.5" />
                  
                  {/* Star sparkles */}
                  <path d="M20 100L22 104L26 105L22 106L20 110L18 106L14 105L18 104L20 100Z" fill="#c084fc" opacity="0.6" />
                  <path d="M125 70L126.5 73L129.5 73.5L126.5 74.2L125 77L123.5 74.2L120.5 73.5L123.5 73L125 70Z" fill="#818cf8" opacity="0.7" />

                  {/* Gradients */}
                  <defs>
                    <radialGradient id="lockGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="shackleGradient" x1="45" y1="22" x2="105" y2="75" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="bodyGradient" x1="35" y1="70" x2="115" y2="130" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#25215c" />
                      <stop offset="50%" stopColor="#120e30" />
                      <stop offset="100%" stopColor="#150f24" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}

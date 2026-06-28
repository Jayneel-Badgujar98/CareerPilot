"use client";

import React, { useState, useEffect } from "react"; // 1. Added useEffect
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle, XCircle, AlertTriangle,
  Zap, TrendingUp, Target, Award, Layout, Code, Download, User,
  Lightbulb, BookOpen, ShieldAlert, Sparkles, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { analyzeResumeAction } from "@/actions/analyse-resume";
import ResumeRefiner from "./_components/resume-refiner";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resumeText, setResumeText] = useState("");

  // --- FIX START: Hydration State ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // --- FIX END ---

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await analyzeResumeAction(formData);

      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data);
        if (data.originalText) setResumeText(data.originalText);
      }
    } catch (err) {
      setResult({ error: "Failed to connect to the server." });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    alert("Downloading analysis report...");
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const metricKey = Object.keys(result.performanceMetrics).find(
        key => key.replace(/([A-Z])/g, ' $1').trim() === label
      );
      const metricInfo = result.performanceMetrics[metricKey];

      return (
        <div className="bg-black/95 border border-neutral-700 p-3 rounded-lg shadow-xl z-50">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-green-400 text-sm">
            Score: <span className="text-lg font-bold">{payload[0].value}</span>/100
          </p>
          <p className="text-neutral-400 text-xs mt-1 max-w-[180px] leading-snug">
            {metricInfo?.reason}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = result?.performanceMetrics
    ? Object.entries(result.performanceMetrics).map(([key, val]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      score: val.score,
    }))
    : [];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30 overflow-x-hidden">


      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-6 md:pb-8">

        <header className="border-b border-neutral-800 pb-6 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 tracking-tight">
              Resume Analyser
            </h1>
            <p className="text-neutral-400 mt-3 text-lg md:text-xl max-w-2xl leading-relaxed">
              Advanced biometric scan for your career documents. Optimize for ATS algorithms and Human Recruiters.
            </p>
          </div>
          {/* <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            {result && !result.error && (
              <button
                onClick={handleDownloadReport}
                className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white px-4 py-2.5 rounded-lg transition-all text-sm font-medium w-full md:w-auto active:scale-95"
              >
                <Download size={16} /> Export Report
              </button>
            )}
          </div> */}
        </header>
      </div>


      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20 space-y-8 md:space-y-10">


        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl p-6 md:p-10 text-center transition-all hover:border-neutral-600 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <input type="file" id="resume-upload" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
          <label htmlFor="resume-upload" className="flex flex-col items-center cursor-pointer relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 border border-neutral-800 group-hover:border-green-500/50">
              <Upload className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">{file ? file.name : "Upload Resume / CV"}</h3>
            <p className="text-neutral-400 mt-2 md:mt-3 text-sm md:text-lg">Supports PDF, DOCX (Max 10MB)</p>
          </label>
          {file && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading} className="mt-6 md:mt-8 px-8 md:px-10 py-3 md:py-4 bg-white text-black font-bold text-base md:text-lg rounded-xl hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full md:w-auto">
              {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing...</> : <><Zap size={20} fill="currentColor" /> Run Analysis</>}
            </motion.button>
          )}
        </div>


        {result?.error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-950/30 border border-red-800/50 text-red-200 p-6 rounded-2xl flex items-center gap-4">
            <XCircle size={28} className="shrink-0" />
            <p className="text-base md:text-lg">{result.error}</p>
          </motion.div>
        )}


        <AnimatePresence>
          {result && !result.error && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 md:space-y-8">


              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div>
                    <h3 className="text-neutral-400 font-medium tracking-widest text-xs md:text-sm mb-2">RESUME SCORE</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter transition-all duration-300">{result.overallScore.split('/')[0]}</span>
                      <span className="text-xl md:text-2xl text-neutral-600">/100</span>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                      <span className="text-neutral-400 text-sm md:text-base">Level</span>
                      <span className="text-green-400 font-semibold text-sm md:text-base text-right">{result.summary.seniorityEstimate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                      <span className="text-neutral-400 text-sm md:text-base">Exp. Detected</span>
                      <span className="text-white font-semibold text-sm md:text-base">{result.summary.yearsOfExperience}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-8 bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg"><Layout className="text-blue-400" size={24} /></div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Executive Summary</h3>
                  </div>
                  <p className="text-base md:text-lg text-neutral-300 leading-relaxed mb-6">{result.summary.overallAssessment}</p>
                  <div className="bg-neutral-900/50 rounded-xl p-5 border border-neutral-800 relative mt-auto">
                    <div className="absolute -top-3 left-4 bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded border border-neutral-700 flex items-center gap-1"><User size={12} /> INTERVIEWER MENTAL MODEL</div>
                    <p className="italic text-neutral-400 text-sm leading-relaxed mt-2">"{result.interviewerPerspective.thought}"</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 pt-3 border-t border-neutral-800/50">
                      <span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Probability:</span>
                      <span className="text-sm text-green-400 font-medium">{result.interviewerPerspective.hiringProbability}</span>
                    </div>
                  </div>
                </motion.div>
              </div>


              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2"><TrendingUp className="text-green-400" size={20} /> Performance Metrics</h3>
                  </div>
                  <div className="h-[250px] md:h-[300px] w-full">
                    {/* Only render chart when mounted on client */}
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                          <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#22c55e" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24} fill="url(#scoreGradient)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        Loading Chart...
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-6"><Target className="text-blue-400" size={20} /> Top Role Recommendations</h3>
                  <div className="flex-1 space-y-6">
                    {result.jobFit.matches.map((job, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-base md:text-lg text-white group-hover:text-blue-400 transition-colors truncate mr-2">{job.role}</span>
                          <span className="font-mono text-blue-400 whitespace-nowrap">{job.match}% Match</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${job.match}%` }} transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }} className={`h-full rounded-full ${job.match > 85 ? 'bg-green-500' : job.match > 70 ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-sm text-neutral-400 leading-relaxed">
                    <span className="text-blue-400 font-bold mr-2">AI Insight:</span> {result.jobFit.reasoning}
                  </div>
                </div>
              </motion.div>


              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 hover:border-green-900/50 transition-colors h-full">
                  <h3 className="text-green-400 font-bold text-lg flex items-center gap-2 mb-6"><CheckCircle size={20} /> Core Strengths</h3>
                  {result.strengths?.length > 0 ? (
                    <div className="space-y-5">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="border-l-2 border-green-500/30 pl-4">
                          <h4 className="font-bold text-white mb-1 text-sm md:text-base">{s.title}</h4>
                          <p className="text-xs md:text-sm text-neutral-400 leading-snug">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center py-8 opacity-50"><BookOpen size={24} className="mx-auto mb-2 text-neutral-500" /><p className="text-neutral-400 text-sm">No specific strengths found.</p></div>}
                </div>

                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 hover:border-red-900/50 transition-colors h-full">
                  <h3 className="text-red-400 font-bold text-lg flex items-center gap-2 mb-6"><ShieldAlert size={20} /> Critical Weaknesses</h3>
                  {result.weaknesses?.length > 0 ? (
                    <div className="space-y-5">
                      {result.weaknesses.map((w, i) => (
                        <div key={i} className="bg-red-950/10 p-4 rounded-xl border border-red-900/30">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-bold text-red-200 text-sm">{w.title}</h4>
                            <span className="text-[10px] bg-neutral-900 px-2 py-1 rounded text-red-400 uppercase tracking-wider shrink-0">{w.severity}</span>
                          </div>
                          <p className="text-xs text-neutral-400">{w.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center py-8"><Award size={24} className="mx-auto mb-2 text-green-500" /><p className="text-green-400 text-sm">Flawless.</p></div>}
                </div>

                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8 hover:border-amber-900/50 transition-colors md:col-span-2 lg:col-span-1 h-full">
                  <h3 className="text-amber-400 font-bold text-lg flex items-center gap-2 mb-6"><AlertTriangle size={20} /> Actionable Fixes</h3>
                  {result.improvements?.length > 0 ? (
                    <div className="space-y-5">
                      {result.improvements.map((imp, i) => (
                        <div key={i} className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/30">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-bold text-amber-200 text-sm">{imp.issue}</h4>
                            <span className="text-[10px] bg-neutral-900 px-2 py-1 rounded text-neutral-500 uppercase tracking-wider shrink-0">{imp.section}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mb-3">{imp.whyItMatters}</p>
                          <div className="text-sm text-white bg-black/40 p-3 rounded border-l-2 border-amber-500">
                            <span className="font-bold text-amber-500 block mb-1">Fix:</span> "{imp.exampleFix}"
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center py-8"><Sparkles size={24} className="mx-auto mb-2 text-blue-400" /><p className="text-blue-200 text-sm">Optimization Complete.</p></div>}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-6"><Code size={20} /> Recommended Projects</h3>
                  <div className="space-y-4">
                    {result.recommendedProjects.map((proj, i) => (
                      <div key={i} className="p-4 bg-neutral-900/40 rounded-xl border border-neutral-800"><h4 className="font-bold text-white">{proj.name}</h4><p className="text-sm text-neutral-400">{proj.goal}</p></div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 md:p-8">
                  <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2 mb-6"><Lightbulb size={20} /> Pro Tips</h3>
                  <ul className="space-y-4">
                    {result.proTips.map((tip, i) => (<li key={i} className="flex gap-4 p-2 text-sm text-neutral-300"><span className="text-yellow-500/50 font-serif italic">{i + 1}.</span>{tip}</li>))}
                  </ul>
                </div>
              </motion.div>

              <ResumeRefiner
                originalResumeText={resumeText || "Resume text unavailable. Please re-upload."}
                feedbackData={result}
                userFile={file}
              />

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


{/* <motion.div 
                variants={itemVariants} 
                className="relative overflow-hidden rounded-3xl border border-neutral-800 mb-12 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 z-0 animate-gradient-x bg-[length:200%_100%]"></div>
                
                <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#0a0a0a]/80 backdrop-blur-sm">
                  
                  {/* Left Side: Copy *
                  <div className="max-w-2xl text-center lg:text-left space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white flex flex-col lg:flex-row items-center gap-3 justify-center lg:justify-start">
                      <Sparkles className="text-purple-400 animate-pulse" fill="currentColor" size={32} />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Want to fix these gaps instantly?
                      </span>
                    </h2>
                    
                    <p className="text-neutral-300 text-lg leading-relaxed">
                       Don't just analyze—<span className="text-white font-bold">Auto-Fix</span>. 
                       Use CareerPilot's AI Builder to rewrite your bullet points, 
                       fill skill gaps, and optimize for the ATS in one click.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefineClick}
                        className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                      >
                         <Zap size={20} fill="currentColor" className="text-yellow-600" />
                         Refine My Resume Now
                      </motion.button>
                      <button className="px-8 py-4 rounded-xl font-bold border border-neutral-700 hover:bg-neutral-800 transition-colors text-white w-full sm:w-auto">
                         View Live Demo
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Dynamic AI Prediction Card *
                  <div className="hidden lg:block">
                     <motion.div 
                       initial={{ rotate: 3, y: 10 }}
                       whileHover={{ rotate: 0, y: 0, scale: 1.02 }}
                       transition={{ type: "spring", stiffness: 300 }}
                       className="w-80 bg-gradient-to-tr from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl p-6 relative"
                     >
                       <div className="absolute -top-4 -right-4 bg-green-500 text-black font-bold px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2 animate-bounce">
                          <TrendingUp size={16} /> Projected Growth
                       </div>

                       <div className="flex justify-center mb-6">
                          <div className="p-4 bg-neutral-800 rounded-full border border-neutral-700">
                             <Briefcase size={48} className="text-purple-400" />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
                             <span className="text-neutral-400 text-sm">Interview Rate</span>
                             <span className="text-green-400 font-bold text-lg">
                                {result.improvementPrediction?.interviewChance || "+20%"}
                             </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
                             <span className="text-neutral-400 text-sm">Salary Potential</span>
                             <span className="text-green-400 font-bold text-lg">
                                {result.improvementPrediction?.salaryBoost || "+$10k"}
                             </span>
                          </div>
                       </div>

                       <p className="text-xs text-neutral-500 mt-4 text-center italic">
                          "{result.improvementPrediction?.summary || "Based on market gaps found in your resume."}"
                       </p>
                     </motion.div>
                  </div>

                </div>
              </motion.div> */}
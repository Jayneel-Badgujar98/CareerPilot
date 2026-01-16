"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, ArrowRight, Star, Share2, Download } from "lucide-react";

export default function InterviewResultPage() {
  
  // Mock Data (In reality, fetch this using the sessionId from params)
  const results = {
    score: 87,
    feedback: "Excellent communication. Your technical answers were deep, but try to shorten your introduction.",
    strengths: ["Technical Depth", "Confidence", "Body Language"],
    weaknesses: ["Pacing", "Filler Words"],
    date: "Just now"
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50"
          >
             <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Interview Completed!</h1>
          <p className="text-neutral-400">Here is your AI-generated performance analysis.</p>
        </div>

        {/* --- SCORE CARD --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-neutral-900 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-[100px]" />
           
           <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              
              {/* Score Circle */}
              <div className="relative w-40 h-40 flex-shrink-0">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#333" strokeWidth="10" fill="transparent" />
                    <circle 
                      cx="80" cy="80" r="70" stroke="#6366f1" strokeWidth="10" fill="transparent" 
                      strokeDasharray="440" strokeDashoffset={440 - (440 * results.score) / 100} 
                      className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{results.score}</span>
                    <span className="text-xs text-neutral-400 uppercase tracking-widest">Score</span>
                 </div>
              </div>

              {/* Feedback Text */}
              <div className="space-y-6 flex-grow">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Feedback Summary</h3>
                    <p className="text-neutral-300 leading-relaxed">{results.feedback}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                       <h4 className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4" /> Strengths
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {results.strengths.map(s => (
                             <span key={s} className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-200">{s}</span>
                          ))}
                       </div>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                       <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Improvements
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {results.weaknesses.map(w => (
                             <span key={w} className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-200">{w}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </motion.div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
           <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 font-medium flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Download Transcript
           </button>
           
           <Link href="/interview-prep/ai-mock-interview">
             <button className="w-full md:w-auto px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-white/10">
                Back to Dashboard <ArrowRight className="w-4 h-4" />
             </button>
           </Link>
        </div>
      </div>
    </div>
  );
}


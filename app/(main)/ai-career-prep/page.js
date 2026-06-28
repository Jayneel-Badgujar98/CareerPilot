// app/ai-career-prep/page.js
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, FileText, Code2, Sparkles, ArrowRight, Lock, Clock, Brain } from "lucide-react";

export default function InterviewHub() {
  return (
    // Changed min-h-screen to min-h-dvh for better mobile browser support
    <main className="min-h-dvh bg-black selection:bg-indigo-500/30">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">


        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 tracking-tight pb-2">
              AI Powered Career Preparation
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Level up your skills with our industry-leading AI tools.

          </motion.p>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {/* <FeatureCard
            href="/ai-career-prep/ai-mock-interview"
            title="AI Mock Interview"
            description="Experience a realistic voice interview with our AI. Get instant feedback on your tone, pace, and answer quality."
            icon={<Mic className="w-6 h-6 text-white" />}
            gradient="from-violet-600 to-indigo-600"
            delay={0.3}
            isNew={true}
          /> */}

          {/* <FeatureCard
            href="/ai-career-prep/mock-interview-quiz"
            title="Mock Interview Quiz"
            description="Access 5000+ curated questions from top tech companies. Test your knowledge across multiple domains."
            icon={<FileText className="w-6 h-6 text-white" />}
            gradient="from-blue-600 to-cyan-600"
            delay={0.4}
          /> */}

          <FeatureCard
            href="/ai-career-prep/ai-knowledge-pilot"
            title="AI Knowledge Pilot"
            description="Upload your resume, exam notes, or any document to test your knowledge with AI-generated targeted assessments."
            icon={<Brain className="w-6 h-6 text-white" />}
            gradient="from-violet-600 to-indigo-600"
            delay={0.3}
          />

          <ComingSoonCard delay={0.5} />
        </div>
      </div>
    </main>
  );
}

// ==========================================
// FEATURE CARD (Responsive & Touch-Optimized)
// ==========================================
function FeatureCard({ title, description, icon, href, gradient, delay, isNew }) {
  return (
    <Link href={href} className="block group h-full relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="relative h-full"
      >

        <div
          className={`
            hidden md:block absolute -inset-0.5 bg-gradient-to-b ${gradient} 
            rounded-[24px] blur-2xl opacity-0 group-hover:opacity-40 
            transition-opacity duration-500
          `}
        />


        <div className="relative h-full rounded-[24px] p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent overflow-hidden group-hover:from-indigo-400/50 transition-colors duration-500">


          <div className="relative h-full flex flex-col rounded-[23px] overflow-hidden bg-neutral-950">


            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-neutral-950 to-black"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className={`
              absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${gradient} 
              opacity-20 blur-[80px] rounded-full group-hover:opacity-50 group-hover:scale-125 transition-all duration-700
            `}></div>
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>



            <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full">


              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div className={`
                  p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 
                  backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] 
                  group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40
                  transition-all duration-300 ease-out
                `}>
                  {icon}
                </div>


                {isNew && (
                  <div className="absolute top-5 right-5 z-20">
                    <div className="relative group/badge">
                      <div className="absolute -inset-1 bg-yellow-500/40 blur-[8px] rounded-full animate-pulse"></div>
                      <div className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full 
                        bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 
                        border border-yellow-200/60 shadow-[0_2px_15px_-3px_rgba(251,191,36,0.6)]
                        overflow-hidden
                      ">
                        <div className="absolute top-0 bottom-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-950 fill-yellow-950 animate-[spin_3s_linear_infinite]" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-950 drop-shadow-sm whitespace-nowrap">
                          New Arrival
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>


              <div className="flex-grow space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-sky-200 group-hover:via-white group-hover:to-white transition-all duration-300">
                  {title}
                </h3>

                <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed group-hover:text-slate-300 transition-colors">
                  {description}
                </p>
              </div>


              <div className="mt-auto relative z-20">
                <div className="
                  relative overflow-hidden rounded-xl bg-neutral-900 border border-white/10 
                  shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                  group-hover:border-white/20 group-hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]
                  transition-all duration-300
                ">
                  <div className="
                    absolute inset-0 w-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 
                    transition-all duration-500 ease-out group-hover:w-full
                  "/>
                  <div className="relative flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
                    <span className="font-extrabold tracking-widest text-xs sm:text-sm text-white group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] transition-all">
                      START PRACTICE
                    </span>
                    <div className="
                      flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full 
                      bg-white/10 text-white 
                      group-hover:bg-white group-hover:text-black group-hover:scale-110
                      transition-all duration-300
                    ">
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-500 group-hover:-rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ==========================================
// COMING SOON CARD (Responsive)
// ==========================================
function ComingSoonCard({ delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative h-full rounded-3xl p-[1px] overflow-hidden group"
    >

      <div className="relative h-full bg-gray-950/40 backdrop-blur-sm rounded-[23px] p-6 sm:p-8 border border-white/5 border-dashed flex flex-col justify-between">

        <div className="relative">

          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 rounded-2xl bg-gray-800/50 ring-1 ring-white/10">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </div>


            <div className="absolute top-0 right-0">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neutral-800 border border-neutral-700 shadow-lg">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-300 whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-500 mb-3">Coding Challenges</h3>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            Practice LeetCode-style problems tailored to your target role.
            Supported languages: Python, JavaScript, C++.
          </p>
        </div>

        <div className="mt-6 sm:mt-8">
          <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gray-800/50 text-gray-500 text-[10px] sm:text-xs font-bold border border-gray-700/50 uppercase tracking-widest">
            Development in Progress
          </span>
        </div>
      </div>
    </motion.div>
  );
}